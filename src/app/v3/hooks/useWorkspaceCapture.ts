/**
 * useWorkspaceCapture.ts — Hook de capture auto des réponses bot dans le workspace
 *
 * DISCUSSION — AUTO-CRISTALLISATION INTELLIGENTE:
 * Chaque échange (user choice + bot response) → RÉSUMÉ capturé dans l'étape CREDO courante.
 * Le résumé = décision de l'user + insight clé du bot (PAS le dump complet).
 * Les résumés s'ACCUMULENT dans chaque section CREDO (effet entonnoir).
 *
 * AUTRES PHASES — Capture complète du contenu (réflexion, conception, etc.)
 *
 * STREAMING-SAFE: Ne capture que les messages avec isStreaming !== true.
 * PENDINGCAPTURE: Quand pendingCapture est set, capture ciblée.
 *
 * Phases supportées: discussion, reflexion, creation, execution, retroaction
 */

import { useEffect, useRef } from "react";
import { useChatContext } from "../../v2/context/ChatContext";
import { useAmorcer } from "../AmorcerContext";
import { getPhaseStepIds } from "../phases/phase-config";

/** Toutes les phases auto-cristallisées (discussion = résumés intelligents, autres = contenu complet) */
const AUTO_CRISTALLISE_PHASES = ["discussion", "reflexion", "creation", "execution", "retroaction"];
/** Toutes les phases actives (chatStage trackable) */
const ACTIVE_PHASES = AUTO_CRISTALLISE_PHASES;

/**
 * Résumé intelligent pour le workspace — décision de l'user + insight clé du bot.
 * Effet entonnoir: chaque résumé capture l'ESSENCE de l'échange, pas le dump complet.
 */
