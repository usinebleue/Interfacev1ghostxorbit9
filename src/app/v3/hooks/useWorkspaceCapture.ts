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

import { useEffect, useRef, useCallback, useState } from "react";
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
 * Résumé intelligent pour le workspace — extraction multi-signal des insights clés.
 *
 * Stratégie d'extraction (par priorité):
 * 1. Bullet points / listes numérotées (souvent les idées-clés)
 * 2. Texte en **gras** (takeaways explicites du bot)
 * 3. Dernière phrase substantielle (conclusion/recommandation)
 * 4. Première phrase non-filler (contexte)
 *
 * Résultat: 3-5 points-clés maximum, format lisible, PAS de dump.
 */
const FILLER_RE = /^(absolument|exactement|parfait|bien sûr|bien reçu|oui|non|ok|d'accord|certainement|effectivement|tout à fait|excellent|super|bonne question|c'est une|je comprends|merci|salut|bonjour|hey|on y va|on s'attaque|on se penche|on met|on passe|voyons|alors|donc|en effet|précisément)/i;

function summarizeForWorkspace(userChoice: string, botContent: string): string {
  const lines = botContent.split('\n').map(l => l.trim()).filter(Boolean);
  const shortChoice = userChoice.substring(0, 80);

  // 1. Extraire les bullet points / items numérotés (max 5)
  const bulletItems: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*(?:(\d+)[.)]\s+|[-*•→➤]\s+)(.+)/);
    if (match) {
      let text = (match[2] || "").trim();
      // Nettoyer le markdown gras
      text = text.replace(/\*\*(.+?)\*\*/g, "$1");
      if (text.length > 15 && text.length < 150) {
        bulletItems.push(text);
      }
    }
    if (bulletItems.length >= 5) break;
  }

  // 2. Extraire les segments en **gras** (takeaways explicites)
  const boldSegments: string[] = [];
  const boldRe = /\*\*(.{10,80}?)\*\*/g;
  let boldMatch: RegExpExecArray | null;
  while ((boldMatch = boldRe.exec(botContent)) !== null) {
    const seg = boldMatch[1].trim();
    // Éviter les doublons avec les bullets
    if (!bulletItems.some(b => b.includes(seg) || seg.includes(b))) {
      boldSegments.push(seg);
    }
    if (boldSegments.length >= 3) break;
  }

  // 3. Extraire la conclusion (dernière phrase substantielle non-bullet)
  let conclusion = "";
  const substantialLines = lines.filter(l =>
    l.length > 30 &&
    !l.match(/^\s*[-*•→➤\d.)#]/) &&
    !FILLER_RE.test(l)
  );
  if (substantialLines.length > 0) {
    const lastSubstantial = substantialLines[substantialLines.length - 1];
    // Prendre la conclusion seulement si elle est différente du contenu des bullets
    if (!bulletItems.some(b => lastSubstantial.includes(b))) {
      conclusion = lastSubstantial.replace(/\*\*(.+?)\*\*/g, "$1").substring(0, 120);
    }
  }

  // 4. Construire le résumé structuré
  const parts: string[] = [];

  // Contexte utilisateur (court)
  if (shortChoice && shortChoice.length > 5) {
    parts.push(`**Question:** ${shortChoice}`);
  }

  // Points-clés (bullets ou gras, max 4 combinés)
  const keyPoints: string[] = [];
  if (bulletItems.length >= 2) {
    // Si on a des bullets structurés, les utiliser en priorité
    keyPoints.push(...bulletItems.slice(0, 4));
  } else {
    // Sinon, combiner les segments gras + premier bullet si dispo
    if (boldSegments.length > 0) keyPoints.push(...boldSegments.slice(0, 3));
    if (bulletItems.length > 0) keyPoints.push(...bulletItems.slice(0, 2));
  }

  if (keyPoints.length > 0) {
    parts.push(keyPoints.map(p => `• ${p.substring(0, 100)}`).join("\n"));
  } else {
    // Fallback: première phrase non-filler (comme avant mais mieux formatée)
    const firstMeaningful = substantialLines[0] || lines.find(l => l.length > 20 && !FILLER_RE.test(l));
    if (firstMeaningful) {
      parts.push(firstMeaningful.replace(/\*\*(.+?)\*\*/g, "$1").substring(0, 180));
    }
  }

  // Conclusion / recommandation
  if (conclusion && keyPoints.length > 0) {
    parts.push(`→ ${conclusion}`);
  }

  return parts.join("\n\n");
}

