'use client';

import React from "react";

/* ─── icon set ─── */
const Icon = {
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  ),
  Flame: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Chart: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
      <path d="M5 3l.75 2.75L8.5 7l-2.75.75L5 10.5l-.75-2.75L1.5 7l2.75-.75L5 3z" opacity="0.5"/>
      <path d="M19 14l.75 2.75L22.5 18l-2.75.75L19 21.5l-.75-2.75L15.5 18l2.75-.75L19 14z" opacity="0.5"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
};

const FEATURES = [
  {
    id: '01',
    tag: 'Daily Planner',
    title: 'Plan your day in seconds',
    desc: 'AI breaks your goals into actionable daily tasks. Just tell it what you want to achieve — it handles the structure, priority, and timing automatically.',
    icon: Icon.Calendar,
    accent: '#f43f5e',
    accentDim: 'rgba(244,63,94,0.08)',
    size: 'large', // spans 2 cols on desktop
    stat: { value: '3×', label: 'faster planning' },
  },
  {
    id: '02',
    tag: 'Habit Tracking',
    title: 'Build streaks that stick',
    desc: 'Visual streak tracking with adaptive reminders that learn your schedule — not the other way around.',
    icon: Icon.Flame,
    accent: '#be185d',
    accentDim: 'rgba(190,18,93,0.08)',
    size: 'small',
    stat: { value: '84%', label: 'retention rate' },
  },
  {
    id: '03',
    tag: 'Focus Timer',
    title: 'Deep work, zero distractions',
    desc: 'Pomodoro-style sessions with ambient sound, auto task-locking, and a live distraction log.',
    icon: Icon.Clock,
    accent: '#e11d48',
    accentDim: 'rgba(225,29,72,0.08)',
    size: 'small',
    stat: { value: '2.4×', label: 'focus time' },
  },
  {
    id: '04',
    tag: 'Analytics',
    title: 'See exactly where you stand',
    desc: 'Weekly reports, completion trends, and productivity scores that show what\'s working before it\'s too late.',
    icon: Icon.Chart,
    accent: '#f43f5e',
    accentDim: 'rgba(244,63,94,0.08)',
    size: 'small',
    stat: { value: '97%', label: 'accuracy' },
  },
  {
    id: '05',
    tag: 'Collaboration',
    title: 'Collaborate without the chaos',
    desc: 'Shared boards, task delegation, and real-time team progress — all in one minimal interface that stays out of your way.',
    icon: Icon.Users,
    accent: '#be185d',
    accentDim: 'rgba(190,18,93,0.08)',
    size: 'large',
    stat: { value: '12k+', label: 'teams active' },
  },
  {
    id: '06',
    tag: 'AI-Powered',
    title: 'Your goals, amplified by AI',
    desc: 'Natural language task creation, smart prioritization, and context-aware suggestions — built in.',
    icon: Icon.Sparkle,
    accent: '#e11d48',
    accentDim: 'rgba(225,29,72,0.08)',
    size: 'small',
    stat: { value: '∞', label: 'possibilities' },
  },
];

/* ─── Mini sparkline SVG for visual flair inside cards ─── */
const Sparkline = ({ color }: { color: string }) => (
  <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
    <polyline
      points="0,22 14,16 24,20 36,8 48,14 60,5 72,10 80,4"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      fill="none" opacity="0.7"
    />
    <polyline
      points="0,22 14,16 24,20 36,8 48,14 60,5 72,10 80,4 80,28 0,28"
      fill={color} opacity="0.08"
    />
    <circle cx="80" cy="4" r="2.5" fill={color} opacity="0.9"/>
  </svg>
);

