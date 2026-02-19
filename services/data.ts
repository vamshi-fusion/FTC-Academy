import { Lesson, Challenge, Achievement, UserProgressStore } from '../types';
import { getCurrentUser } from './auth';

export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Welcome to DECODE',
    description: 'Introduction to the current FTC season arena, artifacts, and motifs.',
    difficulty: 'Beginner',
    category: 'Intro',
    order: 1,
    durationMinutes: 10,
    content: `
# Welcome to DECODE!

The **DECODE** season is all about managing high-speed intake, sorting, and precision delivery.

## The Field Elements
- **Artifacts**: Purple and Green 5-inch polypropylene spheres.
- **The Obelisk**: A central triangular tower displaying **Motifs** (patterns).
- **The Spindexer**: A revolving mechanical part used to sort artifacts before scoring.

## Your Mission
You are the lead programmer. You'll build the software that transforms a pile of aluminum and motors into an intelligent, high-scoring machine!
    `
  },
  {
    id: 'l2',
    title: 'Java Basics for Robotics',
    description: 'Variables, data types, and syntax used in FTC programming.',
    difficulty: 'Beginner',
    category: 'Programming',
    order: 2,
    durationMinutes: 20,
    content: `
# Java Basics

FTC robots are programmed in **Java**. Here's how we store robot data.

## Variables
*   \`int encoderTicks = 500;\` (Whole numbers)
*   \`double motorPower = 0.5;\` (Decimal numbers)
*   \`boolean isIntakeRunning = false;\` (True/False)

## Semicolons
Every instruction in Java ends with a \`;\`. Think of it like a period at the end of a sentence.
    `
  },
  {
    id: 'l3',
    title: 'OpModes: Auto vs. TeleOp',
    description: 'The structure of an FTC program and the Launch Line.',
    difficulty: 'Beginner',
    category: 'Structure',
    order: 3,
    durationMinutes: 15,
    content: `
# OpMode Structure

An **OpMode** (Operational Mode) is a single program. 

## The LinearOpMode
\`\`\`java
public class MyOpMode extends LinearOpMode {
    @Override
    public void runOpMode() {
        // Initialization (Wait for Play)
        waitForStart();
        
        // Robot does work here!
    }
}
\`\`\`

Robots start behind the **Launch Line**. You have 30 seconds of **Autonomous** (pure code) and 120 seconds of **TeleOp** (driver control).
    `
  },
  {
    id: 'l4',
    title: 'Control Mapping & Deadzones',
    description: 'Improving driver precision with input scaling.',
    difficulty: 'Beginner',
    category: 'Control',
    order: 4,
    durationMinutes: 15,
    content: `
# Joystick Logic

Joysticks often drift slightly even when not touched. We solve this with **Deadzones**.

## Squaring Inputs
To give drivers more control at low speeds, we often square the joystick input:
\`\`\`java
double drive = -gamepad1.left_stick_y;
double scaledDrive = drive * Math.abs(drive); // Quadratic scaling
motor.setPower(scaledDrive);
\`\`\`
This makes the robot move slowly when the stick is moved a little, but still full speed when pushed all the way!
    `
  },
  {
    id: 'l5',
    title: 'Mecanum Drive Math',
    description: 'Vector math for 4-wheel omnidirectional movement.',
    difficulty: 'Intermediate',
    category: 'Drive',
    order: 5,
    durationMinutes: 25,
    content: `
# Mecanum Drive Physics

Mecanum wheels have rollers at 45-degree angles. By spinning them in specific directions, the robot can move sideways (strafing).

[MECANUM_VISUAL]

## The Standard Formula
\`\`\`java
double y = -gamepad1.left_stick_y; 
double x = gamepad1.left_stick_x;  
double rx = gamepad1.right_stick_x; 

double fl = y + x + rx;
double bl = y - x + rx;
double fr = y - x - rx;
double br = y + x - rx;
\`\`\`
    `
  },
  {
    id: 'l6',
    title: 'Field Centric Driving',
    description: 'Using the IMU to drive relative to the field, not the robot.',
    difficulty: 'Advanced',
    category: 'Drive',
    order: 6,
    durationMinutes: 30,
    content: `
# Field Centric Drive

Normally, if the robot rotates 180 degrees, pushing "up" makes it drive toward the driver. **Field Centric** driving uses the **IMU (Gyroscope)** to ensure "up" always means "away from the driver."

## The Rotation Vector
\`\`\`java
double botHeading = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.RADIANS);
// Rotate input vector by -botHeading
double rotX = x * Math.cos(-botHeading) - y * Math.sin(-botHeading);
double rotY = x * Math.sin(-botHeading) + y * Math.cos(-botHeading);
\`\`\`
    `
  },
  {
    id: 'l7',
    title: 'Encoders & Odometry',
    description: 'Measuring precise distance using wheel rotations.',
    difficulty: 'Intermediate',
    category: 'Control',
    order: 7,
    durationMinutes: 25,
    content: `
# Using Encoders

Encoders count the "ticks" as a motor spins.

## Ticks per Inch
To drive 24 inches, we calculate the ticks:
\`\`\`java
double TICKS_PER_REV = 537.7; // Example for goBilda 435 RPM
double WHEEL_DIAMETER = 3.77; // Inches
double TICKS_PER_INCH = TICKS_PER_REV / (WHEEL_DIAMETER * Math.PI);

int target = (int)(24 * TICKS_PER_INCH);
motor.setTargetPosition(target);
motor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
\`\`\`
    `
  },
  {
    id: 'l8',
    title: 'PID Control: The P-Loop',
    description: 'The foundation of control theory: Proportional reaction.',
    difficulty: 'Advanced',
    category: 'Control Theory',
    order: 8,
    durationMinutes: 30,
    content: `
# PID Part 1: Proportional (P)

If you simply stop a motor when it hits a target, it will **overshoot** due to momentum.

## The Logic
\`\`\`java
double error = target - current;
double Kp = 0.05; // Tunable gain
double power = error * Kp;
\`\`\`
As the robot gets closer, the error gets smaller, and the motor slows down automatically.
    `
  },
  {
    id: 'l9',
    title: 'PID Control: I & D Terms',
    description: 'Solving oscillations (D) and steady-state error (I).',
    difficulty: 'Advanced',
    category: 'Control Theory',
    order: 9,
    durationMinutes: 35,
    content: `
# PID Part 2: Stability

## Derivative (D)
D acts as a "brake." It looks at how fast the error is changing. If we are approaching the target too quickly, D reduces power to prevent overshooting.

## Integral (I)
I handles "steady-state error." If friction prevents the robot from reaching the last 0.5 inches, the I-term builds up power over time until the robot finally moves.
    `
  },
  {
    id: 'l10',
    title: 'Feedforward & Gravity',
    description: 'Counteracting physical forces like gravity (PIDF).',
    difficulty: 'Advanced',
    category: 'Control Theory',
    order: 10,
    durationMinutes: 30,
    content: `
# Feedforward (F)

PID only reacts *after* error happens. **Feedforward** predicts the power needed based on physics.

## kG (Gravity)
If you have a heavy elevator in DECODE, gravity is always pulling it down. 
\`\`\`java
double power = pidOutput + kG; // kG is the power needed to just hold the elevator still
\`\`\`
This makes the elevator feel "weightless" to the PID controller.
    `
  },
  {
    id: 'l11',
    title: 'Localization: goBilda Pinpoint',
    description: 'High-speed odometry using specialized hardware.',
    difficulty: 'Advanced',
    category: 'Localization',
    order: 11,
    durationMinutes: 40,
    content: `
# goBilda Pinpoint

The Pinpoint computer tracks your (X, Y) coordinates at 500Hz using "dead wheels."

\`\`\`java
pinpoint.update();
Pose2D pos = pinpoint.getPosition();
telemetry.addData("X", pos.getX(DistanceUnit.INCH));
telemetry.addData("Y", pos.getY(DistanceUnit.INCH));
\`\`\`
Localization allows you to say "Go to (24, 48)" instead of "Drive forward 2 seconds."
    `
  },
  {
    id: 'l12',
    title: 'Computer Vision: AprilTags',
    description: 'Identifying Obelisks and Goals in the DECODE arena.',
    difficulty: 'Advanced',
    category: 'Vision',
    order: 12,
    durationMinutes: 40,
    content: `
# AprilTag Navigation

In DECODE, use **AprilTags 21-23** on the Obelisk and **Tag 24** on the Goal.

## Detection
\`\`\`java
for (AprilTagDetection detection : detections) {
    if (detection.id == 24) {
        double dist = detection.ftcPose.range;
        double angle = detection.ftcPose.bearing;
        // Align to score!
    }
}
\`\`\`
    `
  },
  {
    id: 'l13',
    title: 'Intake Systems',
    description: 'Active roller design for Purple and Green spheres.',
    difficulty: 'Intermediate',
    category: 'Manipulation',
    order: 13,
    durationMinutes: 30,
    content: `
# "Touch it, Own it"

Speed is everything in DECODE. Use compliant (squishy) wheels on your intake.

## Software logic
\`\`\`java
// Turn on intake
intakeMotor.setPower(1.0);

// Use a distance sensor to stop intake when artifact is inside
if (distanceSensor.getDistance(CM) < 5) {
    intakeMotor.setPower(0);
}
\`\`\`
    `
  },
  {
    id: 'l14',
    title: 'The Spindexer System',
    description: 'Rotating mechanisms for artifact management.',
    difficulty: 'Advanced',
    category: 'Manipulation',
    order: 14,
    durationMinutes: 35,
    content: `
# Spindexer Mechanics

A **Spindexer** rotates to route artifacts to different scoring mechanisms or storage slots.

## Position Control
In our SDK, the spindexer is often a servo or a motor with an encoder.
\`\`\`java
// Rotate to Slot A (Purple)
spindexer.setPosition(0.2); 
// Rotate to Slot B (Green)
spindexer.setPosition(0.8);
\`\`\`
    `
  },
  {
    id: 'l15',
    title: 'Advanced Sorting Logic',
    description: 'Automating the DECODE Motif requirements.',
    difficulty: 'Advanced',
    category: 'Automation',
    order: 15,
    durationMinutes: 45,
    content: `
# Intelligent Sorting

The **Obelisk Motif** tells you which color to score next.

## Logic Flow
1. Intake Artifact.
2. Check color sensor.
3. Compare with Motif requirement.
4. Rotate Spindexer.
5. Shoot or Eject.

\`\`\`java
if (colorSensor.isPurple() == motifRequiresPurple) {
    spindexer.setPosition(SHOOT_POS);
} else {
    spindexer.setPosition(EJECT_POS);
}
\`\`\`
    `
  },
  {
    id: 'l16',
    title: 'Finite State Machines (FSM)',
    description: 'Managing complex robot behaviors without messy if-statements.',
    difficulty: 'Advanced',
    category: 'Structure',
    order: 16,
    durationMinutes: 50,
    content: `
# Finite State Machines

In TeleOp, you might want to press one button to "Intake, Sort, and Lift."

## The State Logic
\`\`\`java
enum State { INTAKING, SORTING, LIFTING, IDLE };
State robotState = State.IDLE;

// Inside loop
switch(robotState) {
    case INTAKING:
        intake.on();
        if(artifactHeld) robotState = State.SORTING;
        break;
    case SORTING:
        spindexer.rotate();
        if(sorted) robotState = State.LIFTING;
        break;
    // ... etc
}
\`\`\`
    `
  },
  {
    id: 'l17',
    title: 'Autonomous Strategy',
    description: 'Maximizing points in the first 30 seconds.',
    difficulty: 'Intermediate',
    category: 'Strategy',
    order: 17,
    durationMinutes: 30,
    content: `
# Autonomous Pathing

In DECODE, the best autonomous routines:
1. Deliver a pre-loaded artifact.
2. Drive to Spike Marks.
3. Intake and score 2+ more artifacts.
4. Park in the Observation Zone.

## Consistency
Consistency > Speed. Use **Localization** (Lesson 11) to ensure your paths never drift!
    `
  }
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Launch Initialization',
    description: 'Print "DECODE_ACTIVE" to the telemetry.',
    lessonId: 'l1',
    difficulty: 'Beginner',
    points: 10,
    starterCode: `telemetry.addData("Status", "...");
telemetry.update();`,
    solutionCode: `telemetry.addData("Status", "DECODE_ACTIVE"); telemetry.update();`,
    hints: ['Text must be exactly "DECODE_ACTIVE"'],
    validate: (state) => {
        const found = state.logs.some(log => log.includes('Status: DECODE_ACTIVE'));
        return { success: found, message: found ? "Systems Go!" : "Telemetry message incorrect." };
    }
  },
  {
    id: 'c2',
    title: 'First Drive',
    description: 'Drive forward at 50% power for 2 seconds and stop.',
    lessonId: 'l3',
    difficulty: 'Beginner',
    points: 20,
    starterCode: `motor.setPower(0.5);
sleep(0);
motor.setPower(0);`,
    solutionCode: `motor.setPower(0.5); sleep(2000); motor.setPower(0);`,
    hints: ['2 seconds = 2000ms'],
    validate: (state) => {
        const moved = state.y < 240;
        const stopped = state.leftPower === 0;
        return { success: moved && stopped, message: moved && stopped ? "Launch successful!" : "Robot didn't stop or move far enough." };
    }
  },
  {
    id: 'c3',
    title: 'Precision Pivot',
    description: 'Rotate the robot at 30% power for 1 second. (Negative power rotates the robot in the simulator).',
    lessonId: 'l3',
    difficulty: 'Beginner',
    points: 30,
    starterCode: `motor.setPower(-0.3);
sleep(1000);
motor.setPower(0);`,
    solutionCode: `motor.setPower(-0.3); sleep(1000); motor.setPower(0);`,
    hints: ['Rotation is triggered by negative power in this simulator'],
    validate: (state) => {
        const rotated = state.rotation > 10;
        const stopped = state.leftPower === 0;
        return { success: rotated && stopped, message: rotated && stopped ? "Pivot complete!" : "Robot didn't rotate enough." };
    }
  },
  {
    id: 'c4',
    title: 'Intake Activation',
    description: 'Activate the intake motor at full power for 3 seconds to prepare for artifact collection.',
    lessonId: 'l13',
    difficulty: 'Intermediate',
    points: 40,
    starterCode: `intakeMotor.setPower(1.0);
sleep(3000);
intakeMotor.setPower(0);`,
    solutionCode: `intakeMotor.setPower(1.0); sleep(3000); intakeMotor.setPower(0);`,
    hints: ['Use intakeMotor.setPower(1.0)'],
    validate: (state) => {
        const stopped = state.intakePower === 0;
        return { success: stopped, message: stopped ? "Intake systems verified!" : "Make sure to stop the motor after 3 seconds." };
    }
  },
  {
    id: 'c12',
    title: 'Intake and Sort',
    description: 'Drive forward to grab a ball. If it is PURPLE, rotate spindexer to 0.8. If GREEN, rotate to 0.2. Then shoot!',
    lessonId: 'l15',
    difficulty: 'Advanced',
    points: 100,
    starterCode: `intakeMotor.setPower(1.0);
motor.setPower(0.4);
sleep(2500);
motor.setPower(0);
intakeMotor.setPower(0);

// Simulator color logic
if (colorSensor.isPurple()) {
  spindexer.setPosition(0.8);
} else {
  spindexer.setPosition(0.2);
}

sleep(1000);
shoot();`,
    solutionCode: `intakeMotor.setPower(1.0); motor.setPower(0.4); sleep(2500); motor.setPower(0); intakeMotor.setPower(0); if (colorSensor.isPurple()) { spindexer.setPosition(0.8); } else { spindexer.setPosition(0.2); } sleep(1000); shoot();`,
    hints: ['Check color with colorSensor.isPurple()', 'Purple slot is 0.8', 'Green slot is 0.2'],
    validate: (state) => {
        const hasRotated = state.spindexerPosition > 0;
        const hasShot = state.isRunning === false && state.heldArtifact === null;
        const success = hasRotated && hasShot;
        return { success, message: success ? "Advanced Sorting Successful!" : "Ensure you rotate the spindexer before shooting." };
    }
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'System Online', description: 'Completed your first lesson.', icon: 'rocket', requirement: (p) => Object.keys(p.lessons).length >= 1 },
  { id: 'a2', title: 'Drive Master', description: 'Learned Mecanum and Field Centric math.', icon: 'drive', requirement: (p) => p.lessons['l5'] && p.lessons['l6'] },
  { id: 'a3', title: 'Control Expert', description: 'Mastered the PIDF control stack.', icon: 'control', requirement: (p) => p.lessons['l8'] && p.lessons['l9'] && p.lessons['l10'] },
  { id: 'a4', title: 'Visionary', description: 'Learned AprilTag tracking.', icon: 'vision', requirement: (p) => p.lessons['l12'] },
  { id: 'a5', title: 'Sorter Supreme', description: 'Mastered the spindexer sorting system.', icon: 'sorter', requirement: (p) => p.challenges['c12'] === true }
];

