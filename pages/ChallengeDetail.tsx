import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Added GripVertical to the lucide-react imports
import { ArrowLeft, Lightbulb, Lock, Send, Sparkles, CheckCircle2, PartyPopper, XCircle, GripVertical } from 'lucide-react';
import { CHALLENGES, markChallengeComplete, getUserProgress } from '../services/data';
import { SimState } from '../types';
import Simulator from '../components/Simulator';
import AITutor from '../components/AITutor';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const challenge = CHALLENGES.find(c => c.id === id);
  const [code, setCode] = useState(challenge?.starterCode || "");
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isTutorOpen, setTutorOpen] = useState(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  
  const [leftWidth, setLeftWidth] = useState(55); 
  const isResizing = useRef(false);

  useEffect(() => {
    if (challenge) {
        setCode(challenge.starterCode);
        setIsReadyToSubmit(false);
        setIsSubmitted(false);
        setValidationMsg(null);
    }
  }, [id, challenge]);

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

  if (!challenge) return <div className="p-10 text-white text-center">Challenge not found</div>;

  return (
    <div key={id} className="flex flex-col h-full bg-slate-950 overflow-hidden relative">
        {isSubmitted && (
            <div className="absolute inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-500 animate-bounce">
                    <PartyPopper size={48} />
                </div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">MISSION SUCCESSFUL</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-md">The verification system has validated your code logic. Points have been updated in your profile.</p>
                <div className="flex items-center space-x-2 text-ftc-orange font-black uppercase tracking-[0.2em] text-sm">
                    <span>SYNCHRONIZING RESULTS</span>
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-ftc-orange rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-ftc-orange rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-ftc-orange rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                </div>
            </div>
        )}

        <AITutor 
            isOpen={isTutorOpen} 
            onClose={() => setTutorOpen(false)} 
            code={code} 
            context={challenge.description} 
        />

        <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center">
                <Link to="/challenges" className="p-2 text-slate-400 hover:text-white mr-2 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-white font-bold tracking-tight">{challenge.title}</h1>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-2 font-black uppercase tracking-widest">
                        <span className="text-ftc-orange">+{challenge.points} XP</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className={`${challenge.difficulty === 'Beginner' ? 'text-emerald-400' : 'text-yellow-400'}`}>{challenge.difficulty}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                 <button 
                    onClick={() => setTutorOpen(true)}
                    className="flex items-center px-4 py-1.5 text-xs font-black text-white bg-ftc-orange hover:bg-orange-600 rounded-full transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                 >
                    <Sparkles size={14} className="mr-2" fill="white" />
                    AI MENTOR
                 </button>
                 <button 
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:bg-yellow-500/10 rounded transition-colors"
                 >
                    <Lightbulb size={14} className="mr-1.5" />
                    {showHint ? 'Hide Hints' : 'Help'}
                 </button>
            </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <div 
              className="flex flex-col border-r border-slate-800 min-w-0 bg-slate-900/50 overflow-hidden"
              style={{ width: window.innerWidth >= 1024 ? `${leftWidth}%` : '100%' }}
            >
                <div className="p-4 bg-slate-900/80 border-b border-slate-800">
                    <p className="text-sm text-slate-300 leading-relaxed text-left">{challenge.description}</p>
                    {showHint && (
                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-100 italic animate-in slide-in-from-top-2 duration-300 shadow-inner">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-black text-[9px] uppercase tracking-widest text-yellow-500 flex items-center">
                                    <Lightbulb size={12} className="mr-1" /> Guidance System
                                </span>
                                {challenge.hints.length > 1 && (
                                    <button 
                                        onClick={() => setHintIndex((prev) => (prev + 1) % challenge.hints.length)}
                                        className="text-[9px] font-black underline hover:text-white uppercase"
                                    >
                                        Next Tip
                                    </button>
                                )}
                            </div>
                            {challenge.hints[hintIndex]}
                        </div>
                    )}
                </div>
                <div className="flex-1 relative">
                    <textarea 
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value);
                            setIsReadyToSubmit(false);
                            setValidationMsg(null);
                        }}
                        className="absolute inset-0 w-full h-full bg-[#0d1117] text-slate-300 font-mono text-sm p-6 resize-none focus:outline-none focus:ring-1 focus:ring-inset focus:ring-ftc-blue/30 leading-relaxed"
                        spellCheck={false}
                        placeholder="// Enter your Java code here..."
                    />
                </div>
            </div>

            <div 
              onMouseDown={startResizing}
              className="hidden lg:flex group items-center justify-center w-1.5 hover:w-3 bg-slate-950 hover:bg-ftc-orange/10 cursor-col-resize transition-all shrink-0 border-x border-slate-800/50"
            >
              <div className="w-0.5 h-10 bg-slate-800 group-hover:bg-ftc-orange/40 rounded-full transition-colors flex items-center justify-center overflow-visible">
                <GripVertical size={12} className="text-slate-600 group-hover:text-ftc-orange -ml-0.5" />
              </div>
            </div>

            <div 
              className="flex-1 flex flex-col bg-slate-950 p-4 min-w-0 overflow-hidden"
              style={{ width: window.innerWidth >= 1024 ? `${100 - leftWidth}%` : '100%' }}
            >
                <Simulator code={code} onFinished={handleSimFinished} />
                <div className="mt-4 p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
                    <h3 className="text-xs font-black text-white mb-2 flex items-center uppercase tracking-[0.2em]">
                        <CheckIcon success={isReadyToSubmit} /> Status Check
                    </h3>
                    
                    {validationMsg && (
                         <div className={`text-xs p-3 rounded-xl mb-4 flex items-start space-x-2 animate-in slide-in-from-top-1 ${
                             isReadyToSubmit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                         }`}>
                             {isReadyToSubmit ? <CheckCircle2 size={14} className="mt-0.5" /> : <XCircle size={14} className="mt-0.5" />}
                             <span className="leading-tight">{validationMsg}</span>
                         </div>
                    )}

                    <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">
                        {!validationMsg ? "Run your OpMode in the controller above to verify the system logic." : isReadyToSubmit ? "Final verification passed. Proceed to data submission." : "Correction required. Adjust your code based on the telemetry feedback."}
                    </p>
                    <button 
                        onClick={handleSubmit}
                        disabled={!isReadyToSubmit}
                        className={`w-full py-3.5 rounded-xl text-xs font-black transition-all flex justify-center items-center group active:scale-[0.98] tracking-widest uppercase ${
                            isReadyToSubmit 
                            ? 'bg-ftc-blue hover:bg-blue-600 text-white shadow-xl shadow-blue-900/30' 
                            : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-60'
                        }`}
                    >
                        {isReadyToSubmit ? (
                            <>
                                <Send size={14} className="mr-2" /> 
                                SUBMIT RESULTS
                            </>
                        ) : (
                            <>
                                <Lock size={14} className="mr-2 group-hover:text-ftc-orange transition-colors" /> 
                                LOCKED
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
    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 transition-colors ${success ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
        <CheckCircle2 size={12} className="stroke-[3]" />
    </div>
);

export default ChallengeDetail;