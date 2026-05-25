// ============================================================
// ChurchFlow Liberia — Spiritual / Premium Hero Background
//
// Layered effect (back → front):
//   1. Deep navy base (#151022)
//   2. Two slow-drifting radial mesh gradients (deep + bright purple)
//   3. Soft vertical "light rays" with low opacity, gently breathing
//   4. A few floating glow orbs at low opacity
//   5. Subtle bottom-fade so text always reads cleanly
//
// All motion is CSS-driven, GPU-accelerated, slow, and respects
// prefers-reduced-motion. Pointer-events off so it never blocks UI.
// ============================================================
import React from 'react'

export default function ChurchFlowBackground({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#151022] ${className}`}
    >
      {/* Scoped keyframes + reduced-motion respect */}
      <style>{`
        @keyframes cf-mesh-a {
          0%, 100% { transform: translate3d(-8%, -10%, 0) scale(1); }
          50%      { transform: translate3d(6%, 4%, 0)    scale(1.06); }
        }
        @keyframes cf-mesh-b {
          0%, 100% { transform: translate3d(8%, 12%, 0)  scale(1.04); }
          50%      { transform: translate3d(-4%, -2%, 0) scale(1); }
        }
        @keyframes cf-mesh-c {
          0%, 100% { transform: translate3d(-2%, 8%, 0) scale(1); }
          50%      { transform: translate3d(4%, -6%, 0) scale(0.96); }
        }
        @keyframes cf-orb-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(20px, -28px, 0); }
        }
        @keyframes cf-orb-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(-18px, 24px, 0); }
        }
        @keyframes cf-orb-drift-c {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(14px, 22px, 0); }
        }
        @keyframes cf-ray-breathe {
          0%, 100% { opacity: 0.10; transform: translateY(0) scaleY(1); }
          50%      { opacity: 0.18; transform: translateY(-8px) scaleY(1.04); }
        }
        @keyframes cf-particle-rise {
          0%   { transform: translateY(20px); opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-60vh); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cf-anim { animation: none !important; }
        }
      `}</style>

      {/* ── Layer 1 — soft mesh gradient blobs (slow) ─────────── */}
      <div
        className="cf-anim absolute -top-1/4 -left-1/4 w-[120%] h-[120%] opacity-70 mix-blend-screen"
        style={{
          background: 'radial-gradient(closest-side, rgba(138,25,255,0.55) 0%, rgba(138,25,255,0) 70%)',
          animation: 'cf-mesh-a 22s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="cf-anim absolute -top-1/3 -right-1/4 w-[110%] h-[110%] opacity-60 mix-blend-screen"
        style={{
          background: 'radial-gradient(closest-side, rgba(91,0,184,0.60) 0%, rgba(91,0,184,0) 70%)',
          animation: 'cf-mesh-b 28s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="cf-anim absolute -bottom-1/3 left-1/4 w-[90%] h-[90%] opacity-55 mix-blend-screen"
        style={{
          background: 'radial-gradient(closest-side, rgba(138,25,255,0.40) 0%, rgba(138,25,255,0) 70%)',
          animation: 'cf-mesh-c 32s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* ── Layer 2 — gentle vertical light rays ──────────────── */}
      <div
        className="cf-anim absolute left-[18%] top-0 h-full w-[2px] origin-top"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0) 90%)',
          filter: 'blur(2px)',
          animation: 'cf-ray-breathe 14s ease-in-out infinite',
        }}
      />
      <div
        className="cf-anim absolute left-[42%] top-0 h-full w-[2px] origin-top"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0) 90%)',
          filter: 'blur(2px)',
          animation: 'cf-ray-breathe 18s ease-in-out infinite',
          animationDelay: '3s',
        }}
      />
      <div
        className="cf-anim absolute left-[72%] top-0 h-full w-[2px] origin-top"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.16) 35%, rgba(255,255,255,0) 90%)',
          filter: 'blur(2px)',
          animation: 'cf-ray-breathe 16s ease-in-out infinite',
          animationDelay: '6s',
        }}
      />

      {/* ── Layer 3 — minimal floating orbs ───────────────────── */}
      <Orb className="top-[18%] left-[12%]" size={260} color="rgba(138,25,255,0.18)"  blur={50}  anim="cf-orb-drift-a 18s ease-in-out infinite" />
      <Orb className="top-[55%] left-[68%]" size={340} color="rgba(91,0,184,0.18)"   blur={70}  anim="cf-orb-drift-b 24s ease-in-out infinite" />
      <Orb className="top-[78%] left-[28%]" size={200} color="rgba(138,25,255,0.14)" blur={45}  anim="cf-orb-drift-c 20s ease-in-out infinite" />
      <Orb className="top-[8%]  left-[78%]" size={180} color="rgba(255,200,80,0.05)" blur={40}  anim="cf-orb-drift-a 26s ease-in-out infinite" />

      {/* ── Layer 4 — soft floating particles ─────────────────── */}
      <Particles count={14} />

      {/* ── Layer 5 — soft vignette / readability overlay ────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(21,16,34,0) 0%, rgba(21,16,34,0.35) 60%, rgba(21,16,34,0.7) 100%)',
        }}
      />
      {/* very subtle bottom gradient so any UI sits on a clean dark base */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(21,16,34,0), rgba(21,16,34,0.85))',
        }}
      />
    </div>
  )
}

// ─── Floating glow orb ────────────────────────────────────────
function Orb({ className = '', size, color, blur, anim }) {
  return (
    <div
      className={`cf-anim absolute rounded-full mix-blend-screen ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        filter: `blur(${blur}px)`,
        animation: anim,
        willChange: 'transform',
      }}
    />
  )
}

// ─── Sparse drifting particles (soft, sparse, slow) ───────────
function Particles({ count = 12 }) {
  const items = React.useMemo(() => {
    const rand = (min, max) => Math.random() * (max - min) + min
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand(2, 98),
      size: rand(2, 4),
      duration: rand(22, 38),
      delay: rand(0, 18),
      opacity: rand(0.35, 0.65),
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {items.map(p => (
        <span
          key={p.id}
          className="cf-anim absolute rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `cf-particle-rise ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: '0 0 8px rgba(255,255,255,0.4)',
          }}
        />
      ))}
    </div>
  )
}
