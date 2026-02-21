import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  Info,
  Loader2,
  PlayCircle,
  RotateCw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { LESSONS, markLessonComplete } from '../services/data';
import Simulator from '../components/Simulator';
import { getLessonExercise } from '../shared/lessonExercises.js';
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from '../services/editorDrafts';
import AITutor from '../components/AITutor';

interface CheckResult {
  label: string;
  hint: string;
  pass: boolean;
}

const JAVA_KEYWORDS = new Set([
  'public', 'private', 'protected', 'class', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'new',
  'import', 'package', 'static', 'final', 'switch', 'case', 'break', 'continue', 'enum', 'void', '@Override',
]);
const JAVA_TYPES = new Set(['int', 'double', 'String', 'boolean', 'long', 'float', 'char', 'byte', 'short']);
const JAVA_API = new Set(['telemetry', 'motor', 'intakeMotor', 'spindexer', 'sleep', 'waitForStart', 'setPower', 'setPosition', 'addData', 'update']);

const JavaHighlightLayer: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, lineIndex) => {
        const commentStart = line.indexOf('//');
        const rawCode = commentStart >= 0 ? line.slice(0, commentStart) : line;
        const comment = commentStart >= 0 ? line.slice(commentStart) : '';
        const tokens = rawCode.split(/(\s+|[(){}[\];.,!+\-*/=<>"])/g).filter(Boolean);

        const parts: React.ReactNode[] = [];
        let inString = false;
        let buffered = '';

        tokens.forEach((token, tokenIndex) => {
          if (token === '"') {
            if (inString) {
              parts.push(
                <span key={`${lineIndex}-${tokenIndex}`} className="text-emerald-300">
                  "{buffered}"
                </span>,
              );
              buffered = '';
              inString = false;
            } else {
              inString = true;
            }
            return;
          }

          if (inString) {
            buffered += token;
            return;
          }

          if (JAVA_KEYWORDS.has(token)) {
            parts.push(<span key={`${lineIndex}-${tokenIndex}`} className="text-fuchsia-300">{token}</span>);
          } else if (JAVA_TYPES.has(token)) {
            parts.push(<span key={`${lineIndex}-${tokenIndex}`} className="text-sky-300">{token}</span>);
          } else if (JAVA_API.has(token)) {
            parts.push(<span key={`${lineIndex}-${tokenIndex}`} className="text-cyan-300">{token}</span>);
          } else if (/^\d+(\.\d+)?$/.test(token)) {
            parts.push(<span key={`${lineIndex}-${tokenIndex}`} className="text-amber-300">{token}</span>);
          } else {
            parts.push(<span key={`${lineIndex}-${tokenIndex}`} className="text-slate-200">{token}</span>);
          }
        });

        if (comment) {
          parts.push(<span key={`${lineIndex}-comment`} className="text-slate-400 italic">{comment}</span>);
        }

        return (
          <div key={lineIndex} className="whitespace-pre leading-6">
            {parts.length > 0 ? parts : ' '}
          </div>
        );
      })}
    </>
  );
};

