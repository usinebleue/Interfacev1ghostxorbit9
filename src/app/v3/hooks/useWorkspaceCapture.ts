/**
 * useWorkspaceCapture.ts — Hook de capture auto des réponses bot dans le workspace
 *
 * COMPORTEMENT UNIVERSEL (toutes les phases):
 * Chaque réponse bot COMPLÉTÉE → capturée dans l'étape courante → chatStage avance
 *
 * Le workspace est PASSIF — il REÇOIT le contenu de la discussion.
 * Comme les artefacts dans Claude AI: le bot produit du contenu → il apparaît à droite.
 *
 * MULTI-BOT: Capture TOUS les nouveaux messages bot (pas juste le dernier).
 * Si 3 bots répondent en batch → 3 cristallisations avec attribution.
 *
 * VOCAL: Messages vocaux aussi capturés (seuil abaissé à 5 chars).
 *
 * STREAMING-SAFE (Fix S100): Ne capture que les messages avec isStreaming !== true.
 * Messages en cours de streaming sont trackés via pendingStreamIds et capturés à complétion.
 *
 * PENDINGCAPTURE PRIORITY (Fix S100): Quand pendingCapture est set (clic bouton section),
 * la capture va dans la section ciblée au lieu du chatStage séquentiel.
 *
 * MANUAL MESSAGE SAFETY (Fix S100): Si l'user tape manuellement pendant qu'un
 * pendingCapture est actif, pendingCapture est clear pour éviter la mauvaise attribution.
 *
 * Phases supportées: discussion, reflexion, creation, execution, retroaction
 */

import { useEffect, useRef } from "react";
import { useChatContext } from "../../v2/context/ChatContext";
import { useAmorcer } from "../AmorcerContext";
import { getPhaseStepIds } from "../phases/phase-config";

/** Phases où le contenu est auto-cristallisé dans le workspace */
const AUTO_CRISTALLISE_PHASES = ["reflexion", "creation", "execution", "retroaction"];
/** Phases où chatStage avance mais cristallisation est manuelle (boutons dans le chat) */
const MANUAL_CRISTALLISE_PHASES = ["discussion"];
/** Toutes les phases actives (chatStage avance) */
const ACTIVE_PHASES = [...AUTO_CRISTALLISE_PHASES, ...MANUAL_CRISTALLISE_PHASES];

/**
 * Détection d'intention de phase depuis le message utilisateur.
 * Quand Carl dit "brainstorm" ou "analyser" → Réflexion.
 * Quand Carl dit "concevoir" ou "plan" → Conception.
 * UNIQUEMENT depuis la phase Discussion (pas de transition inter-phases automatique).
 */
const PHASE_INTENT: [string, RegExp][] = [
  ["reflexion", /\b(brainstorm|réfléch|réflexion|analy[sz]|diagnostic|5\s*pourquoi|scamper|explorer|creuser|approfondi|examin|idée[s]?\s+(de|pour|sur)|trouver\s+des\s+idée)/i],
  ["creation", /\b(concevo|conception|blueprint|structur|planifi|organis|livrable|plan\s+(d['']action|stratég|d['']exéc))/i],
];

/** Map chatStage → sectionId pour la phase active */
function getSectionIdFromChatStage(phase: string, chatStage: number): string | null {
  const stepIds = getPhaseStepIds(phase);
  if (stepIds.length === 0) return null;
  if (chatStage >= stepIds.length) {
    return stepIds[stepIds.length - 1]; // Dernière étape si on dépasse
  }
  return stepIds[chatStage];
}

