import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Award, BookOpen, ArrowRight, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { LESSONS, CHALLENGES, ACHIEVEMENTS, getUserProgress, getTotalPossiblePoints } from '../services/data';

const Dashboard: React.FC = () => {
  const [progress, setProgress] = useState(getUserProgress());
  const totalPossiblePoints = getTotalPossiblePoints();
  
  useEffect(() => {
    const handleUpdate = () => setProgress(getUserProgress());
    window.addEventListener('progress_updated', handleUpdate);
    return () => window.removeEventListener('progress_updated', handleUpdate);
  }, []);

  const completedCount = Object.keys(progress.lessons).length;
  const totalLessons = LESSONS.length;
  const nextLesson = LESSONS.find(l => !progress.lessons[l.id]);
  const pointPercentage = Math.min(100, (progress.points / (totalPossiblePoints || 1)) * 100);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back, Engineer!</h1>
          <p className="text-slate-400">Your software systems are initialized and ready.</p>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shadow-2xl">
            <div className="p-3 bg-ftc-orange/10 rounded-xl text-ftc-orange">
                <Trophy size={28} />
            </div>
            <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery XP</div>
                <div className="text-2xl font-black text-white">{progress.points} <span className="text-slate-600 font-normal">/ {totalPossiblePoints}</span></div>
            </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
            <Star size={14} className="mr-2 text-yellow-500 fill-yellow-500" /> Training Progress
          </h3>
          <span className="text-xs font-mono text-slate-400">{Math.round(pointPercentage)}% Mastery</span>
        </div>
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-700/50 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-ftc-blue via-cyan-400 to-ftc-orange rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,102,179,0.2)]"
            style={{ width: `${pointPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Next Lesson Call to Action */}
          {nextLesson ? (
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group border-l-4 border-l-ftc-blue transition-all hover:translate-y-[-2px]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <PlayCircle size={14} className="mr-2 text-ftc-blue" /> Recommended Task
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded font-black uppercase tracking-tighter">{nextLesson.category}</span>
                </div>
                <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="text-ftc-orange text-[10px] font-black uppercase tracking-[0.3em] mb-2">Lesson {nextLesson.order}</div>
                        <h3 className="text-2xl font-black text-white mb-2 group-hover:text-ftc-blue transition-colors tracking-tight">{nextLesson.title}</h3>
                        <p className="text-slate-400 max-w-lg leading-relaxed text-sm">{nextLesson.description}</p>
                    </div>
                    <Link 
                        to={`/lessons/${nextLesson.id}`}
                        className="flex items-center px-10 py-4 bg-white text-[#0f172a] rounded-xl font-black hover:bg-slate-200 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                    >
                        START MISSION <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
              </div>
          ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-2xl text-center shadow-inner">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Curriculum Complete!</h2>
                  <p className="text-slate-400">You've mastered all current training modules. Push the limits in the Field Challenges arena.</p>
              </div>
          )}

          {/* Achievements Section */}
          <section>
            <h2 className="text-lg font-black text-white mb-6 flex items-center tracking-tight">
              <Award size={20} className="mr-2 text-ftc-orange" /> Badges & Achievements
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map(achievement => {
                const isUnlocked = progress.unlockedAchievements.includes(achievement.id);
                return (
                  <div 
                    key={achievement.id}
                    className={`p-5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      isUnlocked 
                      ? 'bg-[#1e293b] border-slate-700 shadow-xl opacity-100 scale-100' 
                      : 'bg-slate-900/30 border-slate-800 opacity-40 grayscale blur-[0.5px]'
                    }`}
                  >
                    <div className="text-4xl mb-3 drop-shadow-lg">{achievement.icon}</div>
                    <h4 className="text-xs font-black text-white mb-1 leading-tight tracking-tighter">{achievement.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
           <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6">Efficiency Stats</h3>
              <div className="space-y-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Lessons Done</span>
                    <span className="text-white font-mono font-bold">{completedCount} / {totalLessons}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Challenges Met</span>
                    <span className="text-white font-mono font-bold">{Object.keys(progress.challenges).length} / {CHALLENGES.length}</span>
                  </div>
                  <div className="h-px bg-slate-800 my-2" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Status</span>
                    <span className="px-2 py-0.5 bg-ftc-blue/20 text-ftc-blue rounded text-[10px] font-black uppercase tracking-widest">
                      {progress.points > 100 ? 'Expert' : progress.points > 30 ? 'Engineer' : 'Rookie'}
                    </span>
                  </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-ftc-blue/20 to-[#0f172a] border border-ftc-blue/30 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-ftc-blue/10 group-hover:scale-110 transition-transform duration-1000">
                <Star size={120} strokeWidth={3} />
              </div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest mb-2 flex items-center">
                <Star size={14} className="mr-2 text-yellow-500 fill-yellow-500" /> Daily Focus
              </h3>
              <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
                Complete <span className="text-white font-black">2 challenges</span> today to earn the "Fast Learner" badge.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;