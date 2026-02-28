/**
 * Orbit9DetailView.tsx — Orchestrateur allege
 * Importe les 8 composants-pages et route via switch/case
 * Marketplace et TRG ont des sous-tabs dans le header (meme logique de nav)
 * Default fallback: Marketplace (porte d'entree)
 * Sprint B — Reorganisation Orbit9
 */

import {
  ArrowLeft, Newspaper, Calendar, Gauge, Globe,
  Bot, Hand, Store, Briefcase,
} from "lucide-react";
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

// ── Groupes de sections avec sous-tabs ──

const TRG_SECTIONS = new Set(["nouvelles", "evenements", "benchmark", "trg-industrie"]);
const MARKETPLACE_SECTIONS = new Set(["marketplace", "marketplace-cahiers"]);

const TRG_TABS = [
  { id: "nouvelles", label: "Nouvelles", icon: Newspaper },
  { id: "evenements", label: "Evenements", icon: Calendar },
  { id: "benchmark", label: "Benchmark", icon: Gauge },
  { id: "trg-industrie", label: "Dashboard", icon: Globe },
];

const MARKETPLACE_TABS = [
  { id: "marketplace", label: "Bots & Agents", icon: Bot },
  { id: "marketplace-cahiers", label: "Opportunites", icon: Briefcase },
];

// ── Titres de section ──

const SECTION_TITLES: Record<string, string> = {
  marketplace: "Marketplace",
  "marketplace-cahiers": "Marketplace",
  cellules: "Cellules Orbit9",
  gouvernance: "Gouvernance",
  pionniers: "Pionniers Bleus",
  evenements: "Evenements",
  benchmark: "Benchmark VITAA",
  nouvelles: "Nouvelles",
  "trg-industrie": "Dashboard de l'Industrie",
};

const SECTION_SUBTITLES: Record<string, string> = {
  marketplace: "Trouvez des bots specialises ou repondez aux opportunites du reseau",
  "marketplace-cahiers": "Trouvez des bots specialises ou repondez aux opportunites du reseau",
  cellules: "Mon Reseau Orbit 9",
  gouvernance: "Mon Reseau Orbit 9",
  pionniers: "Mon Reseau Orbit 9",
};

// ══════════════════════════════════════════
// MAIN VIEW
// ══════════════════════════════════════════

export function Orbit9DetailView() {
  const { activeOrbit9Section, setActiveView, navigateOrbit9 } = useFrameMaster();
  const sectionId = activeOrbit9Section || "marketplace";

  const isTrg = TRG_SECTIONS.has(sectionId);
  const isMarketplace = MARKETPLACE_SECTIONS.has(sectionId);
  const sectionTitle = SECTION_TITLES[sectionId] || "Orbit9";
  const sectionSubtitle = SECTION_SUBTITLES[sectionId] || "Mon Reseau Orbit 9";

  const handleNavigate = (section: string) => {
    navigateOrbit9(section);
  };

  const renderPage = () => {
    switch (sectionId) {
      case "marketplace":
        return <MarketplacePage volet="bots" onNavigate={handleNavigate} />;
      case "marketplace-cahiers":
        return <MarketplacePage volet="cahiers" onNavigate={handleNavigate} />;
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
        return <MarketplacePage volet="bots" onNavigate={handleNavigate} />;
    }
  };

  // Determine which sub-tabs to show (same pattern for both TRG and Marketplace)
  const activeTabs = isTrg ? TRG_TABS : isMarketplace ? MARKETPLACE_TABS : null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header — barre d'action du Canvas */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => setActiveView("department")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            {isMarketplace && <Store className="h-4 w-4 text-orange-500" />}
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                {isTrg ? "TRG Industries" : sectionTitle}
              </h1>
              <p className="text-[10px] text-gray-400">
                {isTrg ? "Statistiques et tendances du secteur manufacturier" : sectionSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Sous-tabs — meme logique de navigation pour TRG et Marketplace */}
        {activeTabs && (
          <div className="flex gap-1 mt-2">
            {activeTabs.map((tab) => {
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
