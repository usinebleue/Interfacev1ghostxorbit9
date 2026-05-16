/**
 * useWorkspaceCapture.ts — Hook de capture auto des réponses bot dans le workspace
 *
 * DISCUSSION — AUTO-CRISTALLISATION INTELLIGENTE:
 * Chaque échange (user choice + bot response) → RÉSUMÉ capturé dans l'étape CREDO courante.
 * Le résumé = décision de l'user + insight clé du bot (PAS le dump complet).
 * Les résumés s'ACCUMULENT dans chaque section CREDO (effet entonnoir).
 *
 * AUTRES PHASES — Résumé intelligent (détection type + structured_data + résumé, même pipeline que discussion)
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
import { DOCFORGE_CONFIGS } from "../phases/docforge-config";
import type { WorkspaceBlock, WorkspaceBlockType } from "../core/types";

/** Toutes les phases auto-cristallisées (discussion = résumés intelligents, autres = contenu complet) */
// Sprint 2A Phase 4: reflexion fusionnée dans discussion
const AUTO_CRISTALLISE_PHASES = ["discussion", "creation", "execution", "retroaction"];
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

// ═══ Frontend fallback: detection de type de block (mêmes patterns que le backend) ═══

const BLOCK_TYPE_PATTERNS: [WorkspaceBlockType, RegExp][] = [
  ["diagnostic", /diagnostic|analyse.*forces|swot|situation.*actuelle|état.*des.*lieux/i],
  ["scamper", /scamper|substituer.*combiner|adapter.*modifier/i],
  ["5pourquoi", /5\s*pourquoi|cause.*racine|causes.*profondes/i],
  ["plan_action", /plan.*d'action|étapes?\s+à\s+suivre|prochaines?\s+étapes?|actions?\s+priorit/i],
  ["budget", /budget|coût|cout|investissement|estimation.*financ/i],
  ["timeline", /timeline|calendrier|échéancier|jalons?|planning/i],
  ["metriques", /kpi|indicateur|métrique|mesure.*performance/i],
  ["taches", /tâche|tache|todo|à\s+faire|checklist/i],
  ["recommandations", /recommand|suggestion|proposition|conseil/i],
  ["risques", /risque|menace|vulnérabilit|danger|point.*faible/i],
  ["brainstorm", /brainstorm|idées?\s+créativ|générer?\s+idées?/i],
  ["synthese", /synthèse|synthese|résumé|resume|récapitul|bilan|conclusion/i],
  ["challenge", /challenge|avocat.*diable|objection|contre.*argument/i],
];

function detectBlockTypeFrontend(text: string): WorkspaceBlockType {
  for (const [type, pattern] of BLOCK_TYPE_PATTERNS) {
    if (pattern.test(text)) return type;
  }
  return "libre";
}

function extractTitle(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  const meaningful = lines.find(l => !FILLER_RE.test(l) && !/^[#*\-•→➤\d.)\s]+$/.test(l));
  const raw = meaningful || lines[0] || text.substring(0, 60);
  const cleaned = raw.replace(/^[#*\-•→➤\d.)\s]+/, '').trim();
  return cleaned.substring(0, 60) + (cleaned.length > 60 ? "..." : "");
}

// ═══ Frontend: extraction de structured_data depuis le contenu bot ═══

function extractStructuredDataFrontend(
  content: string,
  blockType: WorkspaceBlockType
): Record<string, any> | undefined {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);

  if (blockType === "brainstorm" || blockType === "recommandations") {
    // Extraire les items numerotes ou a puces
    const items: { id: number; title: string; detail: string }[] = [];
    let itemId = 0;
    for (const line of lines) {
      const match = line.match(/^\s*(?:(\d+)[.)]\s+|[-*•]\s+)(.+)/);
      if (match) {
        itemId++;
        const text = (match[2] || "").trim();
        // Separer titre/detail si possible (format "**titre** detail" ou "titre : detail")
        const boldMatch = text.match(/^\*\*(.+?)\*\*[:\s—–-]*(.*)$/);
        const colonMatch = text.match(/^([^:]{5,60})\s*[:—–-]\s+(.+)$/);
        if (boldMatch) {
          items.push({ id: itemId, title: boldMatch[1].trim(), detail: boldMatch[2].trim() || text });
        } else if (colonMatch) {
          items.push({ id: itemId, title: colonMatch[1].trim(), detail: colonMatch[2].trim() });
        } else {
          items.push({ id: itemId, title: text.substring(0, 80), detail: text });
        }
      }
    }
    if (items.length >= 2) return { items };
  }

  if (blockType === "5pourquoi") {
    // Extraire les niveaux de pourquoi
    const levels: { question: string; answer: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const qMatch = lines[i].match(/pourquoi\s*(?:\d+)?\s*[?:]/i) || lines[i].match(/^\s*\d+[.)]\s+(?:pourquoi\s+)/i);
      if (qMatch) {
        const question = lines[i].replace(/^\s*\d+[.)]\s*/, "").trim();
        // Chercher la reponse dans les lignes suivantes
        let answer = "";
        for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
          if (lines[j].match(/pourquoi/i) && j > i + 1) break;
          if (lines[j].match(/^[→>•\-]\s*/)) {
            answer = lines[j].replace(/^[→>•\-]\s*/, "").trim();
            break;
          }
          if (!lines[j].match(/^\s*\d+[.)]/)) {
            answer = lines[j].trim();
            break;
          }
        }
        levels.push({ question, answer: answer || "A analyser" });
      }
    }
    if (levels.length >= 2) return { levels };
  }

  if (blockType === "diagnostic") {
    // Extraire les axes/KPIs et les points de friction
    const axes: { label: string; score: number; color: string }[] = [];
    const frictions: string[] = [];
    for (const line of lines) {
      // Detecter les scores: "Complexite: 7/10" ou "Impact : Élevé"
      const scoreMatch = line.match(/^\s*[-*•]?\s*\*?\*?([^:*]+?)\*?\*?\s*:\s*(\d+)\s*[/]\s*10/i);
      if (scoreMatch) {
        const score = parseInt(scoreMatch[2], 10);
        axes.push({
          label: scoreMatch[1].trim(),
          score,
          color: score >= 7 ? "green" : score >= 4 ? "amber" : "red",
        });
        continue;
      }
      // Detecter les points de friction / problemes / enjeux
      const frictionMatch = line.match(/^\s*[-*•⚠️⚡🔴]\s+(.{15,})/);
      if (frictionMatch) {
        frictions.push(frictionMatch[1].trim());
      }
    }
    if (axes.length >= 2) return { axes, frictions: frictions.length > 0 ? frictions : undefined };
    if (frictions.length >= 2) return { frictions };
  }

  if (blockType === "plan_action" || blockType === "taches") {
    const actions: { titre: string; done: boolean; priorite?: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^\s*(?:\d+[.)]\s+|[-*•]\s+|\[[ x]\]\s+)(.+)/i);
      if (match) {
        const done = /\[x\]/i.test(line);
        actions.push({ titre: match[1].trim(), done });
      }
    }
    if (actions.length >= 2) {
      return blockType === "taches"
        ? { taches: actions.map(a => ({ titre: a.titre, done: a.done })) }
        : { actions };
    }
  }

  if (blockType === "risques") {
    const risques: { zone: string; severite: string; desc: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^\s*(?:\d+[.)]\s+|[-*•]\s+)(.+)/);
      if (match) {
        const text = match[1].trim();
        const sev = /critique|majeur|grave|urgent/i.test(text) ? "critique"
          : /faible|mineur|negligeable/i.test(text) ? "faible" : "modere";
        risques.push({ zone: text.substring(0, 60), severite: sev, desc: text });
      }
    }
    if (risques.length >= 2) return { risques };
  }

  if (blockType === "scamper") {
    const letters: Record<string, string[]> = {};
    const SCAMPER_KEYS = ["S", "C", "A", "M", "P", "E", "R"];
    const SCAMPER_LABELS: Record<string, RegExp> = {
      S: /substituer/i, C: /combiner/i, A: /adapter/i,
      M: /modifier/i, P: /put.*other|autre.*usage/i,
      E: /[eé]liminer/i, R: /r[eé]organiser|renverser|reverser/i,
    };
    let currentKey = "";
    for (const line of lines) {
      // Detecter une lettre SCAMPER en debut de ligne
      for (const [key, re] of Object.entries(SCAMPER_LABELS)) {
        if (re.test(line) || line.match(new RegExp(`^\\s*\\*?\\*?${key}\\s*[—–:-]`, "i"))) {
          currentKey = key;
          break;
        }
      }
      if (currentKey && !Object.values(SCAMPER_LABELS).some(re => re.test(line))) {
        const itemMatch = line.match(/^\s*[-*•]\s+(.+)/);
        if (itemMatch) {
          if (!letters[currentKey]) letters[currentKey] = [];
          letters[currentKey].push(itemMatch[1].trim());
        }
      }
    }
    // Remplir les cles manquantes
    for (const k of SCAMPER_KEYS) {
      if (!letters[k]) letters[k] = [];
    }
    const hasContent = Object.values(letters).some(arr => arr.length > 0);
    if (hasContent) return { letters };
  }

  if (blockType === "synthese") {
    const points: { label: string; done: boolean }[] = [];
    for (const line of lines) {
      const match = line.match(/^\s*(?:\d+[.)]\s+|[-*•✅✓]\s+)(.+)/);
      if (match) {
        points.push({ label: match[1].trim(), done: /[✅✓]/.test(line) });
      }
    }
    if (points.length >= 2) return { points };
  }

  if (blockType === "challenge") {
    const args: { point: string; severity?: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^\s*(?:\d+[.)]\s+|[-*•]\s+)(.+)/);
      if (match) {
        const text = match[1].trim();
        const sev = /critique|majeur|fatal/i.test(text) ? "critique"
          : /modéré|moyen/i.test(text) ? "modere" : undefined;
        args.push({ point: text, severity: sev });
      }
    }
    if (args.length >= 2) return { arguments: args };
  }

  return undefined; // Pas de structured_data extractible
}

