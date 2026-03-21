import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Bookmark,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  Code2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPipelineStatus } from '../services/api';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/watchlist', icon: Bookmark, label: 'Watchlist' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const collapsed = !state.isSidebarOpen;
  const pipelineStatus = getPipelineStatus();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  return (
    <motion.aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      initial={{ x: -280 }}
      animate={{ x: 0, width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="sidebar__header">
        <div className="sidebar__logo" onClick={() => navigate('/')}>
          <div className="sidebar__logo-icon">
            <Building2 size={18} />
          </div>
          {!collapsed && (
            <motion.div
              className="sidebar__logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="sidebar__logo-name">PermitWatch</span>
              <span className="sidebar__logo-badge">AI</span>
            </motion.div>
          )}
        </div>

        <button
          className="sidebar__toggle"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
            }
          >
            <item.icon size={20} />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__branding">
        {!collapsed ? (
          <motion.div 
            className="sidebar__branding-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="branding-badge">
              <Code2 size={13} className="text-lovable" />
              <span>Built on Lovable</span>
            </div>
            <div className={`branding-badge ${pipelineStatus.apifyConfigured ? 'branding-badge--active' : ''}`}>
              <Database size={13} className={pipelineStatus.apifyConfigured ? 'text-apify' : ''} />
              <span>Powered by Apify</span>
            </div>
          </motion.div>
        ) : (
          <div className="sidebar__branding-collapsed">
            <Code2 size={14} className="text-lovable" />
          </div>
        )}
      </div>

      <div className="sidebar__footer">
        {!collapsed && state.user && (
          <motion.div
            className="sidebar__user"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="sidebar__user-avatar">
              {state.user.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{state.user.name}</span>
              <span className="sidebar__user-plan">{state.user.plan} plan</span>
            </div>
          </motion.div>
        )}
        <button className="sidebar__nav-item sidebar__logout" onClick={handleLogout}>
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
