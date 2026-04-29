/**
 * Orbit9Opportunites.tsx — Store Opportunités V3
 *
 * Pattern: COPIE de PlaybookStoreView.tsx (sidebar filters + vedettes grid-cols-3 + cards + drill-down inline)
 * CarlOS génère les opportunités via Auto-Scout. L'utilisateur "lève la main" pour exprimer son intérêt.
 *
 * Utilisé par: Orbit9View (o9Section === "opportunites")
 */

import { useState } from "react";
import {
  Search, Handshake, Star, ArrowLeft,
  Globe, Zap, Users, Atom, Factory, Wrench, FlaskConical,
  ShoppingCart, FileCheck, Eye, Bot, Clock, Calendar,
  Building2, MapPin, Activity, Shield, SortAsc,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { SF } from "../../core/styles";
import { TrustBadge, QualifiedBadge, O9ScoreBar, StagePipeline } from "./orbit9-helpers";
import { LivingHero } from "../shared/LivingHero";
import {
  O9_OPPORTUNITIES_VEDETTES,
  OPPORTUNITY_TYPE_LABEL,
  OPPORTUNITY_STAGE_CONFIG,
} from "./orbit9-data";
import type { OpportunityData, OpportunityType, OpportunityStage } from "./orbit9-data";
import { BOT_AVATAR_MAP, DEPT_GRADIENT } from "../shared/dept-data";

// ═══ Card standard avec hover — Pattern EXACT CockpitCard (pas de p-0 overflow-hidden) ═══
const CARD_HOVER = "rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all";

// ═══ Mock data complémentaire (en plus des 3 vedettes) ═══

const O9_OPPORTUNITIES_ALL: OpportunityData[] = [
  ...O9_OPPORTUNITIES_VEDETTES,
  {
    id: "opp-004", entreprise: "SoudurePro Ltée", secteur: "Usinage / Soudure", region: "Laurentides",
    type: "sous-traitance", score: 71, trustScore: 3.2, trustTier: "argent",
    description: "Sous-traitance soudure spécialisée pour projets d'envergure nécessitant certification.",
    apport: "Volume de commandes, gestion de projets", apportPartenaire: "12 soudeurs CWB, capacité 24/7",
    stage: "decouverte", botAssigne: "CPOB", dateDetection: "il y a 2 semaines", pilierVitaa: "Actif",
  },
  {
    id: "opp-005", entreprise: "InspekTech", secteur: "Contrôle qualité", region: "Montréal",
    type: "validation-requise", score: 68, trustScore: 3.0, trustTier: "bronze",
    description: "Validation de processus qualité par un tiers certifié ISO 17025.",
    apport: "Données production, accès ligne", apportPartenaire: "Certification ISO 17025, équipement métrologie",
    stage: "decouverte", botAssigne: "COOB", dateDetection: "il y a 3 semaines", pilierVitaa: "Idée",
  },
  {
    id: "opp-006", entreprise: "AcierPlus Inc.", secteur: "Usinage / Métal", region: "Montérégie",
    type: "mutualisation-achats", score: 74, trustScore: 3.6, trustTier: "argent",
    description: "Groupement d'achats pour aluminium et acier — volume combiné pour meilleurs prix.",
    apport: "Volume achat aluminium 200T/an", apportPartenaire: "Volume achat acier 150T/an, entrepôt",
    stage: "qualification", botAssigne: "CFOB", dateDetection: "il y a 10 jours", pilierVitaa: "Argent",
  },
  {
    id: "opp-007", entreprise: "FormaTech QC", secteur: "Formation", region: "Québec",
    type: "alliance-strategique", score: 65, trustScore: 2.8, trustTier: "bronze",
    description: "Alliance pour offrir des formations IA en usine aux manufacturiers du réseau.",
    apport: "Contenu IA, plateforme CarlOS", apportPartenaire: "Réseau 200+ formateurs, accréditations",
    stage: "decouverte", botAssigne: "CHROB", dateDetection: "il y a 1 mois", pilierVitaa: "Idée + Temps",
  },
  {
    id: "opp-008", entreprise: "TransQC Logistique", secteur: "Logistique", region: "Centre-du-Québec",
    type: "vente-conjointe", score: 79, trustScore: 3.9, trustTier: "argent",
    description: "Offre conjointe automatisation + logistique pour les PME manufacturières.",
    apport: "Solutions automatisation, réseau clients", apportPartenaire: "Flotte 40 camions, réseau distribution",
    stage: "introduction", botAssigne: "CROB", dateDetection: "il y a 1 semaine", pilierVitaa: "Vente", isNew: true,
  },
];

// ═══ Sidebar config ═══

type SidebarView = "decouvrir" | "secteur" | "type" | "mes-interets" | "sessions" | "historique" | "scout";

const OPP_SIDEBAR: ({ id: SidebarView; label: string; icon: React.ElementType; count?: string } | null)[] = [
  { id: "decouvrir", label: "Découvrir", icon: Globe, count: String(O9_OPPORTUNITIES_ALL.length) },
  { id: "secteur", label: "Par Secteur", icon: Factory },
  { id: "type", label: "Par Type", icon: Zap },
  null,
  { id: "mes-interets", label: "Mes Intérêts", icon: Handshake, count: "3" },
  { id: "sessions", label: "Sessions planifiées", icon: Calendar, count: "1" },
  { id: "historique", label: "Historique", icon: Clock, count: "5" },
  null,
  { id: "scout", label: "Mon Scout Bot", icon: Bot },
];

// ═══ TYPE ICONS ═══

const TYPE_ICON: Record<OpportunityType, React.ElementType> = {
  "alliance-strategique": Handshake,
  "vente-conjointe": ShoppingCart,
  "mutualisation-achats": ShoppingCart,
  "rd-partagee": FlaskConical,
  "sous-traitance": Wrench,
  "validation-requise": FileCheck,
};

// ═══ COMPOSANT PRINCIPAL ═══

export function Orbit9Opportunites() {
  const [activeView, setActiveView] = useState<SidebarView>("decouvrir");
  const [selectedOpp, setSelectedOpp] = useState<OpportunityData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<OpportunityType | "all">("all");
  const [filterStage, setFilterStage] = useState<OpportunityStage | "all">("all");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [handRaised, setHandRaised] = useState<Record<string, "idle" | "raised" | "analyzing" | "proposed">>({});

  // Filtrer par recherche + type + étape
  const filtered = O9_OPPORTUNITIES_ALL
    .filter(o => !searchTerm || o.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) || o.secteur.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(o => filterType === "all" || o.type === filterType)
    .filter(o => filterStage === "all" || o.stage === filterStage)
    .sort((a, b) => sortBy === "score" ? b.score - a.score : 0);

  const vedettes = O9_OPPORTUNITIES_VEDETTES;

  // ═══ DRILL-DOWN — Fiche détaillée ═══
  if (selectedOpp) {
    const opp = selectedOpp;
    const stage = OPPORTUNITY_STAGE_CONFIG[opp.stage];
    const TypeIcon = TYPE_ICON[opp.type];
    const state = handRaised[opp.id] || "idle";

    return (
      <div className="space-y-3">
        {/* ← Retour */}
        <button
          type="button"
          onClick={() => setSelectedOpp(null)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux Opportunités
        </button>

        {/* Hero gradient */}
        <div className="relative bg-gradient-to-r from-cyan-600 to-blue-500 rounded-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative p-5">
            <div className="grid grid-cols-5 gap-4">
              {/* Col 1-3: Info principale */}
              <div className="col-span-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{opp.entreprise}</h3>
                    <p className="text-xs text-white/80">{opp.secteur} — {opp.region}</p>
                  </div>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{opp.description}</p>
                <div className="flex items-center gap-2">
                  <TrustBadge tier={opp.trustTier} score={opp.trustScore} />
                  <QualifiedBadge />
                </div>
              </div>
              {/* Col 4-5: Détails card */}
              <div className="col-span-2">
                <div className={CARD_HOVER}>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-700 font-medium">{OPPORTUNITY_TYPE_LABEL[opp.type]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Factory className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-700">{opp.secteur}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-700">Pilier: {opp.pilierVitaa}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-700">Détecté {opp.dateDetection}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-800">{opp.score}%</span>
                      <span className="text-[10px] text-gray-500">compatibilité</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton LEVER LA MAIN */}
        <button
          type="button"
          onClick={() => {
            if (state === "idle") {
              setHandRaised(prev => ({ ...prev, [opp.id]: "raised" }));
              setTimeout(() => setHandRaised(prev => ({ ...prev, [opp.id]: "analyzing" })), 800);
              setTimeout(() => setHandRaised(prev => ({ ...prev, [opp.id]: "proposed" })), 3000);
            }
          }}
          className={cn(
            "w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
            state === "idle" ? "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200" :
            state === "raised" ? "bg-emerald-500 text-white animate-pulse" :
            state === "analyzing" ? "bg-blue-500 text-white animate-pulse" :
            "bg-emerald-600 text-white"
          )}
        >
          {state === "idle" && <><Handshake className="h-4 w-4" /> Exprimer mon intérêt</>}
          {state === "raised" && <><Handshake className="h-4 w-4" /> Main levée!</>}
          {state === "analyzing" && <><Bot className="h-4 w-4" /> CarlOS analyse votre profil...</>}
          {state === "proposed" && <><Calendar className="h-4 w-4" /> Trisociation proposée — 20 avril 10h</>}
        </button>

        {/* Complémentarité */}
        <div className="grid grid-cols-2 gap-3">
          <div className={CARD_HOVER}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Building2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Ce que vous apportez</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 leading-relaxed">{opp.apport}</p>
            </div>
          </div>
          <div className={CARD_HOVER}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Handshake className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Ce qu'ils apportent</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 leading-relaxed">{opp.apportPartenaire}</p>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className={CARD_HOVER}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">Pipeline de collaboration</span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", stage.color.replace("text-", "bg-").replace("-600", "-50"), stage.color)}>{stage.label}</span>
          </div>
          <div className="px-4 py-4 flex items-center justify-center">
            <StagePipeline currentStage={opp.stage} />
          </div>
          <div className="px-4 pb-3 flex items-center gap-3">
            {(["decouverte", "qualification", "introduction", "collaboration", "integration"] as const).map(s => {
              const cfg = OPPORTUNITY_STAGE_CONFIG[s];
              return <span key={s} className="text-[8px] text-gray-500 flex-1 text-center">{cfg.label}</span>;
            })}
          </div>
        </div>

        {/* Équipe IA */}
        <div className={CARD_HOVER}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Bot className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Équipe IA impliquée</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-4">
            {[
              { code: opp.botAssigne, role: "Pilote matching" },
              { code: "CEOB", role: "Facilitateur trisociation" },
            ].map(b => (
              <div key={b.code} className="flex items-center gap-2">
                <img src={BOT_AVATAR_MAP[b.code] || ""} alt="" className="w-7 h-7 rounded-full ring-1 ring-gray-200 object-cover" />
                <div>
                  <span className="text-xs font-bold text-gray-800">{b.code}</span>
                  <p className="text-[9px] text-gray-500">{b.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══ VUE PRINCIPALE — Sidebar + Contenu ═══
  return (
    <div className="space-y-4">
      {/* Hero animé — Opportunités */}
      <LivingHero blur1="bg-emerald-100/70" blur2="bg-cyan-100/60" subtitleColor="text-emerald-600" subtitle="Opportunités Réseau" title="Découvrez vos synergies." description="Matches, alliances et collaborations détectés par votre Scout Bot.">
        <div className="relative flex items-center justify-center overflow-visible" style={{ width: 340, height: 160 }}>
          <svg viewBox="0 0 200 150" className="overflow-visible" style={{ width: 300, height: 200 }}>
            {/* Noeud central — Votre entreprise */}
            <circle cx="100" cy="75" r="18" fill="url(#opp-core-grad)" filter="drop-shadow(0 0 12px #10b981)" />
            <text x="100" y="79" textAnchor="middle" className="text-[7px] font-bold fill-white">Vous</text>
            {/* Orbite interne — matches proches */}
            <circle cx="100" cy="75" r="40" fill="none" stroke="#34d399" strokeWidth="0.75" strokeDasharray="3 5" opacity="0.5" className="anim-orb-1" />
            {/* Orbite externe — opportunités */}
            <circle cx="100" cy="75" r="65" fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 8" opacity="0.4" className="anim-orb-2" />
            {/* Noeuds partenaires — orbite interne */}
            <g className="anim-orb-1">
              <circle cx="140" cy="75" r="10" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1" />
              <text x="140" y="78" textAnchor="middle" className="text-[5px] fill-emerald-700">87%</text>
            </g>
            <g className="anim-orb-1">
              <circle cx="75" cy="42" r="8" fill="rgba(16,185,129,0.1)" stroke="#34d399" strokeWidth="0.75" />
              <text x="75" y="45" textAnchor="middle" className="text-[5px] fill-emerald-600">79%</text>
            </g>
            <g className="anim-orb-1">
              <circle cx="80" cy="112" r="9" fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="0.75" />
              <text x="80" y="115" textAnchor="middle" className="text-[5px] fill-emerald-700">82%</text>
            </g>
            {/* Noeuds opportunités — orbite externe */}
            <g className="anim-orb-2">
              <circle cx="165" cy="75" r="7" fill="rgba(52,211,153,0.1)" stroke="#6ee7b7" strokeWidth="0.5" className="anim-dot" style={{ color: '#34d399' }} />
            </g>
            <g className="anim-orb-2">
              <circle cx="100" cy="10" r="6" fill="rgba(52,211,153,0.1)" stroke="#6ee7b7" strokeWidth="0.5" className="anim-dot" style={{ color: '#6ee7b7' }} />
            </g>
            <g className="anim-orb-2">
              <circle cx="35" cy="75" r="7" fill="rgba(52,211,153,0.1)" stroke="#6ee7b7" strokeWidth="0.5" className="anim-dot" style={{ color: '#34d399' }} />
            </g>
            {/* Liens de connexion */}
            <path d="M 118 75 L 130 75" fill="none" stroke="url(#opp-link)" strokeWidth="1.5" opacity="0.6" />
            <path d="M 92 60 L 80 47" fill="none" stroke="url(#opp-link)" strokeWidth="1" opacity="0.4" />
            <path d="M 90 88 L 83 105" fill="none" stroke="url(#opp-link)" strokeWidth="1" opacity="0.4" />
            {/* Handshake icon au centre-bas */}
            <text x="100" y="100" textAnchor="middle" className="text-[10px]">🤝</text>
            <defs>
              <radialGradient id="opp-core-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#059669" /></radialGradient>
              <linearGradient id="opp-link" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" stopOpacity="0" /><stop offset="50%" stopColor="#10b981" stopOpacity="0.8" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient>
            </defs>
          </svg>
        </div>
      </LivingHero>

      <div className="flex gap-3">
      {/* Sidebar w-[180px] — Pattern PlaybookStoreView */}
      <div className={SF.sidebarW}>
        {OPP_SIDEBAR.map((item, idx) => {
          if (!item) return <div key={`sep-${idx}`} className={SF.separator} />;
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const hasPulse = item.id === "sessions";
          return (
            <button key={item.id} type="button" onClick={() => setActiveView(item.id)}
              className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
              <Icon className={cn(isActive ? SF.iconActive : SF.iconInactive)} />
              <span className={cn("flex-1", isActive ? SF.labelActive : SF.labelInactive)}>{item.label}</span>
              {item.count && (
                <span className="text-[9px] text-gray-400 flex items-center gap-1">
                  {hasPulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenu dynamique */}
      <div className={SF.content}>
        {activeView === "decouvrir" && (
          <div className="space-y-4">
            {/* Top 3 Vedettes */}
            <div>
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                <Star className="h-3.5 w-3.5 text-amber-500" /> Meilleures opportunités pour vous
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {vedettes.map((opp, i) => (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                  >
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-500 px-3 py-2.5 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">#{i + 1}</span>
                      <span className="text-xs font-bold text-white truncate flex-1">{opp.entreprise}</span>
                    </div>
                    <div className="px-3 py-2.5 space-y-2">
                      <p className="text-[10px] text-gray-600 line-clamp-2">{opp.description}</p>
                      <div className="flex items-center justify-between">
                        <TrustBadge tier={opp.trustTier} score={opp.trustScore} />
                        <span className="text-xs font-bold text-cyan-600">{opp.score}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-medium">{OPPORTUNITY_TYPE_LABEL[opp.type]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toolbar recherche + filtres — Pattern PlaybookStoreView */}
            <div className={SF.toolbarWrap}>
              <div className={SF.searchWrap}>
                <Search className={SF.searchIcon} />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une opportunité..." className={SF.searchInput} />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value as OpportunityType | "all")} className={SF.select}>
                <option value="all">Tous types</option>
                {(Object.keys(OPPORTUNITY_TYPE_LABEL) as OpportunityType[]).map(t => (
                  <option key={t} value={t}>{OPPORTUNITY_TYPE_LABEL[t]}</option>
                ))}
              </select>
              <select value={filterStage} onChange={e => setFilterStage(e.target.value as OpportunityStage | "all")} className={SF.select}>
                <option value="all">Toutes étapes</option>
                {(Object.keys(OPPORTUNITY_STAGE_CONFIG) as OpportunityStage[]).map(s => (
                  <option key={s} value={s}>{OPPORTUNITY_STAGE_CONFIG[s].label}</option>
                ))}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as "score" | "date")} className={SF.select}>
                <option value="score">Score ↓</option>
                <option value="date">Date</option>
              </select>
              <span className={SF.itemCount}>{filtered.length} opportunité{filtered.length > 1 ? "s" : ""}</span>
            </div>

            {/* Sections curatées */}
            {!searchTerm && (
              <>
                <SectionCurated
                  title="Nouvelles cette semaine"
                  icon={Zap}
                  iconColor="text-emerald-500"
                  items={O9_OPPORTUNITIES_ALL.filter(o => o.isNew || o.dateDetection.includes("jours") || o.dateDetection.includes("semaine"))}
                  onSelect={setSelectedOpp}
                />
                <SectionCurated
                  title="Meilleures compatibilités"
                  icon={Star}
                  iconColor="text-amber-500"
                  items={O9_OPPORTUNITIES_ALL.filter(o => o.score >= 75).sort((a, b) => b.score - a.score)}
                  onSelect={setSelectedOpp}
                />
                <SectionCurated
                  title="Cross-vertical"
                  icon={Globe}
                  iconColor="text-violet-500"
                  items={O9_OPPORTUNITIES_ALL.filter(o => !o.secteur.includes("Usinage") && !o.secteur.includes("Automatisation"))}
                  onSelect={setSelectedOpp}
                />
              </>
            )}

            {/* Grille filtrée (quand recherche active) */}
            {searchTerm && (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map(opp => (
                  <OpportunityCard key={opp.id} opp={opp} onSelect={setSelectedOpp} />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-sm text-gray-400">Aucune opportunité trouvée</div>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === "secteur" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Factory className="h-3.5 w-3.5 text-blue-500" /> Opportunités par secteur
            </h3>
            {["Usinage / Métal", "Automatisation", "Logistique", "Contrôle qualité", "Formation", "Usinage / Soudure"].map(secteur => {
              const items = O9_OPPORTUNITIES_ALL.filter(o => o.secteur === secteur);
              if (items.length === 0) return null;
              return (
                <div key={secteur}>
                  <h4 className="text-[10px] font-bold text-gray-600 mb-1.5">{secteur} ({items.length})</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {items.map(opp => <OpportunityCard key={opp.id} opp={opp} onSelect={setSelectedOpp} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeView === "type" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Opportunités par type
            </h3>
            {(Object.keys(OPPORTUNITY_TYPE_LABEL) as OpportunityType[]).map(type => {
              const items = O9_OPPORTUNITIES_ALL.filter(o => o.type === type);
              if (items.length === 0) return null;
              return (
                <div key={type}>
                  <h4 className="text-[10px] font-bold text-gray-600 mb-1.5">{OPPORTUNITY_TYPE_LABEL[type]} ({items.length})</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {items.map(opp => <OpportunityCard key={opp.id} opp={opp} onSelect={setSelectedOpp} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeView === "mes-interets" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Handshake className="h-3.5 w-3.5 text-emerald-500" /> Mes intérêts exprimés
            </h3>
            {O9_OPPORTUNITIES_VEDETTES.map(opp => (
              <div key={opp.id} className={cn(CARD_HOVER, "cursor-pointer")} onClick={() => setSelectedOpp(opp)}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <Handshake className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900 flex-1">{opp.entreprise}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">Main levée</span>
                </div>
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">{opp.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <TrustBadge tier={opp.trustTier} score={opp.trustScore} />
                      <span className="text-xs font-bold text-cyan-600">{opp.score}%</span>
                    </div>
                  </div>
                  <StagePipeline currentStage={opp.stage} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === "sessions" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-violet-500" /> Sessions de trisociation planifiées
            </h3>
            <div className={CARD_HOVER}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Usine Bleue × AutomatikPro</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-700 font-medium">20 avril 2026 — 10h00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">Carl Fugère (Usine Bleue) × Marc Dubois (AutomatikPro)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">CarlOS facilite — Playbook: Trisociation R&D</span>
                </div>
                <p className="text-[10px] text-gray-500">R&D partagée en vision artificielle pour contrôle qualité automatisé</p>
              </div>
            </div>
          </div>
        )}

        {activeView === "historique" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-500" /> Historique des matchs
            </h3>
            {[
              { entreprise: "BâtiPro Construction", date: "Mars 2026", resultat: "Cellule créée", score: 91 },
              { entreprise: "FranchiseMax QC", date: "Février 2026", resultat: "Alliance active", score: 85 },
              { entreprise: "DistribQC Inc.", date: "Janvier 2026", resultat: "Mutualisation achats", score: 78 },
              { entreprise: "TechnoSoud Ltée", date: "Décembre 2025", resultat: "Non concluant", score: 52 },
              { entreprise: "PlastiQC SA", date: "Novembre 2025", resultat: "Sous-traitance active", score: 74 },
            ].map(h => (
              <div key={h.entreprise} className={CARD_HOVER}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <Building2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900 flex-1">{h.entreprise}</span>
                  <span className="text-[9px] text-gray-500">{h.date}</span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className={cn("text-xs font-medium",
                    h.resultat === "Non concluant" ? "text-gray-400" : "text-emerald-600"
                  )}>{h.resultat}</span>
                  <span className="text-xs font-bold text-gray-600">{h.score}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === "scout" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-blue-500" /> Mon Scout Bot (Auto-Scout)
            </h3>
            <div className={CARD_HOVER}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <Bot className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Statut Auto-Scout</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Actif
                </span>
              </div>
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={BOT_AVATAR_MAP.CEOB || ""} alt="" className="w-10 h-10 rounded-full ring-2 ring-cyan-200 object-cover" />
                  <div>
                    <span className="text-xs font-bold text-gray-800">CarlOS — Auto-Scout</span>
                    <p className="text-[10px] text-gray-500">Analyse continue du réseau Brain Team</p>
                  </div>
                </div>
                {[
                  { label: "Dernière analyse", value: "il y a 2h", icon: Clock },
                  { label: "Entreprises scannées", value: "142", icon: Building2 },
                  { label: "Opportunités détectées (30j)", value: "8", icon: Eye },
                  { label: "Matches qualifiés", value: "3 en cours", icon: Handshake },
                  { label: "Taux de conversion", value: "62%", icon: Activity },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 py-1 border-t border-gray-50">
                    <s.icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-600 flex-1">{s.label}</span>
                    <span className="text-xs font-bold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={CARD_HOVER}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <Shield className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900">Filtres de qualité Brain Team</span>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                {[
                  "Score VITAA minimum 40%",
                  "Profil entreprise complété à 80%+",
                  "Au moins 1 certification vérifiée",
                  "Historique positif dans le réseau",
                  "Anti-cartel: max 2 même secteur/cellule",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// ═══ SECTION CURATÉE — Titre + grille ═══

function SectionCurated({ title, icon: Icon, iconColor, items, onSelect }: {
  title: string; icon: React.ElementType; iconColor: string; items: OpportunityData[]; onSelect: (o: OpportunityData) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2">
        <Icon className={cn("h-3.5 w-3.5", iconColor)} /> {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(opp => <OpportunityCard key={opp.id} opp={opp} onSelect={onSelect} />)}
      </div>
    </div>
  );
}

// ═══ OPPORTUNITY CARD — Card standard ═══

function OpportunityCard({ opp, onSelect }: { opp: OpportunityData; onSelect: (o: OpportunityData) => void }) {
  const TypeIcon = TYPE_ICON[opp.type];
  return (
    <div
      onClick={() => onSelect(opp)}
      className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
        <Building2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{opp.entreprise}</span>
        {opp.isNew && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">Nouveau</span>}
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{opp.description}</p>
        <div className="flex items-center justify-between">
          <TrustBadge tier={opp.trustTier} score={opp.trustScore} />
          <span className="text-xs font-bold text-cyan-600">{opp.score}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-medium flex items-center gap-1">
            <TypeIcon className="h-3.5 w-3.5" /> {OPPORTUNITY_TYPE_LABEL[opp.type]}
          </span>
          <span className="text-[9px] text-gray-400 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {opp.region}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-500">{opp.dateDetection}</span>
          {opp.botAssigne && BOT_AVATAR_MAP[opp.botAssigne] && (
            <img src={BOT_AVATAR_MAP[opp.botAssigne]} alt="" className="w-4 h-4 rounded-full ring-1 ring-gray-200 ml-auto" />
          )}
        </div>
      </div>
    </div>
  );
}
