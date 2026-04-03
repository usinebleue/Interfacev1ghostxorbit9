"use client";

/**
 * SimAtelierHeritage.tsx — Atelier Video Heritage
 * Conference AI Playbook: 3 sessions d'entrevue structurees pour creer un Ghost Cognitif
 * a partir d'un expert de domaine. Le bot fait TOUT. L'entrepreneur parle.
 *
 * 6 stages: accueil → session1 → session2 → session3 → assemblage → resultat
 * Left 45%: Conference AI view (video + chat)
 * Right 55%: Progress tracker + extraction live
 */

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Mic,
  Video,
  CheckCircle2,
  Brain,
  Scissors,
  BookOpen,
  BarChart3,
  Play,
  Wrench,
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  Film,
  Monitor,
  Loader2,
  ChevronRight,
  Trophy,
  Quote,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

const UB_BLUE = "#073E5A";

type Stage = "accueil" | "session1" | "session2" | "session3" | "assemblage" | "resultat";

const STAGE_ORDER: Stage[] = ["accueil", "session1", "session2", "session3", "assemblage", "resultat"];

// ========== SESSION COLORS ==========
const SESSION_COLORS = {
  1: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", bar: "from-blue-400 to-blue-600", light: "bg-blue-100" },
  2: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", bar: "from-amber-400 to-amber-600", light: "bg-amber-100" },
  3: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", bar: "from-emerald-400 to-emerald-600", light: "bg-emerald-100" },
};

// ========== CHAT MESSAGES PER SESSION ==========
interface ChatMsg {
  from: "bot" | "user";
  text: string;
  label?: string;
  botCode?: string;
}

const SESSION1_MSGS: ChatMsg[] = [
  { from: "bot", text: "Parle-moi de ton parcours. Comment t'as commence?", label: "C", botCode: "CEOB" },
  { from: "user", text: "J'ai commence en 1998 avec un petit atelier de soudure dans le sous-sol de mon beau-pere..." },
  { from: "bot", text: "C'est quoi ton plus gros echec? Qu'est-ce que t'en as tire?", label: "R", botCode: "CEOB" },
  { from: "user", text: "En 2008, j'ai perdu un contrat de 2M$. J'ai appris que la diversification c'est pas un luxe, c'est une survie." },
  { from: "bot", text: "Si t'avais 3 conseils pour un gars qui part de zero?", label: "E", botCode: "CEOB" },
  { from: "bot", text: "Donne-moi un exemple concret, une situation reelle.", label: "D", botCode: "CEOB" },
  { from: "user", text: "Un client m'a appele un vendredi soir, sa ligne de production etait arretee. J'ai roule 3 heures pour aller reparer moi-meme." },
  { from: "bot", text: "C'est quoi ta vision pour les 5 prochaines annees?", label: "O", botCode: "CEOB" },
  { from: "user", text: "Automatiser 80% de la production d'ici 2030. Garder le monde, mais les former sur les robots." },
];

const SESSION2_MSGS: ChatMsg[] = [
  { from: "bot", text: "Explique-moi ton processus de production de A a Z.", botCode: "CPOB" },
  { from: "user", text: "On recoit le metal brut, on le coupe au laser, pliage CNC, soudure robotisee, peinture poudre, assemblage final..." },
  { from: "bot", text: "Quand ca plante, c'est quoi tes 3 premiers reflexes?", botCode: "CPOB" },
  { from: "user", text: "Premierement, j'arrete la ligne. Deuxiemement, je descends sur le plancher moi-meme. Troisiemement, je check le scrap rate." },
  { from: "bot", text: "C'est quoi les raccourcis que personne connait dans ton industrie?", botCode: "CPOB" },
  { from: "user", text: "Le secret c'est le setup time. Un bon operateur fait ses changements en 12 minutes, un moyen en 45. Tout est la." },
];

