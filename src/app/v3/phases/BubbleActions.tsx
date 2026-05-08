/**
 * BubbleActions.tsx — Niveau 2: Actions structurelles sous les bulles bot
 *
 * Bible Live 4.14/4.18 — "Comment je veux traiter ca?"
 * Phase-gate: les actions apparaissent progressivement selon chatStage (comme V2 BotMessageActions)
 *
 * chatStage 0 (comprendre): Approfondir seulement
 * chatStage 1 (rechercher): + Challenger, Consulter
 * chatStage 2 (exposer): toutes les primaires
 * chatStage 3+ (demontrer/objectif): + Cristalliser, GPS, transition phase
 */

import { useState } from "react";
import { Swords, Search, Users, Diamond, ChevronDown, ChevronUp, Zap, ArrowRight } from "lucide-react";
import { parseMessageSegments } from "../utils/parse-segments";

interface BubbleActionsProps {
  onAction: (prompt: string) => void;
  onCristallise: () => void;
  /** Progression dans la phase (0=comprendre, 1=rechercher, 2=exposer, 3=demontrer, 4=objectif) */
  chatStage: number;
  /** Contenu du dernier message bot — utilise pour contextualiser les prompts d'action */
  messageContent: string;
  /** Label de transition de phase — null si pas pret */
  phaseTransition?: string | null;
  onPhaseTransition?: () => void;
  /** Suggestion GPS de cristallisation automatique */
  gpsSuggestion?: { section_id: string; section_label: string; confidence: number } | null;
  onGpsCristallise?: () => void;
}

/** Extrait le VRAI sujet du message bot (skip les phrases de politesse/filler) */
function extractSujet(messageContent: string): string {
  const FILLER = /^(absolument|exactement|parfait|bien sûr|oui|non|ok|d'accord|certainement|effectivement|tout à fait|excellent|super|bonne question|c'est une|je comprends|merci|salut|bonjour|hey)/i;
  const sentences = messageContent.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 10);
  // Skip filler sentences, take the first meaningful one
  const meaningful = sentences.find(s => !FILLER.test(s));
  return (meaningful || sentences[1] || sentences[0] || "ce sujet").substring(0, 100);
}

function buildActions(messageContent: string) {
  // S102-B — Section-aware: detecter les sections ### pour un challenger cible
  const segments = parseMessageSegments(messageContent);
  const namedSegments = segments.filter(s => s.title && s.text.length > 30);

  if (namedSegments.length >= 2) {
    // ═══ MULTI-SECTION — actions par section (SWOT, diagnostic, etc.) ═══
    return [
      { id: "approfondir", label: "Approfondir", icon: Search,
        prompt: `Approfondis ton analyse globale. Donne plus de details concrets et d'exemples.`,
        minStage: 0 },
      // Challenger par section — max 4 sections
      ...namedSegments.slice(0, 4).map((seg, i) => ({
        id: `challenger-${i}`,
        label: `Challenger: ${seg.title}`,
        icon: Swords,
        prompt: `Challenge specifiquement la section "${seg.title}" de ton analyse. Trouve les failles et angles morts de: ${seg.text.slice(0, 300)}`,
        minStage: 1,
      })),
    ];
  }

  // ═══ SINGLE-SECTION — comportement existant (extractSujet) ═══
  const sujet = extractSujet(messageContent);
  return [
    { id: "approfondir", label: "Approfondir", icon: Search,
      prompt: `Approfondis ton analyse. En particulier sur: "${sujet}". Donne plus de details concrets, de chiffres et d'exemples.`,
      minStage: 0 },
    { id: "challenger", label: "Challenger", icon: Swords,
      prompt: `Challenge ta position sur "${sujet}". Joue l'avocat du diable: trouve les failles, les angles morts, et les risques que tu n'as pas mentionnes.`,
      minStage: 1 },
    { id: "consulter", label: "Consulter", icon: Users,
      prompt: `Concernant "${sujet}", quel autre expert de l'equipe devrait se prononcer? Invoque-le et donne son point de vue.`,
      minStage: 1 },
  ];
}

const ADVANCED_ACTIONS = [
  { id: "nuancer", label: "Nuancer", prompt: "Nuance cette analyse. Quels cas particuliers ou exceptions existent?" },
  { id: "plan-action", label: "Plan d'action", prompt: "Transforme cette discussion en plan d'action concret avec etapes, responsables et echeances." },
  { id: "risques", label: "Risques", prompt: "Quels sont les risques et pieges potentiels de cette approche?" },
  { id: "et-si", label: "Et si?", prompt: "Et si on prenait le probleme completement a l'envers? Propose une approche contraire." },
  { id: "deleguer", label: "Deleguer", prompt: "Qui dans l'equipe devrait executer ca? Propose une delegation claire." },
];

export function BubbleActions({ onAction, onCristallise, chatStage, messageContent, phaseTransition, onPhaseTransition, gpsSuggestion, onGpsCristallise }: BubbleActionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Phase-gate: filtrer les actions selon la progression, avec prompts contextuels
  const allActions = buildActions(messageContent);
  const visibleActions = allActions.filter(a => chatStage >= a.minStage);
  const showCristalliser = chatStage >= 3;
  // S103 — GPS visible dès le début (pas gate par chatStage >= 3), seuil 0.5
  const showGps = gpsSuggestion && gpsSuggestion.confidence >= 0.5 && onGpsCristallise;

  return (
    <div className="space-y-1">
      {/* Actions primaires — phase-gatees */}
      <div className="flex flex-wrap items-center gap-1">
        {visibleActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.prompt)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 cursor-pointer transition-all font-medium"
          >
            <action.icon className="h-2.5 w-2.5" />
            {action.label}
          </button>
        ))}
        {/* Cristalliser — seulement apres phase Demontrer (chatStage >= 3) */}
        {showCristalliser && (
          <button
            onClick={onCristallise}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer transition-all font-medium"
          >
            <Diamond className="h-2.5 w-2.5" />
            Cristalliser
          </button>
        )}
        {/* Transition de phase */}
        {phaseTransition && onPhaseTransition && (
          <button
            onClick={onPhaseTransition}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-sky-600 border border-sky-200 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 cursor-pointer transition-all font-medium"
          >
            <ArrowRight className="h-2.5 w-2.5" />
            {phaseTransition}
          </button>
        )}
        {/* Toggle avance — seulement si assez de progression */}
        {chatStage >= 2 && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
          </button>
        )}
      </div>

      {/* Actions avancees (collapsees) */}
      {showAdvanced && chatStage >= 2 && (
        <div className="flex flex-wrap items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {ADVANCED_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.prompt)}
              className="px-2 py-0.5 rounded-md text-[10px] text-gray-400 border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 hover:text-gray-600 cursor-pointer transition-all"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* GPS suggestion — cristallisation detectee par le backend */}
      {showGps && (
        <button
          onClick={onGpsCristallise!}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors"
        >
          <Zap className="h-2.5 w-2.5" />
          <span>Cristalliser dans : {gpsSuggestion!.section_label}</span>
        </button>
      )}
    </div>
  );
}