function getCurrentCredoStep(chatStage: number): "C" | "R" | "E" | "D" | "O" {
  const steps: ("C" | "R" | "E" | "D" | "O")[] = ["C", "R", "E", "D", "O"];
  return steps[Math.min(chatStage, steps.length - 1)];
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

/** Resolve sectionId pour un livrable DocForge actif (keyword matching) */
function getDocForgeSectionId(deliverableType: string, content: string): string | null {
  const config = DOCFORGE_CONFIGS[deliverableType];
  if (!config) return null;
  const lower = content.toLowerCase();
  // Keyword match: compare contenu bot avec titres de sections
  for (const sec of config.sections) {
    const keywords = sec.title.toLowerCase().split(/[\s—&]+/).filter(w => w.length > 3);
    if (keywords.some(kw => lower.includes(kw))) {
      return sec.sectionId;
    }
  }
  // Fallback: premiere section
  return config.sections[0]?.sectionId || null;
}

/** S103 — Résolution INTELLIGENTE de section: backend > pendingCapture > docforge > positionnelle */
function getSmartSectionId(
  msg: any, phase: string, chatStage: number, pendingCapture: string | null,
  activeDeliverable?: string | null
): string | null {
  // Priorité 1: Backend a détecté la section sémantiquement
  if (msg?.cristallisationSuggestion?.section_id &&
      msg.cristallisationSuggestion.confidence >= 0.5) {
    return msg.cristallisationSuggestion.section_id;
  }
  // Priorité 2: User a cliqué "Cristalliser" manuellement
  if (pendingCapture) return pendingCapture;
  // Priorité 3: DocForge livrable actif — keyword matching
  if (activeDeliverable && msg?.content) {
    return getDocForgeSectionId(activeDeliverable, msg.content);
  }
  // Priorité 4: Positionnelle (fallback)
  return getSectionIdFromChatStage(phase, chatStage);
}

export function useWorkspaceCapture() {
  const { messages, lastCREDOPhase } = useChatContext();
  const {
    activePhase,
    pendingCapture,
    setPendingCapture,
    activeBotCode,
    chatStage,
    setChatStage,
    setActivePhase,
    setReflexionContext,
    setRightSection,
    getCristallise,
    editCristallise,
    addWorkflowItem,
    addWorkspaceBlock,
    activeDeliverable,
    workspaceBlocks,
  } = useAmorcer();
  const prevMsgCountRef = useRef(messages.length);
  // Guard anti-duplication: track which message IDs have already generated workspace blocks
  const processedBlockMsgIds = useRef(new Set<string>());

  // ═══ VISION CAPTURE — écoute les events CustomEvent depuis useGlassesEvents ═══
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        title: string; content: string; imageUrl: string; ts: number;
      };
      if (!detail?.imageUrl) return;
      addWorkspaceBlock({
        id: `vision-${Date.now()}`,
        type: "libre",
        title: detail.title || "Vision CarlOS",
        summary: detail.content || "Capture caméra",
        structured_data: { image_url: detail.imageUrl, vision: true },
        credo_step: "C",
        confidence: 0.9,
        source: "CEOB",
        sourceType: "voice",
        timestamp: detail.ts ? detail.ts * 1000 : Date.now(),
      });
    };
    window.addEventListener("vision-capture", handler);
    return () => window.removeEventListener("vision-capture", handler);
  }, [addWorkspaceBlock]);
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
          // Guard: si le message a ete pre-finalise par le stale timer (options extraites cote client)
          // mais onDone n'est pas encore arrive avec le workspace_block du backend → attendre
          if ((msg as any)._preFinalized && !(msg as any).workspace_block) {
            continue; // Garder dans pendingStreamIdsRef, onDone va arriver avec les vraies donnees
          }
          completed.push(msg);
          pendingStreamIdsRef.current.delete(id);
        }
      }
      if (completed.length > 0) {
        // ═══ CAPTURE completed streaming messages ═══
        const isDiscussion = activePhase === "discussion";
        if (ACTIVE_PHASES.includes(activePhase)) {
          const sectionId = getSmartSectionId(completed[0], activePhase, chatStage, pendingCapture, activeDeliverable);
          if (sectionId) {
            for (const msg of completed) {
              const source = (msg as any).botCode || activeBotCode;
              const sourceType = (msg as any).msgType === "voice" ? "voice" as const : "chat" as const;
              const msgContentTypes = (msg as any).cristallisationSuggestion?.content_types as string[] | undefined;
              if (isDiscussion) {
                // ═══ GUARD ANTI-DUPLICATION — skip si ce message a déjà généré un bloc ═══
                if (processedBlockMsgIds.current.has(msg.id)) {
                  console.log(`[WorkspaceCapture] SKIP duplicate block for msg ${msg.id} (streaming path)`);
                } else {
                // ═══ WORKSPACE BLOCK INTELLIGENT — backend ou fallback frontend ═══
                const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                const wsBlock = (msg as any).workspace_block as Partial<WorkspaceBlock> | undefined;
                if (wsBlock && wsBlock.type && wsBlock.title) {
                  // Backend a généré un workspace_block structuré
                  processedBlockMsgIds.current.add(msg.id);
                  addWorkspaceBlock({
                    id: wsBlock.id || `blk-${Date.now()}`,
                    type: wsBlock.type as WorkspaceBlockType,
                    title: wsBlock.title,
                    summary: wsBlock.summary || msg.content.substring(0, 200),
                    structured_data: wsBlock.structured_data,
                    credo_step: (wsBlock.credo_step as any) || getCurrentCredoStep(chatStage),
                    confidence: wsBlock.confidence || 0.8,
                    source,
                    sourceType,
                    sectionId,
                    timestamp: Date.now(),
                    replace_block_id: wsBlock.replace_block_id,
                  });
                } else if (!(msg as any).workspace_block_skip || workspaceBlocks.length === 0) {
                  // Fallback frontend: détection locale + extraction structured_data
                  processedBlockMsgIds.current.add(msg.id);
                  const detectedType = detectBlockTypeFrontend(msg.content);
                  const structuredData = extractStructuredDataFrontend(msg.content, detectedType);
                  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                  addWorkspaceBlock({
                    id: `blk-${Date.now()}`,
                    type: detectedType,
                    title: extractTitle(msg.content),
                    summary: summarizeForWorkspace(lastUserMsg?.content || "Discussion", msg.content),
                    structured_data: structuredData,
                    credo_step: getCurrentCredoStep(chatStage),
                    confidence: 0.6,
                    source,
                    sourceType,
                    sectionId,
                    timestamp: Date.now(),
                  });
                }
                } // end dedup guard
                // Accumulate in existing block for same sectionId (entonnoir effect)
                const lastUserMsg2 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                const summary = summarizeForWorkspace(lastUserMsg2?.content || "Discussion", msg.content);
                const existing = getCristallise(sectionId);
                if (existing) {
                  editCristallise(sectionId, existing + "\n\n" + summary);
                }
              } else {
                // ═══ RÉSUMÉ INTELLIGENT — autres phases (conception, exécution, etc.) ═══
                // Même pipeline que discussion fallback: détection type + extraction structured_data + résumé
                const wsBlock = (msg as any).workspace_block as Partial<WorkspaceBlock> | undefined;
                if (wsBlock && wsBlock.type && wsBlock.title) {
                  // Backend a généré un workspace_block structuré
                  addWorkspaceBlock({
                    id: wsBlock.id || `blk-${Date.now()}`,
                    type: wsBlock.type as WorkspaceBlockType,
                    title: wsBlock.title,
                    summary: wsBlock.summary || msg.content.substring(0, 300),
                    structured_data: wsBlock.structured_data,
                    credo_step: getCurrentCredoStep(chatStage),
                    confidence: wsBlock.confidence || 0.8,
                    source,
                    sourceType,
                    sectionId,
                    timestamp: Date.now(),
                  });
                } else {
                  const detectedType = detectBlockTypeFrontend(msg.content);
                  const structuredData = extractStructuredDataFrontend(msg.content, detectedType);
                  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                  addWorkspaceBlock({
                    id: `blk-${Date.now()}`,
                    type: detectedType,
                    title: extractTitle(msg.content),
                    summary: summarizeForWorkspace(lastUserMsg?.content || "Conception", msg.content),
                    structured_data: structuredData,
                    credo_step: getCurrentCredoStep(chatStage),
                    confidence: 0.6,
                    source,
                    sourceType,
                    sectionId,
                    timestamp: Date.now(),
                  });
                }
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
                  // FIX Sprint 3: sync avec backend phase_credo + botCount/3 (meme logique que path non-streaming)
                  const CREDO_TO_STAGE: Record<string, number> = { C: 0, R: 1, E: 2, D: 3, O: 4 };
                  if (lastCREDOPhase && CREDO_TO_STAGE[lastCREDOPhase] !== undefined) {
                    const target = CREDO_TO_STAGE[lastCREDOPhase];
                    if (target > chatStage) setChatStage(target);
                  } else {
                    const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
                    const targetStage = Math.min(4, Math.floor(botCount / 3));
                    if (targetStage > chatStage) setChatStage(targetStage);
                  }
                }
              } else {
                // FIX Sprint 3: sync avec backend phase_credo + botCount/3 (meme logique que path non-streaming)
                const CREDO_TO_STAGE: Record<string, number> = { C: 0, R: 1, E: 2, D: 3, O: 4 };
                if (lastCREDOPhase && CREDO_TO_STAGE[lastCREDOPhase] !== undefined) {
                  const target = CREDO_TO_STAGE[lastCREDOPhase];
                  if (target > chatStage) setChatStage(target);
                } else {
                  const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
                  const targetStage = Math.min(4, Math.floor(botCount / 3));
                  if (targetStage > chatStage) setChatStage(targetStage);
                }
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
                  addWorkspaceBlock({
                    id: `blk-cascade-${Date.now()}`,
                    type: "libre",
                    title: c.label,
                    summary: cascadeContent,
                    credo_step: getCurrentCredoStep(chatStage),
                    confidence: 0.7,
                    source: (cMsg as any).botCode || activeBotCode,
                    sourceType: "chat",
                    sectionId: c.section_id,
                    timestamp: Date.now(),
                  });
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
            addWorkspaceBlock({
              id: `blk-${Date.now()}`,
              type: "libre",
              title: extractTitle(lastBot.content),
              summary: lastBot.content,
              credo_step: getCurrentCredoStep(chatStage),
              confidence: 1.0,
              source,
              sourceType,
              sectionId: pendingCapture,
              timestamp: Date.now(),
            });
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
      const sectionId = getSmartSectionId(completeBots[0], activePhase, chatStage, pendingCapture, activeDeliverable);
      if (!sectionId) return;

      for (const msg of completeBots) {
        const source = (msg as any).botCode || activeBotCode;
        const sourceType = (msg as any).msgType === "voice" ? "voice" as const : "chat" as const;
        const msgContentTypes = (msg as any).cristallisationSuggestion?.content_types as string[] | undefined;
        if (isDiscussion) {
          // ═══ GUARD ANTI-DUPLICATION — skip si ce message a déjà généré un bloc ═══
          if (processedBlockMsgIds.current.has(msg.id)) {
            console.log(`[WorkspaceCapture] SKIP duplicate block for msg ${msg.id} (length path)`);
            continue;
          }
          // ═══ WORKSPACE BLOCK INTELLIGENT — backend ou fallback frontend ═══
          const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
          const wsBlock = (msg as any).workspace_block as Partial<WorkspaceBlock> | undefined;
          // S2.4 — Multi-artifact support
          const wsBlocks = (msg as any).workspace_blocks as Partial<WorkspaceBlock>[] | undefined;
          const secondaries = (msg as any).msgType === "multi-enriched" && (msg as any).secondaryInputs?.length > 0
            ? (msg as any).secondaryInputs as Array<{agent: string; nom: string; contenu: string}>
            : null;

          if (wsBlocks && wsBlocks.length > 0) {
            // Multi-artifact: bot generated multiple <artifact> tags
            processedBlockMsgIds.current.add(msg.id);
            for (let ai = 0; ai < wsBlocks.length; ai++) {
              const ab = wsBlocks[ai];
              if (!ab.type || !ab.title) continue;
              addWorkspaceBlock({
                id: ab.id || `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                type: ab.type as WorkspaceBlockType,
                title: ab.title,
                summary: ab.summary || msg.content.substring(0, 200),
                structured_data: ab.structured_data,
                credo_step: (ab.credo_step as any) || getCurrentCredoStep(chatStage),
                confidence: ab.confidence || 0.95,
                source,
                sourceType,
                sectionId,
                timestamp: Date.now() + ai,
              });
            }
          } else if (wsBlock && wsBlock.type && wsBlock.title) {
            // Single artifact from backend
            processedBlockMsgIds.current.add(msg.id);
            const blockData: WorkspaceBlock = {
              id: wsBlock.id || `blk-${Date.now()}`,
              type: wsBlock.type as WorkspaceBlockType,
              title: wsBlock.title,
              summary: wsBlock.summary || msg.content.substring(0, 200),
              structured_data: wsBlock.structured_data,
              credo_step: (wsBlock.credo_step as any) || getCurrentCredoStep(chatStage),
              confidence: wsBlock.confidence || 0.8,
              source,
              sourceType,
              sectionId,
              timestamp: Date.now(),
              replace_block_id: wsBlock.replace_block_id,
            };
            // Enrich structured_data with multi-agent contributions if present
            if (secondaries && blockData.structured_data) {
              blockData.structured_data.contributions = secondaries.map((s: any) => ({
                bot: s.agent, name: s.nom, input: s.contenu,
              }));
            }
            addWorkspaceBlock(blockData);
          } else if (!(msg as any).workspace_block_skip || workspaceBlocks.length === 0) {
            // Fallback frontend: détection locale + extraction structured_data
            processedBlockMsgIds.current.add(msg.id);
            const detectedType = detectBlockTypeFrontend(msg.content);
            const extractedData = extractStructuredDataFrontend(msg.content, detectedType);
            const blockData: WorkspaceBlock = {
              id: `blk-${Date.now()}`,
              type: detectedType,
              title: extractTitle(msg.content),
              summary: summarizeForWorkspace(lastUserMsg?.content || "Discussion", msg.content),
              structured_data: extractedData,
              credo_step: getCurrentCredoStep(chatStage),
              confidence: 0.6,
              source,
              sourceType,
              sectionId,
              timestamp: Date.now(),
            };
            if (secondaries) {
              blockData.structured_data = {
                ...(extractedData || {}),
                contributions: secondaries.map((s: any) => ({
                  bot: s.agent, name: s.nom, input: s.contenu,
                })),
              };
            }
            addWorkspaceBlock(blockData);
          }

          // Accumulate in existing block for same sectionId (entonnoir effect)
          const summary = summarizeForWorkspace(lastUserMsg?.content || "Discussion", msg.content);
          const enrichedSummary = secondaries
            ? `${summary}\n---\n${secondaries.map((s: any) => `  [${s.nom}] ${s.contenu}`).join("\n")}`
            : summary;
          const existing = getCristallise(sectionId);
          if (existing) {
            editCristallise(sectionId, existing + "\n\n" + enrichedSummary);
          }
        } else {
          // ═══ RÉSUMÉ INTELLIGENT — autres phases (conception, exécution, etc.) ═══
          const wsBlock = (msg as any).workspace_block as Partial<WorkspaceBlock> | undefined;
          if (wsBlock && wsBlock.type && wsBlock.title) {
            // Backend a généré un workspace_block structuré
            addWorkspaceBlock({
              id: wsBlock.id || `blk-${Date.now()}`,
              type: wsBlock.type as WorkspaceBlockType,
              title: wsBlock.title,
              summary: wsBlock.summary || msg.content.substring(0, 300),
              structured_data: wsBlock.structured_data,
              credo_step: getCurrentCredoStep(chatStage),
              confidence: wsBlock.confidence || 0.8,
              source,
              sourceType,
              sectionId,
              timestamp: Date.now(),
            });
          } else {
            const detectedType = detectBlockTypeFrontend(msg.content);
            const extractedData = extractStructuredDataFrontend(msg.content, detectedType);
            const lastUserMsg2 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
            addWorkspaceBlock({
              id: `blk-${Date.now()}`,
              type: detectedType,
              title: extractTitle(msg.content),
              summary: summarizeForWorkspace(lastUserMsg2?.content || "Conception", msg.content),
              structured_data: extractedData,
              credo_step: getCurrentCredoStep(chatStage),
              confidence: 0.6,
              source,
              sourceType,
              sectionId,
              timestamp: Date.now(),
            });
          }
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
            // FIX Lacune 2: Sync avec backend phase_credo au lieu de botCount/2
            const CREDO_TO_STAGE: Record<string, number> = { C: 0, R: 1, E: 2, D: 3, O: 4 };
            if (lastCREDOPhase && CREDO_TO_STAGE[lastCREDOPhase] !== undefined) {
              const target = CREDO_TO_STAGE[lastCREDOPhase];
              if (target > chatStage) setChatStage(target);
            } else {
              // Fallback conservateur: botCount/3 (aligne sur backend seuils 3,6,9)
              const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
              const targetStage = Math.min(4, Math.floor(botCount / 3));
              if (targetStage > chatStage) setChatStage(targetStage);
            }
          }
        } else {
          // FIX Lacune 2: Sync avec backend phase_credo au lieu de botCount/2
          const CREDO_TO_STAGE: Record<string, number> = { C: 0, R: 1, E: 2, D: 3, O: 4 };
          if (lastCREDOPhase && CREDO_TO_STAGE[lastCREDOPhase] !== undefined) {
            const target = CREDO_TO_STAGE[lastCREDOPhase];
            if (target > chatStage) setChatStage(target);
          } else {
            // Fallback conservateur: botCount/3 (aligne sur backend seuils 3,6,9)
            const botCount = messages.filter((m: any) => m.role === "assistant" && (m as any).isStreaming !== true).length;
            const targetStage = Math.min(4, Math.floor(botCount / 3));
            if (targetStage > chatStage) setChatStage(targetStage);
          }
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
            addWorkspaceBlock({
              id: `blk-cascade-${Date.now()}`,
              type: "libre",
              title: c.label,
              summary: cascadeContent,
              credo_step: getCurrentCredoStep(chatStage),
              confidence: 0.7,
              source: (msg as any).botCode || activeBotCode,
              sourceType: "chat",
              sectionId: c.section_id,
              timestamp: Date.now(),
            });
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
        addWorkspaceBlock({
          id: `blk-${Date.now()}`,
          type: "libre",
          title: extractTitle(lastBot.content),
          summary: lastBot.content,
          credo_step: getCurrentCredoStep(chatStage),
          confidence: 1.0,
          source,
          sourceType,
          sectionId: pendingCapture,
          timestamp: Date.now(),
        });
      }
      setPendingCapture(null);
    }
  }, [messages, activePhase, pendingCapture, setPendingCapture, activeBotCode, chatStage, setChatStage, setActivePhase, setReflexionContext, setRightSection, getCristallise, editCristallise, addWorkflowItem, addWorkspaceBlock]);

  // ═══ AUTO-SYNTHESE — generer un bloc synthese quand chatStage monte (transition CREDO) ═══
  const prevSynthStageRef = useRef(chatStage);
  useEffect(() => {
    const prevStage = prevSynthStageRef.current;
    if (chatStage <= prevStage || chatStage < 1) {
      prevSynthStageRef.current = chatStage;
      return;
    }
    prevSynthStageRef.current = chatStage;

    const CREDO_NAMES: Record<string, string> = { C: "Connexion", R: "Recherche", E: "Exposition", D: "Demonstration", O: "Obtention" };
    const prevStep = getCurrentCredoStep(prevStage);
    const prevBlocks = workspaceBlocks.filter(b => b.credo_step === prevStep && b.type !== "synthese" && b.type !== "rapport");

    if (prevBlocks.length === 0) return;

    const points = prevBlocks.map(b => ({ label: b.title || b.type, done: true }));
    addWorkspaceBlock({
      id: `synthese-${prevStep}-${Date.now()}`,
      type: "synthese",
      title: `Synthese ${CREDO_NAMES[prevStep] || prevStep}`,
      summary: `${prevBlocks.length} element(s) captures en phase ${CREDO_NAMES[prevStep] || prevStep}`,
      structured_data: { points },
      credo_step: prevStep,
      confidence: 1.0,
      source: activeBotCode,
      sourceType: "chat",
      timestamp: Date.now(),
    });
  }, [chatStage, workspaceBlocks, activeBotCode, addWorkspaceBlock]);
}
