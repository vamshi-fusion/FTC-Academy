import { SimState, Artifact } from '../types';

type SimAction = 
  | { type: 'LOG'; key: string; value: string }
  | { type: 'MOVE'; power: number }
  | { type: 'INTAKE'; power: number }
  | { type: 'SPINDEXER'; pos: number }
  | { type: 'SHOOT' }
  | { type: 'SLEEP'; duration: number }
  | { type: 'VAR'; name: string; val: any }
  | { type: 'ERROR'; msg: string };

// Realistic DECODE Field Constants
export const FIELD_SIZE = 340;
export const TILE_SIZE = FIELD_SIZE / 6;

export const INITIAL_ARTIFACTS: Artifact[] = [
    // Purple Alliance Side (Spike Marks)
    { id: 1, x: TILE_SIZE * 1.5, y: TILE_SIZE * 1.5, color: 'purple', collected: false },
    { id: 2, x: TILE_SIZE * 1.5, y: TILE_SIZE * 4.5, color: 'purple', collected: false },
    // Green Alliance Side (Spike Marks)
    { id: 3, x: TILE_SIZE * 4.5, y: TILE_SIZE * 1.5, color: 'green', collected: false },
    { id: 4, x: TILE_SIZE * 4.5, y: TILE_SIZE * 4.5, color: 'green', collected: false },
    // Center Neutral
    { id: 5, x: FIELD_SIZE / 2, y: TILE_SIZE * 0.8, color: 'purple', collected: false },
    { id: 6, x: FIELD_SIZE / 2, y: FIELD_SIZE - TILE_SIZE * 0.8, color: 'green', collected: false },
];

export const GOALS = [
    { x: 25, y: 25, color: 'purple', label: 'GOAL A' },
    { x: FIELD_SIZE - 25, y: 25, color: 'green', label: 'GOAL B' },
];

export const OBSTACLES = [
    { x: FIELD_SIZE / 2 - 30, y: FIELD_SIZE / 2 - 30, w: 60, h: 60, type: 'obelisk' },
    { x: 0, y: FIELD_SIZE / 2 - 5, w: 80, h: 10, type: 'ramp' },
    { x: FIELD_SIZE - 80, y: FIELD_SIZE / 2 - 5, w: 80, h: 10, type: 'ramp' },
];

