/**
 * MasterTableauPeriodiquePage.tsx — Tableau Périodique GHML : 232 Éléments Propriétaires
 * Source: Bible-GHML-V2 Partie 7
 * Master GHML — Session 48
 */

import {
  Atom, Beaker, Layers, Sparkles, ArrowRight, Zap,
  BookOpen, Target, Users, Server, BarChart3, TrendingUp,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA
// ======================================================================

const GROUPS = [
  { code: "S", name: "Savoir / Sectoriel", desc: "Données marché, cartographies, leaders, tendances", color: "bg-blue-100 text-blue-800", border: "border-blue-200" },
  { code: "P", name: "Pratique / Patterns", desc: "Méthodes, processus, techniques, frameworks", color: "bg-green-100 text-green-800", border: "border-green-200" },
  { code: "T", name: "Technologie", desc: "Outils techniques, IA, IoT, calculs", color: "bg-purple-100 text-purple-800", border: "border-purple-200" },
  { code: "H", name: "Humain", desc: "Soft skills, communication, leadership, créativité", color: "bg-amber-100 text-amber-800", border: "border-amber-200" },
];

const SOURCES = [
  { source: "Fondamental", count: 12, desc: "Pipeline Usine Bleue (Li→Vc→Jm→Cp→Cr)", color: "bg-blue-600" },
  { source: "CREDO", count: 119, desc: "Méthode d'influence créative (vente, communication)", color: "bg-green-600" },
  { source: "Orbit9", count: 101, desc: "Système d'exploitation économique (entreprise, stratégie)", color: "bg-purple-600" },
];

const FONDAMENTAUX: { num: number; sym: string; name: string; group: string; period: number; valence: number; coef: number; agent: string; phase: string; desc: string }[] = [
  { num: 1, sym: "Li", name: "Lead Industriel", group: "S", period: 1, valence: 2, coef: 1.0, agent: "CSO", phase: "C", desc: "Entrée pipeline (Phase 0 Aiguillage)" },
  { num: 2, sym: "Vc", name: "Visite Client", group: "P", period: 2, valence: 3, coef: 2.0, agent: "COO", phase: "R", desc: "Diagnostic terrain (Phase 1 VIST)" },
  { num: 3, sym: "Jm", name: "Jumelage", group: "P", period: 3, valence: 4, coef: 2.5, agent: "CSO", phase: "E", desc: "Matching fournisseur (Phase 2 JUAN)" },
  { num: 4, sym: "Cp", name: "Cahier de Projet", group: "P", period: 3, valence: 3, coef: 2.5, agent: "CTO", phase: "D", desc: "Livrable technique (Phase 3 CPRJ)" },
  { num: 5, sym: "Mf", name: "Manufacturing PME", group: "S", period: 1, valence: 5, coef: 1.5, agent: "CSO", phase: "C", desc: "Substrat client (isotopes acier, alu...)" },
  { num: 6, sym: "Au", name: "Automatisation", group: "T", period: 2, valence: 3, coef: 2.0, agent: "CTO", phase: "E", desc: "Solution technique" },
  { num: 7, sym: "Nt", name: "Neutralité", group: "H", period: 4, valence: 1, coef: 3.5, agent: "CEO", phase: "C", desc: "Catalyseur confiance (9.3/10)" },
  { num: 8, sym: "Ro", name: "Réseau REAI", group: "S", period: 2, valence: 6, coef: 2.0, agent: "CSO", phase: "R", desc: "700+ Ressources Bleues" },
  { num: 9, sym: "Sb", name: "Subvention", group: "P", period: 2, valence: 2, coef: 1.5, agent: "CFO", phase: "D", desc: "CNRC, MEIE, IQ, PARI, PPIA" },
  { num: 10, sym: "Cr", name: "Conversion", group: "P", period: 4, valence: 2, coef: 3.0, agent: "CSO", phase: "O", desc: "Transaction complétée" },
  { num: 11, sym: "Co", name: "Collaboration", group: "H", period: 2, valence: 4, coef: 2.0, agent: "CEO", phase: "E", desc: "Travail inter-agents" },
  { num: 12, sym: "Ep", name: "Expertise Projet", group: "T", period: 3, valence: 3, coef: 2.5, agent: "CTO", phase: "D", desc: "Savoir technique accumulé" },
];

const CREDO_PHASES = [
  { phase: "Connecter", count: 24, pages: 74, examples: "RFM Scoring, Herrmann 4 couleurs, Hook 30 sec", color: "bg-blue-50 text-blue-700" },
  { phase: "Rechercher", count: 16, pages: 32, examples: "SONCAS (6 leviers), Diagnostic 3 Sphères, Écoute Active", color: "bg-green-50 text-green-700" },
  { phase: "Exposer", count: 35, pages: 118, examples: "Storytelling, Double Exposition, Créativité, Humour, Voix", color: "bg-amber-50 text-amber-700" },
  { phase: "Démontrer", count: 15, pages: 18, examples: "Argumentation, Objections, Preuves ROI, Benchmarks", color: "bg-purple-50 text-purple-700" },
  { phase: "Obtenir", count: 29, pages: 56, examples: "11 Tactiques Négociation, Closing, Fidélisation, 25 Qualités", color: "bg-rose-50 text-rose-700" },
];

const ORBIT9_PARTS = [
  { part: "Part 1-2", count: 20, theme: "Machine à créer des entreprises", examples: "Holacracy, DNA Bootstrap (3 phases), ExitUp, Crowd Dev/Selling" },
  { part: "Part 3", count: 25, theme: "Profondeur sectorielle", examples: "5 Cartographies CB Insights, Données QC, Personas" },
  { part: "Part 4", count: 18, theme: "Couche stratégique", examples: "Balanced Scorecard, OKR, Scaling Up, SWOT, Go/No-Go" },
  { part: "Part 5", count: 20, theme: "Moteur commercial", examples: "BMC, Funnel 9 Phases, Pipeline Kinetics, Business Plan" },
  { part: "Part 6-7", count: 18, theme: "Couche symbolique/branding", examples: "Géométrie Sacrée, TimeToken, Spirale GHML, GhostX, INCCHAIN" },
];

const BREAKTHROUGH_ELEMENTS = [
  { sym: "Ef", name: "Énergie-Fréquence-Vibration", group: "H", period: 7, desc: "3-6-9 Tesla — principe fondateur Usine Bleue" },
  { sym: "Gs", name: "Géométrie Sacrée", group: "H", period: 6, desc: "Patterns universels (Phi, Fibonacci)" },
  { sym: "Ic", name: "INCCHAIN", group: "T", period: 6, desc: "Chaîne de valeur incrémentale brevetée" },
  { sym: "Sp2", name: "Spirale GHML", group: "T", period: 6, desc: "TT_Valeur = TT_Input × (1+C_cat) × Φ^(n×η)" },
  { sym: "Ip2", name: "IPToken", group: "T", period: 6, desc: "Token de propriété intellectuelle patrimoine" },
];

const MECHANISMS = [
  { name: "Poids", formula: "Poids = Coefficient × Valence", desc: "Coefficient (1.0-4.0) = importance. Valence (1-6) = connectivité." },
  { name: "Promotion d'état", formula: "GAZ → LIQUIDE → SOLIDE", desc: "Intuition brute → hypothèse validée → prouvé. Les 12 fondamentaux sont SOLIDES." },
  { name: "Réactions naturelles", formula: "Interactions pré-définies", desc: "Chaque élément a des interactions (ex: Li interagit avec Vc, Nt, Mf, Ro)." },
  { name: "Structure fractale", formula: "Global → Client → Projet → Branche", desc: "Même structure [S,P,T,H] à chaque niveau de zoom." },
];

// ======================================================================
// COMPOSANT
// ======================================================================

const GROUP_COLORS: Record<string, string> = {
  S: "bg-blue-100 text-blue-800 border-blue-200",
  P: "bg-green-100 text-green-800 border-green-200",
  T: "bg-purple-100 text-purple-800 border-purple-200",
  H: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function MasterTableauPeriodiquePage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Tableau Périodique GHML"
        subtitle="232 éléments propriétaires × 4 groupes × 7 périodes × 3 sources"
        gradient="from-violet-700 to-purple-500"
        icon={<Atom className="h-5 w-5" />}
      />

      {/* ── Vue d'Ensemble ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Vue d'Ensemble</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">232</p>
            <p className="text-xs text-gray-500">Éléments</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">4</p>
            <p className="text-xs text-gray-500">Groupes</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">7</p>
            <p className="text-xs text-gray-500">Périodes</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="text-xs text-gray-500">États</p>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ── 4 Groupes ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">4 Groupes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {GROUPS.map((g) => (
            <Card key={g.code} className={cn("p-3 border", g.border)}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("w-8 h-8 rounded flex items-center justify-center text-sm font-bold", g.color)}>
                  [{g.code}]
                </span>
                <p className="text-sm font-medium text-gray-800">{g.name}</p>
              </div>
              <p className="text-xs text-gray-600 ml-10">{g.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 3 Sources ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">3 Sources — Distribution</h2>
        <div className="space-y-3">
          {SOURCES.map((s) => (
            <Card key={s.source} className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold", s.color)}>
                  {s.count}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.source}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={cn("h-2 rounded-full", s.color)} style={{ width: `${(s.count / 232) * 100}%` }} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 12 Éléments Fondamentaux (le tableau visuel) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">12 Éléments Fondamentaux — Pipeline Usine Bleue</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FONDAMENTAUX.map((el) => (
            <Card key={el.num} className={cn("p-3 border", GROUP_COLORS[el.group])}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">#{el.num}</span>
                <Badge variant="outline" className="text-xs">{el.phase}</Badge>
              </div>
              <div className="text-center mb-2">
                <p className="text-2xl font-bold">{el.sym}</p>
                <p className="text-xs font-medium">{el.name}</p>
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-xs text-gray-500">P{el.period} · V{el.valence} · C{el.coef}</p>
                <p className="text-xs text-gray-400">{el.agent}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">{el.desc}</p>
            </Card>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          P = Période, V = Valence (connectivité), C = Coefficient (importance), Phase = Phase CREDO dominante
        </p>
      </div>

      <SectionDivider />

      {/* ── Éléments CREDO par phase ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">119 Éléments CREDO par Phase</h2>
        <div className="space-y-2">
          {CREDO_PHASES.map((c) => (
            <Card key={c.phase} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-xs", c.color)}>{c.phase}</Badge>
                <span className="text-sm font-medium text-gray-800">~{c.count} éléments</span>
                <span className="text-xs text-gray-400 ml-auto">{c.pages} pages source</span>
              </div>
              <p className="text-xs text-gray-600">{c.examples}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Éléments Orbit9 ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">101 Éléments Orbit9 par Partie</h2>
        <div className="space-y-2">
          {ORBIT9_PARTS.map((o) => (
            <Card key={o.part} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{o.part}</Badge>
                <span className="text-sm font-medium text-gray-800">~{o.count} éléments</span>
                <span className="text-xs text-gray-400 ml-auto">{o.theme}</span>
              </div>
              <p className="text-xs text-gray-600">{o.examples}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Éléments Breakthrough (P6-P7) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Éléments Breakthrough — Périodes 6-7</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BREAKTHROUGH_ELEMENTS.map((el) => (
            <Card key={el.sym} className={cn("p-3 border", GROUP_COLORS[el.group])}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold">{el.sym}</span>
                <p className="text-sm font-medium text-gray-800">{el.name}</p>
                <Badge variant="outline" className="text-xs ml-auto">P{el.period}</Badge>
              </div>
              <p className="text-xs text-gray-600">{el.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Mécanismes ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mécanismes du Tableau</h2>
        <div className="space-y-3">
          {MECHANISMS.map((m) => (
            <Card key={m.name} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="h-4 w-4 text-purple-500 shrink-0" />
                <p className="text-sm font-medium text-gray-800">{m.name}</p>
              </div>
              <p className="text-xs text-gray-700 font-mono mb-1">{m.formula}</p>
              <p className="text-xs text-gray-500">{m.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : Bible-GHML-V2 Partie 7 · 232 éléments propriétaires · CREDO 296 pages ·
          Orbit9 101 éléments · Structure fractale S/P/T/H
        </p>
      </div>
    </PageLayout>
  );
}
