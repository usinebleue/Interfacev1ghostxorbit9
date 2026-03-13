/**
 * EntityModal.tsx — Modal create/edit pour Chantier / Projet / Mission / Tache
 * Utilise par BlueprintView via CrudToolbar
 */

import { useState, useEffect } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { BOT_INFO } from "./section-config";

export type EntityLevel = "chantier" | "projet" | "mission" | "tache";

interface EntityModalProps {
  /** Niveau de l'entite */
  level: EntityLevel;
  /** Mode create ou edit */
  mode: "create" | "edit";
  /** Donnees initiales (mode edit) */
  initialData?: Record<string, unknown>;
  /** Options parents (dropdown) */
  parentOptions?: { id: number; titre: string }[];
  /** Label du parent (ex: "Chantier parent") */
  parentLabel?: string;
  /** Callback save */
  onSave: (data: Record<string, unknown>) => Promise<void>;
  /** Callback delete (mode edit) */
  onDelete?: () => Promise<void>;
  /** Callback fermer */
  onClose: () => void;
}

const LEVEL_LABELS: Record<EntityLevel, string> = {
  chantier: "Chantier",
  projet: "Projet",
  mission: "Mission",
  tache: "Tache",
};

const CHALEUR_OPTIONS = [
  { value: "brule", label: "Brule", color: "text-red-500" },
  { value: "couve", label: "Couve", color: "text-amber-500" },
  { value: "meurt", label: "Meurt", color: "text-gray-400" },
];

const STATUS_OPTIONS = [
  { value: "en_cours", label: "En cours" },
  { value: "en_attente", label: "A faire" },
  { value: "completee", label: "Complete" },
  { value: "bloque", label: "Bloque" },
];

const CATEGORIE_OPTIONS = [
  { value: "interne", label: "Interne" },
  { value: "client", label: "Client" },
  { value: "partenaire", label: "Partenaire" },
];

const BOT_OPTIONS = Object.entries(BOT_INFO)
  .filter(([code]) => code !== "Carl" && code !== "Gemini")
  .map(([code, info]) => ({ value: code, label: `${info.label} (${info.short})` }));

export function EntityModal({
  level,
  mode,
  initialData,
  parentOptions,
  parentLabel,
  onSave,
  onDelete,
  onClose,
}: EntityModalProps) {
  const [titre, setTitre] = useState((initialData?.titre as string) || "");
  const [description, setDescription] = useState((initialData?.description as string) || "");
  const [status, setStatus] = useState((initialData?.status as string) || "en_attente");
  const [botPrimaire, setBotPrimaire] = useState((initialData?.bot_primaire as string) || "CEOB");
  const [chaleur, setChaleur] = useState((initialData?.chaleur as string) || "couve");
  const [categorie, setCategorie] = useState((initialData?.categorie as string) || "interne");
  const [parentId, setParentId] = useState<number | undefined>(
    (initialData?.chantier_id as number) || (initialData?.projet_id as number) || (initialData?.mission_id as number) || undefined
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!titre.trim()) return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        titre: titre.trim(),
        description: description.trim(),
        status,
        bot_primaire: botPrimaire,
        categorie,
      };
      if (level === "chantier") data.chaleur = chaleur;
      if (parentId && parentLabel) {
        if (level === "projet") data.chantier_id = parentId;
        if (level === "mission") data.projet_id = parentId;
        if (level === "tache") data.mission_id = parentId;
      }
      await onSave(data);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500">
          <h2 className="text-sm font-bold text-white">
            {mode === "create" ? `Nouveau ${LEVEL_LABELS[level]}` : `Modifier ${LEVEL_LABELS[level]}`}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3.5">
          {/* Titre */}
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Titre</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder={`Titre du ${LEVEL_LABELS[level].toLowerCase()}...`}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle..."
              rows={3}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Row: Status + Bot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Bot primaire</label>
              <select
                value={botPrimaire}
                onChange={(e) => setBotPrimaire(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                {BOT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categorie */}
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Categorie</label>
            <div className="flex items-center gap-2 mt-1">
              {CATEGORIE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setCategorie(o.value)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-bold rounded-lg border transition-colors",
                    categorie === o.value
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chaleur (chantier only) */}
          {level === "chantier" && (
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Chaleur</label>
              <div className="flex items-center gap-2 mt-1">
                {CHALEUR_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setChaleur(o.value)}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-bold rounded-lg border transition-colors",
                      chaleur === o.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parent dropdown */}
          {parentOptions && parentLabel && (
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{parentLabel}</label>
              <select
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="">— Aucun —</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.titre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          {/* Delete (edit mode) */}
          {mode === "edit" && onDelete ? (
            showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[9px] text-red-600 font-bold">Confirmer?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-2.5 py-1 text-[9px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  {deleting ? "..." : "Oui, supprimer"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 text-[9px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            )
          ) : (
            <div />
          )}

          {/* Save / Cancel */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[9px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !titre.trim()}
              className={cn(
                "px-4 py-1.5 text-[9px] font-bold text-white rounded-lg transition-colors shadow-sm",
                saving || !titre.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {saving ? "Sauvegarde..." : mode === "create" ? "Creer" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
