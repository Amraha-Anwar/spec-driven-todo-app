"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authClient } from "../../../lib/auth-client";
import { Avatar } from "../../../components/ui/avatar";
import { toast } from "../../../lib/toast";
import { User, Mail, Save, Upload, Check, Settings, Bell, Moon, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailNotif, setEmailNotif] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data);
      setName(data?.user?.name || "");
    };
    getSession();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authClient.updateUser({ name });
      const { data } = await authClient.getSession();
      setSession(data);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file (JPG, PNG, GIF, etc.)"); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("Image size must be less than 5MB"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          await authClient.updateUser({ image: base64String });
          setPreviewUrl(base64String);
          const { data } = await authClient.getSession();
          setSession(data);
          toast.success("Profile picture updated successfully!");
        } catch (error: any) {
          toast.error(error?.message || "Failed to update profile picture");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("Failed to process image");
      setUploading(false);
    }
  };

  /* ── reusable section card ── */
  const SectionCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "relative", borderRadius: 18, padding: "28px 26px", background: "rgba(8,3,5,0.92)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.2),transparent)" }} />
      {children}
    </motion.div>
  );

  const SectionTitle = ({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color="#f43f5e" />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );

  const Label = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <Icon size={11} color="rgba(244,63,94,0.6)" />
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{text}</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes spFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes spShine { 0%{left:-100%;opacity:0} 10%{opacity:1} 55%{left:110%;opacity:.5} 100%{left:110%;opacity:0} }
        @keyframes spSpin  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes spBtnSpin { to{transform:rotate(360deg)} }

        .sp-input {
          width:100%; padding:12px 16px; box-sizing:border-box;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:11px;
          color:#fff; font-size:13.5px; font-family:'Poppins',sans-serif; outline:none;
          transition:border-color .25s, box-shadow .25s, background .25s;
        }
        .sp-input::placeholder { color:rgba(255,255,255,.2); }
        .sp-input:focus { border-color:rgba(244,63,94,.4); box-shadow:0 0 0 3px rgba(244,63,94,.09); background:rgba(255,255,255,.06); }
        .sp-input:disabled { opacity:.4; cursor:not-allowed; }

        .sp-save {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 24px; border-radius:12px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#9f1239 0%,#e11d48 100%);
          color:#fff; font-size:13.5px; font-weight:700; font-family:'Poppins',sans-serif;
          box-shadow:0 5px 22px rgba(190,24,93,.4), inset 0 1px 0 rgba(255,255,255,.12);
          transition:all .22s ease; letter-spacing:-.01em;
        }
        .sp-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 9px 30px rgba(190,24,93,.55), inset 0 1px 0 rgba(255,255,255,.12); }
        .sp-save:disabled { opacity:.5; cursor:not-allowed; }
        .sp-save-spin { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; animation:spBtnSpin .7s linear infinite; }

        .sp-toggle-track { position:relative; width:42px; height:22px; border-radius:40px; cursor:pointer; transition:background .3s ease; border:none; padding:0; }
        .sp-toggle-thumb { position:absolute; top:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .25s cubic-bezier(.34,1.3,.64,1); }

        .sp-pref-row { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .sp-pref-row:last-child { border-bottom:none; padding-bottom:0; }

        .sp-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent); margin:6px 0 20px; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Poppins',sans-serif" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", borderRadius: 22, padding: "32px 36px", background: "rgba(8,3,5,0.94)", border: "1px solid rgba(244,63,94,0.13)", overflow: "hidden", boxShadow: "0 20px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.5),transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-40%", left: "-5%", width: 300, height: 240, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,18,57,0.18) 0%,transparent 65%)", filter: "blur(55px)", pointerEvents: "none", animation: "spFloat 16s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "50%", right: 40, width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(244,63,94,0.08)", transform: "translate(50%,-50%)", animation: "spSpin 22s linear infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.025),transparent)", animation: "spShine 2.2s ease-out 0.3s both", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 40, marginBottom: 14, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 7px #f43f5e", animation: "spPulse 2.5s ease-in-out infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,63,94,0.8)" }}>Account</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.08, marginBottom: 10, background: "linear-gradient(135deg,#fff 0%,#fff 45%,rgba(255,200,215,.85) 75%,rgba(190,24,93,.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Settings
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32, duration: 0.45 }}
                style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)", fontWeight: 400, display: "flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={13} color="#f43f5e" />
                Manage your account and preferences
              </motion.p>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.3, 0.64, 1] }}
              style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: "linear-gradient(135deg,rgba(244,63,94,0.18),rgba(159,18,57,0.1))", border: "1px solid rgba(244,63,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 28px rgba(244,63,94,0.18)" }}>
              <Settings size={24} color="#f43f5e" />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Profile ── */}
        <SectionCard delay={0.1}>
          <SectionTitle icon={User} title="Profile" sub="Update your name and avatar" />

          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, padding: "18px 18px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar name={session?.user?.name || "User"} imageUrl={previewUrl || session?.user?.image} size="lg" editable onImageChange={handleAvatarChange} />
              {uploading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#f43f5e", animation: "spBtnSpin 0.9s linear infinite" }} />
                </motion.div>
              )}
              {!uploading && previewUrl && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: "#4ade80", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={10} color="#000" />
                </motion.div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
                <Upload size={13} color="#f43f5e" />
                {uploading ? "Uploading…" : "Profile Picture"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Click the avatar to upload a new photo</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>Max 5MB · JPG / PNG / GIF</div>
            </div>
          </div>

          <div className="sp-divider" />

          {/* Name field */}
          <div style={{ marginBottom: 18 }}>
            <Label icon={User} text="Full name" />
            <input
              type="text" className="sp-input"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 24 }}>
            <Label icon={Mail} text="Email address" />
            <input
              type="email" className="sp-input"
              value={session?.user?.email || ""}
              disabled
              placeholder="—"
            />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Email address cannot be changed</div>
          </div>

          {/* Save */}
          <button className="sp-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <><span className="sp-save-spin" /> Saving…</>
            ) : (
              <><Save size={14} /> Save Changes</>
            )}
          </button>
        </SectionCard>

        {/* ── Preferences ── */}
        <SectionCard delay={0.18}>
          <SectionTitle icon={Settings} title="Preferences" sub="Customize your experience" />

          {/* Email notifications toggle */}
          <div className="sp-pref-row">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Bell size={14} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>Email Notifications</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Receive task reminders and updates via email</div>
              </div>
            </div>
            <button
              className="sp-toggle-track"
              onClick={() => setEmailNotif(v => !v)}
              style={{ background: emailNotif ? "#be185d" : "rgba(255,255,255,0.1)", flexShrink: 0 }}
            >
              <div className="sp-toggle-thumb" style={{ left: emailNotif ? "23px" : "3px" }} />
            </button>
          </div>

          {/* Dark mode toggle (always on) */}
          <div className="sp-pref-row">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Moon size={14} color="#f43f5e" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 3, display: "flex", alignItems: "center", gap: 7 }}>
                  Dark Mode
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#f43f5e", background: "rgba(244,63,94,0.1)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(244,63,94,0.2)" }}>Always on</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Premium dark experience — always enabled</div>
              </div>
            </div>
            <button className="sp-toggle-track" style={{ background: "#be185d", flexShrink: 0 }} disabled>
              <div className="sp-toggle-thumb" style={{ left: "23px" }} />
            </button>
          </div>
        </SectionCard>

        {/* ── Danger zone ── */}
        <SectionCard delay={0.24}>
          <SectionTitle icon={Settings} title="Danger Zone" sub="Irreversible account actions" />
          <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.14)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(248,113,113,0.9)", marginBottom: 3 }}>Delete Account</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>Permanently delete your account and all data</div>
              </div>
              <button style={{
                padding: "9px 18px", borderRadius: 10,
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)",
                color: "rgba(248,113,113,0.8)", fontSize: 12.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Poppins',sans-serif",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(248,113,113,0.15)"; el.style.color = "#f87171"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(248,113,113,0.08)"; el.style.color = "rgba(248,113,113,0.8)"; }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </SectionCard>

      </div>
    </>
  );
}