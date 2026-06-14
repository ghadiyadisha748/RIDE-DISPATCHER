import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navigation, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ navItems }) {
  const { user, logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };
  const displayName = user?.name || 'User';
  const initials    = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className={`relative flex flex-col h-full bg-dark-surface border-r border-dark-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center gap-2 p-4 border-b border-dark-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand shrink-0">
          <Navigation className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-display font-bold text-sm text-white whitespace-nowrap">RIDE-DISPATCHER</span>}
      </div>
      <button onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-gray-400 hover:text-white z-10 shadow-card">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} id={`nav-${item.label.toLowerCase().replace(/\s/g,'-')}`}
              className={`${active ? 'sidebar-item-active' : 'sidebar-item'} ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}>
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-dark-border">
        <div className={`flex items-center gap-3 p-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{displayName}</div>
              <div className="text-xs text-gray-500 truncate capitalize">{user?.role}</div>
            </div>
          )}
        </div>
        <button onClick={handleLogout} id="sidebar-logout"
          className={`sidebar-item w-full mt-1 text-danger-500 hover:bg-danger-500/10 ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
