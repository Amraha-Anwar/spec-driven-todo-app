'use client';

import React, { useState } from "react";

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const Icons = {
  Github: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  Twitter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Send: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════
   LINK COLUMNS
══════════════════════════════════════════ */
const LINKS = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
  Company: ["About", "Blog", "Careers", "Press kit", "Privacy"],
  Resources: ["Docs", "API", "Community", "Templates", "Integrations"],
};

const SOCIAL = [
  { icon: <Icons.Twitter />, label: "Twitter", href: "#" },
  { icon: <Icons.Github />, label: "GitHub", href: "#" },
  { icon: <Icons.LinkedIn />, label: "LinkedIn", href: "#" },
];

/* ══════════════════════════════════════════
   NEWSLETTER INPUT
══════════════════════════════════════════ */
const NewsletterInput = () => {
  const [val, setVal] = useState("");
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (!val.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setVal(""); }, 3000);
  };

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.25)", marginBottom: 12,
      }}>Stay in the loop</div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>
        Get product updates and early access to new features.
      </p>
      {sent ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "12px 16px", borderRadius: 12,
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          animation: "fFadeIn 0.3s ease-out both",
        }}>
          <span style={{ color: "#4ade80" }}><Icons.Check /></span>
          <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>You're on the list!</span>
        </div>
      ) : (
        <div style={{
          display: "flex",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${focused ? "rgba(244,63,94,0.35)" : "rgba(255,255,255,0.09)"}`,
          background: "rgba(255,255,255,0.03)",
          transition: "border-color 0.25s ease",
          boxShadow: focused ? "0 0 0 3px rgba(244,63,94,0.08)" : "none",
        }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={val}
            onChange={e => setVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              padding: "11px 14px",
              fontSize: 13, color: "#fff",
              fontFamily: "'Poppins', sans-serif",
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "11px 16px",
              background: "linear-gradient(135deg, #9f1239, #e11d48)",
              border: "none", cursor: "pointer",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            <Icons.Send />
          </button>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        position: "relative",
        background: "#000",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');

        @keyframes fFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes fSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fPulse   { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes fDrift   { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-8px) translateX(4px)} }
        @keyframes fSpin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        .f-link { font-size:13px; color:rgba(255,255,255,0.38); text-decoration:none; font-weight:500; display:flex; align-items:center; gap:6px; transition:color 0.2s ease; padding:3px 0; }
        .f-link:hover { color:#fff; }
        .f-link:hover .f-arrow { opacity:1; transform:translateX(0); }
        .f-arrow { opacity:0; transform:translateX(-4px); transition:all 0.2s ease; color:#f43f5e; }
        .f-social { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); text-decoration:none; transition:all 0.2s ease; }
        .f-social:hover { color:#fff; background:rgba(244,63,94,0.12); border-color:rgba(244,63,94,0.3); }
        .f-cols { display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr 1.4fr; gap:48px; }

        @media(max-width:1000px) {
          .f-cols { grid-template-columns:1fr 1fr 1fr; gap:36px; }
          .f-cols > *:first-child, .f-cols > *:last-child { grid-column:1/-1; }
        }
        @media(max-width:600px) {
          .f-cols { grid-template-columns:1fr 1fr; gap:28px; }
          .f-cols > *:first-child, .f-cols > *:last-child { grid-column:1/-1; }
        }
      `}</style>

      {/* ══ MASSIVE WORDMARK WATERMARK ══ */}
      <div aria-hidden style={{
        position: "absolute",
        bottom: 60, left: "50%",
        transform: "translateX(-50%)",
        fontSize: "clamp(80px,14vw,180px)",
        fontWeight: 900,
        letterSpacing: "-0.06em",
        lineHeight: 1,
        fontFamily: "'Poppins', sans-serif",
        color: "rgba(255,255,255,0.09)",
        whiteSpace: "nowrap",
        userSelect: "none",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        PLANNIOR
      </div>

      {/* ══ Decorative elements ══ */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Top separator line */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "70%", maxWidth: 900, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.35), transparent)",
        }} />
        {/* Corner accent — top left */}
        <div style={{
          position: "absolute", top: 40, left: 40,
          width: 80, height: 80,
          border: "1px solid rgba(244,63,94,0.1)",
          borderRadius: "50%",
          animation: "fSpin 30s linear infinite",
        }} />
        <div style={{
          position: "absolute", top: 52, left: 52,
          width: 56, height: 56,
          border: "1px dashed rgba(244,63,94,0.08)",
          borderRadius: "50%",
          animation: "fSpin 18s linear infinite reverse",
        }} />
        {/* Floating glow */}
        <div style={{
          position: "absolute", bottom: "30%", right: "10%",
          width: 300, height: 240, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(159,18,57,0.09) 0%, transparent 65%)",
          filter: "blur(50px)", animation: "fDrift 18s ease-in-out infinite",
        }} />
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 0", position: "relative", zIndex: 1 }}>

        <div className="f-cols">

          {/* ── Brand column ── */}
          <div style={{ animation: "fSlideUp 0.6s ease-out 0s both" }}>
            {/* Logo + wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #9f1239, #e11d48)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 900, color: "#fff",
                boxShadow: "0 4px 16px rgba(190,24,93,0.4)",
                flexShrink: 0,
              }}>P</div>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>
                Plannior
              </span>
            </div>

            <p style={{
              fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.35)",
              marginBottom: 24, maxWidth: 260,
            }}>
              Task management that talks back. Built by one developer for the people who actually get things done.
            </p>

            {/* Tagline chip */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 40,
              background: "rgba(244,63,94,0.07)",
              border: "1px solid rgba(244,63,94,0.18)",
              marginBottom: 28,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#f43f5e", boxShadow: "0 0 6px #f43f5e",
                animation: "fPulse 2.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(244,63,94,0.8)", letterSpacing: "0.06em" }}>
                Solo-built · 50k+ users
              </span>
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 8 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} className="f-social" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Link columns ── */}
          {Object.entries(LINKS).map(([heading, links], ci) => (
            <div key={heading} style={{ animation: `fSlideUp 0.6s ease-out ${(ci + 1) * 0.08}s both` }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
                marginBottom: 18,
              }}>{heading}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {links.map(link => (
                  <a key={link} href="#" className="f-link">
                    <span className="f-arrow"><Icons.Arrow /></span>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* ── Newsletter column ── */}
          <div style={{ animation: "fSlideUp 0.6s ease-out 0.36s both" }}>
            <NewsletterInput />

            {/* App store badges */}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "App Store", sub: "Download on the" },
                { label: "Google Play", sub: "Get it on" },
              ].map(b => (
                <a key={b.label} href="#" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.07)"; }}
                >
                  <div style={{ fontSize: 22, lineHeight: 1 }}>
                    {b.label === "App Store" ? "🍎" : "▶"}
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{b.sub}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em" }}>{b.label}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* ══ DIVIDER ══ */}
        <div style={{
          height: 1, marginTop: 72,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 20%, rgba(244,63,94,0.2) 50%, rgba(255,255,255,0.07) 80%, transparent)",
        }} />

        {/* ══ BOTTOM BAR ══ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
          padding: "24px 0 100px",
          animation: "fFadeIn 0.7s ease-out 0.4s both",
        }}>
          {/* Copyright */}
          <div style={{
            fontSize: 12.5, color: "rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          }}>
            <span>© {year} Plannior</span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span>Built by</span>
            <span style={{
              color: "#f43f5e", fontWeight: 700,
              background: "linear-gradient(90deg, #f43f5e, #be185d)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Amraha Anwar</span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span>All rights reserved</span>
          </div>

          {/* Legal links */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {["Privacy Policy", "Terms of Service", "Cookies"].map((l, i) => (
              <a key={l} href="#" style={{
                fontSize: 12, color: "rgba(255,255,255,0.22)", textDecoration: "none",
                fontWeight: 500, transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.22)"}
              >{l}</a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;