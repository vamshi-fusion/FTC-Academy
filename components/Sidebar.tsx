import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Trophy, BookMarked, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean; // Mobile open/close
  toggle: () => void; // Mobile toggle
  isCollapsed: boolean; // Desktop collapse/expand
  setCollapsed: (val: boolean) => void; // Desktop toggle
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, isCollapsed, setCollapsed }) => {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lessons', icon: BookOpen, label: 'Lessons' },
    { to: '/challenges', icon: Trophy, label: 'Challenges' },
    { to: '/resources', icon: BookMarked, label: 'Resources' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full bg-slate-900 border-r border-slate-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className={`h-16 flex items-center px-4 border-b border-slate-800 shrink-0 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-ftc-orange to-ftc-blue rounded-md shrink-0 shadow-lg shadow-ftc-orange/20"></div>
            {!isCollapsed && (
              <span className="ml-3 font-bold text-xl tracking-tight text-white whitespace-nowrap overflow-hidden animate-in fade-in duration-500">
                FTC Academy
              </span>
            )}
            <button className="ml-auto lg:hidden text-slate-400" onClick={toggle}>
                <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => window.innerWidth < 1024 && toggle()}
                title={isCollapsed ? link.label : ''}
                className={({ isActive }) =>
                  `flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
                    isCollapsed ? 'justify-center p-3' : 'px-3 py-3'
                  } ${
                    isActive
                      ? 'bg-ftc-blue/10 text-ftc-blue shadow-[inset_0_0_0_1px_rgba(0,102,179,0.2)]'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <link.icon className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2">{link.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Footer & Collapse Toggle */}
          <div className="mt-auto border-t border-slate-800">
            {!isCollapsed && (
              <div className="p-4 text-xs text-slate-500 text-center animate-in fade-in duration-300">
                <p>Powered by Team Fusion</p>
                <a href="https://theteamfusion.com" target="_blank" rel="noreferrer" className="hover:text-ftc-orange transition-colors">theteamfusion.com</a>
              </div>
            )}
            
            <button 
              onClick={() => setCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center p-4 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors border-t border-slate-800/50"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={20} /> : (
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest">
                  <ChevronLeft size={18} />
                  <span>Collapse</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;