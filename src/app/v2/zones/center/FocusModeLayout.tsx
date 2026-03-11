/**
 * FocusModeLayout.tsx — Focus Mode Canvas WOW
 * Header gradient identitaire du bot + LiveChat avec bulle focus card
 * Les données KPI apparaissent dans la bulle de discussion, pas en doublon
 * Les modes de réflexion sont dans la LiveChat (pas de doublon)
 * Phase 1 Canvas WOW — Sprint B/C
 */

import {
  X, Target, TrendingUp,
  CheckCircle2, CalendarDays, Newspaper, BarChart3,
  DollarSign, Cpu, Megaphone,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { BOT_AVATAR } from "../../api/types";

// ── Types ──────────────────────────────────────────────────

export interface FocusData {
  title: string;
  elementType: string;
  data: unknown;
  bot: string;
}

// ── Gradient par bot ──────────────────────────────────────

const BOT_GRADIENTS: Record<string, string> = {
  BCO: "from-blue-600 to-blue-500",
  BCT: "from-violet-600 to-violet-500",
  BCF: "from-emerald-600 to-emerald-500",
  BCM: "from-pink-600 to-pink-500",
  BCS: "from-red-600 to-red-500",
  BOO: "from-orange-600 to-orange-500",
  BHR: "from-teal-600 to-teal-500",
  BIO: "from-rose-600 to-rose-500",
  BRO: "from-amber-600 to-amber-500",
  BLE: "from-indigo-600 to-indigo-500",
};

const BOT_LABELS: Record<string, string> = {
  kpi_ceo: "CEO",
  kpi_cfo: "CFO",
  kpi_cto: "CTO",
  kpi_cmo: "CMO",
  kpi_cso: "CSO",
  pipeline: "Ventes",
  projets: "Projets",
  calendrier: "Agenda",
  industrie: "Industrie",
  ops: "Opérations",
  generic: "Focus",
};

const ELEMENT_ICONS: Record<string, React.ElementType> = {
  kpi_ceo: Target,
  kpi_cfo: DollarSign,
  kpi_cto: Cpu,
  kpi_cmo: Megaphone,
  kpi_cso: Target,
  pipeline: TrendingUp,
  projets: CheckCircle2,
  calendrier: CalendarDays,
  industrie: Newspaper,
  ops: BarChart3,
};

// ── Composant principal ────────────────────────────────────

export function FocusModeLayout({
  focusData,
  onClose,
}: {
  focusData: FocusData;
  onClose: () => void;
}) {
  const gradient = BOT_GRADIENTS[focusData.bot] || "from-blue-600 to-blue-500";
  const avatarSrc = BOT_AVATAR[focusData.bot] || BOT_AVATAR["BCO"];
  const typeLabel = BOT_LABELS[focusData.elementType] || focusData.elementType;
  const ElementIcon = ELEMENT_ICONS[focusData.elementType] || Target;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header gradient identitaire du bot ──────────── */}
      <div className={cn(
        "bg-gradient-to-r px-4 py-2.5 flex items-center gap-2.5 shrink-0",
        gradient
      )}>
        <img
          src={avatarSrc}
          alt={focusData.bot}
          className="w-7 h-7 rounded-full ring-1 ring-white/30 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-white truncate block">{focusData.title}</span>
        </div>
        <span className="flex items-center gap-1 text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0">
          <ElementIcon className="h-3.5 w-3.5" />
          {typeLabel}
        </span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors shrink-0"
          title="Quitter le focus"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Bandeau trio — CarlOS + spécialiste */}
      {focusData.bot !== "BCO" && (
        <div className="bg-gray-50 border-b px-4 py-1.5 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[9px] font-medium text-gray-500">CarlOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[9px] font-medium text-gray-500">
              {({
                BCT: "Thierry", BCF: "François", BCM: "Martine", BCS: "Sophie",
                BOO: "Olivier", BHR: "Hélène", BIO: "Inès",
                BRO: "Raphaël", BLE: "Louise", BSE: "Sébastien",
              } as Record<string, string>)[focusData.bot] || focusData.bot}
            </span>
          </div>
          <span className="text-[9px] text-gray-400 ml-auto">Session trio</span>
        </div>
      )}

      {/* ── Contenu focus — plein canvas, chat dans sidebar droit ─────── */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-50/50">
        <div className="text-center space-y-3 max-w-md px-6">
          <div className={cn("w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br text-white shadow-lg", gradient)}>
            <ElementIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{focusData.title}</h3>
          <p className="text-sm text-gray-500">
            Utilise le chat dans le sidebar droit pour interagir avec {typeLabel}.
          </p>
        </div>
      </div>
    </div>
  );
}
