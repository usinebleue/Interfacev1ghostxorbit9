/**
 * WorkspaceChecklist.tsx — Renderer liste de validation V1
 *
 * Liste à cocher simple. Sections vides à remplir manuellement (Carl Q5 = vide).
 * Pattern: basé sur HierarchieTab — items avec checkbox + texte éditable.
 */

import { useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import type { RendererProps } from "../types";

interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
}

export function WorkspaceChecklist({ sectionConfig }: RendererProps) {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [newItemText, setNewItemText] = useState("");

  function addItem() {
    if (!newItemText.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, text: newItemText.trim(), checked: false },
    ]);
    setNewItemText("");
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <ListChecks className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">{sectionConfig.label}</span>
          <div className="flex-1" />
          {items.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {checkedCount}/{items.length}
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          {/* Items */}
          {items.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-6 text-center">
              Aucun élément — ajoutez des items ci-dessous
            </div>
          ) : (
            <div className="space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all group",
                    item.checked
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="cursor-pointer shrink-0"
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                        item.checked
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-gray-300 hover:border-blue-400"
                      )}
                    >
                      {item.checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <span
                    className={cn(
                      "text-xs flex-1",
                      item.checked ? "text-gray-400 line-through" : "text-gray-700"
                    )}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 cursor-pointer transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Ajout d'item */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Ajouter un élément..."
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
            <button
              onClick={addItem}
              disabled={!newItemText.trim()}
              className={cn(
                "text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer",
                newItemText.trim()
                  ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  : "bg-gray-50 text-gray-300 border border-gray-200 cursor-not-allowed"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
