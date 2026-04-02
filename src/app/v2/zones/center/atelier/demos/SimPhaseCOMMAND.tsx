"use client";

/**
 * SimPhaseCOMMAND.tsx — Phase Execution (vert pastel) — SIMULATION COMPLETE
 * Meme cadre que SimPhaseReflexion & SimPhaseAtelier: TopBar 6 sections, sub-tabs, breadcrumb, phase indicator
 * Flow: Document valide → missions auto-generees → lancement → tracking live → rapport → delegation →
 * automatisation → blocage → escalade → livraison → rapport final → etape suivante → ceremonie
 * 18 stages, continuite Marketing Q2, LiveTerminal pour bots en execution
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
  CheckCircle2,
  FileText,
  Target,
  Lock,
  Mic,
  Send,
  ArrowRight,
  Zap,
  Play,
  DollarSign,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Terminal,
  Bot,
  RefreshCw,
  Rocket,
  Award,
  Settings,
  XCircle,
  SkipForward,
  Activity,
  Package,
  Repeat,
  Sparkles,
  Download,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "entree"
  | "accueil"
  | "dashboard"
  | "lancement"
  | "tracking-1"
  | "tracking-2"
  | "rapport-inter"
  | "delegation"
  | "automatisation"
  | "blocage"
  | "escalade"
  | "livraison-1"
  | "livraison-2"
  | "rapport-final"
  | "next-missions"
  | "bilan-kpi"
  | "etape-suivante"
  | "ceremonie";

const STAGE_ORDER: Stage[] = [
  "entree", "accueil", "dashboard", "lancement",
  "tracking-1", "tracking-2", "rapport-inter",
  "delegation", "automatisation", "blocage", "escalade",
  "livraison-1", "livraison-2", "rapport-final",
  "next-missions", "bilan-kpi", "etape-suivante", "ceremonie",
];

const STAGE_LABELS: Record<Stage, string> = {
  entree: "Transition Creation → Execution",
  accueil: "Accueil COMMAND",
  dashboard: "Dashboard missions",
  lancement: "Lancement des bots",
  "tracking-1": "Tracking live — lot 1",
  "tracking-2": "Tracking live — lot 2",
  "rapport-inter": "Rapport intermediaire",
  delegation: "Delegation",
  automatisation: "Automatisation",
  blocage: "Blocage detecte",
  escalade: "Escalade — Decision",
  "livraison-1": "Livraison mission 1",
  "livraison-2": "Livraison mission 2",
  "rapport-final": "Rapport final",
  "next-missions": "Missions suivantes",
  "bilan-kpi": "Bilan KPI",
  "etape-suivante": "Prochaine etape",
  ceremonie: "Ceremonie",
};

type Phase = "reflexion" | "atelier" | "command";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

interface Mission {
  id: number;
  title: string;
  bot: string;
  status: "pending" | "active" | "done" | "blocked";
  progress: number;
  eta: string;
  desc: string;
}

const INITIAL_MISSIONS: Mission[] = [
  { id: 1, title: "Programme referral — setup", bot: "CMOB", status: "pending", progress: 0, eta: "2h", desc: "Configurer le programme, identifier 12 contacts, envoyer les invitations" },
  { id: 2, title: "Chatbot AI — deploiement", bot: "CTOB", status: "pending", progress: 0, eta: "3h", desc: "Deployer ChatWidget.tsx, integrer CRM, tests end-to-end" },
  { id: 3, title: "Content LinkedIn — calendrier", bot: "CMOB", status: "pending", progress: 0, eta: "1h30", desc: "Creer le calendrier editorial S1-S10, 3 posts/semaine" },
  { id: 4, title: "Budget tracking — dashboard", bot: "CFOB", status: "pending", progress: 0, eta: "45min", desc: "Configurer le suivi 3,800$/mois, alertes de depassement" },
];

const TRACKING_EVENTS_1 = [
  { time: "09:45", bot: "CTOB", text: "Analyse de l'API site web terminee (14min)", type: "done" as const },
  { time: "09:52", bot: "CFOB", text: "Dashboard budget cree — 4 postes configures", type: "done" as const },
  { time: "09:58", bot: "CTOB", text: "ChatWidget.tsx deploye en staging", type: "progress" as const },
  { time: "10:03", bot: "CMOB", text: "12 contacts referral identifies — invitations pretes", type: "done" as const },
];

const TRACKING_EVENTS_2 = [
  { time: "10:15", bot: "CTOB", text: "Tests unitaires: 12/12 passes", type: "done" as const },
  { time: "10:22", bot: "CMOB", text: "Calendrier LinkedIn S1-S4 complete — 12 posts planifies", type: "progress" as const },
  { time: "10:30", bot: "CTOB", text: "Integration CRM en cours — endpoint /contacts...", type: "progress" as const },
  { time: "10:35", bot: "CFOB", text: "Alerte: poste 'Content LinkedIn' a 92% du budget mensuel", type: "alert" as const },
];

const BOT_EXECUTION_LOG = `$ command deploy Mission-2 --bot=Tim
[COMMAND] Initialisation deploiement chatbot AI...
[COMMAND] Chargement du code source ChatWidget.tsx...
[Tim] Verification pre-deploiement:
  ✓ DOMPurify sanitizer actif
  ✓ Rate limiter configure (5 req/min)
  ✓ AbortController cleanup present

[Tim] Deploiement en staging...
  → Upload bundle: 42.3 KB (gzipped)
  → Configuration nginx: proxy_pass /chat-widget
  → SSL: certificat valide (expires 2026-06-02)

[Tim] Tests end-to-end:
  ✓ test_widget_load          (12ms)
  ✓ test_session_init         (8ms)
  ✓ test_message_send         (15ms)
  ✓ test_stream_response      (22ms)
  ✓ test_timeout_fallback     (6ms)
  ✓ test_mobile_responsive    (18ms)
  ✓ test_sanitize_xss         (4ms)

[Tim] Integration CRM:
  → Connexion a /api/contacts... OK
  → Sync bidirectionnel... OK
  → Webhook on_new_lead... CONFIGURE

[COMMAND] ✓ Mission 2 completee — chatbot AI live
[COMMAND] Quality score: 97/100
[COMMAND] Temps: 2h47min (ETA etait 3h)`;

const DELEGATION_LOG = `$ command delegate Mission-1,3 --to=Mathilde
[COMMAND] Delegation en cours...
[CarlOS] Brief pour Mathilde:
  Mission 1: Programme referral — 12 contacts identifies
  Mission 3: Content LinkedIn — calendrier S1-S10

[CarlOS] Contexte transfere:
  → Insights Analyse (3 constats)
  → Budget alloue (2,600$/mois)
  → Timeline (S1-S14, checkpoint S7)

[Mathilde] Recu! Je coordonne les 2 missions.
  → Referral: invitations envoyees dans 30min
  → LinkedIn: je priorise les posts referral-first
  → Synergie: chaque post LinkedIn = call-to-action referral

[COMMAND] ✓ Delegation confirmee
[COMMAND] Mathilde est lead sur Mission 1 + Mission 3`;

const AUTOMATION_CONFIG = `$ command automate referral-tracking
[COMMAND] Configuration automatisation...

Trigger: Nouveau referral detecte
  → Source: formulaire site web + email inbox
  → Filtre: domaine @entreprise (pas @gmail)

Actions:
  1. Notifier Mathilde (Slack + email)
  2. Ajouter au CRM (statut: nouveau)
  3. Mettre a jour dashboard budget
  4. Si referral qualifie → creer mission "Qualifier {nom}"
  5. Rapport hebdo automatique (lundi 8h)

[COMMAND] ✓ Automatisation active
[COMMAND] Prochain scan: dans 15 minutes`;

const NEXT_SPRINT_MISSIONS = [
  { title: "Optimiser chatbot avec donnees reelles", bot: "CTOB", priority: "haute", eta: "2j" },
  { title: "Lancer campagne LinkedIn S5-S10", bot: "CMOB", priority: "haute", eta: "3j" },
  { title: "Analyser premiers resultats referral", bot: "CFOB", priority: "moyenne", eta: "1j" },
];

const FINAL_KPIS = [
  { label: "Missions livrees", value: "4/4", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  { label: "Temps total", value: "3h15", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Clock },
  { label: "Budget utilise", value: "84%", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: DollarSign },
  { label: "Automations", value: "1", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", icon: Repeat },
  { label: "Blocages resolus", value: "1", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  { label: "Quality score", value: "97/100", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: Award },
];

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimPhaseCOMMAND({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("entree");
  const [typed, setTyped] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [showConfetti, setShowConfetti] = useState(false);
  const [terminalContent, setTerminalContent] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => {
    setStage("entree");
    setTyped(false);
    setMissions(INITIAL_MISSIONS);
    setShowConfetti(false);
    setTerminalContent("");
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const updateMission = (id: number, updates: Partial<Mission>) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const currentPhase: Phase = "command";

  const discussionContext =
    si <= 0 ? "Transition Creation → Execution" :
    si <= 2 ? "COMMAND — Chantier Marketing Q2" :
    stage === "delegation" ? "Delegation — Mathilde prend le lead" :
    stage === "automatisation" ? "Automatisation — Referral tracking" :
    stage === "blocage" || stage === "escalade" ? "Blocage — Tim demande une decision" :
    si >= STAGE_ORDER.indexOf("livraison-1") && si <= STAGE_ORDER.indexOf("livraison-2") ? "Livraison — Quality check" :
    si >= STAGE_ORDER.indexOf("rapport-final") ? "Rapport final — Bilan COMMAND" :
    "Execution — Marketing Q2";

  const breadcrumb = ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end"];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* Stage: entree — transition from Creation */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text="Creation terminee — 6 livrables valides, scan VITAA 4/5, budget justifie. Je genere les missions d'execution automatiquement a partir du plan d'action."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-3 space-y-1.5">
                  {INITIAL_MISSIONS.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 300}ms`, animationFillMode: "both", animationDuration: "500ms" }}>
                      <BotAvatar code={m.bot} size="sm" />
                      <div className="flex-1">
                        <span className="text-[9px] font-bold text-gray-700">{m.title}</span>
                        <span className="text-[8px] text-gray-500 ml-1.5">ETA: {m.eta}</span>
                      </div>
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("accueil")} icon={Zap} label="Activer le mode Execution" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Transition Creation → Execution — 4 missions generees</p>}
        </SBubble>
      )}

      {/* Stage: accueil */}
      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          {si === 1 ? (
            <>
              <TypewriterText
                text="Mode Execution active. Les bots vont executer les missions en autonomie. Je supervise et je t'alerte uniquement si une decision est requise. Tu peux suivre l'avancement en temps reel dans le panneau de droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Tracker", "Deleguer", "Automatiser", "Rapport", "Exporter", "Arreter"].map(b => (
                    <span key={b} className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{b}</span>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("dashboard")} icon={BarChart3} label="Voir le dashboard" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mode Execution active — bots en autonomie</p>}
        </SBubble>
      )}

      {/* Stage: dashboard */}
      {si >= 2 && (
        <SBubble code="CEOB" collapsed={si > 2}>
          {si === 2 ? (
            <>
              <TypewriterText
                text="4 missions pretes. Strategie: Tim commence par le chatbot AI (mission critique, 3h). Frank demarre le budget tracking en parallele (45min). Mathilde attend que Tim libere le site pour lancer le referral."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => { updateMission(2, { status: "active", progress: 10 }); updateMission(4, { status: "active", progress: 20 }); setTerminalContent(BOT_EXECUTION_LOG); goNext("lancement"); }} icon={Rocket} label="Lancer les missions!" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Dashboard — 4 missions, strategie definie</p>}
        </SBubble>
      )}

      {/* Stage: lancement */}
      {si >= 3 && (
        <SBubble code="CEOB" collapsed={si > 3}>
          {si === 3 ? (
            <>
              <TypewriterText
                text="C'est parti! Tim demarre le chatbot AI — ETA 3h. Frank lance le budget tracking en parallele — ETA 45min. Regarde le terminal a droite, tu vas voir les bots travailler en temps reel."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1">
                  {[
                    { code: "CTOB", name: "Tim", mission: "Chatbot AI", status: "En route..." },
                    { code: "CFOB", name: "Frank", mission: "Budget tracking", status: "En route..." },
                  ].map(b => (
                    <div key={b.code} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                      <BotAvatar code={b.code} size="sm" />
                      <span className="text-[9px] font-bold text-gray-700">{b.name}</span>
                      <span className="text-[8px] text-gray-500">{b.mission}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] text-emerald-600">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => { updateMission(4, { status: "done", progress: 100 }); updateMission(2, { progress: 45 }); goNext("tracking-1"); }} icon={Activity} label="Suivre en direct" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tim + Frank lances — terminal live</p>}
        </SBubble>
      )}

      {/* Stage: tracking-1 — Premier lot d'events */}
      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          {si === 4 ? (
            <>
              <TypewriterText
                text="Premier lot de resultats — Frank a termine le budget tracking en 38min (record!). Tim avance bien sur le chatbot. Mathilde a identifie les 12 contacts referral."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1">
                  {TRACKING_EVENTS_1.map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 text-[9px] bg-gray-50 rounded px-2.5 py-1 animate-in fade-in" style={{ animationDelay: `${i * 300}ms`, animationFillMode: "both" }}>
                      <span className="text-gray-400 shrink-0 w-8">{ev.time}</span>
                      <BotAvatar code={ev.bot} size="sm" />
                      <span className="text-gray-700 flex-1">{ev.text}</span>
                      {ev.type === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0 animate-pulse" />}
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => { updateMission(1, { status: "active", progress: 30 }); updateMission(2, { progress: 65 }); updateMission(3, { status: "active", progress: 40 }); goNext("tracking-2"); }} icon={SkipForward} label="Voir la suite" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tracking lot 1 — Frank termine, Tim avance</p>}
        </SBubble>
      )}

      {/* Stage: tracking-2 — Deuxieme lot + alerte */}
      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          {si === 5 ? (
            <>
              <TypewriterText
                text="Deuxieme lot — attention: Frank detecte un risque budget sur le poste LinkedIn (92% du budget mensuel). Tim est en train d'integrer le CRM. Mathilde a planifie 12 posts."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1">
                  {TRACKING_EVENTS_2.map((ev, i) => (
                    <div key={i} className={cn("flex items-center gap-2 text-[9px] rounded px-2.5 py-1 animate-in fade-in",
                      ev.type === "alert" ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
                    )} style={{ animationDelay: `${i * 300}ms`, animationFillMode: "both" }}>
                      <span className="text-gray-400 shrink-0 w-8">{ev.time}</span>
                      <BotAvatar code={ev.bot} size="sm" />
                      <span className={cn("flex-1", ev.type === "alert" ? "text-amber-700 font-medium" : "text-gray-700")}>{ev.text}</span>
                      {ev.type === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> :
                       ev.type === "alert" ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /> :
                       <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0 animate-pulse" />}
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => { updateMission(2, { progress: 75 }); goNext("rapport-inter"); }} icon={FileText} label="Rapport intermediaire" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tracking lot 2 — alerte budget LinkedIn</p>}
        </SBubble>
      )}

      {/* Stage: rapport-inter — Tim fait son rapport */}
      {si >= 6 && (
        <SBubble code="CTOB" collapsed={si > 6}>
          {si === 6 ? (
            <>
              <TypewriterText
                text="Rapport intermediaire chatbot AI: widgets deployes, tests unitaires ok (12/12), integration CRM a 75%. Bloqueur potentiel: la page pricing n'a pas de hook pour le widget — je propose un widget flottant a la place. ETA finale: encore 1h15."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 bg-violet-50 border border-violet-200 rounded-lg p-2">
                  <div className="flex items-center gap-2 text-[9px]">
                    <span className="text-violet-700 font-bold">Progression:</span>
                    <div className="flex-1 h-1.5 bg-violet-200 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: "75%" }} />
                    </div>
                    <span className="text-violet-700 font-bold">75%</span>
                  </div>
                </div>
              )}
              {typed && <SBtn onClick={() => { setTerminalContent(DELEGATION_LOG); goNext("delegation"); }} icon={Users} label="Deleguer a Mathilde" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tim: chatbot 75%, widget flottant propose</p>}
        </SBubble>
      )}

      {/* Stage: delegation — User delegue */}
      {si >= 7 && (
        <>
          {si === 7 && (
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                <p className="text-sm text-blue-900">Delegue le volet comm a Mathilde — elle doit coordonner le referral avec le content LinkedIn.</p>
              </div>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 7}>
            {si === 7 ? (
              <>
                <TypewriterText
                  text="Recu. Je brief Mathilde: coordonner le programme referral (mission 1) avec le calendrier content LinkedIn (mission 3). Synergie: chaque post LinkedIn = call-to-action referral. Regarde le terminal — le brief se transmet."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => { updateMission(1, { progress: 60 }); updateMission(3, { progress: 70 }); setTerminalContent(AUTOMATION_CONFIG); goNext("automatisation"); }} icon={Repeat} label="Automatiser le suivi?" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Mathilde lead sur missions 1 + 3</p>}
          </SBubble>
        </>
      )}

      {/* Stage: automatisation */}
      {si >= 8 && (
        <SBubble code="CEOB" collapsed={si > 8}>
          {si === 8 ? (
            <>
              <TypewriterText
                text="Je detecte que le tracking des referrals est une tache recurrente. Je peux automatiser: notification a Mathilde a chaque nouveau referral, mise a jour CRM automatique, et rapport hebdo le lundi. Regarde la config a droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1.5">
                  <button onClick={() => { updateMission(2, { status: "blocked", progress: 80 }); goNext("blocage"); }} className="w-full text-left text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors">
                    <span className="font-bold">Option 1:</span> Automatiser — workflow actif, notifications en temps reel
                  </button>
                  <button className="w-full text-left text-[9px] bg-gray-50 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <span className="font-bold">Option 2:</span> Manuel — Mathilde gere manuellement pour le moment
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Automatisation referral configuree</p>}
        </SBubble>
      )}

      {/* Stage: blocage */}
      {si >= 9 && (
        <SBubble code="CTOB" collapsed={si > 9}>
          {si === 9 ? (
            <>
              <TypewriterText
                text="Blocage detecte sur le chatbot AI: l'API du CRM renvoie un timeout sur les requetes batch. Le deploiement est a 80% mais je ne peux pas continuer sans resoudre ca. 3 solutions:"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1.5">
                  {[
                    { num: 1, text: "Retry avec pagination", detail: "Solution technique, +30min de dev, propre" },
                    { num: 2, text: "Cache local temporaire", detail: "Workaround rapide 10min, dette technique" },
                    { num: 3, text: "Escalader au support CRM", detail: "Attendre 24-48h pour fix cote vendor" },
                  ].map(opt => (
                    <button key={opt.num} onClick={() => goNext("escalade")} className="w-full text-left text-[9px] bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 cursor-pointer transition-colors">
                      <span className="font-bold">Option {opt.num}:</span> {opt.text}
                      <span className="block text-[8px] text-red-500 mt-0.5">{opt.detail}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Blocage: timeout CRM — 3 solutions proposees</p>}
        </SBubble>
      )}

      {/* Stage: escalade — Decision */}
      {si >= 10 && (
        <>
          {si === 10 && (
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                <p className="text-sm text-blue-900">Option 1 — pagination. Pas de dette technique, on fait les choses proprement.</p>
              </div>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 10}>
            {si === 10 ? (
              <>
                <TypewriterText
                  text="Decision: pagination choisie. Tim corrige en 30min. Pendant ce temps, les autres missions avancent normalement. Mathilde: 4 reponses positives sur les 12 contacts referral. Frank: budget tracking a jour."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => { updateMission(2, { status: "active", progress: 92 }); updateMission(1, { progress: 80 }); goNext("livraison-1"); }} icon={Package} label="Voir la livraison" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Pagination choisie — Tim corrige en 30min</p>}
          </SBubble>
        </>
      )}

      {/* Stage: livraison-1 — Mission 4 (budget) livree */}
      {si >= 11 && (
        <SBubble code="CFOB" collapsed={si > 11}>
          {si === 11 ? (
            <>
              <TypewriterText
                text="Mission 4 completee! Dashboard budget deploye. 4 postes configures, alertes de depassement actives, ROI projete mis a jour en temps reel. Temps: 38min (ETA etait 45min)."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex items-center gap-2 text-[9px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-700 font-medium">Quality check: PASSE</span>
                  <span className="text-gray-400 ml-auto">38min / 45min prevu</span>
                </div>
              )}
              {typed && <SBtn onClick={() => { updateMission(2, { status: "done", progress: 100 }); updateMission(1, { status: "done", progress: 100 }); goNext("livraison-2"); }} icon={Package} label="Livraison mission 2" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Frank: budget dashboard livre en 38min</p>}
        </SBubble>
      )}

      {/* Stage: livraison-2 — Mission 2 (chatbot) livree */}
      {si >= 12 && (
        <SBubble code="CTOB" collapsed={si > 12}>
          {si === 12 ? (
            <>
              <TypewriterText
                text="Mission 2 completee! Chatbot AI deploye et live. Tests passes (15/15), integration CRM avec pagination ok, widget flottant actif sur 4 pages. Conversion estimee: 2.8% (objectif 3%). Quality score: 97/100."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1">
                  {[
                    { label: "Tests", value: "15/15", color: "text-emerald-700 bg-emerald-50" },
                    { label: "Pages couvertes", value: "4/4", color: "text-blue-700 bg-blue-50" },
                    { label: "Conversion estimee", value: "2.8%", color: "text-amber-700 bg-amber-50" },
                    { label: "Quality score", value: "97/100", color: "text-emerald-700 bg-emerald-50" },
                  ].map(kpi => (
                    <div key={kpi.label} className={cn("flex items-center justify-between text-[9px] px-2.5 py-1 rounded", kpi.color)}>
                      <span>{kpi.label}</span>
                      <span className="font-bold">{kpi.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => { updateMission(3, { status: "done", progress: 100 }); goNext("rapport-final"); }} icon={BarChart3} label="Rapport final" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tim: chatbot AI live, quality 97/100</p>}
        </SBubble>
      )}

      {/* Stage: rapport-final */}
      {si >= 13 && (
        <SBubble code="CEOB" collapsed={si > 13}>
          {si === 13 ? (
            <>
              <TypewriterText
                text="Toutes les missions completees! 4/4 livrees, 1 blocage resolu, 1 automatisation deployee. Budget utilise: 3,200$ sur 3,800$ (84%). Le dashboard recapitulatif complet est a droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("next-missions")} icon={SkipForward} label="Prochaines missions" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">4/4 missions completees, budget 84%</p>}
        </SBubble>
      )}

      {/* Stage: next-missions — CarlOS propose la suite */}
      {si >= 14 && (
        <SBubble code="CEOB" collapsed={si > 14}>
          {si === 14 ? (
            <>
              <TypewriterText
                text="3 nouvelles missions identifiees pour le prochain sprint: optimiser le chatbot avec les donnees reelles, lancer la campagne LinkedIn S5-S10, et analyser les premiers resultats referral. Checkpoint prevu S7."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1">
                  {NEXT_SPRINT_MISSIONS.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-[9px] bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                      <BotAvatar code={m.bot} size="sm" />
                      <span className="flex-1 text-gray-700">{m.title}</span>
                      <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium",
                        m.priority === "haute" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>{m.priority}</span>
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("bilan-kpi")} icon={BarChart3} label="Bilan KPI" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">3 nouvelles missions pour le sprint suivant</p>}
        </SBubble>
      )}

      {/* Stage: bilan-kpi */}
      {si >= 15 && (
        <SBubble code="CFOB" collapsed={si > 15}>
          {si === 15 ? (
            <>
              <TypewriterText
                text="Bilan financier de la phase Execution. Budget utilise: 3,200$/3,800$ — 84%. Marge de manoeuvre: 600$ report au mois prochain. ROI projete du referral seul: 4.2x confirme. CAC en baisse: 650$ vs 780$ le mois dernier."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("etape-suivante")} icon={ArrowRight} label="Voir l'etape suivante" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Frank: budget 84%, ROI 4.2x, CAC en baisse</p>}
        </SBubble>
      )}

      {/* Stage: etape-suivante */}
      {si >= 16 && (
        <SBubble code="CEOB" collapsed={si > 16}>
          {si === 16 ? (
            <>
              <TypewriterText
                text="Phase Execution du chantier Marketing Q2 terminee avec succes. Les missions du prochain sprint sont pretes. On peut soit relancer un nouveau cycle Analyser → Creer → Executer, soit passer au chantier suivant. Qu'est-ce qu'on fait?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => { setShowConfetti(true); goNext("ceremonie"); }} icon={Award} label="Ceremonie de cloture!" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Phase terminee — prochain cycle ou chantier</p>}
        </SBubble>
      )}

      {/* Stage: ceremonie */}
      {stage === "ceremonie" && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl px-4 py-3">
          <TypewriterText
            text="Chantier Marketing Q2 — Phase Execution terminee! 4 missions livrees, 1 blocage resolu, 1 automatisation active. L'equipe a ete performante — bravo a Tim, Frank et Mathilde!"
            speed={8} className="text-sm text-emerald-800 font-medium"
            onComplete={() => setTyped(true)}
          />
          {typed && (
            <div className="mt-3 flex items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center opacity-50">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center opacity-50">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-emerald-200">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          )}
        </div>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT (same frame as SimPhaseReflexion & SimPhaseAtelier)
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Zap className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-bold text-gray-800">Phase Execution</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-emerald-500" : i < si ? "w-2 bg-emerald-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className="h-1 shrink-0 bg-emerald-500" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar — bots LEFT, badges RIGHT */}
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2", PHASE_COLORS.command.bg, PHASE_COLORS.command.border)}>
            <div className="flex items-center gap-1.5">
              {[
                { code: "CTOB" },
                { code: "CFOB" },
                { code: "CMOB" },
              ].map(b => (
                <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                  <BotAvatar code={b.code} size="sm" />
                  <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b.code]?.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {(["reflexion", "atelier", "command"] as Phase[]).map(p => (
                <span key={p} className={cn(
                  "px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-1 transition-all",
                  currentPhase === p ? PHASE_COLORS[p].badge : "bg-gray-100 text-gray-400"
                )}>
                  <span className={cn("w-2 h-2 rounded-full transition-all", currentPhase === p ? PHASE_COLORS[p].dot : "bg-gray-300")} />
                  {PHASE_COLORS[p].label}
                  {p === "reflexion" && <CheckCircle2 className="h-2.5 w-2.5 ml-0.5 text-emerald-500" />}
                  {p === "atelier" && <CheckCircle2 className="h-2.5 w-2.5 ml-0.5 text-emerald-500" />}
                </span>
              ))}
            </div>
          </div>

          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>

          {/* Message input */}
          <div className="shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-400">Ecrivez un message...</div>
            <button className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"><Mic className="h-4 w-4" /></button>
            <button className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"><Send className="h-4 w-4" /></button>
          </div>
        </div>

        {/* RIGHT — Content (60%) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar — 6 sections */}
          <div className="h-12 px-2 shrink-0 flex items-center" style={{ backgroundColor: UB_BLUE }}>
            <div className="flex-1 flex items-center gap-0.5">
              {[
                { id: "home", icon: Home, label: "Accueil" },
                { id: "dept", icon: Building2, label: "Mon Departement" },
                { id: "salles", icon: Users, label: "Mes Salles" },
                { id: "equipe", icon: Brain, label: "Mon Equipe" },
                { id: "reseau", icon: Globe, label: "Mon Reseau" },
                { id: "admin", icon: Shield, label: "Admin" },
              ].map(nav => (
                <button key={nav.id} className={cn(
                  "h-8 gap-1 px-2 text-[11px] rounded-md flex items-center transition-all",
                  nav.id === "dept" ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs (hidden when in deep command stages) */}
          {si <= 1 && (
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
              {DEPT_SUBTABS.map((tab, i) => (
                <button key={tab} className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                  i === 5 ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Breadcrumb */}
          <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 flex items-center gap-1.5">
            {breadcrumb.map((c, i, arr) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                <span className={cn("text-[11px]", i === arr.length - 1 ? "text-gray-800 font-medium" : "text-gray-400 hover:text-gray-600 cursor-pointer")}>{c}</span>
              </div>
            ))}
          </div>

          {/* Right panel content */}
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            <RightContent stage={stage} missions={missions} terminalContent={terminalContent} showConfetti={showConfetti} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT ROUTER
// ═══════════════════════════════════════

interface RightContentProps {
  stage: Stage;
  missions: Mission[];
  terminalContent: string;
  showConfetti: boolean;
}

function RightContent({ stage, missions, terminalContent, showConfetti }: RightContentProps) {
  const si = STAGE_ORDER.indexOf(stage);

  if (si <= 0) return <ContentEntree missions={missions} />;
  if (si <= 2) return <ContentDashboard missions={missions} />;
  if (si >= STAGE_ORDER.indexOf("lancement") && si <= STAGE_ORDER.indexOf("tracking-2")) {
    return <ContentTracking missions={missions} terminalContent={terminalContent} stage={stage} />;
  }
  if (stage === "rapport-inter") return <ContentRapportInter missions={missions} />;
  if (stage === "delegation") return <ContentDelegation terminalContent={terminalContent} />;
  if (stage === "automatisation") return <ContentAutomation terminalContent={terminalContent} />;
  if (stage === "blocage" || stage === "escalade") return <ContentBlocage missions={missions} stage={stage} />;
  if (stage === "livraison-1" || stage === "livraison-2") return <ContentLivraison missions={missions} stage={stage} />;
  if (stage === "rapport-final") return <ContentRapportFinal missions={missions} />;
  if (stage === "next-missions") return <ContentNextMissions />;
  if (stage === "bilan-kpi") return <ContentBilanKPI />;
  if (stage === "etape-suivante") return <ContentEtapeSuivante />;
  if (stage === "ceremonie") return <ContentCeremonie showConfetti={showConfetti} />;
  return null;
}

// ═══════════════════════════════════════
// LIVE TERMINAL — Bots en execution
// ═══════════════════════════════════════

function LiveTerminal({ content, speed = 12, title = "COMMAND — Terminal" }: { content: string; speed?: number; title?: string }) {
  const [chars, setChars] = useState(0);
  useEffect(() => { setChars(0); }, [content]);
  useEffect(() => {
    if (chars < content.length) {
      const nextChar = content[chars];
      const delay = nextChar === '\n' ? speed * 4 : speed;
      const timer = setTimeout(() => setChars(prev => prev + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [chars, content.length, speed, content]);
  const done = chars >= content.length;
  return (
    <div className="bg-gray-950 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 flex items-center gap-2 border-b border-gray-800">
        <Terminal className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-[9px] font-bold text-emerald-300">{title}</span>
        {!done && <div className="flex items-center gap-1.5 ml-auto"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[8px] text-emerald-400/70">En cours...</span></div>}
        {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <pre className="p-3 text-[9px] leading-relaxed font-mono max-h-[300px] overflow-y-auto">
        <code className="text-emerald-400">{content.slice(0, chars)}</code>
        {!done && <span className="text-emerald-300 animate-pulse">▊</span>}
      </pre>
    </div>
  );
}

// ═══════════════════════════════════════
// CONTENT COMPONENTS
// ═══════════════════════════════════════

function MissionCard({ mission }: { mission: Mission }) {
  const statusColors = {
    pending: "border-gray-200 bg-gray-50",
    active: "border-blue-200 bg-blue-50",
    done: "border-emerald-200 bg-emerald-50",
    blocked: "border-red-200 bg-red-50",
  };
  const statusIcons = {
    pending: <Clock className="h-3.5 w-3.5 text-gray-400" />,
    active: <Play className="h-3.5 w-3.5 text-blue-500 animate-pulse" />,
    done: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    blocked: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  };
  const statusLabels = { pending: "En attente", active: "En cours", done: "Termine", blocked: "Bloque" };
  const progressColor = mission.status === "done" ? "bg-emerald-500" : mission.status === "blocked" ? "bg-red-400" : mission.status === "active" ? "bg-blue-500" : "bg-gray-300";

  return (
    <div className={cn("border rounded-xl p-3 transition-all", statusColors[mission.status])}>
      <div className="flex items-center gap-2 mb-2">
        <BotAvatar code={mission.bot} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold text-gray-800 truncate">{mission.title}</div>
          <div className="text-[8px] text-gray-500">{mission.desc}</div>
        </div>
        {statusIcons[mission.status]}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", progressColor)} style={{ width: `${mission.progress}%` }} />
        </div>
        <span className="text-[9px] font-bold text-gray-500 w-8 text-right">{mission.progress}%</span>
        <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium",
          mission.status === "done" ? "bg-emerald-100 text-emerald-700" :
          mission.status === "blocked" ? "bg-red-100 text-red-700" :
          mission.status === "active" ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-500"
        )}>{statusLabels[mission.status]}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[8px] text-gray-400">
        <Clock className="h-3.5 w-3.5" />
        <span>ETA: {mission.eta}</span>
        <span className="ml-auto">{BOT_COLORS[mission.bot]?.name}</span>
      </div>
    </div>
  );
}

function ContentEntree({ missions }: { missions: Mission[] }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Phase Execution — Chantier Marketing Q2</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-auto">Transition depuis Creation</span>
      </div>

      {/* Livrables from Creation */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-bold text-amber-800">Livrables de la phase Creation (valides)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Document strategique", icon: FileText, color: "text-amber-600" },
            { label: "Budget & Finances", icon: DollarSign, color: "text-emerald-600" },
            { label: "Chatbot AI (Tim)", icon: Bot, color: "text-violet-600" },
            { label: "Pitch Deck", icon: BarChart3, color: "text-blue-600" },
            { label: "Template Lego", icon: Package, color: "text-pink-600" },
            { label: "Tableur de suivi", icon: TrendingUp, color: "text-teal-600" },
          ].map(d => (
            <div key={d.label} className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2 py-1.5 border border-amber-100">
              <d.icon className={cn("h-3.5 w-3.5 shrink-0", d.color)} />
              <span className="text-[8px] text-gray-700 font-medium">{d.label}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Missions preview */}
      <div className="bg-white border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold text-gray-800">Missions auto-generees</span>
          <span className="text-[9px] text-gray-500 ml-auto">{missions.length} missions</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {missions.map(m => <MissionCard key={m.id} mission={m} />)}
        </div>
      </div>

      {/* Empty state */}
      <div className="bg-emerald-50 border border-dashed border-emerald-300 rounded-xl p-6 text-center">
        <Zap className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
        <p className="text-xs text-emerald-600 font-medium">Pret pour l'execution</p>
        <p className="text-[9px] text-emerald-500 mt-1">Les bots vont executer les missions en autonomie</p>
      </div>
    </div>
  );
}

function ContentDashboard({ missions }: { missions: Mission[] }) {
  const completedCount = missions.filter(m => m.status === "done").length;
  const activeCount = missions.filter(m => m.status === "active").length;
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Dashboard COMMAND</h3>
        <div className="flex items-center gap-2 ml-auto text-[9px]">
          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{completedCount} fait</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{activeCount} en cours</span>
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{missions.length - completedCount - activeCount} en attente</span>
        </div>
      </div>

      {/* Global progress */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold text-emerald-800">Progression globale</span>
          <span className="text-[9px] text-emerald-600 font-bold ml-auto">{Math.round(missions.reduce((a, m) => a + m.progress, 0) / missions.length)}%</span>
        </div>
        <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${missions.reduce((a, m) => a + m.progress, 0) / missions.length}%` }} />
        </div>
      </div>

      {/* Mission cards */}
      <div className="grid grid-cols-2 gap-3">
        {missions.map(m => <MissionCard key={m.id} mission={m} />)}
      </div>

      {/* Bots actifs */}
      <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-sm">
        <span className="text-[9px] text-gray-500 font-medium">Bots assignes:</span>
        {["CEOB", "CTOB", "CFOB", "CMOB"].map(code => (
          <div key={code} className="flex items-center gap-1.5">
            <BotAvatar code={code} size="sm" />
            <span className="text-[9px] font-medium text-gray-700">{BOT_COLORS[code]?.name}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTracking({ missions, terminalContent, stage }: { missions: Mission[]; terminalContent: string; stage: Stage }) {
  const si = STAGE_ORDER.indexOf(stage);
  const showTerminal = si >= STAGE_ORDER.indexOf("lancement");
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Tracking Live</h3>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-emerald-600 font-medium">En direct</span>
        </div>
      </div>

      {/* Mission cards — updated live */}
      <div className="grid grid-cols-2 gap-2">
        {missions.map(m => <MissionCard key={m.id} mission={m} />)}
      </div>

      {/* LIVE Terminal — bot execution logs */}
      {showTerminal && terminalContent && (
        <LiveTerminal content={terminalContent} speed={8} title="Tim — Deploiement Chatbot AI" />
      )}

      {/* Event feed */}
      {si >= STAGE_ORDER.indexOf("tracking-1") && (
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[9px] font-bold text-gray-800">Feed evenements</span>
          </div>
          <div className="space-y-1">
            {TRACKING_EVENTS_1.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] border-l-2 border-emerald-300 pl-2.5 py-0.5">
                <span className="text-gray-400 shrink-0 w-8">{ev.time}</span>
                <BotAvatar code={ev.bot} size="sm" />
                <span className="text-gray-700 flex-1">{ev.text}</span>
                {ev.type === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
              </div>
            ))}
            {si >= STAGE_ORDER.indexOf("tracking-2") && TRACKING_EVENTS_2.map((ev, i) => (
              <div key={`t2-${i}`} className={cn("flex items-center gap-2 text-[9px] border-l-2 pl-2.5 py-0.5",
                ev.type === "alert" ? "border-amber-400 bg-amber-50 rounded-r" : "border-emerald-300"
              )}>
                <span className="text-gray-400 shrink-0 w-8">{ev.time}</span>
                <BotAvatar code={ev.bot} size="sm" />
                <span className={cn("flex-1", ev.type === "alert" ? "text-amber-700 font-medium" : "text-gray-700")}>{ev.text}</span>
                {ev.type === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> :
                 ev.type === "alert" ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /> :
                 <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentRapportInter({ missions }: { missions: Mission[] }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Rapport intermediaire — Chatbot AI</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CTOB" size="sm" />
          <span className="text-[9px] text-gray-500">Tim (CTO)</span>
        </div>
      </div>

      {/* Progress breakdown */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <div className="space-y-2">
          {[
            { label: "Deploiement widget", progress: 100, done: true },
            { label: "Tests unitaires", progress: 100, done: true },
            { label: "Integration CRM", progress: 75, done: false },
            { label: "Tests end-to-end", progress: 0, done: false },
          ].map(step => (
            <div key={step.label} className="flex items-center gap-2">
              {step.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-300 shrink-0" />}
              <span className={cn("text-[9px] w-28 shrink-0", step.done ? "text-emerald-700 line-through" : "text-gray-700 font-medium")}>{step.label}</span>
              <div className="flex-1 h-1.5 bg-violet-200 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${step.progress}%` }} />
              </div>
              <span className="text-[9px] font-bold text-violet-700 w-8 text-right">{step.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bloqueur */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[9px] font-bold text-amber-800">Bloqueur potentiel</span>
        </div>
        <p className="text-[9px] text-amber-700">La page pricing n'a pas de hook pour le chatbot. Solution proposee: widget flottant universel (fonctionne sur toutes les pages).</p>
      </div>

      {/* Mission cards */}
      <div className="grid grid-cols-2 gap-2">
        {missions.map(m => <MissionCard key={m.id} mission={m} />)}
      </div>
    </div>
  );
}

function ContentDelegation({ terminalContent }: { terminalContent: string }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Delegation — Mathilde prend le lead</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CMOB" size="sm" />
          <span className="text-[9px] text-gray-500">Mathilde (CMO)</span>
        </div>
      </div>

      {/* Delegation summary */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[9px] font-bold text-emerald-800">Transfert de responsabilite</span>
        </div>
        <div className="space-y-2">
          {[
            { from: "CEOB", to: "CMOB", mission: "Mission 1: Programme referral" },
            { from: "CEOB", to: "CMOB", mission: "Mission 3: Content LinkedIn" },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-100">
              <BotAvatar code={d.from} size="sm" />
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              <BotAvatar code={d.to} size="sm" />
              <span className="text-[9px] text-gray-700 flex-1">{d.mission}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Terminal showing delegation */}
      {terminalContent && <LiveTerminal content={terminalContent} speed={10} title="COMMAND — Delegation" />}
    </div>
  );
}

function ContentAutomation({ terminalContent }: { terminalContent: string }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Repeat className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Automatisation — Referral tracking</h3>
      </div>

      {/* Automation preview */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-3.5 w-3.5 text-violet-600" />
          <span className="text-[9px] font-bold text-violet-800">Workflow automatise</span>
        </div>
        <div className="space-y-1.5">
          {[
            { step: "Trigger", desc: "Nouveau referral detecte (formulaire + email)", icon: Zap },
            { step: "Action 1", desc: "Notifier Mathilde (Slack + email)", icon: Users },
            { step: "Action 2", desc: "Ajouter au CRM (statut: nouveau)", icon: Bot },
            { step: "Action 3", desc: "Mettre a jour dashboard budget", icon: BarChart3 },
            { step: "Action 4", desc: "Creer mission si qualifie", icon: Target },
            { step: "Rapport", desc: "Resume hebdo automatique (lundi 8h)", icon: FileText },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px]">
              <a.icon className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              <span className="text-violet-700 font-bold w-16 shrink-0">{a.step}</span>
              <span className="text-gray-700">{a.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal showing automation config */}
      {terminalContent && <LiveTerminal content={terminalContent} speed={10} title="COMMAND — Automatisation" />}
    </div>
  );
}

function ContentBlocage({ missions, stage }: { missions: Mission[]; stage: Stage }) {
  const isEscalade = stage === "escalade";
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        {isEscalade ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
        <h3 className="text-sm font-bold text-gray-800">{isEscalade ? "Escalade — Decision prise" : "Blocage detecte"}</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CTOB" size="sm" />
          <span className="text-[9px] text-gray-500">Tim (CTO)</span>
        </div>
      </div>

      {/* Blocage detail */}
      <div className={cn("border rounded-xl p-4", isEscalade ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
        <div className="flex items-center gap-2 mb-2">
          <XCircle className={cn("h-3.5 w-3.5", isEscalade ? "text-emerald-500" : "text-red-500")} />
          <span className={cn("text-[9px] font-bold", isEscalade ? "text-emerald-800" : "text-red-800")}>
            {isEscalade ? "Resolu: API CRM — pagination implementee" : "API CRM: timeout sur requetes batch"}
          </span>
        </div>
        <p className={cn("text-[9px]", isEscalade ? "text-emerald-700" : "text-red-700")}>
          {isEscalade
            ? "Tim a implemente la pagination en 28min. Tous les endpoints CRM repondent correctement. La mission peut reprendre."
            : "L'API du CRM renvoie un HTTP 504 timeout sur les requetes batch de plus de 50 contacts. Le chatbot ne peut pas synchroniser sa base de donnees."}
        </p>
      </div>

      {/* Decision panel */}
      {isEscalade && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">DECISION</span>
          </div>
          <div className="space-y-1.5 text-[9px] text-gray-700">
            <p><span className="font-bold text-blue-800">Choix:</span> Option 1 — Retry avec pagination</p>
            <p><span className="font-bold text-blue-800">Impact:</span> +28min de dev (dans le budget ETA)</p>
            <p><span className="font-bold text-blue-800">Resultat:</span> Pas de dette technique, solution propre et perenne</p>
          </div>
        </div>
      )}

      {/* 3 options (before decision) */}
      {!isEscalade && (
        <div className="space-y-2">
          {[
            { num: 1, text: "Retry avec pagination", detail: "+30min dev, solution propre", rec: true },
            { num: 2, text: "Cache local temporaire", detail: "Workaround 10min, dette technique", rec: false },
            { num: 3, text: "Escalader au support CRM", detail: "24-48h d'attente", rec: false },
          ].map(opt => (
            <div key={opt.num} className={cn("border rounded-lg p-3 flex items-start gap-3",
              opt.rec ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
            )}>
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                opt.rec ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"
              )}>{opt.num}</span>
              <div className="flex-1">
                <p className={cn("text-[9px] font-bold", opt.rec ? "text-emerald-800" : "text-gray-700")}>{opt.text}</p>
                <p className="text-[8px] text-gray-500">{opt.detail}</p>
              </div>
              {opt.rec && <span className="text-[8px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold shrink-0">Recommande</span>}
            </div>
          ))}
        </div>
      )}

      {/* Affected mission */}
      <div className="grid grid-cols-2 gap-2">
        {missions.filter(m => m.id === 2).map(m => <MissionCard key={m.id} mission={m} />)}
      </div>
    </div>
  );
}

function ContentLivraison({ missions, stage }: { missions: Mission[]; stage: Stage }) {
  const isLivraison2 = stage === "livraison-2";
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">{isLivraison2 ? "Livraison — Chatbot AI" : "Livraison — Budget Dashboard"}</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code={isLivraison2 ? "CTOB" : "CFOB"} size="sm" />
          <span className="text-[9px] text-gray-500">{isLivraison2 ? "Tim (CTO)" : "Frank (CFO)"}</span>
        </div>
      </div>

      {/* Quality check */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-800">Quality Check</span>
          <span className="text-[9px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold ml-auto">PASSE</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(isLivraison2 ? [
            { label: "Tests unitaires", value: "15/15" },
            { label: "Integration CRM", value: "OK (pagination)" },
            { label: "Widget pages", value: "4/4" },
            { label: "Conversion estimee", value: "2.8%" },
            { label: "Security review", value: "DOMPurify + Rate limit" },
            { label: "Quality score", value: "97/100" },
          ] : [
            { label: "Postes configures", value: "4/4" },
            { label: "Alertes actives", value: "3 seuils" },
            { label: "ROI temps reel", value: "Branche" },
            { label: "Export CSV", value: "Disponible" },
          ]).map(check => (
            <div key={check.label} className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="text-[9px] text-gray-600">{check.label}</span>
              <span className="text-[9px] font-bold text-emerald-700 ml-auto">{check.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timing */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
        <Clock className="h-3.5 w-3.5 text-blue-500" />
        <div className="flex-1">
          <span className="text-[9px] font-bold text-blue-800">Temps reel vs ETA</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: isLivraison2 ? "92%" : "84%" }} />
            </div>
            <span className="text-[9px] text-blue-700">{isLivraison2 ? "2h47 / 3h" : "38min / 45min"}</span>
          </div>
        </div>
      </div>

      {/* All missions */}
      <div className="grid grid-cols-2 gap-2">
        {missions.map(m => <MissionCard key={m.id} mission={m} />)}
      </div>
    </div>
  );
}

function ContentRapportFinal({ missions }: { missions: Mission[] }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Rapport final — Phase Execution</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-auto">4/4 completees</span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-2">
        {FINAL_KPIS.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={cn("border rounded-xl", kpi.border)}>
              <div className={cn("px-3 py-1.5 rounded-t-xl flex items-center gap-1.5", kpi.bg)}>
                <Icon className={cn("h-3.5 w-3.5", kpi.color)} />
                <span className={cn("text-[9px] font-bold", kpi.color)}>{kpi.label}</span>
              </div>
              <div className="px-3 py-2.5 bg-white rounded-b-xl text-center">
                <p className={cn("text-lg font-extrabold", kpi.color)}>{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* All missions — final state */}
      <div className="grid grid-cols-2 gap-2">
        {missions.map(m => <MissionCard key={m.id} mission={m} />)}
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-emerald-700 flex items-center gap-1">
          <Download className="h-3.5 w-3.5" /> Exporter le rapport
        </button>
        <button className="text-[9px] bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-emerald-50 flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" /> Voir les details
        </button>
      </div>
    </div>
  );
}

function ContentNextMissions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Rocket className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Prochaines missions — Sprint suivant</h3>
        <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-auto">Checkpoint S7</span>
      </div>

      <div className="space-y-2">
        {NEXT_SPRINT_MISSIONS.map((m, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-3 flex items-start gap-3 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <BotAvatar code={m.bot} size="sm" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-bold text-gray-800">{m.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] text-gray-500">{BOT_COLORS[m.bot]?.name}</span>
                <span className="text-[8px] text-gray-400">•</span>
                <span className="text-[8px] text-gray-500">ETA: {m.eta}</span>
              </div>
            </div>
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
              m.priority === "haute" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            )}>{m.priority}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[9px] font-bold text-gray-700 mb-2">Timeline prochain sprint</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn("w-full h-2 rounded-full",
                i < 4 ? "bg-emerald-400" : i < 7 ? "bg-emerald-200" : "bg-gray-200"
              )} />
              {(i === 0 || i === 6 || i === 13) && (
                <span className="text-[7px] text-gray-400">S{i + 1}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[8px] text-gray-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Fait</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-200" /> En cours</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200" /> A faire</div>
          <div className="flex items-center gap-1 ml-auto"><div className="w-2 h-2 rounded-full bg-amber-500 border border-amber-600" /> S7 checkpoint</div>
        </div>
      </div>
    </div>
  );
}

function ContentBilanKPI() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Bilan financier — Phase Execution</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CFOB" size="sm" />
          <span className="text-[9px] text-gray-500">Frank (CFO)</span>
        </div>
      </div>

      {/* Budget breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-emerald-50 border-b border-emerald-200">
              {["Poste", "Budget", "Utilise", "Restant", "Status"].map(h => (
                <th key={h} className="text-[9px] font-bold text-emerald-800 px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { poste: "Referral", budget: "1,200$", utilise: "980$", restant: "220$", pct: 82 },
              { poste: "Content LinkedIn", budget: "1,400$", utilise: "1,290$", restant: "110$", pct: 92 },
              { poste: "Chatbot AI", budget: "400$", utilise: "340$", restant: "60$", pct: 85 },
              { poste: "Email nurturing", budget: "800$", utilise: "590$", restant: "210$", pct: 74 },
            ].map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors">
                <td className="text-[9px] text-gray-700 px-3 py-2 font-medium">{row.poste}</td>
                <td className="text-[9px] text-gray-700 px-3 py-2">{row.budget}</td>
                <td className="text-[9px] text-gray-700 px-3 py-2">{row.utilise}</td>
                <td className="text-[9px] text-emerald-700 px-3 py-2 font-medium">{row.restant}</td>
                <td className="text-[9px] px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", row.pct > 90 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className={cn("font-medium", row.pct > 90 ? "text-amber-600" : "text-gray-600")}>{row.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-100/50 font-bold">
              <td className="text-[9px] text-emerald-800 px-3 py-2">Total</td>
              <td className="text-[9px] text-emerald-800 px-3 py-2">3,800$</td>
              <td className="text-[9px] text-emerald-800 px-3 py-2">3,200$</td>
              <td className="text-[9px] text-emerald-800 px-3 py-2">600$</td>
              <td className="text-[9px] text-emerald-800 px-3 py-2">84%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ROI cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "ROI referral", value: "4.2x", trend: "+0.6", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "CAC actuel", value: "650$", trend: "-130$", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "Marge reportee", value: "600$", trend: "→ mois prochain", color: "text-blue-700 bg-blue-50 border-blue-200" },
        ].map(kpi => (
          <div key={kpi.label} className={cn("border rounded-xl p-2.5 text-center", kpi.color)}>
            <p className="text-[9px] font-bold">{kpi.label}</p>
            <p className="text-sm font-extrabold">{kpi.value}</p>
            <p className="text-[8px] mt-0.5">{kpi.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentEtapeSuivante() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <ArrowRight className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Prochaine etape — Cycle complet</h3>
      </div>

      {/* Cycle complete */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          {[
            { phase: "Analyser", color: "bg-red-500", icon: Target },
            { phase: "Creer", color: "bg-amber-500", icon: Sparkles },
            { phase: "Executer", color: "bg-emerald-500", icon: Zap },
          ].map((p, i) => (
            <div key={p.phase} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", p.color)}>
                <p.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-700">{p.phase}</span>
                <span className="text-[8px] text-emerald-600 font-medium flex items-center gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" /> Fait</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-gray-500 text-center">Cycle Analyser → Creer → Executer complete pour le chantier Marketing Q2</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <button className="w-full text-left border border-emerald-200 bg-emerald-50 rounded-xl p-3 hover:bg-emerald-100 cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="text-[9px] font-bold text-emerald-800">Nouveau cycle — Meme chantier</p>
              <p className="text-[8px] text-emerald-600">Relancer Analyser → Creer → Executer avec les nouvelles donnees</p>
            </div>
          </div>
        </button>
        <button className="w-full text-left border border-blue-200 bg-blue-50 rounded-xl p-3 hover:bg-blue-100 cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <SkipForward className="h-4 w-4 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-[9px] font-bold text-blue-800">Chantier suivant</p>
              <p className="text-[8px] text-blue-600">Passer a Infrastructure Tech ou RH Recrutement</p>
            </div>
          </div>
        </button>
        <button className="w-full text-left border border-gray-200 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-500 shrink-0" />
            <div className="flex-1">
              <p className="text-[9px] font-bold text-gray-700">Retour au dashboard</p>
              <p className="text-[8px] text-gray-500">Vue d'ensemble de tous les chantiers</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function ContentCeremonie({ showConfetti }: { showConfetti: boolean }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300 rounded-xl px-6 py-6 text-center">
        {showConfetti && <div className="text-4xl mb-3">🎉🚀🏆</div>}
        <Award className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
        <p className="text-sm font-bold text-emerald-800">Chantier Marketing Q2</p>
        <p className="text-xs text-emerald-700">Phase Execution terminee avec succes</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-white rounded-lg px-3 py-2">
            <div className="font-bold text-emerald-700">4 missions livrees</div>
            <div className="text-gray-500">Referral, chatbot, content, budget</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2">
            <div className="font-bold text-emerald-700">3 bots mobilises</div>
            <div className="text-gray-500">Tim, Frank, Mathilde</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2">
            <div className="font-bold text-emerald-700">Budget: 84%</div>
            <div className="text-gray-500">3,200$ / 3,800$</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2">
            <div className="font-bold text-emerald-700">1 automatisation</div>
            <div className="text-gray-500">Referral tracking actif</div>
          </div>
        </div>

        {/* 3 phases done */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {[
            { label: "Analyser", color: "bg-red-500" },
            { label: "Creer", color: "bg-amber-500" },
            { label: "Executer", color: "bg-emerald-500" },
          ].map((p, i) => (
            <div key={p.label} className="flex items-center gap-1">
              {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", p.color)}>
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[8px] text-gray-600 font-medium">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button className="px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> Exporter le rapport
          </button>
          <button className="px-4 py-1.5 bg-white border border-emerald-300 text-emerald-700 text-[9px] font-medium rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer">
            Nouveau chantier
          </button>
        </div>
      </div>
    </div>
  );
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
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-emerald-600 hover:bg-emerald-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}
