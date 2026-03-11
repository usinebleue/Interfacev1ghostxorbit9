/**
 * MasterBibleVisuelCiblePage.tsx — A.5 Bible Visuelle Cible
 * Comparaison RÉELLE des composants FE.1 (Bible Visuelle) et FE.2 (Bible Live)
 * Carl sélectionne les designs finaux — VRAIS composants, PAS des wireframes
 * Session 51 — Refonte v2: ZERO duplication entre tabs
 *
 * MAPPING FE.3 → sources:
 * 1. Identité     → FE.1 inline (12 bots) + FE.2 Tab1+Tab2
 * 2. Structure     → FE.1 TabLayout + FE.2 Tab3
 * 3. Headers       → FE.2 Tab4 only (FE.1 headers intégrés dans Layout)
 * 4. Cards         → FE.1 TabCardsData + FE.2 Tab6
 * 5. Composants    → FE.1 TabComposants + FE.2 Tab5+Tab7+Tab8+Tab9
 * 6. Bulles        → FE.1 TabBullesActions + FE.2 Tab10
 * 7. Couleurs      → FE.2 Tab12 + FE.2 Tab11
 * 8. Skins         → FE.2 Tab15
 * 9. Menu          → FE.2 Tab16
 * 10. Console      → FE.2 Tab17
 * 11. Visualisations → FE.1 TabVisualisations
 * 12. Audit        → FE.1 TabArchive + FE.2 Tab13+Tab14
 */

