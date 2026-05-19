/**
 * WorkspaceReflexionHub.tsx — Hub Reflexion & Creativite
 *
 * Composant workspace pour la phase Reflexion.
 * Remplace les modes/techniques dans la sidebar par un hub visuel riche.
 *
 * Structure:
 * 1. Hero banner compact (gradient orange)
 * 2. TopicSelector — sujet intelligent extrait des messages
 * 3. ModeGrid — 8 cards modes reflexion (staggered animation)
 * 4. TechniqueGrid — 8 cards techniques avec badges multi-step/one-shot
 * 5. Solo/Team dialog
 * 6. ActiveWorkspace — resultats avec animations
 */

import { useState, useCallback, useRef } from "react";
import {
  Sparkles, Users, User, ArrowLeft, Loader2,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { useAmorcer } from "../AmorcerContext";

// Reflexion tools — modes + techniques (DEJA EXISTANTS, pas recodes)
import {
  REFLEXION_TOOL_IDS,
  ALL_TECHNIQUES,
  TECHNIQUE_CONFIGS,
  TechniquePanel,
  parseContentSections,
} from "./reflexion-tools";

// Types
import type { ChatMessage } from "../../v2/api/types";

// ═══ Intelligence Layer — Conversation Analysis ═══

const GREETING_PATTERNS = /^(allo|bonjour|salut|hey|hi|hello|coucou|bonsoir|yo)\b/i;
const SHORT_ACK_PATTERNS = /^(ok|oui|non|d'accord|parfait|merci|cool|super|exact|c'est ca|ouais|yep|nope|nice)\s*[.!?]*$/i;

/** Check if a message is substantive (not a greeting or short ack) */
function isSubstantive(msg: ChatMessage): boolean {
  if (!msg.content || msg.content.length < 15) return false;
  if (GREETING_PATTERNS.test(msg.content.trim())) return false;
  if (SHORT_ACK_PATTERNS.test(msg.content.trim())) return false;
  return true;
}

/** Extract suggestion chips from recent user messages */
function extractRecentTopics(messages: ChatMessage[]): string[] {
  return messages
    .filter(m => m.role === "user" && isSubstantive(m))
    .slice(-5)
    .map(m => (m.content || "").length > 80 ? (m.content || "").slice(0, 77) + "..." : (m.content || ""))
    .reverse();
}

/**
 * Detect the central topic of the conversation.
 * Strategy: find the most substantive user message among recent ones.
 * Prefers messages that are question-like or problem-stating.
 */
function detectCentralTopic(messages: ChatMessage[]): string {
  const userMsgs = messages.filter(m => m.role === "user" && isSubstantive(m)).slice(-6);
  if (userMsgs.length === 0) return "";

  // Among the last 3 substantive messages, pick the most "topic-defining" one
  // (longest = most detail = most likely to state the real problem)
  const recent = userMsgs.slice(-3);
  const best = [...recent].sort((a, b) => (b.content || "").length - (a.content || "").length)[0];
  const text = best.content || "";
  return text.length > 150 ? text.slice(0, 147) + "..." : text;
}

/**
 * Extract structured context from conversation: tension + constraints + lastDirection.
 * CEO Review D3: Max 500 chars. No raw dump. Targeted extraction only.
 */
function extractStructuredContext(messages: ChatMessage[]): { tension: string; constraints: string[]; lastDirection: string } {
  const userMsgs = messages.filter(m => m.role === "user" && isSubstantive(m)).slice(-5);
  const botMsgs = messages.filter(m => m.role === "assistant" && isSubstantive(m)).slice(-3);

  // 1. Tension = the core problem/question (longest recent user message)
  let tension = "";
  if (userMsgs.length > 0) {
    const best = [...userMsgs].sort((a, b) => (b.content || "").length - (a.content || "").length)[0];
    tension = (best.content || "").length > 150 ? (best.content || "").slice(0, 147) + "..." : (best.content || "");
  }

  // 2. Constraints — scan for money/dates/numbers/obligations
  const constraints: string[] = [];
  const constraintPatterns = [
    /\d+[\s]?(?:k|\$|€|dollars?|budget)/gi,
    /(?:deadline|avant le|d'ici|pour le)\s+[\w\s\d]+/gi,
    /\d+\s*(?:personnes?|employes?|gens|manufacturiers?|entreprises?|clients?)/gi,
    /(?:il faut|on doit|objectif|contrainte|limite|maximum|minimum)[^.]{5,60}/gi,
  ];
  const allText = userMsgs.map(m => m.content || "").join(" ");
  for (const pat of constraintPatterns) {
    const matches = allText.match(pat);
    if (matches) {
      for (const m of matches.slice(0, 2)) {
        const clean = m.trim().replace(/\s+/g, " ");
        if (clean.length > 5 && !constraints.includes(clean)) constraints.push(clean);
      }
    }
  }

  // 3. Last direction — last bot's key sentence (first substantive sentence)
  let lastDirection = "";
  if (botMsgs.length > 0) {
    const lastBot = botMsgs[botMsgs.length - 1].content || "";
    const sentences = lastBot.split(/[.!?]\s+/).filter(s => s.length > 20);
    lastDirection = sentences[0] ? (sentences[0].length > 120 ? sentences[0].slice(0, 117) + "..." : sentences[0]) : "";
  }

  return { tension, constraints: constraints.slice(0, 4), lastDirection };
}

/** Build compact digest string from structured extraction. Max 500 chars. */
function buildConversationDigest(messages: ChatMessage[]): string {
  const { tension, constraints, lastDirection } = extractStructuredContext(messages);
  if (!tension && constraints.length === 0) return "";

  const parts: string[] = [];
  if (tension) parts.push(`TENSION: ${tension}`);
  if (constraints.length > 0) parts.push(`CONTRAINTES: ${constraints.join("; ")}`);
  if (lastDirection) parts.push(`DIRECTION: ${lastDirection}`);

  let result = parts.join("\n");
  if (result.length > 500) result = result.slice(0, 497) + "...";
  return result;
}

/**
 * Build a structured, context-aware prompt for a reflexion mode.
 * CEO Review D3: Extraction structured (tension + contraintes), max 500 chars injected.
 * No raw message dump — only signal, no noise.
 */
function buildIntelligentPrompt(
  promptFn: (ctx: string) => string,
  topic: string,
  context: string | null,
  messages: ChatMessage[],
): string {
  // 1. Determine the best topic
  const effectiveTopic = (topic && topic.length > 10 && !GREETING_PATTERNS.test(topic))
    ? topic
    : (context && context !== "Discussion en cours" && context.length > 10)
      ? context
      : detectCentralTopic(messages) || "la discussion en cours";

  // 2. Get the mode's base instruction with the smart topic
  const baseInstruction = promptFn(effectiveTopic);

  // 3. Build structured digest (max 500 chars — tension + constraints + direction)
  const digest = buildConversationDigest(messages);

  // 4. If no digest, just return the base instruction (first message scenario)
  if (!digest) return baseInstruction;

  // 5. Assemble — structured context prepended, not raw dump
  return `${digest}

${baseInstruction}`;
}

/**
 * Enrich any prompt (from TechniquePanel etc.) with conversation context.
 * Lighter version — prepends structured extraction (max 500 chars).
 */
function enrichPromptWithContext(prompt: string, messages: ChatMessage[]): string {
  const digest = buildConversationDigest(messages);
  if (!digest) return prompt;
  return `${digest}\n\n${prompt}`;
}

// ═══ Props ═══

interface WorkspaceReflexionHubProps {
  context: string | null;
  onSendMessage: (msg: string, botCode?: string) => void | Promise<void>;
  messages: ChatMessage[];
  activeBotCode: string;
  activeBotName: string;
}

type SelectedItem = {
  id: string;
  label: string;
  type: "mode" | "technique";
  prompt?: (ctx: string) => string;
  soloPrompt?: (ctx: string) => string;
  icon: React.ElementType;
  bg?: string;
  text?: string;
  color?: string;
};

export function WorkspaceReflexionHub({
  context,
  onSendMessage,
  messages,
  activeBotCode,
  activeBotName,
}: WorkspaceReflexionHubProps) {
  const { setReflexionContext } = useAmorcer();

  // State — auto-populate topic from context or intelligent detection
  const autoTopic = (context && context !== "Discussion en cours")
    ? context
    : detectCentralTopic(messages);
  const [topic, setTopic] = useState(autoTopic);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [launched, setLaunched] = useState(false);
  const [selectedTechniqueForPanel, setSelectedTechniqueForPanel] = useState<string | null>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);

  // Suggestions from chat
  const suggestions = extractRecentTopics(messages);

  // Update reflexionContext when topic changes
  const commitTopic = useCallback((t: string) => {
    setTopic(t);
    if (t && t !== "Discussion en cours") {
      setReflexionContext(t);
    }
  }, [setReflexionContext]);

  // Handle mode/technique selection
  const handleSelect = (item: SelectedItem) => {
    setSelectedItem(item);
    setSelectedTechniqueForPanel(null);
  };

  // Handle Solo launch — builds intelligent prompt with full conversation context
  const handleSolo = () => {
    if (!selectedItem) return;
    const promptFn = selectedItem.type === "mode"
      ? selectedItem.prompt
      : selectedItem.soloPrompt;
    if (!promptFn) return;

    const prompt = buildIntelligentPrompt(promptFn, topic, context, messages);
    onSendMessage(prompt, activeBotCode);
    setLaunched(true);
  };

  // Handle Team launch (not yet supported — launches solo)
  const handleTeam = () => {
    handleSolo();
  };

  // Handle technique with multi-step panel
  const handleTechniquePanel = (techId: string) => {
    setSelectedTechniqueForPanel(techId);
    setSelectedItem(null);
  };

  // Reset to hub
  const handleBack = () => {
    setSelectedItem(null);
    setSelectedTechniqueForPanel(null);
    setLaunched(false);
  };

  // Detect when bot is thinking (last message is from user)
  const isThinking = messages.length > 0 && messages[messages.length - 1]?.role === "user" && launched;

  // Latest bot response after launch
  const latestBotResponse = launched
    ? [...messages].reverse().find(m => m.role === "assistant")?.content
    : null;

  // ═══ TECHNIQUE PANEL VIEW ═══
  if (selectedTechniqueForPanel) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour au hub
        </button>
        <TechniquePanel
          techniqueId={selectedTechniqueForPanel}
          context={topic || (context && context !== "Discussion en cours" ? context : null) || detectCentralTopic(messages) || "le sujet en cours"}
          onSend={(prompt) => { onSendMessage(enrichPromptWithContext(prompt, messages), activeBotCode); setLaunched(true); }}
          onClose={handleBack}
        />
        {launched && (
          <ActiveResponseView
            isThinking={isThinking}
            response={latestBotResponse}
            modeId={selectedTechniqueForPanel}
          />
        )}
      </div>
    );
  }

  // ═══ SOLO/TEAM DIALOG ═══
  if (selectedItem && !launched) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour au hub
        </button>

        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
              selectedItem.type === "mode" ? selectedItem.bg : selectedItem.color
            )}>
              <selectedItem.icon className={cn("h-5 w-5",
                selectedItem.type === "mode" ? selectedItem.text : ""
              )} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{selectedItem.label}</h3>
              <p className="text-[10px] text-gray-500">
                {topic ? `Sujet: ${topic}` : "Choisissez un sujet ci-dessous"}
              </p>
            </div>
          </div>

          {/* Topic input if not set */}
          {!topic && (
            <div className="space-y-2">
              <input
                ref={topicInputRef}
                type="text"
                placeholder="Ex: comment augmenter nos ventes de 30%"
                className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value) commitTopic((e.target as HTMLInputElement).value); }}
                onChange={(e) => setTopic(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => commitTopic(s)}
                      className="px-2.5 py-1 text-[10px] bg-gray-100 text-gray-600 rounded-full hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors truncate max-w-[180px]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSolo}
              disabled={!topic}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer",
                topic
                  ? "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <User className="h-4 w-4" />
              {activeBotName} execute seul
            </button>
            <button
              onClick={handleTeam}
              disabled={!topic}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                topic
                  ? "border-orange-200 text-orange-700 hover:bg-orange-50"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Users className="h-4 w-4" />
              L'equipe travaille ensemble
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ ACTIVE WORKSPACE — post launch ═══
  if (launched) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Nouvelle reflexion
        </button>

        {selectedItem && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 border border-orange-200">
            <selectedItem.icon className={cn("h-4 w-4", selectedItem.type === "mode" ? selectedItem.text : "text-orange-600")} />
            <span className="text-[11px] font-bold text-orange-700">{selectedItem.label}</span>
            <span className="text-[9px] text-gray-500">— {topic}</span>
          </div>
        )}

        <ActiveResponseView
          isThinking={isThinking}
          response={latestBotResponse}
          modeId={selectedItem?.id}
        />
      </div>
    );
  }

  // ═══ MAIN HUB VIEW ═══
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* Hero banner compact */}
      <div className="relative w-full rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden flex items-center px-6 py-4 hover:shadow-md transition-all">
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-orange-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-amber-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />
        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900">Reflexion & Creativite</h2>
            <p className="text-[10px] text-gray-500">Explorez, challengez, innovez</p>
          </div>
        </div>
      </div>

      {/* TopicSelector */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Sur quel sujet veux-tu travailler?
        </label>
        <input
          ref={topicInputRef}
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onBlur={() => { if (topic) commitTopic(topic); }}
          onKeyDown={(e) => { if (e.key === "Enter" && topic) commitTopic(topic); }}
          placeholder="Ex: comment augmenter nos ventes de 30%"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
        />
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => commitTopic(s)}
                className="px-2.5 py-1 text-[10px] bg-gray-100 text-gray-600 rounded-full hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors truncate max-w-[180px]"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ModeGrid — 8 modes reflexion */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-1">
          Modes de reflexion
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {REFLEXION_TOOL_IDS.map((tool, i) => (
            <button
              key={tool.id}
              onClick={() => handleSelect({
                id: tool.id,
                label: tool.label,
                type: "mode",
                prompt: tool.prompt,
                icon: tool.icon,
                bg: tool.bg,
                text: tool.text,
              })}
              className={cn(
                "flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 bg-white",
                "hover:shadow-md hover:border-orange-200 cursor-pointer transition-all",
                "opacity-0 animate-[slideIn_0.4s_ease-out_forwards]"
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", tool.bg)}>
                <tool.icon className={cn("h-4 w-4", tool.text)} />
              </div>
              <span className="text-[10px] font-bold text-gray-700">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[9px] text-gray-400 font-medium">ou essaie une technique</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* TechniqueGrid — 8 techniques */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-1">
          Techniques
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {ALL_TECHNIQUES.map((tech, i) => {
            const hasSteps = !!TECHNIQUE_CONFIGS[tech.id];
            return (
              <button
                key={tech.id}
                onClick={() => {
                  if (hasSteps) {
                    handleTechniquePanel(tech.id);
                  } else {
                    handleSelect({
                      id: tech.id,
                      label: tech.label,
                      type: "technique",
                      soloPrompt: tech.soloPrompt,
                      icon: tech.icon,
                      color: tech.color,
                    });
                  }
                }}
                className={cn(
                  "flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-gray-200 bg-white relative",
                  "hover:shadow-md hover:border-orange-200 cursor-pointer transition-all",
                  "opacity-0 animate-[slideIn_0.4s_ease-out_forwards]"
                )}
                style={{ animationDelay: `${(i + 8) * 80}ms` }}
              >
                <span className={cn(
                  "absolute top-1.5 right-1.5 text-[7px] font-bold px-1.5 py-0.5 rounded-full",
                  hasSteps ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                )}>
                  {hasSteps ? "multi-step" : "one-shot"}
                </span>
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", tech.color)}>
                  <tech.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-700">{tech.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyframe definition */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ═══ ActiveResponseView — Rendus visuels par type de mode reflexion ═══

/** Parse debate-style content into Thèse/Antithèse/Synthèse sections */
function parseDebatSections(text: string): { these: string; antithese: string; synthese: string } | null {
  const theseMatch = text.match(/(?:TH[ÈE]SE|POUR|ARGUMENTS?\s+POUR)[^:]*[:]\s*([\s\S]*?)(?=(?:ANTITH[ÈE]SE|CONTRE|ARGUMENTS?\s+CONTRE|TESTS?\s+DE\s+FALSIFICATION))/i);
  const antiMatch = text.match(/(?:ANTITH[ÈE]SE|CONTRE|ARGUMENTS?\s+CONTRE|TESTS?\s+DE\s+FALSIFICATION)[^:]*[:]\s*([\s\S]*?)(?=(?:SYNTH[ÈE]SE|VERDICT|CONCLUSION))/i);
  const synthMatch = text.match(/(?:SYNTH[ÈE]SE|VERDICT|CONCLUSION)[^:]*[:]\s*([\s\S]*?)$/i);
  if (!theseMatch && !antiMatch) return null;
  return {
    these: (theseMatch?.[1] || "").trim(),
    antithese: (antiMatch?.[1] || "").trim(),
    synthese: (synthMatch?.[1] || "").trim(),
  };
}

/** Parse deep mode into progressive levels */
function parseDeepLevels(text: string): { title: string; body: string }[] {
  const levels: { title: string; body: string }[] = [];
  const patterns = [/NIVEAU\s+(?:SURFACE|1)[^:]*[:]\s*/i, /NIVEAU\s+(?:STRUCTURE|2)[^:]*[:]\s*/i, /NIVEAU\s+(?:MENTAL|3)[^:]*[:]\s*/i, /EFFETS[^:]*[:]\s*/i, /POINTS?\s+DE\s+LEVIER[^:]*[:]\s*/i, /INSIGHT\s+CL[ÉE][^:]*[:]\s*/i];
  const titles = ["Surface", "Structure", "Mental", "Effets 2e/3e ordre", "Points de levier", "Insight Cle"];
  for (let i = 0; i < patterns.length; i++) {
    const startMatch = text.match(patterns[i]);
    if (!startMatch) continue;
    const startIdx = (startMatch.index || 0) + startMatch[0].length;
    const nextPattern = patterns[i + 1];
    let endIdx = text.length;
    if (nextPattern) {
      const nextMatch = text.slice(startIdx).match(nextPattern);
      if (nextMatch && nextMatch.index !== undefined) endIdx = startIdx + nextMatch.index;
    }
    levels.push({ title: titles[i], body: text.slice(startIdx, endIdx).trim() });
  }
  return levels;
}

function ActiveResponseView({ isThinking, response, modeId }: {
  isThinking: boolean;
  response: string | null | undefined;
  modeId?: string;
}) {
  if (isThinking) {
    return (
      <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-orange-700">Reflexion en cours...</p>
            <div className="flex gap-3 mt-1.5">
              {["Analyse du contexte", "Generation d'insights", "Synthese"].map((step, j) => (
                <span key={j} className="text-[10px] text-gray-400">{step}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/30 p-6 text-center">
        <Sparkles className="h-6 w-6 text-orange-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Les resultats apparaitront ici...</p>
      </div>
    );
  }

  // ═══ Brainstorm — Sticky notes grid 2 cols, rotation ±1.5deg ═══
  if (modeId === "brainstorm") {
    const sections = parseContentSections(response);
    if (sections.length > 1) {
      const stickyColors = ["bg-yellow-100", "bg-pink-100", "bg-blue-100", "bg-green-100", "bg-purple-100"];
      // Separate top 3 if last section mentions "top" or "priorit"
      const top3Idx = sections.findIndex(s => /top\s*3|priorit|class[ée]/i.test(s.title));
      const ideas = top3Idx > 0 ? sections.slice(0, top3Idx) : sections;
      const top3 = top3Idx > 0 ? sections.slice(top3Idx) : [];

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {ideas.map((sec, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-lg shadow-sm border border-gray-200",
                  stickyColors[i % stickyColors.length],
                  "opacity-0 animate-[slideIn_0.4s_ease-out_forwards]"
                )}
                style={{
                  animationDelay: `${i * 150}ms`,
                  transform: `rotate(${(i % 2 === 0 ? -1.5 : 1.5)}deg)`,
                }}
              >
                {sec.title && (
                  <p className="text-xs font-bold text-gray-800 mb-1">{sec.title}</p>
                )}
                <p className="text-xs text-gray-700 leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </div>
          {top3.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${ideas.length * 150 + 200}ms` }}>
              <p className="text-xs font-bold text-amber-800 mb-2">TOP 3 PRIORISE</p>
              {top3.map((sec, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  {sec.title && <p className="text-xs font-bold text-gray-800">{sec.title}</p>}
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  // ═══ Debat — These/Antithese/Synthese structured view ═══
  if (modeId === "debat") {
    const debat = parseDebatSections(response);
    if (debat) {
      return (
        <div className="space-y-3">
          {/* These */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 border-l-[4px] border-l-blue-400 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]">
            <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wider">These (Pour)</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{debat.these}</p>
          </div>
          {/* Antithese */}
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 border-l-[4px] border-l-red-400 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]" style={{ animationDelay: "150ms" }}>
            <p className="text-xs font-bold text-red-800 mb-2 uppercase tracking-wider">Antithese (Tests de falsification)</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{debat.antithese}</p>
          </div>
          {/* Synthese */}
          {debat.synthese && (
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 border-l-[4px] border-l-green-500 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]" style={{ animationDelay: "300ms" }}>
              <p className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wider">Synthese</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{debat.synthese}</p>
            </div>
          )}
        </div>
      );
    }
  }

  // ═══ Analyse — Numbered sections with progression badges ═══
  if (modeId === "analyse") {
    const sections = parseContentSections(response);
    if (sections.length > 1) {
      // Check if last section is a verdict
      const verdictIdx = sections.findIndex(s => /verdict|conclusion/i.test(s.title));
      const mainSections = verdictIdx > 0 ? sections.slice(0, verdictIdx) : sections;
      const verdict = verdictIdx > 0 ? sections[verdictIdx] : null;
      return (
        <div className="space-y-3">
          {mainSections.map((sec, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                {sec.title && <p className="text-xs font-bold text-gray-800">{sec.title}</p>}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{sec.body}</p>
            </div>
          ))}
          {verdict && (
            <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${mainSections.length * 120 + 100}ms` }}>
              <p className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Verdict</p>
              <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">{verdict.body || verdict.title}</p>
            </div>
          )}
        </div>
      );
    }
  }

  // ═══ Strategie — Timeline vertical 5 levels ═══
  if (modeId === "strategie") {
    const sections = parseContentSections(response);
    if (sections.length > 1) {
      const colors = ["bg-purple-100 text-purple-700", "bg-indigo-100 text-indigo-700", "bg-blue-100 text-blue-700", "bg-teal-100 text-teal-700", "bg-green-100 text-green-700"];
      return (
        <div className="space-y-0 relative">
          {/* Vertical connector line */}
          <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-green-300" />
          {sections.map((sec, i) => (
            <div key={i} className="flex items-start gap-3 pb-4 last:pb-0 opacity-0 animate-[slideIn_0.4s_ease-out_forwards] relative" style={{ animationDelay: `${i * 150}ms` }}>
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10 shadow-sm", colors[i % colors.length])}>{i + 1}</div>
              <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                {sec.title && <p className="text-xs font-bold text-gray-800 mb-1">{sec.title}</p>}
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{sec.body}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  // ═══ Innovation — Cards with feasibility gradient bars ═══
  if (modeId === "innovation") {
    const sections = parseContentSections(response);
    if (sections.length > 1) {
      return (
        <div className="space-y-3">
          {sections.map((sec, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {sec.title && (
                <p className="text-xs font-bold text-gray-800 mb-2">{sec.title}</p>
              )}
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{sec.body}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Faisabilite</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-orange-400 rounded-full transition-all"
                    style={{ width: `${55 + (i * 7) % 40}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  // ═══ Decision — Matrix + green recommendation ═══
  if (modeId === "decision") {
    const sections = parseContentSections(response);
    if (sections.length > 1) {
      // Find recommendation section
      const recoIdx = sections.findIndex(s => /recommandation|verdict|d[ée]cision/i.test(s.title));
      const mainSections = recoIdx > 0 ? sections.slice(0, recoIdx) : sections;
      const reco = recoIdx > 0 ? sections[recoIdx] : null;
      return (
        <div className="space-y-3">
          {mainSections.map((sec, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${i * 100}ms` }}>
              {sec.title && <p className="text-xs font-bold text-gray-800 mb-1">{sec.title}</p>}
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{sec.body}</p>
            </div>
          ))}
          {reco && (
            <div className="rounded-xl border-2 border-green-300 bg-green-50 p-5 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${mainSections.length * 100 + 150}ms` }}>
              <p className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wider">Recommandation</p>
              <p className="text-base text-green-900 leading-relaxed font-medium whitespace-pre-wrap">{reco.body || reco.title}</p>
            </div>
          )}
        </div>
      );
    }
  }

  // ═══ Crise — Timeline urgence with priority badges ═══
  if (modeId === "crise") {
    const sections = parseContentSections(response);
    if (sections.length > 1) {
      const urgencyColors = ["bg-red-100 border-red-300 text-red-800", "bg-orange-100 border-orange-300 text-orange-800", "bg-amber-100 border-amber-300 text-amber-800", "bg-yellow-100 border-yellow-300 text-yellow-800"];
      const badgeColors = ["bg-red-500 text-white", "bg-orange-500 text-white", "bg-amber-500 text-white", "bg-yellow-500 text-gray-800"];
      const badgeLabels = ["URGENT", "24H", "72H", "POST"];
      return (
        <div className="space-y-3">
          {sections.map((sec, i) => (
            <div key={i} className={cn("rounded-xl border p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]", urgencyColors[i % urgencyColors.length])} style={{ animationDelay: `${i * 120}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", badgeColors[i % badgeColors.length])}>{badgeLabels[i % badgeLabels.length]}</span>
                {sec.title && <p className="text-xs font-bold">{sec.title}</p>}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{sec.body}</p>
            </div>
          ))}
        </div>
      );
    }
  }

  // ═══ Deep — Progressive indentation levels + "Insight Cle" final ═══
  if (modeId === "deep") {
    const levels = parseDeepLevels(response);
    if (levels.length > 1) {
      return (
        <div className="space-y-2">
          {levels.map((lvl, i) => {
            const isInsight = /insight/i.test(lvl.title);
            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl border p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]",
                  isInsight
                    ? "border-2 border-indigo-300 bg-indigo-50"
                    : "border-gray-200 bg-white"
                )}
                style={{ animationDelay: `${i * 150}ms`, marginLeft: `${Math.min(i * 12, 48)}px` }}
              >
                <p className={cn("text-xs font-bold mb-1 uppercase tracking-wider", isInsight ? "text-indigo-800" : "text-indigo-600")}>{lvl.title}</p>
                <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", isInsight ? "text-indigo-900 font-medium" : "text-gray-700")}>{lvl.body}</p>
              </div>
            );
          })}
        </div>
      );
    }
  }

  // ═══ Default — sections parsed with fade-in ═══
  const sections = parseContentSections(response);
  if (sections.length > 1) {
    return (
      <div className="space-y-3">
        {sections.map((sec, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {sec.title && (
              <p className="text-xs font-bold text-gray-800 mb-1">{sec.title}</p>
            )}
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{sec.body}</p>
          </div>
        ))}
      </div>
    );
  }

  // Plain text fallback
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {response}
      </div>
    </div>
  );
}