const MecanumDriveVisual: React.FC = () => {
  const [mode, setMode] = useState<'forward' | 'strafe-left' | 'strafe-right' | 'rotate'>('forward');

  const wheelConfigs = {
    forward: { fl: 'up', fr: 'up', bl: 'up', br: 'up', result: 'up' },
    'strafe-left': { fl: 'down', fr: 'up', bl: 'up', br: 'down', result: 'left' },
    'strafe-right': { fl: 'up', fr: 'down', bl: 'down', br: 'up', result: 'right' },
    rotate: { fl: 'up', fr: 'down', bl: 'up', br: 'down', result: 'rotate' },
  };

  const current = wheelConfigs[mode];

  const DirIcon = ({ dir, className = '' }: { dir: string; className?: string }) => {
    if (dir === 'up') return <ArrowUp className={`text-app-accent ${className}`} size={18} />;
    if (dir === 'down') return <ArrowDown className={`text-app-accent-2 ${className}`} size={18} />;
    if (dir === 'left') return <ArrowLeft className={`text-app-ink ${className}`} size={22} />;
    if (dir === 'right') return <ArrowRight className={`text-app-ink ${className}`} size={22} />;
    if (dir === 'rotate') return <RotateCw className={`text-app-ink ${className}`} size={22} />;
    return null;
  };

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-app-line bg-white shadow-sm">
      <div className="flex flex-wrap justify-center gap-2 border-b border-app-line bg-app-panel/50 p-3">
        {(['forward', 'strafe-left', 'strafe-right', 'rotate'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all ${
              mode === m ? 'bg-app-ink text-white' : 'bg-white text-app-muted hover:text-app-ink'
            }`}
          >
            {m.replace('-', ' ')}
          </button>
        ))}
      </div>
      <div className="flex min-h-[260px] items-center justify-center p-8">
        <div className="relative flex h-52 w-36 items-center justify-center rounded-3xl border-2 border-app-line bg-app-panel/70">
          <div className="absolute z-10 rounded-full border border-app-line bg-white p-4 shadow-sm">
            <DirIcon dir={current.result} />
          </div>
          <div className="absolute -left-5 -top-2 flex h-14 w-9 flex-col items-center justify-center rounded-md border border-app-line bg-white"><DirIcon dir={current.fl} /><span className="text-[7px] text-app-muted">FL</span></div>
          <div className="absolute -right-5 -top-2 flex h-14 w-9 flex-col items-center justify-center rounded-md border border-app-line bg-white"><DirIcon dir={current.fr} /><span className="text-[7px] text-app-muted">FR</span></div>
          <div className="absolute -bottom-2 -left-5 flex h-14 w-9 flex-col items-center justify-center rounded-md border border-app-line bg-white"><DirIcon dir={current.bl} /><span className="text-[7px] text-app-muted">BL</span></div>
          <div className="absolute -bottom-2 -right-5 flex h-14 w-9 flex-col items-center justify-center rounded-md border border-app-line bg-white"><DirIcon dir={current.br} /><span className="text-[7px] text-app-muted">BR</span></div>
        </div>
      </div>
    </div>
  );
};

const LessonDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lessonIndex = LESSONS.findIndex((lesson) => lesson.id === id);
  const lesson = LESSONS[lessonIndex];

  const exercise = useMemo(() => getLessonExercise(id ?? ''), [id]);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const editorResizeState = useRef({ active: false, startY: 0, startHeight: 620 });
  const [editorHeight, setEditorHeight] = useState(620);
  const [practiceCode, setPracticeCode] = useState(exercise.starterCode);
  const [isRunningChecks, setRunningChecks] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [isTutorOpen, setTutorOpen] = useState(false);

  useEffect(() => {
    const draft = id ? loadEditorDraft('lesson', id) : null;
    setPracticeCode(draft ?? exercise.starterCode);
    setResults([]);
    setRunError(null);
    setHasRun(false);
  }, [exercise, id]);

  useEffect(() => {
    if (!id) return;
    saveEditorDraft('lesson', id, practiceCode);
  }, [id, practiceCode]);

  const onEditorResizeMove = useCallback((event: MouseEvent) => {
    const state = editorResizeState.current;
    if (!state.active) return;
    const deltaY = event.clientY - state.startY;
    const nextHeight = Math.max(320, Math.min(1100, state.startHeight + deltaY));
    setEditorHeight(nextHeight);
  }, []);

  const onEditorResizeEnd = useCallback(() => {
    if (!editorResizeState.current.active) return;
    editorResizeState.current.active = false;
    document.body.style.userSelect = 'auto';
    document.body.style.cursor = 'default';
  }, []);

  const startEditorResize = (event: React.MouseEvent<HTMLDivElement>) => {
    editorResizeState.current = {
      active: true,
      startY: event.clientY,
      startHeight: editorHeight,
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    window.addEventListener('mousemove', onEditorResizeMove);
    window.addEventListener('mouseup', onEditorResizeEnd);
    return () => {
      window.removeEventListener('mousemove', onEditorResizeMove);
      window.removeEventListener('mouseup', onEditorResizeEnd);
    };
  }, [onEditorResizeEnd, onEditorResizeMove]);

  const syncEditorScroll = () => {
    if (!editorRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = editorRef.current.scrollTop;
    highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
  };

  const applyEditorEdit = (nextValue: string, cursorStart: number, cursorEnd = cursorStart) => {
    setPracticeCode(nextValue);
    setHasRun(false);
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      editorRef.current.setSelectionRange(cursorStart, cursorEnd);
      syncEditorScroll();
    });
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;

    if (event.key === 'Tab') {
      event.preventDefault();
      const indent = '  ';
      applyEditorEdit(`${value.slice(0, start)}${indent}${value.slice(end)}`, start + indent.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.slice(lineStart, start);
      const baseIndent = (currentLine.match(/^\s*/) || [''])[0];
      const shouldIndent = value[start - 1] === '{';
      const nextChar = value[start] || '';

      if (shouldIndent && nextChar === '}') {
        const insertion = `\n${baseIndent}  \n${baseIndent}`;
        applyEditorEdit(`${value.slice(0, start)}${insertion}${value.slice(end)}`, start + baseIndent.length + 3);
        return;
      }

      const insertion = `\n${baseIndent}${shouldIndent ? '  ' : ''}`;
      applyEditorEdit(`${value.slice(0, start)}${insertion}${value.slice(end)}`, start + insertion.length);
      return;
    }

    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    const closers = new Set(Object.values(pairs));

    if (pairs[event.key]) {
      event.preventDefault();
      const close = pairs[event.key];
      if (start !== end) {
        const selected = value.slice(start, end);
        applyEditorEdit(
          `${value.slice(0, start)}${event.key}${selected}${close}${value.slice(end)}`,
          start + 1,
          end + 1,
        );
      } else {
        applyEditorEdit(`${value.slice(0, start)}${event.key}${close}${value.slice(end)}`, start + 1);
      }
      return;
    }

    if (closers.has(event.key) && value[start] === event.key) {
      event.preventDefault();
      applyEditorEdit(value, start + 1);
    }
  };

  const runServerChecks = async () => {
    if (!id) return;
    setRunningChecks(true);
    setRunError(null);

    try {
      const response = await fetch(`/api/lessons/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: practiceCode }),
      });

      if (!response.ok) {
        throw new Error('Check request failed.');
      }

      const payload = await response.json();
      setResults(Array.isArray(payload.results) ? payload.results : []);
      setHasRun(true);
    } catch {
      setRunError('Unable to run server checks. Start the checks server with `npm run dev:checks`.');
      setHasRun(false);
    } finally {
      setRunningChecks(false);
    }
  };

  const allPassed = hasRun && results.length > 0 && results.every((result) => result.pass);

  useEffect(() => {
    if (allPassed && lesson) {
      markLessonComplete(lesson.id);
    }
  }, [allPassed, lesson]);

  if (!lesson) return <div className="p-10 text-app-ink">Lesson not found</div>;

  const goToNextLesson = () => {
    if (lessonIndex < LESSONS.length - 1) {
      navigate(`/lessons/${LESSONS[lessonIndex + 1].id}`);
    } else {
      navigate('/');
    }
  };

  const MarkdownComponents = {
    blockquote: ({ children }: any) => {
      const content = children?.[1]?.props?.children?.[0] || '';
      const isWarning = typeof content === 'string' && content.startsWith('WARNING:');
      const isNote = typeof content === 'string' && content.startsWith('NOTE:');

      if (isWarning) {
        return (
          <div className="my-6 flex items-start space-x-3 rounded-r-lg border-l-4 border-orange-500 bg-orange-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-orange-600" size={20} />
            <div className="text-sm italic text-orange-900">{children}</div>
          </div>
        );
      }

      if (isNote) {
        return (
          <div className="my-6 flex items-start space-x-3 rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4">
            <Info className="mt-0.5 shrink-0 text-blue-600" size={20} />
            <div className="text-sm italic text-blue-900">{children}</div>
          </div>
        );
      }

      return <blockquote className="my-4 border-l-4 border-app-line pl-4 italic text-app-muted">{children}</blockquote>;
    },
    h1: ({ children }: any) => <h1 className="mb-6 border-b border-app-line pb-4 text-4xl font-semibold tracking-tight text-app-ink">{children}</h1>,
    h2: ({ children }: any) => <h2 className="mb-4 mt-10 text-3xl font-semibold tracking-tight text-app-ink">{children}</h2>,
    h3: ({ children }: any) => <h3 className="mb-3 mt-6 text-2xl font-semibold text-app-ink">{children}</h3>,
    ul: ({ children }: any) => <ul className="mb-6 ml-6 list-disc list-outside space-y-2 text-app-muted">{children}</ul>,
    p: ({ children }: any) => {
      const content = String(children);
      if (content.includes('[MECANUM_VISUAL]')) {
        return <MecanumDriveVisual />;
      }
      return <p className="mb-4 text-left text-lg leading-relaxed text-app-muted">{children}</p>;
    },
    code: ({ inline, children }: any) => {
      if (inline) {
        return <code className="mx-0.5 whitespace-nowrap rounded border border-app-line bg-app-panel px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-app-accent">{children}</code>;
      }
      return <pre className="my-6 overflow-x-auto rounded-xl border border-app-line bg-[#222831] p-4 font-mono text-sm leading-relaxed text-slate-200 shadow-sm">{String(children).replace(/\n$/, '')}</pre>;
    },
  };

  return (
    <div key={id} className="flex h-full flex-col overflow-y-auto bg-app-bg">
      <AITutor
        isOpen={isTutorOpen}
        onClose={() => setTutorOpen(false)}
        code={practiceCode}
        context={`${lesson.title} - ${exercise.prompt}`}
      />

      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-app-line bg-white p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/lessons')} className="text-app-muted transition-colors hover:text-app-ink">
            <ChevronLeft />
          </button>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-app-accent">Lesson {lesson.order}</div>
            <h1 className="text-lg font-semibold text-app-ink sm:text-xl">{lesson.title}</h1>
          </div>
        </div>

        <span className="rounded-xl border border-app-line bg-app-panel px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-app-muted">
          Complete the coding exercise to finish this lesson
        </span>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-app-line bg-white p-6 shadow-sm sm:p-8">
          <ReactMarkdown components={MarkdownComponents}>{lesson.content}</ReactMarkdown>
        </section>

        <section className="mt-8 rounded-3xl border border-app-line bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-app-muted">Practice Question</p>
            <button
              onClick={() => setTutorOpen(true)}
              className="inline-flex items-center rounded-full bg-app-accent-2 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
            >
              <Sparkles size={12} className="mr-1.5" />
              AI Help
            </button>
          </div>
          <h2 className="text-2xl font-semibold text-app-ink">{exercise.title}</h2>
          <p className="mt-2 text-sm text-app-muted">{exercise.prompt}</p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-app-line bg-app-panel/30 p-4">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-app-muted">Java Editor</label>
              <div className="relative w-full overflow-hidden rounded-xl border border-app-line bg-[#222831]" style={{ height: `${editorHeight}px` }}>
                <pre
                  ref={highlightRef}
                  className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre p-4 font-mono text-[15px] leading-6"
                >
                  <JavaHighlightLayer code={practiceCode} />
                </pre>
                <textarea
                  ref={editorRef}
                  value={practiceCode}
                  onChange={(event) => {
                    setPracticeCode(event.target.value);
                    setHasRun(false);
                    requestAnimationFrame(syncEditorScroll);
                  }}
                  onScroll={syncEditorScroll}
                  onKeyDown={handleEditorKeyDown}
                  wrap="off"
                  style={{ tabSize: 2 }}
                  className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-[15px] leading-6 text-transparent caret-slate-100 focus:outline-none selection:bg-app-accent/30"
                  spellCheck={false}
                />
              </div>
              <div
                onMouseDown={startEditorResize}
                className="mt-2 flex h-5 cursor-ns-resize items-center justify-center rounded-lg border border-app-line bg-app-panel/70 hover:border-app-accent"
                title="Drag to resize editor height"
              >
                <div className="h-1 w-16 rounded-full bg-app-line" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={runServerChecks} disabled={isRunningChecks} className="ui-primary inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-60">
                  {isRunningChecks ? <Loader2 size={14} className="mr-2 animate-spin" /> : <PlayCircle size={14} className="mr-2" />}
                  Run Server Checks
                </button>
                <button
                  onClick={() => {
                    setPracticeCode(exercise.starterCode);
                    setResults([]);
                    setRunError(null);
                    setHasRun(false);
                    if (id) clearEditorDraft('lesson', id);
                  }}
                  className="rounded-xl border border-app-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-app-ink transition-colors hover:border-app-accent"
                >
                  Reset
                </button>
              </div>
              {runError && <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{runError}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-app-line bg-app-panel/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-app-muted">Check Results</p>
                  {hasRun && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {allPassed ? 'All Passed' : 'Needs Fixes'}
                    </span>
                  )}
                </div>
                {!hasRun ? (
                  <p className="text-xs text-app-muted">Run checks to validate your code.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {results.map((result) => (
                      <div key={result.label} className={`rounded-lg border px-2.5 py-2 text-xs ${result.pass ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>
                        <div className="flex items-start gap-1.5 font-semibold">
                          {result.pass ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> : <XCircle size={13} className="mt-0.5 shrink-0" />}
                          <span className="leading-snug">{result.label}</span>
                        </div>
                        {!result.pass && <p className="mt-1 text-[11px] leading-snug">Hint: {result.hint}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {allPassed && <p className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800">{exercise.successMessage}</p>}
              </div>

              <div className="min-h-[320px] rounded-2xl border border-app-line bg-app-panel/30 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-app-muted">Sandbox Runner</p>
                <div className="h-full min-h-[260px]">
                  <Simulator code={practiceCode} />
                </div>
              </div>
            </div>
          </div>

          {allPassed && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-emerald-800">Lesson complete. Checks passed.</p>
              <button onClick={goToNextLesson} className="ui-primary rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:self-auto">
                Continue
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LessonDetail;
