/**
 * BranchPatternsDemo.tsx — Simulation interactive CREDO
 * Flow complet : Tension → Branches → Synthese → Cristallisation → Classement
 * Animations : thinking steps, typewriter text, bot consulting
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GitBranch,
  MessageCircle,
  ArrowRight,
  FileText,
  Swords,
  Lightbulb,
  Zap,
  FolderKanban,
  BookmarkPlus,
  Archive,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Target,
  Search,
  Eye,
  BarChart3,
  Send,
  Bot,
  User,
  Clock,
  Loader2,
  Brain,
  Cpu,
  Database,
  Network,
  Scan,
  BookOpen,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";

// ========== ANIMATION COMPONENTS ==========

/** Typewriter — texte qui s'ecrit caractere par caractere */
function TypewriterText({ text, speed = 12, onComplete, className }: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-gray-800 ml-0.5 animate-pulse align-text-bottom" />}
    </span>
  );
}

/** ThinkingAnimation — etapes de reflexion qui defilent avant la reponse */
function ThinkingAnimation({ steps, botEmoji, botName, botCode, onComplete }: {
  steps: { icon: React.ElementType; text: string }[];
  botEmoji: string;
  botCode?: string;
  botName: string;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(onComplete, 400);
      return;
    }
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, 800 + Math.random() * 600);
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  const botColor = botCode ? BOT_COLORS[botCode] : null;

  return (
    <div className="flex gap-3">
      {botCode ? (
        <BotAvatar code={botCode} size="md" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">{botEmoji}</div>
      )}
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm min-w-[280px]", botColor && `border-l-[3px] ${botColor.border}`)}>
        <div className={cn("text-xs mb-2", botColor?.text || "text-gray-400")}>{botName} reflechit...</div>
        <div className="space-y-1.5">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = completedSteps.includes(i);
            const isPending = i > currentStep;
            if (isPending) return null;
            const Icon = step.icon;
            return (
              <div key={i} className={cn(
                "flex items-center gap-2 text-sm transition-all",
                isActive && (botColor?.text || "text-blue-600"),
                isDone && "text-green-600",
              )}>
                {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                <Icon className="h-3.5 w-3.5" />
                <span className={cn(isDone && "line-through opacity-60")}>{step.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** MultiConsultAnimation — animation de consultation de plusieurs bots */
function MultiConsultAnimation({ bots, onComplete }: {
  bots: { emoji: string; name: string; code?: string }[];
  onComplete: () => void;
}) {
  const [activeBot, setActiveBot] = useState(0);
  const [phase, setPhase] = useState<"consulting" | "consolidating">("consulting");

  useEffect(() => {
    if (phase === "consulting") {
      if (activeBot >= bots.length) {
        setPhase("consolidating");
        return;
      }
      const timer = setTimeout(() => setActiveBot(prev => prev + 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeBot, phase, bots.length]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Network className="h-4 w-4 text-blue-600 animate-pulse" />
          <span className="text-sm font-semibold text-blue-800">
            {phase === "consulting" ? "Consultation des departements..." : "Consolidation des perspectives..."}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {bots.map((bot, i) => {
            const isActive = phase === "consulting" && i === activeBot;
            const isDone = i < activeBot;
            const botColor = bot.code ? BOT_COLORS[bot.code] : null;
            return (
              <div key={i} className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive && "scale-110",
                !isDone && !isActive && "opacity-30",
              )}>
                <div className={cn(
                  "relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all",
                  isActive && (botColor ? cn(botColor.border, "shadow-md") : "border-blue-500 shadow-md"),
                  isDone && "border-green-500",
                  !isDone && !isActive && "border-gray-200",
                )}>
                  {bot.code && BOT_COLORS[bot.code]?.avatar ? (
                    <img src={BOT_COLORS[bot.code].avatar} alt={bot.name} className={cn("w-full h-full object-cover", isActive && "opacity-50", !isDone && !isActive && "opacity-30")} />
                  ) : (
                    <div className={cn("w-full h-full flex items-center justify-center text-lg", isActive ? "bg-blue-50" : isDone ? "bg-green-50" : "bg-gray-50")}>
                      <span className={cn(isActive && "opacity-50")}>{bot.emoji}</span>
                    </div>
                  )}
                  {isActive && <Loader2 className={cn("h-5 w-5 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", botColor ? botColor.text : "text-blue-500")} />}
                </div>
                <span className={cn("text-xs font-medium", isDone ? "text-gray-600" : botColor ? botColor.text : "text-gray-600")}>{bot.name}</span>
                {isDone && <CheckCircle2 className="h-3 w-3 text-green-500" />}
              </div>
            );
          })}

          {/* Fleche vers synthese */}
          {phase === "consolidating" && (
            <div className="flex items-center gap-2 ml-2 animate-pulse">
              <ArrowRight className="h-4 w-4 text-indigo-500" />
              <Zap className="h-5 w-5 text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== CREDO PHASE INDICATOR ==========

type CREDOPhase = "C" | "R" | "E" | "D" | "O" | "done";
type CristalType = "idee" | "banque" | "document" | null;

function PhaseIndicator({ phase }: { phase: CREDOPhase }) {
  const phases: { id: CREDOPhase; label: string; full: string }[] = [
    { id: "C", label: "C", full: "Connecter" },
    { id: "R", label: "R", full: "Rechercher" },
    { id: "E", label: "E", full: "Exposer" },
    { id: "D", label: "D", full: "Demontrer" },
    { id: "O", label: "O", full: "Obtenir" },
  ];

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => {
        const isActive = p.id === phase;
        const isPast = phases.findIndex(x => x.id === phase) > i;
        const isDone = phase === "done";
        return (
          <div key={p.id} className="flex items-center gap-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
              isActive && "bg-blue-600 text-white shadow-md scale-110",
              isPast || isDone ? "bg-green-500 text-white" : "",
              !isActive && !isPast && !isDone && "bg-gray-200 text-gray-500",
            )}>
              {isPast || isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : p.label}
            </div>
            {i < phases.length - 1 && (
              <div className={cn(
                "w-4 h-0.5 transition-all duration-500",
                isPast || isDone ? "bg-green-400" : "bg-gray-200",
              )} />
            )}
          </div>
        );
      })}
      <span className="text-xs text-muted-foreground ml-2 font-medium">
        {phase === "done" ? "Cristallise" : phases.find(p => p.id === phase)?.full}
      </span>
    </div>
  );
}

// ========== SIMULATION DATA ==========

const SIM = {
  userTension: "Je pense qu'on devrait lancer un service d'abonnement mensuel pour nos clients manufacturiers. On leur fait deja du consulting ponctuel, mais je sens qu'on laisse de l'argent sur la table.",

  ceoThinking: [
    { icon: Scan, text: "Analyse du contexte marche..." },
    { icon: Database, text: "Verification des donnees clients..." },
    { icon: Brain, text: "Evaluation strategique..." },
    { icon: BookOpen, text: "Formulation de la reponse..." },
  ],
  ceoConnect: "Bonne tension. Tu touches a quelque chose d'important — le passage de transactionnel a recurrent, c'est le move #1 pour stabiliser le cash flow. Avant de foncer, je veux comprendre : c'est quoi le declencheur? Un client t'en a parle, ou c'est une intuition?",

  consultBots: [
    { emoji: "💰", name: "CFO", code: "BCF" },
    { emoji: "📈", name: "CRO", code: "BRO" },
    { emoji: "⚙️", name: "COO", code: "BOO" },
  ],
  perspectives: [
    {
      emoji: "💰", code: "BCF", name: "CFO", angle: "Analyse financiere",
      text: "Un modele d'abonnement a 2,500$/mois avec 20 clients = 600K$ recurrents annuels. Marge brute estimee: 72% vs 45% en consulting ponctuel. Le break-even est a 8 clients. Cash flow positif des le mois 4 si on signe 3 clients/mois.",
      verdict: "Financierement solide", color: "green",
      sources: [
        { type: "doc" as const, label: "Rapport financier Q4 2025" },
        { type: "stat" as const, label: "Benchmark SaaS manufact. — Gartner 2025" },
        { type: "data" as const, label: "Historique facturation (CRM)" },
      ],
    },
    {
      emoji: "📈", code: "BRO", name: "CRO", angle: "Strategie de vente",
      text: "Notre pipeline actuel a 47 clients en consulting. 60% ont achete 2+ fois — ceux-la sont nos cibles #1 pour la conversion. Proposition: offrir les 2 premiers mois a 50% pour convertir. Risque: cannibaliser le consulting ponctuel a court terme.",
      verdict: "Pipeline suffisant, attention cannibalisation", color: "yellow",
      sources: [
        { type: "data" as const, label: "Pipeline CRM — 47 clients actifs" },
        { type: "stat" as const, label: "Taux retention clients 2024-2025" },
        { type: "stat" as const, label: "Conversion freemium — McKinsey 2024" },
      ],
    },
    {
      emoji: "⚙️", code: "BOO", name: "COO", angle: "Operations & livraison",
      text: "On a la capacite pour 12 clients abonnes avec l'equipe actuelle. Au-dela, il faut embaucher. Le consulting ponctuel est flexible — l'abonnement exige une disponibilite constante. Il faut definir un SLA clair: temps de reponse, nombre d'heures incluses, livrables mensuels.",
      verdict: "Faisable jusqu'a 12, SLA a definir", color: "orange",
      sources: [
        { type: "data" as const, label: "Capacite equipe — RH Dashboard" },
        { type: "doc" as const, label: "SLA Benchmark industrie consulting" },
        { type: "data" as const, label: "Charge de travail Q1 2026" },
      ],
    },
  ],

  challengeQuestion: "Et si on rate le SLA? Un client abonne qui attend 3 jours pour une reponse, c'est pire qu'un client ponctuel qui attend une semaine. On risque de detruire notre reputation.",
  challengeThinking: [
    { icon: Swords, text: "Analyse du risque identifie..." },
    { icon: Brain, text: "Recherche de solutions structurelles..." },
    { icon: Cpu, text: "Modelisation des scenarios..." },
    { icon: BookOpen, text: "Formulation des contre-mesures..." },
  ],
  challengeResult: [
    { emoji: "👔", code: "BCO", name: "CEO",
      text: "Point valide. La solution: un systeme de tiers. Tier 1 (2,500$): support email 48h, 10h/mois. Tier 2 (5,000$): support prioritaire 24h, 20h/mois + un check-in mensuel. Tier 3 (10,000$): dedie, meme jour, heures illimitees. Ca protege la reputation ET maximise le revenu.",
      sources: [
        { type: "doc" as const, label: "Pricing SaaS — ProfitWell 2025" },
        { type: "data" as const, label: "Analyse churn par tier — historique interne" },
      ],
    },
    { emoji: "💻", code: "BCT", name: "CTO",
      text: "Techniquement, on peut automatiser 40% du support Tier 1 avec nos bots. Ca libere l'equipe pour les Tiers 2-3 ou la marge est. Je recommande de construire un portail client avec ticketing integre — 2 semaines de dev max.",
      sources: [
        { type: "doc" as const, label: "Architecture technique V2.1" },
        { type: "stat" as const, label: "Benchmark portails — Zendesk, Intercom" },
        { type: "data" as const, label: "Estimation dev — backlog sprint" },
      ],
    },
  ],

  syntheseThinking: [
    { icon: Network, text: "Croisement des perspectives..." },
    { icon: Scan, text: "Identification des convergences..." },
    { icon: Brain, text: "Evaluation des risques residuels..." },
    { icon: Zap, text: "Generation de la synthese..." },
  ],
  synthese: {
    titre: "Service d'abonnement manufacturier — 3 tiers",
    points: [
      "Modele 3 tiers: 2,500$ / 5,000$ / 10,000$ par mois",
      "Cible initiale: 28 clients existants (2+ achats)",
      "Break-even a 8 clients, objectif 20 en 6 mois = 600K$ ARR",
      "Capacite: 12 clients avec equipe actuelle, embauche au-dela",
      "Portail client avec ticketing automatise (2 semaines dev)",
      "Lancement: offre 50% les 2 premiers mois pour les 10 premiers",
    ],
    risques: [
      "Cannibalisation consulting ponctuel a court terme",
      "SLA a respecter imperativement (reputation)",
    ],
  },

  demonstration: {
    projections: [
      { mois: "Mois 1-2", clients: 5, mrr: "8,750$", note: "Early adopters, tarif promo" },
      { mois: "Mois 3-4", clients: 12, mrr: "35,000$", note: "Break-even atteint" },
      { mois: "Mois 5-6", clients: 20, mrr: "50,000$", note: "Embauche #1 necessaire" },
      { mois: "An 1", clients: 20, mrr: "600K$ ARR", note: "Objectif atteint" },
    ],
  },

  ceoOptions: [
    { num: 1, text: "Oui, 3 clients m'en ont parle recemment", consequence: "Validation marche → accelerer" },
    { num: 2, text: "C'est une intuition, pas encore valide", consequence: "Besoin de donnees → consulter CRO" },
    { num: 3, text: "Je veux d'abord voir les chiffres", consequence: "Analyse financiere → consulter CFO" },
  ],

  challengeOptions: [
    { num: 1, text: "Le systeme de tiers me convainc, on synthetise", consequence: "→ Synthese des perspectives" },
    { num: 2, text: "Je veux voir le portail client avant de decider", consequence: "→ Thread lateral CTO" },
    { num: 3, text: "Et si on testait avec 1 seul client d'abord?", consequence: "→ Nouvelle branche pilote" },
  ],

  actionsPossibles: [
    "Creer le Cahier de Projet complet (structure tarifaire, SLA, go-to-market)",
    "Assigner au CRO: identifier les 10 premiers clients cibles",
    "Assigner au CTO: maquette du portail client",
    "Planifier un meeting de lancement (semaine prochaine)",
  ],

  // === THREAD PARKING ===
  driftMessage: "Attends — le CTO parle de 2 semaines pour le portail client, mais notre document d'architecture technique date de 6 mois. Avant de budgeter ca, il faut verifier que l'archi supporte ce qu'on veut faire.",

  parkingSteps: [
    { icon: Scan, text: "Changement de contexte detecte..." },
    { icon: Database, text: "Sauvegarde du thread Abonnement (Phase R, 5 contributions)..." },
    { icon: Brain, text: "Ouverture d'un thread lateral..." },
  ],

  parkingMessage: "Je detecte un changement de contexte. L'architecture technique doit etre verifiee avant de budgeter le portail. Je parke le thread Abonnement — tout est sauvegarde, phase R avec 5 contributions. On y revient des que l'archi est validee.",

  sideThreadThinking: [
    { icon: Database, text: "Ouverture du document d'architecture..." },
    { icon: Scan, text: "Verification des sections API, DB, Front..." },
    { icon: Cpu, text: "Analyse de compatibilite portail client..." },
  ],

  sideThreadCTO: "J'ai verifie le document d'architecture. Il est a 80% a jour — les sections API et base de donnees sont solides. Par contre, la section front-end et le module d'authentification doivent etre actualises. Ca represente environ 4 heures de travail de documentation, pas un bloqueur pour le portail client. Je mets a jour maintenant.",
  sideThreadSources: [
    { type: "doc" as const, label: "Architecture-Technique-V2.1.pdf" },
    { type: "data" as const, label: "Audit modules — dernier scan 12 fev" },
    { type: "doc" as const, label: "Matrice compatibilite stack" },
  ],

  crossLinkMessage: "Le CTO confirme que l'architecture supporte le portail client. La section front-end sera mise a jour sous 4h — pas un bloqueur. J'ai mis a jour la perspective CTO dans le thread Abonnement Manufacturier avec cette information. On reprend la ou on etait?",
};

// ========== REFLECTION MODES ==========

const REFLECTION_MODES = [
  { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-300" },
  { id: "debat", label: "Debat", icon: Swords, bg: "bg-red-100", text: "text-red-700", ring: "ring-red-300" },
  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-300" },
  { id: "strategie", label: "Strategie", icon: Target, bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-300" },
  { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-700", ring: "ring-pink-300" },
  { id: "decision", label: "Decision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700", ring: "ring-green-300" },
  { id: "crise", label: "Crise", icon: Zap, bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-300" },
  { id: "deep", label: "Deep", icon: Brain, bg: "bg-indigo-100", text: "text-indigo-700", ring: "ring-indigo-300" },
];

// ========== BOT C-LEVEL COLORS (14 bots) ==========

const BOT_COLORS: Record<string, {
  bg: string; bgLight: string; text: string; border: string;
  ring: string; dot: string; emoji: string; name: string; role: string;
  avatar: string;
}> = {
  BCO: { bg: "bg-blue-600", bgLight: "bg-blue-50", text: "text-blue-700", border: "border-blue-400", ring: "ring-blue-300", dot: "bg-blue-500", emoji: "👔", name: "CarlOS", role: "CEO", avatar: "/agents/ceo-carlos.png" },
  BCT: { bg: "bg-violet-600", bgLight: "bg-violet-50", text: "text-violet-700", border: "border-violet-400", ring: "ring-violet-300", dot: "bg-violet-500", emoji: "💻", name: "Thomas", role: "CTO", avatar: "/agents/cto-thomas.png" },
  BCF: { bg: "bg-emerald-600", bgLight: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-400", ring: "ring-emerald-300", dot: "bg-emerald-500", emoji: "💰", name: "François", role: "CFO", avatar: "/agents/cfo-francois.png" },
  BCM: { bg: "bg-pink-600", bgLight: "bg-pink-50", text: "text-pink-700", border: "border-pink-400", ring: "ring-pink-300", dot: "bg-pink-500", emoji: "📣", name: "Sofia", role: "CMO", avatar: "/agents/cmo-sofia.png" },
  BCS: { bg: "bg-red-600", bgLight: "bg-red-50", text: "text-red-700", border: "border-red-400", ring: "ring-red-300", dot: "bg-red-500", emoji: "🎯", name: "Marc", role: "CSO", avatar: "/agents/cso-marc.png" },
  BOO: { bg: "bg-orange-600", bgLight: "bg-orange-50", text: "text-orange-700", border: "border-orange-400", ring: "ring-orange-300", dot: "bg-orange-500", emoji: "⚙️", name: "Lise", role: "COO", avatar: "/agents/coo-lise.png" },
  BFA: { bg: "bg-slate-600", bgLight: "bg-slate-50", text: "text-slate-700", border: "border-slate-400", ring: "ring-slate-300", dot: "bg-slate-500", emoji: "🏭", name: "FactoryBot", role: "Factory", avatar: "" },
  BHR: { bg: "bg-teal-600", bgLight: "bg-teal-50", text: "text-teal-700", border: "border-teal-400", ring: "ring-teal-300", dot: "bg-teal-500", emoji: "🤝", name: "David", role: "CHRO", avatar: "/agents/David - CHRO.png" },
  BIO: { bg: "bg-cyan-600", bgLight: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-400", ring: "ring-cyan-300", dot: "bg-cyan-500", emoji: "📊", name: "Hélène", role: "CIO", avatar: "/agents/Hélène - CIO.png" },
  BCC: { bg: "bg-rose-600", bgLight: "bg-rose-50", text: "text-rose-700", border: "border-rose-400", ring: "ring-rose-300", dot: "bg-rose-500", emoji: "📢", name: "Émilie", role: "CCO", avatar: "/agents/CCO - Émilie2.png" },
  BPO: { bg: "bg-fuchsia-600", bgLight: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-400", ring: "ring-fuchsia-300", dot: "bg-fuchsia-500", emoji: "🚀", name: "Alex", role: "CPO", avatar: "/agents/CPO - Alex2.png" },
  BRO: { bg: "bg-amber-600", bgLight: "bg-amber-50", text: "text-amber-700", border: "border-amber-400", ring: "ring-amber-300", dot: "bg-amber-500", emoji: "📈", name: "Julien", role: "CRO", avatar: "/agents/CRO - Julien2.png" },
  BLE: { bg: "bg-indigo-600", bgLight: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-400", ring: "ring-indigo-300", dot: "bg-indigo-500", emoji: "⚖️", name: "Isabelle", role: "Legal", avatar: "/agents/CLO - Isabelle3.png" },
  BSE: { bg: "bg-zinc-700", bgLight: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-400", ring: "ring-zinc-300", dot: "bg-zinc-500", emoji: "🛡️", name: "SecBot", role: "CISO", avatar: "" },
};

const USER_AVATAR = "/agents/carl-fugere.jpg";

/** Avatar du bot — photo si disponible, emoji en fallback */
function BotAvatar({ code, size = "md", className }: { code: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  const sizeClasses = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-10 h-10" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };

  if (bot.avatar) {
    return (
      <div className={cn("rounded-full overflow-hidden shrink-0 ring-2", bot.ring, sizeClasses[size], className)}>
        <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("rounded-full flex items-center justify-center shrink-0 text-white", bot.bg, sizeClasses[size], textSizes[size], className)}>
      {bot.emoji}
    </div>
  );
}

// ========== SOURCE TAGS ==========

const SOURCE_ICONS = {
  doc: { icon: FileText, color: "text-blue-500" },
  stat: { icon: BarChart3, color: "text-emerald-500" },
  data: { icon: Database, color: "text-purple-500" },
};

function SourcesList({ sources }: { sources: { type: "doc" | "stat" | "data"; label: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {sources.map((s, i) => {
        const cfg = SOURCE_ICONS[s.type];
        const Icon = cfg.icon;
        return (
          <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 hover:bg-gray-100 cursor-pointer transition-colors">
            <Icon className={cn("h-3 w-3 shrink-0", cfg.color)} />
            <span className="truncate max-w-[160px]">{s.label}</span>
          </span>
        );
      })}
    </div>
  );
}

/** InlineOptions — clickable option cards inside a bubble */
function InlineOptions({ options, onSelect, animate }: {
  options: { num: number; text: string; consequence: string }[];
  onSelect: (num: number) => void;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [animate]);

  if (!visible) return null;

  const borderColors = ["border-l-blue-500", "border-l-amber-500", "border-l-green-500"];
  const hoverBgs = ["hover:bg-blue-50", "hover:bg-amber-50", "hover:bg-green-50"];

  return (
    <div className="mt-3 space-y-1.5 animate-in fade-in duration-500">
      {options.map((opt, i) => (
        <button
          key={opt.num}
          onClick={() => onSelect(opt.num)}
          className={cn(
            "w-full text-left border border-gray-200 rounded-lg px-3 py-2 transition-all",
            "border-l-[3px]",
            borderColors[i],
            hoverBgs[i],
            "hover:shadow-sm group cursor-pointer",
          )}
        >
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">{opt.num}.</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{opt.text}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{opt.consequence}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/** ModeSelector — barre de selection des modes de reflexion */
function ModeSelector({ activeMode, onChangeMode }: {
  activeMode: string;
  onChangeMode: (mode: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-gray-500 font-medium mr-1">Mode :</span>
      {REFLECTION_MODES.map(m => {
        const isActive = activeMode === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onChangeMode(m.id)}
            className={cn(
              "text-[11px] px-2 py-1 rounded-full flex items-center gap-1 font-medium transition-all",
              isActive
                ? cn(m.bg, m.text, "ring-1", m.ring)
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600",
            )}
          >
            <Icon className="h-3 w-3" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

// ========== CARD COMPONENTS ==========

function MultiPerspectivesCard({ perspectives, onChallenge, animate }: {
  perspectives: typeof SIM.perspectives;
  onChallenge: () => void;
  animate: boolean;
}) {
  const [visibleCols, setVisibleCols] = useState(animate ? 0 : 3);
  const [activeMode, setActiveMode] = useState("analyse");

  useEffect(() => {
    if (!animate) return;
    const timers = [
      setTimeout(() => setVisibleCols(1), 300),
      setTimeout(() => setVisibleCols(2), 800),
      setTimeout(() => setVisibleCols(3), 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const currentMode = REFLECTION_MODES.find(m => m.id === activeMode)!;

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b">
          <GitBranch className="h-4 w-4 text-green-600" />
          <span className="text-sm font-bold text-gray-700">Multi-perspectives — 3 departements</span>
          {/* Mode actif badge */}
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", currentMode.bg, currentMode.text)}>
            <currentMode.icon className="h-3 w-3" />
            {currentMode.label}
          </span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto font-medium">Phase R</span>
        </div>

        <div className="grid grid-cols-3 gap-0 divide-x">
          {perspectives.map((p, i) => {
            const botColor = BOT_COLORS[p.code];
            return (
            <div key={p.code} className={cn(
              "transition-all duration-500",
              i < visibleCols ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}>
              {/* Bande identitaire couleur du bot */}
              <div className={cn("h-1.5", botColor?.bg || "bg-gray-300")} />
              <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <BotAvatar code={p.code} size="md" />
                <div>
                  <div className={cn("text-sm font-bold", botColor?.text || "text-gray-800")}>{botColor?.name || p.name} <span className="text-xs font-normal text-gray-400">({botColor?.role})</span></div>
                  <div className="text-xs text-gray-400">{p.angle}</div>
                </div>
              </div>
              {i < visibleCols ? (
                <TypewriterText text={p.text} speed={8} className="text-sm text-gray-600 leading-relaxed" />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
              )}
              <div className={cn(
                "mt-2 text-xs px-2 py-1 rounded font-medium transition-all duration-300",
                i < visibleCols ? "opacity-100" : "opacity-0",
                p.color === "green" && "bg-green-50 text-green-700",
                p.color === "yellow" && "bg-yellow-50 text-yellow-700",
                p.color === "orange" && "bg-orange-50 text-orange-700",
              )}>
                {p.verdict}
              </div>
              {/* Sources — citations du bot */}
              {i < visibleCols && (
                <SourcesList sources={p.sources} />
              )}
              </div>
            </div>
            );
          })}
        </div>

        {visibleCols >= 3 && (
          <div className="bg-gray-50 px-4 py-2.5 border-t space-y-2 animate-in fade-in duration-500">
            {/* Mode de reflexion selector */}
            <ModeSelector activeMode={activeMode} onChangeMode={setActiveMode} />
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button onClick={onChallenge} className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-100 font-medium">
                <Swords className="h-3.5 w-3.5" /> Challenger
              </button>
              <button className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-green-100 font-medium">
                <GitBranch className="h-3.5 w-3.5" /> Nouvelle branche
              </button>
              <button className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-purple-100 font-medium">
                <MessageCircle className="h-3.5 w-3.5" /> Ajouter un Bot
              </button>
              <button className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-cyan-100 font-medium">
                <Search className="h-3.5 w-3.5" /> Deep Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeResultCard({ results, onSynthese, animate, challengeOptions, showOptions }: {
  results: typeof SIM.challengeResult;
  onSynthese: () => void;
  animate: boolean;
  challengeOptions?: typeof SIM.challengeOptions;
  showOptions?: boolean;
}) {
  const [visibleIdx, setVisibleIdx] = useState(animate ? -1 : results.length);

  useEffect(() => {
    if (!animate) return;
    const timers = results.map((_, i) =>
      setTimeout(() => setVisibleIdx(i), (i + 1) * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-red-50/50 to-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-red-50 px-4 py-2.5 flex items-center gap-2 border-b border-red-200">
          <Swords className="h-4 w-4 text-red-600" />
          <span className="text-sm font-bold text-red-800">Challenge — Reponses</span>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-auto font-medium">Round 2</span>
        </div>

        <div className="divide-y divide-red-100">
          {results.map((r, i) => {
            const botColor = BOT_COLORS[r.code];
            return (
            <div key={r.code} className={cn(
              "flex transition-all duration-500",
              i <= visibleIdx ? "opacity-100" : "opacity-0 h-0 p-0 overflow-hidden",
            )}>
              {/* Bande laterale couleur bot */}
              <div className={cn("w-1 shrink-0", botColor?.bg || "bg-gray-300")} />
              <div className="p-3 flex gap-3 flex-1">
              <BotAvatar code={r.code} size="md" />
              <div className="flex-1">
                <div className={cn("text-sm font-bold mb-1", botColor?.text || "text-gray-700")}>{r.name} <span className="text-xs font-normal text-gray-400">({botColor?.role})</span></div>
                {i <= visibleIdx ? (
                  <TypewriterText text={r.text} speed={10} className="text-sm text-gray-600 leading-relaxed" />
                ) : null}
                {i <= visibleIdx && r.sources && (
                  <SourcesList sources={r.sources} />
                )}
              </div>
              </div>
            </div>
            );
          })}
        </div>

        {visibleIdx >= results.length - 1 && (
          <div className="bg-red-50/50 px-4 py-2.5 border-t border-red-200 space-y-2.5">
            {showOptions && challengeOptions && (
              <InlineOptions
                options={challengeOptions}
                onSelect={() => onSynthese()}
                animate={true}
              />
            )}
            <div className="flex items-center gap-2">
              <button onClick={onSynthese} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-700 font-medium">
                <Zap className="h-3.5 w-3.5" /> Synthetiser tout
              </button>
              <button className="text-xs bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-50 font-medium">
                <RotateCcw className="h-3.5 w-3.5" /> Re-challenger
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SyntheseCard({ data, onDemontrer, animate }: {
  data: typeof SIM.synthese;
  onDemontrer: () => void;
  animate: boolean;
}) {
  const [visiblePoints, setVisiblePoints] = useState(animate ? 0 : data.points.length);

  useEffect(() => {
    if (!animate) return;
    const timers = data.points.map((_, i) =>
      setTimeout(() => setVisiblePoints(i + 1), (i + 1) * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-indigo-50 to-white border-2 border-indigo-200 rounded-xl overflow-hidden shadow-md">
        <div className="bg-indigo-100 px-4 py-3 flex items-center gap-2 border-b border-indigo-200">
          <Zap className="h-4 w-4 text-indigo-600" />
          <div>
            <div className="text-sm font-bold text-indigo-900">{data.titre}</div>
            <div className="text-xs text-indigo-600">Synthese consolidee — Phase E (Exposer)</div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Points cles</div>
          <ul className="space-y-1.5 mb-4">
            {data.points.map((p, i) => (
              <li key={i} className={cn(
                "flex items-start gap-2 text-sm text-gray-700 transition-all duration-300",
                i < visiblePoints ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
              )}>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
          {visiblePoints >= data.points.length && (
            <>
              <div className="text-xs font-semibold text-orange-600 uppercase mb-2">Risques identifies</div>
              <ul className="space-y-1.5 mb-4">
                {data.risques.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-700 animate-in fade-in duration-500">
                    <span className="text-orange-500 shrink-0">⚠️</span>
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        {visiblePoints >= data.points.length && (
          <div className="bg-indigo-50 px-4 py-2.5 border-t border-indigo-200 flex items-center gap-2">
            <button onClick={onDemontrer} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-700 font-medium">
              <BarChart3 className="h-3.5 w-3.5" /> Voir les projections
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DemonstrationCard({ data, onObtenir, animate }: {
  data: typeof SIM.demonstration;
  onObtenir: () => void;
  animate: boolean;
}) {
  const [visibleRows, setVisibleRows] = useState(animate ? 0 : data.projections.length);

  useEffect(() => {
    if (!animate) return;
    const timers = data.projections.map((_, i) =>
      setTimeout(() => setVisibleRows(i + 1), (i + 1) * 600)
    );
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-200 rounded-xl overflow-hidden shadow-md">
        <div className="bg-emerald-100 px-4 py-3 flex items-center gap-2 border-b border-emerald-200">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
          <div>
            <div className="text-sm font-bold text-emerald-900">Projections financieres</div>
            <div className="text-xs text-emerald-600">Phase D (Demontrer) — Donnees validees par le CFO</div>
          </div>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-500 font-semibold">Periode</th>
                <th className="text-center py-2 text-gray-500 font-semibold">Clients</th>
                <th className="text-center py-2 text-gray-500 font-semibold">MRR</th>
                <th className="text-left py-2 text-gray-500 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {data.projections.map((row, i) => (
                <tr key={i} className={cn(
                  "border-b border-gray-100 transition-all duration-500",
                  i < visibleRows ? "opacity-100" : "opacity-0",
                )}>
                  <td className="py-2 font-medium">{row.mois}</td>
                  <td className="py-2 text-center">{row.clients}</td>
                  <td className="py-2 text-center font-semibold text-emerald-700">{row.mrr}</td>
                  <td className="py-2 text-gray-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleRows >= data.projections.length && (
          <div className="bg-emerald-50 px-4 py-2.5 border-t border-emerald-200 flex items-center gap-2">
            <button onClick={onObtenir} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-emerald-700 font-medium shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Passer a l'action
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CristallisationCard({ actions, onCristalliser }: { actions: string[]; onCristalliser: (type: CristalType) => void }) {
  return (
    <div className="ml-11">
      <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-amber-100 px-4 py-3 flex items-center gap-2 border-b border-amber-300">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <div>
            <div className="text-sm font-bold text-amber-900">Cristallisation — Phase O (Obtenir)</div>
            <div className="text-xs text-amber-700">Que fait-on avec cette idee?</div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Actions proposees</div>
          <ul className="space-y-1.5 mb-5">
            {actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 animate-in fade-in duration-500" style={{ animationDelay: `${i * 200}ms` }}>
                <ArrowRight className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
          <div className="text-xs font-semibold text-gray-600 uppercase mb-3">Cristalliser dans...</div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onCristalliser("document")} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
              <FileText className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Cahier de Projet</span>
              <span className="text-xs text-gray-400 text-center">Document structure avec plan d'action</span>
            </button>
            <button onClick={() => onCristalliser("banque")} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group">
              <BookmarkPlus className="h-8 w-8 text-purple-500 group-hover:text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Banque d'idees</span>
              <span className="text-xs text-gray-400 text-center">Sauvegarder pour plus tard</span>
            </button>
            <button onClick={() => onCristalliser("idee")} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group">
              <Lightbulb className="h-8 w-8 text-green-500 group-hover:text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Idee primaire</span>
              <span className="text-xs text-gray-400 text-center">Garder en exploration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ThreadManagerBar — barre de threads actifs/parkes/completes */
function ThreadManagerBar({ threads }: {
  threads: { id: string; title: string; emoji: string; phase: CREDOPhase; status: "active" | "parked" | "completed"; contributions: number }[];
}) {
  return (
    <div className="ml-11">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FolderKanban className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-bold text-slate-700">Threads actifs</span>
        </div>
        <div className="flex gap-3">
          {threads.map(t => (
            <div key={t.id} className={cn(
              "flex-1 rounded-lg border-2 p-3 transition-all duration-500",
              t.status === "active" && "border-blue-400 bg-blue-50",
              t.status === "parked" && "border-amber-300 bg-amber-50",
              t.status === "completed" && "border-green-300 bg-green-50 opacity-80",
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{t.emoji}</span>
                <span className="text-sm font-semibold text-gray-800 truncate">{t.title}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {t.status === "active" && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Actif
                  </span>
                )}
                {t.status === "parked" && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    ⏸ Parke
                  </span>
                )}
                {t.status === "completed" && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Complete
                  </span>
                )}
                <span className="text-xs text-gray-400">Phase {t.phase === "done" ? "✓" : t.phase}</span>
                <span className="text-xs text-gray-400">{t.contributions} contrib.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** CrossLinkCard — CarlOS detecte un lien entre threads */
function CrossLinkCard({ message, onResume, animate }: {
  message: string;
  onResume: () => void;
  animate: boolean;
}) {
  return (
    <div className="ml-11">
      <div className="bg-gradient-to-r from-violet-50 to-blue-50 border-2 border-violet-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-violet-100 px-4 py-2.5 flex items-center gap-2 border-b border-violet-200">
          <Network className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-bold text-violet-800">Lien inter-threads detecte</span>
          <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
        </div>
        <div className="p-4">
          <div className="flex gap-3">
            <BotAvatar code="BCO" size="md" />
            <div className="flex-1">
              {animate ? (
                <TypewriterText text={message} speed={12} className="text-sm text-gray-700 leading-relaxed" />
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2 ml-11">
            <button onClick={onResume} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium shadow-sm">
              <RotateCcw className="h-3.5 w-3.5" /> Reprendre le thread Abonnement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CristalliseConfirmation({ type, titre }: { type: CristalType; titre: string }) {
  const config = {
    document: { icon: FileText, label: "Cahier de Projet", bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", iconColor: "text-blue-600" },
    banque: { icon: BookmarkPlus, label: "Banque d'idees", bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-800", iconColor: "text-purple-600" },
    idee: { icon: Lightbulb, label: "Idee primaire", bg: "bg-green-50", border: "border-green-300", text: "text-green-800", iconColor: "text-green-600" },
  };
  const c = config[type!];
  return (
    <div className="ml-11">
      <div className={cn("border-2 rounded-xl px-4 py-3 flex items-center gap-3", c.bg, c.border)}>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", c.bg)}>
          <c.icon className={cn("h-5 w-5", c.iconColor)} />
        </div>
        <div className="flex-1">
          <div className={cn("text-sm font-bold", c.text)}>Cristallise dans : {c.label}</div>
          <div className="text-xs text-gray-500 mt-0.5">"{titre}"</div>
        </div>
        <CheckCircle2 className="h-6 w-6 text-green-500" />
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

/**
 * Stages (V2 avec Thread Parking) :
 * 0    — Start button
 * 1    — User tension
 * 1.5  — CEO thinking animation
 * 2    — CEO response (typewriter)
 * 2.5  — User asks for multi-perspectives
 * 3    — Multi-consult animation
 * 3.5  — Multi-perspectives card (animated)
 * 4    — User challenge
 * 4.5  — Challenge thinking
 * 5    — Challenge results
 * --- THREAD PARKING (NEW) ---
 * 6    — User drift message (realizes archi issue)
 * 6.5  — CarlOS parking animation (thinking)
 * 7    — Thread manager + CarlOS parking confirmation
 * 7.5  — Side thread CTO thinking
 * 8    — CTO side thread response + cross-link
 * --- RESUME ---
 * 8.5  — Synthese thinking (resumed thread)
 * 9    — Synthese card
 * 10   — Demo card
 * 11   — Cristallisation
 * 12   — Done (2 threads resolus)
 */
export function BranchPatternsDemo({ onComplete }: { onComplete?: () => void } = {}) {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<CREDOPhase>("C");
  const [cristalType, setCristalType] = useState<CristalType>(null);
  const [ceoTextDone, setCeoTextDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 150);
  }, [stage]);

  const handleCristalliser = (type: CristalType) => {
    setCristalType(type);
    setPhase("done");
    setStage(12);
    onComplete?.();
  };

  const handleRestart = () => {
    setStage(0); setPhase("C"); setCristalType(null); setCeoTextDone(false);
  };

  // Thread states — computed from current stage
  const threads: { id: string; title: string; emoji: string; phase: CREDOPhase; status: "active" | "parked" | "completed"; contributions: number }[] =
    stage >= 7 ? [
      {
        id: "abonnement",
        title: "Abonnement Manufacturier",
        emoji: "💼",
        phase: stage < 8.5 ? "R" : phase,
        status: stage < 8.5 ? "parked" : "active",
        contributions: stage < 8.5 ? 5 : 8,
      },
      {
        id: "architecture",
        title: "Architecture Technique",
        emoji: "🏗️",
        phase: stage >= 8.5 ? "done" : "C",
        status: stage >= 8.5 ? "completed" : "active",
        contributions: stage >= 8 ? 2 : 0,
      },
    ] : [];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-800">Simulation CREDO — Developpement d'idee</div>
          <div className="text-xs text-muted-foreground">Avec Suspension Intelligente et Thread Parking</div>
        </div>
        <PhaseIndicator phase={phase} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">

          {/* ===== STAGE 0 — Start ===== */}
          {stage === 0 && (
            <div className="flex justify-center py-16">
              <button onClick={() => setStage(1)}
                className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-blue-700 transition-all hover:scale-105">
                <Send className="h-5 w-5" /> Lancer la simulation CREDO
              </button>
            </div>
          )}

          {/* ===== STAGE 1 — User tension ===== */}
          {stage >= 1 && (
            <div className="flex gap-3 justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                <p className="text-sm text-blue-900">{SIM.userTension}</p>
                <span className="text-[10px] text-blue-400 mt-1 block text-right">14:32</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(1.5)} className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1">
                <Bot className="h-3 w-3" /> CarlOS analyse...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={SIM.ceoThinking}
              botEmoji="👔" botName="CarlOS (CEO)" botCode="BCO"
              onComplete={() => setStage(2)}
            />
          )}

          {/* ===== STAGE 2 — CEO response with inline options ===== */}
          {stage >= 2 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Phase C</span>
                </div>
                {stage === 2 ? (
                  <TypewriterText text={SIM.ceoConnect} speed={12} className="text-sm text-gray-800" onComplete={() => setCeoTextDone(true)} />
                ) : (
                  <p className="text-sm text-gray-800">{SIM.ceoConnect}</p>
                )}
                <span className="text-[10px] text-gray-400 mt-1 block">14:32</span>
                {stage === 2 && ceoTextDone && (
                  <InlineOptions
                    options={SIM.ceoOptions}
                    onSelect={() => { setPhase("R"); setStage(2.5); }}
                    animate={true}
                  />
                )}
              </div>
            </div>
          )}

          {/* ===== STAGE 2.5 — User multi-perspectives ===== */}
          {stage >= 2.5 && (
            <div className="flex gap-3 justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                <p className="text-sm text-blue-900">C'est une intuition basee sur les renouvellements. 60% de nos clients reviennent. Donne-moi le point de vue du CFO, du CRO et du COO.</p>
                <span className="text-[10px] text-blue-400 mt-1 block text-right">14:33</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 2.5 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(3)} className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1">
                <Network className="h-3 w-3" /> Consulter les departements...
              </button>
            </div>
          )}

          {/* ===== STAGE 3 — Multi-consult animation ===== */}
          {stage === 3 && (
            <MultiConsultAnimation
              bots={SIM.consultBots}
              onComplete={() => setStage(3.5)}
            />
          )}

          {/* ===== STAGE 3.5 — Multi-perspectives card ===== */}
          {stage >= 3.5 && (
            <MultiPerspectivesCard
              perspectives={SIM.perspectives}
              onChallenge={() => { if (stage === 3.5) setStage(4); }}
              animate={stage === 3.5}
            />
          )}
          {stage === 3.5 && (
            <div className="flex justify-center">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Cliquez "Challenger" sur la carte
              </span>
            </div>
          )}

          {/* ===== STAGE 4 — User challenge ===== */}
          {stage >= 4 && (
            <div className="flex gap-3 justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                <p className="text-sm text-blue-900">{SIM.challengeQuestion}</p>
                <span className="text-[10px] text-blue-400 mt-1 block text-right">14:35</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 4 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(4.5)} className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1">
                <Swords className="h-3 w-3" /> Analyser le challenge...
              </button>
            </div>
          )}

          {/* ===== STAGE 4.5 — Challenge thinking ===== */}
          {stage === 4.5 && (
            <ThinkingAnimation
              steps={SIM.challengeThinking}
              botEmoji="👔" botName="CarlOS (CEO)" botCode="BCO"
              onComplete={() => setStage(5)}
            />
          )}

          {/* ===== STAGE 5 — Challenge results with inline options ===== */}
          {stage >= 5 && (
            <ChallengeResultCard
              results={SIM.challengeResult}
              onSynthese={() => { if (stage === 5) setStage(6); }}
              animate={stage === 5}
              challengeOptions={SIM.challengeOptions}
              showOptions={stage === 5}
            />
          )}

          {/* ================================================ */}
          {/* ===== THREAD PARKING — Suspension Intelligente === */}
          {/* ================================================ */}

          {/* ===== STAGE 6 — User drift message ===== */}
          {stage >= 6 && (
            <div className="flex gap-3 justify-end">
              <div className="bg-amber-50 border border-amber-200 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                <p className="text-sm text-amber-900">{SIM.driftMessage}</p>
                <span className="text-[10px] text-amber-400 mt-1 block text-right">14:37</span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 6 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(6.5)} className="text-xs bg-amber-200 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-300 flex items-center gap-1.5">
                <Scan className="h-3.5 w-3.5" /> CarlOS detecte le changement de contexte...
              </button>
            </div>
          )}

          {/* ===== STAGE 6.5 — Parking thinking animation ===== */}
          {stage === 6.5 && (
            <ThinkingAnimation
              steps={SIM.parkingSteps}
              botEmoji="👔" botName="CarlOS (CEO)" botCode="BCO"
              onComplete={() => setStage(7)}
            />
          )}

          {/* ===== STAGE 7+ — Thread Manager Bar ===== */}
          {stage >= 7 && stage < 12 && (
            <ThreadManagerBar threads={threads} />
          )}

          {/* ===== STAGE 7 — CarlOS parking confirmation ===== */}
          {stage >= 7 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border-l-blue-500 border-2 border-amber-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[75%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-semibold", BOT_COLORS.BCO.text)}>CarlOS (CEO)</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">⏸ Suspension Intelligente</span>
                </div>
                {stage === 7 ? (
                  <TypewriterText text={SIM.parkingMessage} speed={12} className="text-sm text-gray-800" />
                ) : (
                  <p className="text-sm text-gray-800">{SIM.parkingMessage}</p>
                )}
                <span className="text-[10px] text-gray-400 mt-1 block">14:37</span>
              </div>
            </div>
          )}
          {stage === 7 && (
            <div className="flex justify-center">
              <button onClick={() => setStage(7.5)} className="text-xs bg-cyan-200 text-cyan-700 px-4 py-2 rounded-full hover:bg-cyan-300 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> Le CTO analyse l'architecture...
              </button>
            </div>
          )}

          {/* ===== STAGE 7.5 — Side thread CTO thinking ===== */}
          {stage === 7.5 && (
            <ThinkingAnimation
              steps={SIM.sideThreadThinking}
              botEmoji="💻" botName="CTO — Thread Architecture" botCode="BCT"
              onComplete={() => setStage(8)}
            />
          )}

          {/* ===== STAGE 8 — CTO side thread response ===== */}
          {stage >= 8 && (
            <div className="ml-11">
              <div className="bg-gradient-to-b from-violet-50 to-white border-2 border-violet-200 rounded-xl overflow-hidden shadow-sm">
                <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b border-violet-200", BOT_COLORS.BCT.bgLight)}>
                  <BotAvatar code="BCT" size="sm" />
                  <span className={cn("text-sm font-bold", BOT_COLORS.BCT.text)}>CTO — Thread Architecture Technique</span>
                  <span className="text-xs bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full ml-auto font-medium">Thread lateral</span>
                </div>
                <div className="p-4">
                  {stage === 8 ? (
                    <TypewriterText text={SIM.sideThreadCTO} speed={10} className="text-sm text-gray-700 leading-relaxed" />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{SIM.sideThreadCTO}</p>
                  )}
                  <SourcesList sources={SIM.sideThreadSources} />
                </div>
              </div>
            </div>
          )}

          {/* ===== STAGE 8 — Cross-link detection ===== */}
          {stage >= 8 && (
            <CrossLinkCard
              message={SIM.crossLinkMessage}
              onResume={() => { if (stage === 8) { setPhase("E"); setStage(8.5); } }}
              animate={stage === 8}
            />
          )}

          {/* ================================================ */}
          {/* ===== RESUME — Thread Abonnement reprend ======== */}
          {/* ================================================ */}

          {/* ===== STAGE 8.5 — Synthese thinking ===== */}
          {stage === 8.5 && (
            <ThinkingAnimation
              steps={SIM.syntheseThinking}
              botEmoji="👔" botName="CarlOS (CEO) — Thread repris" botCode="BCO"
              onComplete={() => setStage(9)}
            />
          )}

          {/* ===== STAGE 9 — Synthese card ===== */}
          {stage >= 9 && (
            <SyntheseCard
              data={SIM.synthese}
              onDemontrer={() => { if (stage === 9) { setPhase("D"); setStage(10); } }}
              animate={stage === 9}
            />
          )}

          {/* ===== STAGE 10 — Demo card ===== */}
          {stage >= 10 && stage < 12 && (
            <DemonstrationCard
              data={SIM.demonstration}
              onObtenir={() => { if (stage === 10) { setPhase("O"); setStage(11); } }}
              animate={stage === 10}
            />
          )}

          {/* ===== STAGE 11 — Cristallisation ===== */}
          {stage === 11 && (
            <CristallisationCard actions={SIM.actionsPossibles} onCristalliser={handleCristalliser} />
          )}

          {/* ===== STAGE 12 — Done (2 threads resolus) ===== */}
          {stage >= 12 && cristalType && (
            <>
              <CristalliseConfirmation type={cristalType} titre={SIM.synthese.titre} />

              {/* Final thread manager — tout resolu */}
              <ThreadManagerBar threads={[
                { id: "abonnement", title: "Abonnement Manufacturier", emoji: "💼", phase: "done", status: "completed", contributions: 8 },
                { id: "architecture", title: "Architecture Technique", emoji: "🏗️", phase: "done", status: "completed", contributions: 2 },
              ]} />

              <div className="flex justify-center py-3">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Archive className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">
                    2 threads resolus — Toutes les idees sont sauvegardees dans Ma Productivite
                  </span>
                </div>
              </div>

              <div className="flex justify-center py-4">
                <button onClick={handleRestart}
                  className="flex items-center gap-2 bg-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-300 transition-all">
                  <RotateCcw className="h-4 w-4" /> Relancer la simulation
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
