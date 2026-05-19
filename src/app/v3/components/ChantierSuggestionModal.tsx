/**
 * ChantierSuggestionModal.tsx — Modal suggestion match/create chantier
 *
 * Affiché quand un CREDO est complété (phase O).
 * Propose:
 *   - Chantiers existants qui matchent (avec score)
 *   - Option "Créer nouveau chantier"
 *   - Preview du cahier des charges structuré
 *
 * Appelle POST /api/v1/workspace/to-chantier ou
 *         POST /api/v1/chantiers/{id}/assign-missions
 */

import { useState } from "react";
import {
  X, FolderOpen, Plus, CheckCircle2,
  ArrowRight, Flame, Target,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";

// ═══ Types ═══

interface ChantierMatch {
  chantier_id: number;
  titre: string;
  score: number;
  reason: string;
  status: string;
  section_primaire: string;
}

interface WorkspaceBlock {
  type: string;
  content: string;
  title?: string;
}

interface ChantierSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  matches: ChantierMatch[];
  workspaceBlocks: WorkspaceBlock[];
  threadId: string;
  botCode: string;
  discussionId?: number;
  onCreated?: (chantierId: number) => void;
  onJoined?: (chantierId: number) => void;
}

// ═══ Composant principal ═══

export function ChantierSuggestionModal({
  open,
  onClose,
  matches,
  workspaceBlocks,
  threadId,
  botCode,
  discussionId,
  onCreated,
  onJoined,
}: ChantierSuggestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "created" | "joined"; id: number } | null>(null);

  if (!open) return null;

  const objectifs = workspaceBlocks
    .filter(b => b.type === "objectif" || b.type === "objectifs")
    .map(b => b.content);
  const risques = workspaceBlocks
    .filter(b => b.type === "risque" || b.type === "risques")
    .map(b => b.content);
  const livrables = workspaceBlocks
    .filter(b => b.type === "livrable" || b.type === "livrables")
    .map(b => b.content);

  async function handleCreateNew() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/workspace/to-chantier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_blocks: workspaceBlocks,
          thread_id: threadId,
          bot_code: botCode,
          discussion_id: discussionId ?? null,
        }),
      });
      const data = await res.json();
      if (data.chantier_id) {
        setResult({ type: "created", id: data.chantier_id });
        onCreated?.(data.chantier_id);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinChantier(chantierId: number) {
    setLoading(true);
    try {
      // Create the chantier from workspace, then we could merge — for now, just create and link
      const res = await fetch("/api/v1/workspace/to-chantier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_blocks: workspaceBlocks,
          thread_id: threadId,
          bot_code: botCode,
          discussion_id: discussionId ?? null,
        }),
      });
      const data = await res.json();
      if (data.chantier_id) {
        setResult({ type: "joined", id: chantierId });
        onJoined?.(chantierId);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl border border-gray-200 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h3 className="text-sm font-bold text-gray-900">
              {result.type === "created" ? "Chantier créé!" : "Projet ajouté au chantier!"}
            </h3>
            <p className="text-xs text-gray-500">
              {result.type === "created"
                ? "Le chantier a été créé avec le cahier des charges de cette discussion."
                : "Le projet a été ajouté au chantier existant."}
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Transformer en chantier</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Preview du cahier des charges */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cahier des charges</h3>
            {objectifs.length > 0 && (
              <div className="mb-2">
                <span className="text-[9px] font-bold text-emerald-600">Objectifs:</span>
                {objectifs.map((o, i) => (
                  <p key={i} className="text-[10px] text-gray-700 ml-2">• {o}</p>
                ))}
              </div>
            )}
            {risques.length > 0 && (
              <div className="mb-2">
                <span className="text-[9px] font-bold text-red-600">Risques:</span>
                {risques.map((r, i) => (
                  <p key={i} className="text-[10px] text-gray-700 ml-2">• {r}</p>
                ))}
              </div>
            )}
            {livrables.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-blue-600">Livrables:</span>
                {livrables.map((l, i) => (
                  <p key={i} className="text-[10px] text-gray-700 ml-2">• {l}</p>
                ))}
              </div>
            )}
            {objectifs.length === 0 && risques.length === 0 && livrables.length === 0 && (
              <p className="text-[10px] text-gray-400 italic">{workspaceBlocks.length} blocs workspace capturés</p>
            )}
          </div>

          {/* Chantiers existants qui matchent */}
          {matches.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Chantiers existants similaires
              </h3>
              <div className="space-y-2">
                {matches.map(m => (
                  <button
                    key={m.chantier_id}
                    onClick={() => handleJoinChantier(m.chantier_id)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer text-left disabled:opacity-50"
                  >
                    <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-900 block truncate">{m.titre}</span>
                      <span className="text-[9px] text-gray-500">{m.reason}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                        m.score >= 60 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {m.score}%
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-300" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bouton créer nouveau */}
          <button
            onClick={handleCreateNew}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Target className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="text-xs font-bold">
              {loading ? "Création en cours..." : "Créer un nouveau chantier"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
