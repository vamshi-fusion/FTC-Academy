
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown supported
  difficulty: Difficulty;
  category: string;
  order: number;
  durationMinutes: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  lessonId: string;
  starterCode: string;
  solutionCode: string;
  hints: string[];
  difficulty: Difficulty;
  points: number;
  validate?: (state: SimState) => { success: boolean; message: string };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or Lucide name
  requirement: (progress: UserProgressStore) => boolean;
}

export interface UserProgressStore {
  lessons: Record<string, boolean>;
  challenges: Record<string, boolean>;
  points: number;
  unlockedAchievements: string[];
}

export interface Artifact {
  id: number;
  x: number;
  y: number;
  color: 'purple' | 'green';
  collected: boolean;
}

export interface SimState {
  x: number; // 0-340
  y: number; // 0-340
  rotation: number; // Degrees
  leftPower: number; // -1 to 1
  rightPower: number; // -1 to 1
  intakePower: number; // -1 to 1
  spindexerPosition: number; // 0 to 1
  isShooting: boolean;
  heldArtifact: 'purple' | 'green' | null;
  artifacts: Artifact[];
  logs: string[];
  variables: Record<string, any>;
  error: string | null;
  isRunning: boolean;
}

export interface SimContext {
    telemetry: {
        addData: (key: string, value: any) => void;
        update: () => void;
    };
    motor: {
        setPower: (power: number) => void;
    };
    intakeMotor: {
        setPower: (power: number) => void;
    };
    spindexer: {
        setPosition: (pos: number) => void;
    };
    colorSensor: {
        isPurple: () => boolean;
        isGreen: () => boolean;
    };
    shoot: () => void;
    sleep: (ms: number) => Promise<void>;
}
