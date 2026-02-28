import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  'Personal bests & history tracking',
  'WPM trends over time',
  'Character & finger error analysis',
  'Multiple modes and word sets',
];

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '12px 16px',
  color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '14px',
  outline: 'none',
  marginBottom: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const hasPendingResult = !!localStorage.getItem('tt_pending_result');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, username, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (field: string) => ({
    borderColor: focusedField === field ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(124,109,250,0.15)' : 'none',
  });

  return (
    <div
      className="flex min-h-[calc(100vh-65px)]"
      style={{ background: 'var(--bg)' }}
    >
      {/* Left panel */}
      <div
        className="hidden md:flex flex-col justify-center px-12 relative overflow-hidden"
        style={{
          flex: '0 0 44%',
          borderRight: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(124,109,250,0.08) 0%, rgba(250,109,143,0.05) 100%)',
        }}
      >
        {/* Orb */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,109,250,0.2), transparent)',
            filter: 'blur(60px)',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-12 relative z-10" style={{ textDecoration: 'none' }}>
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

        <div className="relative z-10">
          <h2
            className="font-bold leading-tight mb-4"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: '34px', letterSpacing: '-0.03em' }}
          >
            Start your<br />journey.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Free forever.
            </span>
          </h2>
          <p
            className="mb-8"
            style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, maxWidth: '280px' }}
          >
            Create an account to save your results and track your improvement over time.
          </p>

          <div className="flex flex-col gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <div
                  className="rounded-full flex-shrink-0"
                  style={{ width: '6px', height: '6px', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
                />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center px-8 md:px-16 overflow-y-auto" style={{ flex: 1 }}>
        <div style={{ maxWidth: '340px', margin: '0 auto', width: '100%', paddingTop: '24px', paddingBottom: '24px' }}>
          <div className="mb-7">
            <h3
              className="font-bold mb-1"
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px' }}
            >
              Create account
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Join thousands of typists tracking their speed
            </p>
          </div>

          {hasPendingResult && (
            <div
              className="text-sm px-4 py-3 rounded-lg mb-5"
              style={{
                background: 'rgba(124,109,250,0.1)',
                border: '1px solid rgba(124,109,250,0.3)',
                color: 'var(--accent)',
              }}
            >
              Create an account to save your last test result.
            </div>
          )}

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg mb-5"
              style={{
                background: 'rgba(250,109,143,0.1)',
                border: '1px solid rgba(250,109,143,0.3)',
                color: 'var(--accent2)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              className="block uppercase mb-2"
              style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-muted)' }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              required
              minLength={3}
              maxLength={20}
              placeholder="typingmaster"
              style={{ ...inputStyle, ...focusStyle('username') }}
            />

            <label
              className="block uppercase mb-2"
              style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-muted)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="you@example.com"
              style={{ ...inputStyle, ...focusStyle('email') }}
            />

            <label
              className="block uppercase mb-2"
              style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-muted)' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              style={{ ...inputStyle, ...focusStyle('password') }}
            />

            <label
              className="block uppercase mb-2"
              style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-muted)' }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="••••••••"
              style={{ ...inputStyle, marginBottom: '20px', ...focusStyle('confirm') }}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold cursor-pointer border-0 transition-all mb-4"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '15px',
                padding: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent), #5c4de8)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(124,109,250,0.3)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p
            className="text-center mt-6"
            style={{ fontSize: '13px', color: 'var(--text-dim)' }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
