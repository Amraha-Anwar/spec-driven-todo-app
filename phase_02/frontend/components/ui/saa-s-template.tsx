'use client';

import React from "react";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import DashboardPreview from "./dashboard-preview";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = {
      default: "bg-white text-black hover:bg-gray-100",
      secondary: "bg-gray-800 text-white hover:bg-gray-700",
      ghost: "hover:bg-gray-800/50 text-white",
      gradient: "bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95"
    };
    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-10 px-5 text-sm",
      lg: "h-12 px-8 text-base"
    };
    return (
      <button ref={ref} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

const Navigation = React.memo(({ onSignInClick, onSignUpClick, isSignedIn, dashboardLink }: {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  isSignedIn?: boolean;
  dashboardLink?: string;
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'About',    href: '/#about'    },
    { label: 'Pricing',  href: '/#pricing'  },
  ];

  return (
    <header className="fixed top-0 w-full z-50" style={{ padding: '12px 0' }}>
      {/* Glass pill — floats in the center on desktop, full-width on mobile */}
      <nav
        className="mx-auto flex items-center justify-between"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 20px',
        }}
      >
        {/* ── Outer container — glass pill on md+, flat on mobile ── */}
        <div
          className="w-full flex items-center justify-between"
          style={{
            background: 'rgba(10,10,12,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '10px 20px',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Logo */}
          <a href="/" aria-label="Plannior home" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/images/logo.png"
              alt="Plannior logo"
              style={{ height: 42, width: 'auto', display: 'block' }}
            />
          </a>

          {/* Desktop nav links — centered */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.55)',
                  padding: '6px 14px',
                  borderRadius: 8,
                  transition: 'color 0.18s, background 0.18s',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isSignedIn ? (
              <a
                href={dashboardLink || '/dashboard'}
                style={{
                  fontSize: 13, fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
                  padding: '7px 18px',
                  borderRadius: 9,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  boxShadow: '0 2px 12px rgba(190,24,93,0.35)',
                  transition: 'opacity 0.18s, transform 0.18s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                Dashboard →
              </a>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSignInClick}
                  style={{
                    fontSize: 13, fontWeight: 500,
                    color: 'rgba(255,255,255,0.65)',
                    background: 'transparent',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    letterSpacing: '0.01em',
                    transition: 'color 0.18s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={onSignUpClick}
                  style={{
                    fontSize: 13, fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)',
                    border: '1px solid rgba(244,63,94,0.3)',
                    padding: '7px 18px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    letterSpacing: '0.01em',
                    boxShadow: '0 2px 12px rgba(190,24,93,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    transition: 'opacity 0.18s, transform 0.18s, box-shadow 0.18s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.9';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(190,24,93,0.5), inset 0 1px 0 rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(190,24,93,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
                  }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 8px',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden mx-auto"
          style={{
            maxWidth: 1100,
            padding: '6px 20px 0',
            animation: 'slideDown 0.22s ease-out both',
          }}
        >
          <div style={{
            background: 'rgba(10,10,12,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '8px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}>
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  fontSize: 14, fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {label}
              </a>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '6px 0', padding: '6px 0 0' }}>
              {isSignedIn ? (
                <a
                  href={dashboardLink || '/dashboard'}
                  style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)', padding: '10px 14px', borderRadius: 8, textDecoration: 'none', textAlign: 'center' }}
                >
                  Dashboard →
                </a>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); onSignInClick?.(); }} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', width: '100%' }}>
                    Sign in
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); onSignUpClick?.(); }} style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 100%)', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', width: '100%', boxShadow: '0 2px 12px rgba(190,24,93,0.3)' }}>
                    Get started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
});
Navigation.displayName = "Navigation";

