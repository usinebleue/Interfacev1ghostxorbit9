/**
 * AccueilHeroPage.tsx — FE.10 Prototype d'accueil hero
 * 3 variantes de hero banner 21:9 avec team C-Level AI
 * + Diagnostics + Quick Tips en dessous
 */

import { useState } from "react";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { Home, Sparkles, Rocket, Target, MessageSquare, BarChart3, Users, Zap, ChevronRight } from "lucide-react";

// ════════════════════════════════════════════════════════════════
// KEYFRAMES
// ════════════════════════════════════════════════════════════════
const HERO_KEYFRAMES = `
@keyframes hero-dot-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.9; }
}
@keyframes hero-circuit-flow {
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}
@keyframes hero-circuit-rev {
  0% { stroke-dashoffset: -200; }
  100% { stroke-dashoffset: 0; }
}
@keyframes hero-wave-flow {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  25% { transform: translateY(-3px); opacity: 0.6; }
  50% { transform: translateY(1px); opacity: 0.35; }
  75% { transform: translateY(-2px); opacity: 0.55; }
}
@keyframes hero-shimmer {
  0% { opacity: 0; transform: translateX(-20px); }
  50% { opacity: 0.3; }
  100% { opacity: 0; transform: translateX(20px); }
}
@keyframes hero-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
`;

// ════════════════════════════════════════════════════════════════
// HERO VARIANTS
// ════════════════════════════════════════════════════════════════

interface HeroVariant {
  id: string;
  label: string;
  image: string;
  title: string;
  subtitle: string;
  accentColor: string;
  accentLight: string;
}

const VARIANTS: HeroVariant[] = [
  {
    id: "v1",
    label: "Usine Smart Factory",
    image: "/agents/generated/team-usine-v1.png",
    title: "Bienvenue dans votre Usine Bleue",
    subtitle: "12 agents C-Level AI prêts à transformer votre entreprise manufacturière",
    accentColor: "#3b82f6",
    accentLight: "#93c5fd",
  },
  {
    id: "v2",
    label: "Salle de Contrôle",
    image: "/agents/generated/team-usine-v2.png",
    title: "Votre Usine Bleue est prête",
    subtitle: "L'intelligence artificielle au service de votre croissance manufacturière",
    accentColor: "#06b6d4",
    accentLight: "#67e8f9",
  },
  {
    id: "v3",
    label: "Floor Manufacturier",
    image: "/agents/generated/team-usine-v3.png",
    title: "Votre équipe C-Level AI vous attend",
    subtitle: "CEO, CTO, CFO, CMO, CSO, COO et 6 spécialistes à votre service",
    accentColor: "#8b5cf6",
    accentLight: "#c4b5fd",
  },
];

// ════════════════════════════════════════════════════════════════
// ANIMATED HERO BANNER
// ════════════════════════════════════════════════════════════════

