import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu, ExternalLink, Book, Users, Cpu, PenTool, Layout, Globe, Youtube, Settings, Library, Target } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LessonDetail from './pages/LessonDetail';
import ChallengeDetail from './pages/ChallengeDetail';
import { AchievementManager } from './components/AchievementNotification';
import { LESSONS, CHALLENGES } from './services/data';
import { Link } from 'react-router-dom';

const ScrollToTop = ({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLElement | null> }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pathname, scrollContainerRef]);

  return null;
};

const LayoutWrapper: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="min-h-screen flex bg-[#0f172a]">
      <ScrollToTop scrollContainerRef={mainRef} />
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={() => setSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
      />
      
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="lg:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-2 -ml-2">
            <Menu size={24} />
          </button>
          <span className="ml-2 font-black text-white tracking-tight uppercase text-xs">FTC Academy</span>
        </div>

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Global Notifications Layer */}
      <AchievementManager />
    </div>
  );
};

const LessonList: React.FC = () => (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
        <header className="mb-10">
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight uppercase">Training Path</h1>
            <p className="text-slate-400">Step-by-step engineering training for modern robotics.</p>
        </header>
        <div className="grid gap-4">
            {LESSONS.map(l => (
                <Link key={l.id} to={`/lessons/${l.id}`} className="block group">
                    <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl hover:border-ftc-blue transition-all hover:translate-x-1 flex items-center shadow-xl">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-6 shrink-0 transition-all shadow-inner ${
                            l.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' : 
                            l.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            <span className="font-black text-xl">{l.order}</span>
                        </div>
                        <div className="flex-1">
                             <div className="flex items-center space-x-3 mb-1">
                                <span className="text-ftc-orange text-[9px] font-black uppercase tracking-[0.2em]">{l.category}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span className="text-slate-500 text-[10px] font-bold">{l.durationMinutes} MIN</span>
                             </div>
                             <h3 className="text-xl font-black text-white group-hover:text-ftc-blue transition-colors tracking-tight">{l.title}</h3>
                             <p className="text-slate-400 mt-1 text-xs line-clamp-1">{l.description}</p>
                        </div>
                        <div className="ml-4 text-slate-700 group-hover:text-ftc-blue transition-colors">
                            <ExternalLink size={18} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
);

const ChallengeList: React.FC = () => (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
        <header className="mb-10">
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight uppercase">Field Ops</h1>
            <p className="text-slate-400">Test your logic in a sandbox field simulator.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CHALLENGES.map(c => (
                <Link key={c.id} to={`/challenges/${c.id}`} className="block bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden hover:border-ftc-orange transition-all hover:-translate-y-1 shadow-2xl">
                    <div className="p-8">
                         <div className="flex justify-between items-start mb-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                c.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                c.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                                {c.difficulty}
                            </span>
                            <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-2 py-1 rounded uppercase tracking-tighter">{c.points} XP</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{c.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-8">{c.description}</p>
                        <div className="pt-4 border-t border-slate-800 flex items-center text-ftc-orange text-[10px] font-black uppercase tracking-[0.2em]">
                            <span>Launch Controller</span>
                            <Cpu size={14} className="ml-2" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
);

const ResourceCard = ({ title, desc, link, icon: Icon, color }: any) => (
    <a href={link} target="_blank" rel="noreferrer" className="group block bg-[#1e293b] border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-600 hover:shadow-2xl hover:bg-slate-800/80">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-inner ${color}`}>
            <Icon size={24} />
        </div>
        <h3 className="text-lg font-black text-white mb-2 group-hover:text-ftc-blue transition-colors flex items-center tracking-tight">
            {title} <ExternalLink size={14} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
    </a>
);

const Resources: React.FC = () => (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-24">
        <header className="mb-12 relative overflow-hidden p-12 bg-gradient-to-br from-[#1e293b] to-slate-950 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="relative z-10">
                <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">ENGINEERING <span className="text-ftc-blue">KITS</span></h1>
                <p className="text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">
                    A curated collection of industry-standard documentation and community-driven tools.
                </p>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                <Settings size={220} className="animate-[spin_12s_linear_infinite]" />
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-3">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center">
                    <span className="w-8 h-[2px] bg-slate-800 mr-4"></span>
                    <Book size={16} className="mr-3 text-ftc-orange" /> KNOWLEDGE BASE
                    <span className="flex-1 h-[2px] bg-slate-800 ml-4"></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ResourceCard title="FTC Docs" desc="Official technical documentation." link="https://ftc-docs.firstinspires.org" icon={Globe} color="bg-blue-500/10 text-blue-500" />
                    <ResourceCard title="Game Manual 0" desc="Community bible for FTC strategy." link="https://gm0.org" icon={Book} color="bg-orange-500/10 text-orange-500" />
                    <ResourceCard title="FTC SDK" desc="Official Robot Controller source code." link="https://github.com/FIRST-Tech-Challenge/FtcRobotController" icon={Cpu} color="bg-purple-500/10 text-purple-500" />
                </div>
            </section>
        </div>
    </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LayoutWrapper />}>
          <Route index element={<Dashboard />} />
          <Route path="lessons" element={<LessonList />} />
          <Route path="lessons/:id" element={<LessonDetail />} />
          <Route path="challenges" element={<ChallengeList />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="resources" element={<Resources />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;