const Hero = React.memo(({ onGetStartedClick }: { onGetStartedClick?: () => void }) => {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start px-6 py-20 md:py-24"
      style={{ overflow: 'hidden' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Poppins', sans-serif; }

        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sparkPulse {
          0%,100% { opacity:0.8; }
          50%      { opacity:1; }
        }
        @keyframes badgeShimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        .badge-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.09) 50%, transparent 100%);
          background-size: 200% auto;
          animation: badgeShimmer 3s linear infinite;
        }
        @keyframes heroIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes breathe {
          0%,100% { opacity:0.07; transform:translate(-50%,-50%) scale(1);    }
          50%      { opacity:0.15; transform:translate(-50%,-50%) scale(1.06); }
        }
        .plannior-heading {
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          background-image: linear-gradient(175deg,
            #ffffff 0%, #ffffff 35%,
            rgba(255,215,225,0.9) 65%,
            rgba(185,95,125,0.55) 100%
          );
          -webkit-text-stroke: 1px rgba(255,255,255,0.06);
        }
      `}</style>

      {/* ── BACKGROUND LAYER ── */}
      <div aria-hidden="true" style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>

        {/* 1. Single soft central glow — very restrained */}
        <div style={{
          position:'absolute', left:'50%', top:'30%',
          width:620, height:420,
          borderRadius:'50%',
          background:'radial-gradient(ellipse at center, rgba(190,18,93,0.13) 0%, rgba(159,18,57,0.06) 40%, transparent 70%)',
          filter:'blur(52px)',
          animation:'breathe 9s ease-in-out infinite',
        }} />

        {/* 2. Static diagonal lines */}
        <svg
          style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="dg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="rgba(244,63,94,0)"   />
              <stop offset="30%"  stopColor="rgba(244,63,94,0.45)" />
              <stop offset="55%"  stopColor="rgba(244,63,94,0.45)" />
              <stop offset="80%"  stopColor="rgba(244,63,94,0)"   />
              <stop offset="100%" stopColor="rgba(244,63,94,0)"   />
            </linearGradient>
            <linearGradient id="dg2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(190,18,93,0)"   />
              <stop offset="30%"  stopColor="rgba(190,18,93,0.38)" />
              <stop offset="55%"  stopColor="rgba(190,18,93,0.38)" />
              <stop offset="80%"  stopColor="rgba(190,18,93,0)"   />
              <stop offset="100%" stopColor="rgba(190,18,93,0)"   />
            </linearGradient>
            <linearGradient id="dg3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="rgba(251,113,133,0)"   />
              <stop offset="35%"  stopColor="rgba(251,113,133,0.28)" />
              <stop offset="65%"  stopColor="rgba(251,113,133,0)"   />
              <stop offset="100%" stopColor="rgba(251,113,133,0)"   />
            </linearGradient>
          </defs>

          {/* Left-to-right shallow diagonal — upper hero only */}
          <line x1="-5"  y1="10"  x2="105" y2="42"  stroke="url(#dg1)" strokeWidth="0.14" />
          {/* Right-to-left shallow diagonal — crosses the first */}
          <line x1="105" y1="12"  x2="-5"  y2="40"  stroke="url(#dg2)" strokeWidth="0.13" />
          {/* Steeper left-side diagonal — stops at mid-hero */}
          <line x1="22"  y1="-2"  x2="55"  y2="72"  stroke="url(#dg3)" strokeWidth="0.11" />
          {/* Far-right subtle diagonal — stays upper right */}
          <line x1="75"  y1="-2"  x2="105" y2="52"  stroke="url(#dg1)" strokeWidth="0.1"  />
        </svg>

        {/* 4. Vignettes */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'38%', background:'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(0,0,0,0.32) 0%, transparent 16%, transparent 84%, rgba(0,0,0,0.32) 100%)' }} />

      </div>

      {/* ── FOREGROUND CONTENT ── */}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', width:'100%', animation:'heroIn 0.7s ease-out both' }}>

        {/* Badge */}
        <aside className="mb-10 inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 py-2 rounded-2xl border border-rose-900/70 bg-rose-950/25 backdrop-blur-sm relative overflow-hidden mx-4 text-center">
          <div className="badge-shimmer absolute inset-0 rounded-2xl" />
          <Sparkles size={13} className="shrink-0" style={{ color:'#fb7185' }} />
          <span className="text-xs font-medium" style={{ color:'#fda4af' }}>AI-powered task tracking now live</span>
          <span className="hidden sm:block w-px h-3 bg-rose-800/50" />
          <a href="#features" className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white" style={{ color:'#fda4af' }}>
            See what's new <ArrowRight size={11} />
          </a>
        </aside>

        {/* Heading */}
        <h1
          className="plannior-heading font-black text-center px-4 leading-none mb-6 md:mb-7 select-none"
          style={{ fontSize:'clamp(3rem, 14vw, 11rem)', letterSpacing:'-0.05em' }}
        >
          Plannior
        </h1>

        {/* Supporting line */}
        <p className="text-xs sm:text-sm md:text-base text-center max-w-xl px-6 mb-10 leading-relaxed" style={{ color:'#6b7280' }}>
          Plan your day, track your habits, and stay on top of every goal all in one beautifully simple workspace.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 relative mb-16 w-full px-6 sm:w-auto sm:px-0" style={{ zIndex:10 }}>
          <Button type="button" variant="gradient" size="lg" className="w-full sm:w-auto rounded-xl sm:px-10 flex items-center justify-center shadow-lg shadow-rose-950/30" onClick={onGetStartedClick} aria-label="Get started">
            <span className="sm:hidden">Get started</span>
            <span className="hidden sm:inline">Get started now</span>
            <ArrowRight size={16} />
          </Button>
          <span className="text-xs" style={{ color:'#4b5563' }}>No credit card required</span>
        </div>

        {/* Glow before dashboard */}
        <div style={{ position:'relative', width:'100%', maxWidth:'80rem', height:'80px', zIndex:0, pointerEvents:'none', marginBottom:'-40px' }} aria-hidden="true">
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'90%', height:'100px', background:'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(140,0,40,0.7) 0%, rgba(100,0,30,0.35) 45%, transparent 70%)', filter:'blur(28px)', animation:'sparkPulse 4s ease-in-out infinite' }} />
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'55%', height:'70px',  background:'radial-gradient(ellipse 70% 100% at 50% 50%, rgba(210,20,70,0.8) 0%, rgba(170,10,50,0.45) 40%, transparent 65%)',  filter:'blur(16px)', animation:'sparkPulse 4s ease-in-out infinite' }} />
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'25%', height:'45px',  background:'radial-gradient(ellipse 65% 100% at 50% 50%, rgba(255,100,145,0.95) 0%, rgba(230,40,90,0.6) 40%, transparent 68%)', filter:'blur(8px)',  animation:'sparkPulse 4s ease-in-out infinite' }} />
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'8%',  height:'22px',  background:'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,210,225,1) 0%, rgba(255,140,170,0.8) 40%, transparent 70%)',    filter:'blur(3px)',  animation:'sparkPulse 4s ease-in-out infinite' }} />
        </div>

        {/* Dashboard */}
        <div className="w-full max-w-5xl relative pb-20" style={{ zIndex:1 }}>
          <DashboardPreview />
        </div>

      </div>
    </section>
  );
});
Hero.displayName = "Hero";

export default function SaaSTEmplate({
  onSignInClick, onSignUpClick, onGetStartedClick, isSignedIn, dashboardLink
}: {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onGetStartedClick?: () => void;
  isSignedIn?: boolean;
  dashboardLink?: string;
}) {
  return (
    <main className="min-h-screen bg-black text-white" style={{ overflow:'hidden' }}>
      <Navigation onSignInClick={onSignInClick} onSignUpClick={onSignUpClick} isSignedIn={isSignedIn} dashboardLink={dashboardLink} />
      <Hero onGetStartedClick={onGetStartedClick} />
    </main>
  );
}