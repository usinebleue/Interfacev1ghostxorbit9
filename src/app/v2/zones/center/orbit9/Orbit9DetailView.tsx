/**
 * Orbit9DetailView.tsx — Orchestrateur allege
 * Importe les 8 composants-pages et route via SECTION_RENDERERS
 * TRG Industries garde ses sous-tabs dans le header
 * Default fallback: Marketplace (porte d'entree)
 * Sprint B — Reorganisation Orbit9
 */

import { ArrowLeft, Newspaper, Calendar, Gauge, Globe } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { useFrameMaster } from "../../../context/FrameMasterContext";

import { MarketplacePage } from "./MarketplacePage";
import { CellulesPage } from "./CellulesPage";
import { GouvernancePage } from "./GouvernancePage";
import { PionniersPage } from "./PionniersPage";
import { NouvellesPage } from "./NouvellesPage";
import { EvenementsPage } from "./EvenementsPage";
import { BenchmarkPage } from "./BenchmarkPage";
import { TrgIndustriePage } from "./TrgIndustriePage";

// ── Sections Orbit9 (sidebar direct) + TRG Industries (section separee) ──

const TRG_SECTIONS = new Set(["nouvelles", "evenements", "benchmark", "trg-industrie"]);

const TRG_TABS = [
  { id: "nouvelles", label: "Nouvelles", icon: Newspaper },
  { id: "evenements", label: "Evenements", icon: Calendar },
  { id: "benchmark", label: "Benchmark", icon: Gauge },
  { id: "trg-industrie", label: "Dashboard", icon: Globe },
];

// ── Section renderers (pages individuelles) ──

const SECTION_TITLES: Record<string, string> = {
  marketplace: "Marketplace GhostX",
  cellules: "Cellules Orbit9",
  gouvernance: "Gouvernance",
  pionniers: "Pionniers Bleus",
  evenements: "Evenements",
  benchmark: "Benchmark VITAA",
  nouvelles: "Nouvelles",
  "trg-industrie": "Dashboard de l'Industrie",
};

// ══════════════════════════════════════════
// MAIN VIEW
// ══════════════════════════════════════════

export function Orbit9DetailView() {
  const { activeOrbit9Section, setActiveView, navigateOrbit9 } = useFrameMaster();
  const sectionId = activeOrbit9Section || "marketplace";

  const isTrg = TRG_SECTIONS.has(sectionId);
  const sectionTitle = SECTION_TITLES[sectionId] || "Orbit9";

  // Cross-navigation handler
  const handleNavigate = (section: string) => {
    navigateOrbit9(section);
  };

  // Render the active page
  const renderPage = () => {
    switch (sectionId) {
      case "marketplace":
        return <MarketplacePage onNavigate={handleNavigate} />;
      case "cellules":
        return <CellulesPage onNavigate={handleNavigate} />;
      case "gouvernance":
        return <GouvernancePage onNavigate={handleNavigate} />;
      case "pionniers":
        return <PionniersPage onNavigate={handleNavigate} />;
      case "nouvelles":
        return <NouvellesPage />;
      case "evenements":
        return <EvenementsPage />;
      case "benchmark":
        return <BenchmarkPage />;
      case "trg-industrie":
        return <TrgIndustriePage />;
      default:
        return <MarketplacePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => setActiveView("department")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">
              {isTrg ? "TRG Industries" : sectionTitle}
            </h1>
            <p className="text-[10px] text-gray-400">
              {isTrg ? "Statistiques et tendances du secteur manufacturier" : "Mon Reseau Orbit 9"}
            </p>
          </div>
        </div>

        {/* Sous-tabs — seulement pour TRG Industries */}
        {isTrg && (
          <div className="flex gap-1 mt-2">
            {TRG_TABS.map((tab) => {
              const TIcon = tab.icon;
              const isActive = tab.id === sectionId;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateOrbit9(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  <TIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {renderPage()}
      </div>
    </div>
  );
}