function HeroBanner({ variant }: { variant: HeroVariant }) {
  const pid = variant.id;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      aspectRatio: "21/9",
      borderRadius: 16,
      overflow: "hidden",
      background: "#080c18",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      {/* Background Image */}
      <img
        src={variant.image}
        alt={variant.label}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
        }}
      />

      {/* SVG Circuit Overlay */}
      <svg
        viewBox="0 0 420 180"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 3,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter id={`hero-glow-${pid}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Horizontal circuit lines across the banner */}
        <path d="M 0 160 Q 50 155 100 158 Q 150 161 200 156 Q 250 151 300 157 Q 350 162 420 155"
          fill="none" stroke={`${variant.accentColor}50`} strokeWidth="0.5"
          strokeDasharray="8 12" style={{ animation: "hero-circuit-flow 8s linear infinite" }} />
        <path d="M 0 165 Q 60 160 120 163 Q 180 166 240 161 Q 300 156 360 162 Q 400 166 420 160"
          fill="none" stroke={`${variant.accentLight}40`} strokeWidth="0.4"
          strokeDasharray="6 14" style={{ animation: "hero-circuit-rev 10s linear infinite" }} />

        {/* Corner circuit traces — top left */}
        <path d="M 0 8 L 30 8 L 38 16 L 38 30" fill="none" stroke={`${variant.accentColor}35`} strokeWidth="0.6"
          strokeDasharray="4 6" style={{ animation: "hero-circuit-flow 6s linear infinite" }} />
        <path d="M 0 15 L 20 15 L 28 23 L 28 40" fill="none" stroke={`${variant.accentLight}30`} strokeWidth="0.5"
          strokeDasharray="3 5" style={{ animation: "hero-circuit-flow 7s linear 1s infinite" }} />

        {/* Corner circuit traces — top right */}
        <path d="M 420 8 L 390 8 L 382 16 L 382 30" fill="none" stroke={`${variant.accentColor}35`} strokeWidth="0.6"
          strokeDasharray="4 6" style={{ animation: "hero-circuit-rev 6s linear 0.5s infinite" }} />
        <path d="M 420 15 L 400 15 L 392 23 L 392 40" fill="none" stroke={`${variant.accentLight}30`} strokeWidth="0.5"
          strokeDasharray="3 5" style={{ animation: "hero-circuit-rev 7s linear 1.5s infinite" }} />

        {/* Scattered data dots */}
        {[{x:30,y:10},{x:382,y:12},{x:50,y:155},{x:370,y:158},{x:100,y:8},{x:320,y:10},{x:210,y:5}].map((p, i) => (
          <circle key={`hero-dot-${pid}-${i}`} cx={p.x} cy={p.y} r="1"
            fill={i % 2 === 0 ? variant.accentColor : variant.accentLight}
            filter={`url(#hero-glow-${pid})`} opacity="0.4"
            style={{ animation: `hero-dot-pulse ${3 + i * 0.3}s ease-in-out ${i * 0.4}s infinite` }} />
        ))}
      </svg>

      {/* Vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(8,12,24,0.4) 100%)",
        pointerEvents: "none",
      }} />

      {/* Bottom gradient for text */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "55%",
        zIndex: 4,
        background: "linear-gradient(to top, rgba(6,10,20,0.85) 0%, rgba(6,10,20,0.5) 40%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Waveform at bottom */}
      <svg
        viewBox="0 0 420 180"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id={`hero-wave-grad-${pid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor={variant.accentColor} stopOpacity="0.35" />
            <stop offset="50%" stopColor={variant.accentLight} stopOpacity="0.3" />
            <stop offset="80%" stopColor={variant.accentColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id={`hero-wglow-${pid}`}>
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M 10 172 Q 40 165 70 172 Q 100 179 130 168 Q 160 157 190 170 Q 220 179 250 168 Q 280 157 310 170 Q 340 179 370 168 Q 400 157 415 170"
          fill="none" stroke={`url(#hero-wave-grad-${pid})`} strokeWidth="1.2" strokeLinecap="round"
          filter={`url(#hero-wglow-${pid})`}
          style={{ animation: "hero-wave-flow 4s ease-in-out infinite" }}
        />
        <path d="M 10 172 Q 45 162 80 172 Q 115 182 150 166 Q 185 150 220 168 Q 255 182 290 166 Q 325 150 360 168 Q 395 182 415 172"
          fill="none" stroke={variant.accentColor} strokeWidth="0.6" strokeLinecap="round" opacity="0.15"
          style={{ animation: "hero-wave-flow 5s ease-in-out 0.5s infinite" }}
        />
      </svg>

      {/* Title overlay — bottom */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: 28,
        right: 28,
        zIndex: 6,
      }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}>
          {variant.title}
        </h1>
        <p style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.7)",
          marginTop: 6,
          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
        }}>
          {variant.subtitle}
        </p>
      </div>

      {/* Usine Bleue badge — top right */}
      <div style={{
        position: "absolute",
        top: 14,
        right: 18,
        zIndex: 6,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        borderRadius: 8,
        padding: "5px 12px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <Sparkles style={{ width: 12, height: 12, color: variant.accentLight }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em" }}>
          USINE BLEUE AI
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// QUICK TIP CARD
// ════════════════════════════════════════════════════════════════