export function useWorkspaceCapture() {
  const { messages } = useChatContext();
  const {
    activePhase,
    pendingCapture,
    setPendingCapture,
    addSimV3Cristallise,
    activeBotCode,
    chatStage,
    setChatStage,
    setActivePhase,
    setReflexionContext,
    setRightSection,
  } = useAmorcer();
  const prevMsgCountRef = useRef(messages.length);
  // Fix S100: Track streaming message IDs waiting for completion
  const pendingStreamIdsRef = useRef<Set<string>>(new Set());
  // Fix S100: Track if the button's user message has been seen (to detect manual messages)
  const pendingUserMsgSeenRef = useRef(false);

  // Reset manual message tracking when pendingCapture changes
  useEffect(() => {
    if (pendingCapture) {
      pendingUserMsgSeenRef.current = false;
    }
  }, [pendingCapture]);

  useEffect(() => {
    // ═══ FIX S100: STREAMING COMPLETION CHECK ═══
    // On every render (messages ref changes during streaming token updates),
    // check if previously-identified streaming messages have now completed.
    // This catches the case where isStreaming flips from true→false without
    // messages.length changing.
    if (pendingStreamIdsRef.current.size > 0) {
      const completed: any[] = [];
      for (const id of Array.from(pendingStreamIdsRef.current)) {
        const msg = messages.find((m: any) => m.id === id);
        if (!msg) {
          // Message removed (conversation reset) — clean up
          pendingStreamIdsRef.current.delete(id);
          continue;
        }
        if ((msg as any).isStreaming !== true && msg.content && msg.content.length >= 5) {
          completed.push(msg);
          pendingStreamIdsRef.current.delete(id);
        }
      }
      if (completed.length > 0) {
        // ═══ CAPTURE completed streaming messages ═══
        if (ACTIVE_PHASES.includes(activePhase)) {
          const sectionId = pendingCapture || getSectionIdFromChatStage(activePhase, chatStage);
          if (sectionId) {
            // Cristalliser seulement si capture explicite (pendingCapture) ou phase auto-cristallise
            // En phase Discussion: PAS d'auto-cristallisation (l'utilisateur choisit via boutons dans le chat)
            if (pendingCapture || AUTO_CRISTALLISE_PHASES.includes(activePhase)) {
              for (const msg of completed) {
                const source = (msg as any).botCode || activeBotCode;
                const sourceType = (msg as any).msgType === "voice" ? "voice" as const : "chat" as const;
                const attributed = (msg as any).branchLabel
                  ? `**${(msg as any).branchLabel}**\n${msg.content}`
                  : msg.content;
                addSimV3Cristallise(attributed, source, sectionId, sourceType);
              }
            }
            if (pendingCapture) {
              setPendingCapture(null);
            } else {
              setChatStage((s: number) => s + 1);
            }
          }
        } else if (pendingCapture) {
          const lastBot = completed[completed.length - 1];
          if (lastBot) {
            const source = (lastBot as any).botCode || activeBotCode;
            const sourceType = (lastBot as any).msgType === "voice" ? "voice" as const : "chat" as const;
            addSimV3Cristallise(lastBot.content, source, pendingCapture, sourceType);
          }
          setPendingCapture(null);
        }
        return; // Streaming completion handled — don't double-process
      }
    }

    // ═══ NEW MESSAGE DETECTION (length-based, same as before) ═══
    if (messages.length <= prevMsgCountRef.current) {
      prevMsgCountRef.current = messages.length;
      return;
    }

    // Get ALL new messages since last check
    const newMessages = messages.slice(prevMsgCountRef.current);
    prevMsgCountRef.current = messages.length;

    // ═══ AUTO-DÉTECTION DE PHASE — depuis les messages utilisateur ═══
    // Depuis observation/attention → au minimum passer en "discussion" dès que l'user parle
    // Depuis discussion → détecter intention spécifique (brainstorm → réflexion, plan → conception)
    const userMessages = newMessages.filter((m: any) => m.role === "user" && m.content);
    if (userMessages.length > 0 && (activePhase === "discussion" || activePhase === "observation" || activePhase === "attention" || activePhase === "moderation")) {
      let transitioned = false;
      for (const msg of userMessages) {
        for (const [targetPhase, regex] of PHASE_INTENT) {
          if (regex.test(msg.content)) {
            console.log(`[WorkspaceCapture] Intention détectée: "${targetPhase}" depuis "${msg.content.substring(0, 60)}"`);
            setActivePhase(targetPhase);
            setReflexionContext(msg.content.substring(0, 120));
            setRightSection(null);
            transitioned = true;
            break;
          }
        }
        if (transitioned) break;
      }
      // Pas d'intention spécifique mais l'user parle → au minimum passer en Discussion
      if (!transitioned && (activePhase === "observation" || activePhase === "attention" || activePhase === "moderation")) {
        const firstUserMsg = userMessages[0];
        setActivePhase("discussion");
        setReflexionContext(firstUserMsg.content.substring(0, 120));
        setRightSection(null);
        console.log(`[WorkspaceCapture] Auto-transition observation → discussion`);
      }
    }

    // ═══ FIX S100: CLEAR pendingCapture si l'user tape manuellement ═══
    if (pendingCapture && userMessages.length > 0) {
      if (pendingUserMsgSeenRef.current) {
        // Already saw the button's message → this is a manual message → clear
        console.log(`[WorkspaceCapture] Message manuel détecté — clear pendingCapture "${pendingCapture}"`);
        setPendingCapture(null);
        // Don't return — still need to track streaming for this new message's response
      } else {
        // First user message after pendingCapture was set → this is the button's message
        pendingUserMsgSeenRef.current = true;
      }
    }

    // ═══ PROCESS BOT MESSAGES ═══
    const botMessages = newMessages.filter(
      (m: any) => m.role === "assistant"
    );
    if (botMessages.length === 0) return;

    // Fix S100: Separate complete messages from still-streaming ones
    const completeBots = botMessages.filter(
      (m: any) => (m as any).isStreaming !== true && m.content && m.content.length >= 5
    );
    const streamingOrEmptyBots = botMessages.filter(
      (m: any) => (m as any).isStreaming === true || !m.content || m.content.length < 5
    );

    // Track streaming/empty bots for completion check on next renders
    for (const m of streamingOrEmptyBots) {
      pendingStreamIdsRef.current.add(m.id);
    }

    // Capture immediately complete bot messages (non-streaming responses)
    if (completeBots.length === 0) return;

    // ═══ CAPTURE — toutes les phases actives ═══
    if (ACTIVE_PHASES.includes(activePhase)) {
      const sectionId = pendingCapture || getSectionIdFromChatStage(activePhase, chatStage);
      if (!sectionId) return;

      // Cristalliser seulement si capture explicite (pendingCapture) ou phase auto-cristallise
      // En phase Discussion: PAS d'auto-cristallisation (l'utilisateur choisit via boutons dans le chat)
      if (pendingCapture || AUTO_CRISTALLISE_PHASES.includes(activePhase)) {
        for (const msg of completeBots) {
          const source = (msg as any).botCode || activeBotCode;
          const sourceType = (msg as any).msgType === "voice" ? "voice" as const : "chat" as const;
          const attributed = (msg as any).branchLabel
            ? `**${(msg as any).branchLabel}**\n${msg.content}`
            : msg.content;
          addSimV3Cristallise(attributed, source, sectionId, sourceType);
        }
      }

      if (pendingCapture) {
        setPendingCapture(null);
      } else {
        // Avancer chatStage UNE fois (pas par message)
        setChatStage((s: number) => s + 1);
      }
      return;
    }

    // ═══ FALLBACK — capture explicite via pendingCapture ═══
    if (pendingCapture) {
      // Capturer le dernier message bot
      const lastBot = completeBots[completeBots.length - 1];
      if (lastBot) {
        const source = (lastBot as any).botCode || activeBotCode;
        const sourceType = (lastBot as any).msgType === "voice" ? "voice" as const : "chat" as const;
        addSimV3Cristallise(lastBot.content, source, pendingCapture, sourceType);
      }
      setPendingCapture(null);
    }
  }, [messages, activePhase, pendingCapture, setPendingCapture, addSimV3Cristallise, activeBotCode, chatStage, setChatStage, setActivePhase, setReflexionContext, setRightSection]);
}
