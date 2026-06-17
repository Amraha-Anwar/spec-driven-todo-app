'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '../../../lib/auth-client';
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../../lib/toast';

export default function SignUpPage() {
  const [name, setName] = useState('');
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
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard',
      });
      if (authError) {
        toast.error(authError.message || 'Failed to create account');
      } else {
        toast.success('Account created successfully!');
        router.push('/dashboard');
        router.refresh();
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

        /* diagonal line bg */
        .auth-lines {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .auth-lines svg { position: absolute; inset: 0; width: 100%; height: 100%; }

        /* glows */
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

        /* card */
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

        /* logo */
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

        /* headings */
        .auth-title {
          font-size: 26px; font-weight: 800; letter-spacing: -0.04em;
          text-align: center; color: #fff; margin-bottom: 6px;
        }
        .auth-sub {
          font-size: 13.5px; text-align: center;
          color: rgba(255,255,255,0.35); margin-bottom: 34px; font-weight: 400;
        }

        /* form */
        .auth-form { display: flex; flex-direction: column; gap: 18px; }

        .auth-label {
          display: block; font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-bottom: 8px;
        }
        .auth-field {
          position: relative;
        }
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
        .auth-input:focus + .auth-field-icon,
        .auth-field:focus-within .auth-field-icon { color: rgba(244,63,94,0.7); }

        .auth-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); padding: 0;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .auth-eye:hover { color: rgba(255,255,255,0.7); }

        .auth-hint {
          font-size: 11px; color: rgba(255,255,255,0.22);
          margin-top: 6px; letter-spacing: 0.01em;
        }

        /* submit */
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

        /* spinner */
        .auth-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: authSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* divider */
        .auth-divider {
          display: flex; align-items: center; gap: 12px; margin: 8px 0;
        }
        .auth-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }
        .auth-divider-text { font-size: 11px; color: rgba(255,255,255,0.2); white-space: nowrap; }

        /* bottom links */
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

        /* stats strip */
        .auth-stats {
          display: flex; justify-content: center; gap: 28px;
          margin-top: 28px; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .auth-stat { text-align: center; }
        .auth-stat-num {
          font-size: 18px; font-weight: 800; letter-spacing: -0.04em;
          font-family: 'DM Mono', monospace; color: #f43f5e;
        }
        .auth-stat-label { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 2px; letter-spacing: 0.04em; }

        @keyframes authFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes authSpin  { to{transform:rotate(360deg)} }
      `}</style>

      <div className="auth-root">
        {/* Atmospheric glows */}
        <div className="auth-glow-l" />
        <div className="auth-glow-r" />

        {/* Diagonal lines */}
        <div className="auth-lines">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dl1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="dl2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#be185d" stopOpacity="0" />
                <stop offset="50%" stopColor="#be185d" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#be185d" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="-5" y1="15" x2="105" y2="45" stroke="url(#dl1)" strokeWidth="0.15" />
            <line x1="105" y1="20" x2="-5" y2="50" stroke="url(#dl2)" strokeWidth="0.12" />
            <line x1="20" y1="-2" x2="55" y2="80" stroke="url(#dl1)" strokeWidth="0.1" />
          </svg>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Sparkles size={18} color="#fff" />
            </div>
            <span className="auth-logo-text">Plannior</span>
          </div>

          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">Join 50,000+ people who plan smarter</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="auth-label">Full name</label>
              <div className="auth-field">
                <span className="auth-field-icon"><User size={16} /></span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
              <label className="auth-label">Password</label>
              <div className="auth-field">
                <span className="auth-field-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  style={{ paddingRight: 42 }}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(s => !s)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="auth-hint">Must be at least 8 characters</p>
            </div>

            {/* Submit */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <><span className="auth-spinner" /> Creating account…</>
              ) : (
                'Create account →'
              )}
            </button>
          </form>

          {/* Stats strip */}
          <div className="auth-stats">
            {[
              { num: '50k+', label: 'Active users' },
              { num: '4.9★', label: 'App rating' },
              { num: 'Free', label: 'To start' },
            ].map(s => (
              <div className="auth-stat" key={s.label}>
                <div className="auth-stat-num">{s.num}</div>
                <div className="auth-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Footer links */}
          <div className="auth-foot">
            <p>
              Already have an account?{' '}
              <Link href="/auth/signin" className="auth-link">Sign in</Link>
            </p>
            <Link href="/" className="auth-back">← Back to home</Link>
          </div>
        </div>
      </div>
    </>
  );
}