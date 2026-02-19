const DEFAULT_EXERCISE = {
  title: 'Practice Block',
  prompt: 'Write Java related to this lesson and run checks.',
  starterCode: 'telemetry.addData("Status", "Practice");\ntelemetry.update();\n',
  checks: [
    {
      label: 'Includes at least one Java statement',
      pattern: ';',
      hint: 'Add a valid Java statement ending with a semicolon.',
    },
  ],
  successMessage: 'Exercise checks passed.',
};

export const LESSON_EXERCISES = {
  l1: {
    title: 'Telemetry Warmup',
    prompt: 'Print DECODE READY to telemetry and publish it.',
    starterCode: 'telemetry.addData("Status", "");\n',
    checks: [
      { label: 'Adds DECODE READY status', pattern: 'telemetry\\.addData\\(\\s*"Status"\\s*,\\s*"DECODE READY"\\s*\\)', hint: 'Use telemetry.addData("Status", "DECODE READY");' },
      { label: 'Calls telemetry.update()', pattern: 'telemetry\\.update\\s*\\(\\s*\\)\\s*;', hint: 'Call telemetry.update();' },
    ],
    successMessage: 'Initialization telemetry is correct.',
  },
  l2: {
    title: 'Java Variables',
    prompt: 'Declare encoderTicks, motorPower, and isIntakeRunning with the lesson values.',
    starterCode: '// Declare the required variables below\n',
    checks: [
      { label: 'int encoderTicks = 500;', pattern: '\\bint\\s+encoderTicks\\s*=\\s*500\\s*;', hint: 'Create int encoderTicks = 500;' },
      { label: 'double motorPower = 0.5;', pattern: '\\bdouble\\s+motorPower\\s*=\\s*0\\.5\\s*;', hint: 'Create double motorPower = 0.5;' },
      { label: 'boolean isIntakeRunning = false;', pattern: '\\bboolean\\s+isIntakeRunning\\s*=\\s*false\\s*;', hint: 'Create boolean isIntakeRunning = false;' },
    ],
    successMessage: 'Variable declarations look good.',
  },
  l3: {
    title: 'OpMode Skeleton',
    prompt: 'Inside runOpMode(), call waitForStart() and then set motor power to 0.4.',
    starterCode: 'public class MyOpMode extends LinearOpMode {\n  @Override\n  public void runOpMode() {\n    // TODO\n  }\n}\n',
    checks: [
      { label: 'Calls waitForStart()', pattern: 'waitForStart\\s*\\(\\s*\\)\\s*;', hint: 'Call waitForStart(); before movement.' },
      { label: 'Sets motor power to 0.4', pattern: 'motor\\.setPower\\s*\\(\\s*0\\.4\\s*\\)\\s*;', hint: 'Use motor.setPower(0.4);' },
    ],
    successMessage: 'Basic LinearOpMode flow passed.',
  },
  l4: {
    title: 'Input Scaling',
    prompt: 'Create scaledDrive using quadratic scaling and send it to motor power.',
    starterCode: 'double drive = -gamepad1.left_stick_y;\n',
    checks: [
      { label: 'Computes scaledDrive', pattern: 'scaledDrive\\s*=\\s*drive\\s*\\*\\s*Math\\.abs\\s*\\(\\s*drive\\s*\\)', hint: 'Use drive * Math.abs(drive).' },
      { label: 'Sets motor power with scaledDrive', pattern: 'motor\\.setPower\\s*\\(\\s*scaledDrive\\s*\\)\\s*;', hint: 'Call motor.setPower(scaledDrive);' },
    ],
    successMessage: 'Driver input scaling is correct.',
  },
  l5: {
    title: 'Mecanum Mix',
    prompt: 'Write formulas for fl, fr, bl, br using y, x, rx.',
    starterCode: 'double y = -gamepad1.left_stick_y;\ndouble x = gamepad1.left_stick_x;\ndouble rx = gamepad1.right_stick_x;\n',
    checks: [
      { label: 'Defines fl formula', pattern: 'fl\\s*=\\s*y\\s*\\+\\s*x\\s*\\+\\s*rx\\s*;', hint: 'fl = y + x + rx;' },
      { label: 'Defines fr formula', pattern: 'fr\\s*=\\s*y\\s*-\\s*x\\s*-\\s*rx\\s*;', hint: 'fr = y - x - rx;' },
    ],
    successMessage: 'Mecanum equations passed checks.',
  },
  l6: {
    title: 'Field-Centric Rotation',
    prompt: 'Compute botHeading and rotated X/Y using trig.',
    starterCode: 'double botHeading = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.RADIANS);\n',
    checks: [
      { label: 'Computes rotX', pattern: 'rotX\\s*=\\s*x\\s*\\*\\s*Math\\.cos\\s*\\(\\s*-botHeading\\s*\\)\\s*-\\s*y\\s*\\*\\s*Math\\.sin\\s*\\(\\s*-botHeading\\s*\\)', hint: 'Use x*cos(-heading) - y*sin(-heading).' },
      { label: 'Computes rotY', pattern: 'rotY\\s*=\\s*x\\s*\\*\\s*Math\\.sin\\s*\\(\\s*-botHeading\\s*\\)\\s*\\+\\s*y\\s*\\*\\s*Math\\.cos\\s*\\(\\s*-botHeading\\s*\\)', hint: 'Use x*sin(-heading) + y*cos(-heading).' },
    ],
    successMessage: 'Field-centric vector rotation passed.',
  },
  l7: {
    title: 'Encoder Distance',
    prompt: 'Calculate TICKS_PER_INCH and target ticks for 24 inches.',
    starterCode: 'double TICKS_PER_REV = 537.7;\ndouble WHEEL_DIAMETER = 3.77;\n',
    checks: [
      { label: 'Computes TICKS_PER_INCH', pattern: 'TICKS_PER_INCH\\s*=\\s*TICKS_PER_REV\\s*\\/\\s*\\(\\s*WHEEL_DIAMETER\\s*\\*\\s*Math\\.PI\\s*\\)\\s*;', hint: 'Use TICKS_PER_REV / (WHEEL_DIAMETER * Math.PI).' },
      { label: 'Computes target from 24 inches', pattern: 'target\\s*=\\s*\\(int\\)\\s*\\(\\s*24\\s*\\*\\s*TICKS_PER_INCH\\s*\\)\\s*;', hint: 'Cast: (int)(24 * TICKS_PER_INCH).' },
    ],
    successMessage: 'Encoder math is correct.',
  },
  l8: {
    title: 'Proportional Control',
    prompt: 'Compute error and power = error * Kp.',
    starterCode: 'double target = 1000;\ndouble current = 650;\ndouble Kp = 0.05;\n',
    checks: [
      { label: 'Computes error', pattern: 'error\\s*=\\s*target\\s*-\\s*current\\s*;', hint: 'error = target - current;' },
      { label: 'Computes proportional power', pattern: 'power\\s*=\\s*error\\s*\\*\\s*Kp\\s*;', hint: 'power = error * Kp;' },
    ],
    successMessage: 'P-loop equations passed.',
  },
  l9: {
    title: 'I and D Terms',
    prompt: 'Declare integral and derivative terms in your control loop.',
    starterCode: 'double error = target - current;\n',
    checks: [
      { label: 'Uses derivative term', pattern: 'derivative', hint: 'Include a derivative variable or expression.' },
      { label: 'Uses integral term', pattern: 'integral', hint: 'Include an integral variable or expression.' },
    ],
    successMessage: 'I/D control terms detected.',
  },
  l10: {
    title: 'Feedforward',
    prompt: 'Add a feedforward term and include it in final power.',
    starterCode: 'double pid = error * Kp;\n',
    checks: [
      { label: 'Defines feedforward term', pattern: 'feedforward', hint: 'Create a feedforward variable.' },
      { label: 'Combines PID and feedforward', pattern: 'power\\s*=\\s*pid\\s*\\+\\s*feedforward', hint: 'power = pid + feedforward;' },
    ],
    successMessage: 'Feedforward composition passed.',
  },
  l11: {
    title: 'Localization Basics',
    prompt: 'Read robot X/Y heading and send telemetry.',
    starterCode: '// Use your localization object values\n',
    checks: [
      { label: 'References x position', pattern: '\\bx\\b|posX|getX', hint: 'Read x position from your localization source.' },
      { label: 'Sends telemetry update', pattern: 'telemetry\\.update\\s*\\(', hint: 'Call telemetry.update(); after adding data.' },
    ],
    successMessage: 'Localization telemetry check passed.',
  },
  l12: {
    title: 'AprilTag Detection',
    prompt: 'Check tag visibility and branch logic with if/else.',
    starterCode: '// if (tag detected) do something\n',
    checks: [
      { label: 'Uses if condition', pattern: '\\bif\\s*\\(', hint: 'Use an if condition for detection.' },
      { label: 'References april/tag detection', pattern: 'april|tag', flags: 'i', hint: 'Reference tag/april detection variable or object.' },
    ],
    successMessage: 'AprilTag control logic looks valid.',
  },
  l13: {
    title: 'Intake Control',
    prompt: 'Power the intake, wait, then stop it.',
    starterCode: '',
    checks: [
      { label: 'Starts intake motor', pattern: 'intakeMotor\\.setPower\\s*\\(\\s*1(\\.0)?\\s*\\)\\s*;', hint: 'Set intake power to 1.0.' },
      { label: 'Stops intake motor', pattern: 'intakeMotor\\.setPower\\s*\\(\\s*0\\s*\\)\\s*;', hint: 'Stop intake by setting power to 0.' },
    ],
    successMessage: 'Intake control sequence passed.',
  },
  l14: {
    title: 'Spindexer Positioning',
    prompt: 'Move the spindexer to one slot position.',
    starterCode: '',
    checks: [
      { label: 'Sets spindexer position', pattern: 'spindexer\\.setPosition\\s*\\(', hint: 'Call spindexer.setPosition(...).' },
      { label: 'Uses 0.2 or 0.8 slot value', pattern: '(0\\.2|0\\.8)', hint: 'Use one of the slot values from lesson.' },
    ],
    successMessage: 'Spindexer position check passed.',
  },
  l15: {
    title: 'Sorting Logic',
    prompt: 'Branch on color sensor and set different spindexer positions.',
    starterCode: '',
    checks: [
      { label: 'Uses color condition', pattern: 'colorSensor\\.isPurple\\s*\\(', hint: 'Branch on colorSensor.isPurple().' },
      { label: 'Contains else branch', pattern: '\\belse\\b', hint: 'Add an else for the alternate color.' },
    ],
    successMessage: 'Color sorting logic checks passed.',
  },
  l16: {
    title: 'Finite State Machine',
    prompt: 'Define at least two states and transition between them.',
    starterCode: 'enum State { IDLE, INTAKING }\nState state = State.IDLE;\n',
    checks: [
      { label: 'Defines state/enum', pattern: 'enum\\s+\\w+|State\\s+\\w+', hint: 'Use enum State {...} or State variable.' },
      { label: 'Uses switch or if transition', pattern: 'switch\\s*\\(|if\\s*\\(', hint: 'Add transition logic with switch/if.' },
    ],
    successMessage: 'FSM structure check passed.',
  },
  l17: {
    title: 'Autonomous Plan',
    prompt: 'Build a simple autonomous sequence with move, turn, and score actions.',
    starterCode: '',
    checks: [
      { label: 'Includes timing or wait', pattern: 'sleep\\s*\\(', hint: 'Use sleep(...) between actions.' },
      { label: 'Includes at least one motor action', pattern: 'setPower\\s*\\(', hint: 'Use motor.setPower(...) in your sequence.' },
    ],
    successMessage: 'Autonomous sequence checks passed.',
  },
};

export const getLessonExercise = (lessonId) => LESSON_EXERCISES[lessonId] ?? DEFAULT_EXERCISE;

export const runLessonChecks = (lessonId, code) => {
  const exercise = getLessonExercise(lessonId);
  const results = exercise.checks.map((check) => {
    const regex = new RegExp(check.pattern, check.flags ?? '');
    return {
      label: check.label,
      hint: check.hint,
      pass: regex.test(code),
    };
  });

  return {
    exercise,
    results,
    allPassed: results.every((r) => r.pass),
  };
};