const SESSION3_MSGS: ChatMsg[] = [
  { from: "bot", text: "Un client veut 30% de rabais ou il part. Tu fais quoi?", botCode: "CEOB" },
  { from: "user", text: "Jamais. Je lui montre plutot la valeur. Si il veut du cheap, y'a des shops en Chine pour ca." },
  { from: "bot", text: "Ton meilleur employe demissionne lundi. Ta premiere action?", botCode: "CEOB" },
  { from: "user", text: "Je l'appelle dans l'heure. Pas par texto, en personne. 9 fois sur 10, c'est pas l'argent le probleme." },
  { from: "bot", text: "T'as 500K$ a investir. Tu mets ca ou?", botCode: "CEOB" },
  { from: "user", text: "40% en equipements, 30% en formation, 30% en R&D. La formation c'est toujours le meilleur ROI." },
];

// ========== EXTRACTION DATA PER SESSION ==========
interface ExtractionItem {
  icon: "check" | "loading";
  label: string;
  value: string;
}

const SESSION1_EXTRACTIONS: ExtractionItem[] = [
  { icon: "check", label: "Valeurs identifiees", value: "Perseverance, Integrite, Innovation" },
  { icon: "check", label: "Style de leadership", value: "Direct, terrain, hands-on" },
  { icon: "check", label: "Vision", value: "Automatiser 80% de la production d'ici 2030" },
  { icon: "loading", label: "Analyse du ton", value: "Confiant, passionne, quebecois authentique" },
];

const SESSION2_EXTRACTIONS: ExtractionItem[] = [
  { icon: "check", label: "Expertise", value: "Soudure robotisee, Lean 6-sigma, gestion d'inventaire JIT" },
  { icon: "check", label: "Raccourcis metier", value: "7 raccourcis identifies" },
  { icon: "check", label: "Signaux d'alerte", value: "Quand le scrap rate depasse 3%..." },
  { icon: "loading", label: "Mapping des competences", value: "23 competences en cours d'analyse..." },
];

const SESSION3_EXTRACTIONS: ExtractionItem[] = [
  { icon: "check", label: "Arbre decisionnel", value: "12 scenarios captures" },
  { icon: "check", label: "Pattern de negociation", value: "Valeur d'abord, prix ensuite" },
  { icon: "check", label: "Reflexe sous pression", value: "Action immediate, pas de panique" },
  { icon: "check", label: "Allocation ressources", value: "Conservative, focus production" },
];

// ========== ASSEMBLAGE STEPS ==========
interface AssemblyStep {
  icon: typeof Brain;
  label: string;
  result: string;
  detail: string;
  duration: number;
}

const ASSEMBLY_STEPS: AssemblyStep[] = [
  { icon: Brain, label: "Assemblage du Ghost Cognitif...", result: "Ghost 'Jean-Pierre Tremblay' cree!", detail: "Personnalite + 12 scenarios + 23 competences", duration: 2000 },
  { icon: Film, label: "Montage Video Heritage...", result: "Video HD — 2h15, 3 chapitres", detail: "Intro + Parcours + Expertise + Vision", duration: 1500 },
  { icon: Scissors, label: "Decoupe des clips podcast...", result: "10 clips de 60 sec", detail: "Optimises pour LinkedIn, YouTube Shorts, TikTok", duration: 1500 },
  { icon: BookOpen, label: "Generation du livre numerique...", result: "PDF — 'Les Lecons de Jean-Pierre' — 87 pages", detail: "Chapitres auto-generes depuis les 3 sessions", duration: 1500 },
  { icon: BarChart3, label: "Activation du dashboard royautes...", result: "Dashboard LIVE!", detail: "Revenus, abonnements, metriques temps reel", duration: 1000 },
];

// ========== DELIVERABLES FOR ACCUEIL ==========
const DELIVERABLES = [
  { icon: Brain, label: "Ghost Cognitif", desc: "Votre double IA" },
  { icon: Film, label: "Video Heritage", desc: "2h+ montee" },
  { icon: Scissors, label: "Clips Podcast", desc: "10 extraits 60s" },
  { icon: BookOpen, label: "Livre Numerique", desc: "PDF auto-genere" },
  { icon: BarChart3, label: "Dashboard", desc: "Revenus temps reel" },
];

// ========== MAIN COMPONENT ==========

