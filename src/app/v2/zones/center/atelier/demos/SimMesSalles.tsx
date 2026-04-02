"use client";

/**
 * SimMesSalles.tsx — B2: Les 3 Rooms + Playbooks + Conference AI + Podcast + Board
 * Self-contained simulation — meme pattern que SimPhaseReflexion/Atelier/COMMAND
 * 14 stages: hub → think room → playbook SWOT → session brainstorm → war room → war crise → board room → board vote → verdict → conference AI → podcast table ronde → daily standup → historique → recap
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  CheckCircle2,
  Mic,
  Send,
  Lightbulb,
  Swords,
  Crown,
  Timer,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BookOpen,
  Play,
  Sparkles,
  Target,
  AlertTriangle,
  Clock,
  FileText,
  ArrowRight,
  Zap,
  Video,
  History,
  Star,
  Radio,
  Headphones,
  Coffee,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "hub-salles"
  | "think-room"
  | "playbook-actif"
  | "think-session"
  | "war-room"
  | "war-session"
  | "board-room"
  | "board-session"
  | "board-verdict"
  | "conference-ai"
  | "podcast-pionniers"
  | "daily-standup"
  | "historique"
  | "recap";

const STAGE_ORDER: Stage[] = [
  "hub-salles", "think-room", "playbook-actif", "think-session",
  "war-room", "war-session", "board-room", "board-session",
  "board-verdict", "conference-ai", "podcast-pionniers", "daily-standup",
  "historique", "recap",
];

const STAGE_LABELS: Record<Stage, string> = {
  "hub-salles": "Hub des Salles",
  "think-room": "Think Room",
  "playbook-actif": "Playbook SWOT",
  "think-session": "Session Brainstorm",
  "war-room": "War Room",
  "war-session": "Crise active",
  "board-room": "Board Room",
  "board-session": "Vote Board",
  "board-verdict": "Verdict",
  "conference-ai": "Conference AI",
  "podcast-pionniers": "Table Ronde Pionniers",
  "daily-standup": "Daily Standup CEO",
  historique: "Historique",
  recap: "Recapitulatif",
};

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

const ROOMS = [
  { id: "think", title: "Think Room", icon: Lightbulb, desc: "Brainstorms, ideation, exploration creative avec les bots.", color: "bg-violet-500", bgColor: "bg-violet-50", borderColor: "border-violet-200", textColor: "text-violet-700", sessions: 14, lastUsed: "il y a 2h" },
  { id: "war", title: "War Room", icon: Swords, desc: "Decisions rapides, timer OODA, debats contradictoires, urgence.", color: "bg-red-500", bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700", sessions: 8, lastUsed: "il y a 1 jour" },
  { id: "board", title: "Board Room", icon: Crown, desc: "Conseil d'administration robotique. Les 12 bots votent.", color: "bg-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-700", sessions: 5, lastUsed: "il y a 3 jours" },
  { id: "conference", title: "Conference AI", icon: Video, desc: "Sessions collaboratives longues avec encadrement AI.", color: "bg-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", sessions: 3, lastUsed: "il y a 5 jours" },
  { id: "podcast", title: "Table Ronde Pionniers", icon: Radio, desc: "Podcast AI: debats entre bots sur les tendances industrie.", color: "bg-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-700", sessions: 2, lastUsed: "il y a 1 semaine" },
];

const PLAYBOOK_CATEGORIES = [
  { name: "Strategie", count: 4, icon: Target, color: "text-blue-600" },
  { name: "Innovation", count: 3, icon: Sparkles, color: "text-violet-600" },
  { name: "Finance", count: 3, icon: Star, color: "text-emerald-600" },
  { name: "Marketing", count: 5, icon: Lightbulb, color: "text-pink-600" },
  { name: "Operations", count: 2, icon: Zap, color: "text-orange-600" },
  { name: "RH", count: 3, icon: Users, color: "text-cyan-600" },
];

const STICKY_IDEAS = [
  { id: 1, text: "Chatbot AI pour qualification leads", bot: "CTOB", votes: 3, color: "bg-yellow-100 border-yellow-300" },
  { id: 2, text: "Programme ambassadeurs clients", bot: "CMOB", votes: 2, color: "bg-green-100 border-green-300" },
  { id: 3, text: "API catalogue inter-entreprises", bot: "CPOB", votes: 4, color: "bg-blue-100 border-blue-300" },
  { id: 4, text: "Webinaires mensuels VITAA", bot: "CEOB", votes: 1, color: "bg-pink-100 border-pink-300" },
  { id: 5, text: "Partenariat distributeurs Orbit9", bot: "CSOB", votes: 5, color: "bg-purple-100 border-purple-300" },
  { id: 6, text: "Formation IA pour clients PME", bot: "CINOB", votes: 2, color: "bg-orange-100 border-orange-300" },
];

const BOARD_MEMBERS = [
  { code: "CEOB", vote: "pour" as const }, { code: "CTOB", vote: "pour" as const },
  { code: "CFOB", vote: "contre" as const }, { code: "CMOB", vote: "pour" as const },
  { code: "CSOB", vote: "pour" as const }, { code: "COOB", vote: "pour" as const },
  { code: "CPOB", vote: "pour" as const }, { code: "CHROB", vote: "abstention" as const },
  { code: "CINOB", vote: "pour" as const }, { code: "CROB", vote: "pour" as const },
  { code: "CLOB", vote: "contre" as const }, { code: "CISOB", vote: "pour" as const },
];

const PODCAST_SEGMENTS = [
  { title: "Les PME manufacturieres face a l'IA en 2026", speaker: "CEOB", duration: "8 min", topic: "Tendance" },
  { title: "ROI reel de l'automatisation — chiffres terrain", speaker: "CFOB", duration: "6 min", topic: "Finance" },
  { title: "Pourquoi 72% des PME sous-investissent en digital", speaker: "CMOB", duration: "5 min", topic: "Marketing" },
  { title: "Debat: Build vs Buy pour les outils IA", speaker: "CTOB", duration: "10 min", topic: "Tech" },
  { title: "Lecons des pionniers — 3 success stories", speaker: "CSOB", duration: "7 min", topic: "Strategie" },
];

const DAILY_ITEMS = [
  { type: "validation", title: "Approbation budget campagne LinkedIn", bot: "CFOB", urgency: "haute", status: "en attente" },
  { type: "suivi", title: "Point mission Audit SEO — Tim", bot: "CTOB", urgency: "normale", status: "planifie" },
  { type: "decision", title: "GO/NO-GO lancement referral Q2", bot: "CMOB", urgency: "haute", status: "a decider" },
  { type: "recurrence", title: "Revue KPIs hebdomadaire", bot: "CEOB", urgency: "normale", status: "recurrent" },
  { type: "validation", title: "Validation maquettes UX finales", bot: "CMOB", urgency: "moyenne", status: "en attente" },
  { type: "escalade", title: "Migration CMS bloquee — 5 jours", bot: "CTOB", urgency: "haute", status: "escalade" },
];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimMesSalles({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("hub-salles");
  const [typed, setTyped] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => { setStage("hub-salles"); setTyped(false); };
  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const activeNav = "salles";

  const discussionContext =
    si <= 0 ? "CarlOS — Mes Salles" :
    si <= 3 ? "Think Room — Brainstorm" :
    si <= 5 ? "War Room — Crise" :
    si <= 8 ? "Board Room — CA" :
    si === 9 ? "Conference AI — Session" :
    si === 10 ? "Podcast — Table Ronde" :
    si === 11 ? "Daily Standup — Direction" :
    "CarlOS — Mes Salles";

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text="Bienvenue dans Mes Salles. Tu as 5 espaces: Think Room (ideation), War Room (crise), Board Room (gouvernance), Conference AI (sessions longues), et Table Ronde Pionniers (podcast). Chaque salle a ses propres playbooks et modes."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("think-room")} icon={Lightbulb} label="Entrer dans la Think Room" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">5 salles — Think, War, Board, Conference, Podcast</p>}
        </SBubble>
      )}

      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          {si === 1 ? (
            <>
              <TypewriterText
                text="Think Room — 6 categories de playbooks, 20 disponibles. Le playbook 'Analyse SWOT complete' est le plus utilise: 45 min, 3 bots mobilises. On le lance?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("playbook-actif")} icon={Play} label="Ouvrir le playbook SWOT" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Think Room — 6 categories, 20 playbooks</p>}
        </SBubble>
      )}

      {si >= 2 && (
        <SBubble code="CEOB" collapsed={si > 2}>
          {si === 2 ? (
            <>
              <TypewriterText
                text="Playbook SWOT: 45 min, equipe CarlOS + Simone + Frank. 6 etapes: cadrage, forces, faiblesses, opportunites, menaces, synthese. Le split-screen active le sticky board a droite pendant que le brainstorm avance dans le chat."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("think-session")} icon={Sparkles} label="Lancer le brainstorm" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Playbook SWOT — 45 min, 3 bots</p>}
        </SBubble>
      )}

      {si >= 3 && (
        <SBubble code="CSOB" collapsed={si > 3}>
          {si === 3 ? (
            <>
              <TypewriterText
                text="Session active! 6 idees sur le sticky board. Vote pour les meilleures, combine-les, ou challenge-les. Chaque bot apporte sa perspective unique. L'idee 'Partenariat distributeurs Orbit9' a le plus de votes (5)."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("war-room")} icon={Swords} label="Passer a la War Room" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Brainstorm — 6 idees, votes actifs</p>}
        </SBubble>
      )}

      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          {si === 4 ? (
            <>
              <TypewriterText
                text="War Room — Mode crise. Timer OODA actif: Observer, Orienter, Decider, Agir. Les bots passent en mode urgence. Reponses courtes, focus donnees, decisions binaires. Pour quand il faut trancher vite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("war-session")} icon={Timer} label="Activer la crise" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">War Room — Timer OODA, mode urgence</p>}
        </SBubble>
      )}

      {si >= 5 && (
        <SBubble code="CTOB" collapsed={si > 5}>
          {si === 5 ? (
            <>
              <TypewriterText
                text="ALERTE: Site web DOWN depuis 15 min. Impact: 200 visiteurs perdus, 3 demos annulees. Timer OODA: 8 minutes. 3 options: rollback (3 min, risque minimal — RECOMMANDE), hotfix (20 min, risque moyen), maintenance (1h+). Decision?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("board-room")} icon={Crown} label="Passer au Board Room" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Crise resolue — rollback 3 min</p>}
        </SBubble>
      )}

      {si >= 6 && (
        <SBubble code="CEOB" collapsed={si > 6}>
          {si === 6 ? (
            <>
              <TypewriterText
                text="Board Room — Conseil d'administration robotique. 12 bots siegent. 3 points a l'OJ aujourd'hui. Premier point: lancement programme referral Q2 propose par Mathilde. Chaque bot va voter avec sa justification."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("board-session")} icon={BookOpen} label="Ouvrir la session" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Board — 12 bots, 3 points OJ</p>}
        </SBubble>
      )}

      {si >= 7 && (
        <SBubble code="CMOB" collapsed={si > 7}>
          {si === 7 ? (
            <>
              <TypewriterText
                text="Ma proposition: programme referral, 1,200$/mois, ROI 4.2x, objectif 15 leads qualifies/mois. Recompense les clients qui referent des PME manufacturieres. Deploiement 2 semaines. Les 12 bots votent maintenant."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("board-verdict")} icon={ThumbsUp} label="Voir le verdict" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Proposition referral — 1,200$/mois</p>}
        </SBubble>
      )}

      {si >= 8 && (
        <SBubble code="CEOB" collapsed={si > 8}>
          {si === 8 ? (
            <>
              <TypewriterText
                text="Verdict: 9 pour, 2 contre (Frank + Loulou), 1 abstention (Helene). Decision adoptee! Les dissidences sont enregistrees. Frank note un risque de cannibalisation. Loulou souleve des enjeux legaux. Maintenant, regardons les nouveaux formats de salles."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("conference-ai")} icon={Video} label="Conference AI" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Verdict: 9 pour, 2 contre, 1 abstention</p>}
        </SBubble>
      )}

      {si >= 9 && (
        <SBubble code="CEOB" collapsed={si > 9}>
          {si === 9 ? (
            <>
              <TypewriterText
                text="Conference AI — Les bots encadrent une session collaborative longue. Format: 4 bots en video/audio en haut, chat en bas. Chaque bot a un role defini (facilitateur, contradicteur, rapporteur, synthese). Timer par segment. L'AI gere les tours de parole et les transitions."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("podcast-pionniers")} icon={Radio} label="Table Ronde Pionniers" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Conference AI — encadrement bots</p>}
        </SBubble>
      )}

      {si >= 10 && (
        <SBubble code="CEOB" collapsed={si > 10}>
          {si === 10 ? (
            <>
              <TypewriterText
                text="Table Ronde des Pionniers — Format podcast AI. 5 segments thematiques: tendances, ROI, digital, build vs buy, success stories. Les bots debattent entre eux pendant que tu ecoutes. Tu peux intervenir, poser des questions, ou redirect le debat a tout moment."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("daily-standup")} icon={Coffee} label="Daily Standup CEO" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Podcast — 5 segments, debat IA</p>}
        </SBubble>
      )}

      {si >= 11 && (
        <SBubble code="CEOB" collapsed={si > 11}>
          {si === 11 ? (
            <>
              <TypewriterText
                text="Daily Standup CEO — C'est ton meeting de direction quotidien. 6 items a traiter: validations en attente, suivi missions, decisions GO/NO-GO, revues recurrentes, et escalades. Chaque item est triage par urgence. C'est ce qui arrive TOUS LES JOURS dans une vraie entreprise."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("historique")} icon={History} label="Voir l'historique" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Daily — 6 items, triage par urgence</p>}
        </SBubble>
      )}

      {si >= 12 && (
        <SBubble code="CEOB" collapsed={si > 12}>
          {si === 12 ? (
            <>
              <TypewriterText
                text="Historique: 32 sessions au total. Chaque session archivee avec decisions, documents generes, votes, et insights. Tu peux rejouer, exporter ou analyser les tendances. Le Board Room a le taux de resolution le plus eleve (95%)."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("recap")} icon={Star} label="Recapitulatif" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">32 sessions archivees</p>}
        </SBubble>
      )}

      {si >= 13 && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText
            text="Tour complet de Mes Salles: Think Room (ideation), War Room (crise), Board Room (gouvernance), Conference AI (encadrement), Table Ronde (podcast), et Daily Standup (gestion quotidienne). Chaque salle a son propre flow et ses propres bots specialises."
            speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
          />
          {typed && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button onClick={handleReset}
                className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-violet-600 hover:bg-violet-700">
                <RotateCcw className="h-3.5 w-3.5" /> Recommencer la demo
              </button>
            </div>
          )}
        </SBubble>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Users className="h-4 w-4 text-violet-600" />
        <span className="text-sm font-bold text-gray-800">Mes Salles</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-violet-500" : i < si ? "w-2 bg-violet-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={cn("h-1 shrink-0",
        si <= 3 ? "bg-violet-500" : si <= 5 ? "bg-red-500" : si <= 8 ? "bg-amber-500" : si === 9 ? "bg-blue-500" : si === 10 ? "bg-emerald-500" : si === 11 ? "bg-orange-500" : "bg-gray-500"
      )} />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>
          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>
          <div className="shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-400">Ecrivez un message...</div>
            <button className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"><Mic className="h-4 w-4" /></button>
            <button className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"><Send className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
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
                  activeNav === nav.id ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            <RightContent stage={stage} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT ROUTER
// ═══════════════════════════════════════

function RightContent({ stage }: { stage: Stage }) {
  if (stage === "hub-salles") return <ContentHubSalles />;
  if (stage === "think-room") return <ContentThinkRoom />;
  if (stage === "playbook-actif") return <ContentPlaybookActif />;
  if (stage === "think-session") return <ContentThinkSession />;
  if (stage === "war-room") return <ContentWarRoom />;
  if (stage === "war-session") return <ContentWarSession />;
  if (stage === "board-room") return <ContentBoardRoom />;
  if (stage === "board-session") return <ContentBoardSession />;
  if (stage === "board-verdict") return <ContentBoardVerdict />;
  if (stage === "conference-ai") return <ContentConferenceAI />;
  if (stage === "podcast-pionniers") return <ContentPodcastPionniers />;
  if (stage === "daily-standup") return <ContentDailyStandup />;
  if (stage === "historique") return <ContentHistorique />;
  if (stage === "recap") return <ContentRecap />;
  return null;
}

// ═══════════════════════════════════════
// CONTENT COMPONENTS
// ═══════════════════════════════════════

function ContentHubSalles() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Mes Salles — Hub</h3>
        <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium ml-auto">5 salles</span>
      </div>
      <div className="space-y-3">
        {ROOMS.map(room => {
          const Icon = room.icon;
          return (
            <div key={room.id} className={cn("border-2 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all", room.borderColor)}>
              <div className={cn("h-2", room.color)} />
              <div className="p-4 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", room.color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{room.title}</p>
                  <p className="text-[9px] text-gray-500">{room.desc}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[8px] text-gray-400"><span className="font-bold text-gray-600">{room.sessions}</span> sessions</span>
                    <span className="text-[8px] text-gray-400">Derniere: {room.lastUsed}</span>
                  </div>
                </div>
                <button className={cn("text-[9px] px-3 py-1.5 rounded-full font-bold text-white cursor-pointer shrink-0", room.color, "hover:opacity-90")}>Entrer</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContentThinkRoom() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Think Room — Playbooks</h3>
        <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium ml-auto">20 playbooks</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PLAYBOOK_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.name} className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-sm hover:border-violet-300 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("h-4 w-4", cat.color)} />
                <span className="text-xs font-bold text-gray-800">{cat.name}</span>
              </div>
              <span className="text-[9px] text-gray-400">{cat.count} playbooks</span>
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Strategie — 4 playbooks</p>
        <div className="space-y-2">
          {[
            { name: "Analyse SWOT complete", duration: "45 min", bots: ["CEOB", "CSOB", "CFOB"], difficulty: "Intermediaire" },
            { name: "Plan strategique 90 jours", duration: "1h30", bots: ["CEOB", "COOB", "CMOB"], difficulty: "Avance" },
            { name: "Positionnement concurrentiel", duration: "30 min", bots: ["CSOB", "CMOB"], difficulty: "Debutant" },
            { name: "Vision et mission refresh", duration: "1h", bots: ["CEOB", "CSOB", "CHROB"], difficulty: "Intermediaire" },
          ].map((pb, i) => (
            <div key={i} className={cn("border rounded-xl p-3 cursor-pointer hover:shadow-sm transition-all", i === 0 ? "border-violet-300 bg-violet-50/50 ring-1 ring-violet-200" : "border-gray-200")}>
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-violet-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-800">{pb.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] text-gray-400"><Clock className="h-3.5 w-3.5 inline mr-0.5" />{pb.duration}</span>
                    <span className="text-[8px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">{pb.difficulty}</span>
                  </div>
                </div>
                <div className="flex -space-x-1">{pb.bots.map(b => <BotAvatar key={b} code={b} size="sm" />)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentPlaybookActif() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Playbook: Analyse SWOT complete</h3>
        <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium ml-auto">45 min</span>
      </div>
      <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center"><BookOpen className="h-5 w-5 text-white" /></div>
          <div>
            <p className="text-sm font-bold text-violet-800">Analyse SWOT complete</p>
            <p className="text-[9px] text-violet-600">Forces, faiblesses, opportunites et menaces avec 3 experts</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{ l: "Duree", v: "45 min" }, { l: "Difficulte", v: "Intermediaire" }, { l: "Livrables", v: "Matrice SWOT" }].map(m => (
            <div key={m.l} className="bg-white rounded-lg p-2.5 text-center">
              <p className="text-[8px] text-gray-400 mb-0.5">{m.l}</p>
              <p className="text-xs font-bold text-gray-800">{m.v}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[9px] text-violet-700 font-bold mb-1.5">Equipe:</p>
          <div className="flex gap-2">
            {[{ c: "CEOB", r: "Facilitateur" }, { c: "CSOB", r: "Strategiste" }, { c: "CFOB", r: "Analyste" }].map(b => (
              <div key={b.c} className="flex items-center gap-1.5 bg-white rounded-full px-2.5 py-1">
                <BotAvatar code={b.c} size="sm" />
                <span className="text-[9px] font-medium text-gray-700">{BOT_COLORS[b.c]?.name}</span>
                <span className="text-[8px] text-gray-400">{b.r}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[9px] text-violet-700 font-bold mb-1">Etapes:</p>
          <div className="space-y-1">
            {["Cadrage: definir le sujet", "Forces: atouts internes", "Faiblesses: points d'amelioration", "Opportunites: facteurs externes favorables", "Menaces: risques et concurrence", "Synthese: matrice SWOT consolidee"].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[8px] font-bold shrink-0">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentThinkSession() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Session Think — Sticky Board</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-auto">En cours</span>
      </div>
      <div className="flex items-center gap-2">
        {["CEOB", "CSOB", "CFOB"].map(c => (
          <div key={c} className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-full px-2 py-1">
            <BotAvatar code={c} size="sm" />
            <span className="text-[8px] font-medium text-violet-700">{BOT_COLORS[c]?.name}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {STICKY_IDEAS.map(idea => (
          <div key={idea.id} className={cn("border-2 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all", idea.color)}>
            <p className="text-[9px] font-medium text-gray-800 mb-2">{idea.text}</p>
            <div className="flex items-center gap-2">
              <BotAvatar code={idea.bot} size="sm" />
              <span className="text-[8px] text-gray-500">{BOT_COLORS[idea.bot]?.name}</span>
              <div className="flex items-center gap-1 ml-auto">
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-500 cursor-pointer" />
                <span className="text-[9px] font-bold text-gray-700">{idea.votes}</span>
                <ThumbsDown className="h-3.5 w-3.5 text-red-400 cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-violet-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-violet-700">Ajouter une idee</button>
        <button className="text-[9px] bg-white border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-violet-50">Combiner 2 idees</button>
        <button className="text-[9px] bg-white border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-violet-50">Prioriser</button>
        <button className="text-[9px] bg-white border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-violet-50">Cristalliser</button>
      </div>
    </div>
  );
}

function ContentWarRoom() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Swords className="h-4 w-4 text-red-600" />
        <h3 className="text-sm font-bold text-gray-800">War Room — Mode Crise</h3>
      </div>
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center"><Swords className="h-6 w-6 text-white" /></div>
          <div>
            <p className="text-sm font-bold text-red-800">Salle de crise</p>
            <p className="text-[9px] text-red-600">Timer OODA actif. Decisions rapides sous pression.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["Observer", "Orienter", "Decider", "Agir"].map((s, i) => (
            <div key={i} className="bg-white rounded-lg p-2 text-center border border-red-200">
              <p className="text-[8px] text-red-400 uppercase font-bold">Phase {i + 1}</p>
              <p className="text-xs font-bold text-red-700">{s}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-3 border border-red-200">
          <p className="text-[9px] font-bold text-red-700 mb-1">Regles:</p>
          {["Reponses max 3 phrases", "Focus donnees", "Timer strict", "Decisions GO/NO-GO", "Un sujet a la fois"].map((r, i) => (
            <p key={i} className="text-[9px] text-gray-600 flex items-center gap-1"><Swords className="h-3.5 w-3.5 text-red-400 shrink-0" /> {r}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentWarSession() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Swords className="h-4 w-4 text-red-600" />
        <h3 className="text-sm font-bold text-gray-800">Crise active</h3>
        <div className="flex items-center gap-1 ml-auto bg-red-100 border border-red-200 rounded-full px-2.5 py-1">
          <Timer className="h-3.5 w-3.5 text-red-600 animate-pulse" />
          <span className="text-[9px] font-bold text-red-700">8:00</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {["Observer", "Orienter", "Decider", "Agir"].map((s, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className={cn("flex-1 h-2 rounded-full", i === 0 ? "bg-red-500" : i === 1 ? "bg-red-300" : "bg-gray-200")} />
            <span className="text-[8px] text-gray-400">{s.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
          <span className="text-sm font-bold text-red-800">Site web DOWN</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[{ l: "Duree", v: "15 min" }, { l: "Impact", v: "200 visiteurs" }, { l: "Demos perdues", v: "3" }].map(m => (
            <div key={m.l} className="bg-white rounded-lg p-2 text-center">
              <p className="text-[8px] text-gray-400">{m.l}</p>
              <p className="text-sm font-extrabold text-red-700">{m.v}</p>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-red-700 font-bold mb-2">Options:</p>
        <div className="space-y-1.5">
          {[
            { o: "Rollback", d: "Risque minimal. 3 min.", rec: true },
            { o: "Hotfix", d: "Risque moyen. 20 min.", rec: false },
            { o: "Maintenance", d: "Risque nul. 1h+.", rec: false },
          ].map((opt, i) => (
            <div key={i} className={cn("flex items-center gap-3 rounded-lg p-2.5 border-2 cursor-pointer", opt.rec ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200")}>
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", opt.rec ? "bg-emerald-500" : "bg-gray-200")}>
                {opt.rec && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-gray-800">{opt.o}</p>
                <p className="text-[8px] text-gray-500">{opt.d}</p>
              </div>
              {opt.rec && <span className="text-[8px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">Recommande</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentBoardRoom() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Board Room — CA robotique</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">12 membres</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {BOARD_MEMBERS.map(m => (
          <div key={m.code} className="flex flex-col items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg p-2 cursor-pointer hover:shadow-sm">
            <BotAvatar code={m.code} size="md" />
            <span className="text-[8px] font-medium text-gray-700">{BOT_COLORS[m.code]?.name}</span>
            <span className="text-[7px] text-gray-400">{BOT_COLORS[m.code]?.role}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Ordre du jour</p>
        <div className="space-y-2">
          {[
            { title: "Lancement programme referral Q2", bot: "CMOB", status: "vote" },
            { title: "Budget reallocation marketing digital", bot: "CFOB", status: "discussion" },
            { title: "Recrutement developpeur senior", bot: "CHROB", status: "en attente" },
          ].map((item, i) => (
            <div key={i} className={cn("flex items-center gap-3 border rounded-lg p-3", item.status === "vote" ? "border-amber-300 bg-amber-50" : "border-gray-200")}>
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <BotAvatar code={item.bot} size="sm" />
                  <span className="text-[8px] text-gray-400">{BOT_COLORS[item.bot]?.name}</span>
                </div>
              </div>
              <span className={cn("text-[8px] px-2 py-0.5 rounded-full font-bold", item.status === "vote" ? "bg-amber-200 text-amber-800" : item.status === "discussion" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500")}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentBoardSession() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Board — Vote: Programme Referral</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">En cours</span>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BotAvatar code="CMOB" size="md" />
          <div>
            <p className="text-xs font-bold text-amber-800">Proposition de Mathilde (CMO)</p>
            <p className="text-[9px] text-amber-600">Programme referral clients existants</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[{ l: "Budget", v: "1,200$/m" }, { l: "ROI", v: "4.2x" }, { l: "Objectif", v: "15 leads/m" }, { l: "Deploiement", v: "2 sem" }].map(m => (
            <div key={m.l} className="bg-white rounded-lg p-2 text-center">
              <p className="text-[8px] text-gray-400">{m.l}</p>
              <p className="text-sm font-extrabold text-amber-700">{m.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-3 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold text-amber-700">Votes en cours...</span>
            <div className="flex gap-1 ml-auto">
              {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {BOARD_MEMBERS.map(m => (
              <div key={m.code} className="flex flex-col items-center gap-0.5">
                <BotAvatar code={m.code} size="sm" />
                <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentBoardVerdict() {
  const p = BOARD_MEMBERS.filter(m => m.vote === "pour").length;
  const c = BOARD_MEMBERS.filter(m => m.vote === "contre").length;
  const a = BOARD_MEMBERS.filter(m => m.vote === "abstention").length;
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Verdict</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold ml-auto">ADOPTE</span>
      </div>
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-extrabold text-emerald-700 mb-1">Decision adoptee</p>
        <div className="flex items-center justify-center gap-6">
          <div><p className="text-xl font-extrabold text-emerald-600">{p}</p><p className="text-[9px] text-emerald-500">Pour</p></div>
          <div><p className="text-xl font-extrabold text-red-600">{c}</p><p className="text-[9px] text-red-500">Contre</p></div>
          <div><p className="text-xl font-extrabold text-gray-500">{a}</p><p className="text-[9px] text-gray-400">Abstention</p></div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BOARD_MEMBERS.map(m => (
          <div key={m.code} className={cn("flex items-center gap-2 rounded-lg p-2 border",
            m.vote === "pour" ? "bg-emerald-50 border-emerald-200" : m.vote === "contre" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
          )}>
            <BotAvatar code={m.code} size="sm" />
            <span className="text-[8px] font-medium text-gray-700 flex-1">{BOT_COLORS[m.code]?.name}</span>
            {m.vote === "pour" ? <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" /> : m.vote === "contre" ? <ThumbsDown className="h-3.5 w-3.5 text-red-500" /> : <Minus className="h-3.5 w-3.5 text-gray-400" />}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Dissidences</p>
        {[
          { code: "CFOB", text: "Risque de cannibalisation des ventes directes." },
          { code: "CLOB", text: "Enjeux legaux referral dans certaines provinces." },
          { code: "CHROB", text: "Besoin plus de donnees RH. Abstention." },
        ].map((d, i) => (
          <div key={i} className={cn("border rounded-lg p-3 flex items-start gap-2", d.code === "CHROB" ? "border-gray-200 bg-gray-50" : "border-red-200 bg-red-50")}>
            <BotAvatar code={d.code} size="sm" />
            <div>
              <p className={cn("text-[9px] font-bold", d.code === "CHROB" ? "text-gray-600" : "text-red-700")}>{BOT_COLORS[d.code]?.name}</p>
              <p className={cn("text-[9px]", d.code === "CHROB" ? "text-gray-500" : "text-red-600")}>{d.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentConferenceAI() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Conference AI — Session encadree</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-auto">En direct</span>
      </div>

      {/* Conference bar */}
      <div className="bg-gray-900 rounded-xl p-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { code: "CEOB", role: "Facilitateur" },
            { code: "CSOB", role: "Contradicteur" },
            { code: "CFOB", role: "Rapporteur" },
            { code: "CMOB", role: "Synthese" },
          ].map(b => (
            <div key={b.code} className="bg-gray-800 rounded-lg p-3 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                <BotAvatar code={b.code} size="md" />
              </div>
              <span className="text-[9px] text-white font-medium">{BOT_COLORS[b.code]?.name}</span>
              <span className="text-[8px] text-blue-400">{b.role}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] text-emerald-400">Actif</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encadrement AI */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-[9px] font-bold text-blue-800">Encadrement AI — Comment ca marche:</p>
        <div className="space-y-1">
          {[
            "CarlOS gere les tours de parole automatiquement",
            "Timer par segment (5-10 min) avec transition fluide",
            "Le contradicteur challenge CHAQUE conclusion",
            "Le rapporteur capture les decisions en temps reel",
            "La synthese intervient toutes les 15 minutes",
            "Tu peux intervenir, poser des questions, ou redirect a tout moment",
          ].map((r, i) => (
            <p key={i} className="text-[9px] text-blue-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" /> {r}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-700">Donner la parole</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Poser une question</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Redirect le sujet</button>
        <button className="text-[9px] bg-red-500 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-600">Fin de conference</button>
      </div>
    </div>
  );
}

function ContentPodcastPionniers() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Table Ronde des Pionniers — Podcast AI</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-auto">5 segments</span>
      </div>

      {/* Podcast header */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Headphones className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">PME Manufacturieres x IA en 2026</p>
            <p className="text-[9px] text-emerald-600">Episode 3 — Table ronde avec 5 experts AI</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-bold text-emerald-700">36 min</p>
            <p className="text-[8px] text-emerald-500">duree totale</p>
          </div>
        </div>

        {/* Panelistes */}
        <div className="flex gap-2 mb-3">
          {["CEOB", "CFOB", "CMOB", "CTOB", "CSOB"].map(c => (
            <div key={c} className="flex items-center gap-1 bg-white rounded-full px-2 py-1">
              <BotAvatar code={c} size="sm" />
              <span className="text-[8px] font-medium text-gray-700">{BOT_COLORS[c]?.name}</span>
            </div>
          ))}
        </div>

        {/* Audio waveform mockup */}
        <div className="bg-emerald-100 rounded-lg p-2 flex items-center gap-2">
          <Play className="h-5 w-5 text-emerald-700 cursor-pointer" />
          <div className="flex-1 flex items-center gap-0.5">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex-1 bg-emerald-400 rounded-full" style={{ height: `${Math.random() * 16 + 4}px` }} />
            ))}
          </div>
          <span className="text-[9px] text-emerald-700 font-medium">0:00 / 36:00</span>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-2">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Segments</p>
        {PODCAST_SEGMENTS.map((seg, i) => (
          <div key={i} className={cn("flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all",
            i === 0 ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200"
          )}>
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">{seg.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <BotAvatar code={seg.speaker} size="sm" />
                <span className="text-[8px] text-gray-400">{BOT_COLORS[seg.speaker]?.name} · {seg.duration}</span>
              </div>
            </div>
            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">{seg.topic}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-emerald-700">Intervenir dans le debat</button>
        <button className="text-[9px] bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-emerald-50">Poser une question</button>
        <button className="text-[9px] bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-emerald-50">Exporter la transcription</button>
      </div>
    </div>
  );
}

function ContentDailyStandup() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Coffee className="h-4 w-4 text-orange-600" />
        <h3 className="text-sm font-bold text-gray-800">Daily Standup CEO — Meeting de direction</h3>
        <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium ml-auto">6 items</span>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-orange-600" />
        <p className="text-[9px] text-orange-700 font-medium">Meeting quotidien — 15 min max. CarlOS trie les items par urgence et te guide point par point.</p>
      </div>

      <div className="space-y-2">
        {DAILY_ITEMS.map((item, i) => (
          <div key={i} className={cn("border rounded-xl p-3 cursor-pointer hover:shadow-sm transition-all",
            item.urgency === "haute" ? "border-red-200 bg-red-50/30" : "border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                item.type === "validation" ? "bg-amber-100" : item.type === "suivi" ? "bg-blue-100" : item.type === "decision" ? "bg-red-100" : item.type === "recurrence" ? "bg-violet-100" : "bg-orange-100"
              )}>
                {item.type === "validation" ? <CheckCircle2 className="h-4 w-4 text-amber-600" /> :
                 item.type === "suivi" ? <Target className="h-4 w-4 text-blue-600" /> :
                 item.type === "decision" ? <Zap className="h-4 w-4 text-red-600" /> :
                 item.type === "recurrence" ? <Clock className="h-4 w-4 text-violet-600" /> :
                 <AlertTriangle className="h-4 w-4 text-orange-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <BotAvatar code={item.bot} size="sm" />
                  <span className="text-[8px] text-gray-400">{BOT_COLORS[item.bot]?.name}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold",
                  item.urgency === "haute" ? "bg-red-100 text-red-700" : item.urgency === "moyenne" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                )}>{item.urgency}</span>
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-medium",
                  item.status === "en attente" ? "bg-amber-50 text-amber-600" :
                  item.status === "a decider" ? "bg-red-50 text-red-600" :
                  item.status === "escalade" ? "bg-orange-50 text-orange-600" :
                  item.status === "recurrent" ? "bg-violet-50 text-violet-600" :
                  "bg-blue-50 text-blue-600"
                )}>{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-[9px] text-gray-700">
          <span className="font-bold">Pattern quotidien:</span> Chaque matin, CarlOS prepare ton standup avec les items tries par urgence. Validations, suivis de missions, decisions GO/NO-GO, revues recurrentes, et escalades. Comme un vrai meeting de direction, mais guide par l'IA.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-orange-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-700">Traiter le premier item</button>
        <button className="text-[9px] bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Reporter un item</button>
        <button className="text-[9px] bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Deleguer a un bot</button>
        <button className="text-[9px] bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Tout approuver</button>
      </div>
    </div>
  );
}

