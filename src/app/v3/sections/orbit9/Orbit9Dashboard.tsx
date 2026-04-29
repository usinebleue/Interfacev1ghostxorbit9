/**
 * Orbit9Dashboard.tsx — Vue d'ensemble réseau (Pattern A = CockpitView)
 *
 * Navigation sidebar = switch content (pas anchor scroll)
 * Vue d'ensemble = hero compact + KPIs + signaux + feed pleine largeur + grille boxes
 * Sous-section = header pastel bg-[#00B4D8]/10 + liste numérotée (CockpitItemRow)
 * Hero + KPIs = SEULEMENT sur la vue d'ensemble (pas dans les sous-sections)
 *
 * Utilisé par: Orbit9View (o9Section === "dashboard")
 */

import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, ChevronRight, ListChecks, Activity, ThumbsUp, MessageCircle, Share2, Trophy, Bot, UserPlus, Handshake, Zap, Newspaper, ChevronDown, Star, DollarSign, Rocket, Calendar, Globe, Factory, BarChart3, Clock, Info, FileText, Image as ImageIcon, MapPin, Users } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { SF } from "../../core/styles";
import { PHASE_COLORS, type PhaseKey, BOT_AVATAR_MAP } from "../shared/dept-data";
import { LivingHero } from "../shared/LivingHero";

import {
  O9_DASHBOARD_KPIS,
  O9_DASH_ROW1,
  O9_DASH_SIDEBAR,
  O9_GRID_BLOCS,
  O9_GRID_IDS,
  O9_SECTION_BLOCS,
  O9_SECTION_DESC,
  O9_FEED_OVERVIEW,
  O9_PIONNIERS,
  O9_TECH_ADOPTION,
  O9_TOP_SECTORS,
  O9_INDUSTRY_OPPORTUNITIES,
  O9_NOUVELLE_EXEMPLE,
  O9_NOUVELLES_LISTE,
  O9_EVENEMENTS_LISTE,
  O9_OBSTACLES_ADOPTION,
  O9_ROI_STATS,
  O9_COST_SOLUTIONS,
  O9_ROBOT_DENSITY,
  O9_REFERENCE_STUDIES,
} from "./orbit9-data";

import {
  CockpitCard,
  CockpitItemRow,
  CockpitSignalCard,
  CockpitSectionHeader,
  O9ScoreBar,
  PionnierDot,
} from "./orbit9-helpers";

// ═══ FEED SOCIAL — Données du fil d'actualité réseau ═══

type FeedPostType = "win" | "bot" | "member" | "trisociation" | "milestone" | "collab" | "alert";

interface FeedPost {
  id: string;
  type: FeedPostType;
  avatar: string;
  author: string;
  role: string;
  time: string;
  content: string;
  detail?: string;
  likes: number;
  comments: number;
  isNew?: boolean;
}

const FEED_TYPE_CONFIG: Record<FeedPostType, { label: string; color: string; icon: React.ElementType }> = {
  win:          { label: "Victoire",      color: "bg-emerald-50 text-emerald-700", icon: Trophy },
  bot:          { label: "Auto-Scout",    color: "bg-blue-50 text-blue-700",       icon: Bot },
  member:       { label: "Nouveau membre",color: "bg-teal-50 text-teal-700",       icon: UserPlus },
  trisociation: { label: "Trisociation",  color: "bg-violet-50 text-violet-700",   icon: Handshake },
  milestone:    { label: "Jalon",         color: "bg-amber-50 text-amber-700",     icon: Zap },
  collab:       { label: "Collaboration", color: "bg-cyan-50 text-cyan-700",       icon: Handshake },
  alert:        { label: "Alerte réseau", color: "bg-red-50 text-red-700",         icon: AlertTriangle },
};

const FEED_POSTS: FeedPost[] = [
  {
    id: "f1", type: "win", avatar: BOT_AVATAR_MAP.CEOB, author: "Les Titans", role: "Cellule interne",
    time: "il y a 12 min", isNew: true,
    content: "Contrat de 500K$ remporté en collaboration avec MetalPro! La cellule Les Titans livre son 3e projet conjoint.",
    detail: "Automatisation d'une ligne de soudure complète — 18 mois de collaboration récompensés.",
    likes: 24, comments: 8,
  },
  {
    id: "f2", type: "bot", avatar: BOT_AVATAR_MAP.CEOB, author: "CarlOS — Auto-Scout", role: "Intelligence artificielle",
    time: "il y a 45 min", isNew: true,
    content: "3 nouvelles complémentarités détectées dans le réseau. Scores: 87%, 79%, 74%.",
    detail: "AutomatikPro (R&D partagée), TransQC (vente conjointe), FormaTech (alliance formation).",
    likes: 5, comments: 2,
  },
  {
    id: "f3", type: "trisociation", avatar: BOT_AVATAR_MAP.CROB, author: "Usine Bleue × AutomatikPro", role: "Session facilitée par CarlOS",
    time: "il y a 2h",
    content: "Trisociation terminée avec succès! Plan d'action défini pour la R&D en vision artificielle.",
    detail: "Prochaine étape: prototype commun d'ici juin 2026. Budget partagé 50/50.",
    likes: 18, comments: 6,
  },
  {
    id: "f4", type: "member", avatar: BOT_AVATAR_MAP.CPOB, author: "AcierPlus Inc.", role: "Nouveau membre — Usinage / Métal",
    time: "il y a 5h",
    content: "Bienvenue à AcierPlus Inc. dans le réseau Brain Team! Secteur Usinage, basé en Montérégie.",
    detail: "Spécialités: transformation d'acier et aluminium, 200T/an. Score VITAA initial: 68%.",
    likes: 31, comments: 12,
  },
  {
    id: "f5", type: "milestone", avatar: BOT_AVATAR_MAP.CSOB, author: "Réseau Brain Team", role: "Jalon réseau",
    time: "il y a 8h",
    content: "Le réseau atteint 142 entreprises scannées par Auto-Scout! Taux de conversion: 62%.",
    likes: 42, comments: 15,
  },
  {
    id: "f6", type: "collab", avatar: BOT_AVATAR_MAP.CFOB, author: "Escouade Ventes", role: "Cellule interne",
    time: "il y a 1j",
    content: "Mutualisation d'achats acier complétée avec AcierPlus. Économie combinée de 8% sur le volume.",
    detail: "350T/an combinées — palier fournisseur premium atteint.",
    likes: 15, comments: 4,
  },
  {
    id: "f7", type: "alert", avatar: BOT_AVATAR_MAP.COOB, author: "Cellule MetalPro", role: "Alerte confiance",
    time: "il y a 2j",
    content: "Score de confiance en baisse: 78% → 62%. Inactivité de 3 semaines détectée.",
    detail: "Action suggérée: planifier un point de suivi avec le leader de cellule.",
    likes: 3, comments: 7,
  },
];

