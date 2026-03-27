/**
 * DiagnosticHub.tsx — Hub unifie des diagnostics (fusion 3 vagues)
 * Affiche dans Sante > sub-tab "diagnostics"
 * - Selecteur 6 types clients (MFG/FEQ/DEV/INT/DST/ORG)
 * - Filtres departement + recherche
 * - Grille catalogue filtree
 * - Click → dispatch focus "diagnostic_flow" → Atelier split-screen
 * - CTA "Diagnostic Complet 30 min" → ouvre DiagnosticIAPage
 */

import { useState, useEffect, useMemo } from "react";
import {
  Stethoscope, Search, Clock,
  Factory, Building2,
  Users, Server, Zap, Truck,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { BOT_AVATAR } from "../../../api/types";
import type { DiagnosticCatalogue } from "../../../api/types";
import { api } from "../../../api/client";
import { useCanvasActions } from "../../../context/CanvasActionContext";
import { BotBadgeFull } from "../shared/BotBadgeFull";
import {
  buildUnifiedCatalogue,
  filterByProfil,
  filterByDept,
  getCatalogueStats,
  PROFIL_TYPES_MAP,
  type UnifiedDiagnostic,
  type ProfilType,
} from "./unified-diagnostics";

// ── Type client cards ──
const PROFIL_CARDS: { code: ProfilType; icon: React.ElementType; color: string; bg: string }[] = [
  { code: "MFG", icon: Factory,  color: "text-orange-600", bg: "bg-orange-50 border-orange-200 hover:bg-orange-100" },
  { code: "FEQ", icon: Zap,      color: "text-purple-600", bg: "bg-purple-50 border-purple-200 hover:bg-purple-100" },
  { code: "DEV", icon: Server,   color: "text-blue-600",   bg: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  { code: "INT", icon: Users,    color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { code: "DST", icon: Truck,    color: "text-pink-600",   bg: "bg-pink-50 border-pink-200 hover:bg-pink-100" },
  { code: "ORG", icon: Building2, color: "text-teal-600",  bg: "bg-teal-50 border-teal-200 hover:bg-teal-100" },
];

// ── Department filter pills ──
const DEPT_FILTERS = [
  { key: null, label: "Tous" },
  { key: "direction", label: "Direction" },
  { key: "finance", label: "Finance" },
  { key: "technologie", label: "Tech" },
  { key: "marketing", label: "Marketing" },
  { key: "strategie", label: "Strategie" },
  { key: "operations", label: "Operations" },
  { key: "production", label: "Production" },
  { key: "rh", label: "RH" },
  { key: "innovation", label: "Innovation" },
  { key: "ventes", label: "Ventes" },
  { key: "legal", label: "Legal" },
  { key: "securite", label: "Securite" },
] as const;

// ── Props ──
interface DiagnosticHubProps {
  botCode?: string;
  completedCount?: number;
}

export function DiagnosticHub({ botCode = "CEOB", completedCount = 0 }: DiagnosticHubProps) {
  const { dispatch } = useCanvasActions();

  // State
  const [enrichis, setEnrichis] = useState<DiagnosticCatalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfil, setSelectedProfil] = useState<ProfilType | null>(null);
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");

  // Load enrichis from API
  useEffect(() => {
    api.listDiagnosticsEnrichis()
      .then(d => setEnrichis(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build unified catalogue
  const unified = useMemo(() => buildUnifiedCatalogue(enrichis), [enrichis]);
  const stats = useMemo(() => getCatalogueStats(unified), [unified]);

  // Apply filters (only enriched — no pale "a venir" cards)
  const filtered = useMemo(() => {
    let items = unified.filter(d => d.enrichi);
    items = filterByProfil(items, selectedProfil);
    items = filterByDept(items, deptFilter);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      items = items.filter(d =>
        d.titre.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.departement.toLowerCase().includes(q)
      );
    }
    return items;
  }, [unified, selectedProfil, deptFilter, searchQ]);

  // Group by department
  const groupedByDept = useMemo(() => {
    const depts = [...new Set(filtered.map(d => d.departement))].sort();
    return depts.map(dept => ({ dept, items: filtered.filter(d => d.departement === dept) }));
  }, [filtered]);

  // Click → Focus mode (Atelier)
  const handleDiagClick = (diag: UnifiedDiagnostic) => {
    dispatch({
      type: "focus",
      layer: "bouche",
      data: {
        title: `Diagnostic: ${diag.titre}`,
        element_type: "diagnostic_flow",
        data: diag,
      },
      bot: diag.bot_primaire,
    });
  };

  // ── DEPT gradient lookup ──
  const DEPT_GRADIENTS: Record<string, string> = {
    direction: "from-blue-600 to-blue-500", finance: "from-emerald-600 to-emerald-500",
    technologie: "from-violet-600 to-violet-500", marketing: "from-pink-600 to-pink-500",
    strategie: "from-red-600 to-red-500", operations: "from-orange-600 to-orange-500",
    production: "from-amber-600 to-amber-500", rh: "from-teal-600 to-teal-500",
    innovation: "from-rose-600 to-rose-500", ventes: "from-cyan-600 to-cyan-500",
    legal: "from-indigo-600 to-indigo-500", securite: "from-gray-600 to-gray-500",
  };

  const DEPT_LABELS: Record<string, string> = {
    direction: "Direction", finance: "Finance", technologie: "Technologie",
    marketing: "Marketing", strategie: "Strategie", operations: "Operations",
    production: "Production", rh: "RH", innovation: "Innovation",
    ventes: "Ventes", legal: "Legal", securite: "Securite",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
        <Stethoscope className="h-8 w-8 animate-pulse" />
        <span className="text-sm">Chargement des diagnostics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header stats ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-bold text-gray-800">{stats.enrichis} diagnostics</span>
          <span className="text-[9px] text-gray-400 ml-2">interactifs</span>
        </div>
        {completedCount > 0 && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
            {completedCount} complete{completedCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Profil type selector (6 cards — toujours visibles, selection en surbrillance) ── */}
      <div className="grid grid-cols-6 gap-1.5">
        {PROFIL_CARDS.map(({ code, icon: Icon, color, bg }) => {
          const info = PROFIL_TYPES_MAP[code];
          const isSelected = selectedProfil === code;
          return (
            <button
              key={code}
              onClick={() => setSelectedProfil(isSelected ? null : code)}
              className={cn(
                "p-2 rounded-lg border transition-all text-center",
                isSelected
                  ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50 shadow-md scale-[1.02]"
                  : selectedProfil && !isSelected
                    ? "opacity-40 border-gray-200 bg-white"
                    : bg,
              )}
            >
              <Icon className={cn("h-4 w-4 mx-auto mb-0.5", isSelected ? "text-blue-600" : color)} />
              <div className={cn("text-[8px] font-bold", isSelected ? "text-blue-700" : "text-gray-800")}>{info.nom}</div>
            </button>
          );
        })}
      </div>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="Rechercher un diagnostic..."
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
        />
      </div>

      {/* ── Department filter pills ── */}
      <div className="flex gap-1 flex-wrap">
        {DEPT_FILTERS.map(f => (
          <button
            key={f.key ?? "all"}
            onClick={() => setDeptFilter(f.key as string | null)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-medium border transition-colors",
              deptFilter === f.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Grille diagnostics groupes par departement ── */}
      {groupedByDept.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Stethoscope className="h-6 w-6 mx-auto mb-2" />
          <p className="text-xs">Aucun diagnostic pour ces filtres</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedByDept.map(({ dept, items }) => {
            const gradient = DEPT_GRADIENTS[dept] || "from-gray-500 to-gray-400";
            const deptBotCode = items[0]?.bot_primaire || "CEOB";
            return (
              <div key={dept} className="border rounded-xl overflow-hidden shadow-sm">
                {/* Dept header */}
                <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2", gradient)}>
                  <img
                    src={BOT_AVATAR[deptBotCode] || BOT_AVATAR["CEOB"]}
                    alt={deptBotCode}
                    className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-white/30"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white">{DEPT_LABELS[dept] || dept}</h3>
                    <p className="text-[9px] text-white/60">{items.length} diagnostic{items.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Cards grid */}
                <div className="p-3 grid grid-cols-2 gap-2">
                  {items.map(diag => (
                    <button
                      key={diag.id}
                      onClick={() => handleDiagClick(diag)}
                      className="p-2.5 rounded-lg border border-gray-100 hover:shadow-md cursor-pointer transition-all text-left group"
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-lg bg-gradient-to-r flex items-center justify-center shrink-0 mt-0.5",
                          diag.gradient || "from-gray-500 to-gray-400"
                        )}>
                          <Stethoscope className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[9px] font-bold text-gray-800 truncate group-hover:text-blue-600">
                            {diag.titre}
                          </h4>
                          <p className="text-[8px] text-gray-500 line-clamp-2 leading-relaxed mt-0.5">
                            {diag.description}
                          </p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <BotBadgeFull botCode={diag.bot_primaire} compact className="!text-[7px] !px-1 !py-0" />
                            <span className="text-[8px] px-1 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">
                              <Clock className="h-2.5 w-2.5 inline mr-0.5" />{diag.duree_minutes} min
                            </span>
                            <span className="text-[8px] px-1 py-0.5 rounded bg-violet-50 text-violet-600">
                              {diag.data_points.length} KPIs
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