const FILLER_RE = /^(absolument|exactement|parfait|bien sûr|bien reçu|oui|non|ok|d'accord|certainement|effectivement|tout à fait|excellent|super|bonne question|c'est une|je comprends|merci|salut|bonjour|hey|on y va|on s'attaque|on se penche|on met|on passe)/i;

function summarizeForWorkspace(userChoice: string, botContent: string): string {
  const lines = botContent.split('\n').map(l => l.trim()).filter(l => l.length > 20);
  const meaningful = lines.find(l => !FILLER_RE.test(l));
  const insight = (meaningful || lines[1] || lines[0] || "").substring(0, 200);
  const shortChoice = userChoice.substring(0, 100);
  return `→ **${shortChoice}**\n${insight}`;
}

/** Map chatStage → sectionId pour la phase active */
function getSectionIdFromChatStage(phase: string, chatStage: number): string | null {
  const stepIds = getPhaseStepIds(phase);
  if (stepIds.length === 0) return null;
  if (chatStage >= stepIds.length) {
    return stepIds[stepIds.length - 1]; // Dernière étape si on dépasse
  }
  return stepIds[chatStage];
}

/** S103 — Résolution INTELLIGENTE de section: backend > pendingCapture > positionnelle */
function getSmartSectionId(
  msg: any, phase: string, chatStage: number, pendingCapture: string | null
): string | null {
  // Priorité 1: Backend a détecté la section sémantiquement
  if (msg?.cristallisationSuggestion?.section_id &&
      msg.cristallisationSuggestion.confidence >= 0.5) {
    return msg.cristallisationSuggestion.section_id;
  }
  // Priorité 2: User a cliqué "Cristalliser" manuellement
  if (pendingCapture) return pendingCapture;
  // Priorité 3: Positionnelle (fallback)
  return getSectionIdFromChatStage(phase, chatStage);
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
    getCristallise,
    editCristallise,
    addWorkflowItem,
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
        const isDiscussion = activePhase === "discussion";
        if (ACTIVE_PHASES.includes(activePhase)) {
          const sectionId = getSmartSectionId(completed[0], activePhase, chatStage, pendingCapture);
          if (sectionId) {
            for (const msg of completed) {
              const source = (msg as any).botCode || activeBotCode;
              const sourceType = (msg as any).msgType === "voice" ? "voice" as const : "chat" as const;
              const msgContentTypes = (msg as any).cristallisationSuggestion?.content_types as string[] | undefined;
              if (isDiscussion) {
                // ═══ RÉSUMÉ INTELLIGENT — décision user + insight bot ═══
                const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                const summary = summarizeForWorkspace(lastUserMsg?.content || "Discussion", msg.content);
                const existing = getCristallise(sectionId);
                if (existing) {
                  editCristallise(sectionId, existing + "\n\n" + summary);
                } else {
                  addSimV3Cristallise(summary, source, sectionId, sourceType, msgContentTypes);
                }
              } else {
                // ═══ CONTENU COMPLET — autres phases ═══
                const attributed = (msg as any).branchLabel
                  ? `**${(msg as any).branchLabel}**\n${msg.content}`
                  : msg.content;
                addSimV3Cristallise(attributed, source, sectionId, sourceType, msgContentTypes);
              }
            }
            if (pendingCapture) {
              setPendingCapture(null);
            } else if (isDiscussion) {
              // S103 — Auto-avancement: si backend cible une étape +1, avancer le chatStage
              const lastCompleted = completed[completed.length - 1];
              const backendSectionId = lastCompleted?.cristallisationSuggestion?.section_id;
              if (backendSectionId) {
                const stepIds = getPhaseStepIds(activePhase);
                const sugIdx = stepIds.indexOf(backendSectionId);
                if (sugIdx >= 0 && sugIdx === chatStage + 1) {
                  setChatStage(sugIdx);
                } else {
                  const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
                  const targetStage = Math.min(4, Math.floor(botCount / 2));
                  if (targetStage > chatStage) setChatStage(targetStage);
                }
              } else {
                const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
                const targetStage = Math.min(4, Math.floor(botCount / 2));
                if (targetStage > chatStage) setChatStage(targetStage);
              }
            } else {
              setChatStage((s: number) => s + 1);
            }

            // S103 — CASCADES cross-phases (streaming path)
            for (const cMsg of completed) {
              const cascades = (cMsg as any).cascadeItems as Array<{section_id: string; phase: string; label: string}> | undefined;
              if (cascades?.length) {
                cascades.forEach(c => {
                  const cascadeContent = `[Cascade depuis Discussion] ${cMsg.content.slice(0, 200)}...`;
                  addSimV3Cristallise(cascadeContent, (cMsg as any).botCode || activeBotCode, c.section_id);
                });
                cascades.forEach(c => {
                  addWorkflowItem(c.phase, `${c.label}`, "cascade", c.section_id);
                });
              }
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
      // Conversation was reset (messages cleared) → reset chatStage
      if (messages.length < prevMsgCountRef.current) {
        setChatStage(0);
      }
      prevMsgCountRef.current = messages.length;
      return;
    }

    // Get ALL new messages since last check
    const newMessages = messages.slice(prevMsgCountRef.current);
    prevMsgCountRef.current = messages.length;

    // ═══ AUTO-DÉTECTION DE PHASE — depuis les messages utilisateur ═══
    // Depuis observation/attention → passer en "discussion" dès que l'user parle
    // PAS de transition automatique vers réflexion/conception depuis Discussion
    // Ces transitions se font UNIQUEMENT via les boutons explicites ("Passer en mode réflexion")
    const userMessages = newMessages.filter((m: any) => m.role === "user" && m.content);
    if (userMessages.length > 0 && (activePhase === "observation" || activePhase === "attention" || activePhase === "moderation")) {
      // Depuis observation → passer en Discussion
      const firstUserMsg = userMessages[0];
      setActivePhase("discussion");
      setChatStage(0); // Reset chatStage pour la nouvelle conversation
      setReflexionContext(firstUserMsg.content.substring(0, 120));
      setRightSection(null);
      console.log(`[WorkspaceCapture] Auto-transition observation → discussion`);
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
    const isDiscussion = activePhase === "discussion";
    if (ACTIVE_PHASES.includes(activePhase)) {
      const sectionId = getSmartSectionId(completeBots[0], activePhase, chatStage, pendingCapture);
      if (!sectionId) return;

      for (const msg of completeBots) {
        const source = (msg as any).botCode || activeBotCode;
        const sourceType = (msg as any).msgType === "voice" ? "voice" as const : "chat" as const;
        const msgContentTypes = (msg as any).cristallisationSuggestion?.content_types as string[] | undefined;
        if (isDiscussion) {
          // ═══ S102-B — MULTI-ENRICHED: capture enrichie avec contributions secondaires ═══
          if ((msg as any).msgType === "multi-enriched" && (msg as any).secondaryInputs?.length > 0) {
            const secondaries = (msg as any).secondaryInputs as Array<{agent: string; nom: string; contenu: string}>;
            const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
            const primarySummary = summarizeForWorkspace(lastUserMsg?.content || "Discussion", msg.content);
            const contribs = secondaries.map((s: any) => `  [${s.nom}] ${s.contenu}`).join("\n");
            const enrichedSummary = `${primarySummary}\n---\n${contribs}`;
            const existing = getCristallise(sectionId);
            if (existing) {
              editCristallise(sectionId, existing + "\n\n" + enrichedSummary);
            } else {
              addSimV3Cristallise(enrichedSummary, source, sectionId, sourceType, msgContentTypes);
            }
          } else {
          // ═══ RÉSUMÉ INTELLIGENT — décision user + insight bot (existant) ═══
          const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
          const summary = summarizeForWorkspace(lastUserMsg?.content || "Discussion", msg.content);
          const existing = getCristallise(sectionId);
          if (existing) {
            editCristallise(sectionId, existing + "\n\n" + summary);
          } else {
            addSimV3Cristallise(summary, source, sectionId, sourceType, msgContentTypes);
          }
          }
        } else {
          // ═══ CONTENU COMPLET — autres phases ═══
          const attributed = (msg as any).branchLabel
            ? `**${(msg as any).branchLabel}**\n${msg.content}`
            : msg.content;
          addSimV3Cristallise(attributed, source, sectionId, sourceType, msgContentTypes);
        }
      }

      if (pendingCapture) {
        setPendingCapture(null);
      } else if (isDiscussion) {
        // S103 — Auto-avancement: si backend cible une étape +1, avancer le chatStage
        const lastBot = completeBots[completeBots.length - 1];
        const backendSectionId = lastBot?.cristallisationSuggestion?.section_id;
        if (backendSectionId) {
          const stepIds = getPhaseStepIds(activePhase);
          const sugIdx = stepIds.indexOf(backendSectionId);
          if (sugIdx >= 0 && sugIdx === chatStage + 1) {
            setChatStage(sugIdx);
          } else {
            const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
            const targetStage = Math.min(4, Math.floor(botCount / 2));
            if (targetStage > chatStage) setChatStage(targetStage);
          }
        } else {
          const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
          const targetStage = Math.min(4, Math.floor(botCount / 2));
          if (targetStage > chatStage) setChatStage(targetStage);
        }
      } else {
        setChatStage((s: number) => s + 1);
      }

      // ═══ S103 — CASCADES cross-phases ═══
      for (const msg of completeBots) {
        const cascades = (msg as any).cascadeItems as Array<{section_id: string; phase: string; label: string}> | undefined;
        if (cascades?.length) {
          cascades.forEach(c => {
            const cascadeContent = `[Cascade depuis Discussion] ${msg.content.slice(0, 200)}...`;
            addSimV3Cristallise(cascadeContent, (msg as any).botCode || activeBotCode, c.section_id);
          });
          cascades.forEach(c => {
            addWorkflowItem(c.phase, `${c.label}`, "cascade", c.section_id);
          });
        }
      }

      return;
    }

    // ═══ FALLBACK — capture explicite via pendingCapture ═══
    if (pendingCapture) {
      const lastBot = completeBots[completeBots.length - 1];
      if (lastBot) {
        const source = (lastBot as any).botCode || activeBotCode;
        const sourceType = (lastBot as any).msgType === "voice" ? "voice" as const : "chat" as const;
        addSimV3Cristallise(lastBot.content, source, pendingCapture, sourceType);
      }
      setPendingCapture(null);
    }
  }, [messages, activePhase, pendingCapture, setPendingCapture, addSimV3Cristallise, activeBotCode, chatStage, setChatStage, setActivePhase, setReflexionContext, setRightSection, getCristallise, editCristallise, addWorkflowItem]);
}
