/**
 * MasterCortexRobotPage.tsx — GHML × Robots Humanoïdes — Le Cortex Manufacturier
 * Source: Bible-GHML-V2 Section 4.11 + Challenge Factory Ghost Bots
 * Master GHML — Session 48
 */

import {
  Bot, Cpu, Layers, Factory, Zap, Brain, Target,
  Shield, Settings, BarChart3, Star, ArrowRight,
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

const ARCH_LAYERS = [
  { layer: "1", name: "Hardware Robot", resp: "Fabricant (Figure, BYD, LimX)", func: "Capteurs, actuateurs, locomotion. GHML ne touche pas.", color: "bg-gray-100 text-gray-700" },
  { layer: "2", name: "OS Moteur / Cervelet", resp: "COSA, Helix, OM1", func: "Perception, planification mouvement, exécution physique. GHML interface via API.", color: "bg-blue-50 text-blue-700" },
  { layer: "3", name: "GHML Cortex", resp: "CarlOS + GhostX", func: "Trisociation active (3 OS par décision), contexte GHML injecté, CREDO comme protocole.", color: "bg-purple-50 text-purple-700" },
  { layer: "4", name: "Orchestration", resp: "Brain Team Master", func: "Coordination multi-robots, allocation de tâches, learning loop.", color: "bg-amber-50 text-amber-700" },
];

const TOP_BOTS_MANUF = [
  { rank: 1, name: "QA Spectre", func: "Contrôle qualité visuel temps réel", impact: "Réduction rebuts %, satisfaction client", complexity: "Complexe" },
  { rank: 2, name: "Inventory Sentinel", func: "Surveillance stocks, commandes auto", impact: "Réduction coûts stockage, ruptures", complexity: "Moyen" },
  { rank: 3, name: "Maintenance Whisperer", func: "Prédiction pannes via capteurs", impact: "Temps d'arrêt %, coûts maintenance", complexity: "Complexe" },
  { rank: 4, name: "Safety Specter", func: "Surveillance conditions sécurité plancher", impact: "Accidents travail, conformité", complexity: "Moyen" },
  { rank: 5, name: "Shift Scheduler", func: "Optimisation horaires selon production", impact: "Utilisation main-d'œuvre, moral", complexity: "Moyen" },
  { rank: 6, name: "Energy Eye", func: "Monitoring consommation énergie temps réel", impact: "Consommation, empreinte carbone", complexity: "Simple" },
  { rank: 7, name: "Material Mover", func: "Optimisation trajets chariots/AGV", impact: "Temps de cycle, réduction millage", complexity: "Moyen" },
  { rank: 8, name: "Changeover Chaser", func: "Optimisation changements production (SMED)", impact: "Temps changement, réduction erreurs", complexity: "Moyen" },
  { rank: 9, name: "OEE Oracle", func: "Efficacité production TRS temps réel", impact: "OEE %, amélioration continue", complexity: "Simple" },
  { rank: 10, name: "Training Tracker", func: "Suivi formation + micro-learning", impact: "Compétences, réduction erreurs", complexity: "Moyen" },
];

const TOP_BOTS_FOURNISSEURS = [
  { rank: 1, name: "Opportunity Navigator", func: "Scan web pour projets d'automatisation", impact: "Prospects qualifiés, temps prospection" },
  { rank: 2, name: "Proposal Architect", func: "Génération propositions techniques auto", impact: "Temps création propositions, taux conversion" },
  { rank: 3, name: "Integration Orchestrator", func: "Coordination équipes + suivi projets", impact: "Délais livraison, satisfaction client" },
  { rank: 4, name: "Demo Doctor", func: "Simulations et démonstrations interactives", impact: "Engagement client" },
  { rank: 5, name: "ROI Raconteur", func: "Calcul et présentation ROI projets", impact: "Confiance clients, ventes" },
];

const PRIORITY_MATRIX = [
  { rank: 1, bot: "OEE Oracle", segment: "Manufacturiers", why: "Impact élevé, facile, identification rapide gaspillages" },
  { rank: 2, bot: "Lead Logger", segment: "Fournisseurs", why: "Impact élevé, facile, améliore pipeline ventes" },
  { rank: 3, bot: "Inventory Sentinel", segment: "Manufacturiers", why: "Impact moyen, réduit coûts et ruptures" },
  { rank: 4, bot: "Opportunity Navigator", segment: "Fournisseurs", why: "Impact moyen, automatise la prospection" },
  { rank: 5, bot: "Communication Concierge", segment: "Transversal", why: "Impact élevé, facile, sert les deux segments" },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterCortexRobotPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Cortex Robot Humanoïde GHML"
        subtitle="GHML = Cortex Préfrontal des robots usine × 24 bots spécialisés × Matrice de priorité"
        gradient="from-gray-800 to-gray-600"
        icon={<Bot className="h-5 w-5" />}
      />

      {/* ── La Thèse ── */}
      <div className="mb-8">
        <Card className="p-4 bg-gradient-to-r from-gray-50 to-slate-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">La Thèse</h2>
          <p className="text-sm text-gray-700 mb-3">
            BYD cible 20,000 robots humanoïdes en 2026. Figure AI est valorisé à 39 milliards.
            Tous construisent des OS de <strong>MOUVEMENT</strong> (cervelet). Personne ne construit le <strong>CORTEX PRÉFRONTAL</strong> — le système décisionnel qui sait QUOI faire et POURQUOI dans le contexte d'une usine.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-white">
              <p className="text-xs font-semibold text-gray-500 mb-1">CERVELET (Helix/COSA/OM1)</p>
              <p className="text-sm text-gray-700">Comment marcher, saisir, naviguer</p>
            </Card>
            <Card className="p-3 bg-white">
              <p className="text-xs font-semibold text-purple-500 mb-1">CORTEX (GHML/CarlOS)</p>
              <p className="text-sm text-gray-700">Quoi faire, pourquoi, dans quel contexte</p>
            </Card>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Architecture 4 Couches ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Architecture d'Intégration — 4 Couches</h2>
        <div className="space-y-3">
          {ARCH_LAYERS.map((l) => (
            <Card key={l.layer} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", l.color)}>
                  {l.layer}
                </span>
                <p className="text-sm font-medium text-gray-800">{l.name}</p>
                <Badge variant="outline" className="text-xs ml-auto">{l.resp}</Badge>
              </div>
              <p className="text-xs text-gray-600 ml-9">{l.func}</p>
            </Card>
          ))}
        </div>
        <Card className="p-3 mt-4 bg-purple-50/50">
          <p className="text-xs text-gray-700 italic">
            Le robot humanoïde est simplement un nouveau « Bot » dans la Brain Team — avec un corps physique au lieu d'un chat Telegram. L'architecture GHML s'y adapte naturellement.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Top 10 Bots Manufacturiers ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Bots — Manufacturiers</h2>
        <div className="space-y-2">
          {TOP_BOTS_MANUF.map((b) => (
            <Card key={b.rank} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">#{b.rank}</span>
                <p className="text-sm font-medium text-gray-800">{b.name}</p>
                <Badge variant="outline" className="text-xs ml-auto">{b.complexity}</Badge>
              </div>
              <p className="text-xs text-gray-600">{b.func}</p>
              <p className="text-xs text-gray-400 mt-1">Impact : {b.impact}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Top 5 Bots Fournisseurs ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Bots — Fournisseurs Automatisation</h2>
        <div className="space-y-2">
          {TOP_BOTS_FOURNISSEURS.map((b) => (
            <Card key={b.rank} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">#{b.rank}</span>
                <p className="text-sm font-medium text-gray-800">{b.name}</p>
              </div>
              <p className="text-xs text-gray-600">{b.func}</p>
              <p className="text-xs text-gray-400 mt-1">Impact : {b.impact}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Matrice de Priorisation Top 5 ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Matrice de Priorisation — Top 5</h2>
        <p className="text-sm text-gray-500 mb-3">Critères : Impact × Facilité × Revenus</p>
        <div className="space-y-2">
          {PRIORITY_MATRIX.map((p) => (
            <Card key={p.rank} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-mono text-gray-400">#{p.rank}</span>
                <p className="text-sm font-medium text-gray-800">{p.bot}</p>
                <Badge variant="outline" className="text-xs ml-auto">{p.segment}</Badge>
              </div>
              <p className="text-xs text-gray-500">{p.why}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : Bible-GHML-V2 Section 4.11 · CHALLENGE-FACTORY-GHOST-BOTS.md ·
          Trisociation BFA: Ohno + Deming + Nightingale · 137 tâches opérationnelles mappées
        </p>
      </div>
    </PageLayout>
  );
}