// Helper — Badge de phase réutilisable
function PhaseBadge({ phase }: { phase?: string }) {
  if (!phase) return null;
  const pc = PHASE_COLORS[phase as PhaseKey];
  if (!pc) return null;
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", pc.badge)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", pc.dot)} />{pc.label}
    </span>
  );
}

export function Orbit9Dashboard() {
  // null = vue d'ensemble, string = sous-section active
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [feedExpanded, setFeedExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const handleAction = (phase: PhaseKey, context: string) => {
    console.log("Orbit9 action:", phase, context);
  };

  const signalItems = (O9_DASH_ROW1[0]?.items || []).slice(0, 3);
  const activeSidebarId = activeSection || "kpis";
  const detailBloc = activeSection ? O9_SECTION_BLOCS[activeSection] : null;

  const handleSidebarClick = (id: string) => {
    setActiveSection(id === "kpis" ? null : id);
    setSelectedItem(null);
  };

  const handleBoxClick = (index: number) => {
    const sectionId = O9_GRID_IDS[index];
    if (sectionId) setActiveSection(sectionId);
  };

  // Actions de phase seulement sur sections actionnables (pas nouvelles/industrie/événements/économie)
  const ACTIONABLE = new Set(["signaux", "vedette", "matches", "pionniers", "mandataire"]);
  const itemAction = activeSection && ACTIONABLE.has(activeSection) ? handleAction : undefined;

  // Données header sous-section (calculées hors du JSX)
  const urgentCount = detailBloc ? detailBloc.items.filter(it => it.urgent).length : 0;
  const phaseDistrib = detailBloc
    ? detailBloc.items.filter(it => it.phase).reduce((acc, it) => {
        if (it.phase) acc[it.phase] = (acc[it.phase] || 0) + 1; return acc;
      }, {} as Record<string, number>)
    : {};
  const avgPct = detailBloc && detailBloc.items.filter(it => it.pct !== undefined).length > 0
    ? Math.round(detailBloc.items.filter(it => it.pct !== undefined).reduce((a, it) => a + (it.pct || 0), 0) / detailBloc.items.filter(it => it.pct !== undefined).length)
    : null;

  return (
    <div className="space-y-4">
      {/* ═══ VUE D'ENSEMBLE — Hero + KPIs + Signaux (seulement quand pas de sous-section) ═══ */}
      {!activeSection && (
        <>
          {/* Hero compact */}
          <LivingHero blur1="bg-violet-100/70" blur2="bg-indigo-100/60" subtitleColor="text-violet-600" subtitle="Réseau Orbit9" title="Votre réseau interconnecté." description="Cellules, partenaires et opportunités en synergie.">
            <div className="relative flex items-center justify-center overflow-visible" style={{ width: 340, height: 160 }}>
              <svg viewBox="0 0 200 200" className="overflow-visible" style={{ width: 300, height: 300 }}>
                <circle cx="100" cy="100" r="16" fill="url(#o9-core-grad)" filter="drop-shadow(0 0 15px #a78bfa)"/>
                <circle cx="100" cy="100" r="18" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" className="anim-orb-1"/>
                <g className="anim-orb-1"><circle cx="100" cy="100" r="35" fill="none" stroke="#c084fc" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.6"/><circle cx="135" cy="100" r="4.5" fill="#d8b4fe" className="anim-dot" style={{ color: '#d8b4fe' }} /></g>
                <g className="anim-orb-2"><circle cx="100" cy="100" r="60" fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.4"/><circle cx="100" cy="40" r="5" fill="#6366f1" className="anim-dot" style={{ color: '#6366f1' }}/><circle cx="100" cy="160" r="3.5" fill="#818cf8" className="anim-dot" style={{ color: '#818cf8' }}/></g>
                <g className="anim-orb-3"><circle cx="100" cy="100" r="90" fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 6" opacity="0.8"/><circle cx="190" cy="100" r="18" fill="rgba(167, 139, 250, 0.15)"/><circle cx="190" cy="100" r="13" fill="none" stroke="#c084fc" strokeWidth="0.5"/><circle cx="190" cy="100" r="7" fill="#8b5cf6" className="anim-dot" style={{ color: '#8b5cf6' }}/><path d="M 116 100 L 183 100" fill="none" stroke="url(#o9-link-grad)" strokeWidth="1" opacity="0.5" /></g>
                <defs>
                  <radialGradient id="o9-core-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffffff"/><stop offset="40%" stopColor="#d8b4fe"/><stop offset="100%" stopColor="#7c3aed"/></radialGradient>
                  <linearGradient id="o9-link-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c084fc" stopOpacity="0"/><stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8"/><stop offset="100%" stopColor="#c084fc" stopOpacity="0"/></linearGradient>
                </defs>
              </svg>
            </div>
          </LivingHero>

          {/* Signaux max 3 */}
          {signalItems.length > 0 && (
            <div>
              <CockpitSectionHeader icon={AlertTriangle} title="À porter attention" count={signalItems.length} />
              <div className="grid grid-cols-3 gap-3">
                {signalItems.map((item, i) => (
                  <CockpitSignalCard key={i} item={item} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ SOUS-SECTION HEADER — Pleine largeur workspace (au-dessus du sidebar+contenu) ═══ */}
      {activeSection && detailBloc && (() => {
        const Icon = detailBloc.icon;
        return (
          <>
            <button onClick={() => setActiveSection(null)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour à la vue d'ensemble
            </button>
            <div className="rounded-xl bg-[#00B4D8]/10 px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/80 border border-gray-200 flex items-center justify-center shadow-sm">
                    <Icon className="h-5 w-5 text-gray-900 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{detailBloc.title}</h3>
                    {O9_SECTION_DESC[activeSection] && (
                      <p className="text-xs text-gray-500 mt-0.5">{O9_SECTION_DESC[activeSection]}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-white/60 px-2 py-1 rounded-md">
                    <ListChecks className="h-3.5 w-3.5" />{detailBloc.items.length} éléments
                  </span>
                  {urgentCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-md">
                      <AlertTriangle className="h-3.5 w-3.5" />{urgentCount} urgent{urgentCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {avgPct !== null && (
                    <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/60 text-gray-600">
                      <Activity className="h-3.5 w-3.5 inline mr-1" />{avgPct}% moy.
                    </span>
                  )}
                </div>
              </div>
              {Object.keys(phaseDistrib).length > 0 && (
                <div className="flex items-center gap-1.5 mt-2.5">
                  {Object.entries(phaseDistrib).map(([phase, count]) => {
                    const pc = PHASE_COLORS[phase as PhaseKey];
                    return pc ? (
                      <span key={phase} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1", pc.badge)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", pc.dot)} />
                        {pc.label} ({count})
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* ═══ SIDEBAR + CONTENU ═══ */}
      <div className="flex gap-3">
        {/* Sidebar — switch content */}
        <div className={cn("w-[180px] shrink-0 space-y-0.5 transition-all", activeSection && "pt-2")}>
          {O9_DASH_SIDEBAR.map((item, idx) => {
            if (!item) return <div key={`sep-${idx}`} className={SF.separator} />;
            const Icon = item.icon;
            const isActive = activeSidebarId === item.id;
            return (
              <button key={item.id} type="button" onClick={() => handleSidebarClick(item.id)}
                className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
                <Icon className={cn(isActive ? SF.iconActive : SF.iconInactive)} />
                <span className={cn(isActive ? SF.labelActive : SF.labelInactive)}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0 space-y-3">
          {detailBloc ? (
            /* ═══ SOUS-SECTION — Rendu SPÉCIFIQUE par section (pas de liste générique) ═══ */
            (() => {
              switch (activeSection) {

                /* ──── SIGNAUX: cards alertes avec bordure gauche colorée ──── */
                case "signaux":
                  return (
                    <div className="space-y-2">
                      {detailBloc.items.map((item, i) => {
                        const bc = item.urgent ? "border-l-red-500" : item.valueColor?.includes("orange") ? "border-l-orange-400" : item.valueColor?.includes("blue") ? "border-l-blue-400" : "border-l-amber-400";
                        return (
                          <div key={i} className={cn("rounded-xl border border-gray-200 border-l-[4px] bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all px-4 py-3", bc)}>
                            <div className="flex items-center gap-3">
                              {item.urgent && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs font-bold text-gray-900">{item.primary}</span>
                                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", item.urgent ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600")}>{item.value}</span>
                                </div>
                                <p className="text-[11px] text-gray-500">{item.secondary}</p>
                              </div>
                              <PhaseBadge phase={item.phase} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );

                /* ──── VEDETTE: hero gradient + grille stats ──── */
                case "vedette": {
                  const heroItem = detailBloc.items[0];
                  const statItems = detailBloc.items.slice(1);
                  return (
                    <div className="space-y-3">
                      {heroItem && (
                        <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                              <Star className="h-8 w-8 text-white fill-white/30" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">Cellule vedette du mois</p>
                              <h3 className="text-xl font-extrabold text-white">Les Titans</h3>
                              <p className="text-white/70 text-xs mt-0.5">{heroItem.secondary}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-extrabold text-white">{heroItem.value}</div>
                              <p className="text-white/70 text-[10px]">Performance</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        {statItems.map((item, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-gray-500 font-medium truncate flex-1">{item.primary}</span>
                              {item.value && <span className={cn("text-sm font-extrabold ml-2", item.valueColor || "text-gray-700")}>{item.value}</span>}
                            </div>
                            {item.pct !== undefined && <O9ScoreBar value={item.pct} color={item.pctColor} />}
                            <p className="text-[9px] text-gray-400 mt-1 line-clamp-2">{item.secondary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                /* ──── MATCHES: cards pipeline avec score bar + avatar bot ──── */
                case "matches":
                  return (
                    <div className="space-y-2">
                      {detailBloc.items.map((item, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-3">
                            {item.bot && <img src={BOT_AVATAR_MAP[item.bot] || BOT_AVATAR_MAP.CEOB} alt="" className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm object-cover shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-900 truncate">{item.primary}</span>
                                <span className={cn("text-lg font-extrabold", item.valueColor || "text-gray-700")}>{item.value}</span>
                              </div>
                              {item.pct !== undefined && <O9ScoreBar value={item.pct} color={item.pctColor} />}
                              <p className="text-[10px] text-gray-500 mt-1">{item.secondary}</p>
                            </div>
                            <PhaseBadge phase={item.phase} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );

                /* ──── FEED: fil d'actualité social complet ──── */
                case "feed":
                  return (
                    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {FEED_POSTS.map(post => {
                          const cfg = FEED_TYPE_CONFIG[post.type];
                          return (
                            <div key={post.id} className={cn("px-4 py-3 hover:bg-gray-50/50 transition-colors", post.isNew && "bg-blue-50/30")}>
                              <div className="flex gap-3">
                                <img src={post.avatar} alt="" className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm object-cover shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-bold text-gray-900 truncate">{post.author}</span>
                                    <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0", cfg.color)}>{cfg.label}</span>
                                    {post.isNew && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                    <span className="text-[10px] text-gray-400 ml-auto shrink-0">{post.time}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mb-1">{post.role}</p>
                                  <p className="text-xs text-gray-700 leading-relaxed">{post.content}</p>
                                  {post.detail && <p className="text-[10px] text-gray-500 mt-1 leading-relaxed italic">{post.detail}</p>}
                                  <div className="flex items-center gap-4 mt-2">
                                    <button type="button" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"><ThumbsUp className="h-3 w-3" /> {post.likes}</button>
                                    <button type="button" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"><MessageCircle className="h-3 w-3" /> {post.comments}</button>
                                    <button type="button" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"><Share2 className="h-3 w-3" /> Partager</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );

                /* ──── NOUVELLES: look média/actualité avec images + filtres par sujet ──── */
                case "nouvelles": {
                  const NEWS_SUBJECTS = ["Tous", "Robotique", "IA", "Automatisation", "Marché", "Québec"];
                  if (selectedItem !== null) {
                    const nv = O9_NOUVELLE_EXEMPLE;
                    return (
                      <div className="space-y-3">
                        <button onClick={() => setSelectedItem(null)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
                          <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour aux nouvelles
                        </button>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
                          <div className="h-48 relative">
                            <img src={nv.imageUrl || ""} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <span className="absolute bottom-3 left-5 text-[9px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-sm">{nv.category}</span>
                            <span className="absolute bottom-3 right-5 text-[9px] text-white/90 bg-black/30 px-2 py-0.5 rounded">{nv.date}</span>
                          </div>
                          <div className="px-6 py-5">
                            <h2 className="text-base font-extrabold text-gray-900 leading-snug">{nv.title}</h2>
                            <div className="flex items-center gap-2 mt-1.5 mb-4 pb-3 border-b border-gray-100">
                              <span className="text-[10px] text-gray-400">{nv.source}</span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400">{nv.date}</span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium leading-relaxed mb-4">{nv.summary}</p>
                            {nv.paragraphs.map((p, i) => (
                              <p key={i} className="text-xs text-gray-700 leading-relaxed mb-3">{p}</p>
                            ))}
                            <div className="border-t border-gray-100 pt-4 mt-2 space-y-2.5">
                              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                                  <span className="text-xs font-bold text-amber-800">Impact pour le réseau</span>
                                </div>
                                <p className="text-[11px] text-amber-700 leading-relaxed">{nv.impact}</p>
                              </div>
                              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Rocket className="h-3.5 w-3.5 text-emerald-600" />
                                  <span className="text-xs font-bold text-emerald-800">Action suggérée</span>
                                </div>
                                <p className="text-[11px] text-emerald-700 leading-relaxed">{nv.actionSuggested}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {/* Filtres par sujet — boutons clicables */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {NEWS_SUBJECTS.map(s => (
                          <button key={s} className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-medium transition-all cursor-pointer",
                            s === "Tous" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200"
                          )}>{s}</button>
                        ))}
                        <span className="text-[9px] text-gray-400 ml-auto">{O9_NOUVELLES_LISTE.length} articles</span>
                      </div>
                      {/* Carte vedette — première nouvelle en grand */}
                      <div onClick={() => setSelectedItem(0)}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden cursor-pointer">
                        <div className="h-40 relative">
                          <img src={O9_NOUVELLES_LISTE[0].imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full text-white mb-1.5 inline-block", O9_NOUVELLES_LISTE[0].categoryColor)}>{O9_NOUVELLES_LISTE[0].category}</span>
                            <h3 className="text-sm font-extrabold text-white leading-snug">{O9_NOUVELLES_LISTE[0].title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-white/70">{O9_NOUVELLES_LISTE[0].source}</span>
                              <span className="text-[9px] text-white/50">•</span>
                              <span className="text-[9px] text-white/70">{O9_NOUVELLES_LISTE[0].date}</span>
                              <span className="text-[9px] text-white/50">•</span>
                              <Clock className="h-2.5 w-2.5 text-white/50" />
                              <span className="text-[9px] text-white/70">{O9_NOUVELLES_LISTE[0].readTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Grille articles — style média avec images */}
                      <div className="grid grid-cols-2 gap-3">
                        {O9_NOUVELLES_LISTE.slice(1).map((nv, i) => (
                          <div key={nv.id} onClick={() => setSelectedItem(i + 1)}
                            className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden cursor-pointer group">
                            <div className="h-28 relative overflow-hidden">
                              <img src={nv.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <span className={cn("absolute top-2 left-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full text-white", nv.categoryColor)}>{nv.category}</span>
                              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 text-white/70" />
                                <span className="text-[8px] text-white/80">{nv.readTime}</span>
                              </div>
                            </div>
                            <div className="px-3 py-2.5">
                              <h4 className="text-[11px] font-bold text-gray-900 leading-snug line-clamp-2">{nv.title}</h4>
                              <p className="text-[9px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{nv.summary}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[8px] text-gray-400">{nv.source}</span>
                                <span className="text-[8px] text-gray-300">•</span>
                                <span className="text-[8px] text-gray-400">{nv.date}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                /* ──── INDUSTRIE: dashboard complet (5 tabs TRG originale intégrés) ──── */
                case "industrie":
                  return (
                    <div className="space-y-4">
                      {/* 1. KPIs principaux — grid 4 cols */}
                      <div className="grid grid-cols-4 gap-2">
                        {detailBloc.items.slice(0, 4).map((item, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-3 text-center">
                            <div className={cn("text-lg font-extrabold", item.valueColor || "text-gray-700")}>{item.value}</div>
                            <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{item.primary}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5">{item.secondary}</p>
                          </div>
                        ))}
                      </div>

                      {/* 2. Portrait secondaire — 3 indicateurs clés */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Établissements", value: "13,694", detail: "Employeurs (800+ en automatisation)", source: "ISQ/REAI 2024" },
                          { label: "ERP connecté", value: "3%", detail: "51% ont un ERP mais 3% pleinement connecté", source: "MEIE 2025" },
                          { label: "Maturité numérique haute", value: "19%", detail: "24% font 4 types d'innovation", source: "MEIE/STIQ 2025" },
                        ].map((s, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-3">
                            <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">{s.label}</p>
                            <p className="text-lg font-extrabold text-gray-800">{s.value}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">{s.detail}</p>
                            <p className="text-[8px] text-gray-400 italic mt-0.5">{s.source}</p>
                          </div>
                        ))}
                      </div>

                      {/* 3. Adoption technologique — barres horizontales */}
                      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                          <BarChart3 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                          <span className="text-sm font-bold text-gray-900">Adoption technologique — PME Manufacturières QC</span>
                        </div>
                        <div className="px-4 py-3 space-y-2.5">
                          {O9_TECH_ADOPTION.map((t, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-gray-700">{t.tech}</span>
                                <span className="text-[10px] font-bold text-gray-900">{t.rate}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-1000 ease-out",
                                  t.rate >= 50 ? "bg-emerald-500" : t.rate >= 40 ? "bg-blue-500" : t.rate >= 30 ? "bg-amber-500" : "bg-gray-400"
                                )} style={{ width: `${t.rate}%` }} />
                              </div>
                              <p className="text-[8px] text-gray-400 mt-0.5">{t.source}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Obstacles à l'adoption — barres rouges */}
                      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600 stroke-[2.5]" />
                          <span className="text-sm font-bold text-gray-900">Obstacles à l'adoption — 2024-2026</span>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          {O9_OBSTACLES_ADOPTION.map((o, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-700">{o.obstacle}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-900">{o.pct}%</span>
                                  <span className="text-[8px] text-gray-400">{o.source}</span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full",
                                  o.pct >= 60 ? "bg-red-400" : o.pct >= 50 ? "bg-amber-400" : "bg-blue-400"
                                )} style={{ width: `${o.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 pb-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                            <span className="text-[9px] text-amber-700">L'obstacle n'est plus le refus de changer mais l'incapacité à absorber et évaluer le changement (STIQ 2025)</span>
                          </div>
                        </div>
                      </div>

                      {/* 5. ROI Transformation Numérique */}
                      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                          <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                          <span className="text-sm font-bold text-gray-900">ROI de la transformation numérique</span>
                        </div>
                        <div className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-center">
                              <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Retour moyen</p>
                              <p className="text-2xl font-extrabold text-emerald-600">1.60$</p>
                              <p className="text-[9px] text-gray-500">par dollar investi en techno</p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                              <p className="text-[8px] text-emerald-600 uppercase font-bold mb-0.5">Leaders numériques</p>
                              <p className="text-2xl font-extrabold text-emerald-700">2.40$</p>
                              <p className="text-[9px] text-emerald-600">par dollar investi</p>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {O9_ROI_STATS.map((r, i) => (
                              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-[10px] text-gray-700 flex-1">{r.impact}</span>
                                <span className="text-[10px] font-extrabold text-emerald-600">{r.pct}</span>
                                <span className="text-[9px] text-gray-400">{r.desc}</span>
                              </div>
                            ))}
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-3 flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span className="text-[9px] text-blue-700">L'IA générative permet d'économiser 2.05h pour chaque 0.97h investie (FCEI 2025)</span>
                          </div>
                        </div>
                      </div>

                      {/* 6. Top secteurs + KPIs restants — côte à côte */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                            <Factory className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                            <span className="text-sm font-bold text-gray-900">Top secteurs QC</span>
                            <span className="text-[9px] text-gray-400 ml-auto">62% du PIB manuf.</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {O9_TOP_SECTORS.map((s, i) => (
                              <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                                <span className="text-[10px] font-bold text-white bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                                <span className="text-xs text-gray-700 flex-1">{s.secteur}</span>
                                <span className="text-xs font-extrabold text-gray-900">{s.poids}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {detailBloc.items.slice(4, 8).map((item, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-500 font-medium flex-1">{item.primary}</span>
                                <span className={cn("text-sm font-extrabold ml-2 shrink-0", item.valueColor || "text-gray-700")}>{item.value}</span>
                              </div>
                              {item.pct !== undefined && <O9ScoreBar value={item.pct} color={item.pctColor} />}
                              <p className="text-[9px] text-gray-400 mt-0.5">{item.secondary}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 7. Coûts par solution + Densité robotique — côte à côte */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                            <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                            <span className="text-sm font-bold text-gray-900">Coûts par solution</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {O9_COST_SOLUTIONS.map((c, i) => (
                              <div key={i} className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                <span className="text-[10px] font-bold text-gray-800">{c.type}</span>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="text-[9px] text-gray-500">Matériel: {c.materiel}</span>
                                  <span className="text-xs font-extrabold text-blue-700">{c.total}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <span className="text-[8px] text-gray-400 italic">Total 1re année (matériel + intégration + formation). Source: IFR 2024, REAI</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                            <Globe className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                            <span className="text-sm font-bold text-gray-900">Densité robotique</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {O9_ROBOT_DENSITY.map((r, i) => (
                              <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                <div>
                                  <span className="text-[10px] font-bold text-gray-800">{r.pays}</span>
                                  <p className="text-[8px] text-gray-400">{r.note}</p>
                                </div>
                                <span className="text-xs font-extrabold text-blue-600">{r.densite} <span className="text-[8px] text-gray-400 font-normal">/ 10K emp.</span></span>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <span className="text-[8px] text-gray-400 italic">Moyenne mondiale record: 162 en 2023. Source: IFR 2025</span>
                          </div>
                        </div>
                      </div>

                      {/* 8. Opportunités stratégiques */}
                      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                          <TrendingUp className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                          <span className="text-sm font-bold text-gray-900">Opportunités stratégiques</span>
                          <span className="text-[9px] text-gray-400 ml-auto">{O9_INDUSTRY_OPPORTUNITIES.length} secteurs</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {O9_INDUSTRY_OPPORTUNITIES.map((o, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-gray-900">{o.sector}</span>
                                  <span className="text-[10px] font-bold text-blue-600">{o.trend}</span>
                                </div>
                                <p className="text-[10px] text-gray-500">{o.opportunity}</p>
                              </div>
                              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                o.impact === "Critique" ? "bg-red-100 text-red-700" :
                                o.impact === "Très élevé" ? "bg-amber-100 text-amber-700" :
                                o.impact === "Stratégique" ? "bg-violet-100 text-violet-700" :
                                "bg-blue-100 text-blue-700"
                              )}>{o.impact}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 9. KPIs restants (8-12) */}
                      {detailBloc.items.length > 8 && (
                        <div className="grid grid-cols-2 gap-2">
                          {detailBloc.items.slice(8).map((item, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-500 font-medium flex-1">{item.primary}</span>
                                <span className={cn("text-sm font-extrabold ml-2 shrink-0", item.valueColor || "text-gray-700")}>{item.value}</span>
                              </div>
                              {item.pct !== undefined && <O9ScoreBar value={item.pct} color={item.pctColor} />}
                              <p className="text-[9px] text-gray-400 mt-0.5">{item.secondary}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 10. Études de référence */}
                      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                          <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                          <span className="text-sm font-bold text-gray-900">Études de référence 2024-2026</span>
                          <span className="text-[9px] text-gray-400 ml-auto">{O9_REFERENCE_STUDIES.length} publications</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {O9_REFERENCE_STUDIES.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                              <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-gray-800">{s.title}</span>
                                <p className="text-[8px] text-gray-400">{s.source} · {s.year}</p>
                              </div>
                              <span className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">{s.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 11. Bandeau sources */}
                      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="text-[9px] text-blue-700">Sources: ISQ, STIQ Baromètre 16e éd., MEIE, Statistique Canada, IFR, REAI, FCEI, BDC, Scale AI, IQ — Données 2024-2026</span>
                      </div>
                    </div>
                  );

                /* ──── BENCHMARK: KPI cards avec grandes valeurs + barres ──── */
                case "benchmark":
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {detailBloc.items.map((item, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] text-gray-500 font-medium flex-1">{item.primary}</span>
                            <span className={cn("text-xl font-extrabold ml-2 shrink-0", item.valueColor || "text-gray-700")}>{item.value}</span>
                          </div>
                          {item.pct !== undefined && <div className="mb-2"><O9ScoreBar value={item.pct} color={item.pctColor} /></div>}
                          <p className="text-[10px] text-gray-400 leading-relaxed">{item.secondary}</p>
                        </div>
                      ))}
                    </div>
                  );

                /* ──── ÉVÉNEMENTS: cards avec images + drill-down détail ──── */
                case "evenements": {
                  if (selectedItem !== null && selectedItem < O9_EVENEMENTS_LISTE.length) {
                    const ev = O9_EVENEMENTS_LISTE[selectedItem];
                    return (
                      <div className="space-y-3">
                        <button onClick={() => setSelectedItem(null)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
                          <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour aux événements
                        </button>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
                          {/* Image hero événement */}
                          <div className="h-48 relative">
                            <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute top-4 left-4">
                              <div className="bg-white rounded-lg px-3 py-2 shadow-lg text-center">
                                <div className="text-lg font-extrabold text-gray-900 leading-tight">{ev.dateBadge}</div>
                              </div>
                            </div>
                            <span className={cn("absolute top-4 right-4 text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm", ev.typeColor)}>{ev.type}</span>
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                              <h2 className="text-base font-extrabold text-white leading-snug">{ev.title}</h2>
                            </div>
                          </div>
                          {/* Détail événement */}
                          <div className="px-6 py-5 space-y-4">
                            {/* Infos clés */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                                <div>
                                  <div className="text-[9px] text-gray-400 uppercase font-bold">Date</div>
                                  <div className="text-xs font-bold text-gray-800">{ev.date}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                                <div>
                                  <div className="text-[9px] text-gray-400 uppercase font-bold">Lieu</div>
                                  <div className="text-xs font-bold text-gray-800">{ev.lieu}</div>
                                </div>
                              </div>
                            </div>
                            {/* Description */}
                            <div>
                              <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5 text-blue-500" /> Description
                              </h3>
                              <p className="text-xs text-gray-700 leading-relaxed">{ev.description}</p>
                            </div>
                            {/* Jauge d'inscription */}
                            {ev.inscrits !== undefined && (
                              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-gray-500" /> Inscriptions
                                  </span>
                                  <span className="text-xs font-bold text-cyan-600">{ev.inscrits?.toLocaleString()} / {ev.places?.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                                    style={{ width: `${((ev.inscrits || 0) / (ev.places || 1)) * 100}%` }} />
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1.5">
                                  {((ev.places || 0) - (ev.inscrits || 0)) > 0
                                    ? `${((ev.places || 0) - (ev.inscrits || 0)).toLocaleString()} places restantes`
                                    : "Complet"}
                                </p>
                              </div>
                            )}
                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition-colors cursor-pointer">
                                <Calendar className="h-3.5 w-3.5" /> S'inscrire
                              </button>
                              <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                                <Share2 className="h-3.5 w-3.5" /> Partager
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {/* Filtres type d'événement */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["Tous", "Salons", "Réseau", "Formations"].map(t => (
                          <button key={t} className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-medium transition-all cursor-pointer",
                            t === "Tous" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200"
                          )}>{t}</button>
                        ))}
                        <span className="text-[9px] text-gray-400 ml-auto">{O9_EVENEMENTS_LISTE.length} événements</span>
                      </div>
                      {/* Prochain événement — card large vedette */}
                      <div onClick={() => setSelectedItem(0)}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden cursor-pointer">
                        <div className="h-40 relative">
                          <img src={O9_EVENEMENTS_LISTE[0].imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <div className="bg-white rounded-lg px-2.5 py-1.5 shadow-md text-center">
                              <div className="text-[9px] font-bold text-red-600 uppercase">Prochain</div>
                              <div className="text-sm font-extrabold text-gray-900 leading-tight">{O9_EVENEMENTS_LISTE[0].dateBadge}</div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5", O9_EVENEMENTS_LISTE[0].typeColor)}>{O9_EVENEMENTS_LISTE[0].type}</span>
                            <h3 className="text-sm font-extrabold text-white leading-snug">{O9_EVENEMENTS_LISTE[0].title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-2.5 w-2.5 text-white/70" />
                              <span className="text-[9px] text-white/80">{O9_EVENEMENTS_LISTE[0].lieu}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-[10px] text-gray-600 leading-relaxed">{O9_EVENEMENTS_LISTE[0].description}</p>
                          {O9_EVENEMENTS_LISTE[0].inscrits !== undefined && (
                            <div className="flex items-center gap-2 mt-2">
                              <Users className="h-3 w-3 text-gray-400" />
                              <span className="text-[9px] text-gray-500">{O9_EVENEMENTS_LISTE[0].inscrits?.toLocaleString()} / {O9_EVENEMENTS_LISTE[0].places?.toLocaleString()} inscrits</span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${((O9_EVENEMENTS_LISTE[0].inscrits || 0) / (O9_EVENEMENTS_LISTE[0].places || 1)) * 100}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Grille événements restants */}
                      <div className="grid grid-cols-2 gap-3">
                        {O9_EVENEMENTS_LISTE.slice(1).map((ev, i) => (
                          <div key={ev.id} onClick={() => setSelectedItem(i + 1)}
                            className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden cursor-pointer group">
                            <div className="h-24 relative overflow-hidden">
                              <img src={ev.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <div className="absolute top-2 left-2">
                                <div className="bg-white/95 rounded px-1.5 py-0.5 shadow-sm text-center">
                                  <div className="text-[9px] font-bold text-gray-900 leading-tight">{ev.dateBadge}</div>
                                </div>
                              </div>
                              <span className={cn("absolute top-2 right-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full", ev.typeColor)}>{ev.type}</span>
                            </div>
                            <div className="px-3 py-2.5">
                              <h4 className="text-[11px] font-bold text-gray-900 leading-snug line-clamp-2">{ev.title}</h4>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-2.5 w-2.5 text-gray-400 shrink-0" />
                                <span className="text-[8px] text-gray-500 truncate">{ev.lieu}</span>
                              </div>
                              <p className="text-[9px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{ev.description}</p>
                              {ev.inscrits !== undefined && ev.inscrits > 0 && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <Users className="h-2.5 w-2.5 text-gray-400" />
                                  <span className="text-[8px] text-gray-400">{ev.inscrits} / {ev.places}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                /* ──── PIONNIERS: grille 3×3 avec PionnierDot ──── */
                case "pionniers":
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        {O9_PIONNIERS.map(p => (
                          <div key={p.id} className={cn("rounded-xl border bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 text-center",
                            p.status === "pris" ? "border-emerald-200" : p.status === "prospect" ? "border-amber-200" : "border-gray-200 border-dashed"
                          )}>
                            <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                              p.status === "pris" ? "bg-emerald-100" : p.status === "prospect" ? "bg-amber-100" : "bg-gray-100"
                            )}>
                              <Rocket className={cn("h-5 w-5",
                                p.status === "pris" ? "text-emerald-600" : p.status === "prospect" ? "text-amber-600" : "text-gray-400"
                              )} />
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 mb-0.5">{p.label}</h4>
                            <PionnierDot status={p.status} />
                            {p.entreprise && <p className="text-[9px] text-gray-500 mt-1">{p.entreprise}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Rocket className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="text-[9px] text-blue-700">Programme Pionniers: {O9_PIONNIERS.filter(p => p.status === "pris").length}/9 sièges confirmés — {O9_PIONNIERS.filter(p => p.status === "disponible").length} places disponibles</span>
                      </div>
                    </div>
                  );

                /* ──── ÉCONOMIE: KPI summary row + cards détail ──── */
                case "economie": {
                  const kpis = detailBloc.items.slice(0, 4);
                  const rest = detailBloc.items.slice(4);
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {kpis.map((item, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-3 text-center">
                            <div className={cn("text-lg font-extrabold", item.valueColor || "text-gray-700")}>{item.value}</div>
                            <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{item.primary}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {rest.map((item, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all px-4 py-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-900">{item.primary}</span>
                              <span className={cn("text-sm font-extrabold", item.valueColor || "text-gray-700")}>{item.value}</span>
                            </div>
                            <p className="text-[10px] text-gray-500">{item.secondary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                /* ──── MANDATAIRE: cards activité bot avec avatar ──── */
                case "mandataire":
                  return (
                    <div className="space-y-2">
                      {detailBloc.items.map((item, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-3">
                            {item.bot ? (
                              <img src={BOT_AVATAR_MAP[item.bot] || BOT_AVATAR_MAP.CEOB} alt="" className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-bold text-gray-900">{item.primary}</span>
                                {item.value && <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                  item.valueColor?.includes("green") || item.valueColor?.includes("emerald") ? "bg-emerald-50 text-emerald-700" :
                                  item.valueColor?.includes("blue") ? "bg-blue-50 text-blue-700" :
                                  item.valueColor?.includes("amber") ? "bg-amber-50 text-amber-700" :
                                  "bg-gray-100 text-gray-600"
                                )}>{item.value}</span>}
                              </div>
                              {item.pct !== undefined && <div className="my-1"><O9ScoreBar value={item.pct} color={item.pctColor} /></div>}
                              <p className="text-[10px] text-gray-500">{item.secondary}</p>
                            </div>
                            <PhaseBadge phase={item.phase} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );

                /* ──── FALLBACK: liste générique (sécurité) ──── */
                default:
                  return (
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                      <ul className="divide-y divide-gray-100">
                        {detailBloc.items.map((item, i) => (
                          <CockpitItemRow key={i} item={item} index={i} onAction={itemAction} showNumber />
                        ))}
                      </ul>
                    </div>
                  );
              }
            })()
          ) : (
            /* ═══ VUE D'ENSEMBLE — Feed social + grid boxes ═══ */
            <div className="space-y-3">
              {/* ═══ FIL D'ACTUALITÉ SOCIAL — Style réseau social vivant ═══ */}
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
                {/* Header feed */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Newspaper className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900 flex-1">Fil d'actualité réseau</span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {FEED_POSTS.filter(p => p.isNew).length} nouveau{FEED_POSTS.filter(p => p.isNew).length > 1 ? "x" : ""}
                  </span>
                  <button type="button" onClick={() => setActiveSection("feed")}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer ml-1">
                    Voir tout
                  </button>
                </div>

                {/* Posts */}
                <div className="divide-y divide-gray-100">
                  {FEED_POSTS.slice(0, feedExpanded ? FEED_POSTS.length : 4).map(post => {
                    const cfg = FEED_TYPE_CONFIG[post.type];
                    return (
                      <div key={post.id} className={cn("px-4 py-3 hover:bg-gray-50/50 transition-colors", post.isNew && "bg-blue-50/30")}>
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <img src={post.avatar} alt="" className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm object-cover shrink-0 mt-0.5" />
                          {/* Contenu */}
                          <div className="flex-1 min-w-0">
                            {/* Ligne auteur + badge + temps */}
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-gray-900 truncate">{post.author}</span>
                              <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0", cfg.color)}>
                                {cfg.label}
                              </span>
                              {post.isNew && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                              <span className="text-[10px] text-gray-400 ml-auto shrink-0">{post.time}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-1">{post.role}</p>
                            {/* Message */}
                            <p className="text-xs text-gray-700 leading-relaxed">{post.content}</p>
                            {post.detail && (
                              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed italic">{post.detail}</p>
                            )}
                            {/* Réactions */}
                            <div className="flex items-center gap-4 mt-2">
                              <button type="button" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                                <ThumbsUp className="h-3 w-3" /> {post.likes}
                              </button>
                              <button type="button" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                                <MessageCircle className="h-3 w-3" /> {post.comments}
                              </button>
                              <button type="button" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                                <Share2 className="h-3 w-3" /> Partager
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Voir plus / moins */}
                {FEED_POSTS.length > 4 && (
                  <button type="button" onClick={() => setFeedExpanded(!feedExpanded)}
                    className="w-full flex items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-blue-600 hover:bg-blue-50/50 border-t border-gray-100 cursor-pointer transition-colors">
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", feedExpanded && "rotate-180")} />
                    {feedExpanded ? "Réduire" : `Voir ${FEED_POSTS.length - 4} publications de plus`}
                  </button>
                )}
              </div>

              {/* ═══ Boxes hot — grid 2 cols ═══ */}
              <div className="grid grid-cols-2 gap-3">
                {O9_GRID_BLOCS.map((bloc, i) => (
                  <CockpitCard key={i} config={bloc} onAction={handleAction}
                    onHeaderClick={() => handleBoxClick(i)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