/**
 * Résumé intelligent pour les EXPERTS — garde les points-clés de la perspective.
 * Les experts sont typiquement plus courts et plus directs que le bot primaire.
 * On extrait: bullet points + première phrase d'intro + conclusion.
 */
export function summarizeExpertForWorkspace(expertContent: string): string {
  const lines = expertContent.split('\n').map(l => l.trim()).filter(Boolean);

  // Extraire les bullet points (coeur de la perspective)
  const bulletItems: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*(?:(\d+)[.)]\s+|[-*•→➤]\s+)(.+)/);
    if (match) {
      let text = (match[2] || "").trim().replace(/\*\*(.+?)\*\*/g, "$1");
      if (text.length > 15 && text.length < 200) {
        bulletItems.push(text);
      }
    }
    if (bulletItems.length >= 5) break;
  }

  // Extraire les segments en gras (insights clés)
  const boldSegments: string[] = [];
  const boldRe = /\*\*(.{10,100}?)\*\*/g;
  let bm: RegExpExecArray | null;
  while ((bm = boldRe.exec(expertContent)) !== null) {
    const seg = bm[1].trim();
    if (!bulletItems.some(b => b.includes(seg))) boldSegments.push(seg);
    if (boldSegments.length >= 3) break;
  }

  // Construire le résumé
  const parts: string[] = [];

  // Si on a des bullets structurés, les utiliser
  if (bulletItems.length >= 2) {
    parts.push(bulletItems.slice(0, 4).map(p => `• ${p.substring(0, 120)}`).join("\n"));
  } else if (boldSegments.length >= 1) {
    // Sinon utiliser les segments gras
    parts.push(boldSegments.slice(0, 3).map(p => `• ${p}`).join("\n"));
  } else {
    // Fallback: première phrase non-filler + troncature
    const substantialLines = lines.filter(l =>
      l.length > 25 && !l.match(/^\s*[-*•→➤\d.)#]/) && !FILLER_RE.test(l)
    );
    if (substantialLines.length > 0) {
      // Max 2 phrases pour garder compact
      parts.push(substantialLines.slice(0, 2).map(l =>
        l.replace(/\*\*(.+?)\*\*/g, "$1").substring(0, 150)
      ).join("\n"));
    } else {
      parts.push(expertContent.replace(/\*\*(.+?)\*\*/g, "$1").substring(0, 250));
    }
  }

  // Ajouter une ligne de conclusion si le contenu est long
  if (bulletItems.length >= 3) {
    const lastLines = lines.filter(l => l.length > 30 && !l.match(/^\s*[-*•→➤\d.)]/));
    const lastLine = lastLines[lastLines.length - 1];
    if (lastLine && !bulletItems.some(b => lastLine.includes(b))) {
      parts.push(`→ ${lastLine.replace(/\*\*(.+?)\*\*/g, "$1").substring(0, 120)}`);
    }
  }

  return parts.join("\n\n");
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

export function detectBlockTypeFrontend(text: string): WorkspaceBlockType {
  for (const [type, pattern] of BLOCK_TYPE_PATTERNS) {
    if (pattern.test(text)) return type;
  }
  return "libre";
}

// ═══ Sub-section detection within a CREDO step ═══

