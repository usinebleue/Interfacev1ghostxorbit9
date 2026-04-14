/**
 * DiscussionWindow.tsx — Zone Discussion V3 (COPIE EXACTE sim-amorcer L568-716)
 * Zone centrale 500px — Header Brain Team + Chat par phase + Input bar
 * Architecture V3 — Zéro Destruction
 *
 * COPIE CHIRURGICALE du panel gauche de SimAmorcer:
 * - Header UB_BLUE h-12 avec "Brain Team" + avatars TEAM
 * - Chat par phase: ObservationChat, AttentionChat, ModerationChat, ReflexionChat, PlaceholderChat
 * - Input bar identique (textarea + attach menu + 3 modes + send)
 */

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Phone,
  Video,
  Glasses,
  Send,
  ChevronUp,
  Paperclip,
  Globe,
  Zap,
  Activity,
  Bot,
  Atom,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAmorcer } from "./AmorcerContext";
import { BotAvatar } from "../v2/zones/center/shared/simulation-components";

// ═══ V3 Core — source unique constantes ═══
import { PHASE_CONFIG, UB_BLUE } from "./core/phases";

// ═══ Simulation — chats demos (séparés du code cristallisé) ═══
import {
  TEAM,
  ObservationChat,
  ReflexionChat,
  AttentionChat,
  ModerationChat,
  PlaceholderChat,
} from "./simulation/sim-chat-map";

export function DiscussionWindow() {
  const {
    activePhase,
    chatStage,
    typed,
    setTyped,
    reflexionContext,
    cockpitTab,
    advance,
  } = useAmorcer();

  const chatRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const pc = PHASE_CONFIG[activePhase];
  const isOrbit9 = cockpitTab === "orbit9";
  const isDash = activePhase === "observation" || activePhase === "attention" || activePhase === "moderation";

  // Scroll to bottom on chat changes (copié de SimAmorcer L557)
  useEffect(() => {
    chatRef.current && (chatRef.current.scrollTop = chatRef.current.scrollHeight);
  }, [chatStage, typed]);

  return (
    <div className="h-full flex flex-col bg-white">

      {/* Header UB_BLUE h-12 — COPIE EXACTE SimAmorcer L572-606 */}
      <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
        {isOrbit9 ? (
          <>
            <Atom className="h-4 w-4 text-white" />
            <span className="text-[11px] text-white font-medium">Orbit<sup className="text-[8px]">9</sup></span>
            <div className="flex-1" />
          </>
        ) : (
          <>
            <Bot className="h-4 w-4 text-white" />
            <span className="text-[11px] text-white font-medium">Brain Team</span>
            <div className="flex-1" />
            <span className="text-[9px] text-white/50 font-medium mr-1">Cellules de travail</span>
            {TEAM.map(b => (
              <div key={b.code} className="flex items-center gap-1 ml-0.5">
                <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30">
                  <BotAvatar code={b.code} size="sm" />
                </div>
                <span className="text-[9px] text-white/70 hidden xl:inline">{b.name}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Discussion — scrollable, phase-specific */}
      <div ref={chatRef} className="flex-1 overflow-auto">
        <div className="p-3 space-y-3">
          {activePhase === "observation" && (
            <ObservationChat typed={typed} setTyped={setTyped} />
          )}
          {activePhase === "attention" && (
            <AttentionChat stage={chatStage} typed={typed} setTyped={setTyped} advance={advance} pc={pc} />
          )}
          {activePhase === "moderation" && (
            <ModerationChat stage={chatStage} typed={typed} setTyped={setTyped} advance={advance} pc={pc} />
          )}
          {activePhase === "reflexion" && (
            <ReflexionChat stage={chatStage} typed={typed} setTyped={setTyped} advance={advance} pc={pc} context={reflexionContext} />
          )}
          {!isDash && activePhase !== "reflexion" && (
            <PlaceholderChat phase={activePhase} />
          )}
        </div>
      </div>

      {/* Input box style Claude AI — COPIE EXACTE SimAmorcer L636-715 */}
      <div className="shrink-0 bg-white px-3 pb-2 pt-1">
        <div className="relative rounded-2xl border border-gray-300 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          {/* Textarea */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Parle à CarlOS..."
            className="w-full text-sm px-4 pt-3 pb-2 rounded-t-2xl border-0 focus:outline-none min-h-[70px] resize-none bg-transparent"
            rows={3}
          />
          {/* Barre de boutons intégrée en bas de la box */}
          <div className="flex items-center gap-1 px-2 pb-2">
            {/* Menu + (pièce jointe, Drive, GitHub, connecteurs) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Ajouter"
              >
                <Plus className="h-4 w-4" />
              </button>
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
                  <button type="button" onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-700">Pièce jointe</span>
                  </button>
                  <button type="button" onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                    <Globe className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-gray-700">Depuis Google Drive</span>
                  </button>
                  <button type="button" onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                    <Zap className="h-4 w-4 text-gray-700" />
                    <span className="text-xs text-gray-700">Depuis GitHub</span>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button type="button" onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <div>
                      <span className="text-xs text-gray-700">Connecteurs API</span>
                      <span className="block text-[9px] text-gray-400">Intégrez vos logiciels SaaS</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 3 modes: Discussion, Conférence, Vision */}
            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100" title="Discussion vocale">
              <Phone className="h-3.5 w-3.5" /><span className="hidden lg:inline">Discussion</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Conférence vidéo">
              <Video className="h-3.5 w-3.5" /><span className="hidden lg:inline">Conférence</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-cyan-50 text-cyan-600 hover:bg-cyan-100" title="Vision Ray-Ban">
              <Glasses className="h-3.5 w-3.5" /><span className="hidden lg:inline">Vision</span>
            </button>

            <div className="flex-1" />

            {/* Bouton Envoyer */}
            <button
              type="button"
              className={cn(
                "p-2 rounded-lg transition-all cursor-pointer",
                inputText.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "bg-gray-100 text-gray-300 cursor-default"
              )}
              title="Envoyer"
              disabled={!inputText.trim()}
            >
              {inputText.trim() ? <ChevronUp className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {/* Disclaimer */}
        <p className="text-center text-[9px] text-gray-400 mt-1.5">
          Brain Team est une équipe d&apos;agents IA et peut faire des erreurs. Veuillez vérifier les réponses.
        </p>
      </div>
    </div>
  );
}
