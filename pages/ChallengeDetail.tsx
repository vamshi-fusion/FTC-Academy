import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Lock, Send, Sparkles, CheckCircle2, PartyPopper, XCircle, GripVertical } from 'lucide-react';
import { CHALLENGES, markChallengeComplete } from '../services/data';
import { SimState } from '../types';
import Simulator from '../components/Simulator';
import AITutor from '../components/AITutor';
import { loadEditorDraft, saveEditorDraft } from '../services/editorDrafts';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const challenge = CHALLENGES.find(c => c.id === id);
  const [code, setCode] = useState(challenge?.starterCode || '');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isTutorOpen, setTutorOpen] = useState(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const [leftWidth, setLeftWidth] = useState(55);
  const isResizing = useRef(false);

  const applyEditorEdit = (nextValue: string, cursorStart: number, cursorEnd = cursorStart) => {
    setCode(nextValue);
    setIsReadyToSubmit(false);
    setValidationMsg(null);
    requestAnimationFrame(() => {
      const editor = document.getElementById('challenge-editor') as HTMLTextAreaElement | null;
      if (!editor) return;
      editor.focus();
      editor.setSelectionRange(cursorStart, cursorEnd);
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
        applyEditorEdit(`${value.slice(0, start)}${event.key}${selected}${close}${value.slice(end)}`, start + 1, end + 1);
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

  useEffect(() => {
    if (challenge) {
      const draft = id ? loadEditorDraft('challenge', id) : null;
      setCode(draft ?? challenge.starterCode);
      setIsReadyToSubmit(false);
      setIsSubmitted(false);
      setValidationMsg(null);
    }
  }, [id, challenge]);

  useEffect(() => {
    if (!id) return;
    saveEditorDraft('challenge', id, code);
  }, [id, code]);

  const handleSimFinished = (finalState: SimState) => {
    if (finalState.error) {
      setValidationMsg(null);
      setIsReadyToSubmit(false);
      return;
    }

    if (challenge?.validate) {
      const result = challenge.validate(finalState);
      setValidationMsg(result.message);
      setIsReadyToSubmit(result.success);
    } else {
      setIsReadyToSubmit(true);
    }
  };

  const handleSubmit = () => {
    if (!isReadyToSubmit || !id) return;
    markChallengeComplete(id);
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/challenges');
    }, 3000);
  };

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

  if (!challenge) return <div className="p-10 text-app-ink text-center">Challenge not found</div>;

  return (
    <div key={id} className="relative flex h-full flex-col overflow-hidden bg-app-bg">
      {isSubmitted && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-app-bg/90 p-6 text-center backdrop-blur-sm">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 animate-bounce">
            <PartyPopper size={48} />
          </div>
          <h2 className="mb-2 text-4xl font-semibold tracking-tight text-app-ink">Mission successful</h2>
          <p className="mb-8 max-w-md text-lg text-app-muted">The system validated your run and saved your points.</p>
          <div className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-[0.2em] text-app-accent">
            <span>Syncing results</span>
            <div className="flex space-x-1">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-app-accent" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-app-accent [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-app-accent [animation-delay:-0.3s]" />
            </div>
          </div>
        </div>
      )}

      <AITutor isOpen={isTutorOpen} onClose={() => setTutorOpen(false)} code={code} context={challenge.description} />

      <div className="flex h-16 shrink-0 items-center justify-between border-b border-app-line bg-white px-4">
        <div className="flex items-center">
          <Link to="/challenges" className="mr-2 p-2 text-app-muted transition-colors hover:text-app-ink">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-semibold tracking-tight text-app-ink">{challenge.title}</h1>
            <div className="flex items-center space-x-2 text-[10px] font-semibold uppercase tracking-widest text-app-muted">
              <span className="text-app-accent">+{challenge.points} XP</span>
              <span className="h-1 w-1 rounded-full bg-app-line" />
              <span className={`${challenge.difficulty === 'Beginner' ? 'text-emerald-600' : 'text-yellow-700'}`}>{challenge.difficulty}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setTutorOpen(true)}
            className="flex items-center rounded-full bg-app-accent-2 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          >
            <Sparkles size={14} className="mr-2" fill="white" />
            AI Mentor
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center rounded px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-yellow-700 transition-colors hover:bg-yellow-100"
          >
            <Lightbulb size={14} className="mr-1.5" />
            {showHint ? 'Hide Hints' : 'Help'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-w-0 overflow-hidden border-r border-app-line bg-white flex flex-col min-h-0" style={{ width: window.innerWidth >= 1024 ? `${leftWidth}%` : '100%' }}>
          <div className="border-b border-app-line bg-app-panel/70 p-4">
            <p className="text-left text-sm leading-relaxed text-app-muted">{challenge.description}</p>
            {showHint && (
              <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-100 p-4 text-xs italic text-yellow-900 shadow-inner">
                <div className="mb-2 flex items-start justify-between">
                  <span className="flex items-center text-[9px] font-semibold uppercase tracking-widest text-yellow-700">
                    <Lightbulb size={12} className="mr-1" /> Guidance
                  </span>
                  {challenge.hints.length > 1 && (
                    <button onClick={() => setHintIndex((prev) => (prev + 1) % challenge.hints.length)} className="text-[9px] font-semibold uppercase underline hover:text-app-ink">
                      Next tip
                    </button>
                  )}
                </div>
                {challenge.hints[hintIndex]}
              </div>
            )}
          </div>

          <div className="relative flex-1 min-h-[420px]">
            <textarea
              id="challenge-editor"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setIsReadyToSubmit(false);
                setValidationMsg(null);
              }}
              onKeyDown={handleEditorKeyDown}
              wrap="off"
              style={{ tabSize: 2 }}
              className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-[#222831] p-6 font-mono text-sm leading-relaxed text-slate-200 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-app-accent/40"
              spellCheck={false}
              placeholder="// Enter your Java code here..."
            />
          </div>
        </div>

        <div onMouseDown={startResizing} className="group hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center border-x border-app-line bg-app-bg transition-all hover:w-3 hover:bg-app-accent/10 lg:flex">
          <div className="flex h-10 w-0.5 items-center justify-center overflow-visible rounded-full bg-app-line transition-colors group-hover:bg-app-accent/40">
            <GripVertical size={12} className="-ml-0.5 text-app-muted group-hover:text-app-accent" />
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden bg-app-bg p-4" style={{ width: window.innerWidth >= 1024 ? `${100 - leftWidth}%` : '100%' }}>
          <Simulator code={code} onFinished={handleSimFinished} />
          <div className="mt-4 rounded-2xl border border-app-line bg-white p-5 shadow-sm">
            <h3 className="mb-2 flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-app-ink">
              <CheckIcon success={isReadyToSubmit} /> Status check
            </h3>

            {validationMsg && (
              <div
                className={`mb-4 flex items-start space-x-2 rounded-xl border p-3 text-xs ${
                  isReadyToSubmit ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-700'
                }`}
              >
                {isReadyToSubmit ? <CheckCircle2 size={14} className="mt-0.5" /> : <XCircle size={14} className="mt-0.5" />}
                <span className="leading-tight">{validationMsg}</span>
              </div>
            )}

            <p className="mb-5 text-[11px] leading-relaxed text-app-muted">
              {!validationMsg
                ? 'Run your OpMode in the simulator above to verify system logic.'
                : isReadyToSubmit
                  ? 'Final verification passed. Submit results.'
                  : 'Correction required. Adjust code based on telemetry feedback.'}
            </p>

            <button
              onClick={handleSubmit}
              disabled={!isReadyToSubmit}
              className={`group flex w-full items-center justify-center rounded-xl py-3.5 text-xs font-semibold uppercase tracking-widest transition-all active:scale-[0.98] ${
                isReadyToSubmit ? 'bg-app-ink text-white shadow-sm hover:bg-app-accent' : 'cursor-not-allowed border border-app-line bg-app-panel text-app-muted opacity-60'
              }`}
            >
              {isReadyToSubmit ? (
                <>
                  <Send size={14} className="mr-2" />
                  Submit results
                </>
              ) : (
                <>
                  <Lock size={14} className="mr-2 transition-colors group-hover:text-app-accent" />
                  Locked
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = ({ success }: { success: boolean }) => (
  <div className={`mr-2 flex h-5 w-5 items-center justify-center rounded-full transition-colors ${success ? 'bg-emerald-500/20 text-emerald-600' : 'bg-app-panel text-app-muted'}`}>
    <CheckCircle2 size={12} className="stroke-[3]" />
  </div>
);

export default ChallengeDetail;
