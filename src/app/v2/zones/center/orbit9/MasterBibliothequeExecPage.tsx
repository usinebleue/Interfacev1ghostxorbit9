/**
 * MasterBibliothequeExecPage.tsx — Bibliothèque d'Exécution GhostX
 * Source: bibliotheque_execution_ghostx_MASTER.md
 * Master GHML — Session 48
 */

import {
  Library, Building2, Globe, Cpu, Users, FileText,
  Calendar, Settings, BarChart3, Star, CheckCircle2,
  Briefcase, Target, Layers, ClipboardList,
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

const THREE_MODELS = [
  {
    code: "A", name: "PME Industrielle QC", icon: Building2,
    color: "from-blue-600 to-blue-500",
    focus: "Production physique, chaîne d'approvisionnement, conformité CNESST, usine",
    employees: "50-200",
    keyRoles: ["Planificateur production", "Technicien maintenance", "Responsable qualité", "Superviseur de ligne", "Acheteur industriel"],
    keyKPIs: ["TRS/OEE", "Coût non-qualité %", "OTIF %", "DSO/DPO", "Taux accident"],
    tools: "ERP (SAP, Netsuite), MES, WMS, GMAO, Power BI",
  },
  {
    code: "B", name: "Entreprise Universelle", icon: Globe,
    color: "from-green-600 to-green-500",
    focus: "Services, transformation, processus métiers, scalabilité",
    employees: "20-500",
    keyRoles: ["Chargé de projet", "Spécialiste livraison", "Analyste d'affaires", "Coordonnateur", "Gestionnaire de compte"],
    keyKPIs: ["Coût par transaction", "Temps de cycle", "CSAT", "Efficacité processus", "Churn"],
    tools: "CRM, BPMN tools, Gestion de projet (Asana, Jira), Zendesk",
  },
  {
    code: "C", name: "Intégrateur Automatisation", icon: Cpu,
    color: "from-purple-600 to-purple-500",
    focus: "Services d'intégration, projets complexes, facturation par mandat, IP interne",
    employees: "30-150",
    keyRoles: ["Développeur automatisation", "Architecte de solution", "Chef de projet", "Consultant terrain", "Avant-vente"],
    keyKPIs: ["Taux utilisation facturable", "Marge par projet", "NPS client", "Revenus par employé", "Win rate"],
    tools: "PSA (Kantata), CRM, Gestion de projet, IDE, CI/CD",
  },
];

const CLEVEL_TASKS = [
  { role: "CEO", bot: "CEOB", tasks: 30, topAuto: ["Analyser tableaux de bord KPIs (★★★)", "Préparer agenda CODIR (★★★)", "Lire veille concurrentielle (★★★)", "Suivre KPIs usine TRS (★★★)"] },
  { role: "CFO", bot: "CFOB", tasks: 30, topAuto: ["Générer états financiers (★★★)", "Analyser variance budget (★★★)", "Suivi trésorerie (★★★)", "Rapports conformité ARC/RQ (★★)"] },
  { role: "COO", bot: "COOB", tasks: 30, topAuto: ["Planification production (★★★)", "Suivi OFs dans ERP (★★★)", "Rapports de performance (★★★)", "Tableau de bord ops (★★★)"] },
  { role: "CTO", bot: "CTOB", tasks: 30, topAuto: ["Monitoring infrastructure (★★★)", "Alertes sécurité (★★★)", "Rapports de dette technique (★★)", "Déploiement automatisé (★★★)"] },
  { role: "CMO", bot: "CMOB", tasks: 25, topAuto: ["Analytics marketing digital (★★★)", "Génération contenu (★★)", "Rapports performance campagnes (★★★)", "Social media monitoring (★★★)"] },
  { role: "CSO", bot: "CSOB", tasks: 25, topAuto: ["Veille concurrentielle (★★★)", "Analyse pipeline stratégique (★★)", "Scoring opportunités (★★)", "Rapports veille sectorielle (★★★)"] },
  { role: "CHRO", bot: "CHROB", tasks: 25, topAuto: ["Sondages engagement (★★★)", "Suivi formation (★★★)", "Rapports roulement (★★★)", "Screening CV (★★)"] },
  { role: "CRO", bot: "CROB", tasks: 25, topAuto: ["Suivi pipeline ventes (★★★)", "Forecasting (★★★)", "Rapports performance reps (★★★)", "Scoring leads (★★★)"] },
  { role: "CINO", bot: "CINOB", tasks: 20, topAuto: ["Veille technologique (★★★)", "Gestion portfolio PI (★★)", "Rapports R&D (★★)", "Benchmark innovation (★★)"] },
  { role: "CPO/Factory", bot: "CPOB", tasks: 30, topAuto: ["Monitoring TRS machines (★★★)", "Suivi maintenance GMAO (★★★)", "Alertes SST (★★★)", "Rapports production (★★★)"] },
  { role: "CLO", bot: "CLOB", tasks: 20, topAuto: ["Suivi renouvellements contrats (★★★)", "Alertes conformité (★★★)", "Gestion registre Loi 25 (★★)", "Veille réglementaire (★★★)"] },
  { role: "CISO", bot: "CISOB", tasks: 20, topAuto: ["Monitoring cybersécurité (★★★)", "Alertes vulnérabilités (★★★)", "Rapports conformité SOC2/NIST (★★)", "Tests automatisés (★★★)"] },
];

const MEETING_TYPES = [
  { name: "COMEX / CODIR", freq: "Hebdomadaire", duration: "2h", participants: "CEO + VPs/Directeurs", output: "Décisions stratégiques, plans d'action" },
  { name: "Revue Stratégique (QBR)", freq: "Trimestrielle", duration: "4h", participants: "CODIR + Directeurs+1", output: "OKRs Q+1, ajustements stratégiques" },
  { name: "Daily Stand-up", freq: "Quotidienne", duration: "15 min", participants: "Équipe + Chef d'équipe", output: "Synchronisation, résolution blocages" },
  { name: "Revue d'Affaires (MBR)", freq: "Mensuelle", duration: "3h", participants: "CODIR + Ventes + Marketing", output: "Actions correctives pour objectifs" },
  { name: "One-on-One (1:1)", freq: "Bimensuelle", duration: "30 min", participants: "Manager + Employé", output: "Alignement, développement, feedback" },
  { name: "Kickoff Projet (Modèle C)", freq: "Par projet", duration: "2-3h", participants: "Chef projet + Client", output: "Alignement complet, lancement validé" },
  { name: "Revue de Sprint", freq: "Bi-hebdo", duration: "1h", participants: "Équipe + Product Owner", output: "Validation livrables, ajustement backlog" },
  { name: "Post-Mortem Projet", freq: "Fin de projet", duration: "1.5h", participants: "Équipe interne", output: "Leçons apprises, amélioration processus" },
];

const DOC_LIBRARY = [
  { category: "Universels", docs: ["Plan d'affaires", "États financiers", "Contrat d'emploi", "Fiche de poste", "Politiques RH", "Compte-rendu CODIR"] },
  { category: "Industriel (A)", docs: ["SOP production", "Fiche technique produit", "Registre GMAO", "Bon de commande PO", "Rapport non-conformité"] },
  { category: "Intégrateur (C)", docs: ["Proposition commerciale", "Statement of Work (SoW)", "Architecture de solution", "Plan de projet Gantt", "Rapport statut hebdo", "Cartographie processus As-Is/To-Be"] },
];

const CYCLE_VIE_C = [
  { phase: "1", name: "Identification", detail: "Veille marché, prospection, qualification initiale" },
  { phase: "2", name: "Qualification", detail: "Découverte besoins, démonstration capacités, analyse faisabilité" },
  { phase: "3", name: "Proposition", detail: "Architecture solution, estimation effort, rédaction SoW" },
  { phase: "4", name: "Négociation", detail: "Termes commerciaux, conditions, planification" },
  { phase: "5", name: "Signature", detail: "Contrat-cadre, SoW, mobilisation équipe" },
  { phase: "6", name: "Kickoff", detail: "Lancement formel, gouvernance, plan détaillé" },
  { phase: "7", name: "Analyse", detail: "As-Is mapping, identification gaps, workshops" },
  { phase: "8", name: "Développement", detail: "Sprints, développement, tests, intégration" },
  { phase: "9", name: "Recette (UAT)", detail: "Tests utilisateurs, validation, corrections" },
  { phase: "10", name: "Déploiement", detail: "Go-live, formation, hypercare" },
  { phase: "11", name: "Clôture", detail: "Post-mortem, documentation, transition support" },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterBibliothequeExecPage() {
  const totalTasks = CLEVEL_TASKS.reduce((s, c) => s + c.tasks, 0);

  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Bibliothèque d'Exécution GhostX"
        subtitle={`${totalTasks}+ tâches C-Level × 3 modèles × 150 rôles × Protocole DOMINO × FORGE`}
        gradient="from-indigo-600 to-violet-500"
        icon={Library}
      />

      {/* ── 3 Modèles d'Entreprise ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.3.1</span>3 Modèles d'Organisation Archétypaux</h2>
        <div className="grid grid-cols-1 gap-4">
          {THREE_MODELS.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.code} className="overflow-hidden">
                <div className={cn("bg-gradient-to-r px-4 py-3 flex items-center gap-3", m.color)}>
                  <Icon className="h-5 w-5 text-white" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Modèle {m.code} — {m.name}</h3>
                    <p className="text-xs text-white/80">{m.employees} employés</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Focus</p>
                    <p className="text-sm text-gray-700">{m.focus}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Rôles clés</p>
                    <div className="flex flex-wrap gap-1">
                      {m.keyRoles.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">KPIs</p>
                    <div className="flex flex-wrap gap-1">
                      {m.keyKPIs.map((k) => (
                        <Badge key={k} className="text-xs bg-gray-50 text-gray-600">{k}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Outils</p>
                    <p className="text-xs text-gray-600">{m.tools}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── 12 Postes C-Level ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2"><span className="text-[9px] font-bold text-gray-400 mr-1">F.3.2</span>12 Postes C-Level — Tâches Automatisables</h2>
        <p className="text-sm text-gray-500 mb-4">
          {totalTasks}+ tâches récurrentes documentées. ★★★ = candidat prioritaire pour automatisation CarlOS.
        </p>
        <div className="space-y-3">
          {CLEVEL_TASKS.map((c) => (
            <Card key={c.role} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-mono">{c.bot}</Badge>
                <span className="text-sm font-medium text-gray-800">{c.role}</span>
                <span className="text-xs text-gray-400 ml-auto">{c.tasks} tâches</span>
              </div>
              <div className="space-y-1">
                {c.topAuto.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs text-gray-600">{t}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Réunions Transversales ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.3.3</span>8 Types de Réunions Transversales</h2>
        <div className="space-y-2">
          {MEETING_TYPES.map((m) => (
            <Card key={m.name} className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-800">{m.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{m.freq}</Badge>
                  <span className="text-xs text-gray-400">{m.duration}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{m.participants}</p>
                <p className="text-xs text-gray-400">{m.output}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Bibliothèque Documentaire ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.3.4</span>Bibliothèque Documentaire par Modèle</h2>
        <div className="grid grid-cols-1 gap-4">
          {DOC_LIBRARY.map((cat) => (
            <Card key={cat.category} className="p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{cat.category}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.docs.map((d) => (
                  <div key={d} className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">{d}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Cycle de Vie Projet — Modèle C ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.3.5</span>Cycle de Vie Complet — Projet d'Intégration (Modèle C)</h2>
        <div className="space-y-2">
          {CYCLE_VIE_C.map((p) => (
            <div key={p.phase} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold">
                {p.phase}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500">{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : bibliotheque_execution_ghostx_MASTER.md (Gemini 2.5 Pro Deep Research) ·
          Protocole DOMINO × Moteur FORGE · 3 modèles × 12 C-Level × 150+ rôles
        </p>
      </div>
    </PageLayout>
  );
}
