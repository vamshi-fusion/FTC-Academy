import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, AlertCircle, Terminal, Target } from 'lucide-react';
import { SimState } from '../types';
import { parseCode, calculatePhysics, INITIAL_ARTIFACTS, TILE_SIZE, FIELD_SIZE, OBSTACLES, GOALS } from '../services/simulator';

interface Props {
  code: string;
  initialState?: Partial<SimState>;
  onFinished?: (state: SimState) => void;
}

const Simulator: React.FC<Props> = ({ code, initialState, onFinished }) => {
  const getInitialState = () => ({
    x: FIELD_SIZE / 2,
    y: FIELD_SIZE - 40,
    rotation: 0,
    leftPower: 0,
    rightPower: 0,
    intakePower: 0,
    spindexerPosition: 0,
    isShooting: false,
    heldArtifact: null,
    artifacts: INITIAL_ARTIFACTS.map(a => ({...a})),
    logs: [],
    variables: {},
    error: null,
    isRunning: false,
    ...initialState
  });

  const [simState, setSimState] = useState<SimState>(getInitialState());
  const stateRef = useRef<SimState>(simState);
  const requestRef = useRef<number | null>(null);
  const actionsRef = useRef<any[]>([]);
  const actionIndexRef = useRef(0);
  const sleepEndTimeRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    stateRef.current = simState;
  }, [simState]);

  const reset = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const baseState = getInitialState();
    setSimState(baseState);
    stateRef.current = baseState;
    actionsRef.current = [];
    actionIndexRef.current = 0;
    sleepEndTimeRef.current = 0;
    lastTimeRef.current = 0;
  };

  const run = () => {
    reset();
    const actions = parseCode(code);
    const errors = actions.filter(a => a.type === 'ERROR');
    
    if (errors.length > 0) {
        setSimState(s => ({ ...s, error: (errors[0] as any).msg, isRunning: false }));
        return;
    }

    actionsRef.current = actions;
    setSimState(s => ({ ...s, isRunning: true }));
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = Math.min(time - lastTimeRef.current, 32); 
    lastTimeRef.current = time;

    let currentState = { ...stateRef.current };
    let needsUpdate = false;

    if (time < sleepEndTimeRef.current) {
        const phys = calculatePhysics(currentState, deltaTime);
        Object.assign(currentState, phys);
        needsUpdate = true;
    } else {
        if (actionIndexRef.current < actionsRef.current.length) {
            const action = actionsRef.current[actionIndexRef.current];
            actionIndexRef.current++;

            switch (action.type) {
                case 'LOG':
                    currentState.logs = [...currentState.logs, `${action.key}: ${action.value}`];
                    break;
                case 'MOVE':
                    currentState.leftPower = action.power;
                    currentState.rightPower = action.power;
                    break;
                case 'INTAKE':
                    currentState.intakePower = action.power;
                    break;
                case 'SPINDEXER':
                    currentState.spindexerPosition = action.pos;
                    break;
                case 'SHOOT':
                    currentState.isShooting = true;
                    currentState.heldArtifact = null;
                    setTimeout(() => {
                      setSimState(s => ({...s, isShooting: false}));
                    }, 500);
                    break;
                case 'SLEEP':
                    sleepEndTimeRef.current = time + action.duration;
                    break;
                case 'VAR':
                    currentState.variables = { ...currentState.variables, [action.name]: action.val };
                    break;
            }
            needsUpdate = true;
        } else {
            if (currentState.isRunning) {
                currentState.isRunning = false;
                currentState.leftPower = 0;
                currentState.rightPower = 0;
                currentState.intakePower = 0;
                needsUpdate = true;
                if (onFinished) onFinished(currentState);
            }
        }

        if (currentState.isRunning) {
            const phys = calculatePhysics(currentState, deltaTime);
            Object.assign(currentState, phys);
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        setSimState(currentState);
        stateRef.current = currentState;
    }

    if (currentState.isRunning || time < sleepEndTimeRef.current) {
        requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center text-slate-400">
            <Terminal size={14} className="mr-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ftc-orange">FTC DECODE FIELD SIM</span>
        </div>
        <div className="flex space-x-2">
            <button onClick={reset} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 transition-colors">
                <RotateCcw size={16} />
            </button>
            <button 
                onClick={run}
                disabled={simState.isRunning}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    simState.isRunning 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-ftc-orange hover:bg-orange-500 text-white shadow-lg active:scale-95'
                }`}
            >
                <Play size={14} fill="currentColor" />
                <span>START AUTON</span>
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="relative flex-1 bg-[#1e293b] flex items-center justify-center p-4">
           {/* Realistic Field Container */}
           <div className="relative w-[340px] h-[340px] bg-[#1a2233] rounded shadow-2xl overflow-hidden border-4 border-slate-700">
                {/* Floor Tiles */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none">
                    {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="border border-white/5 bg-slate-900/40"></div>
                    ))}
                </div>

                {/* Alliance Tape lines */}
                <div className="absolute top-0 bottom-0 left-[56.6px] w-[2px] bg-ftc-blue/30"></div>
                <div className="absolute top-0 bottom-0 right-[56.6px] w-[2px] bg-ftc-orange/30"></div>
                <div className="absolute left-0 right-0 top-[113px] h-[2px] bg-white/10"></div>
                <div className="absolute left-0 right-0 bottom-[113px] h-[2px] bg-white/10"></div>

                {/* Goals */}
                {GOALS.map((goal, idx) => (
                    <div 
                        key={idx}
                        className={`absolute w-12 h-12 border-4 rounded flex items-center justify-center z-10 ${
                            goal.color === 'purple' ? 'border-purple-500 bg-purple-500/10' : 'border-green-500 bg-green-500/10'
                        }`}
                        style={{ left: goal.x - 24, top: goal.y - 24 }}
                    >
                        <Target size={20} className={goal.color === 'purple' ? 'text-purple-400' : 'text-green-400'} />
                    </div>
                ))}

                {/* Obstacles (Ramps & Obelisk) */}
                {OBSTACLES.map((obs, idx) => (
                    <div 
                        key={idx}
                        className={`absolute border-2 shadow-lg z-10 ${
                            obs.type === 'obelisk' ? 'bg-slate-800 border-slate-600 rotate-45' : 'bg-slate-700 border-slate-500'
                        }`}
                        style={{ left: obs.x, top: obs.y, width: obs.w, height: obs.h }}
                    >
                        {obs.type === 'ramp' && (
                            <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.05)_5px,rgba(255,255,255,0.05)_10px)]"></div>
                        )}
                    </div>
                ))}

                {/* Artifacts */}
                {simState.artifacts.map(art => !art.collected && (
                    <div 
                        key={art.id}
                        className={`absolute w-5 h-5 rounded-full shadow-lg border border-white/20 transition-all z-20 ${
                            art.color === 'purple' ? 'bg-purple-500' : 'bg-green-500'
                        }`}
                        style={{ left: art.x - 10, top: art.y - 10 }}
                    >
                        <div className="absolute inset-1 rounded-full bg-white/10"></div>
                    </div>
                ))}

                {/* Robot */}
                <div 
                    className="absolute w-12 h-12 bg-slate-800 rounded shadow-2xl border-2 border-slate-500 flex items-center justify-center z-30"
                    style={{
                        transform: `translate(${simState.x - 24}px, ${simState.y - 24}px) rotate(${simState.rotation}deg)`,
                        left: 0, top: 0
                    }}
                >
                    <div className="absolute -top-1 w-6 h-2 bg-slate-400 rounded-full"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-slate-600 bg-slate-900/50 flex items-center justify-center">
                        {simState.heldArtifact && (
                            <div className={`w-4 h-4 rounded-full ${simState.heldArtifact === 'purple' ? 'bg-purple-400' : 'bg-green-400'}`}></div>
                        )}
                        {!simState.heldArtifact && <div className="text-[6px] text-slate-600 font-bold">SDK 3.2</div>}
                    </div>
                    {/* Firing animation */}
                    {simState.isShooting && (
                      <div className="absolute -top-10 w-8 h-8 bg-orange-500 rounded-full animate-ping opacity-75 blur-md"></div>
                    )}
                </div>
           </div>
        </div>

        <div className="h-40 lg:h-auto lg:w-64 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col font-mono text-[10px]">
            <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 text-slate-500 font-black uppercase tracking-widest flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                Live Telemetry
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-1 custom-scrollbar">
                {simState.logs.map((log, i) => (
                    <div key={i} className="text-emerald-400 flex">
                        <span className="text-slate-600 mr-2">&gt;&gt;</span>
                        <span className="break-all">{log}</span>
                    </div>
                ))}
                {simState.error && <div className="text-red-400 bg-red-950/20 p-2 border border-red-900/30 rounded">{simState.error}</div>}
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-2 text-slate-500 font-bold uppercase tracking-tighter">
                <div>Pos X: {simState.x.toFixed(0)}</div>
                <div>Pos Y: {simState.y.toFixed(0)}</div>
                <div>Heading: {simState.rotation.toFixed(0)}°</div>
                <div>Held: <span className={simState.heldArtifact ? 'text-emerald-500' : ''}>{simState.heldArtifact || 'None'}</span></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;