const SUB_SECTION_PATTERNS: Record<string, [string, RegExp][]> = {
  C: [
    // "situation" regroupe contexte + enjeux + contraintes + parties prenantes
    ["situation", /contexte|situation|environnement|historique|background|enjeu|tension|problème|probleme|defi|challenge|contrainte|limite|partie.*prenante|acteur/i],
  ],
  R: [
    ["analyses", /diagnostic|analyse|swot|état.*des.*lieux|etat.*des.*lieux|approfond|détail|detail|examen|angle.*mort|benchmark|comparai|référence|reference/i],
    ["modes-reflexion", /débat|debat|brainstorm|crise|stratégie|strategie|innovation|deep/i],
  ],
  E: [
    ["solutions", /option|choix|possibilité|possibilite|alternative|scénario|scenario|recommand|suggestion|proposit|conseil/i],
    ["comparaison", /comparai|avantage|inconvénient|inconvenient|pour.*contre|versus/i],
  ],
  D: [
    ["plan-action", /plan.*action|étape|etape|procédure|procedure|implementat|budget|coût|cout|investissement|timeline|calendrier|échéancier|echeancier|jalon/i],
    ["ressources", /ressource|équipe|equipe|outil|technologie|infrastructure/i],
  ],
  O: [
    ["decisions", /décision|decision|tranch|validé|valide|approuvé|approuve/i],
    ["plan-match", /prochain|suivant|immédiat|immediat|prochaine.*action|kpi|indicateur|métrique|metrique|engagement|responsab/i],
  ],
};

/** Detect which sub-section a block belongs to within a CREDO step */
export function detectCredoSubSection(content: string, credoStep: string): string | undefined {
  const patterns = SUB_SECTION_PATTERNS[credoStep];
  if (!patterns) return undefined;

  for (const [subSection, pattern] of patterns) {
    if (pattern.test(content)) return subSection;
  }
  return undefined;
}

/**
 * Génère un titre intelligent et dynamique à partir du contenu du bloc.
 * Exporté pour usage dans LiveDiscussionView (expert blocks).
 *
 * Stratégie (par priorité):
 * 1. Heading markdown (# ...) → titre direct
 * 2. Premier segment **gras** substantiel → souvent le sujet-clé
 * 3. Sujet extrait de la première phrase substantielle (verbe principal + objet)
 * 4. Fallback: première ligne non-filler tronquée
 *
 * Le titre final est concis (max 55 chars), style "titre d'article".
 */
