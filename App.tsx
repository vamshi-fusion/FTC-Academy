import React, { useEffect, useRef, useState } from 'react';
import { HashRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Book, Compass, Cpu, Globe, Menu, Moon, Sparkles, Sun } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LessonDetail from './pages/LessonDetail';
import ChallengeDetail from './pages/ChallengeDetail';
import AuthPage from './pages/Auth';
import { AchievementManager } from './components/AchievementNotification';
import { LESSONS, CHALLENGES } from './services/data';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ScrollToTop = ({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLElement | null> }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pathname, scrollContainerRef]);

  return null;
};

type Theme = 'light' | 'dark';
const THEME_KEY = 'ftc_theme_v1';

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
};

const PublicOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const LayoutWrapper: React.FC<{ theme: Theme; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="min-h-screen bg-app-bg text-app-ink">
      <ScrollToTop scrollContainerRef={mainRef} />
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
        <div className="sticky top-0 z-20 border-b border-app-line bg-app-bg/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-xl border border-app-line p-2 text-app-ink">
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-app-muted">
              <Sparkles size={14} className="text-app-accent" />
              Training Interface
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-app-line px-3 py-1.5 text-xs font-semibold text-app-ink transition-colors hover:border-app-accent hover:text-app-accent"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <Link to="/resources" className="inline-flex items-center gap-2 rounded-full border border-app-line px-3 py-1.5 text-xs font-semibold text-app-ink hover:border-app-accent hover:text-app-accent transition-colors">
                Resource Stack <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <main ref={mainRef} className="h-[calc(100vh-4rem)] overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <AchievementManager />
    </div>
  );
};

const LessonList: React.FC = () => (
  <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <header className="mb-8 sm:mb-10">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-app-muted">Curriculum</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Build your robotics software foundation</h1>
    </header>

    <div className="grid gap-4 sm:gap-5">
      {LESSONS.map((lesson) => (
        <Link key={lesson.id} to={`/lessons/${lesson.id}`} className="group rounded-2xl border border-app-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-app-accent hover:shadow-lg">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-app-panel text-sm font-bold text-app-ink">
              {lesson.order}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-app-muted">
                <span>{lesson.category}</span>
                <span className="h-1 w-1 rounded-full bg-app-line" />
                <span>{lesson.durationMinutes} min</span>
                <span className="h-1 w-1 rounded-full bg-app-line" />
                <span>{lesson.difficulty}</span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-app-ink group-hover:text-app-accent sm:text-xl">{lesson.title}</h3>
              <p className="mt-1 text-sm text-app-muted">{lesson.description}</p>
            </div>
            <ArrowUpRight className="shrink-0 text-app-muted transition-colors group-hover:text-app-accent" size={18} />
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const ChallengeList: React.FC = () => (
  <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <header className="mb-8 sm:mb-10">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-app-muted">Arena</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Put your logic under match pressure</h1>
    </header>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {CHALLENGES.map((challenge) => (
        <Link key={challenge.id} to={`/challenges/${challenge.id}`} className="group rounded-2xl border border-app-line bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-app-accent hover:shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <span className="rounded-full bg-app-panel px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-app-muted">{challenge.difficulty}</span>
            <span className="rounded-full border border-app-line px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-app-ink">{challenge.points} XP</span>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-app-ink group-hover:text-app-accent">{challenge.title}</h3>
          <p className="mt-2 text-sm text-app-muted">{challenge.description}</p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-app-accent">
            Launch simulator <Cpu size={14} />
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const ResourceCard = ({
  title,
  desc,
  link,
  icon: Icon,
}: {
  title: string;
  desc: string;
  link: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <a href={link} target="_blank" rel="noreferrer" className="group rounded-2xl border border-app-line bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-app-accent hover:shadow-lg">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-app-panel text-app-accent">
      <Icon size={22} />
    </div>
    <h3 className="text-lg font-semibold tracking-tight text-app-ink group-hover:text-app-accent">{title}</h3>
    <p className="mt-2 text-sm text-app-muted">{desc}</p>
  </a>
);

const Resources: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <header className="relative overflow-hidden rounded-3xl border border-app-line bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-app-accent/10 blur-3xl" />
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-app-muted">Resources</p>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Professional references for builders, programmers, and drive teams</h1>
    </header>

    <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <ResourceCard title="FTC Docs" desc="Official technical documentation and getting started guides." link="https://ftc-docs.firstinspires.org" icon={Globe} />
      <ResourceCard title="Game Manual 0" desc="Community-curated explanations of mechanisms, strategy, and controls." link="https://gm0.org" icon={Book} />
      <ResourceCard title="FTC SDK" desc="Source code and release notes for robot controller development." link="https://github.com/FIRST-Tech-Challenge/FtcRobotController" icon={Compass} />
    </section>
  </div>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicOnly>
                <AuthPage />
              </PublicOnly>
            }
          />

          <Route
            path="/"
            element={
              <RequireAuth>
                <LayoutWrapper theme={theme} toggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))} />
              </RequireAuth>
            }
          >
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
    </AuthProvider>
  );
};

export default App;