export const parseCode = (code: string): SimAction[] => {
  const actions: SimAction[] = [];
  const lines = code.split('\n');
  const variables: Record<string, any> = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue;
    if (line.startsWith('package') || line.startsWith('import') || line.startsWith('public class') || line.startsWith('@Override') || line.startsWith('public void') || line === '}') continue;
    if (line.endsWith(';')) line = line.slice(0, -1);

    const varMatch = line.match(/^(int|double|String|boolean)\s+(\w+)\s*=\s*(.+)$/);
    if (varMatch) {
        const [_, type, name, rawValue] = varMatch;
        let value: any = rawValue.trim();
        if (variables[value] !== undefined) value = variables[value];
        if (type === 'int' || type === 'double') {
            value = parseFloat(value);
        } else if (type === 'String') {
            value = value.replace(/^"|"$/g, '');
        } else if (type === 'boolean') {
            value = value === 'true';
        }
        variables[name] = value;
        actions.push({ type: 'VAR', name, val: value });
        continue;
    }

    if (line.includes('telemetry.addData')) {
        const content = line.match(/telemetry\.addData\s*\(([^,]+),\s*(.+)\)/);
        if (content) {
            const [_, keyRaw, valRaw] = content;
            let key = keyRaw.trim().replace(/^"|"$/g, '');
            let val: any = valRaw.trim();
            if (val === "colorSensor.isPurple()") val = (variables['current_artifact_color'] === 'purple');
            else if (val === "colorSensor.isGreen()") val = (variables['current_artifact_color'] === 'green');
            else if (variables[val] !== undefined) val = variables[val];
            else if (typeof val === 'string' && val.startsWith('"')) val = val.replace(/^"|"$/g, '');
            actions.push({ type: 'LOG', key, value: String(val) });
        }
        continue;
    }

    if (line.includes('motor.setPower')) {
        const content = line.match(/motor\.setPower\s*\((.+)\)/);
        if (content) {
            let valStr = content[1].trim();
            let val = variables[valStr] !== undefined ? variables[valStr] : parseFloat(valStr);
            actions.push({ type: 'MOVE', power: Math.max(-1, Math.min(1, val)) });
        }
        continue;
    }

    if (line.includes('spindexer.setPosition')) {
        const content = line.match(/spindexer\.setPosition\s*\((.+)\)/);
        if (content) {
            let valStr = content[1].trim();
            let val = variables[valStr] !== undefined ? variables[valStr] : parseFloat(valStr);
            actions.push({ type: 'SPINDEXER', pos: Math.max(0, Math.min(1, val)) });
        }
        continue;
    }

    if (line.includes('intakeMotor.setPower')) {
        const content = line.match(/intakeMotor\.setPower\s*\((.+)\)/);
        if (content) {
            let valStr = content[1].trim();
            let val = variables[valStr] !== undefined ? variables[valStr] : parseFloat(valStr);
            actions.push({ type: 'INTAKE', power: Math.max(-1, Math.min(1, val)) });
        }
        continue;
    }

    if (line.includes('shoot()')) {
        actions.push({ type: 'SHOOT' });
        continue;
    }

    if (line.includes('sleep')) {
        const content = line.match(/sleep\s*\((.+)\)/);
        if (content) {
             let valStr = content[1].trim();
             let val = variables[valStr] !== undefined ? variables[valStr] : parseInt(valStr);
             actions.push({ type: 'SLEEP', duration: isNaN(val) ? 0 : val });
        }
        continue;
    }
  }
  return actions;
};

export const calculatePhysics = (current: SimState, dtMs: number): Partial<SimState> => {
    const SPEED_SCALE = 0.08; 
    const ROTATION_SCALE = 0.12; 

    let newX = current.x;
    let newY = current.y;
    let newRot = current.rotation;
    let newHeld = current.heldArtifact;
    let newArtifacts = [...current.artifacts];

    const power = current.leftPower; 
    const rad = (current.rotation * Math.PI) / 180;

    let stepX = 0;
    let stepY = 0;

    if (power > 0) {
        stepX = Math.sin(rad) * power * SPEED_SCALE * dtMs;
        stepY = -Math.cos(rad) * power * SPEED_SCALE * dtMs;
    } else if (power < 0) {
        newRot += Math.abs(power) * ROTATION_SCALE * dtMs;
    }

    // Collision Check with Obstacles
    const testX = newX + stepX;
    const testY = newY + stepY;
    let collided = false;
    for (const obs of OBSTACLES) {
        if (testX > obs.x - 15 && testX < obs.x + obs.w + 15 && testY > obs.y - 15 && testY < obs.y + obs.h + 15) {
            collided = true;
            break;
        }
    }

    if (!collided) {
        newX = testX;
        newY = testY;
    }

    // Intake Logic
    if (current.intakePower > 0 && !newHeld) {
        const frontX = newX + Math.sin(rad) * 20;
        const frontY = newY - Math.cos(rad) * 20;

        for (let i = 0; i < newArtifacts.length; i++) {
            const art = newArtifacts[i];
            if (!art.collected) {
                const dist = Math.sqrt((art.x - frontX) ** 2 + (art.y - frontY) ** 2);
                if (dist < 22) {
                    newArtifacts[i] = { ...art, collected: true };
                    newHeld = art.color;
                    break;
                }
            }
        }
    } else if (current.intakePower < -0.1 && newHeld) {
        newHeld = null;
    }

    // Boundaries
    newX = Math.max(20, Math.min(FIELD_SIZE - 20, newX));
    newY = Math.max(20, Math.min(FIELD_SIZE - 20, newY));

    return { x: newX, y: newY, rotation: newRot, heldArtifact: newHeld, artifacts: newArtifacts };
};