/**
 * useWorkspaceCapture.ts — Hook de capture auto des réponses bot dans le workspace
 *
 * COMPORTEMENT UNIVERSEL (toutes les phases):
 * Chaque réponse bot → capturée dans l'étape courante → chatStage avance
 *
 * Le workspace est PASSIF — il REÇOIT le contenu de la discussion.
 * Comme les artefacts dans Claude AI: le bot produit du contenu → il apparaît à droite.
 *
 * MULTI-BOT: Capture TOUS les nouveaux messages bot (pas juste le dernier).
 * Si 3 bots répondent en batch → 3 cristallisations avec attribution.
 *
 * VOCAL: Messages vocaux aussi capturés (seuil abaissé à 5 chars).
 *
 * Phases supportées: discussion, reflexion, creation, execution, retroaction
 */

import { useEffect, useRef } from "react";
import { useChatContext } from "../../v2/context/ChatContext";
import { useAmorcer } from "../AmorcerContext";
import { getPhaseStepIds } from "../phases/phase-config";

/** Phases pour lesquelles l'auto-capture est active */
const AUTO_CAPTURE_PHASES = ["discussion", "reflexion", "creation", "execution", "retroaction"];

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

  useEffect(() => {
    // Only trigger on new messages added
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

    // Filter to assistant messages only — min 5 chars (vocal can be short)
    const botMessages = newMessages.filter(
      (m: any) => m.role === "assistant" && m.content && m.content.length >= 5
    );
    if (botMessages.length === 0) return;

    // ═══ AUTO-CAPTURE — toutes les phases actives ═══
    if (AUTO_CAPTURE_PHASES.includes(activePhase)) {
      const sectionId = getSectionIdFromChatStage(activePhase, chatStage);
      if (!sectionId) return;

      // Capturer TOUS les messages bot avec attribution
      for (const msg of botMessages) {
        const source = (msg as any).botCode || activeBotCode;
        const sourceType = (msg as any).msgType === "voice" ? "voice" as const : "chat" as const;

        // Si multi-perspective (branchLabel), inclure le label dans le contenu
        const attributed = (msg as any).branchLabel
          ? `**${(msg as any).branchLabel}**\n${msg.content}`
          : msg.content;

        addSimV3Cristallise(attributed, source, sectionId, sourceType);
      }

      // Avancer chatStage UNE fois (pas par message)
      setChatStage((s: number) => s + 1);
      return;
    }

    // ═══ FALLBACK — capture explicite via pendingCapture ═══
    if (pendingCapture) {
      // Capturer le dernier message bot
      const lastBot = botMessages[botMessages.length - 1];
      if (lastBot) {
        const source = (lastBot as any).botCode || activeBotCode;
        const sourceType = (lastBot as any).msgType === "voice" ? "voice" as const : "chat" as const;
        addSimV3Cristallise(lastBot.content, source, pendingCapture, sourceType);
      }
      setPendingCapture(null);
    }
  }, [messages, activePhase, pendingCapture, setPendingCapture, addSimV3Cristallise, activeBotCode, chatStage, setChatStage]);
}
