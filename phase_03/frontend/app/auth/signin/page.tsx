'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '../../../lib/auth-client';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../../lib/toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await authClient.getSession();
      if (data?.session) router.push('/dashboard');
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/dashboard',
      });
      if (authError) {
        toast.error(authError.message || 'Invalid email or password');
      } else {
        toast.success('Welcome back!');
        // ✅ REDIRECTION FIX:
        // Using window.location.href instead of router.push ensures that
        // the browser session and cookies are fully synchronized before landing on the dashboard.
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      const message = err?.response?.data?.detail
        || (err?.request ? 'Network error. Please check your connection.' : 'An unexpected error occurred');
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
        }

        .auth-lines {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .auth-lines svg { position: absolute; inset: 0; width: 100%; height: 100%; }

        .auth-glow-l {
          position: absolute; top: 20%; left: -10%;
          width: 500px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(159,18,57,0.18) 0%, transparent 65%);
          filter: blur(70px); pointer-events: none;
          animation: authFloat 18s ease-in-out infinite;
        }
        .auth-glow-r {
          position: absolute; bottom: 10%; right: -10%;
          width: 420px; height: 340px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(244,63,94,0.12) 0%, transparent 65%);
          filter: blur(60px); pointer-events: none;
          animation: authFloat 22s ease-in-out infinite 6s;
        }

        .auth-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 440px;
          background: rgba(8,3,5,0.92);
          border: 1px solid rgba(244,63,94,0.15);
          border-radius: 24px;
          padding: 44px 40px 40px;
          box-shadow: 0 32px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset;
          backdrop-filter: blur(20px);
        }
        .auth-card::before {
          content: '';
          position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(244,63,94,0.5), transparent);
          border-radius: 1px;
        }

        .auth-logo {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-bottom: 32px;
        }
        .auth-logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #9f1239, #e11d48);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(190,24,93,0.45);
          flex-shrink: 0;
        }
        .auth-logo-text {
          font-size: 24px; font-weight: 800; letter-spacing: -0.04em; color: #fff;
        }

        .auth-title {
          font-size: 26px; font-weight: 800; letter-spacing: -0.04em;
          text-align: center; color: #fff; margin-bottom: 6px;
        }
        .auth-sub {
          font-size: 13.5px; text-align: center;
          color: rgba(255,255,255,0.35); margin-bottom: 34px; font-weight: 400;
        }

        .auth-form { display: flex; flex-direction: column; gap: 18px; }

        .auth-label {
          display: block; font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-bottom: 8px;
        }
        .auth-field { position: relative; }
        .auth-field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.22); pointer-events: none;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .auth-input {
          width: 100%; padding: 13px 14px 13px 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #fff; font-size: 13.5px;
          font-family: 'Poppins', sans-serif;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          box-sizing: border-box;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: rgba(244,63,94,0.45);
          box-shadow: 0 0 0 3px rgba(244,63,94,0.1);
          background: rgba(255,255,255,0.06);
        }
        .auth-field:focus-within .auth-field-icon { color: rgba(244,63,94,0.7); }

        .auth-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); padding: 0;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .auth-eye:hover { color: rgba(255,255,255,0.7); }

        /* forgot password row */
        .auth-pw-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .auth-forgot {
          font-size: 11.5px; color: rgba(244,63,94,0.65);
          text-decoration: none; font-weight: 500;
          transition: color 0.2s;
        }
        .auth-forgot:hover { color: #f43f5e; }

        .auth-btn {
          width: 100%; padding: 14px 20px; margin-top: 6px;
          background: linear-gradient(135deg, #9f1239 0%, #e11d48 100%);
          border: none; border-radius: 13px;
          color: #fff; font-size: 14px; font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer; letter-spacing: -0.01em;
          box-shadow: 0 6px 26px rgba(190,24,93,0.42), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: all 0.22s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 36px rgba(190,24,93,0.58), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: authSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* welcome back badge */
        .auth-welcome {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 8px 16px; border-radius: 40px; margin-bottom: 20px;
          background: rgba(244,63,94,0.07);
          border: 1px solid rgba(244,63,94,0.18);
          width: fit-content; margin-left: auto; margin-right: auto;
        }
        .auth-welcome-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 6px #4ade80;
          animation: authPulse 2.5s ease-in-out infinite;
        }
        .auth-welcome-text {
          font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
          color: rgba(255,255,255,0.45); text-transform: uppercase;
        }

        .auth-foot { margin-top: 24px; text-align: center; }
        .auth-foot p { font-size: 13px; color: rgba(255,255,255,0.3); }
        .auth-link { color: #f43f5e; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
        .auth-link:hover { opacity: 0.75; }
        .auth-back {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 12px; font-size: 12px;
          color: rgba(255,255,255,0.22); text-decoration: none;
          transition: color 0.2s;
        }
        .auth-back:hover { color: rgba(244,63,94,0.7); }

        /* feature chips row */
        .auth-features {
          display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
          margin-top: 28px; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .auth-feature-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 500;
        }
        .auth-feature-chip span:first-child { font-size: 13px; }

        @keyframes authFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes authSpin  { to{transform:rotate(360deg)} }
        @keyframes authPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
      `}</style>

      <div className="auth-root">
        <div className="auth-glow-l" />
        <div className="auth-glow-r" />

        {/* Diagonal lines */}
        <div className="auth-lines">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dl1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="dl2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#be185d" stopOpacity="0" />
                <stop offset="50%" stopColor="#be185d" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#be185d" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="-5" y1="15" x2="105" y2="45" stroke="url(#dl1)" strokeWidth="0.15" />
            <line x1="105" y1="20" x2="-5" y2="50" stroke="url(#dl2)" strokeWidth="0.12" />
            <line x1="75" y1="-2" x2="105" y2="60" stroke="url(#dl1)" strokeWidth="0.08" />
          </svg>
        </div>

        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Sparkles size={18} color="#fff" />
            </div>
            <span className="auth-logo-text">Plannior</span>
          </div>

          {/* Online badge */}
          <div className="auth-welcome">
            <div className="auth-welcome-dot" />
            <span className="auth-welcome-text">Welcome back</span>
          </div>

          <h2 className="auth-title">Sign in to continue</h2>
          <p className="auth-sub">Your tasks are waiting for you</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="auth-label">Email address</label>
              <div className="auth-field">
                <span className="auth-field-icon"><Mail size={16} /></span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="auth-pw-row">
                <label className="auth-label" style={{ margin: 0 }}>Password</label>
                <Link href="/auth/forgot-password" className="auth-forgot">Forgot password?</Link>
              </div>
              <div className="auth-field">
                <span className="auth-field-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  style={{ paddingRight: 42 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(s => !s)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <><span className="auth-spinner" /> Signing in…</>
              ) : (
                'Sign in →'
              )}
            </button>
          </form>

          {/* Feature chips */}
          <div className="auth-features">
            {[
              { icon: '⚡', text: 'AI scheduling' },
              { icon: '🔒', text: 'Secure' },
              { icon: '📱', text: 'All devices' },
            ].map(f => (
              <div className="auth-feature-chip" key={f.text}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Footer links */}
          <div className="auth-foot">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/signup" className="auth-link">Sign up free</Link>
            </p>
            <Link href="/" className="auth-back">← Back to home</Link>
          </div>
        </div>
      </div>
    </>
  );
}