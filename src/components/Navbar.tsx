import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTestSettings } from '../context/TestSettingsContext';
import type { Mode, Language } from '../context/TestSettingsContext';
import { LogOut, User } from 'lucide-react';

const MODES: Mode[] = ['15', '30', '60', 'words', 'zen'];
const LANGUAGES: Language[] = ['english', 'code', 'quotes', 'tharoor', 'potter-head', 'abusive'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { mode, language, setMode, setLanguage } = useTestSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setShowThemeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/');
  };

  return (
    <nav
      className="flex items-center justify-between px-8 py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
        >
          ⌨
        </div>
        <span
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          TypeTester
        </span>
      </Link>

      {/* Center: mode pills — only on home */}
      {isHome && (
        <div
          className="flex gap-1 rounded-full p-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
        >
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-4 py-1.5 rounded-full text-xs cursor-pointer border-0 transition-all"
              style={{
                fontFamily: 'Space Mono, monospace',
                ...(m === mode
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'transparent', color: 'var(--text-muted)' }),
              }}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme dropdown — only on home */}
        {isHome && (
          <div ref={themeDropdownRef} className="relative">
            <button
              onClick={() => setShowThemeDropdown(p => !p)}
              className="px-4 py-1.5 rounded-lg text-xs cursor-pointer border-0 transition-all"
              style={{
                fontFamily: 'Space Mono, monospace',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
              }}
            >
              Theme
            </button>

            {showThemeDropdown && (
              <div
                className="absolute left-0 top-10 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  minWidth: '140px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                }}
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowThemeDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '13px',
                      background: lang === language ? 'rgba(124,109,250,0.15)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: lang === language ? 'var(--accent)' : 'var(--text-muted)',
                      fontFamily: 'Space Mono, monospace',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (lang !== language) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = lang === language ? 'rgba(124,109,250,0.15)' : 'transparent';
                    }}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {user ? (
          <div ref={dropdownRef} className="relative">
            {/* Avatar button */}
            <button
              onClick={() => setShowDropdown(p => !p)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer border-0"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                color: '#fff',
                fontFamily: 'Syne, sans-serif',
              }}
              title={user.username}
            >
              {user.username.slice(0, 2).toUpperCase()}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div
                className="absolute right-0 top-10 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  minWidth: '180px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                }}
              >
                {/* User info header */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="font-bold text-sm truncate" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                    {user.username}
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'Space Mono, monospace' }}>
                    {user.email}
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <User size={14} />
                  Profile
                </Link>

                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px', fontSize: '13px', width: '100%',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--accent2)', fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(250,109,143,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #5c4de8)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(124,109,250,0.3)',
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
