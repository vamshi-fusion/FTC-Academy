import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookMarked, BookOpen, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Trophy, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  isCollapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, isCollapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lessons', icon: BookOpen, label: 'Lessons' },
    { to: '/challenges', icon: Trophy, label: 'Challenges' },
    { to: '/resources', icon: BookMarked, label: 'Resources' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={toggle}
      />

      <aside
        className={`fixed left-0 top-0 z-40 h-full border-r border-app-line bg-white transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'w-24' : 'w-72'}`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className={`flex h-16 items-center border-b border-app-line ${isCollapsed ? 'justify-center px-2' : 'px-5'}`}>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-app-accent text-sm font-bold text-white">FT</div>
            {!isCollapsed && <span className="ml-3 text-base font-semibold tracking-tight">FTC Academy</span>}
            <button className="ml-auto text-app-muted lg:hidden" onClick={toggle}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => window.innerWidth < 1024 && toggle()}
                title={isCollapsed ? link.label : ''}
                className={({ isActive }) =>
                  `flex items-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'border-app-accent/40 bg-app-accent/10 text-app-accent'
                      : 'border-transparent text-app-muted hover:border-app-line hover:bg-app-panel hover:text-app-ink'
                  }`
                }
              >
                <link.icon size={18} className={`${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-app-line p-3">
            {!isCollapsed && user && (
              <div className="mb-3 rounded-xl border border-app-line bg-app-panel p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-app-muted">Signed in</p>
                <p className="mt-1 truncate text-sm font-semibold text-app-ink">{user.name}</p>
                <p className="truncate text-xs text-app-muted">{user.isGuest ? 'Guest session' : user.email}</p>
              </div>
            )}

            <button
              onClick={logout}
              className={`mb-2 inline-flex w-full items-center justify-center rounded-xl border border-app-line px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-app-muted transition-colors hover:border-app-accent hover:text-app-accent ${
                isCollapsed ? 'h-11' : ''
              }`}
              title="Log Out"
            >
              <LogOut size={16} className={`${isCollapsed ? '' : 'mr-2'}`} />
              {!isCollapsed && 'Log out'}
            </button>

            <button
              onClick={() => setCollapsed(!isCollapsed)}
              className="inline-flex w-full items-center justify-center rounded-xl border border-app-line px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-app-muted transition-colors hover:border-app-accent hover:text-app-accent"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} className="mr-2" /> Collapse</>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
