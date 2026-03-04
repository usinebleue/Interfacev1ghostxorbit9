/**
 * FocusModeLayout.tsx — Focus Mode Canvas WOW
 * Élément ancré en haut (~32%), barre de modes, LiveChat en dessous (~68%)
 * "De la tension à la concrétisation" — L'Alchimiste
 * Phase 1 Canvas WOW — Sprint B/C
 */

import { useState, useEffect } from "react";
import {
  X, Brain, Scale, AlertTriangle, Target,
  Sparkles, MessageSquare, Zap, TrendingUp,
  CheckCircle2, CalendarDays, Newspaper, BarChart3,
  DollarSign, Cpu, Megaphone,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { LiveChat } from "./LiveChat";
import { useChatContext } from "../../context/ChatContext";
import { BOT_AVATAR } from "../../api/types";
import type { ReflectionMode } from "../../api/types";

// ── Types ──────────────────────────────────────────────────

export interface FocusData {
  title: string;
  elementType: string;
  data: unknown;
  bot: string;
}

// ── Modes de réflexion ────────────────────────────────────

const FOCUS_MODES: Array<{
  id: ReflectionMode;
  label: string;
  icon: React.ElementType;
  activeColor: string;
}> = [
  { id: "brainstorm", label: "Brainstorm", icon: Brain, activeColor: "bg-amber-600 text-white" },
  { id: "analyse",    label: "Analyse",    icon: Zap,   activeColor: "bg-red-600 text-white" },
  { id: "crise",      label: "Crise",      icon: AlertTriangle, activeColor: "bg-red-700 text-white" },
  { id: "strategie",  label: "Stratégie",  icon: Target, activeColor: "bg-emerald-600 text-white" },
  { id: "debat",      label: "Débat",      icon: MessageSquare, activeColor: "bg-violet-600 text-white" },
  { id: "innovation", label: "Innovation", icon: Sparkles, activeColor: "bg-fuchsia-600 text-white" },
  { id: "deep",       label: "Deep",       icon: Brain,  activeColor: "bg-cyan-600 text-white" },
  { id: "credo",      label: "CREDO",      icon: Zap,    activeColor: "bg-blue-600 text-white" },
  { id: "decision",   label: "Décision",   icon: Scale,  activeColor: "bg-indigo-600 text-white" },
];

// ── Gradient par bot ──────────────────────────────────────

const BOT_GRADIENTS: Record<string, string> = {
  BCO: "from-blue-600 to-blue-500",
  BCT: "from-violet-600 to-violet-500",
  BCF: "from-emerald-600 to-emerald-500",
  BCM: "from-pink-600 to-pink-500",
  BCS: "from-red-600 to-red-500",
  BOO: "from-orange-600 to-orange-500",
  BHR: "from-teal-600 to-teal-500",
  BIO: "from-cyan-600 to-cyan-500",
  BCC: "from-rose-600 to-rose-500",
  BPO: "from-fuchsia-600 to-fuchsia-500",
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

// ── Mini Render — affichage condensé des données ──────────

function fmtMoney(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}G$`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M$`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K$`;
  return `${n}$`;
}

function FocusMiniRender({
  elementType,
  data,
}: {
  elementType: string;
  data: unknown;
}) {
  const d = data as Record<string, unknown> | null | undefined;

  // Pipeline — top prospects
  if (elementType === "pipeline") {
    const ventes = d as { pipeline_total?: number; top_prospects?: Array<{ nom: string; valeur?: number; etape?: string; probabilite?: number }> } | null;
    const prospects = ventes?.top_prospects?.slice(0, 3) || [];
    return (
      <div className="space-y-2">
        {ventes?.pipeline_total !== undefined && (
          <p className="text-sm font-bold text-gray-800">{fmtMoney(ventes.pipeline_total)} total pipeline</p>
        )}
        {prospects.length > 0 ? prospects.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{p.nom}</p>
              <p className="text-[11px] text-gray-400">{p.etape || "En cours"}</p>
            </div>
            <span className="text-xs font-bold text-gray-700 shrink-0">{fmtMoney(p.valeur)}</span>
          </div>
        )) : (
          <p className="text-xs text-gray-400">Aucun prospect en pipeline</p>
        )}
      </div>
    );
  }

  // Projets actifs
  if (elementType === "projets") {
    const projets = data as Array<{ nom: string; avancement?: number; responsable?: string }> | null;
    const items = (projets || []).slice(0, 3);
    return (
      <div className="space-y-2">
        {items.length > 0 ? items.map((p, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs font-medium text-gray-800 truncate">{p.nom}</p>
              {p.avancement !== undefined && <span className="text-xs font-bold text-gray-700 shrink-0">{p.avancement}%</span>}
            </div>
            {p.avancement !== undefined && (
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${p.avancement}%` }} />
              </div>
            )}
          </div>
        )) : (
          <p className="text-xs text-gray-400">Aucun projet actif</p>
        )}
      </div>
    );
  }

  // KPI generiques (CEO, CFO, CTO, CMO, CSO, COO/ops, industrie)
  if (d && typeof d === "object") {
    const entries = Object.entries(d)
      .filter(([, v]) => v !== null && v !== undefined && v !== "" && !Array.isArray(v))
      .slice(0, 4);
    return (
      <div className="space-y-1.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <p className="text-xs text-gray-500 capitalize">{k.replace(/_/g, " ")}</p>
            <p className="text-xs font-semibold text-gray-800 truncate max-w-[55%] text-right">{String(v).slice(0, 40)}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-xs text-gray-400">Aucune donnée disponible</p>}
      </div>
    );
  }

  return <p className="text-xs text-gray-400">Cliquez pour lancer la mission</p>;
}

// ── Composant principal ────────────────────────────────────

export function FocusModeLayout({
  focusData,
  onClose,
}: {
  focusData: FocusData;
  onClose: () => void;
}) {
  const { setReflectionMode } = useChatContext();
  const [selectedMode, setSelectedMode] = useState<ReflectionMode>("credo");

  const gradient = BOT_GRADIENTS[focusData.bot] || "from-blue-600 to-blue-500";
  const avatarSrc = BOT_AVATAR[focusData.bot] || BOT_AVATAR["BCO"];
  const typeLabel = BOT_LABELS[focusData.elementType] || focusData.elementType;
  const ElementIcon = ELEMENT_ICONS[focusData.elementType] || Target;

  // Synchroniser le mode au mount
  useEffect(() => {
    setReflectionMode(selectedMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeSelect = (mode: ReflectionMode) => {
    setSelectedMode(mode);
    setReflectionMode(mode);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Focus Card — ~32% de hauteur ──────────── */}
      <div className="h-[32%] shrink-0 flex flex-col overflow-hidden border-b border-gray-200">

        {/* Header gradient */}
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
          <span className="flex items-center gap-1 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0">
            <ElementIcon className="h-3 w-3" />
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

        {/* Corps — mini-rendu des données */}
        <div className="flex-1 bg-gray-50 px-4 py-3 overflow-auto">
          <FocusMiniRender
            elementType={focusData.elementType}
            data={focusData.data}
          />
        </div>
      </div>

      {/* ── Barre modes de réflexion ──────────────── */}
      <div className="bg-white border-b px-3 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider mr-1 whitespace-nowrap">Mode</span>
        {FOCUS_MODES.map((mode) => {
          const MIcon = mode.icon;
          const isActive = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer",
                isActive
                  ? mode.activeColor + " shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <MIcon className="h-3 w-3" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* ── LiveChat — flex-1 ─────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <LiveChat onBack={onClose} />
      </div>
    </div>
  );
}