export function SimAtelierHeritage({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("accueil");
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [visibleExtracts, setVisibleExtracts] = useState(0);
  const [assemblyStep, setAssemblyStep] = useState(-1);
  const [assemblyDone, setAssemblyDone] = useState<number[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  // Progress messages on stage change
  useEffect(() => {
    setVisibleMsgs(0);
    setVisibleExtracts(0);
    if (stage === "assemblage") {
      setAssemblyStep(0);
      setAssemblyDone([]);
    }
  }, [stage]);

  // Auto-advance chat messages
  useEffect(() => {
    if (stage !== "session1" && stage !== "session2" && stage !== "session3") return;
    const msgs = stage === "session1" ? SESSION1_MSGS : stage === "session2" ? SESSION2_MSGS : SESSION3_MSGS;
    if (visibleMsgs >= msgs.length) return;
    const delay = msgs[visibleMsgs]?.from === "user" ? 2200 : 1800;
    const t = setTimeout(() => setVisibleMsgs((p) => p + 1), delay);
    return () => clearTimeout(t);
  }, [stage, visibleMsgs]);

  // Auto-advance extraction items
  useEffect(() => {
    if (stage !== "session1" && stage !== "session2" && stage !== "session3") return;
    const extracts = stage === "session1" ? SESSION1_EXTRACTIONS : stage === "session2" ? SESSION2_EXTRACTIONS : SESSION3_EXTRACTIONS;
    if (visibleExtracts >= extracts.length) return;
    const delay = 2500 + Math.random() * 1000;
    const t = setTimeout(() => setVisibleExtracts((p) => p + 1), delay);
    return () => clearTimeout(t);
  }, [stage, visibleExtracts]);

  // Assembly auto-advance
  useEffect(() => {
    if (stage !== "assemblage" || assemblyStep < 0) return;
    if (assemblyStep >= ASSEMBLY_STEPS.length) return;
    const t = setTimeout(() => {
      setAssemblyDone((p) => [...p, assemblyStep]);
      setAssemblyStep((p) => p + 1);
    }, ASSEMBLY_STEPS[assemblyStep].duration);
    return () => clearTimeout(t);
  }, [stage, assemblyStep]);

  // Auto scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [visibleMsgs]);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const sessionNum = stage === "session1" ? 1 : stage === "session2" ? 2 : stage === "session3" ? 3 : 0;

  const progressPercent =
    stage === "accueil" ? 0 :
    stage === "session1" ? 20 :
    stage === "session2" ? 45 :
    stage === "session3" ? 70 :
    stage === "assemblage" ? 90 :
    100;

  const reset = () => { setStage("accueil"); setVisibleMsgs(0); setVisibleExtracts(0); setAssemblyStep(-1); setAssemblyDone([]); };

  // ========== SUB COMPONENTS ==========

  function TopBar() {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Atelier Video Heritage</h1>
            <p className="text-[11px] text-gray-400">Conference AI Playbook — Creation de Ghost Cognitif</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md flex items-center gap-1 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Recommencer
          </button>
          {/* Progress bar */}
          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-400 font-medium">{progressPercent}%</span>
        </div>
      </div>
    );
  }

  function SessionTabs() {
    const tabs = [
      { id: "accueil" as Stage, label: "Accueil" },
      { id: "session1" as Stage, label: "Session 1", num: 1 },
      { id: "session2" as Stage, label: "Session 2", num: 2 },
      { id: "session3" as Stage, label: "Session 3", num: 3 },
      { id: "assemblage" as Stage, label: "Assemblage" },
      { id: "resultat" as Stage, label: "Resultat" },
    ];
    return (
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-gray-50/50">
        {tabs.map((t) => {
          const isActive = stage === t.id;
          const isPast = STAGE_ORDER.indexOf(t.id) < stageIndex;
          return (
            <button
              key={t.id}
              onClick={() => isPast && setStage(t.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                isActive ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                isPast && !isActive && "text-emerald-600",
              )}
            >
              {isPast && !isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
              {t.num && !isPast && <span className={cn("w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold",
                isActive ? "bg-white/20 text-white" : `${SESSION_COLORS[t.num as 1|2|3]?.light} ${SESSION_COLORS[t.num as 1|2|3]?.text}`
              )}>{t.num}</span>}
              {t.label}
            </button>
          );
        })}
      </div>
    );
  }

  // ========== PULSE AVATAR ==========
  function PulseAvatar({ code, speaking }: { code: string; speaking: boolean }) {
    return (
      <div className="relative">
        {speaking && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: UB_BLUE }} />
        )}
        <BotAvatar code={code} size="lg" />
        {speaking && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
    );
  }

  // ========== CHAT BUBBLE ==========
  function ChatBubble({ msg, animate }: { msg: ChatMsg; animate: boolean }) {
    if (msg.from === "user") {
      return (
        <div className="flex justify-end">
          <div className="bg-gray-100 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
            {animate ? (
              <TypewriterText text={msg.text} speed={10} className="text-sm text-gray-700" />
            ) : (
              <p className="text-sm text-gray-700">{msg.text}</p>
            )}
          </div>
        </div>
      );
    }
    const botColor = msg.botCode ? BOT_COLORS[msg.botCode] : null;
    return (
      <div className="flex gap-2">
        {msg.botCode && <BotAvatar code={msg.botCode} size="sm" />}
        <div className={cn("rounded-xl rounded-tl-none px-3 py-2 max-w-[80%] border", botColor ? `border-l-2 ${botColor.border} bg-white` : "bg-white border-gray-200")}>
          {msg.label && (
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-1">{msg.label}</span>
          )}
          {animate ? (
            <TypewriterText text={msg.text} speed={10} className="text-sm text-gray-800" />
          ) : (
            <span className="text-sm text-gray-800">{msg.text}</span>
          )}
        </div>
      </div>
    );
  }

  // ========== ACCUEIL ==========
  function StageAccueil() {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <BotAvatar code="CEOB" size="lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <Mic className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Atelier Video Heritage</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            En 3 sessions de 45 minutes, on va capturer votre expertise et creer votre Ghost Cognitif. Le bot fait tout. Vous, vous parlez.
          </p>
        </div>

        {/* 3 Session Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-2xl mx-auto">
          {[
            { num: 1, icon: Mic, title: "Ton Histoire", time: "45 min", host: "CarlOS", desc: "Parcours, valeurs, vision" },
            { num: 2, icon: Wrench, title: "Ton Metier", time: "45 min", host: "Paco (CPO)", desc: "Processus, raccourcis, expertise" },
            { num: 3, icon: Target, title: "Tes Patterns", time: "45 min", host: "CarlOS", desc: "Scenarios, decisions, reflexes" },
          ].map((s) => (
            <div key={s.num} className={cn("border rounded-xl p-4 text-center transition-all hover:shadow-md", SESSION_COLORS[s.num as 1|2|3].bg, SESSION_COLORS[s.num as 1|2|3].border)}>
              <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center", SESSION_COLORS[s.num as 1|2|3].light)}>
                <s.icon className={cn("h-5 w-5", SESSION_COLORS[s.num as 1|2|3].text)} />
              </div>
              <div className={cn("text-xs font-bold mb-0.5", SESSION_COLORS[s.num as 1|2|3].text)}>Session {s.num}</div>
              <div className="text-sm font-semibold text-gray-900 mb-0.5">{s.title}</div>
              <div className="text-[11px] text-gray-500">{s.time} — anime par {s.host}</div>
              <div className="text-[11px] text-gray-400 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Deliverables */}
        <div className="bg-gray-50 border rounded-xl p-4 mb-6 max-w-2xl mx-auto">
          <div className="text-xs font-semibold text-gray-700 mb-3">Ce que vous recevrez :</div>
          <div className="flex items-center justify-around">
            {DELIVERABLES.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <d.icon className="h-5 w-5 text-gray-700" />
                </div>
                <span className="text-[11px] font-medium text-gray-800">{d.label}</span>
                <span className="text-[11px] text-gray-400">{d.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => setStage("session1")}
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            style={{ background: `linear-gradient(135deg, ${UB_BLUE}, #0d5a80)` }}
          >
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Commencer la Session 1
            </span>
          </button>
          <p className="text-[11px] text-gray-400 mt-2">Duree totale estimee : 2h15</p>
        </div>
      </div>
    );
  }

  // ========== SESSION VIEW (1, 2, 3) ==========
  function StageSession() {
    const msgs = sessionNum === 1 ? SESSION1_MSGS : sessionNum === 2 ? SESSION2_MSGS : SESSION3_MSGS;
    const extracts = sessionNum === 1 ? SESSION1_EXTRACTIONS : sessionNum === 2 ? SESSION2_EXTRACTIONS : SESSION3_EXTRACTIONS;
    const colors = SESSION_COLORS[sessionNum as 1|2|3];
    const activeBotCode = sessionNum === 2 ? "CPOB" : "CEOB";
    const activeBotName = sessionNum === 2 ? "Paco (CPO)" : "CarlOS (CEO)";
    const sessionTitle = sessionNum === 1 ? "Ton Histoire" : sessionNum === 2 ? "Ton Metier" : "Tes Patterns de Decision";
    const sessionPct = sessionNum === 1 ? 67 : sessionNum === 2 ? 82 : 95;
    const nextStage: Stage = sessionNum === 1 ? "session2" : sessionNum === 2 ? "session3" : "assemblage";
    const nextLabel = sessionNum === 3 ? "Finaliser le Ghost" : `Passer a la Session ${sessionNum + 1}`;

    return (
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Conference View (45%) */}
        <div className="w-[45%] flex flex-col border-r">
          {/* Video header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: UB_BLUE }}>
            <div className="flex items-center gap-3">
              <PulseAvatar code={activeBotCode} speaking={visibleMsgs < msgs.length} />
              <div>
                <div className="text-white text-sm font-semibold">{activeBotName}</div>
                <div className="text-blue-200 text-[11px]">Session {sessionNum} — {sessionTitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-300 text-[11px] font-medium">LIVE</span>
            </div>
          </div>

          {/* Chat */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/30">
            {msgs.slice(0, visibleMsgs).map((msg, i) => (
              <ChatBubble key={i} msg={msg} animate={i === visibleMsgs - 1} />
            ))}
            {visibleMsgs < msgs.length && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{msgs[visibleMsgs]?.from === "bot" ? activeBotName + " prepare sa question..." : "L'expert repond..."}</span>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className={cn("px-4 py-2.5 border-t flex items-center justify-between", colors.bg)}>
            <div className="flex items-center gap-2">
              <Mic className={cn("h-4 w-4", colors.text)} />
              <span className={cn("text-xs font-medium", colors.text)}>Microphone actif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Video className={cn("h-3.5 w-3.5", colors.text)} />
              <span className={cn("text-[11px]", colors.text)}>Camera ON</span>
            </div>
          </div>
        </div>

        {/* RIGHT — Extraction Panel (55%) */}
        <div className="w-[55%] flex flex-col bg-white">
          {/* Extraction header */}
          <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold text-gray-900">Extraction en temps reel — Gemini 2.0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("flex-1 h-2 rounded-full overflow-hidden", colors.light)}>
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", colors.bar)}
                  style={{ width: `${Math.min(100, (visibleExtracts / extracts.length) * sessionPct + 15)}%` }}
                />
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                Session {sessionNum} — {Math.min(sessionPct, Math.round((visibleExtracts / extracts.length) * sessionPct + 15))}%
              </span>
            </div>
          </div>

          {/* Extraction items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {extracts.slice(0, visibleExtracts).map((ext, i) => (
              <div
                key={i}
                className="border rounded-lg p-3 bg-white shadow-sm animate-in slide-in-from-right duration-500"
              >
                <div className="flex items-start gap-2">
                  {ext.icon === "check" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-amber-500 animate-spin mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-gray-700">{ext.label}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{ext.value}</div>
                  </div>
                </div>
              </div>
            ))}
            {visibleExtracts < extracts.length && visibleMsgs > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 px-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Analyse en cours...</span>
              </div>
            )}

            {/* Session summary when all extractions done */}
            {visibleExtracts >= extracts.length && (
              <div className={cn("border-2 rounded-xl p-4 mt-4", colors.border, colors.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className={cn("h-5 w-5", colors.text)} />
                  <span className={cn("text-sm font-bold", colors.text)}>Session {sessionNum} completee</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {sessionNum === 1 && "Histoire, valeurs et vision capturees avec succes."}
                  {sessionNum === 2 && "Expertise technique et raccourcis metier extraits."}
                  {sessionNum === 3 && "Patterns decisionnels et scenarios mappes."}
                </p>
                <button
                  onClick={() => setStage(nextStage)}
                  className="w-full py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${UB_BLUE}, #0d5a80)` }}
                >
                  {nextLabel} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Global progress sidebar */}
          <div className="px-4 py-3 border-t bg-gray-50/50">
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
              <span>Progression globale</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((n) => {
                const done = sessionNum > n || stage === "assemblage" || stage === "resultat";
                const active = sessionNum === n;
                return (
                  <div key={n} className="flex-1">
                    <div className={cn("h-1.5 rounded-full", done ? "bg-emerald-400" : active ? "bg-amber-400" : "bg-gray-200")} />
                    <div className={cn("text-[11px] text-center mt-0.5", done ? "text-emerald-600" : active ? "text-amber-600" : "text-gray-400")}>
                      S{n}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== ASSEMBLAGE ==========
  function StageAssemblage() {
    const allDone = assemblyDone.length >= ASSEMBLY_STEPS.length;

    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-300">
              <Zap className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Assemblage Automatique</h2>
            <p className="text-sm text-gray-500">Les 3 sessions sont analysees. Creation des 5 livrables en cours...</p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {ASSEMBLY_STEPS.map((step, i) => {
              const isDone = assemblyDone.includes(i);
              const isActive = assemblyStep === i && !isDone;
              const isPending = assemblyStep < i;
              const Icon = step.icon;

              return (
                <div
                  key={i}
                  className={cn(
                    "border rounded-xl p-4 transition-all duration-500",
                    isDone && "border-emerald-300 bg-emerald-50/50",
                    isActive && "border-amber-300 bg-amber-50/30 shadow-md",
                    isPending && "border-gray-200 bg-gray-50/30 opacity-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isDone && "bg-emerald-100",
                      isActive && "bg-amber-100",
                      isPending && "bg-gray-100",
                    )}>
                      {isActive ? (
                        <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                      ) : isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Icon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "text-sm font-semibold",
                        isDone ? "text-emerald-800" : isActive ? "text-amber-800" : "text-gray-500",
                      )}>
                        {isDone ? step.result : step.label}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{step.detail}</div>
                    </div>
                    {isDone && <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Termine</span>}
                  </div>

                  {/* Mini preview for completed steps */}
                  {isDone && i === 0 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow">JPT</div>
                      <div>
                        <div className="text-xs font-medium text-gray-700">Jean-Pierre Tremblay</div>
                        <div className="text-[11px] text-gray-500">Expert en fabrication metallique | 26 ans d'experience</div>
                      </div>
                    </div>
                  )}
                  {isDone && i === 1 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <div className="w-full h-16 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
                        <Play className="h-6 w-6 text-white relative z-10 opacity-80" />
                        <span className="text-white/60 text-[11px] absolute bottom-1 right-2 z-10">2:15:34</span>
                      </div>
                    </div>
                  )}
                  {isDone && i === 2 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 flex gap-2">
                      {["Le secret du setup time", "Jamais de rabais", "Mon plus gros echec"].map((t, j) => (
                        <div key={j} className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
                          <div className="w-full h-8 bg-gray-800 rounded mb-1 flex items-center justify-center">
                            <Play className="h-3.5 w-3.5 text-white/70" />
                          </div>
                          <span className="text-[11px] text-gray-600 leading-tight">{t}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {isDone && i === 3 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center gap-3">
                      <div className="w-14 h-18 bg-gradient-to-b from-amber-100 to-white border border-amber-200 rounded-md flex flex-col items-center justify-center p-1 shadow-sm">
                        <BookOpen className="h-4 w-4 text-amber-700 mb-0.5" />
                        <span className="text-[9px] text-amber-800 font-medium text-center leading-tight">Les Lecons de J-P</span>
                      </div>
                      <div className="text-[11px] text-gray-600">87 pages, 8 chapitres, index automatique</div>
                    </div>
                  )}
                  {isDone && i === 4 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Abonnes", val: "0", sub: "Lancement" },
                        { label: "Revenus", val: "0$", sub: "Mois 1" },
                        { label: "Score", val: "94%", sub: "Qualite" },
                      ].map((m, j) => (
                        <div key={j} className="bg-gray-50 rounded-lg p-2">
                          <div className="text-xs font-bold text-gray-800">{m.val}</div>
                          <div className="text-[11px] text-gray-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final CTA */}
          {allDone && (
            <div className="mt-6 text-center animate-in fade-in duration-700">
              <button
                onClick={() => setStage("resultat")}
                className="px-8 py-3 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-amber-500 to-amber-600"
              >
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Voir le resultat final
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== RESULTAT FINAL ==========
  function StageResultat() {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Ghost Card */}
          <div className="border-2 border-amber-300 rounded-2xl p-6 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 shadow-lg relative overflow-hidden mb-6">
            {/* Subtle glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-100/40 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  JPT
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Ghost Cognitif cree avec succes!</h2>
                  <div className="text-sm text-gray-600">Jean-Pierre Tremblay — Expert Fabrication Metallique</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      <Trophy className="h-3.5 w-3.5" /> Fondateur
                    </span>
                    <span className="text-[11px] text-gray-400">Publie dans le Playbook Store</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { icon: Clock, label: "Temps investi", value: "2h15" },
                  { icon: Target, label: "Scenarios", value: "12" },
                  { icon: Brain, label: "Competences", value: "23" },
                  { icon: Film, label: "Clips", value: "10" },
                  { icon: FileText, label: "Pages", value: "87" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/80 border border-amber-200/50 rounded-xl p-3 text-center">
                    <s.icon className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{s.value}</div>
                    <div className="text-[11px] text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue projections */}
          <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-900">Projections de revenus</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="text-[11px] text-emerald-600 font-medium">Mois 3</div>
                <div className="text-xl font-bold text-emerald-800">~15,000$/mois</div>
                <div className="h-1.5 bg-emerald-100 rounded-full mt-2">
                  <div className="h-full w-[20%] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="text-[11px] text-emerald-600 font-medium">Mois 12</div>
                <div className="text-xl font-bold text-emerald-800">~70,000$/mois</div>
                <div className="h-1.5 bg-emerald-100 rounded-full mt-2">
                  <div className="h-full w-[85%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-center">Base sur les performances des Ghosts similaires dans le Playbook Store</p>
          </div>

          {/* 5 deliverables grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[
              { icon: Brain, label: "Ghost", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
              { icon: Film, label: "Video 2h15", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
              { icon: Scissors, label: "10 Clips", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
              { icon: BookOpen, label: "Livre 87p", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
              { icon: BarChart3, label: "Dashboard", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            ].map((d, i) => (
              <div key={i} className={cn("rounded-xl p-3 text-center border", d.bg, d.border)}>
                <d.icon className={cn("h-5 w-5 mx-auto mb-1", d.color)} />
                <div className="text-[11px] font-medium text-gray-700">{d.label}</div>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto mt-1" />
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-gray-50 border rounded-xl p-4 mb-6 text-center">
            <Quote className="h-5 w-5 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-700 italic mb-2">
              "3 heures de mon temps. Le reste est automatique. Mon expertise va continuer a aider du monde meme quand je serai a la retraite."
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[9px] font-bold">JP</div>
              <span className="text-xs text-gray-500 font-medium">Jean-Pierre T., Fondateur — Soudure JP Inc.</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${UB_BLUE}, #0d5a80)` }}
            >
              <Monitor className="h-4 w-4" /> Voir Mon Ghost dans le Store
            </button>
            <button
              className="flex-1 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            >
              <BarChart3 className="h-4 w-4" /> Ouvrir le Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER ==========
  return (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border shadow-sm">
      <TopBar />
      <SessionTabs />

      {stage === "accueil" && <StageAccueil />}
      {(stage === "session1" || stage === "session2" || stage === "session3") && <StageSession />}
      {stage === "assemblage" && <StageAssemblage />}
      {stage === "resultat" && <StageResultat />}
    </div>
  );
}