function QuickTipCard({ icon: Icon, title, description, color, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: 12,
      padding: 18,
      cursor: "pointer",
      transition: "all 0.2s ease",
      animationDelay: `${delay}ms`,
      animationFillMode: "backwards",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon style={{ width: 18, height: 18, color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
            {description}
          </div>
        </div>
        <ChevronRight style={{ width: 16, height: 16, color: "#d1d5db", flexShrink: 0, marginTop: 2 }} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DIAGNOSTIC PREVIEW CARD
// ════════════════════════════════════════════════════════════════

function DiagnosticPreviewCard({ accentColor }: { accentColor: string }) {
  const pillars = [
    { label: "Ventes", score: null, icon: "📊" },
    { label: "Innovation", score: null, icon: "💡" },
    { label: "Temps", score: null, icon: "⏰" },
    { label: "Argent", score: null, icon: "💰" },
    { label: "Actifs", score: null, icon: "🏭" },
  ];

  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: 14,
      padding: 22,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <BarChart3 style={{ width: 16, height: 16, color: "#fff" }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Diagnostic VITAA</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Évaluez la santé de votre entreprise</div>
        </div>
      </div>

      {/* 5 Pillars — empty state */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {pillars.map((p) => (
          <div key={p.label} style={{
            flex: 1,
            textAlign: "center",
            padding: "10px 4px",
            background: "#f9fafb",
            borderRadius: 10,
            border: "1px dashed #e5e7eb",
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {p.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#d1d5db", marginTop: 4 }}>—</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button style={{
        width: "100%",
        padding: "10px 16px",
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.2s",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      >
        <Zap style={{ width: 14, height: 14 }} />
        Lancer mon premier diagnostic
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════

export function AccueilHeroPage() {
  const [activeTab, setActiveTab] = useState(0);
  const variant = VARIANTS[activeTab];

  return (
    <PageLayout maxWidth="5xl" header={
      <PageHeader
        icon={Home}
        title="FE.10 — Accueil Hero"
        subtitle="3 variantes de page d'accueil — prototype"
      />
    }>
      <style>{HERO_KEYFRAMES}</style>

      {/* ─── Variant Tabs ─── */}
      <div style={{
        display: "flex",
        gap: 4,
        marginBottom: 16,
        background: "#f3f4f6",
        borderRadius: 10,
        padding: 3,
      }}>
        {VARIANTS.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: 12,
              fontWeight: activeTab === i ? 700 : 500,
              color: activeTab === i ? "#fff" : "#6b7280",
              background: activeTab === i
                ? `linear-gradient(135deg, ${v.accentColor}, ${v.accentColor}cc)`
                : "transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            V{i + 1} — {v.label}
          </button>
        ))}
      </div>

      {/* ─── Hero Banner ─── */}
      <HeroBanner variant={variant} />

      {/* ─── Content below hero ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        marginTop: 20,
      }}>
        {/* Left — Quick Tips */}
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#374151",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Pour bien démarrer
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <QuickTipCard
              icon={MessageSquare}
              title="Parlez à CarlOS"
              description="Votre CEO AI est prêt à vous guider. Posez-lui votre première question."
              color="#3b82f6"
              delay={100}
            />
            <QuickTipCard
              icon={Target}
              title="Lancez un diagnostic"
              description="5 minutes pour évaluer vos forces et vos angles morts avec le VITAA."
              color="#10b981"
              delay={200}
            />
            <QuickTipCard
              icon={Users}
              title="Découvrez votre équipe"
              description="12 agents C-Level spécialisés: finances, marketing, stratégie, opérations..."
              color="#8b5cf6"
              delay={300}
            />
            <QuickTipCard
              icon={Rocket}
              title="Explorez les départements"
              description="Chaque département a ses KPIs, ses templates et son agent dédié."
              color="#f59e0b"
              delay={400}
            />
          </div>
        </div>

        {/* Right — Diagnostic Preview */}
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#374151",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Votre diagnostic
          </div>
          <DiagnosticPreviewCard accentColor={variant.accentColor} />

          {/* Team strip mini */}
          <div style={{
            marginTop: 16,
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 14,
            padding: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>
              Votre GhostX Team
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { name: "CarlOS", role: "CEO", color: "#3b82f6" },
                { name: "Tim", role: "CTO", color: "#8b5cf6" },
                { name: "Frank", role: "CFO", color: "#10b981" },
                { name: "Mathilde", role: "CMO", color: "#ec4899" },
                { name: "Simone", role: "CSO", color: "#ef4444" },
                { name: "Olivier", role: "COO", color: "#f97316" },
                { name: "Hélène", role: "CHRO", color: "#14b8a6" },
                { name: "Inès", role: "CINO", color: "#ec4899" },
                { name: "Rich", role: "CRO", color: "#f59e0b" },
                { name: "Loulou", role: "CLO", color: "#6366f1" },
                { name: "Sébastien", role: "CISO", color: "#71717a" },
                { name: "Paco", role: "CPO", color: "#64748b" },
              ].map((bot) => (
                <div key={bot.name} style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: `${bot.color}10`,
                  border: `1px solid ${bot.color}25`,
                  fontSize: 10,
                  fontWeight: 600,
                  color: bot.color,
                  whiteSpace: "nowrap",
                }}>
                  {bot.role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
