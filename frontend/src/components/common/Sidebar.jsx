import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

/**
 * Generic Sidebar Component
 * Props:
 *   logo       – ReactNode (logo element)
 *   navItems   – [{ icon: ReactNode, label: string, path: string }]
 *   userInfo   – { name, role, avatarInitial }
 *   onLogout   – function
 */
export default function Sidebar({ logo, navItems = [], userInfo = {}, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={`sidebar z-40 transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-dark-border ${collapsed ? 'justify-center' : ''}`}>
        {collapsed ? (
          <span className="text-brand-500 font-black text-xl">R</span>
        ) : (
          logo || <span className="text-gradient font-display font-black text-xl">RIDE-DISPATCHER</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              isActive ? 'sidebar-item-active flex items-center gap-3' : 'sidebar-item flex items-center gap-3'
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-dark-border p-3 space-y-2">
        {!collapsed && userInfo.name && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userInfo.avatarInitial || userInfo.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{userInfo.name}</p>
              <p className="text-xs text-gray-400 capitalize">{userInfo.role}</p>
            </div>
          </div>
        )}
        <button
          id="sidebar-logout-btn"
          onClick={onLogout}
          className="sidebar-item w-full text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        id="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-dark-surface border border-dark-border text-gray-400 hover:text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-dark-card z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
