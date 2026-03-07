'use client';

import React from 'react';
import {
  Search, CheckCircle2, Clock, AlertCircle, TrendingUp,
  LayoutDashboard, Users, Building2, Briefcase, ListTodo,
  History, Settings, ChevronRight, Bell, Plus
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users,           label: 'Contacts' },
  { icon: Building2,       label: 'Companies' },
  { icon: Briefcase,       label: 'Deals' },
  { icon: ListTodo,        label: 'Tasks' },
  { icon: History,         label: 'Recently' },
  { icon: Settings,        label: 'Settings' },
];

const metrics = [
  { value: '24', label: 'Total Tasks', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.15)',  icon: ListTodo     },
  { value: '12', label: 'Completed',   color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.15)',  icon: CheckCircle2 },
  { value: '8',  label: 'In Progress', color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.15)',  icon: Clock        },
  { value: '4',  label: 'Overdue',     color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', icon: AlertCircle  },
];

const bars = [
  { h: 40, day: 'Mo' }, { h: 55, day: 'Tu' }, { h: 35, day: 'We' },
  { h: 70, day: 'Th' }, { h: 50, day: 'Fr' }, { h: 30, day: 'Sa' }, { h: 65, day: 'Su' },
];

const tasks = [
  { task: 'Design landing page',  tag: 'High',   pct: 60, tagColor: '#f87171', tagBg: 'rgba(248,113,113,0.1)' },
  { task: 'Review pull requests', tag: 'Medium', pct: 40, tagColor: '#fb923c', tagBg: 'rgba(251,146,60,0.1)'  },
  { task: 'Fix auth bug',         tag: 'High',   pct: 80, tagColor: '#f87171', tagBg: 'rgba(248,113,113,0.1)' },
];

const activity = [
  { icon: CheckCircle2, color: '#34d399', text: 'Completed 3 tasks today',          time: '2m ago'  },
  { icon: TrendingUp,   color: '#60a5fa', text: 'Moved 2 tasks to in-progress',     time: '15m ago' },
  { icon: AlertCircle,  color: '#fbbf24', text: '1 task due tomorrow',              time: '1h ago'  },
];

export default function DashboardPreview() {
  return (
    <div
      className="w-full"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(160deg,#0d0d0f 0%,#0a0a0c 100%)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{`
        @keyframes barRise { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        .bar-animate { transform-origin:bottom; animation:barRise .7s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes progressFill { from{width:0%} }
        .progress-fill { animation:progressFill 1s ease both; }
        .dash-scroll::-webkit-scrollbar{display:none}
        .dash-scroll{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        background: 'rgba(255,255,255,0.02)',
        gap: 12,
        flexWrap: 'nowrap',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
            background: 'linear-gradient(135deg,#be185d,#9f1239)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(190,24,93,0.4)',
          }}>
            <ListTodo size={13} color="white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Plannior
          </span>
        </div>

        {/* Search — grows in the middle */}
        <div style={{
          flex: '1 1 0', minWidth: 0, maxWidth: 320,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <Search size={12} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Search tasks, contacts…
          </span>
          <span style={{
            marginLeft: 'auto', flexShrink: 0,
            fontSize: 9, padding: '2px 6px', borderRadius: 5,
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.05em',
          }}>⌘K</span>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Bell */}
          <div style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            cursor: 'pointer', position: 'relative',
          }}>
            <Bell size={13} color="rgba(255,255,255,0.45)" />
            {/* Notification dot */}
            <div style={{
              position: 'absolute', top: 5, right: 5,
              width: 5, height: 5, borderRadius: '50%',
              background: '#f87171',
              border: '1px solid #0d0d0f',
            }} />
          </div>

          {/* User avatar with initials */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#1e1e2e,#2a1a2e)',
            border: '1.5px solid rgba(236,72,153,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 10px rgba(236,72,153,0.15)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fb7185', letterSpacing: '0.02em' }}>JD</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'flex' }}>

        {/* Sidebar — icon only */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width: 50, flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.055)',
            background: 'rgba(0,0,0,0.2)',
            padding: '14px 0',
            gap: 3,
            alignItems: 'center',
          }}
        >
          {navItems.map(({ icon: Icon, label, active }) => (
            <div key={label} title={label} style={{
              width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'rgba(190,24,93,0.18)' : 'transparent',
              border: active ? '1px solid rgba(190,24,93,0.3)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}>
              <Icon size={14} color={active ? '#fb7185' : 'rgba(255,255,255,0.28)'} />
            </div>
          ))}
        </div>

        {/* Main */}
        <div
          className="flex-1 dash-scroll"
          style={{ padding: 'clamp(12px,2.5vw,20px)', overflowX: 'hidden', minWidth: 0 }}
        >
          {/* Page title */}
          <div style={{ marginBottom: 'clamp(12px,2vw,18px)' }}>
            <h2 style={{ fontSize: 'clamp(13px,1.8vw,16px)', fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em', marginBottom: 3 }}>
              Hello there!
            </h2>
            <p style={{ fontSize: 'clamp(9px,1.2vw,11px)', color: 'rgba(255,255,255,0.28)' }}>
              Here's your task overview for today
            </p>
          </div>

          {/* Metric cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: 'clamp(6px,1.2vw,10px)',
            marginBottom: 'clamp(10px,2vw,16px)',
          }}>
            {metrics.map(({ value, label, color, bg, border, icon: Icon }) => (
              <div key={label} style={{
                borderRadius: 11, border: `1px solid ${border}`, background: bg,
                padding: 'clamp(8px,1.5vw,12px) clamp(10px,1.8vw,14px)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -8, right: -8,
                  width: 32, height: 32, borderRadius: '50%',
                  background: color, opacity: 0.08, filter: 'blur(10px)',
                }} />
                <Icon size={12} color={color} style={{ marginBottom: 6, opacity: 0.9 }} />
                <p style={{ fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>
                  {value}
                </p>
                <p style={{ fontSize: 'clamp(8px,1vw,10px)', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(8px,1.5vw,12px)',
            marginBottom: 'clamp(8px,1.5vw,12px)',
          }}>

            {/* Bar/Line chart */}
            <div style={{
              borderRadius: 13, border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.025)', padding: 'clamp(12px,2vw,16px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(10px,1.5vw,14px)' }}>
                <div>
                  <p style={{ fontSize: 'clamp(10px,1.3vw,12px)', fontWeight: 600, color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.01em' }}>Weekly Progress</p>
                  <p style={{ fontSize: 'clamp(8px,1vw,10px)', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Tasks completed</p>
                </div>
                <span style={{
                  fontSize: 9, padding: '2px 7px', borderRadius: 6,
                  background: 'rgba(52,211,153,0.1)', color: '#34d399',
                  border: '1px solid rgba(52,211,153,0.2)', fontWeight: 600,
                }}>+18%</span>
              </div>

              {/* Line chart SVG */}
              <svg viewBox="0 0 260 64" style={{ width: '100%', height: 'clamp(36px,6vw,56px)', marginBottom: 10, overflow: 'visible' }}>
                <defs>
                  <linearGradient id="lg2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="0,52 37,36 74,44 111,30 148,32 185,40 222,14 260,14 260,64 0,64" fill="url(#lg2)" />
                <polyline points="0,52 37,36 74,44 111,30 148,32 185,40 222,14" fill="none" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                {[[0,52],[37,36],[74,44],[111,30],[148,32],[185,40],[222,14]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="2.2" fill="#ec4899"/>
                ))}
              </svg>

              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(3px,0.8vw,6px)', height: 'clamp(28px,5vw,40px)' }}>
                {bars.map(({ h, day }, i) => (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div className="bar-animate" style={{
                      width: '100%',
                      height: `${(h / 70) * 100}%`,
                      borderRadius: '3px 3px 2px 2px',
                      background: 'linear-gradient(180deg,rgba(236,72,153,0.7) 0%,rgba(190,24,93,0.35) 100%)',
                      animationDelay: `${i * 0.07}s`,
                    }} />
                    <span style={{ fontSize: 'clamp(6px,0.9vw,8px)', color: 'rgba(255,255,255,0.2)' }}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div style={{
              borderRadius: 13, border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.025)', padding: 16,
              display: 'flex', flexDirection: 'column',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.01em', marginBottom: 3 }}>Priority Split</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>24 active tasks</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f87171" strokeWidth="14" strokeDasharray="59.7 179" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#fb923c" strokeWidth="14" strokeDasharray="89.5 179" strokeDashoffset="-59.7" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#34d399" strokeWidth="14" strokeDasharray="119.3 179" strokeDashoffset="-149.2" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1 }}>24</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>tasks</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[{color:'#f87171',label:'High',val:5},{color:'#fb923c',label:'Med',val:8},{color:'#34d399',label:'Low',val:11}].map(({color,label,val})=>(
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginLeft: 'auto', paddingLeft: 12 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(8px,1.5vw,12px)',
          }}>

            {/* Recent tasks */}
            <div style={{
              borderRadius: 13, border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.025)', padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>Recent Tasks</p>
                <span style={{ fontSize: 11, color: '#fb7185', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                  View all <ChevronRight size={10} />
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map(({ task, tag, pct, tagColor, tagBg }, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    borderRadius: 9, border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{task}</span>
                      <span style={{
                        fontSize: 9, padding: '2px 7px', borderRadius: 4,
                        background: tagBg, color: tagColor,
                        border: `1px solid ${tagColor}30`, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.03em', flexShrink: 0,
                      }}>{tag}</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div className="progress-fill" style={{
                        height: '100%', width: `${pct}%`, borderRadius: 2,
                        background: `linear-gradient(90deg,${tagColor}70,${tagColor})`,
                        animationDelay: `${i * 0.15}s`,
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 5, display: 'block' }}>{pct}% complete</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div style={{
              borderRadius: 13, border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.025)', padding: 16,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: 14 }}>Activity</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activity.map(({ icon: Icon, color, text, time }, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    paddingBottom: i < activity.length - 1 ? 16 : 0,
                    position: 'relative',
                  }}>
                    {i < activity.length - 1 && (
                      <div style={{
                        position: 'absolute', left: 13, top: 28,
                        width: 1, height: 'calc(100% - 12px)',
                        background: 'rgba(255,255,255,0.05)',
                      }} />
                    )}
                    <div style={{
                      width: 26, height: 26,
                      borderRadius: 7, flexShrink: 0,
                      background: `${color}12`, border: `1px solid ${color}28`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={13} color={color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, wordBreak: 'break-word' }}>{text}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}