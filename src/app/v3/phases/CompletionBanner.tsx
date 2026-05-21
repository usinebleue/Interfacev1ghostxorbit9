/**
 * CompletionBanner.tsx — Banner de completion DocForge
 *
 * Port depuis SimAmorcer L6486-6521:
 * - Gradient banner bg-[#00B4D8]/10 avec border emerald
 * - Transition icone: MainIcon -> ArrowRight -> CheckCircle2 emerald animate-pulse
 * - "Livrable complet" + "N sections generees"
 * - Boutons: "Exporter PDF", "Sauvegarder comme template", "Lancer jumelage SMART", "Retour au chantier"
 */

import { useState } from "react";
import { ArrowRight, CheckCircle2, Database, Download, Save, Rocket } from "lucide-react";
import { cn } from "../../components/ui/utils";
import type { L2Theme } from "./docforge-config";

interface CompletionBannerProps {
  icon: React.ElementType;
  theme: L2Theme;
  sectionCount: number;
  onExportPdf?: () => void;
  onStartJumelage?: () => void;
  onBack?: () => void;
  onSaveTemplate?: (name: string) => void;
  onSaveToDataRoom?: () => Promise<void>;
}

export function CompletionBanner({
  icon: MainIcon, theme, sectionCount,
  onExportPdf, onStartJumelage, onBack, onSaveTemplate, onSaveToDataRoom,
}: CompletionBannerProps) {
  const [templateName, setTemplateName] = useState("");
  const [showTemplateInput, setShowTemplateInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedToDataRoom, setSavedToDataRoom] = useState(false);
  const [savingToDataRoom, setSavingToDataRoom] = useState(false);

  const handleSaveTemplate = () => {
    if (templateName.trim() && onSaveTemplate) {
      onSaveTemplate(templateName.trim());
      setSaved(true);
      setShowTemplateInput(false);
    }
  };

  return (
    <div className={cn("rounded-xl border-2 border-emerald-200 p-5 mt-4 bg-gradient-to-br from-[#00B4D8]/10 via-emerald-50 to-white")}>
      {/* Transition icone */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", theme.bgLight)}>
          <MainIcon className={cn("h-4 w-4 stroke-[2.5]", theme.iconColor)} />
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 stroke-[2.5]" />
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[2.5] animate-pulse" />
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-1">Livrable complet</h3>
      <p className="text-xs text-gray-500 mb-4">{sectionCount} sections generees — pret pour export</p>

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-2">
        {onSaveToDataRoom && !savedToDataRoom && (
          <button
            onClick={async () => {
              setSavingToDataRoom(true);
              try { await onSaveToDataRoom(); setSavedToDataRoom(true); } finally { setSavingToDataRoom(false); }
            }}
            disabled={savingToDataRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-60">
            <Database className="h-3.5 w-3.5 stroke-[2.5]" />
            {savingToDataRoom ? "Enregistrement..." : "Enregistrer dans Données"}
          </button>
        )}
        {savedToDataRoom && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700">
            <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" /> Sauvegarde dans Données
          </span>
        )}
        {onExportPdf && (
          <button onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer">
            <Download className="h-3.5 w-3.5 stroke-[2.5]" /> Exporter PDF
          </button>
        )}
        {onStartJumelage && (
          <button onClick={onStartJumelage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer">
            <Rocket className="h-3.5 w-3.5 stroke-[2.5]" /> Lancer jumelage SMART
          </button>
        )}
        {onSaveTemplate && !saved && (
          <button onClick={() => setShowTemplateInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
            <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Sauvegarder comme template
          </button>
        )}
        {saved && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" /> Template sauvegarde
          </span>
        )}
        {onBack && (
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
            Retour au chantier
          </button>
        )}
      </div>

      {/* Input template name */}
      {showTemplateInput && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSaveTemplate()}
            placeholder="Nom du template..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoFocus
          />
          <button onClick={handleSaveTemplate}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
            Sauvegarder
          </button>
          <button onClick={() => setShowTemplateInput(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
