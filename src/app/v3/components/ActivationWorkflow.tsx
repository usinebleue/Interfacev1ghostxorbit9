/**
 * ActivationWorkflow.tsx — Mini-wizard activation chantier
 *
 * 3 etapes:
 *   1. Selection — Quels projets/missions activer?
 *   2. Assignation — Qui fait quoi? (bots + humains)
 *   3. Confirmation — Resume + lancer
 *
 * Accessible depuis ChantierEntityDetail (bouton "Lancer l'execution")
 * Appelle POST /api/v1/chantiers/{id}/activate
 */

import { useState, useEffect } from "react";
import {
  X, Play, Users, CheckCircle2,
  ChevronRight, ChevronLeft, FolderOpen,
  Target, Zap,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";

// ═══ Types ═══

interface Projet {
  id: number;
  titre: string;
  missions?: Mission[];
}

interface Mission {
  id: number;
  titre: string;
  bot_primaire?: string;
  status?: string;
}

interface ActivationWorkflowProps {
  open: boolean;
  onClose: () => void;
  chantierId: number;
  chantierTitre: string;
  projets: Projet[];
  onActivated?: () => void;
}

// ═══ Composant principal ═══

export function ActivationWorkflow({
  open,
  onClose,
  chantierId,
  chantierTitre,
  projets,
  onActivated,
}: ActivationWorkflowProps) {
  const [step, setStep] = useState(0);
  const [selectedProjets, setSelectedProjets] = useState<Set<number>>(new Set());
  const [assignations, setAssignations] = useState<Record<number, { type: string; nom: string }>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Pre-select all projets
  useEffect(() => {
    if (open && projets.length > 0) {
      setSelectedProjets(new Set(projets.map(p => p.id)));
    }
  }, [open, projets]);

  if (!open) return null;

  function toggleProjet(id: number) {
    setSelectedProjets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedMissions = projets
    .filter(p => selectedProjets.has(p.id))
    .flatMap(p => p.missions || []);

  async function handleActivate() {
    setLoading(true);
    try {
      const assignList = Object.entries(assignations).map(([mid, a]) => ({
        mission_id: Number(mid),
        assignee_type: a.type,
        assignee_nom: a.nom,
      }));
      await fetch(`/api/v1/chantiers/${chantierId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projet_ids: Array.from(selectedProjets),
          assignations: assignList,
        }),
      });
      setDone(true);
      onActivated?.();
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl border border-gray-200 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h3 className="text-sm font-bold text-gray-900">Chantier activé!</h3>
            <p className="text-xs text-gray-500">
              {selectedProjets.size} projets et {selectedMissions.length} missions sont maintenant en cours.
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

  const STEPS = ["Sélection", "Assignation", "Confirmation"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-violet-50">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-bold text-gray-900">Activer — {chantierTitre}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-50 bg-gray-50/50">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full",
                i === step ? "bg-violet-100 text-violet-700" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
              )}>{i + 1}. {s}</span>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Selection */}
          {step === 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 mb-2">Sélectionnez les projets à activer:</p>
              {projets.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleProjet(p.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer text-left",
                    selectedProjets.has(p.id)
                      ? "border-violet-300 bg-violet-50 shadow-sm"
                      : "border-gray-200 bg-white hover:shadow-md hover:border-blue-200"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                    selectedProjets.has(p.id) ? "border-violet-500 bg-violet-500" : "border-gray-300"
                  )}>
                    {selectedProjets.has(p.id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <FolderOpen className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-gray-900 block truncate">{p.titre}</span>
                    <span className="text-[9px] text-gray-500">{(p.missions || []).length} missions</span>
                  </div>
                </button>
              ))}
              {projets.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-4">Aucun projet dans ce chantier</p>
              )}
            </div>
          )}

          {/* Step 2: Assignation */}
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 mb-2">Assignez les responsables ({selectedMissions.length} missions):</p>
              {selectedMissions.map(m => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5">
                  <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-[10px] font-medium text-gray-800 flex-1 truncate">{m.titre}</span>
                  <select
                    className="text-[9px] border border-gray-200 rounded-md px-1.5 py-1 bg-gray-50"
                    value={assignations[m.id]?.type || m.bot_primaire || "bot"}
                    onChange={e => setAssignations(prev => ({
                      ...prev,
                      [m.id]: { type: e.target.value === "humain" ? "humain" : "bot", nom: e.target.value },
                    }))}
                  >
                    <option value="bot">Bot (auto)</option>
                    <option value="humain">Humain</option>
                  </select>
                </div>
              ))}
              {selectedMissions.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-4">Aucune mission dans les projets sélectionnés</p>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Résumé d'activation</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-[10px] text-gray-700"><strong>{selectedProjets.size}</strong> projets à activer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[10px] text-gray-700"><strong>{selectedMissions.length}</strong> missions à démarrer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[10px] text-gray-700">
                      <strong>{Object.values(assignations).filter(a => a.type === "humain").length}</strong> humains,{" "}
                      <strong>{selectedMissions.length - Object.values(assignations).filter(a => a.type === "humain").length}</strong> bots
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {step > 0 ? "Retour" : "Annuler"}
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && selectedProjets.size === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Suivant <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? <Target className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              {loading ? "Activation..." : "Activer le chantier"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
