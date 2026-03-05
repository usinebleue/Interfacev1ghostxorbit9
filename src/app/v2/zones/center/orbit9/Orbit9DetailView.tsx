/**
 * Orbit9DetailView.tsx — Orchestrateur allege
 * Importe les 8 composants-pages et route via switch/case
 * Marketplace et TRG ont des sous-tabs dans le header (meme logique de nav)
 * Default fallback: Marketplace (porte d'entree)
 * Sprint B — Reorganisation Orbit9
 */

import {
  Newspaper, Calendar, Globe,
  Bot, Store, Briefcase,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { useFrameMaster } from "../../../context/FrameMasterContext";

import { MarketplacePage } from "./MarketplacePage";
import { CellulesPage } from "./CellulesPage";
import { GouvernancePage } from "./GouvernancePage";
import { PionniersPage } from "./PionniersPage";
import { NouvellesPage } from "./NouvellesPage";
import { EvenementsPage } from "./EvenementsPage";
import { TrgIndustriePage } from "./TrgIndustriePage";
import { PageTypePage } from "./PageTypePage";
import { JumelageLivePage } from "./JumelageLivePage";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

// ── Groupes de sections avec sous-tabs ──

const TRG_SECTIONS = new Set(["nouvelles", "evenements", "trg-industrie"]);
const MARKETPLACE_SECTIONS = new Set(["marketplace", "marketplace-cahiers"]);

const TRG_TABS = [
  { id: "nouvelles", label: "Nouvelles", icon: Newspaper },
  { id: "evenements", label: "Evenements", icon: Calendar },
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
  jumelage: "Jumelage Live",
  gouvernance: "Gouvernance",
  pionniers: "Pionniers Bleus",
  evenements: "Evenements",
  nouvelles: "Nouvelles",
  "trg-industrie": "Dashboard de l'Industrie",
  "page-type": "Page Type",
};

const SECTION_SUBTITLES: Record<string, string> = {
  marketplace: "Trouvez des bots specialises ou repondez aux opportunites du reseau",
  "marketplace-cahiers": "Trouvez des bots specialises ou repondez aux opportunites du reseau",
  cellules: "Mon Reseau Orbit 9",
  jumelage: "Trouvez le partenaire ideal dans votre reseau",
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
      case "jumelage":
        return <JumelageLivePage onNavigate={handleNavigate} />;
      case "gouvernance":
        return <GouvernancePage onNavigate={handleNavigate} />;
      case "pionniers":
        return <PionniersPage onNavigate={handleNavigate} />;
      case "nouvelles":
        return <NouvellesPage />;
      case "evenements":
        return <EvenementsPage />;
      case "trg-industrie":
        return <TrgIndustriePage />;
      case "page-type":
        return <PageTypePage />;
      default:
        return <MarketplacePage volet="bots" onNavigate={handleNavigate} />;
    }
  };

  // Determine which sub-tabs to show (same pattern for both TRG and Marketplace)
  const activeTabs = isTrg ? TRG_TABS : isMarketplace ? MARKETPLACE_TABS : null;

  // Pick icon based on section group
  const headerIcon = isMarketplace ? Store : isTrg ? Globe : Briefcase;
  const headerIconColor = isMarketplace ? "text-orange-500" : isTrg ? "text-blue-600" : "text-indigo-600";

  return (
    <PageLayout
      maxWidth="5xl"
      header={
        <PageHeader
          icon={headerIcon}
          iconColor={headerIconColor}
          title={isTrg ? "Mon Industrie" : sectionTitle}
          subtitle={isTrg ? "Statistiques et tendances du secteur manufacturier" : sectionSubtitle}
          onBack={() => setActiveView("department")}
          rightSlot={
            activeTabs ? (
              <>
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
              </>
            ) : undefined
          }
        />
      }
    >
      {renderPage()}
    </PageLayout>
  );
}
