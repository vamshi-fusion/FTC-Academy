import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, X, BrainCircuit, MessageSquare, Loader2 } from 'lucide-react';

interface AITutorProps {
  code: string;
  context: string;
  isOpen: boolean;
  onClose: () => void;
}

const AITutor: React.FC<AITutorProps> = ({ code, context, isOpen, onClose }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askTutor = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const apiKey =
        process.env.VITE_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.API_KEY;

      if (!apiKey) {
        setResponse('Missing API key. Add `VITE_GEMINI_API_KEY=...` to your `.env` file and restart `npm run dev`.');
        return;
      }

      const modelName = process.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are an expert FIRST Tech Challenge (FTC) robot programming mentor for middle school students.
        The student is working on this challenge: "${context}".
        Their current Java code is:
        \`\`\`java
        ${code}
        \`\`\`
        
        Please analyze their code. If there are errors, explain them simply. If the code is good, suggest one way to make it even better or explain a robotics concept related to it (like power curves or timing).
        Keep your response encouraging, concise (max 150 words), and do not use emojis.
        Format your response in Markdown.
      `;

      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      setResponse(result.text || "I'm sorry, I couldn't process that. Try again!");
    } catch (error: any) {
      const details =
        error?.message ||
        error?.error?.message ||
        'Unknown AI request error.';
      setResponse(`AI request failed: ${details}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 lg:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center text-ftc-orange">
            <BrainCircuit size={20} className="mr-2" />
            <h2 className="font-bold">AI Robot Tutor</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400">
            <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                <MessageSquare size={12} className="mr-2" /> Current Code
            </h3>
            <pre className="text-[10px] font-mono text-slate-300 overflow-hidden line-clamp-4 italic">
                {code || "// No code yet..."}
            </pre>
        </div>

        {!response && !loading && (
            <div className="text-center py-10">
                <div className="w-16 h-16 bg-ftc-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-ftc-orange" size={32} />
                </div>
                <h3 className="text-white font-bold mb-2">Stuck on your program?</h3>
                <p className="text-slate-400 text-sm mb-6 px-4">Our AI tutor can check your logic and suggest improvements!</p>
                <button 
                    onClick={askTutor}
                    className="px-6 py-2.5 bg-ftc-orange hover:bg-orange-600 text-white rounded-full font-bold transition-all shadow-lg shadow-orange-900/20"
                >
                    Review My Code
                </button>
            </div>
        )}

        {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-sm font-medium">Analyzing your robot brain...</p>
            </div>
        )}

        {response && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed prose prose-invert prose-sm max-w-none">
                    {response.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                    ))}
                </div>
                <button 
                    onClick={() => {setResponse(null); askTutor();}}
                    className="text-xs text-ftc-orange font-bold hover:underline"
                >
                    Ask again?
                </button>
            </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-[10px] text-slate-500 text-center italic">
        Powered by Google Gemini
      </div>
    </div>
  );
};

export default AITutor;
