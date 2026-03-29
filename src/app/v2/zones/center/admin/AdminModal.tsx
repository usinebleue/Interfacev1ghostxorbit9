/**
 * AdminModal.tsx — Modal CRUD reutilisable pour l'admin
 * Escape fermer, delete 2-step, saving state, form validation
 */

import { useState, useEffect, useCallback } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { cn } from "../../../../components/ui/utils";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "toggle" | "number";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface AdminModalProps {
  title: string;
  fields: FieldDef[];
  initialData?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

// ═══════════════════════════════════════
// AdminModal
// ═══════════════════════════════════════

export function AdminModal({ title, fields, initialData, onSave, onDelete, onClose }: AdminModalProps) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const f of fields) {
      init[f.key] = initialData?.[f.key] ?? (f.type === "toggle" ? false : f.type === "number" ? 0 : "");
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = useCallback(async () => {
    for (const f of fields) {
      if (f.required && !form[f.key] && form[f.key] !== 0) {
        setError(`Le champ "${f.label}" est requis`);
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [form, fields, onSave, onClose]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (!onDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [confirmDelete, onDelete, onClose]);

  const updateField = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-xl">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X className="h-4 w-4 text-white/70 hover:text-white" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>

              {f.type === "text" && (
                <input
                  type="text"
                  value={String(form[f.key] || "")}
                  onChange={e => updateField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}

              {f.type === "number" && (
                <input
                  type="number"
                  value={Number(form[f.key] || 0)}
                  onChange={e => updateField(f.key, Number(e.target.value))}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}

              {f.type === "textarea" && (
                <textarea
                  value={String(form[f.key] || "")}
                  onChange={e => updateField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              )}

              {f.type === "select" && (
                <select
                  value={String(form[f.key] || "")}
                  onChange={e => updateField(f.key, e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">— Choisir —</option>
                  {f.options?.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}

              {f.type === "toggle" && (
                <button
                  onClick={() => updateField(f.key, !form[f.key])}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    form[f.key] ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    form[f.key] ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50 rounded-b-xl">
          <div>
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  confirmDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "text-red-600 hover:bg-red-50"
                )}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {confirmDelete ? "Confirmer la suppression" : "Supprimer"}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
