import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, ChevronLeft, Info, AlertTriangle, GripVertical, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { LESSONS, markLessonComplete } from '../services/data';
import Simulator from '../components/Simulator';

// --- Mecanum Visual Component ---
const MecanumDriveVisual: React.FC = () => {
  const [mode, setMode] = useState<'forward' | 'strafe-left' | 'strafe-right' | 'rotate'>('forward');

  const wheelConfigs = {
    'forward': { fl: 'up', fr: 'up', bl: 'up', br: 'up', result: 'up' },
    'strafe-left': { fl: 'down', fr: 'up', bl: 'up', br: 'down', result: 'left' },
    'strafe-right': { fl: 'up', fr: 'down', bl: 'down', br: 'up', result: 'right' },
    'rotate': { fl: 'up', fr: 'down', bl: 'up', br: 'down', result: 'rotate' },
  };

  const current = wheelConfigs[mode];

  const DirIcon = ({ dir, className = "" }: { dir: string, className?: string }) => {
    if (dir === 'up') return <ArrowUp className={`text-ftc-blue ${className}`} size={18} />;
    if (dir === 'down') return <ArrowDown className={`text-ftc-orange ${className}`} size={18} />;
    if (dir === 'left') return <ArrowLeft className={`text-white animate-pulse ${className}`} size={28} />;
    if (dir === 'right') return <ArrowRight className={`text-white animate-pulse ${className}`} size={28} />;
    if (dir === 'rotate') return <RotateCw className={`text-white animate-spin-slow ${className}`} size={28} />;
    return null;
  };

  return (
    <div className="my-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-3 bg-slate-800/40 border-b border-slate-800 flex flex-wrap gap-2 justify-center">
        {(['forward', 'strafe-left', 'strafe-right', 'rotate'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === m ? 'bg-ftc-blue text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {m.replace('-', ' ')}
          </button>
        ))}
      </div>
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative w-40 h-56 bg-slate-800/80 border-2 border-slate-700 rounded-3xl flex items-center justify-center">
          {/* Central Movement Indicator */}
          <div className="absolute z-10 p-4 bg-slate-900/60 rounded-full border border-slate-700 shadow-xl backdrop-blur-sm">
            <DirIcon dir={current.result} />
          </div>

          {/* Wheels */}
          <div className="absolute -top-3 -left-6 w-10 h-16 bg-slate-700 rounded-md border-2 border-slate-600 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#fff_5px,#fff_10px)]" />
            <DirIcon dir={current.fl} className="relative z-10" />
            <span className="text-[7px] text-slate-500 font-black mt-0.5">FL</span>
          </div>
          <div className="absolute -top-3 -right-6 w-10 h-16 bg-slate-700 rounded-md border-2 border-slate-600 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(-45deg,transparent,transparent_5px,#fff_5px,#fff_10px)]" />
            <DirIcon dir={current.fr} className="relative z-10" />
            <span className="text-[7px] text-slate-500 font-black mt-0.5">FR</span>
          </div>
          <div className="absolute -bottom-3 -left-6 w-10 h-16 bg-slate-700 rounded-md border-2 border-slate-600 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(-45deg,transparent,transparent_5px,#fff_5px,#fff_10px)]" />
            <DirIcon dir={current.bl} className="relative z-10" />
            <span className="text-[7px] text-slate-500 font-black mt-0.5">BL</span>
          </div>
          <div className="absolute -bottom-3 -right-6 w-10 h-16 bg-slate-700 rounded-md border-2 border-slate-600 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#fff_5px,#fff_10px)]" />
            <DirIcon dir={current.br} className="relative z-10" />
            <span className="text-[7px] text-slate-500 font-black mt-0.5">BR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Robust Token-based Java Highlighter for React
const JavaHighlighter: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');

  const keywords = ['public', 'private', 'protected', 'class', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'new', 'import', 'package', 'static', 'final', '@Override'];
  const types = ['int', 'double', 'String', 'boolean', 'void', 'LinearOpMode', 'OpMode'];
  const ftcMethods = ['telemetry', 'motor', 'sleep', 'waitForStart', 'runOpMode', 'addData', 'update', 'setPower'];

  return (
    <>
      {lines.map((line, lineIdx) => {
        let parts: React.ReactNode[] = [];
        let remaining = line;

        const commentIdx = remaining.indexOf('//');
        let commentPart = "";
        if (commentIdx !== -1) {
          commentPart = remaining.substring(commentIdx);
          remaining = remaining.substring(0, commentIdx);
        }

        const wordRegex = /(\s+|[(){}[\];.,!+\-*/=<>"])/g;
        const subParts = remaining.split(wordRegex).filter(p => p !== "");

        let inString = false;
        let stringContent = "";

        subParts.forEach((part, i) => {
          if (part === '"') {
            if (inString) {
              parts.push(<span key={`${lineIdx}-${i}`} className="text-green-400">"{stringContent}"</span>);
              stringContent = "";
              inString = false;
            } else {
              inString = true;
            }
            return;
          }

          if (inString) {
            stringContent += part;
            return;
          }

          if (keywords.includes(part)) {
            parts.push(<span key={`${lineIdx}-${i}`} className="text-purple-400 font-medium">{part}</span>);
          } else if (types.includes(part)) {
            parts.push(<span key={`${lineIdx}-${i}`} className="text-blue-400 font-medium">{part}</span>);
          } else if (ftcMethods.includes(part)) {
            parts.push(<span key={`${lineIdx}-${i}`} className="text-cyan-400">{part}</span>);
          } else if (/^\d+(\.\d+)?$/.test(part)) {
            parts.push(<span key={`${lineIdx}-${i}`} className="text-amber-400">{part}</span>);
          } else {
            parts.push(<span key={`${lineIdx}-${i}`} className="text-slate-300">{part}</span>);
          }
        });

        if (commentPart) {
          parts.push(<span key={`${lineIdx}-comment`} className="text-slate-500 italic">{commentPart}</span>);
        }

        return (
          <div key={lineIdx} className="min-h-[1.25rem] whitespace-pre">
            {parts.length > 0 ? parts : ' '}
          </div>
        );
      })}
    </>
  );
};

const LessonDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lessonIndex = LESSONS.findIndex(l => l.id === id);
  const lesson = LESSONS[lessonIndex];
  
  const [activeTab, setActiveTab] = useState<'content' | 'practice'>('content');
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  if (!lesson) return <div className="p-10 text-white">Lesson not found</div>;

  const handleComplete = () => {
    markLessonComplete(lesson.id);
    if (lessonIndex < LESSONS.length - 1) {
        navigate(`/lessons/${LESSONS[lessonIndex + 1].id}`);
    } else {
        navigate('/dashboard');
    }
  };

  const defaultPracticeCode = `// Try what you learned here!
telemetry.addData("Status", "Learning...");
telemetry.update();

motor.setPower(0.5);
sleep(1000);
motor.setPower(0);
`;

  const MarkdownComponents = {
    blockquote: ({ children }: any) => {
      const content = children[1]?.props?.children?.[0] || "";
      const isWarning = typeof content === 'string' && content.startsWith('WARNING:');
      const isNote = typeof content === 'string' && content.startsWith('NOTE:');

      if (isWarning) {
        return (
          <div className="my-6 p-4 bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg flex items-start space-x-3">
            <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20} />
            <div className="text-sm text-orange-100 italic">{children}</div>
          </div>
        );
      }

      if (isNote) {
        return (
          <div className="my-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg flex items-start space-x-3">
            <Info className="text-blue-500 shrink-0 mt-1" size={20} />
            <div className="text-sm text-blue-100 italic">{children}</div>
          </div>
        );
      }

      return <blockquote className="border-l-4 border-slate-700 pl-4 my-4 italic text-slate-400">{children}</blockquote>;
    },
    h1: ({ children }: any) => <h1 className="text-3xl font-black text-white mb-6 border-b border-slate-800 pb-4 tracking-tight">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold text-white mt-10 mb-4 tracking-tight">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">{children}</h3>,
    ul: ({ children }: any) => <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-slate-300">{children}</ul>,
    p: ({ children }: any) => {
      const contentStr = String(children);
      if (contentStr.includes("[MECANUM_VISUAL]")) {
        return <MecanumDriveVisual />;
      }
      return <p className="leading-relaxed mb-4 text-slate-300 text-left">{children}</p>;
    },
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="bg-slate-800/40 text-ftc-orange px-1.5 py-0.5 mx-0.5 rounded border border-slate-700/30 text-[0.85em] font-mono font-medium shadow-sm leading-none whitespace-nowrap">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-[#0d1117] border border-slate-800 p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm leading-relaxed shadow-xl border-l-4 border-l-ftc-blue">
          <JavaHighlighter code={String(children).replace(/\n$/, '')} />
        </pre>
      );
    }
  };

  return (
    <div key={id} className="flex flex-col h-full overflow-hidden">
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/lessons')} className="text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft />
                </button>
                <div>
                    <div className="text-[10px] text-ftc-orange font-black uppercase tracking-[0.2em]">Lesson {lesson.order}</div>
                    <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
                </div>
            </div>
            <div className="flex bg-slate-800 rounded-lg p-1">
                <button 
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${activeTab === 'content' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Guide
                </button>
                <button 
                    onClick={() => setActiveTab('practice')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${activeTab === 'practice' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Practice
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden relative bg-slate-950">
            {activeTab === 'content' ? (
                <div className="h-full overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-3xl mx-auto text-left">
                        <ReactMarkdown components={MarkdownComponents}>{lesson.content}</ReactMarkdown>
                        <div className="mt-16 pt-8 border-t border-slate-800 flex justify-end">
                            <button 
                                onClick={handleComplete}
                                className="flex items-center px-8 py-4 bg-ftc-blue hover:bg-blue-600 text-white rounded-xl font-black transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                            >
                                <span>Complete & Continue</span>
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col p-4 lg:p-0">
                    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0">
                        <div 
                          className="flex flex-col h-full min-h-0 overflow-hidden" 
                          style={{ width: window.innerWidth >= 1024 ? `${leftWidth}%` : '100%' }}
                        >
                            <div className="p-4 flex flex-col h-full">
                                <label className="text-slate-400 text-[10px] font-black mb-2 block uppercase tracking-widest">Code Editor (Android Java)</label>
                                <textarea
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:border-ftc-blue focus:ring-1 focus:ring-ftc-blue shadow-inner"
                                    defaultValue={defaultPracticeCode}
                                    spellCheck={false}
                                    id="practice-editor"
                                />
                            </div>
                        </div>

                        {/* Draggable Divider */}
                        <div 
                          onMouseDown={startResizing}
                          className="hidden lg:flex group items-center justify-center w-2 hover:w-4 bg-slate-950 hover:bg-ftc-blue/20 cursor-col-resize transition-all shrink-0 border-x border-slate-800/50"
                        >
                          <div className="w-1 h-8 bg-slate-800 group-hover:bg-ftc-blue/50 rounded-full transition-colors flex items-center justify-center">
                            <GripVertical size={10} className="text-slate-600 group-hover:text-ftc-blue" />
                          </div>
                        </div>

                        <div 
                          className="flex flex-col h-full min-h-0 overflow-hidden" 
                          style={{ width: window.innerWidth >= 1024 ? `${100 - leftWidth}%` : '100%' }}
                        >
                             <div className="p-4 flex flex-col h-full">
                                <label className="text-slate-400 text-[10px] font-black mb-2 block uppercase tracking-widest">Field Simulator</label>
                                <div className="flex-1 min-h-[400px]">
                                    <SimulatorWrapper />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const SimulatorWrapper = () => {
    const [code, setCode] = useState("");
    React.useEffect(() => {
        const el = document.getElementById('practice-editor') as HTMLTextAreaElement;
        if(el) {
            setCode(el.value);
            const handler = () => setCode(el.value);
            el.addEventListener('input', handler);
            return () => el.removeEventListener('input', handler);
        }
    }, []);
    return <Simulator code={code} />;
}

export default LessonDetail;