'use client';

import React, { useState } from "react";

/* ══════════════════════════════════════════
   PLAN DATA
══════════════════════════════════════════ */
const PLANS = [
  {
    id: "free",
    name: "Starter",
    tag: "Free forever",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Everything you need to get organised and build the habit.",
    accent: "rgba(255,255,255,0.12)",
    accentSolid: "rgba(255,255,255,0.5)",
    cta: "Get started free",
    ctaStyle: "ghost",
    features: [
      "Up to 50 tasks",
      "Natural language input",
      "3 projects",
      "Mobile & desktop app",
      "7-day history",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    tag: "Most popular",
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: "Unlock the full power of AI-driven planning, unlimited everything.",
    accent: "#f43f5e",
    accentSolid: "#f43f5e",
    cta: "Start 14-day trial",
    ctaStyle: "filled",
    features: [
      "Unlimited tasks & projects",
      "AI smart scheduling",
      "Priority reminders",
      "Advanced analytics",
      "Calendar sync",
      "Custom recurring rules",
      "Priority support",
    ],
    highlight: true,
  },
  {
    id: "team",
    name: "Teams",
    tag: "For orgs",
    monthlyPrice: 24,
    yearlyPrice: 19,
    description: "Shared workspaces, permissions, and admin controls for growing teams.",
    accent: "rgba(255,255,255,0.12)",
    accentSolid: "rgba(255,255,255,0.5)",
    cta: "Contact sales",
    ctaStyle: "ghost",
    features: [
      "Everything in Pro",
      "Shared team workspaces",
      "Role-based permissions",
      "Admin dashboard",
      "SSO & SAML",
      "Audit logs",
      "Dedicated support",
    ],
    highlight: false,
  },
];

const Check = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

/* ══════════════════════════════════════════
   PLAN CARD
══════════════════════════════════════════ */
const PlanCard = ({
  plan,
  yearly,
  index,
}: {
  plan: typeof PLANS[0];
  yearly: boolean;
  index: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const isHighlight = plan.highlight;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 22,
        padding: isHighlight ? "2px" : "1px",
        background: isHighlight
          ? `linear-gradient(145deg, #f43f5e, #9f1239 50%, #f43f5e)`
          : "rgba(255,255,255,0.08)",
        boxShadow: isHighlight
          ? hovered
            ? "0 32px 80px rgba(244,63,94,0.4), 0 0 0 1px rgba(244,63,94,0.3)"
            : "0 20px 60px rgba(244,63,94,0.25)"
          : hovered
            ? "0 20px 50px rgba(0,0,0,0.5)"
            : "0 8px 30px rgba(0,0,0,0.3)",
        transform: isHighlight
          ? hovered ? "translateY(-8px) scale(1.02)" : "translateY(-4px) scale(1.01)"
          : hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.34,1.2,0.64,1)",
        animation: `pCardIn 0.6s ease-out ${index * 0.12}s both`,
        zIndex: isHighlight ? 2 : 1,
        flex: isHighlight ? "0 0 calc(33.33% - 12px)" : "0 0 calc(33.33% - 12px)",
      }}
    >
      {/* Inner card */}
      <div style={{
        borderRadius: 20,
        background: isHighlight
          ? "linear-gradient(160deg, rgba(18,5,10,0.98) 0%, rgba(10,2,6,0.99) 100%)"
          : "rgba(8,3,5,0.95)",
        padding: "32px 28px 28px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glow inside highlight card */}
        {isHighlight && (
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,63,94,0.18) 0%, transparent 65%)",
            filter: "blur(30px)", pointerEvents: "none",
          }} />
        )}

        {/* Top shimmer */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
          background: `linear-gradient(90deg, transparent, ${isHighlight ? "rgba(244,63,94,0.6)" : "rgba(255,255,255,0.1)"}, transparent)`,
        }} />

        {/* Tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 40, marginBottom: 22, alignSelf: "flex-start",
          background: isHighlight ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isHighlight ? "rgba(244,63,94,0.35)" : "rgba(255,255,255,0.08)"}`,
        }}>
          {isHighlight && (
            <span style={{
              width: 5, height: 5, borderRadius: "50%", background: "#f43f5e",
              boxShadow: "0 0 6px #f43f5e", display: "block",
              animation: "pPulse 2s ease-in-out infinite",
            }} />
          )}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isHighlight ? "#f43f5e" : "rgba(255,255,255,0.4)",
          }}>{plan.tag}</span>
        </div>

        {/* Plan name */}
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em",
          color: "#fff", marginBottom: 8,
          fontFamily: "'Poppins', sans-serif",
        }}>{plan.name}</div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)",
            marginBottom: 8,
          }}>$</span>
          <span style={{
            fontSize: 52, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 1,
            fontFamily: "'DM Mono', monospace",
            color: isHighlight ? "#f43f5e" : "#fff",
            transition: "all 0.3s ease",
          }}>{price}</span>
          <span style={{
            fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10,
            fontWeight: 500,
          }}>{price === 0 ? "" : "/mo"}</span>
        </div>

        {yearly && plan.monthlyPrice > 0 && (
          <div style={{
            fontSize: 11, color: "rgba(74,222,128,0.8)", marginBottom: 14,
            fontWeight: 600, letterSpacing: "0.02em",
          }}>
            ↓ Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
          </div>
        )}

        <p style={{
          fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.38)",
          marginBottom: 26, marginTop: plan.monthlyPrice === 0 ? 14 : 0,
        }}>{plan.description}</p>

        {/* Divider */}
        <div style={{
          height: 1, background: `linear-gradient(90deg, ${isHighlight ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.06)"}, transparent)`,
          marginBottom: 22,
        }} />

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
          {plan.features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                color: isHighlight ? "#f43f5e" : "rgba(255,255,255,0.35)",
                flexShrink: 0,
                width: 18, height: 18,
                background: isHighlight ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${isHighlight ? "rgba(244,63,94,0.25)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 5,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Check /></span>
              <span style={{
                fontSize: 13, color: "rgba(255,255,255,0.62)", fontWeight: 500,
              }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button style={{
          marginTop: 28,
          width: "100%",
          padding: "13px 20px",
          borderRadius: 12,
          border: plan.ctaStyle === "filled" ? "none" : "1px solid rgba(255,255,255,0.12)",
          background: plan.ctaStyle === "filled"
            ? "linear-gradient(135deg, #9f1239, #e11d48)"
            : "rgba(255,255,255,0.04)",
          color: "#fff",
          fontSize: 13.5, fontWeight: 700,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: plan.ctaStyle === "filled" ? "0 6px 24px rgba(190,24,93,0.4), inset 0 1px 0 rgba(255,255,255,0.12)" : "none",
          transition: "all 0.22s ease",
          fontFamily: "'Poppins', sans-serif",
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            if (plan.ctaStyle === "filled") {
              el.style.transform = "scale(1.03)";
              el.style.boxShadow = "0 10px 36px rgba(190,24,93,0.55), inset 0 1px 0 rgba(255,255,255,0.12)";
            } else {
              el.style.background = "rgba(255,255,255,0.08)";
              el.style.borderColor = "rgba(255,255,255,0.2)";
            }
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            if (plan.ctaStyle === "filled") {
              el.style.transform = "scale(1)";
              el.style.boxShadow = "0 6px 24px rgba(190,24,93,0.4), inset 0 1px 0 rgba(255,255,255,0.12)";
            } else {
              el.style.background = "rgba(255,255,255,0.04)";
              el.style.borderColor = "rgba(255,255,255,0.12)";
            }
          }}
        >
          {plan.cta} <Arrow />
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN SECTION
══════════════════════════════════════════ */
const PricingSection = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      style={{
        position: "relative",
        background: "#000",
        padding: "130px 24px 160px",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');

        @keyframes pCardIn   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pFadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes pSlideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pPulse    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes pFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pOrbit    { from{transform:rotate(0deg) translateX(140px) rotate(0deg)} to{transform:rotate(360deg) translateX(140px) rotate(-360deg)} }
        @keyframes pShimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }

        .p-cards { display:flex; gap:18px; align-items:stretch; }
        .p-toggle-track { position:relative; width:44px; height:24px; border-radius:40px; cursor:pointer; transition:background 0.3s ease; }
        .p-toggle-thumb { position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:left 0.25s cubic-bezier(0.34,1.3,0.64,1); }

        @media(max-width:900px) {
          .p-cards { flex-direction:column; align-items:center; }
          .p-cards > * { width:100%; max-width:400px; flex:none !important; }
        }
      `}</style>

      {/* ── Atmosphere ── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Top separator */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "60%", maxWidth: 700, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.3), transparent)",
        }} />
        {/* Orbiting ring */}
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          width: 320, height: 320,
          border: "1px solid rgba(244,63,94,0.06)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          width: 480, height: 480,
          border: "1px solid rgba(244,63,94,0.04)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />
        {/* Floating dot on ring */}
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          width: 8, height: 8, borderRadius: "50%",
          background: "#f43f5e",
          boxShadow: "0 0 12px #f43f5e",
          animation: "pOrbit 12s linear infinite",
          pointerEvents: "none",
        }} />
        {/* Left glow */}
        <div style={{
          position: "absolute", left: "5%", top: "40%",
          width: 500, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(159,18,57,0.1) 0%, transparent 65%)",
          filter: "blur(80px)", animation: "pFloat 20s ease-in-out infinite",
        }} />
        {/* Right glow */}
        <div style={{
          position: "absolute", right: "5%", top: "50%",
          width: 380, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(244,63,94,0.07) 0%, transparent 65%)",
          filter: "blur(60px)", animation: "pFloat 25s ease-in-out infinite 8s",
        }} />
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
        } as React.CSSProperties} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 60, animation: "pFadeIn 0.7s ease-out both" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 40, marginBottom: 20,
            border: "1px solid rgba(244,63,94,0.22)",
            background: "rgba(244,63,94,0.055)",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%", background: "#f43f5e",
              boxShadow: "0 0 8px #f43f5e", animation: "pPulse 2.5s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f43f5e" }}>
              Pricing
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
            fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.08,
            background: "linear-gradient(170deg, #fff 0%, #fff 40%, rgba(255,200,215,0.85) 70%, rgba(170,60,95,0.5) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 16,
          }}>
            Simple, honest pricing.
          </h2>

          <p style={{ fontSize: 15.5, lineHeight: 1.75, color: "rgba(255,255,255,0.38)", maxWidth: 460, margin: "0 auto 36px" }}>
            No hidden fees, no lock-in. Start free and upgrade when you're ready.
          </p>

          {/* ── Billing toggle ── */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 14,
            padding: "8px 18px", borderRadius: 50,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            animation: "pSlideUp 0.5s ease-out 0.15s both",
          }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: !yearly ? "#fff" : "rgba(255,255,255,0.35)", transition: "color 0.25s" }}>
              Monthly
            </span>
            <div
              className="p-toggle-track"
              onClick={() => setYearly(y => !y)}
              style={{ background: yearly ? "#be185d" : "rgba(255,255,255,0.1)" }}
            >
              <div className="p-toggle-thumb" style={{ left: yearly ? "23px" : "3px" }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: yearly ? "#fff" : "rgba(255,255,255,0.35)", transition: "color 0.25s", display: "flex", alignItems: "center", gap: 7 }}>
              Annual
              <span style={{
                fontSize: 9.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
                color: "#4ade80", background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.25)",
                padding: "2px 7px", borderRadius: 20,
              }}>Save 20%</span>
            </span>
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="p-cards">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} yearly={yearly} index={i} />
          ))}
        </div>

        {/* ── Bottom trust row ── */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap",
          marginTop: 52,
          animation: "pSlideUp 0.6s ease-out 0.5s both",
        }}>
          {[
            { icon: "🔒", text: "No credit card required" },
            { icon: "↩", text: "Cancel anytime" },
            { icon: "⚡", text: "Instant setup" },
            { icon: "🛡", text: "SOC2 compliant" },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{t.text}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;