export function extractTitle(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);

  // 1. Heading markdown explicite
  const heading = lines.find(l => /^#{1,3}\s+.{5,}/.test(l));
  if (heading) {
    const clean = heading.replace(/^#{1,3}\s+/, '').replace(/\*\*/g, '').trim();
    return clean.substring(0, 55) + (clean.length > 55 ? "…" : "");
  }

  // 2. Premier segment **gras** substantiel (souvent le titre implicite du bot)
  const boldMatch = text.match(/\*\*([^*]{8,60})\*\*/);
  if (boldMatch) {
    const bold = boldMatch[1].trim();
    // Filtrer les gras qui sont juste des labels ("Question:", "Résumé:", etc.)
    if (!/^(question|résumé|resume|contexte|note|attention|important)\s*:/i.test(bold)) {
      return bold.substring(0, 55) + (bold.length > 55 ? "…" : "");
    }
  }

  // 3. Extraire le sujet de la première phrase substantielle
  const substantialLines = lines.filter(l =>
    l.length > 20 &&
    !FILLER_RE.test(l) &&
    !/^[#*\-•→➤\d.)\s|]+$/.test(l) &&
    !/^\s*[-*•→➤\d.)]\s/.test(l) // Pas de bullet
  );

  if (substantialLines.length > 0) {
    let phrase = substantialLines[0].replace(/\*\*(.+?)\*\*/g, "$1").trim();
    // Couper à la première ponctuation forte pour avoir un titre concis
    const cutIdx = phrase.search(/[.!?;:—–]\s/);
    if (cutIdx > 15 && cutIdx < 55) {
      phrase = phrase.substring(0, cutIdx);
    }
    // Nettoyer les débuts verbeux
    phrase = phrase
      .replace(/^(voici|voilà|je vous propose|je propose|nous allons|on va|parlons de)\s+/i, '')
      .replace(/^(un|une|le|la|les|l'|des|du)\s+/i, (m) => m.charAt(0).toUpperCase() + m.slice(1));
    // Capitaliser la première lettre
    phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);
    return phrase.substring(0, 55) + (phrase.length > 55 ? "…" : "");
  }

  // 4. Fallback basique
  const raw = lines.find(l => l.length > 5 && !FILLER_RE.test(l)) || lines[0] || text.substring(0, 55);
  const cleaned = raw.replace(/^[#*\-•→➤\d.)\s]+/, '').replace(/\*\*/g, '').trim();
  return cleaned.substring(0, 55) + (cleaned.length > 55 ? "…" : "");
}

/**
 * Génère un titre pour un bloc expert — "BotName — sujet-clé du contenu"
 * au lieu du générique "BotName — Approfondissement".
 *
 * Si extractTitle produit un vrai sujet, on l'utilise. Sinon fallback sur actionLabel.
 */
export function generateExpertBlockTitle(botName: string, content: string, actionLabel: string): string {
  const topic = extractTitle(content);
  // Si le titre extrait est assez substantiel, l'utiliser
  if (topic && topic.length > 12 && !FILLER_RE.test(topic)) {
    // Tronquer pour laisser de la place au nom du bot
    const maxTopic = 42 - Math.min(botName.length, 10);
    const shortTopic = topic.length > maxTopic ? topic.substring(0, maxTopic) + "…" : topic;
    return `${botName} — ${shortTopic}`;
  }
  // Fallback: label d'action générique
  return `${botName} — ${actionLabel}`;
}

// ═══ Frontend: extraction de structured_data depuis le contenu bot ═══

export function extractStructuredDataFrontend(
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

/**
 * Detecte la phase CREDO depuis le contenu de la reponse bot.
 * Fallback intelligent: au lieu de botCount/3, on analyse les mots-cles.
 */
const CREDO_CONTENT_PATTERNS: [RegExp, "C" | "R" | "E" | "D" | "O"][] = [
  [/objectif|conclusion|decision|prochain\s*pas|plan\s*de\s*match|on\s*retient|prochaine\s*etape/i, "O"],
  [/plan\s*d'action|budget|ressource|calendrier|etapes?\s*concrete|timeline|echeancier|investissement/i, "D"],
  [/solution|option|proposition|alternative|recommand|scenario|possibilite|approche\s*possible/i, "E"],
  [/explorer|approfondir|angle\s*mort|recherche|analyse|diagnostic|pourquoi|cause|insight/i, "R"],
  [/probleme|situation|contexte|enjeu|comprendre|clarifi|defi|besoin/i, "C"],
];

function detectCredoPhaseFromContent(text: string): "C" | "R" | "E" | "D" | "O" {
  // Check patterns in reverse priority (O first, C last) — first match wins
  for (const [pattern, phase] of CREDO_CONTENT_PATTERNS) {
    if (pattern.test(text)) return phase;
  }
  return "C";
}

const CREDO_TO_STAGE: Record<string, number> = { C: 0, R: 1, E: 2, D: 3, O: 4 };

/**
 * Calcule le chatStage cible en combinant: backend phase_credo > content heuristic > botCount/3
 */
function computeTargetStage(
  lastCREDOPhase: string | undefined,
  botMessages: any[],
  currentStage: number
): number {
  // Priorite 1: backend phase_credo — avancer de +1 max (progression graduelle)
  if (lastCREDOPhase && CREDO_TO_STAGE[lastCREDOPhase] !== undefined) {
    const target = CREDO_TO_STAGE[lastCREDOPhase];
    // Cap a +1 pour eviter les sauts (backend peut detecter "D" des le premier message)
    return target > currentStage ? currentStage + 1 : currentStage;
  }
  // Priorite 2: content heuristic — meme logique +1 max
  const recentBots = botMessages.slice(-3);
  if (recentBots.length > 0) {
    const lastContent = recentBots[recentBots.length - 1]?.content || "";
    if (lastContent.length > 50) {
      const detected = detectCredoPhaseFromContent(lastContent);
      const target = CREDO_TO_STAGE[detected];
      if (target > currentStage) return currentStage + 1;
    }
  }
  // Priorite 3: fallback conservateur botCount/3
  const botCount = botMessages.filter((m: any) => (m as any).isStreaming !== true).length;
  const fallback = Math.min(4, Math.floor(botCount / 3));
  return fallback > currentStage ? currentStage + 1 : currentStage;
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
  const { messages, lastCREDOPhase, activeThreadId } = useChatContext();
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

  // Wrap addWorkspaceBlock pour injecter automatiquement le discussionId courant
  const addWorkspaceBlockRaw = addWorkspaceBlock;
  const activeThreadIdStableRef = useRef(activeThreadId);
  activeThreadIdStableRef.current = activeThreadId;
  const addWorkspaceBlockWithThread = useCallback((block: WorkspaceBlock) => {
    addWorkspaceBlockRaw({
      ...block,
      discussionId: block.discussionId || activeThreadIdStableRef.current || undefined,
    });
  }, [addWorkspaceBlockRaw]);
  // Alias pour usage dans le reste du hook
  const addWorkspaceBlock_scoped = addWorkspaceBlockWithThread;

  const prevMsgCountRef = useRef(messages.length);
  // Guard anti-duplication: track which message IDs have already generated workspace blocks
  const processedBlockMsgIds = useRef(new Set<string>());

  // Reset dedup quand le thread change
  const prevThreadIdRef = useRef(activeThreadId);
  useEffect(() => {
    if (activeThreadId !== prevThreadIdRef.current) {
      const wasNull = prevThreadIdRef.current === null;
      prevThreadIdRef.current = activeThreadId;
      processedBlockMsgIds.current.clear();
      // Reset msg count si:
      // - Switch entre threads existants (old-id → new-id)
      // - Resume d'un thread avec historique (null → id, mais messages.length > 2)
      // Ne PAS reset sur création de thread (null → id, messages = 1-2)
      // sinon le premier message user n'est jamais traité → pas d'auto-transition
      if (!wasNull || messages.length > 2) {
        prevMsgCountRef.current = messages.length;
      }
    }
  }, [activeThreadId, messages.length]);

  // ═══ VISION CAPTURE — écoute les events CustomEvent depuis useGlassesEvents ═══
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        title: string; content: string; imageUrl: string; ts: number;
      };
      if (!detail?.imageUrl) return;
      addWorkspaceBlock_scoped({
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
  }, [addWorkspaceBlock_scoped]);
  // Fix S100: Track streaming message IDs waiting for completion
  const pendingStreamIdsRef = useRef<Set<string>>(new Set());
  // Track when each message was first seen as _preFinalized (timeout fallback)
  const preFinalizedTimestamps = useRef<Map<string, number>>(new Map());
  // Fix S100: Track if the button's user message has been seen (to detect manual messages)
  const pendingUserMsgSeenRef = useRef(false);

  // Reset manual message tracking when pendingCapture changes
  useEffect(() => {
    if (pendingCapture) {
      pendingUserMsgSeenRef.current = false;
    }
  }, [pendingCapture]);

  // Force re-check for stuck _preFinalized messages (onDone never arrived)
  const [preFinalizedTick, setPreFinalizedTick] = useState(0);
  const preFinalizedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          // mais onDone n'est pas encore arrive avec le workspace_block du backend → attendre max 5s
          if ((msg as any)._preFinalized && !(msg as any).workspace_block) {
            if (!preFinalizedTimestamps.current.has(id)) {
              preFinalizedTimestamps.current.set(id, Date.now());
              // Schedule re-check in 5.5s to process if onDone still hasn't arrived
              if (!preFinalizedTimerRef.current) {
                preFinalizedTimerRef.current = setTimeout(() => {
                  preFinalizedTimerRef.current = null;
                  setPreFinalizedTick(t => t + 1);
                }, 5500);
              }
            }
            const elapsed = Date.now() - (preFinalizedTimestamps.current.get(id) || Date.now());
            if (elapsed < 5000) {
              continue; // Attendre onDone encore un peu
            }
            // Timeout: onDone n'est jamais arrive — capturer quand meme avec le contenu du stale timer
            console.log(`[WorkspaceCapture] Timeout _preFinalized (${elapsed}ms) — processing msg ${id} without onDone`);
          }
          preFinalizedTimestamps.current.delete(id);
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
                // Map cascade_suggestions → action_suggestions
                const cascadeSugs = (msg as any).cascadeSuggestions as Array<{ message: string; target_section?: string }> | undefined;
                const actionSuggestions = cascadeSugs?.slice(0, 2).map(cs => ({
                  label: cs.message.substring(0, 35),
                  prompt: cs.message,
                  target_bot: cs.target_section || source,
                })) || undefined;

                if (wsBlock && wsBlock.type && wsBlock.title) {
                  // Backend a généré un workspace_block structuré
                  processedBlockMsgIds.current.add(msg.id);
                  // Safety net: si le backend summary est trop long (copier-coller), re-summarize
                  let finalSummary = wsBlock.summary || msg.content.substring(0, 200);
                  if (finalSummary.length > 400 && !wsBlock.structured_data) {
                    finalSummary = summarizeForWorkspace(lastUserMsg?.content || "", finalSummary);
                  }
                  addWorkspaceBlock_scoped({
                    id: wsBlock.id || `blk-${Date.now()}`,
                    type: wsBlock.type as WorkspaceBlockType,
                    title: wsBlock.title,
                    summary: finalSummary,
                    structured_data: wsBlock.structured_data,
                    credo_step: (wsBlock.credo_step as any) || getCurrentCredoStep(chatStage),
                    confidence: wsBlock.confidence || 0.8,
                    source,
                    sourceType,
                    sectionId,
                    timestamp: Date.now(),
                    replace_block_id: wsBlock.replace_block_id,
                    action_suggestions: actionSuggestions,
                  });
                } else if (!(msg as any).workspace_block_skip || workspaceBlocks.length === 0) {
                  // Fallback frontend: détection locale + extraction structured_data
                  processedBlockMsgIds.current.add(msg.id);
                  const detectedType = detectBlockTypeFrontend(msg.content);
                  const structuredData = extractStructuredDataFrontend(msg.content, detectedType);
                  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                  const smartSummary = summarizeForWorkspace(lastUserMsg?.content || "", msg.content);
                  addWorkspaceBlock_scoped({
                    id: `blk-${Date.now()}`,
                    type: detectedType,
                    title: extractTitle(msg.content),
                    summary: smartSummary,
                    merge_label: "Discussion",
                    structured_data: structuredData,
                    credo_step: getCurrentCredoStep(chatStage),
                    confidence: 0.6,
                    source,
                    sourceType,
                    sectionId,
                    timestamp: Date.now(),
                    action_suggestions: actionSuggestions,
                  });
                }
                } // end dedup guard
                // Accumulate in existing block for same sectionId (entonnoir effect)
                const lastUserMsg2 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                const existing = getCristallise(sectionId);
                if (existing) {
                  editCristallise(sectionId, existing + "\n\n" + msg.content);
                }
              } else {
                // ═══ RÉSUMÉ INTELLIGENT — autres phases (conception, exécution, etc.) ═══
                // Même pipeline que discussion fallback: détection type + extraction structured_data + résumé
                const wsBlock = (msg as any).workspace_block as Partial<WorkspaceBlock> | undefined;
                if (wsBlock && wsBlock.type && wsBlock.title) {
                  // Backend a généré un workspace_block structuré
                  let finalSummary2 = wsBlock.summary || msg.content.substring(0, 200);
                  if (finalSummary2.length > 400 && !wsBlock.structured_data) {
                    const lastU = [...messages].reverse().find((m2: any) => m2.role === "user" && m2.content);
                    finalSummary2 = summarizeForWorkspace(lastU?.content || "", finalSummary2);
                  }
                  addWorkspaceBlock_scoped({
                    id: wsBlock.id || `blk-${Date.now()}`,
                    type: wsBlock.type as WorkspaceBlockType,
                    title: wsBlock.title,
                    summary: finalSummary2,
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
                  const lastUserMsg2 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                  const smartSummary2 = summarizeForWorkspace(lastUserMsg2?.content || "", msg.content);
                  addWorkspaceBlock_scoped({
                    id: `blk-${Date.now()}`,
                    type: detectedType,
                    title: extractTitle(msg.content),
                    summary: smartSummary2,
                    merge_label: "Conception",
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
                  const target1 = computeTargetStage(lastCREDOPhase, messages.filter((m: any) => m.role === "assistant"), chatStage);
                  if (target1 > chatStage) setChatStage(target1);
                }
              } else {
                const target2 = computeTargetStage(lastCREDOPhase, messages.filter((m: any) => m.role === "assistant"), chatStage);
                if (target2 > chatStage) setChatStage(target2);
              }
            } else {
              setChatStage((s: number) => s + 1);
            }

            // S103 — CASCADES cross-phases (streaming path)
            for (const cMsg of completed) {
              const cascades = (cMsg as any).cascadeItems as Array<{section_id: string; phase: string; label: string}> | undefined;
              if (cascades?.length) {
                const lastUserMsgCasc = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
                cascades.forEach(c => {
                  addWorkspaceBlock_scoped({
                    id: `blk-cascade-${Date.now()}`,
                    type: "libre",
                    title: c.label,
                    summary: summarizeForWorkspace(lastUserMsgCasc?.content || "", cMsg.content),
                    merge_label: "Cascade",
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
            const lastUserMsgPend = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
            addWorkspaceBlock_scoped({
              id: `blk-${Date.now()}`,
              type: "libre",
              title: extractTitle(lastBot.content),
              summary: summarizeForWorkspace(lastUserMsgPend?.content || "", lastBot.content),
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
              addWorkspaceBlock_scoped({
                id: ab.id || `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                type: ab.type as WorkspaceBlockType,
                title: ab.title,
                summary: (ab.summary && ab.summary.length > 400 && !ab.structured_data)
                  ? summarizeForWorkspace(lastUserMsg?.content || "", ab.summary)
                  : (ab.summary || msg.content.substring(0, 200)),
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
            let singleSummary = wsBlock.summary || msg.content.substring(0, 200);
            if (singleSummary.length > 400 && !wsBlock.structured_data) {
              singleSummary = summarizeForWorkspace(lastUserMsg?.content || "", singleSummary);
            }
            const blockData: WorkspaceBlock = {
              id: wsBlock.id || `blk-${Date.now()}`,
              type: wsBlock.type as WorkspaceBlockType,
              title: wsBlock.title,
              summary: singleSummary,
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
            addWorkspaceBlock_scoped(blockData);
          } else if (!(msg as any).workspace_block_skip || workspaceBlocks.length === 0) {
            // Fallback frontend: détection locale + extraction structured_data
            processedBlockMsgIds.current.add(msg.id);
            const detectedType = detectBlockTypeFrontend(msg.content);
            const extractedData = extractStructuredDataFrontend(msg.content, detectedType);
            const lastUserMsg3 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
            const blockData: WorkspaceBlock = {
              id: `blk-${Date.now()}`,
              type: detectedType,
              title: extractTitle(msg.content),
              summary: summarizeForWorkspace(lastUserMsg3?.content || "", msg.content),
              merge_label: "Discussion",
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
            addWorkspaceBlock_scoped(blockData);
          }

          // Accumulate in existing block for same sectionId (entonnoir effect)
          const enrichedSummary = secondaries
            ? `${msg.content}\n---\n${secondaries.map((s: any) => `  [${s.nom}] ${s.contenu}`).join("\n")}`
            : msg.content;
          const existing = getCristallise(sectionId);
          if (existing) {
            editCristallise(sectionId, existing + "\n\n" + enrichedSummary);
          }
        } else {
          // ═══ RÉSUMÉ INTELLIGENT — autres phases (conception, exécution, etc.) ═══
          const wsBlock = (msg as any).workspace_block as Partial<WorkspaceBlock> | undefined;
          if (wsBlock && wsBlock.type && wsBlock.title) {
            // Backend a généré un workspace_block structuré
            let phaseSummary = wsBlock.summary || msg.content.substring(0, 200);
            if (phaseSummary.length > 400 && !wsBlock.structured_data) {
              const lastU2 = [...messages].reverse().find((m2: any) => m2.role === "user" && m2.content);
              phaseSummary = summarizeForWorkspace(lastU2?.content || "", phaseSummary);
            }
            addWorkspaceBlock_scoped({
              id: wsBlock.id || `blk-${Date.now()}`,
              type: wsBlock.type as WorkspaceBlockType,
              title: wsBlock.title,
              summary: phaseSummary,
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
            const lastUserMsg4 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
            addWorkspaceBlock_scoped({
              id: `blk-${Date.now()}`,
              type: detectedType,
              title: extractTitle(msg.content),
              summary: summarizeForWorkspace(lastUserMsg4?.content || "", msg.content),
              merge_label: "Conception",
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
            const target3 = computeTargetStage(lastCREDOPhase, messages.filter((m: any) => m.role === "assistant"), chatStage);
            if (target3 > chatStage) setChatStage(target3);
          }
        } else {
          const target4 = computeTargetStage(lastCREDOPhase, messages.filter((m: any) => m.role === "assistant"), chatStage);
          if (target4 > chatStage) setChatStage(target4);
        }
      } else {
        setChatStage((s: number) => s + 1);
      }

      // ═══ S103 — CASCADES cross-phases ═══
      for (const msg of completeBots) {
        const cascades = (msg as any).cascadeItems as Array<{section_id: string; phase: string; label: string}> | undefined;
        if (cascades?.length) {
          cascades.forEach(c => {
            const lastUserMsg5 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
            addWorkspaceBlock_scoped({
              id: `blk-cascade-${Date.now()}`,
              type: "libre",
              title: c.label,
              summary: summarizeForWorkspace(lastUserMsg5?.content || "", msg.content),
              merge_label: "Cascade",
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
        const lastUserMsgPend2 = [...messages].reverse().find((m: any) => m.role === "user" && m.content);
        addWorkspaceBlock_scoped({
          id: `blk-${Date.now()}`,
          type: "libre",
          title: extractTitle(lastBot.content),
          summary: summarizeForWorkspace(lastUserMsgPend2?.content || "", lastBot.content),
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
  }, [messages, activePhase, pendingCapture, setPendingCapture, activeBotCode, chatStage, setChatStage, setActivePhase, setReflexionContext, setRightSection, getCristallise, editCristallise, addWorkflowItem, addWorkspaceBlock_scoped, preFinalizedTick]);

  // AUTO-SYNTHESE retiré — Carl feedback: "X elements capturés en phase Connexion" est du bruit inutile pour l'utilisateur
}