function ContentHistorique() {
  const sessions = [
    { room: "Daily", title: "Standup CEO — 6 items traites", date: "29 mars 2026", duration: "12 min", decisions: 4, docs: 0 },
    { room: "Think", title: "Brainstorm marketing Q2", date: "27 mars 2026", duration: "38 min", decisions: 4, docs: 1 },
    { room: "Podcast", title: "Table Ronde: IA x Manufacturiers", date: "26 mars 2026", duration: "36 min", decisions: 0, docs: 1 },
    { room: "War", title: "Crise serveur prod", date: "25 mars 2026", duration: "12 min", decisions: 1, docs: 0 },
    { room: "Board", title: "Vote budget reallocation", date: "22 mars 2026", duration: "55 min", decisions: 3, docs: 2 },
    { room: "Conference", title: "Revue strategique Q2", date: "20 mars 2026", duration: "1h10", decisions: 6, docs: 1 },
  ];
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">Historique des sessions</h3>
        <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium ml-auto">32 sessions</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[
          { l: "Think Room", c: 14, cl: "bg-violet-100 text-violet-700" },
          { l: "War Room", c: 8, cl: "bg-red-100 text-red-700" },
          { l: "Board Room", c: 5, cl: "bg-amber-100 text-amber-700" },
          { l: "Conference", c: 3, cl: "bg-blue-100 text-blue-700" },
          { l: "Podcast", c: 2, cl: "bg-emerald-100 text-emerald-700" },
        ].map(f => (
          <span key={f.l} className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium", f.cl)}>{f.l} ({f.c})</span>
        ))}
      </div>
      <div className="space-y-2">
        {sessions.map((s, i) => {
          const iconMap: Record<string, { icon: typeof Lightbulb; color: string }> = {
            Think: { icon: Lightbulb, color: "bg-violet-100" },
            War: { icon: Swords, color: "bg-red-100" },
            Board: { icon: Crown, color: "bg-amber-100" },
            Conference: { icon: Video, color: "bg-blue-100" },
            Podcast: { icon: Radio, color: "bg-emerald-100" },
            Daily: { icon: Coffee, color: "bg-orange-100" },
          };
          const { icon: Icon, color } = iconMap[s.room] || { icon: FileText, color: "bg-gray-100" };
          return (
            <div key={i} className="border border-gray-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color)}>
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">{s.title}</p>
                <p className="text-[8px] text-gray-400">{s.date} · {s.duration}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[8px] text-gray-500">{s.decisions} dec.</span>
                {s.docs > 0 && <span className="text-[8px] text-blue-500">{s.docs} doc</span>}
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContentRecap() {
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-violet-100 to-blue-100 border-2 border-violet-300 rounded-xl px-6 py-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          {[
            { icon: Lightbulb, color: "bg-violet-500" },
            { icon: Swords, color: "bg-red-500" },
            { icon: Crown, color: "bg-amber-500" },
            { icon: Video, color: "bg-blue-500" },
            { icon: Radio, color: "bg-emerald-500" },
            { icon: Coffee, color: "bg-orange-500" },
          ].map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className={cn("w-9 h-9 rounded-full flex items-center justify-center", r.color)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            );
          })}
        </div>
        <p className="text-sm font-bold text-gray-800">Mes Salles — Tour complet</p>
        <p className="text-xs text-gray-600">6 formats: Think Room, War Room, Board Room, Conference AI, Podcast Pionniers, Daily Standup CEO</p>
        <div className="grid grid-cols-3 gap-3">
          <div><p className="text-lg font-extrabold text-violet-700">32</p><p className="text-[9px] text-gray-500">Sessions totales</p></div>
          <div><p className="text-lg font-extrabold text-amber-700">18</p><p className="text-[9px] text-gray-500">Decisions prises</p></div>
          <div><p className="text-lg font-extrabold text-blue-700">5</p><p className="text-[9px] text-gray-500">Documents generes</p></div>
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
  if (collapsed) return (
    <div className="flex gap-2 items-center opacity-60">
      <BotAvatar code={code} size="sm" />
      <div className="text-[9px] text-gray-400">{children}</div>
    </div>
  );
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
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-violet-600 hover:bg-violet-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}
