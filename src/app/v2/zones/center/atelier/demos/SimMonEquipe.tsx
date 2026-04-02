"use client";

/**
 * SimMonEquipe.tsx — Simulation Mon Equipe AI (B3)
 * 14 stages: hub 12 bots → profil bot → trisociation → performance → equipe humaine
 *   → assignation → bot en action → configuration → collaboration → carlos orchestre
 *   → daily-briefing → delegation-live → coaching-bot → recap
 * Self-contained: TopBar, sub-tabs, split-screen 40/60, SBubble/SBtn/AutoAdvance
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  Target,
  CheckCircle2,
  Search,
  Play,
  Send,
  Star,
  BarChart3,
  TrendingUp,
  Zap,
  Settings,
  UserPlus,
  Activity,
  Eye,
  Cpu,
  Gauge,
  Clock,
  ArrowRight,
  Briefcase,
  Award,
  Volume2,
  Bot,
  Sliders,
  GitBranch,
  Crown,
  CalendarCheck,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "hub-bots"
  | "profil-bot"
  | "trisociation"
  | "performance-bot"
  | "equipe-humaine"
  | "assignation"
  | "bot-en-action"
  | "configuration"
  | "collaboration"
  | "carlos-orchestre"
  | "daily-briefing"
  | "delegation-live"
  | "coaching-bot"
  | "recap";

const STAGE_ORDER: Stage[] = [
  "hub-bots", "profil-bot", "trisociation", "performance-bot", "equipe-humaine",
  "assignation", "bot-en-action", "configuration", "collaboration", "carlos-orchestre",
  "daily-briefing", "delegation-live", "coaching-bot", "recap",
];

const STAGE_LABELS: Record<Stage, string> = {
  "hub-bots": "Hub Equipe AI",
  "profil-bot": "Profil Bot",
  trisociation: "Trisociation",
  "performance-bot": "Performance",
  "equipe-humaine": "Equipe Humaine",
  assignation: "Assignation",
  "bot-en-action": "Bot en Action",
  configuration: "Configuration",
  collaboration: "Bot-to-Bot",
  "carlos-orchestre": "Chef d'orchestre",
  "daily-briefing": "Briefing Matin",
  "delegation-live": "Delegation Live",
  "coaching-bot": "Coaching Bot",
  recap: "Recapitulatif",
};

// 12 bots complets
const BOTS_FULL = [
  { code: "CEOB", name: "CarlOS", role: "CEO", dept: "Direction", missions: 47, taux: 94, specialites: ["Strategie", "Vision", "Decisions"] },
  { code: "CTOB", name: "Tim", role: "CTO", dept: "Technologie", missions: 38, taux: 91, specialites: ["Architecture", "Code", "DevOps"] },
  { code: "CFOB", name: "Frank", role: "CFO", dept: "Finance", missions: 32, taux: 96, specialites: ["Budget", "ROI", "Tresorerie"] },
  { code: "CMOB", name: "Mathilde", role: "CMO", dept: "Marketing", missions: 41, taux: 89, specialites: ["Branding", "SEO", "Contenu"] },
  { code: "CSOB", name: "Simone", role: "CSO", dept: "Strategie", missions: 29, taux: 93, specialites: ["Veille", "Concurrence", "Positionnement"] },
  { code: "COOB", name: "Olivier", role: "COO", dept: "Operations", missions: 44, taux: 90, specialites: ["Processus", "Logistique", "KPI"] },
  { code: "CPOB", name: "Paco", role: "CPO", dept: "Produit/Usine", missions: 36, taux: 88, specialites: ["Lean", "Qualite", "Production"] },
  { code: "CHROB", name: "Helene", role: "CHRO", dept: "RH", missions: 27, taux: 92, specialites: ["Recrutement", "Culture", "Formation"] },
  { code: "CINOB", name: "Ines", role: "CINO", dept: "Innovation", missions: 23, taux: 87, specialites: ["R&D", "Brevets", "Prototypage"] },
  { code: "CROB", name: "Rich", role: "CRO", dept: "Revenus", missions: 31, taux: 85, specialites: ["Ventes", "Pipeline", "Conversion"] },
  { code: "CLOB", name: "Loulou", role: "CLO", dept: "Juridique", missions: 19, taux: 97, specialites: ["Contrats", "Conformite", "PI"] },
  { code: "CISOB", name: "Sebastien", role: "CISO", dept: "Securite", missions: 22, taux: 95, specialites: ["Cybersec", "Audit", "RGPD"] },
];

// Trisociation data
const TRISOCIATION_TIM = {
  primaire: { nom: "Elon Musk", desc: "Vision 10x, execution rapide, first principles thinking" },
  calibrateur: { nom: "Marie Curie", desc: "Rigueur scientifique, methode experimentale, persistance" },
  amplificateur: { nom: "Leonard de Vinci", desc: "Polyvalence, creativite technique, integration art-science" },
};

// Equipe humaine mockee
const EQUIPE_HUMAINE = [
  { nom: "Carl Fugere", role: "CEO / Fondateur", dept: "Direction", actif: true },
  { nom: "Marie-Eve Lapointe", role: "VP Operations", dept: "Operations", actif: true },
  { nom: "Jean-Philippe Roy", role: "Dev Senior", dept: "Technologie", actif: true },
  { nom: "Sophie Tremblay", role: "Directrice Marketing", dept: "Marketing", actif: false },
  { nom: "Antoine Bergeron", role: "Analyste Financier", dept: "Finance", actif: true },
];

// Daily briefing items
const BRIEFING_ITEMS = [
  { type: "validation", urgence: "haute", titre: "Approbation budget Q3 — Frank attend votre GO", bot: "CFOB", delai: "Aujourd'hui" },
  { type: "suivi", urgence: "moyenne", titre: "Campagne SEO: +18% trafic cette semaine", bot: "CMOB", delai: "Info" },
  { type: "alerte", urgence: "haute", titre: "Serveur staging instable — Tim propose migration", bot: "CTOB", delai: "24h" },
  { type: "recurrence", urgence: "basse", titre: "Rapport hebdo automatise pret a envoyer", bot: "COOB", delai: "Vendredi" },
  { type: "decision", urgence: "haute", titre: "Embauche dev junior — Helene a 3 candidats", bot: "CHROB", delai: "Cette semaine" },
  { type: "opportunite", urgence: "moyenne", titre: "Partenariat detecte par Simone — match 87%", bot: "CSOB", delai: "A evaluer" },
];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimMonEquipe({ onBack }: { onBack?: () => void }) {
  const [stage, setStage] = useState<Stage>("hub-bots");
  const [selectedBot, setSelectedBot] = useState("CTOB");
  const chatRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);
  const goNext = (s: Stage) => setStage(s);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage]);

  // ── Discussion context ──
  const discussionContext = (() => {
    if (["profil-bot", "trisociation", "performance-bot", "configuration", "coaching-bot"].includes(stage)) {
      const b = BOT_COLORS[selectedBot];
      return `Equipe — ${b?.name || "Bot"}`;
    }
    if (stage === "collaboration") return "Equipe — Collaboration";
    if (stage === "daily-briefing") return "Equipe — Briefing Matin";
    if (stage === "delegation-live") return "Equipe — Delegation";
    return "Mon Equipe AI";
  })();

  // ── Active bots for header ──
  const activeBots = (() => {
    if (["profil-bot", "trisociation", "performance-bot", "coaching-bot"].includes(stage)) return ["CEOB", selectedBot];
    if (stage === "collaboration") return ["CEOB", "CTOB", "CFOB"];
    if (stage === "daily-briefing") return ["CEOB", "CFOB", "CTOB", "CMOB"];
    if (stage === "delegation-live") return ["CEOB", "CMOB", "CHROB"];
    if (stage === "carlos-orchestre") return BOTS_FULL.slice(0, 6).map(b => b.code);
    return ["CEOB"];
  })();

  // ── Chat content ──
  const chatContent = (
    <div className="space-y-3">
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          <TypewriterText text="Bienvenue dans ton Equipe AI. 12 agents specialises travaillent pour toi 24/7. Voyons qui fait quoi." speed={8}
            onComplete={() => si === 0 && setTimeout(() => goNext("profil-bot"), 2500)} />
          {si === 0 && <AutoAdvance onComplete={() => goNext("profil-bot")} delay={6000} />}
        </SBubble>
      )}

      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          <TypewriterText text={`Voici Tim, ton CTO. Il gere toute l'architecture technique, le code et le DevOps. Il a complete 38 missions avec un taux de reussite de 91%.`} speed={8}
            onComplete={() => {}} />
          {si === 1 && <SBtn onClick={() => goNext("trisociation")} icon={Brain} label="Voir sa Trisociation" />}
        </SBubble>
      )}

      {si >= 2 && (
        <SBubble code="CTOB" collapsed={si > 2}>
          <TypewriterText text="Ma Trisociation combine Musk (vision 10x), Curie (rigueur scientifique) et de Vinci (polyvalence creative). C'est ce qui me permet d'attaquer les problemes techniques sous 3 angles simultanes." speed={8}
            onComplete={() => {}} />
          {si === 2 && <SBtn onClick={() => goNext("performance-bot")} icon={BarChart3} label="Voir mes performances" />}
        </SBubble>
      )}

      {si >= 3 && (
        <SBubble code="CEOB" collapsed={si > 3}>
          <TypewriterText text="Les stats de Tim: 38 missions, temps moyen 2.3h, taux reussite 91%. Ses specialites: architecture systeme, refactoring, et debug critique." speed={8}
            onComplete={() => {}} />
          {si === 3 && <SBtn onClick={() => goNext("equipe-humaine")} icon={Users} label="Voir l'equipe humaine" />}
        </SBubble>
      )}

      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          <TypewriterText text="Ton equipe humaine: 5 membres actifs. Chaque membre est associe a un ou plusieurs bots specialistes qui les assistent au quotidien." speed={8}
            onComplete={() => {}} />
          {si === 4 && <SBtn onClick={() => goNext("assignation")} icon={UserPlus} label="Assigner un bot" />}
        </SBubble>
      )}

      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          <TypewriterText text="Tu veux assigner Paco au chantier Infrastructure Tech? Je le brieffe et il demarre l'analyse du processus en 2 minutes." speed={8}
            onComplete={() => {}} />
          {si === 5 && <SBtn onClick={() => goNext("bot-en-action")} icon={Play} label="Lancer Paco" />}
        </SBubble>
      )}

      {si >= 6 && (
        <SBubble code="CPOB" collapsed={si > 6}>
          <TypewriterText text="Mission acceptee! J'analyse le chantier Infrastructure Tech. Premiere etape: audit des processus actuels. Je te reviens dans 15 minutes avec un diagnostic." speed={8}
            onComplete={() => {}} />
          {si === 6 && <SBtn onClick={() => goNext("configuration")} icon={Settings} label="Configurer Tim" />}
        </SBubble>
      )}

      {si >= 7 && (
        <SBubble code="CEOB" collapsed={si > 7}>
          <TypewriterText text="Configuration de Tim: tu peux ajuster son ton (formel/decontracte), sa verbosity (concis/detaille), son autonomie (demande toujours / agit seul sur les petites taches). Quel reglage veux-tu modifier?" speed={8}
            onComplete={() => {}} />
          {si === 7 && <SBtn onClick={() => goNext("collaboration")} icon={GitBranch} label="Voir collaboration Bot-to-Bot" />}
        </SBubble>
      )}

      {si >= 8 && (
        <SBubble code="CTOB" collapsed={si > 8}>
          <TypewriterText text="Frank et moi on travaille ensemble sur le budget infrastructure. Il calcule les couts pendant que j'evalue la faisabilite technique. On synchronise nos analyses en temps reel." speed={8}
            onComplete={() => {}} />
          {si === 8 && (
            <>
              <SBubble code="CFOB" collapsed={false}>
                <TypewriterText text="Confirme — j'ai le devis serveurs a 12 400$/mois. Tim, est-ce qu'on peut optimiser avec du serverless sur les workloads intermittents?" speed={8}
                  onComplete={() => {}} />
              </SBubble>
              <SBtn onClick={() => goNext("carlos-orchestre")} icon={Crown} label="Vue Chef d'orchestre" />
            </>
          )}
        </SBubble>
      )}

      {si >= 9 && (
        <SBubble code="CEOB" collapsed={si > 9}>
          <TypewriterText text="Vue chef d'orchestre: 6 bots actifs en ce moment. Tim sur l'infra (45%), Frank sur le budget Q3 (72%), Mathilde sur la campagne SEO (88%). Pas de bottleneck detecte. Charge optimale." speed={8}
            onComplete={() => {}} />
          {si === 9 && <SBtn onClick={() => goNext("daily-briefing")} icon={CalendarCheck} label="Simuler un Briefing Matin" />}
        </SBubble>
      )}

      {si >= 10 && (
        <SBubble code="CEOB" collapsed={si > 10}>
          <TypewriterText text="Bon matin Carl! Voici ton briefing. 6 points a traiter: 2 validations urgentes, 1 alerte technique, 1 suivi positif, 1 decision RH, 1 opportunite reseau. Par quoi on commence?" speed={8}
            onComplete={() => {}} />
          {si === 10 && <SBtn onClick={() => goNext("delegation-live")} icon={ArrowRight} label="Deleguer en direct" />}
        </SBubble>
      )}

      {si >= 11 && (
        <>
          <SBubble code="CEOB" collapsed={si > 11}>
            <TypewriterText text="Tu veux deleguer le suivi de la campagne SEO a Mathilde et l'embauche dev junior a Helene. Je les briefe maintenant." speed={8}
              onComplete={() => {}} />
          </SBubble>
          {si >= 11 && si <= 11 && (
            <>
              <SBubble code="CMOB" collapsed={false}>
                <TypewriterText text="Recu! Je prends le suivi SEO. Objectif: rapport complet avec recommandations d'ici vendredi. Je monitore les KPIs en continu." speed={8}
                  onComplete={() => {}} />
              </SBubble>
              <SBubble code="CHROB" collapsed={false}>
                <TypewriterText text="J'ai les 3 CV. Je prepare les grilles d'evaluation et te propose un calendrier d'entrevues demain matin." speed={8}
                  onComplete={() => {}} />
              </SBubble>
              <SBtn onClick={() => goNext("coaching-bot")} icon={Award} label="Coaching d'un Bot" />
            </>
          )}
        </>
      )}

      {si >= 12 && (
        <SBubble code="CEOB" collapsed={si > 12}>
          <TypewriterText text="Tim a un taux de reussite de 91% mais ses rapports sont parfois trop techniques pour les non-devs. Suggestion: augmenter son parametre 'vulgarisation' de 3 a 7. Ca va rendre ses livrables plus accessibles sans perdre en precision." speed={8}
            onComplete={() => {}} />
          {si === 12 && <SBtn onClick={() => goNext("recap")} icon={CheckCircle2} label="Recapitulatif" />}
        </SBubble>
      )}

      {si >= 13 && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText text="Resume de la session: 2 delegations lancees (Mathilde + Helene), 1 config modifiee (Tim vulgarisation), Paco actif sur Infrastructure. Ton equipe est a pleine capacite. Prochaine action: valider le budget Q3 avec Frank." speed={8}
            onComplete={() => {}} />
        </SBubble>
      )}
    </div>
  );

  // ── Right panel content router ──
  function RightContent() {
    switch (stage) {
      case "hub-bots": return <ContentHubBots />;
      case "profil-bot": return <ContentProfilBot />;
      case "trisociation": return <ContentTrisociation />;
      case "performance-bot": return <ContentPerformance />;
      case "equipe-humaine": return <ContentEquipeHumaine />;
      case "assignation": return <ContentAssignation />;
      case "bot-en-action": return <ContentBotEnAction />;
      case "configuration": return <ContentConfiguration />;
      case "collaboration": return <ContentCollaboration />;
      case "carlos-orchestre": return <ContentOrchestrateur />;
      case "daily-briefing": return <ContentDailyBriefing />;
      case "delegation-live": return <ContentDelegation />;
      case "coaching-bot": return <ContentCoaching />;
      case "recap": return <ContentRecap />;
      default: return null;
    }
  }

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden text-[9px]">
      {/* Sim header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b">
        <div className="flex items-center gap-2">
          <button onClick={() => onBack ? onBack() : window.history.back()} className="text-gray-400 hover:text-gray-600 cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" /></button>
          <span className="font-bold text-[11px]">Simulation — Mon Equipe AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          {STAGE_ORDER.map((s, i) => (
            <div key={s} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i < si ? "bg-blue-500" : i === si ? "bg-blue-600 ring-2 ring-blue-200" : "bg-gray-200")} title={STAGE_LABELS[s]} />
          ))}
          <button onClick={() => setStage("hub-bots")} className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Color line */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400" />

      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Chat 40% */}
        <div className="w-[40%] flex flex-col border-r bg-white">
          <div className="h-12 flex items-center px-3 gap-2 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">{discussionContext}</p>
              <p className="text-[8px] opacity-70">GhostX Team — {activeBots.length} bots actifs</p>
            </div>
            <MessageSquare className="h-4 w-4 opacity-60" />
          </div>

          <div className="h-7 flex items-center px-3 gap-2 bg-blue-50 border-b border-blue-100">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[9px] font-medium text-blue-700">Gestion d'equipe</span>
            <span className="text-[8px] text-blue-400 ml-auto">{STAGE_LABELS[stage]}</span>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chatContent}
          </div>

          <div className="border-t px-3 py-2 flex items-center gap-2">
            <input type="text" placeholder="Parler a l'equipe..." className="flex-1 text-[9px] bg-gray-50 rounded-full px-3 py-1.5 border outline-none focus:ring-1 focus:ring-blue-300" readOnly />
            <Send className="h-3.5 w-3.5 text-gray-300" />
          </div>
        </div>

        {/* RIGHT — Content 60% */}
        <div className="w-[60%] flex flex-col overflow-hidden">
          <div className="h-10 flex items-center px-3 gap-1 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            {[
              { icon: Home, label: "Accueil" },
              { icon: Building2, label: "Mon Departement" },
              { icon: Users, label: "Mes Salles" },
              { icon: Brain, label: "Mon Equipe", active: true },
              { icon: Globe, label: "Mon Reseau" },
              { icon: Shield, label: "Admin" },
            ].map(n => (
              <div key={n.label} className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[9px] cursor-pointer transition-colors",
                n.active ? "bg-white/20 font-bold" : "opacity-60 hover:opacity-80"
              )}>
                <n.icon className="h-3.5 w-3.5" />{n.label}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b overflow-x-auto">
            {[
              { label: "12 Bots AI", stage: "hub-bots" as Stage },
              { label: "Equipe Humaine", stage: "equipe-humaine" as Stage },
              { label: "Assignations", stage: "assignation" as Stage },
              { label: "Performance", stage: "performance-bot" as Stage },
              { label: "Configuration", stage: "configuration" as Stage },
              { label: "Collaboration", stage: "collaboration" as Stage },
              { label: "Orchestrateur", stage: "carlos-orchestre" as Stage },
            ].map(t => {
              const isActive = t.stage === stage || (t.stage === "hub-bots" && ["hub-bots", "profil-bot", "trisociation"].includes(stage));
              return (
                <button key={t.label} onClick={() => goNext(t.stage)}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer",
                    isActive ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}>
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b">
            <span className="text-[8px] text-gray-400 uppercase tracking-wider font-medium">Actifs:</span>
            {activeBots.map(code => {
              const b = BOT_COLORS[code];
              return b ? (
                <div key={code} className="flex items-center gap-1">
                  <BotAvatar code={code} size="sm" />
                  <span className="text-[9px] font-medium">{b.name}</span>
                </div>
              ) : null;
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            <RightContent />
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // CONTENT COMPONENTS
  // ═══════════════════════════════════════

  function ContentHubBots() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">GhostX Team — 12 Agents Specialises</p>
        <div className="grid grid-cols-3 gap-2">
          {BOTS_FULL.map(bot => {
            const c = BOT_COLORS[bot.code];
            return (
              <div key={bot.code}
                onClick={() => { setSelectedBot(bot.code); goNext("profil-bot"); }}
                className="bg-white border rounded-lg p-2.5 cursor-pointer hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-2 mb-1.5">
                  <BotAvatar code={bot.code} size="md" />
                  <div className="min-w-0">
                    <p className={cn("text-[9px] font-bold", c?.text)}>{bot.name}</p>
                    <p className="text-[8px] text-gray-400">{bot.role} — {bot.dept}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-gray-500">{bot.missions} missions</span>
                  <span className="text-emerald-600 font-bold">{bot.taux}%</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-1">
                  <div className="h-1 bg-emerald-400 rounded-full" style={{ width: `${bot.taux}%` }} />
                </div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {bot.specialites.map(s => (
                    <span key={s} className="text-[7px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function ContentProfilBot() {
    const bot = BOTS_FULL.find(b => b.code === selectedBot) || BOTS_FULL[1];
    const c = BOT_COLORS[bot.code];
    return (
      <div className="px-4 py-3">
        <div className="bg-white border rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <BotAvatar code={bot.code} size="lg" />
            <div>
              <p className={cn("text-sm font-bold", c?.text)}>{bot.name}</p>
              <p className="text-[9px] text-gray-500">{bot.role} — {bot.dept}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] text-emerald-600">En ligne</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Missions", val: bot.missions.toString(), icon: Target },
              { label: "Taux reussite", val: `${bot.taux}%`, icon: CheckCircle2 },
              { label: "Temps moyen", val: "2.3h", icon: Clock },
            ].map(k => (
              <div key={k.label} className="bg-gray-50 rounded-lg p-2 text-center">
                <k.icon className="h-3.5 w-3.5 mx-auto mb-1 text-gray-400" />
                <p className="text-[11px] font-bold">{k.val}</p>
                <p className="text-[7px] text-gray-400">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] font-bold mb-2">Specialites</p>
          <div className="flex gap-1.5 flex-wrap">
            {bot.specialites.map(s => (
              <span key={s} className="text-[9px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ContentTrisociation() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-1">Trisociation™ — Tim (CTO)</p>
        <p className="text-[8px] text-gray-500 mb-3">3 OS combines pour une intelligence technique polyvalente</p>
        <div className="space-y-2.5">
          {[
            { label: "OS Primaire", color: "bg-blue-500", ...TRISOCIATION_TIM.primaire },
            { label: "OS Calibrateur", color: "bg-purple-500", ...TRISOCIATION_TIM.calibrateur },
            { label: "OS Amplificateur", color: "bg-amber-500", ...TRISOCIATION_TIM.amplificateur },
          ].map(os => (
            <div key={os.label} className="bg-white border rounded-xl p-3 flex items-start gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0", os.color)}>
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold">{os.label}</span>
                  <span className="text-[9px] text-gray-500">—</span>
                  <span className="text-[9px] font-bold">{os.nom}</span>
                </div>
                <p className="text-[9px] text-gray-600 mt-0.5">{os.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-3">
          <p className="text-[9px] font-bold text-blue-800">Synergie Trisociation</p>
          <p className="text-[8px] text-blue-600 mt-1">Musk apporte la vision audacieuse, Curie la calibre avec la methode scientifique, et de Vinci amplifie avec la creativite interdisciplinaire. Resultat: des solutions techniques innovantes ET rigoureuses.</p>
        </div>
      </div>
    );
  }

  function ContentPerformance() {
    const bot = BOTS_FULL.find(b => b.code === selectedBot) || BOTS_FULL[1];
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Performance — {bot.name} ({bot.role})</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: "Missions completees", val: bot.missions, max: 50, color: "bg-blue-400" },
            { label: "Taux reussite", val: bot.taux, max: 100, color: "bg-emerald-400" },
            { label: "Temps moyen", val: 78, max: 100, color: "bg-amber-400", display: "2.3h" },
            { label: "Score qualite", val: 88, max: 100, color: "bg-purple-400", display: "88/100" },
          ].map(m => (
            <div key={m.label} className="bg-white border rounded-lg p-2.5">
              <p className="text-[8px] text-gray-400 mb-1">{m.label}</p>
              <p className="text-sm font-bold">{m.display || m.val}</p>
              <div className="w-full h-1 bg-gray-100 rounded-full mt-1">
                <div className={cn("h-1 rounded-full", m.color)} style={{ width: `${(m.val / m.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Dernieres missions</p>
          {[
            { titre: "Audit architecture microservices", statut: "completee", duree: "1.8h" },
            { titre: "Migration base PostgreSQL 16", statut: "completee", duree: "3.2h" },
            { titre: "Fix pipeline CI/CD staging", statut: "completee", duree: "0.7h" },
            { titre: "Evaluation serverless AWS", statut: "en-cours", duree: "1.4h" },
          ].map((m, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn("h-3.5 w-3.5", m.statut === "completee" ? "text-emerald-500" : "text-amber-500")} />
                <span className="text-[9px]">{m.titre}</span>
              </div>
              <span className="text-[8px] text-gray-400">{m.duree}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentEquipeHumaine() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Equipe Humaine — 5 membres</p>
        <div className="space-y-2">
          {EQUIPE_HUMAINE.map((m, i) => (
            <div key={i} className="bg-white border rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                {m.nom.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold">{m.nom}</p>
                <p className="text-[8px] text-gray-500">{m.role} — {m.dept}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", m.actif ? "bg-emerald-400" : "bg-gray-300")} />
                <span className={cn("text-[8px]", m.actif ? "text-emerald-600" : "text-gray-400")}>{m.actif ? "Actif" : "Absent"}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-[9px] font-bold text-blue-800">Bots associes</p>
          <div className="mt-2 space-y-1.5">
            {[
              { humain: "Carl Fugere", bots: ["CEOB", "CTOB"] },
              { humain: "Marie-Eve Lapointe", bots: ["COOB", "CPOB"] },
              { humain: "Jean-Philippe Roy", bots: ["CTOB", "CINOB"] },
              { humain: "Sophie Tremblay", bots: ["CMOB", "CROB"] },
              { humain: "Antoine Bergeron", bots: ["CFOB", "CLOB"] },
            ].map(a => (
              <div key={a.humain} className="flex items-center gap-2">
                <span className="text-[8px] text-blue-700 w-28 truncate">{a.humain}</span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-300" />
                <div className="flex gap-1">
                  {a.bots.map(code => {
                    const b = BOT_COLORS[code];
                    return <span key={code} className="text-[7px] bg-white px-1.5 py-0.5 rounded text-gray-600">{b?.name}</span>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ContentAssignation() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Assignation — Drag &amp; Drop</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] font-medium text-gray-500 mb-2">Bots disponibles</p>
            <div className="space-y-1.5">
              {BOTS_FULL.filter(b => !["CEOB", "CTOB", "CFOB", "CMOB"].includes(b.code)).map(bot => {
                const c = BOT_COLORS[bot.code];
                return (
                  <div key={bot.code} className="bg-white border rounded-lg p-2 flex items-center gap-2 cursor-grab hover:shadow-sm">
                    <BotAvatar code={bot.code} size="sm" />
                    <div>
                      <p className={cn("text-[9px] font-bold", c?.text)}>{bot.name}</p>
                      <p className="text-[7px] text-gray-400">{bot.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-medium text-gray-500 mb-2">Chantiers actifs</p>
            <div className="space-y-1.5">
              {[
                { nom: "Marketing Q2", bots: ["CMOB", "CROB"], color: "border-l-pink-400" },
                { nom: "Infrastructure Tech", bots: ["CTOB"], color: "border-l-blue-400" },
                { nom: "RH Recrutement", bots: ["CHROB"], color: "border-l-green-400" },
                { nom: "Finance Budget Q3", bots: ["CFOB"], color: "border-l-amber-400" },
              ].map(ch => (
                <div key={ch.nom} className={cn("bg-white border border-l-2 rounded-lg p-2.5", ch.color)}>
                  <p className="text-[9px] font-bold mb-1.5">{ch.nom}</p>
                  <div className="flex gap-1 flex-wrap">
                    {ch.bots.map(code => {
                      const b = BOT_COLORS[code];
                      return (
                        <div key={code} className="flex items-center gap-1 bg-gray-50 rounded px-1.5 py-0.5">
                          <BotAvatar code={code} size="sm" />
                          <span className="text-[7px]">{b?.name}</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-1 bg-blue-50 rounded px-1.5 py-0.5 border border-dashed border-blue-200 cursor-pointer">
                      <UserPlus className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[7px] text-blue-500">Ajouter</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ContentBotEnAction() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Bot en Action — Paco (CPO)</p>
        <div className="bg-white border rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <BotAvatar code="CPOB" size="md" />
            <div>
              <p className="text-[9px] font-bold text-orange-600">Paco — Mission en cours</p>
              <p className="text-[8px] text-gray-500">Chantier Infrastructure Tech</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span className="text-[8px] text-emerald-600">Actif</span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { done: true, label: "Lecture du contexte chantier", time: "2 min" },
              { done: true, label: "Scan des processus existants", time: "5 min" },
              { active: true, label: "Audit des goulots d'etranglement", time: "En cours..." },
              { pending: true, label: "Generation du diagnostic", time: "~3 min" },
              { pending: true, label: "Recommandations et livrable", time: "~5 min" },
            ].map((step, i) => (
              <div key={i} className={cn("flex items-center gap-2", step.pending && "opacity-40")}>
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center",
                  step.done ? "bg-emerald-100" : step.active ? "bg-blue-100 animate-pulse" : "bg-gray-100"
                )}>
                  {step.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
                    step.active ? <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" /> :
                    <Clock className="h-3.5 w-3.5 text-gray-400" />}
                </div>
                <span className={cn("text-[9px]", step.active && "font-medium")}>{step.label}</span>
                <span className={cn("text-[8px] ml-auto", step.active ? "text-blue-500" : "text-gray-400")}>{step.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[8px] text-gray-500 mb-1">
              <span>Progression</span><span>45%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full">
              <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: "45%" }} />
            </div>
            <p className="text-[8px] text-gray-400 mt-1">ETA: ~13 minutes restantes</p>
          </div>
        </div>
      </div>
    );
  }

  function ContentConfiguration() {
    const bot = BOTS_FULL.find(b => b.code === selectedBot) || BOTS_FULL[1];
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Configuration — {bot.name} ({bot.role})</p>
        <div className="space-y-3">
          {[
            { label: "Ton", val: 6, options: ["Formel", "Decontracte"], desc: "Ajuste le style de communication" },
            { label: "Verbosite", val: 4, options: ["Concis", "Detaille"], desc: "Quantite de details dans les reponses" },
            { label: "Autonomie", val: 7, options: ["Demande toujours", "Agit seul"], desc: "Niveau de delegation des decisions" },
            { label: "Vulgarisation", val: 3, options: ["Technique", "Grand public"], desc: "Adaptation du vocabulaire" },
          ].map(s => (
            <div key={s.label} className="bg-white border rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-bold">{s.label}</p>
                <span className="text-[9px] text-blue-600 font-bold">{s.val}/10</span>
              </div>
              <p className="text-[8px] text-gray-400 mb-2">{s.desc}</p>
              <div className="flex items-center gap-2">
                <span className="text-[7px] text-gray-400 w-20">{s.options[0]}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full relative">
                  <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: `${s.val * 10}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" style={{ left: `${s.val * 10}%` }} />
                </div>
                <span className="text-[7px] text-gray-400 w-20 text-right">{s.options[1]}</span>
              </div>
            </div>
          ))}
          <div className="bg-white border rounded-lg p-3">
            <p className="text-[9px] font-bold mb-2">Domaines d'expertise</p>
            <div className="flex flex-wrap gap-1.5">
              {["Architecture", "DevOps", "Backend", "Frontend", "Database", "Security", "Cloud", "AI/ML"].map(d => (
                <span key={d} className={cn("text-[8px] px-2 py-1 rounded-full cursor-pointer transition-colors",
                  ["Architecture", "DevOps", "Backend", "Database"].includes(d)
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ContentCollaboration() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Collaboration Bot-to-Bot</p>
        <div className="bg-white border rounded-xl p-3 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <BotAvatar code="CTOB" size="md" />
              <span className="text-[9px] font-bold">Tim</span>
            </div>
            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-amber-300" />
              <GitBranch className="h-3.5 w-3.5 text-gray-400" />
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300 to-blue-300" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold">Frank</span>
              <BotAvatar code="CFOB" size="md" />
            </div>
          </div>
          <p className="text-[9px] text-gray-600 mb-2">Mission conjointe: Budget Infrastructure Tech</p>
          <div className="space-y-2">
            {[
              { side: "Tim (technique)", color: "blue", text: "3 options serveur evaluees, serverless recommande pour workloads intermittents" },
              { side: "Frank (financier)", color: "amber", text: "Serverless = economies de 34% sur 12 mois. ROI positif en 4 mois." },
              { side: "Conclusion commune", color: "emerald", text: "Recommandation: migration serverless + instance reservee pour workloads critiques. Budget: 8 200$/mois (-34%)" },
            ].map((r, i) => (
              <div key={i} className="flex gap-2">
                <div className={cn("w-1 rounded-full", `bg-${r.color}-400`)} />
                <div className={cn("rounded-lg p-2 flex-1", `bg-${r.color}-50`)}>
                  <p className={cn("text-[8px] font-bold", `text-${r.color}-700`)}>{r.side}</p>
                  <p className={cn("text-[8px]", `text-${r.color}-600`)}>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 border rounded-lg p-2.5">
          <p className="text-[9px] font-bold mb-1.5">Historique collaborations</p>
          {[
            { bots: "Tim + Frank", sujet: "Budget Infra Q2", result: "Adopte" },
            { bots: "Mathilde + Rich", sujet: "Pipeline ventes SEO", result: "En cours" },
            { bots: "Simone + CarlOS", sujet: "Analyse concurrentielle", result: "Livre" },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0 text-[8px]">
              <span className="text-gray-600">{h.bots}</span>
              <span className="text-gray-500">{h.sujet}</span>
              <span className={cn("font-medium", h.result === "Adopte" ? "text-emerald-600" : h.result === "Livre" ? "text-blue-600" : "text-amber-600")}>{h.result}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentOrchestrateur() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">CarlOS — Chef d'Orchestre</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Bots actifs", val: "6/12", color: "text-blue-600" },
            { label: "Missions en cours", val: "8", color: "text-emerald-600" },
            { label: "Charge moyenne", val: "67%", color: "text-amber-600" },
          ].map(k => (
            <div key={k.label} className="bg-white border rounded-lg p-2.5 text-center">
              <p className={cn("text-sm font-bold", k.color)}>{k.val}</p>
              <p className="text-[7px] text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {BOTS_FULL.slice(0, 6).map((bot, idx) => {
            const c = BOT_COLORS[bot.code];
            const charge = [45, 72, 88, 60, 35, 52][idx];
            const mission = ["Audit infra", "Budget Q3", "Campagne SEO", "Plan RH", "Veille marche", "Processus usine"][idx];
            return (
              <div key={bot.code} className="bg-white border rounded-lg p-2 flex items-center gap-2">
                <BotAvatar code={bot.code} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-bold", c?.text)}>{bot.name}</span>
                    <span className="text-[8px] text-gray-400">{mission}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full mt-1">
                    <div className={cn("h-1 rounded-full", charge > 80 ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${charge}%` }} />
                  </div>
                </div>
                <span className={cn("text-[9px] font-bold", charge > 80 ? "text-amber-600" : "text-emerald-600")}>{charge}%</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[9px] font-bold text-emerald-700">Statut global: Optimal</span>
          </div>
          <p className="text-[8px] text-emerald-600">Aucun bottleneck detecte. 6 bots inactifs disponibles pour nouvelles missions.</p>
        </div>
      </div>
    );
  }

  function ContentDailyBriefing() {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck className="h-4 w-4 text-blue-600" />
          <p className="text-[11px] font-bold">Briefing du Matin — Lundi 31 mars</p>
        </div>
        <div className="space-y-2">
          {BRIEFING_ITEMS.map((item, i) => {
            const bot = BOT_COLORS[item.bot];
            const urgColor = item.urgence === "haute" ? "border-l-red-400 bg-red-50/30" : item.urgence === "moyenne" ? "border-l-amber-400 bg-amber-50/30" : "border-l-gray-300";
            const typeIcon = item.type === "validation" ? CheckCircle2 : item.type === "alerte" ? Zap : item.type === "decision" ? Target : item.type === "opportunite" ? Star : item.type === "recurrence" ? RefreshCw : TrendingUp;
            const TypeIcon = typeIcon;
            return (
              <div key={i} className={cn("bg-white border border-l-2 rounded-lg p-2.5", urgColor)}>
                <div className="flex items-center gap-2 mb-1">
                  <TypeIcon className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-medium">{item.type}</span>
                  <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-medium ml-auto",
                    item.urgence === "haute" ? "bg-red-100 text-red-600" : item.urgence === "moyenne" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                  )}>{item.urgence}</span>
                </div>
                <p className="text-[9px] font-medium mb-1">{item.titre}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <BotAvatar code={item.bot} size="sm" />
                    <span className="text-[8px] text-gray-500">{bot?.name}</span>
                  </div>
                  <span className="text-[8px] text-gray-400">{item.delai}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 text-[8px] bg-blue-600 text-white py-1.5 rounded-lg font-bold cursor-pointer hover:bg-blue-700">Tout valider</button>
          <button className="flex-1 text-[8px] bg-white border text-gray-600 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-gray-50">Deleguer a CarlOS</button>
        </div>
      </div>
    );
  }

  function ContentDelegation() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Delegation en Direct</p>
        <div className="space-y-2.5">
          {[
            { bot: "CMOB", mission: "Suivi campagne SEO", detail: "Rapport + recommandations d'ici vendredi" },
            { bot: "CHROB", mission: "Embauche dev junior", detail: "3 CV a evaluer, grilles d'entrevue demain" },
          ].map((d, i) => {
            const c = BOT_COLORS[d.bot];
            return (
              <div key={i} className="bg-white border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BotAvatar code={d.bot} size="md" />
                  <div className="flex-1">
                    <p className={cn("text-[9px] font-bold", c?.text)}>{c?.name}</p>
                    <p className="text-[8px] text-gray-500">{c?.role}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[8px] text-emerald-600 font-medium">Accepte</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[9px] font-medium">{d.mission}</p>
                  <p className="text-[8px] text-gray-500 mt-0.5">{d.detail}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[8px]">
                  <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  <span className="text-emerald-600">En cours — demarree il y a 2 minutes</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-[9px] font-bold text-blue-800 mb-1">CarlOS supervise</p>
          <p className="text-[8px] text-blue-600">Je surveille les 2 missions deleguees. Tu recevras une notification des que Mathilde aura son rapport et quand Helene aura les grilles pretes.</p>
        </div>
      </div>
    );
  }

  function ContentCoaching() {
    const bot = BOTS_FULL.find(b => b.code === selectedBot) || BOTS_FULL[1];
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Coaching — {bot.name} ({bot.role})</p>
        <div className="bg-white border rounded-xl p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Points forts</p>
          <div className="space-y-1.5">
            {["Execution rapide (temps moyen sous la moyenne)", "Precision technique elevee", "Bonne collaboration avec Frank (CFO)"].map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-[9px] text-gray-700">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Axes d'amelioration</p>
          <div className="space-y-1.5">
            {[
              { point: "Rapports trop techniques pour les non-devs", action: "Augmenter vulgarisation 3 a 7" },
              { point: "Tendance a sur-ingenierer les solutions simples", action: "Ajouter contrainte simplicite d'abord" },
            ].map((a, i) => (
              <div key={i} className="bg-amber-50 rounded-lg p-2">
                <p className="text-[9px] text-amber-800">{a.point}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[8px] text-amber-600 font-medium">Action: {a.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="w-full text-[9px] bg-blue-600 text-white py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-700">Appliquer les ajustements</button>
      </div>
    );
  }

  function ContentRecap() {
    return (
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 text-center mb-3">
          <Crown className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-bold text-blue-900">Session Equipe Terminee</p>
          <p className="text-[9px] text-blue-600 mt-1">Voici le resume de tes actions</p>
        </div>
        <div className="space-y-2">
          {[
            { icon: UserPlus, label: "Paco assigne au chantier Infrastructure Tech", color: "text-orange-600" },
            { icon: ArrowRight, label: "Campagne SEO deleguee a Mathilde", color: "text-pink-600" },
            { icon: ArrowRight, label: "Embauche dev junior deleguee a Helene", color: "text-green-600" },
            { icon: Settings, label: "Tim: vulgarisation ajustee", color: "text-blue-600" },
            { icon: BarChart3, label: "6 bots actifs, charge 67%, 0 bottleneck", color: "text-emerald-600" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border rounded-lg p-2.5">
              <a.icon className={cn("h-3.5 w-3.5 shrink-0", a.color)} />
              <span className="text-[9px]">{a.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 text-[8px] bg-blue-600 text-white py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-700">Retour a Mon Departement</button>
          <button className="flex-1 text-[8px] bg-white border text-gray-600 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-50">Voir Mes Salles</button>
        </div>
      </div>
    );
  }
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  if (collapsed) {
    return (
      <div className="flex gap-2 items-center opacity-60">
        <BotAvatar code={code} size="sm" />
        <div className="text-[9px] text-gray-400">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[88%] shadow-sm border-l-2", bot.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[11px] font-semibold", bot.text)}>{bot.name}</span>
          <span className="text-[9px] text-gray-400">{bot.role}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onClick}
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, delay);
    return () => clearTimeout(timer);
  }, [onComplete, delay]);
  return null;
}
