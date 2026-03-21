import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Menu, X, Activity, ServerCrash } from 'lucide-react';
import { getPipelineStatus } from '../services/api';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState({ mode: 'demo' });

  useEffect(() => {
    setPipelineStatus(getPipelineStatus());
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Don't show navbar on dashboard pages (they have their own header)
  const isDashboard = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/watchlist') ||
    location.pathname.startsWith('/settings');
  if (isDashboard) return null;

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <Building2 size={20} />
          </div>
          <span className="navbar__logo-text">PermitWatch</span>
          <span className="navbar__logo-badge">AI</span>
          
          <div className={`navbar__status-badge navbar__status-badge--${pipelineStatus.mode}`}>
            {pipelineStatus.mode === 'live' ? (
              <><Activity size={12} className="pulse" /> Live Data</>
            ) : (
              <><ServerCrash size={12} /> Demo Mode</>
            )}
          </div>
        </Link>

        <div className="navbar__links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          <Link to="/login" className="btn btn-ghost">
            Sign In
          </Link>
          <Link to="/login" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        <button
          className="navbar__mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile-menu glass-heavy"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="navbar__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="navbar__mobile-actions">
              <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