/* ─── Single feature card ─── */
const Card = ({ f, large = false }: { f: typeof FEATURES[0]; large?: boolean }) => {
  const [hovered, setHovered] = React.useState(false);
  const IconComp = f.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered
          ? `linear-gradient(145deg, rgba(18,8,12,0.98) 0%, rgba(15,5,9,0.95) 100%)`
          : `linear-gradient(145deg, rgba(11,5,8,0.9) 0%, rgba(8,3,5,0.85) 100%)`,
        border: `1px solid ${hovered ? `${f.accent}28` : 'rgba(255,255,255,0.055)'}`,
        borderRadius: 20,
        padding: large ? '40px 40px 36px' : '32px 28px 28px',
        overflow: 'hidden',
        transition: 'border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease',
        boxShadow: hovered
          ? `0 0 0 1px ${f.accent}12, 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 2px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Ambient corner glow */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 180, height: 180,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${f.accent}${hovered ? '18' : '08'} 0%, transparent 70%)`,
        transition: 'all 0.5s ease',
        pointerEvents: 'none',
      }} />

      {/* Top shimmer line */}
      <div style={{
        position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
        background: `linear-gradient(90deg, transparent, ${f.accent}${hovered ? '60' : '18'}, transparent)`,
        transition: 'all 0.4s ease',
      }} />

      {/* Number + Tag row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          color: hovered ? f.accent : 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
          transition: 'color 0.3s ease',
          fontFamily: 'monospace',
        }}>
          {f.id}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
          color: hovered ? f.accent : 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase',
          background: hovered ? `${f.accent}15` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hovered ? f.accent + '30' : 'rgba(255,255,255,0.07)'}`,
          padding: '4px 10px', borderRadius: 20,
          transition: 'all 0.3s ease',
        }}>
          {f.tag}
        </span>
      </div>

      {/* Icon */}
      <div style={{
        width: large ? 54 : 48,
        height: large ? 54 : 48,
        borderRadius: 14,
        background: hovered
          ? `linear-gradient(135deg, ${f.accent}20, ${f.accent}0a)`
          : f.accentDim,
        border: `1px solid ${hovered ? f.accent + '38' : 'rgba(255,255,255,0.07)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hovered ? f.accent : 'rgba(255,255,255,0.38)',
        marginBottom: 20,
        transition: 'all 0.3s ease',
        boxShadow: hovered ? `0 0 24px ${f.accent}30, 0 0 8px ${f.accent}20` : 'none',
        flexShrink: 0,
      }}>
        <IconComp />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: large ? 22 : 18,
        fontWeight: 700,
        letterSpacing: '-0.025em',
        lineHeight: 1.25,
        color: hovered ? '#fff' : 'rgba(255,255,255,0.88)',
        marginBottom: 12,
        transition: 'color 0.3s ease',
      }}>
        {f.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: large ? 14.5 : 13.5,
        lineHeight: 1.7,
        color: hovered ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.32)',
        transition: 'color 0.3s ease',
        margin: 0,
        flexGrow: 1,
      }}>
        {f.desc}
      </p>

      {/* Bottom row — stat + sparkline + arrow */}
      <div style={{
        marginTop: 28,
        paddingTop: 20,
        borderTop: `1px solid ${hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        transition: 'border-color 0.3s ease',
      }}>
        {/* Stat */}
        <div>
          <div style={{
            fontSize: large ? 28 : 24,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: hovered ? f.accent : 'rgba(255,255,255,0.55)',
            lineHeight: 1,
            transition: 'color 0.35s ease',
            fontFamily: 'monospace',
          }}>
            {f.stat.value}
          </div>
          <div style={{
            fontSize: 10.5, fontWeight: 500,
            color: 'rgba(255,255,255,0.28)',
            marginTop: 3, letterSpacing: '0.04em',
          }}>
            {f.stat.label}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          {/* Sparkline */}
          <div style={{ opacity: hovered ? 0.9 : 0.4, transition: 'opacity 0.3s ease' }}>
            <Sparkline color={f.accent} />
          </div>

          {/* Learn more */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: 600,
            color: f.accent,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(4px)',
            transition: 'all 0.3s ease',
          }}>
            Learn more <Icon.Arrow />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main section ─── */
