/**
 * CristalliseActions.tsx — Boutons d'actions sous le contenu cristallisé
 *
 * Composant partagé: Discussion, Réflexion, Conception.
 * Pattern: copié de WorkspaceSection.tsx L171-192 (action buttons)
 * Badge source: BotBadgeFull compact
 */

import { useState } from "react";
import { Pin, Search, Swords, Pencil, Check, X, RotateCcw } from "lucide-react";
import { BotBadgeFull } from "../../v2/zones/center/shared/BotBadgeFull";
import { parseMessageSegments } from "../utils/parse-segments";

export type CristalliseActionType = "pin" | "deepen" | "challenge" | "merge" | "edit" | "rework";

interface CristalliseActionsProps {
  content: string;
  sectionId: string;
  source: string;
  sourceType: "chat" | "voice" | "meeting";
  onSendPrompt: (prompt: string) => void;
  onPin: (text: string) => void;
  onEdit: (newText: string) => void;
  actions?: CristalliseActionType[];
}

const ACTION_CONFIG: Record<CristalliseActionType, { icon: typeof Pin; label: string; variant: string }> = {
  pin:       { icon: Pin,    label: "Épingler",    variant: "border-gray-200 text-gray-600 hover:bg-gray-50" },
  deepen:    { icon: Search, label: "Approfondir",  variant: "border-blue-200 text-blue-700 hover:bg-blue-50" },
  challenge: { icon: Swords, label: "Challenger",   variant: "border-amber-200 text-amber-700 hover:bg-amber-50" },
  merge:     { icon: Search, label: "Fusionner",    variant: "border-purple-200 text-purple-700 hover:bg-purple-50" },
  edit:      { icon: Pencil, label: "Modifier",     variant: "border-gray-200 text-gray-600 hover:bg-gray-50" },
  rework:    { icon: RotateCcw, label: "Retravailler", variant: "border-sky-200 text-sky-700 hover:bg-sky-50" },
};

export function CristalliseActions({
  content,
  sectionId,
  source,
  sourceType,
  onSendPrompt,
  onPin,
  onEdit,
  actions = ["pin", "deepen", "challenge", "rework", "edit"],
}: CristalliseActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const handleAction = (action: CristalliseActionType) => {
    switch (action) {
      case "pin":
        onPin(content.slice(0, 200));
        break;
      case "deepen":
        onSendPrompt("Approfondir en détail: " + content.slice(0, 400));
        break;
      case "challenge": {
        // S102-B — Section-aware challenger dans le workspace
        const segments = parseMessageSegments(content);
        const named = segments.filter(s => s.title && s.text.length > 30);
        if (named.length >= 2) {
          const sorted = [...named].sort((a, b) => b.text.length - a.text.length);
          onSendPrompt(
            `Challenge la section "${sorted[0].title}" en detail. ` +
            `Aussi, verifie la coherence avec ${named.map(s => s.title).join(", ")}. ` +
            `Contenu: ${sorted[0].text.slice(0, 400)}`
          );
        } else {
          onSendPrompt("Challenge — angles morts: " + content.slice(0, 400));
        }
        break;
      }
      case "merge":
        onSendPrompt("Fusionner et synthétiser: " + content.slice(0, 400));
        break;
      case "rework":
        onSendPrompt(`Retravaille cet élément — améliore et enrichis:\n${content.slice(0, 600)}`);
        break;
      case "edit":
        setEditText(content);
        setIsEditing(true);
        break;
    }
  };

  const saveEdit = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditText(content);
    setIsEditing(false);
  };

  // ═══ Mode édition inline ═══
  if (isEditing) {
    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full min-h-[120px] text-xs text-gray-700 leading-relaxed p-3 rounded-lg border border-blue-200 bg-blue-50/30 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-y"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            onClick={saveEdit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition-colors cursor-pointer"
          >
            <Check className="h-3 w-3" />
            Sauvegarder
          </button>
          <button
            onClick={cancelEdit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-[10px] font-medium transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
            Annuler
          </button>
        </div>
      </div>
    );
  }

  // ═══ Boutons d'actions + badge source ═══
  return (
    <div className="pt-2 border-t border-gray-100 mt-3 space-y-2">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => {
          const cfg = ACTION_CONFIG[action];
          if (!cfg) return null;
          return (
            <button
              key={action}
              onClick={() => handleAction(action)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer ${cfg.variant}`}
            >
              <cfg.icon className="h-3 w-3" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Badge source */}
      <div className="flex items-center gap-1.5">
        <BotBadgeFull botCode={source} compact />
        <span className="text-[9px] text-gray-400">
          {sourceType === "voice" ? "Vocal" : sourceType === "meeting" ? "Réunion" : "Chat"}
        </span>
      </div>
    </div>
  );
}