export const getTotalPossiblePoints = () => CHALLENGES.reduce((acc, curr) => acc + curr.points, 0);

const LEGACY_PROGRESS_KEY = 'ftc_progress_v7';
const PROGRESS_PREFIX = 'ftc_progress_v8_';
const createEmptyProgress = (): UserProgressStore => ({ lessons: {}, challenges: {}, points: 0, unlockedAchievements: [] });

const getProgressKey = (userId: string) => `${PROGRESS_PREFIX}${userId}`;

export const getUserProgress = (): UserProgressStore => {
    const user = getCurrentUser();
    if (!user) return createEmptyProgress();

    const userKey = getProgressKey(user.id);
    const stored = localStorage.getItem(userKey);
    if (stored) {
        try {
            return JSON.parse(stored) as UserProgressStore;
        } catch {
            return createEmptyProgress();
        }
    }

    // One-time migration from the previous single-user key.
    const legacy = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (!legacy) return createEmptyProgress();

    try {
        const legacyProgress = JSON.parse(legacy) as UserProgressStore;
        localStorage.setItem(userKey, JSON.stringify(legacyProgress));
        localStorage.removeItem(LEGACY_PROGRESS_KEY);
        return legacyProgress;
    } catch {
        return createEmptyProgress();
    }
};

const saveProgress = (progress: UserProgressStore) => {
    const user = getCurrentUser();
    if (!user) return;

    const newAchievements = ACHIEVEMENTS.filter(a => !progress.unlockedAchievements.includes(a.id) && a.requirement(progress));
    if (newAchievements.length > 0) {
        progress.unlockedAchievements = [...progress.unlockedAchievements, ...newAchievements.map(a => a.id)];
        newAchievements.forEach(a => window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: a })));
    }
    localStorage.setItem(getProgressKey(user.id), JSON.stringify(progress));
    window.dispatchEvent(new Event('progress_updated'));
};

export const markLessonComplete = (id: string) => {
    const progress = getUserProgress();
    if (!progress.lessons[id]) { progress.lessons[id] = true; saveProgress(progress); }
};

export const markChallengeComplete = (id: string) => {
    const progress = getUserProgress();
    if (!progress.challenges[id]) {
        const challenge = CHALLENGES.find(c => c.id === id);
        if (challenge) { progress.challenges[id] = true; progress.points += challenge.points; saveProgress(progress); }
    }
};
