import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loginUser, signupUser } from '../services/api';
import './Login.css';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@permitwatch.ai');
  const [password, setPassword] = useState('demo123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isSignup
        ? await signupUser(name, email, password)
        : await loginUser(email, password);
      dispatch({ type: 'SET_USER', payload: res.user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__bg">
        <div className="login-page__orb login-page__orb--1" />
        <div className="login-page__orb login-page__orb--2" />
      </div>

      <motion.div
        className="login-card glass-heavy"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className="login-card__header">
          <div className="login-card__logo">
            <Building2 size={22} />
          </div>
          <h1 className="login-card__title">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="login-card__subtitle">
            {isSignup
              ? 'Start discovering construction opportunities'
              : 'Sign in to your PermitWatch AI account'}
          </p>
        </div>

        {error && (
          <div className="login-card__error">{error}</div>
        )}

        <form className="login-card__form" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="login-card__field">
              <label className="login-card__label">Full Name</label>
              <div className="login-card__input-wrap">
                <User size={16} />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="login-card__field">
            <label className="login-card__label">Email</label>
            <div className="login-card__input-wrap">
              <Mail size={16} />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-card__field">
            <label className="login-card__label">Password</label>
            <div className="login-card__input-wrap">
              <Lock size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                className="login-card__pw-toggle"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg login-card__submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : isSignup ? 'Create Account' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-card__footer">
          <span>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            className="login-card__toggle"
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className="login-card__demo-hint">
          <span>Demo credentials pre-filled — just click Sign In</span>
        </div>
      </motion.div>
    </div>
  );
}
