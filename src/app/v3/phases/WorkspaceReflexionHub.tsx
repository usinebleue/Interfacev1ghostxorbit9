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
  if (msg.content.length < 15) return false;
  if (GREETING_PATTERNS.test(msg.content.trim())) return false;
  if (SHORT_ACK_PATTERNS.test(msg.content.trim())) return false;
  return true;
}

/** Extract suggestion chips from recent user messages */
function extractRecentTopics(messages: ChatMessage[]): string[] {
  return messages
    .filter(m => m.role === "user" && isSubstantive(m))
    .slice(-5)
    .map(m => m.content.length > 80 ? m.content.slice(0, 77) + "..." : m.content)
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
  const best = [...recent].sort((a, b) => b.content.length - a.content.length)[0];
  const text = best.content;
  return text.length > 150 ? text.slice(0, 147) + "..." : text;
}

/**
 * Build a structured digest of the conversation.
 * Extracts the last 6-8 substantive exchanges, truncated for compactness.
 * User messages get more space (source of truth), bot messages are compressed.
 */
function buildConversationDigest(messages: ChatMessage[]): string {
  const substantive = messages.filter(m => isSubstantive(m)).slice(-8);
  if (substantive.length === 0) return "";

  const lines: string[] = [];
  for (const msg of substantive) {
    const role = msg.role === "user" ? "Utilisateur" : "Bot";
    // User messages: up to 250 chars (important context)
    // Bot messages: up to 150 chars (compress verbose responses)
    const maxLen = msg.role === "user" ? 250 : 150;
    const content = msg.content.length > maxLen
      ? msg.content.slice(0, maxLen - 3) + "..."
      : msg.content;
    // Clean up newlines for compact digest
    lines.push(`- ${role}: ${content.replace(/\n+/g, " ").trim()}`);
  }
  return lines.join("\n");
}

/**
 * Build a rich, context-aware prompt for a reflexion mode.
 * Wraps the mode's simple instruction with full conversation context.
 * This is the core intelligence: the bot receives the FULL picture.
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

  // 3. Build the conversation digest
  const digest = buildConversationDigest(messages);

  // 4. If no digest, just return the base instruction (first message scenario)
  if (!digest) return baseInstruction;

  // 5. Assemble the intelligent prompt
  return `CONTEXTE DE NOTRE DISCUSSION:
${digest}

SUJET CENTRAL: ${effectiveTopic}

${baseInstruction}

Base ta reflexion sur le contexte complet ci-dessus. Tiens compte de ce qui a ete dit, des preoccupations soulevees, et des pistes deja explorees.`;
}

/**
 * Enrich any prompt (from TechniquePanel etc.) with conversation context.
 * Lighter version — just prepends the digest without restructuring.
 */
function enrichPromptWithContext(prompt: string, messages: ChatMessage[]): string {
  const digest = buildConversationDigest(messages);
  if (!digest) return prompt;
  return `CONTEXTE DE NOTRE DISCUSSION:\n${digest}\n\n${prompt}\n\nTiens compte du contexte de la discussion ci-dessus.`;
}

// ═══ Props ═══

interface WorkspaceReflexionHubProps {
  context: string | null;
  onSendMessage: (msg: string, botCode?: string) => void;
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

// ═══ ActiveResponseView — Affiche la reponse du bot avec animations ═══

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
            <p className="text-[11px] font-bold text-orange-700">Reflexion en cours...</p>
            <div className="flex gap-3 mt-1.5">
              {["Analyse du contexte", "Generation d'insights", "Synthese"].map((step, j) => (
                <span key={j} className="text-[9px] text-gray-400">{step}</span>
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
        <p className="text-[11px] text-gray-500">Les resultats apparaitront ici...</p>
      </div>
    );
  }

  // Brainstorm mode — sticky notes
  if (modeId === "brainstorm") {
    const sections = parseContentSections(response);
    if (sections.length > 1) {
      const stickyColors = ["bg-yellow-100", "bg-pink-100", "bg-blue-100", "bg-green-100", "bg-purple-100"];
      return (
        <div className="grid grid-cols-2 gap-3">
          {sections.map((sec, i) => (
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
                <p className="text-[11px] font-bold text-gray-800 mb-1">{sec.title}</p>
              )}
              <p className="text-[10px] text-gray-700 leading-relaxed">{sec.body}</p>
            </div>
          ))}
        </div>
      );
    }
  }

  // Innovation mode — score bars
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
                <p className="text-[11px] font-bold text-gray-800 mb-2">{sec.title}</p>
              )}
              <p className="text-[10px] text-gray-600 leading-relaxed">{sec.body}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider">Faisabilite</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-orange-400 rounded-full"
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

  // Default — sections parsed with fade-in
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
              <p className="text-[11px] font-bold text-gray-800 mb-1">{sec.title}</p>
            )}
            <p className="text-[10px] text-gray-600 leading-relaxed">{sec.body}</p>
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
