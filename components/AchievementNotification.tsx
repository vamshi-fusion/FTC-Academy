import React, { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);
  const DURATION = 3000;

  useEffect(() => {
    // Entry transition
    const timer = setTimeout(() => setVisible(true), 50);
    
    // Auto-close timer
    const closeTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Wait for exit animation
    }, DURATION);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div 
      className={`relative w-80 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-out transform ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
      }`}
    >
      <div className="p-4 flex items-center space-x-4">
        <div className="w-12 h-12 bg-ftc-orange/10 rounded-xl flex items-center justify-center text-3xl shadow-inner">
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black text-ftc-orange uppercase tracking-[0.2em] mb-0.5">Unlocked!</div>
          <h4 className="text-white font-bold truncate text-sm">{achievement.title}</h4>
          <p className="text-[10px] text-slate-400 truncate leading-tight">{achievement.description}</p>
        </div>
        <button onClick={() => setVisible(false)} className="text-slate-600 hover:text-white transition-colors p-1">
          <X size={14} />
        </button>
      </div>

      {/* Shrinking Countdown Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-ftc-orange/10 w-full">
        <div 
          className="h-full bg-ftc-orange transition-all duration-[3000ms] ease-linear origin-left"
          style={{ width: visible ? '0%' : '100%' }}
        />
      </div>
    </div>
  );
};

export const AchievementManager: React.FC = () => {
  const [queue, setQueue] = useState<Achievement[]>([]);

  useEffect(() => {
    const handleAchievement = (e: any) => {
      const achievement = e.detail as Achievement;
      setQueue(prev => [...prev, achievement]);
    };

    window.addEventListener('achievement_unlocked', handleAchievement);
    return () => window.removeEventListener('achievement_unlocked', handleAchievement);
  }, []);

  const removeFirst = () => {
    setQueue(prev => prev.slice(1));
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col space-y-3 pointer-events-none">
      {queue.map((achievement, index) => (
        <div key={`${achievement.id}-${index}`} className="pointer-events-auto">
          <AchievementToast 
            achievement={achievement} 
            onClose={removeFirst} 
          />
        </div>
      ))}
    </div>
  );
};