const FeaturesSection = React.memo(() => {
  return (
    <section
      id="features"
      style={{
        position: 'relative',
        background: '#000',
        padding: '130px 24px 150px',
        overflow: 'hidden',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        @keyframes featSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes featFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulseGlow {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }

        .feat-card { animation: featSlideUp 0.6s ease-out both; }
        .feat-card:nth-child(1) { animation-delay: 0.05s; }
        .feat-card:nth-child(2) { animation-delay: 0.12s; }
        .feat-card:nth-child(3) { animation-delay: 0.19s; }
        .feat-card:nth-child(4) { animation-delay: 0.26s; }
        .feat-card:nth-child(5) { animation-delay: 0.33s; }
        .feat-card:nth-child(6) { animation-delay: 0.40s; }

        /* bento grid */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: auto;
          gap: 14px;
        }
        .feat-large { grid-column: span 2; }
        .feat-small { grid-column: span 1; }

        @media (max-width: 900px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr); }
          .feat-large { grid-column: span 2; }
          .feat-small { grid-column: span 1; }
        }
        @media (max-width: 580px) {
          .feat-grid { grid-template-columns: 1fr; }
          .feat-large, .feat-small { grid-column: span 1; }
        }
      `}</style>

      {/* ── Ambient background ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Top separator glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '55%', maxWidth: 680, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.35), transparent)',
        }} />
        {/* Diffuse center glow */}
        <div style={{
          position: 'absolute', left: '50%', top: '35%',
          transform: 'translate(-50%, -50%)',
          width: 900, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(190,18,93,0.09) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }} />
        {/* Left edge accent */}
        <div style={{
          position: 'absolute', left: 0, top: '20%',
          width: 1, height: '60%',
          background: 'linear-gradient(180deg, transparent, rgba(244,63,94,0.15), transparent)',
        }} />
        {/* Right edge accent */}
        <div style={{
          position: 'absolute', right: 0, top: '20%',
          width: 1, height: '60%',
          background: 'linear-gradient(180deg, transparent, rgba(190,18,93,0.15), transparent)',
        }} />
        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
        }} />
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', marginBottom: 80,
          animation: 'featFadeIn 0.7s ease-out both',
        }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px',
            borderRadius: 40,
            border: '1px solid rgba(244,63,94,0.25)',
            background: 'rgba(244,63,94,0.06)',
            marginBottom: 24,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#f43f5e',
              boxShadow: '0 0 8px #f43f5e',
              animation: 'pulseGlow 2.5s ease-in-out infinite',
              display: 'inline-block',
            }} />
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#f43f5e',
            }}>
              Everything you need
            </span>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1.08,
            marginBottom: 20,
            background: 'linear-gradient(170deg, #fff 0%, #fff 38%, rgba(255,200,215,0.85) 68%, rgba(175,70,105,0.55) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            maxWidth: 700,
          }}>
            Built for people who actually want to get things done
          </h2>

          {/* Subtext */}
          <p style={{
            fontSize: 15.5, lineHeight: 1.75,
            color: 'rgba(255,255,255,0.38)',
            maxWidth: 440,
          }}>
            Every feature is designed around one goal — helping you build momentum and keep it.
          </p>

          {/* Decorative horizontal rule */}
          <div style={{
            marginTop: 36,
            display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500,
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07))' }} />
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: i === 1 ? '#f43f5e' : 'rgba(244,63,94,0.3)',
                  boxShadow: i === 1 ? '0 0 8px #f43f5e' : 'none',
                }} />
              ))}
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.07), transparent)' }} />
          </div>
        </div>

        {/* ── Bento grid ── */}
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className={`feat-card ${f.size === 'large' ? 'feat-large' : 'feat-small'}`}
            >
              <Card f={f} large={f.size === 'large'} />
            </div>
          ))}
        </div>

        {/* ── CTA Banner ── */}
        <div style={{
          marginTop: 80,
          position: 'relative',
          borderRadius: 22,
          overflow: 'hidden',
          padding: '48px 48px',
          background: 'linear-gradient(135deg, rgba(15,5,9,0.95) 0%, rgba(10,3,6,0.9) 100%)',
          border: '1px solid rgba(244,63,94,0.14)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 32, flexWrap: 'wrap',
          animation: 'featFadeIn 0.8s ease-out 0.5s both',
        }}>
          {/* CTA background glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', left: -80, top: '50%', transform: 'translateY(-50%)',
            width: 320, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(190,18,93,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)',
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(244,63,94,0.12) 0%, transparent 70%)',
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />

          {/* Left */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#f43f5e', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 16, height: 1, background: '#f43f5e', display: 'inline-block', opacity: 0.7 }} />
              Start free today
            </div>
            <div style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.6rem)',
              fontWeight: 800, letterSpacing: '-0.03em',
              color: '#fff', lineHeight: 1.2, maxWidth: 420,
            }}>
              Your most productive self<br />is one click away
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <a
              href="#"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.65)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '13px 24px', borderRadius: 12,
                textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#fff';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              See demo
            </a>
            <a
              href="#"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 14, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)',
                padding: '13px 28px', borderRadius: 12,
                textDecoration: 'none', whiteSpace: 'nowrap',
                boxShadow: '0 4px 24px rgba(190,24,93,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(190,24,93,0.55), inset 0 1px 0 rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(190,24,93,0.4), inset 0 1px 0 rgba(255,255,255,0.12)';
              }}
            >
              Get started free <Icon.Arrow />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom separator */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '35%', maxWidth: 450, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      }} />
    </section>
  );
});
FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;