import { useState } from "react";
import {
  Crosshair, Eye, Fingerprint, Layout, PanelTop, CreditCard,
  Zap, Palette, MessageSquare,
  Layers, PanelLeft, PanelRight, Brain,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// IMPORTS FE.1 — Data bots + Tab functions (vrais composants rendus)
// ================================================================
import {
  OFFICIAL_BOTS,
  FE1TabLayout, FE1TabComposants, FE1TabCardsData,
  FE1TabBullesActions, FE1TabVisualisations, FE1TabArchive,
} from "./PageTypePage";

// ================================================================
// IMPORTS FE.2 — Tab functions (vrais composants rendus)
// ================================================================
import {
  Tab1Identite, Tab3Layouts, Tab4Headers,
  Tab5Tabs, Tab6Cards, Tab7Typo, Tab8Boutons, Tab9Badges,
  Tab10Bulles, Tab11Indicateurs, Tab12Couleurs,
  Tab13Doublons, Tab14Ecarts, Tab15Skins,
  Tab16MenuGauche, Tab17ConsoleDroite,
} from "./MasterBibleVisuelleLivePage";

// ================================================================
// IMPORTS FE.4b — Galerie Agents animee (vrais composants)
// ================================================================
import {
  AG_KEYFRAMES, AGENTS, AgentAnimatedCard,
} from "./AgentGalleryPage";

// ================================================================
// TABS — 12 categories (sans duplication)
// ================================================================

const TABS = [
  { id: "identite",       label: "1. Identité",       icon: Fingerprint },
  { id: "structure",      label: "2. Structure",      icon: Layout },
  { id: "headers",        label: "3. Headers",        icon: PanelTop },
  { id: "cards",          label: "4. Cards",          icon: CreditCard },
  { id: "composants",     label: "5. Composants",     icon: Zap },
  { id: "bulles",         label: "6. Bulles",         icon: MessageSquare },
  { id: "couleurs",       label: "7. Couleurs",       icon: Palette },
  { id: "skins",          label: "8. Skins",          icon: Brain },
  { id: "menu",           label: "9. Menu",           icon: PanelLeft },
  { id: "console",        label: "10. Console",       icon: PanelRight },
  { id: "visualisations", label: "11. Visualisations", icon: Layers },
  { id: "audit",          label: "12. Audit",         icon: Eye },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ================================================================
// SOURCE BANNER — Etiquette source visuelle
// ================================================================

function SourceBanner({ source, title, children }: {
  source: "fe1" | "fe2";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    fe1: { bg: "bg-indigo-50", border: "border-indigo-300", gradient: "from-indigo-600 to-indigo-400", label: "FE.1 Bible Visuelle" },
    fe2: { bg: "bg-emerald-50", border: "border-emerald-300", gradient: "from-emerald-600 to-emerald-400", label: "FE.2 Bible Live" },
  };
  const s = styles[source];
  return (
    <div className={cn("rounded-xl border-2 overflow-hidden", s.border)}>
      <div className={cn("px-4 py-2 flex items-center gap-2 bg-gradient-to-r text-white", s.gradient)}>
        <span className="text-sm font-bold">{title || s.label}</span>
      </div>
      <div className={cn("p-4", s.bg)}>
        {children}
      </div>
    </div>
  );
}

// ================================================================
// CONTRADICTION NOTE — Annotation d'écart entre FE.1 et FE.2
// ================================================================

function ContradictionNote({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-bold text-amber-800">Contradictions / Ecarts</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
            <span className="text-amber-500 mt-0.5">-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ================================================================
// FE.1 INLINE SECTIONS — Rendus avec OFFICIAL_BOTS data (Identite tab only)
// ================================================================

function FE1EquipeAgents() {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-800 mb-4">
        <span className="text-[9px] font-bold text-gray-400 mr-1">A.1.1.1</span>
        Equipe GhostX — 12 Agents C-Level
      </h3>
      <p className="text-xs text-gray-400 mb-3">Les 12 bots officiels — profil, standby, code couleur, role C-Level</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {OFFICIAL_BOTS.map((bot) => (
          <div key={bot.code} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="relative">
              <img src={bot.standby} alt={bot.name} className="w-full aspect-video object-cover" />
              <img src={bot.profil} alt={bot.name} className="absolute -bottom-4 left-3 w-12 h-12 rounded-full border-2 border-white shadow-md" />
              <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-${bot.color}-100 text-${bot.color}-700`}>{bot.code}</span>
            </div>
            <div className="pt-5 pb-3 px-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{bot.emoji}</span>
                <span className="font-bold text-sm text-gray-800">{bot.name}</span>
                <span className="text-xs text-gray-400">{bot.role}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{bot.subtitle}</div>
              <div className={`h-1 rounded-full bg-${bot.color}-500 mt-2`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FE1PaletteCouleurs() {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-800 mb-4">
        <span className="text-[9px] font-bold text-gray-400 mr-1">A.1.1.2</span>
        Palette Couleurs Officielles
      </h3>
      <p className="text-xs text-gray-400 mb-3">Chaque bot a une couleur Tailwind assignee</p>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {OFFICIAL_BOTS.map(bot => (
          <div key={bot.code} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full bg-${bot.color}-500`} />
            <span className="text-xs font-medium text-gray-700">{bot.name}</span>
            <span className="text-[9px] text-gray-400">{bot.code} — {bot.color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FE1GradientHeaders() {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-800 mb-4">
        <span className="text-[9px] font-bold text-gray-400 mr-1">A.1.1.3</span>
        En-tetes Gradient par Bot
      </h3>
      <p className="text-xs text-gray-400 mb-3">bg-gradient-to-r from-color-600 to-color-400</p>
      <div className="space-y-3">
        {OFFICIAL_BOTS.map(bot => (
          <div key={bot.code} className={`rounded-xl p-4 bg-gradient-to-r from-${bot.color}-600 to-${bot.color}-400 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg">{bot.emoji}</span>
              </div>
              <div>
                <div className="text-sm font-bold">{bot.name} — {bot.role}</div>
                <div className="text-xs text-white/70">{bot.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// FE.4b — Galerie 12 agents animee (import DIRECT de AgentGalleryPage)
// ================================================================

function FE4bGalerieAgents() {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-800 mb-4">
        <span className="text-[9px] font-bold text-gray-400 mr-1">FE.4b</span>
        Galerie Agents AI — 12 cartes animees
      </h3>
      <p className="text-xs text-gray-400 mb-3">VRAIS composants de AgentGalleryPage — circuits SVG animes, waveform, dots, elements uniques par bot</p>
      <style>{AG_KEYFRAMES}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {AGENTS.map((agent, i) => (
          <AgentAnimatedCard key={agent.code} agent={agent} index={i} />
        ))}
      </div>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterBibleVisuelCiblePage() {
  const [activeTab, setActiveTab] = useState<TabId>("identite");
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="5xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Crosshair}
          iconColor="text-rose-600"
          title="A.5 Bible Visuelle Cible — Comparaison"
          subtitle="FE.1 vs FE.2 — Selectionner les designs finaux"
          onBack={() => setActiveView("bible-visuelle")}
        />
      }
    >
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-solid border-indigo-400 rounded bg-indigo-100" />
          <span className="text-[9px] text-indigo-600 font-medium">FE.1 Bible Visuelle (design conceptuel)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-solid border-emerald-400 rounded bg-emerald-100" />
          <span className="text-[9px] text-emerald-600 font-medium">FE.2 Bible Live (audit plateforme)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-solid border-amber-400 rounded bg-amber-100" />
          <span className="text-[9px] text-amber-600 font-medium">Contradictions / Ecarts</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1.5 mb-6 border-b pb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "bg-rose-100 text-rose-700 font-semibold"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB CONTENT — Chaque source apparait UNE SEULE FOIS       */}
      {/* ═══════════════════════════════════════════════════════════ */}

      <div className="space-y-6">

        {/* ─── 1. IDENTITE & AVATARS ─── */}
        {activeTab === "identite" && (
          <>
            <SourceBanner source="fe1" title="FE.1 — Identite visuelle (12 bots, couleurs, gradients)">
              <div className="space-y-8">
                <FE1EquipeAgents />
                <FE4bGalerieAgents />
                <FE1PaletteCouleurs />
                <FE1GradientHeaders />
              </div>
            </SourceBanner>
            <ContradictionNote items={[
              "FE.1 utilise des emojis (emoji field) tandis que FE.2 utilise des icones Lucide (icon field) — choisir UN systeme",
              "FE.1 bot cards montrent profil+standby images, FE.2 Tab2 montre uniquement les standby en grille",
              "FE.1 palette utilise 12 couleurs (blue,violet,emerald,pink,red,orange,slate,teal,rose,amber,indigo,zinc), verifier coherence avec FE.2",
            ]} />
            <SourceBanner source="fe2" title="FE.2 — Tab1 Identite (noms, roles, couleurs live)">
              <Tab1Identite />
            </SourceBanner>
            {/* Tab2 Avatars supprime — migre dans Tab1 Identite */}
          </>
        )}

        {/* ─── 2. STRUCTURE & LAYOUTS ─── */}
        {activeTab === "structure" && (
          <>
            <SourceBanner source="fe1" title="FE.1 — Layout & Navigation (6 sections: page structure, nav bar, headers dept/espace/pipeline, CREDO)">
              <FE1TabLayout />
            </SourceBanner>
            <ContradictionNote items={[
              "FE.1 montre 3 types headers (departement, espace, pipeline) tandis que FE.2 Tab3 montre les layouts zones (sidebar, center, console)",
              "FE.1 inclut le CREDO Phase Indicator ici tandis que FE.2 ne le documente nulle part",
              "FE.1 navigation barre: sub-tabs pill (bg-gray-900/text-white active) — comparer avec FE.2 Tab5",
            ]} />
            <SourceBanner source="fe2" title="FE.2 — Tab3 Layouts (zones, grilles, sidebar/center/console)">
              <Tab3Layouts />
            </SourceBanner>
          </>
        )}

        {/* ─── 3. HEADERS ─── */}
        {activeTab === "headers" && (
          <>
            <p className="text-xs text-gray-500 italic px-1 mb-2">
              Les headers FE.1 sont dans le tab Structure (gradient departement/espace/pipeline).
              FE.2 Tab4 contient un audit exhaustif de 17+ types de headers trouves dans la plateforme.
            </p>
            <ContradictionNote items={[
              "FE.1 definit 3 types de headers (departement, espace, pipeline), FE.2 en identifie 17+ — besoin d'harmoniser",
              "FE.1 gradient standard: from-{color}-600 to-{color}-400 — verifier que TOUS les headers FE.2 suivent ce pattern",
              "Certains headers FE.2 utilisent des hauteurs et paddings differents (py-2.5 vs py-3 vs py-4)",
            ]} />
            <SourceBanner source="fe2" title="FE.2 — Tab4 Headers (audit exhaustif: 17+ types identifies)">
              <Tab4Headers />
            </SourceBanner>
          </>
        )}

        {/* ─── 4. CARDS ─── */}
        {activeTab === "cards" && (
          <>
            <SourceBanner source="fe1" title="FE.1 — Cards & Data (19 sections: containers, gradients, KPI, TDC, cockpit, VITAA, alertes...)">
              <FE1TabCardsData />
            </SourceBanner>
            <ContradictionNote items={[
              "FE.1 KPI cards: gradient header from-{color}-600 to-{color}-500, value text-2xl — standard a suivre partout",
              "FE.1 montre 19 types de cards vs FE.2 Tab6 qui liste les cards trouvees en live — comparer les differences",
              "FE.1 TDC cards: grid-cols-5, gradient header — verifier que c'est le meme pattern que live",
            ]} />
            <SourceBanner source="fe2" title="FE.2 — Tab6 Cards (inventaire live des types de cards)">
              <Tab6Cards />
            </SourceBanner>
          </>
        )}

        {/* ─── 5. COMPOSANTS (typo + boutons + badges + tabs + indicateurs) ─── */}
        {activeTab === "composants" && (
          <>
            <p className="text-xs text-gray-500 italic px-1 mb-2">
              FE.1 regroupe TOUS les composants atomiques dans un seul onglet (14 sections).
              FE.2 les separe en tabs individuels. Les deux sont affiches ici pour comparaison complete.
            </p>
            <SourceBanner source="fe1" title="FE.1 — Composants (14 sections: typo, boutons, badges, recherche, scores, pilules, icones, couleurs, fonds, formulaires...)">
              <FE1TabComposants />
            </SourceBanner>
            <ContradictionNote items={[
              "FE.1 typo: text-sm font-bold pour titres section, FE.2 Tab7 peut montrer des variations — harmoniser",
              "FE.1 boutons: 4 types (primary/outline/ghost/start), FE.2 Tab8 peut en avoir plus — unifier",
              "FE.1 badges: variant outline text-[9px], FE.2 Tab9 peut avoir des tailles differentes",
              "FE.1 score bars: h-2.5 bg-gray-100 rounded-full — verifier coherence avec FE.2 Tab11",
              "FE.1 icones: h-3.5/h-4/h-5 selon contexte — FE.2 peut utiliser des tailles differentes",
            ]} />
            <SourceBanner source="fe2" title="FE.2 — Tab5 Tabs & Navigation (patterns de navigation live)">
              <Tab5Tabs />
            </SourceBanner>
            <SourceBanner source="fe2" title="FE.2 — Tab7 Typographie (polices et tailles live)">
              <Tab7Typo />
            </SourceBanner>
            <SourceBanner source="fe2" title="FE.2 — Tab8 Boutons (types de boutons live)">
              <Tab8Boutons />
            </SourceBanner>
            <SourceBanner source="fe2" title="FE.2 — Tab9 Badges (badges et pills live)">
              <Tab9Badges />
            </SourceBanner>
          </>
        )}

        {/* ─── 6. BULLES & MESSAGES ─── */}
        {activeTab === "bulles" && (
          <>
            <SourceBanner source="fe1" title="FE.1 — Bulles & Actions (8 sections: catalogue, options vs boutons, production, simulation, anti-loop, chef orchestre)">
              <FE1TabBullesActions />
            </SourceBanner>
            <ContradictionNote items={[
              "FE.1 definit 8 types de bulles de production vs FE.2 Tab10 qui montre les bulles live — comparer",
              "FE.1 bot bubble: bg-white border-l-[3px] border-l-{color}-400 rounded-xl rounded-tl-none — est-ce le meme que live?",
              "FE.1 user bubble: bg-blue-50 rounded-xl rounded-tr-none — verifier avec FE.2",
              "FE.1 options textuelles vs boutons d'action: deux niveaux distincts — verifier que le live respecte cette separation",
            ]} />
            <SourceBanner source="fe2" title="FE.2 — Tab10 Bulles (bulles de conversation live)">
              <Tab10Bulles />
            </SourceBanner>
          </>
        )}

        {/* ─── 7. COULEURS & INDICATEURS ─── */}
        {activeTab === "couleurs" && (
          <>
            <ContradictionNote items={[
              "FE.1 definit les couleurs dans les sections Identite (palette) et Composants (statut, fonds pastel)",
              "FE.2 Tab12 fait un audit des couleurs live — comparer avec la palette officielle FE.1",
              "FE.2 Tab11 montre les indicateurs (scores, barres) — comparer avec FE.1 score bars",
            ]} />
            <SourceBanner source="fe2" title="FE.2 — Tab12 Couleurs (palette live, usage des couleurs)">
              <Tab12Couleurs />
            </SourceBanner>
            <SourceBanner source="fe2" title="FE.2 — Tab11 Indicateurs (barres, jauges, scores live)">
              <Tab11Indicateurs />
            </SourceBanner>
          </>
        )}

        {/* ─── 8. SKINS COGNITIFS ─── */}
        {activeTab === "skins" && (
          <SourceBanner source="fe2" title="FE.2 — Tab15 Skins (modes de reflexion, teintures cognitives)">
            <Tab15Skins />
          </SourceBanner>
        )}

        {/* ─── 9. MENU GAUCHE ─── */}
        {activeTab === "menu" && (
          <SourceBanner source="fe2" title="FE.2 — Tab16 Menu Gauche (sidebar, sections, navigation)">
            <Tab16MenuGauche />
          </SourceBanner>
        )}

        {/* ─── 10. CONSOLE DROITE ─── */}
        {activeTab === "console" && (
          <SourceBanner source="fe2" title="FE.2 — Tab17 Console Droite (voice, avatar, CarlOS, Jitsi...)">
            <Tab17ConsoleDroite />
          </SourceBanner>
        )}

        {/* ─── 11. VISUALISATIONS ─── */}
        {activeTab === "visualisations" && (
          <SourceBanner source="fe1" title="FE.1 — Visualisations (11 sections: split screen, 3-col, SWOT, timeline, sticky board, 5 pourquoi, go/no-go, verdict, timer, Ishikawa)">
            <FE1TabVisualisations />
          </SourceBanner>
        )}

        {/* ─── 12. AUDIT (doublons & ecarts) ─── */}
        {activeTab === "audit" && (
          <>
            <SourceBanner source="fe1" title="FE.1 — Archive (specimens bulles anciens)">
              <FE1TabArchive />
            </SourceBanner>
            <SourceBanner source="fe2" title="FE.2 — Tab13 Doublons (composants dupliques identifies)">
              <Tab13Doublons />
            </SourceBanner>
            <SourceBanner source="fe2" title="FE.2 — Tab14 Ecarts (deviations du design system)">
              <Tab14Ecarts />
            </SourceBanner>
          </>
        )}

      </div>
    </PageLayout>
  );
}
