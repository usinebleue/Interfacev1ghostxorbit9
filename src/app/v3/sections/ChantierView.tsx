/**
 * ChantierView.tsx — Gestion Chantiers/Projets/Missions/Tâches (drill-down 5 niveaux)
 *
 * Extrait de BlueprintDepartement.tsx L10642-12122 (1,481 lignes)
 * Structure: LivingHero → Vedettes grid-cols-3 → Sidebar w-[180px] + Contenu cascade
 */

import { useState, useEffect } from "react";
import {
  Home, Target, Layers, Rocket, DollarSign, Shield, TrendingUp,
  TrendingDown, ListChecks, Settings, Flame, CheckCircle2,
  AlertTriangle, Info, FileText, BookOpen, ChevronRight,
  Users, User, Briefcase, Plus, PenLine, Zap, Activity,
  BarChart3, MessageCircle, Search, GitBranch, LayoutList,
  LayoutGrid, Table2, FolderOpen, Filter, Package, Calendar,
  Clock, Lock, Play, RotateCcw, Brain, Hammer, ClipboardCheck,
  Gavel, Stethoscope, Video, CheckSquare, ClipboardList, Route,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR } from "../../v2/api/types";
import { useChantiers } from "../../v2/api/hooks";
import { LivingHero } from "./shared/LivingHero";
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON, PHASE_COLORS, BOT_DISPLAY, BOT_AVATAR_MAP, type PhaseKey } from "./shared/dept-data";
import { SF } from "../core/styles";
import { CockpitSectionHeader, WorkActionsOverlay, DEPT_ORDER, WORK_ACTIONS } from "./CockpitView";

type ChantierLevel = "chantiers" | "projets" | "missions" | "taches" | "tache-detail";
type ChantierSortKey = "recent" | "progression" | "phase" | "alpha";

// Phase derivation — maps status/progression to visual work phase
function statusToPhase(status: string, progression: number): PhaseKey {
  if (status === "completee" || status === "done") return "retroaction";
  if (status === "en-cours" || status === "in_progress") return "execution";
  if (status === "actif") return progression >= 80 ? "retroaction" : progression >= 20 ? "execution" : "creation";
  if (status === "pause") return "reflexion";
  return "discussion";
}

// Phase-colored progress bar (uses PHASE_COLORS dot color for the bar)
function ProgressMiniPhased({ value, phase }: { value: number; phase?: PhaseKey }) {
  const pct = Math.min(100, Math.max(0, value));
  const phaseColor = phase ? PHASE_COLORS[phase]?.dot : null;
  const fallback = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", phaseColor || fallback)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-bold text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ── Mock data réaliste par département pour simulation ──
// Types enrichis — chaque niveau a ses propres éléments (poupées russes)
interface MockDocument { id: string; titre: string; type: string; format: string; modifie: string; auteur: string }
interface MockJalon { date: string; label: string; done: boolean }
interface MockRACIItem { role: string; bot: string; type: "R" | "A" | "C" | "I" }
interface MockCriterion { label: string; done: boolean }
interface MockDependency { label: string; type: "bloque" | "bloque-par"; entite: string; statut: "resolu" | "en-cours" | "critique" }
interface MockDecisionLog { date: string; decision: string; decideur: string; rationnel: string }
interface MockConferenceAI { id: string; date: string; titre: string; participants: string[]; duree: string; resume?: string }
interface MockActivityLog { date: string; action: string; auteur: string; type: "creation" | "modification" | "decision" | "livrable" | "commentaire" }
interface MockTacheItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; assignee: string; echeance: string; documents: MockDocument[]; jalons: MockJalon[]; instructions?: string; validateur?: string; criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; conferences?: MockConferenceAI[]; tempsEstime?: string; tempsReel?: string }
interface MockMissionItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; botPrimaire: string; echeance: string; livrables: string[]; documents: MockDocument[]; jalons: MockJalon[]; taches: MockTacheItem[]; objectifs?: string[]; equipe?: string[]; criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; conferences?: MockConferenceAI[] }
interface MockProjetItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; botPrimaire: string; echeance: string; objectifs: string[]; livrables: string[]; budget: string; documents: MockDocument[]; jalons: MockJalon[]; missions: MockMissionItem[]; raci?: MockRACIItem[]; dependances?: MockDependency[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[]; sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string } }
interface MockChantierItem {
  id: number; titre: string; description: string; phase: PhaseKey; progression: number;
  echeance: string; dateDebut: string; botPrimaire: string; botCodes: string[];
  objectifs: string[]; budget: string; risques: string[];
  documents: MockDocument[]; jalons: MockJalon[];
  projets: MockProjetItem[];
  dateMaj?: string; sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string };
  raci?: MockRACIItem[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[];
  activites?: MockActivityLog[]; retrospective?: { positifs: string[]; negatifs: string[]; actions: string[] };
}

const MOCK_CHANTIERS: Record<string, MockChantierItem[]> = {
  CEOB: [
    { id: 1, titre: "Transformation numérique PME", description: "Moderniser l'infrastructure technologique et les processus d'affaires pour accélérer la croissance. Ce chantier couvre la migration cloud, l'automatisation des processus clés et la formation de toutes les équipes aux nouveaux outils.", phase: "execution", progression: 65, dateDebut: "2026-02-15", echeance: "2026-06-30", botPrimaire: "CTOB", botCodes: ["CTOB", "COOB", "CINOB"],
      objectifs: ["Réduire les coûts opérationnels de 20%", "Automatiser 5 processus clés", "Former 100% de l'équipe aux outils numériques", "Migrer 100% des services vers le cloud"],
      budget: "125 000 $", risques: ["Résistance au changement des équipes terrain", "Dépendance à un fournisseur cloud unique", "Délais de migration des données legacy"],
      documents: [
        { id: "d1", titre: "Plan stratégique transformation", type: "plan", format: "PDF", modifie: "2026-04-10", auteur: "CarlOS" },
        { id: "d2", titre: "Architecture cible cloud", type: "technique", format: "Diagramme", modifie: "2026-04-08", auteur: "Tim (CTO)" },
        { id: "d3", titre: "Budget détaillé Q2-Q3", type: "finance", format: "Excel", modifie: "2026-04-05", auteur: "Frank (CFO)" },
        { id: "d4", titre: "Matrice des risques", type: "risque", format: "PDF", modifie: "2026-03-28", auteur: "Simone (CSO)" },
      ],
      jalons: [
        { date: "2026-02-15", label: "Lancement du chantier", done: true },
        { date: "2026-03-15", label: "Audit infrastructure terminé", done: true },
        { date: "2026-04-30", label: "Migration phase 1 (non-critique)", done: true },
        { date: "2026-05-15", label: "Migration phase 2 (DB principale)", done: false },
        { date: "2026-06-01", label: "Formation équipes", done: false },
        { date: "2026-06-30", label: "Livraison finale + rétroaction", done: false },
      ],
      dateMaj: "2026-04-12",
      sante: { score: 72, tendance: "up", burnRate: "58%", roi: "3.2x projeté" },
      raci: [
        { role: "Migration cloud", bot: "CTOB", type: "R" },
        { role: "Automatisation processus", bot: "COOB", type: "R" },
        { role: "Budget & ROI", bot: "CFOB", type: "A" },
        { role: "Sécurité infra", bot: "CISOB", type: "C" },
        { role: "Formation équipes", bot: "CHROB", type: "C" },
        { role: "Direction générale", bot: "CEOB", type: "I" },
      ],
      decisions: [
        { date: "2026-04-08", decision: "Choisir AWS plutôt qu'Azure pour la migration", decideur: "CarlOS (CEO)", rationnel: "Meilleur rapport coût/performance pour nos volumes, plus d'expertise disponible dans l'équipe" },
        { date: "2026-03-20", decision: "Reporter la migration DB principale à mai", decideur: "Tim (CTO)", rationnel: "Tests de charge insuffisants, risque de perte de données si migration précipitée" },
        { date: "2026-03-01", decision: "Allouer 125K$ au chantier transformation", decideur: "Frank (CFO)", rationnel: "ROI projeté de 3.2x sur 18 mois justifie l'investissement" },
      ],
      conferences: [
        { id: "conf-1", date: "2026-04-10", titre: "Revue hebdo migration cloud", participants: ["CTOB", "COOB", "CEOB"], duree: "45 min", resume: "Discussion sur le timeline migration DB. Tim propose un dry-run avant le cutover." },
        { id: "conf-2", date: "2026-04-03", titre: "Brainstorm automatisation processus", participants: ["COOB", "CINOB", "CPOB"], duree: "30 min", resume: "Identification des 10 processus prioritaires. Focus sur la facturation et le reporting." },
        { id: "conf-3", date: "2026-03-15", titre: "Kickoff transformation numérique", participants: ["CEOB", "CTOB", "CFOB", "COOB", "CISOB"], duree: "60 min", resume: "Définition du scope, allocation budget, assignment des responsabilités." },
      ],
      activites: [
        { date: "2026-04-12", action: "Migration phase 1 complétée — 8 services non-critiques migrés", auteur: "Tim (CTO)", type: "livrable" },
        { date: "2026-04-10", action: "Revue hebdomadaire du chantier", auteur: "CarlOS", type: "commentaire" },
        { date: "2026-04-08", action: "Décision: AWS sélectionné comme provider cloud", auteur: "CarlOS", type: "decision" },
        { date: "2026-04-05", action: "Budget Q2-Q3 révisé et approuvé", auteur: "Frank (CFO)", type: "modification" },
        { date: "2026-04-03", action: "Brainstorm automatisation — 10 processus identifiés", auteur: "Olivier (COO)", type: "commentaire" },
        { date: "2026-03-28", action: "Matrice des risques mise à jour", auteur: "Simone (CSO)", type: "modification" },
        { date: "2026-03-15", action: "Chantier créé — kickoff réunion complétée", auteur: "CarlOS", type: "creation" },
      ],
      retrospective: { positifs: ["Migration phase 1 sans incident", "Bonne collaboration CTO-COO", "Budget respecté à ce jour"], negatifs: ["Retard sur la migration DB principale", "Formation équipes pas encore planifiée en détail"], actions: ["Planifier dry-run migration DB avant mai", "Préparer le calendrier de formation avec CHRO"] },
      projets: [
        { id: 101, titre: "Migration cloud", description: "Migrer les serveurs on-premise vers AWS/Azure pour plus de flexibilité et réduire les coûts d'hébergement de 40%.", phase: "execution", progression: 80, botPrimaire: "CTOB", echeance: "2026-05-15",
          objectifs: ["Migrer 12 serveurs vers AWS", "Configurer le failover automatique", "Zéro downtime pendant la migration"],
          livrables: ["Architecture cloud documentée", "Scripts Terraform", "Runbook de migration", "Tests de charge validés"],
          budget: "45 000 $",
          documents: [
            { id: "d5", titre: "Terraform modules", type: "code", format: "HCL", modifie: "2026-04-10", auteur: "Tim (CTO)" },
            { id: "d6", titre: "Runbook migration", type: "procedure", format: "Markdown", modifie: "2026-04-08", auteur: "Tim (CTO)" },
            { id: "d7", titre: "Rapport tests de charge", type: "rapport", format: "PDF", modifie: "2026-04-12", auteur: "Sébastien (CISO)" },
          ],
          jalons: [
            { date: "2026-03-01", label: "Audit serveurs terminé", done: true },
            { date: "2026-04-01", label: "VPC et réseau configurés", done: true },
            { date: "2026-04-20", label: "Services non-critiques migrés", done: true },
            { date: "2026-05-10", label: "Base de données principale migrée", done: false },
            { date: "2026-05-15", label: "Validation et cutover", done: false },
          ],
          sante: { score: 82, tendance: "up", burnRate: "65%", roi: "4x projeté" },
          raci: [
            { role: "Architecture cloud", bot: "CTOB", type: "R" },
            { role: "Validation sécurité", bot: "CISOB", type: "A" },
            { role: "Budget migration", bot: "CFOB", type: "C" },
          ],
          dependances: [
            { label: "Tests de charge validés", type: "bloque-par", entite: "Rapport Sébastien (CISO)", statut: "en-cours" },
            { label: "Migration DB bloque déploiement production", type: "bloque", entite: "Projet Automatisation processus", statut: "en-cours" },
          ],
          decisions: [
            { date: "2026-04-08", decision: "AWS sélectionné — migration multi-AZ", decideur: "Tim (CTO)", rationnel: "Redundancy et latence optimale pour le Québec" },
          ],
          conferences: [
            { id: "conf-p1", date: "2026-04-10", titre: "Sprint review migration S15", participants: ["CTOB", "CISOB"], duree: "30 min", resume: "Phase 1 complétée. Phase 2 planifiée pour mai." },
          ],
          missions: [
            { id: 1001, titre: "Audit infrastructure actuelle", description: "Cartographier tous les serveurs, bases de données et applications existantes. Documenter les dépendances, les versions et les configurations.", phase: "retroaction", progression: 100, botPrimaire: "CTOB", echeance: "2026-03-15",
              objectifs: ["Inventorier 100% des serveurs", "Documenter toutes les dépendances inter-services", "Identifier les SPOF critiques"],
              equipe: ["CTOB", "CISOB"],
              livrables: ["Inventaire complet des serveurs", "Carte des dépendances", "Rapport de recommandations"],
              documents: [
                { id: "d8", titre: "Inventaire serveurs v3", type: "inventaire", format: "Excel", modifie: "2026-03-14", auteur: "Tim (CTO)" },
                { id: "d9", titre: "Diagramme dépendances", type: "technique", format: "Draw.io", modifie: "2026-03-12", auteur: "Tim (CTO)" },
              ],
              jalons: [
                { date: "2026-03-01", label: "Inventaire physique terminé", done: true },
                { date: "2026-03-10", label: "Dépendances cartographiées", done: true },
                { date: "2026-03-15", label: "Rapport livré", done: true },
              ],
              criteresAcceptation: [
                { label: "100% des serveurs physiques et virtuels documentés", done: true },
                { label: "Diagramme de dépendances validé par CISO", done: true },
                { label: "Rapport de recommandations approuvé", done: true },
              ],
              conferences: [
                { id: "conf-m1", date: "2026-03-10", titre: "Revue audit infra", participants: ["CTOB", "CISOB"], duree: "25 min", resume: "Validation de l'inventaire. 3 SPOF critiques identifiés." },
              ],
              taches: [
                { id: 10001, titre: "Inventaire des serveurs", description: "Lister tous les serveurs physiques et virtuels avec leurs specs (CPU, RAM, stockage), rôles et uptime. Inclure les services Docker et les cronjobs.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-03-05",
                  instructions: "Utiliser les scripts d'inventaire existants (inventory.sh) + audit manuel Docker. Vérifier chaque VM dans le dashboard OVH.",
                  validateur: "Sébastien (CISO)",
                  criteresAcceptation: [{ label: "Tous les serveurs listés avec specs", done: true }, { label: "Services Docker inventoriés", done: true }, { label: "Cronjobs documentés", done: true }],
                  tempsEstime: "3 jours", tempsReel: "2.5 jours",
                  documents: [{ id: "d10", titre: "Liste serveurs.xlsx", type: "données", format: "Excel", modifie: "2026-03-04", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-03-05", label: "Inventaire complété", done: true }] },
                { id: 10002, titre: "Cartographie des dépendances", description: "Documenter les connexions entre services, APIs et bases de données. Identifier les single points of failure et les bottlenecks.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-03-10",
                  instructions: "Tracer les appels API entre services. Utiliser Draw.io pour le diagramme. Marquer en rouge les SPOF.",
                  validateur: "Sébastien (CISO)",
                  criteresAcceptation: [{ label: "Toutes les connexions API documentées", done: true }, { label: "SPOF identifiés et marqués", done: true }],
                  dependances: [{ label: "Inventaire serveurs terminé", type: "bloque-par", entite: "Tâche #10001", statut: "resolu" }],
                  tempsEstime: "4 jours", tempsReel: "3 jours",
                  documents: [{ id: "d11", titre: "dependency-map.drawio", type: "technique", format: "Draw.io", modifie: "2026-03-09", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-03-10", label: "Carte complétée", done: true }] },
              ] },
            { id: 1002, titre: "Déploiement environnement cloud", description: "Configurer VPC, groupes de sécurité, IAM et services managés sur AWS. Implémenter l'infrastructure as code avec Terraform.", phase: "execution", progression: 60, botPrimaire: "CTOB", echeance: "2026-05-10",
              livrables: ["VPC configuré", "IAM policies", "RDS PostgreSQL", "Scripts Terraform"],
              documents: [
                { id: "d12", titre: "main.tf", type: "code", format: "Terraform", modifie: "2026-04-10", auteur: "Tim (CTO)" },
                { id: "d13", titre: "Guide IAM policies", type: "sécurité", format: "PDF", modifie: "2026-04-08", auteur: "Sébastien (CISO)" },
              ],
              jalons: [
                { date: "2026-04-01", label: "VPC opérationnel", done: true },
                { date: "2026-04-15", label: "IAM et sécurité configurés", done: true },
                { date: "2026-05-01", label: "RDS prêt pour migration", done: false },
                { date: "2026-05-10", label: "Migration DB complétée", done: false },
              ],
              taches: [
                { id: 10003, titre: "Configurer le VPC et sous-réseaux", description: "Créer l'architecture réseau cloud avec zones publiques et privées, NAT gateways et routing tables.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-04-01",
                  documents: [{ id: "d14", titre: "vpc-config.tf", type: "code", format: "Terraform", modifie: "2026-03-30", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-04-01", label: "VPC live", done: true }] },
                { id: 10004, titre: "Migrer la base de données principale", description: "Transférer PostgreSQL vers RDS avec réplication et failover. Valider l'intégrité des données et les performances.", phase: "execution", progression: 45, assignee: "Tim (CTO)", echeance: "2026-05-10",
                  documents: [
                    { id: "d15", titre: "Script migration pg_dump", type: "code", format: "Shell", modifie: "2026-04-08", auteur: "Tim (CTO)" },
                    { id: "d16", titre: "Checklist validation données", type: "checklist", format: "Markdown", modifie: "2026-04-10", auteur: "Tim (CTO)" },
                  ],
                  jalons: [
                    { date: "2026-04-20", label: "Réplication configurée", done: true },
                    { date: "2026-05-01", label: "Tests intégrité passés", done: false },
                    { date: "2026-05-10", label: "Cutover production", done: false },
                  ] },
              ] },
          ] },
        { id: 102, titre: "Automatisation des processus", description: "Identifier et automatiser les tâches répétitives avec des playbooks. Réduire le temps consacré aux opérations manuelles de 60%.", phase: "reflexion", progression: 25, botPrimaire: "COOB", echeance: "2026-06-30",
          objectifs: ["Cartographier 20 processus manuels", "Automatiser les 10 plus chronophages", "Réduire 60% du temps manuel"],
          livrables: ["Cartographie des processus", "10 playbooks d'automatisation", "Dashboard de monitoring"],
          budget: "35 000 $",
          documents: [
            { id: "d17", titre: "Cartographie processus V1", type: "analyse", format: "Miro", modifie: "2026-04-05", auteur: "Olivier (COO)" },
          ],
          jalons: [
            { date: "2026-04-15", label: "Cartographie terminée", done: false },
            { date: "2026-05-15", label: "5 premiers playbooks prêts", done: false },
            { date: "2026-06-30", label: "10 playbooks déployés", done: false },
          ],
          missions: [
            { id: 1003, titre: "Cartographie des processus", description: "Documenter tous les workflows manuels avec temps et coûts. Interviewer chaque département.", phase: "execution", progression: 50, botPrimaire: "COOB", echeance: "2026-04-15",
              livrables: ["Flowcharts de 20 processus", "Matrice temps/coût", "Priorisation des automatisations"],
              documents: [{ id: "d18", titre: "Process-map-draft.miro", type: "analyse", format: "Miro", modifie: "2026-04-03", auteur: "Olivier (COO)" }],
              jalons: [{ date: "2026-04-05", label: "Interviews 50% complétées", done: true }, { date: "2026-04-15", label: "Cartographie livrée", done: false }],
              taches: [
                { id: 10005, titre: "Interviewer les chefs d'équipe", description: "Rencontrer chaque département (30min/personne) pour identifier les goulots d'étranglement et les tâches les plus chronophages.", phase: "execution", progression: 60, assignee: "Olivier (COO)", echeance: "2026-04-08",
                  documents: [{ id: "d19", titre: "Guide d'interview", type: "template", format: "Google Doc", modifie: "2026-03-25", auteur: "Olivier (COO)" }],
                  jalons: [{ date: "2026-04-01", label: "6/12 départements interviewés", done: true }, { date: "2026-04-08", label: "12/12 complétés", done: false }] },
                { id: 10006, titre: "Documenter les 10 processus prioritaires", description: "Créer des flowcharts détaillés pour les processus les plus chronophages avec temps estimé, coût et fréquence.", phase: "discussion", progression: 10, assignee: "Olivier (COO)", echeance: "2026-04-15",
                  documents: [], jalons: [{ date: "2026-04-15", label: "10 flowcharts livrés", done: false }] },
              ] },
          ] },
      ] },
    { id: 2, titre: "Expansion marché Ontario", description: "Pénétrer le marché ontarien avec une stratégie adaptée au contexte anglophone. Identifier les segments prioritaires, adapter le messaging et établir une présence locale.", phase: "reflexion", progression: 15, dateDebut: "2026-03-01", echeance: "2026-09-30", botPrimaire: "CSOB", botCodes: ["CSOB", "CMOB", "CROB"],
      objectifs: ["Identifier 50 prospects qualifiés", "Ouvrir un bureau satellite à Toronto", "Générer 500K$ en pipeline Q3", "Recruter 2 représentants bilingues"],
      budget: "200 000 $", risques: ["Concurrence forte des acteurs locaux établis", "Différences culturelles business QC vs ON", "Coût immobilier Toronto élevé"],
      documents: [
        { id: "d20", titre: "Étude de marché Ontario V2", type: "recherche", format: "PDF", modifie: "2026-04-08", auteur: "Simone (CSO)" },
        { id: "d21", titre: "Business case expansion", type: "finance", format: "Excel", modifie: "2026-03-20", auteur: "Frank (CFO)" },
        { id: "d22", titre: "Personas acheteurs Ontario", type: "marketing", format: "PDF", modifie: "2026-04-01", auteur: "Mathilde (CMO)" },
      ],
      jalons: [
        { date: "2026-03-01", label: "Lancement analyse", done: true },
        { date: "2026-04-30", label: "Étude de marché livrée", done: false },
        { date: "2026-06-15", label: "Stratégie GTM validée", done: false },
        { date: "2026-07-15", label: "Premiers prospects contactés", done: false },
        { date: "2026-09-30", label: "Bureau Toronto opérationnel", done: false },
      ],
      dateMaj: "2026-04-08",
      sante: { score: 45, tendance: "stable", burnRate: "12%", roi: "En évaluation" },
      decisions: [
        { date: "2026-03-15", decision: "Focus sur le segment manufacturier en Ontario", decideur: "Simone (CSO)", rationnel: "Meilleur fit avec notre expertise et notre réseau REAI" },
      ],
      conferences: [
        { id: "conf-4", date: "2026-04-05", titre: "Revue étude de marché Ontario", participants: ["CSOB", "CMOB", "CEOB"], duree: "35 min", resume: "Premiers résultats encourageants. 50+ manufacturiers identifiés dans la GTA." },
      ],
      activites: [
        { date: "2026-04-08", action: "Étude de marché — analyse concurrentielle en cours", auteur: "Simone (CSO)", type: "modification" },
        { date: "2026-03-15", action: "Segment manufacturier sélectionné comme cible prioritaire", auteur: "Simone (CSO)", type: "decision" },
        { date: "2026-03-01", action: "Chantier lancé — équipe Simone + Mathilde + Rich", auteur: "CarlOS", type: "creation" },
      ],
      projets: [
        { id: 103, titre: "Étude de marché Ontario", description: "Analyser le paysage concurrentiel, identifier les segments prioritaires et quantifier l'opportunité.", phase: "execution", progression: 70, botPrimaire: "CSOB", echeance: "2026-04-30",
          objectifs: ["Profiler 20 compétiteurs", "Identifier 5 segments prioritaires", "Estimer le TAM/SAM/SOM"],
          livrables: ["Rapport d'analyse concurrentielle", "Segmentation marché", "Recommandations stratégiques"],
          budget: "15 000 $",
          documents: [{ id: "d23", titre: "Competitive-landscape.pdf", type: "recherche", format: "PDF", modifie: "2026-04-08", auteur: "Simone (CSO)" }],
          jalons: [{ date: "2026-03-15", label: "Données collectées", done: true }, { date: "2026-04-15", label: "Analyse complétée", done: false }, { date: "2026-04-30", label: "Rapport livré", done: false }],
          missions: [
            { id: 1004, titre: "Analyse concurrentielle", description: "Profiler les 20 compétiteurs principaux en Ontario. Documenter leurs forces, faiblesses, pricing et positionnement.", phase: "retroaction", progression: 90, botPrimaire: "CSOB", echeance: "2026-04-15",
              livrables: ["20 fiches compétiteurs", "Matrice positionnement", "SWOT global"],
              documents: [{ id: "d24", titre: "Fiches compétiteurs", type: "recherche", format: "Google Sheets", modifie: "2026-04-10", auteur: "Simone (CSO)" }],
              jalons: [{ date: "2026-04-01", label: "10/20 profils complétés", done: true }, { date: "2026-04-15", label: "20/20 + synthèse", done: false }],
              taches: [
                { id: 10007, titre: "Recherche web et rapports industrie", description: "Compiler les données publiques sur les compétiteurs (revenus, parts de marché, positionnement, avis clients).", phase: "retroaction", progression: 100, assignee: "Simone (CSO)", echeance: "2026-04-01",
                  documents: [{ id: "d25", titre: "Sources et liens", type: "recherche", format: "Notion", modifie: "2026-03-30", auteur: "Simone (CSO)" }],
                  jalons: [{ date: "2026-04-01", label: "Recherche terminée", done: true }] },
                { id: 10008, titre: "Synthèse SWOT par compétiteur", description: "Rédiger une fiche SWOT pour chaque compétiteur. Identifier les angles d'attaque et les différenciateurs.", phase: "execution", progression: 75, assignee: "Simone (CSO)", echeance: "2026-04-15",
                  documents: [{ id: "d26", titre: "SWOT-template.docx", type: "template", format: "Word", modifie: "2026-04-05", auteur: "Simone (CSO)" }],
                  jalons: [{ date: "2026-04-10", label: "15/20 SWOT rédigés", done: true }, { date: "2026-04-15", label: "20/20 livrés", done: false }] },
              ] },
          ] },
        { id: 104, titre: "Stratégie go-to-market", description: "Définir le positionnement, pricing, canaux et messaging pour le marché ontarien.", phase: "discussion", progression: 5, botPrimaire: "CMOB", echeance: "2026-06-15",
          objectifs: ["Définir le positionnement différencié", "Adapter le pricing au marché ON", "Choisir 3 canaux d'acquisition"],
          livrables: ["Document GTM", "Pricing grid", "Plan média"], budget: "25 000 $",
          documents: [], jalons: [{ date: "2026-05-01", label: "Kickoff GTM", done: false }, { date: "2026-06-15", label: "GTM validé", done: false }],
          missions: [] },
      ] },
    { id: 3, titre: "Programme fidélisation clients", description: "Réduire le churn de 15% et augmenter le LTV de 25% via un programme de fidélisation structuré. Inclut tiers, récompenses, gamification et portail client.", phase: "creation", progression: 40, dateDebut: "2026-03-15", echeance: "2026-08-15", botPrimaire: "CROB", botCodes: ["CROB", "CMOB", "CFOB"],
      objectifs: ["Réduire le churn à moins de 5%", "Augmenter le NPS de 20 points", "Lancer le programme loyalty Q2", "Atteindre 80% d'adoption en 3 mois"],
      budget: "85 000 $", risques: ["Faible adoption si UX complexe", "Coût des récompenses mal calibré", "Intégration CRM difficile"],
      documents: [
        { id: "d27", titre: "Blueprint programme loyalty", type: "stratégie", format: "PDF", modifie: "2026-04-10", auteur: "Mathilde (CMO)" },
        { id: "d28", titre: "Analyse churn Q1 2026", type: "données", format: "Excel", modifie: "2026-04-01", auteur: "Rich (CRO)" },
        { id: "d29", titre: "Budget rewards program", type: "finance", format: "Excel", modifie: "2026-03-25", auteur: "Frank (CFO)" },
      ],
      jalons: [
        { date: "2026-03-15", label: "Kickoff chantier", done: true },
        { date: "2026-04-15", label: "Benchmark terminé", done: true },
        { date: "2026-05-15", label: "Design programme validé", done: false },
        { date: "2026-06-30", label: "Développement portail", done: false },
        { date: "2026-08-15", label: "Lancement programme", done: false },
      ],
      dateMaj: "2026-04-10",
      sante: { score: 60, tendance: "down", burnRate: "35%", roi: "2.5x projeté" },
      decisions: [
        { date: "2026-04-10", decision: "Programme à 3 tiers: Bronze, Argent, Or", decideur: "Rich (CRO)", rationnel: "Simple à comprendre pour les clients, scalable" },
        { date: "2026-03-20", decision: "Gamification intégrée dès le V1", decideur: "Mathilde (CMO)", rationnel: "Les benchmarks montrent +40% d'engagement avec gamification" },
      ],
      conferences: [
        { id: "conf-5", date: "2026-04-08", titre: "Design review programme fidélisation", participants: ["CROB", "CMOB", "CFOB"], duree: "40 min", resume: "Validation des 3 tiers. Discussion sur le coût des récompenses — Frank veut un cap à 5% du revenu." },
      ],
      activites: [
        { date: "2026-04-10", action: "Décision sur les 3 tiers du programme", auteur: "Rich (CRO)", type: "decision" },
        { date: "2026-04-08", action: "Design review complétée", auteur: "Mathilde (CMO)", type: "commentaire" },
        { date: "2026-04-01", action: "Benchmark de 10 programmes B2B livré", auteur: "Mathilde (CMO)", type: "livrable" },
        { date: "2026-03-15", action: "Chantier fidélisation lancé", auteur: "CarlOS", type: "creation" },
      ],
      projets: [
        { id: 105, titre: "Design du programme loyalty", description: "Concevoir les tiers, récompenses et mécaniques de fidélisation. Valider avec un panel de 10 clients.", phase: "creation", progression: 55, botPrimaire: "CMOB", echeance: "2026-05-15",
          objectifs: ["3 tiers de fidélisation définis", "Catalogue de 20 récompenses", "Mécaniques de gamification validées"],
          livrables: ["Document de design", "Maquettes UI", "Plan de test client"], budget: "20 000 $",
          documents: [
            { id: "d30", titre: "Loyalty-design-v2.fig", type: "design", format: "Figma", modifie: "2026-04-08", auteur: "Mathilde (CMO)" },
            { id: "d31", titre: "Tiers et rewards matrix", type: "stratégie", format: "Google Sheets", modifie: "2026-04-05", auteur: "Rich (CRO)" },
          ],
          jalons: [{ date: "2026-04-01", label: "Benchmark complété", done: true }, { date: "2026-04-20", label: "Tiers définis", done: false }, { date: "2026-05-15", label: "Design validé", done: false }],
          missions: [
            { id: 1005, titre: "Benchmark programmes existants", description: "Étudier les meilleurs programmes de fidélisation B2B (Salesforce, HubSpot, Slack, etc.).", phase: "retroaction", progression: 100, botPrimaire: "CMOB", echeance: "2026-04-01",
              livrables: ["Rapport benchmark 10 programmes", "Matrice de comparaison", "Recommandations"],
              documents: [{ id: "d32", titre: "Benchmark-B2B-loyalty.pdf", type: "recherche", format: "PDF", modifie: "2026-03-30", auteur: "Mathilde (CMO)" }],
              jalons: [{ date: "2026-04-01", label: "Benchmark livré", done: true }],
              taches: [
                { id: 10009, titre: "Analyser 10 programmes B2B leaders", description: "Documenter les mécaniques de Salesforce, HubSpot, Slack, Notion, Figma, Linear, Atlassian, Datadog, Stripe, Twilio.", phase: "retroaction", progression: 100, assignee: "Mathilde (CMO)", echeance: "2026-03-25",
                  documents: [{ id: "d33", titre: "Fiches programmes", type: "recherche", format: "Notion", modifie: "2026-03-24", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-03-25", label: "10 fiches rédigées", done: true }] },
              ] },
          ] },
      ] },
  ],
  CTOB: [
    { id: 4, titre: "Refonte architecture microservices", description: "Découper le monolithe en microservices pour améliorer la scalabilité et la vélocité de développement.", phase: "execution", progression: 45, dateDebut: "2026-03-01", echeance: "2026-07-31", botPrimaire: "CTOB", botCodes: ["CTOB", "CISOB"],
      objectifs: ["Découper 8 domaines en services indépendants", "Réduire le temps de déploiement de 4h à 15min", "Atteindre 99.9% uptime"],
      budget: "90 000 $", risques: ["Complexité de la migration de données entre services", "Performance des appels inter-services"],
      documents: [
        { id: "dt1", titre: "Architecture microservices v3", type: "technique", format: "Diagramme", modifie: "2026-04-10", auteur: "Tim (CTO)" },
        { id: "dt2", titre: "ADR-001 — Choix message broker", type: "décision", format: "Markdown", modifie: "2026-03-20", auteur: "Tim (CTO)" },
      ],
      jalons: [
        { date: "2026-03-01", label: "Kickoff architecture", done: true },
        { date: "2026-04-01", label: "Service auth extrait", done: true },
        { date: "2026-05-15", label: "Service billing extrait", done: false },
        { date: "2026-07-31", label: "8 services opérationnels", done: false },
      ],
      projets: [
        { id: 106, titre: "Service authentification", description: "Extraire l'auth en microservice avec JWT + OAuth2. Zero downtime migration.", phase: "retroaction", progression: 95, botPrimaire: "CTOB", echeance: "2026-05-01",
          objectifs: ["JWT refresh tokens", "OAuth2 flows", "Rate limiting"], livrables: ["Service Go déployé", "Documentation API", "Tests E2E"], budget: "15 000 $",
          documents: [{ id: "dt3", titre: "auth-service/README.md", type: "doc", format: "Markdown", modifie: "2026-04-10", auteur: "Tim (CTO)" }],
          jalons: [{ date: "2026-04-01", label: "MVP auth service", done: true }, { date: "2026-04-20", label: "Migration traffic", done: true }, { date: "2026-05-01", label: "Ancien code retiré", done: false }],
          missions: [
            { id: 1006, titre: "Implémenter JWT refresh tokens", description: "Ajouter le mécanisme de refresh avec rotation et invalidation automatique.", phase: "retroaction", progression: 100, botPrimaire: "CTOB", echeance: "2026-04-20",
              livrables: ["Endpoint /auth/refresh", "Tests unitaires", "Documentation Swagger"],
              documents: [{ id: "dt4", titre: "jwt-refresh.go", type: "code", format: "Go", modifie: "2026-04-18", auteur: "Tim (CTO)" }],
              jalons: [{ date: "2026-04-20", label: "Déployé en prod", done: true }],
              taches: [
                { id: 10010, titre: "Coder le endpoint /auth/refresh", description: "Implémenter la rotation de tokens avec invalidation de l'ancien. Inclure le rate limiting par IP.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-04-15",
                  documents: [{ id: "dt5", titre: "refresh_handler.go", type: "code", format: "Go", modifie: "2026-04-14", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-04-15", label: "Code mergé", done: true }] },
              ] },
          ] },
        { id: 107, titre: "Service facturation", description: "Microservice de billing avec Stripe integration et gestion des abonnements.", phase: "execution", progression: 35, botPrimaire: "CFOB", echeance: "2026-06-15",
          objectifs: ["Stripe webhooks", "Dashboard revenus", "Relances automatiques"], livrables: ["Service Python déployé", "Dashboard Metabase", "Alertes Slack"], budget: "25 000 $",
          documents: [{ id: "dt6", titre: "billing-service/architecture.md", type: "technique", format: "Markdown", modifie: "2026-04-05", auteur: "Frank (CFO)" }],
          jalons: [{ date: "2026-04-15", label: "Stripe connecté", done: true }, { date: "2026-05-15", label: "Webhooks opérationnels", done: false }, { date: "2026-06-15", label: "Dashboard live", done: false }],
          missions: [
            { id: 1007, titre: "Intégration Stripe", description: "Connecter l'API Stripe pour les paiements récurrents et gérer les webhooks.", phase: "execution", progression: 40, botPrimaire: "CFOB", echeance: "2026-05-15",
              livrables: ["Webhooks configurés", "Tests de paiement", "Monitoring erreurs"],
              documents: [{ id: "dt7", titre: "stripe-webhook-handler.py", type: "code", format: "Python", modifie: "2026-04-08", auteur: "Frank (CFO)" }],
              jalons: [{ date: "2026-04-15", label: "API connectée", done: true }, { date: "2026-05-15", label: "Webhooks live", done: false }],
              taches: [
                { id: 10011, titre: "Configurer webhooks Stripe", description: "Écouter payment_intent.succeeded, invoice.paid, subscription.updated. Gérer les retries et les erreurs.", phase: "execution", progression: 60, assignee: "Frank (CFO)", echeance: "2026-05-01",
                  documents: [{ id: "dt8", titre: "webhook_config.json", type: "config", format: "JSON", modifie: "2026-04-10", auteur: "Frank (CFO)" }],
                  jalons: [{ date: "2026-04-20", label: "3/6 events configurés", done: true }, { date: "2026-05-01", label: "6/6 events live", done: false }] },
                { id: 10012, titre: "Dashboard revenus temps réel", description: "Afficher MRR, churn, ARPU, LTV en temps réel avec alertes sur anomalies.", phase: "discussion", progression: 0, assignee: "Frank (CFO)", echeance: "2026-06-01",
                  documents: [], jalons: [{ date: "2026-05-15", label: "Maquette validée", done: false }, { date: "2026-06-01", label: "Dashboard déployé", done: false }] },
              ] },
          ] },
      ] },
  ],
  CMOB: [
    { id: 5, titre: "Campagne lancement produit V2", description: "Orchestrer le lancement marketing du produit V2 sur tous les canaux. Vidéo, landing page, PR, social media, email nurturing.", phase: "creation", progression: 50, dateDebut: "2026-03-15", echeance: "2026-06-15", botPrimaire: "CMOB", botCodes: ["CMOB", "CROB"],
      objectifs: ["Générer 10K visiteurs uniques jour du lancement", "Obtenir 500 inscriptions en 48h", "Coverage dans 5 médias spécialisés"],
      budget: "60 000 $", risques: ["Retard vidéo = décalage lancement", "Budget média insuffisant si CPC élevé"],
      documents: [
        { id: "dm1", titre: "Plan lancement V2", type: "stratégie", format: "PDF", modifie: "2026-04-05", auteur: "Mathilde (CMO)" },
        { id: "dm2", titre: "Brief créatif vidéo", type: "brief", format: "Google Doc", modifie: "2026-04-01", auteur: "Mathilde (CMO)" },
      ],
      jalons: [
        { date: "2026-03-15", label: "Kickoff campagne", done: true },
        { date: "2026-04-30", label: "Assets créatifs terminés", done: false },
        { date: "2026-05-30", label: "Landing page live", done: false },
        { date: "2026-06-15", label: "Jour de lancement", done: false },
      ],
      projets: [
        { id: 108, titre: "Contenu et assets créatifs", description: "Produire vidéo de présentation, landing page, séquence email et posts sociaux.", phase: "execution", progression: 65, botPrimaire: "CMOB", echeance: "2026-05-30",
          objectifs: ["Vidéo 2min tournée et montée", "Landing page responsive", "10 emails de nurturing"], livrables: ["Vidéo MP4 HD", "Landing page HTML", "Templates emails"], budget: "30 000 $",
          documents: [{ id: "dm3", titre: "Storyboard vidéo", type: "creative", format: "Figma", modifie: "2026-04-03", auteur: "Mathilde (CMO)" }],
          jalons: [{ date: "2026-04-15", label: "Script validé", done: true }, { date: "2026-05-15", label: "Vidéo montée", done: false }, { date: "2026-05-30", label: "Tous assets livrés", done: false }],
          missions: [
            { id: 1008, titre: "Vidéo de présentation 2min", description: "Script, tournage et montage de la vidéo produit avec témoignages clients.", phase: "execution", progression: 70, botPrimaire: "CMOB", echeance: "2026-05-15",
              livrables: ["Script final", "Rush vidéo", "Vidéo montée", "Sous-titres FR/EN"],
              documents: [
                { id: "dm4", titre: "Script-V2-final.docx", type: "script", format: "Word", modifie: "2026-04-10", auteur: "Mathilde (CMO)" },
                { id: "dm5", titre: "Rush tournage 2026-04-12", type: "vidéo", format: "MP4", modifie: "2026-04-12", auteur: "Mathilde (CMO)" },
              ],
              jalons: [{ date: "2026-04-10", label: "Script approuvé", done: true }, { date: "2026-04-12", label: "Tournage terminé", done: true }, { date: "2026-05-01", label: "Premier montage", done: false }, { date: "2026-05-15", label: "Version finale", done: false }],
              taches: [
                { id: 10013, titre: "Écrire le script vidéo", description: "Rédiger le script avec les points clés: problème, solution, preuve sociale, CTA. Inclure les transitions et les notes de réalisation.", phase: "retroaction", progression: 100, assignee: "Mathilde (CMO)", echeance: "2026-04-10",
                  documents: [{ id: "dm6", titre: "Script-draft-v3.docx", type: "script", format: "Word", modifie: "2026-04-08", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-04-10", label: "Script validé par Carl", done: true }] },
                { id: 10014, titre: "Montage et post-production", description: "Assembler les séquences, ajouter animations, lower thirds, sous-titres bilingues et musique.", phase: "execution", progression: 40, assignee: "Mathilde (CMO)", echeance: "2026-05-15",
                  documents: [{ id: "dm7", titre: "Timeline Premiere Pro", type: "projet", format: "Premiere", modifie: "2026-04-12", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-04-20", label: "Rough cut", done: false }, { date: "2026-05-01", label: "Fine cut", done: false }, { date: "2026-05-15", label: "Master final", done: false }] },
              ] },
          ] },
      ] },
  ],
  CFOB: [
    { id: 6, titre: "Optimisation trésorerie Q2-Q3", description: "Améliorer le BFR et sécuriser le runway pour les 12 prochains mois. Automatiser la facturation et réduire les délais de paiement.", phase: "execution", progression: 55, dateDebut: "2026-02-01", echeance: "2026-07-31", botPrimaire: "CFOB", botCodes: ["CFOB", "COOB"],
      objectifs: ["Réduire le DSO de 45 à 30 jours", "Augmenter la réserve de cash de 200K$", "Automatiser 80% de la facturation"],
      budget: "40 000 $", risques: ["Clients résistants aux nouvelles conditions de paiement", "Intégration ERP complexe"],
      documents: [
        { id: "df1", titre: "Plan trésorerie Q2-Q3", type: "finance", format: "Excel", modifie: "2026-04-08", auteur: "Frank (CFO)" },
        { id: "df2", titre: "Analyse DSO par client", type: "données", format: "Excel", modifie: "2026-04-05", auteur: "Frank (CFO)" },
      ],
      jalons: [
        { date: "2026-02-01", label: "Audit trésorerie", done: true },
        { date: "2026-03-15", label: "Nouvelles conditions paiement", done: true },
        { date: "2026-05-01", label: "Facturation automatique live", done: false },
        { date: "2026-07-31", label: "Objectif DSO 30j atteint", done: false },
      ],
      projets: [
        { id: 109, titre: "Automatisation facturation", description: "Mettre en place la facturation automatique, les relances et le suivi des paiements.", phase: "execution", progression: 70, botPrimaire: "CFOB", echeance: "2026-05-01",
          objectifs: ["Templates factures automatiques", "Relances J+7/J+15/J+30", "Dashboard suivi paiements"], livrables: ["Système de facturation", "Templates email relance", "Dashboard"], budget: "15 000 $",
          documents: [{ id: "df3", titre: "Specs facturation auto", type: "specs", format: "PDF", modifie: "2026-03-25", auteur: "Frank (CFO)" }],
          jalons: [{ date: "2026-03-15", label: "Specs validées", done: true }, { date: "2026-04-15", label: "Templates configurés", done: true }, { date: "2026-05-01", label: "Système live", done: false }],
          missions: [
            { id: 1009, titre: "Intégrer le système de facturation", description: "Connecter ERP → facturation automatique → relances → dashboard de suivi.", phase: "execution", progression: 70, botPrimaire: "CFOB", echeance: "2026-05-01",
              livrables: ["Connecteur ERP", "Engine de relance", "Dashboard revenus"],
              documents: [{ id: "df4", titre: "erp-connector.py", type: "code", format: "Python", modifie: "2026-04-10", auteur: "Frank (CFO)" }],
              jalons: [{ date: "2026-04-01", label: "Connecteur ERP prêt", done: true }, { date: "2026-04-20", label: "Relances automatiques testées", done: true }, { date: "2026-05-01", label: "Production", done: false }],
              taches: [
                { id: 10015, titre: "Configurer les templates de factures", description: "Créer les modèles avec branding, termes de paiement, calculs automatiques et numérotation séquentielle.", phase: "retroaction", progression: 100, assignee: "Frank (CFO)", echeance: "2026-04-15",
                  documents: [{ id: "df5", titre: "invoice-template.html", type: "template", format: "HTML", modifie: "2026-04-14", auteur: "Frank (CFO)" }],
                  jalons: [{ date: "2026-04-15", label: "Templates déployés", done: true }] },
              ] },
          ] },
      ] },
  ],
};
// Fallback: départements sans mock spécifique → utiliser CEOB
const getMockChantiers = (botCode: string): MockChantierItem[] => MOCK_CHANTIERS[botCode] || MOCK_CHANTIERS.CEOB || [];

// ── ChantierCard — Card standard pattern SectionView (grid-cols-2, header bg-[#00B4D8]/10) ──
function ChantierCard({ typeLabel, typeIcon: TypeIcon, title, description, phase, progression, subCount, subLabel, echeance, assignee, onAction, onClick }: {
  typeLabel: string; typeIcon: React.ElementType;
  title: string; description?: string; phase: PhaseKey; progression: number;
  subCount?: number; subLabel?: string; echeance?: string; assignee?: string;
  onAction?: (phase: PhaseKey, ctx: string) => void; onClick: () => void;
}) {
  const ps = PHASE_COLORS[phase];
  return (
    <div className="group relative rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
        <TypeIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">{typeLabel}</span>
        <span className="text-sm font-bold text-gray-900 truncate flex-1">{title}</span>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}>
          <span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        {description && <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{description}</p>}
        <ProgressMiniPhased value={progression} phase={phase} />
        <div className="flex items-center gap-3 text-[9px] text-gray-400">
          {subCount !== undefined && <span>{subCount} {subLabel || "éléments"}</span>}
          {assignee && <span>{assignee}</span>}
          {echeance && <span>{echeance}</span>}
        </div>
      </div>
      {onAction && <WorkActionsOverlay context={title} onAction={onAction} />}
    </div>
  );
}

// ── ChantierEntityDetail — Fiche detail inline (pattern PlaybookFicheDetailInline) ──
function ChantierEntityDetail({ type, title, description, phase, progression, echeance, dateDebut, dateMaj, botPrimaire, botCodes, objectifs, budget, risques, livrables, documents, jalons, sante, raci, decisions, conferences, activites, retrospective, criteresAcceptation, dependances, equipe, instructions, validateur, tempsEstime, tempsReel, subItems, onSubItemClick, subTitle, subCount, extraContent, onBack, onAction, backLabel }: {
  type: "chantier" | "projet" | "mission" | "tache";
  title: string; description?: string; phase: PhaseKey; progression: number;
  echeance?: string; dateDebut?: string; dateMaj?: string; botPrimaire?: string; botCodes?: string[];
  objectifs?: string[]; budget?: string; risques?: string[]; livrables?: string[];
  documents?: MockDocument[]; jalons?: MockJalon[];
  sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string };
  raci?: MockRACIItem[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[];
  activites?: MockActivityLog[]; retrospective?: { positifs: string[]; negatifs: string[]; actions: string[] };
  criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; equipe?: string[];
  instructions?: string; validateur?: string; tempsEstime?: string; tempsReel?: string;
  subItems?: Array<{ id: number; titre: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; subCount?: number; subLabel?: string }>;
  onSubItemClick?: (id: number) => void; subTitle?: string; subCount?: number;
  extraContent?: React.ReactNode;
  onBack: () => void; onAction?: (phase: PhaseKey, ctx: string) => void; backLabel: string;
}) {
  const ps = PHASE_COLORS[phase];
  const TypeIcon = type === "chantier" ? Flame : type === "projet" ? FolderOpen : type === "mission" ? Target : ListChecks;
  const gradients: Record<string, string> = { chantier: "from-orange-500 to-amber-500", projet: "from-blue-500 to-cyan-500", mission: "from-green-500 to-emerald-500", tache: "from-violet-500 to-purple-500" };
  const typeLabels: Record<string, string> = { chantier: "Chantier", projet: "Projet", mission: "Mission", tache: "Tâche" };
  const subTypeLabels: Record<string, string> = { projets: "Projets", missions: "Missions", "tâches": "Tâches", détails: "Détails" };
  const subTypeIcons: Record<string, React.ElementType> = { projets: FolderOpen, missions: Target, "tâches": ListChecks, détails: FileText };
  const SubIcon = subTitle ? (subTypeIcons[subTitle] || Layers) : Layers;

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> {backLabel}
      </button>
          {/* Hero + Details grid-cols-5 */}
          <div className="grid grid-cols-5 gap-3">
            <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", gradients[type])}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-5 w-5 text-white" />
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">{typeLabels[type]}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-white/15 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{ps.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                {description && <p className="text-xs text-white/80 leading-relaxed line-clamp-3">{description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-white/70">
                  <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{progression}%</span>
                  {echeance && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{echeance}</span>}
                  {subCount !== undefined && <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{subCount} {subTitle}</span>}
                </div>
                {onAction && (
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {WORK_ACTIONS.map(wa => (
                      <button key={wa.key} onClick={(e) => { e.stopPropagation(); onAction(wa.key, title); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
                        <wa.icon className="h-3.5 w-3.5" /> {wa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900">Détails</span>
              </div>
              <div className="px-4 py-3 space-y-1.5 flex-1">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Phase</span>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1", ps.badge)}><span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Progression</span>
                  <span className="text-xs font-bold text-gray-700">{progression}%</span>
                </div>
                {botPrimaire && BOT_DISPLAY[botPrimaire] && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Responsable</span>
                    <div className="flex items-center gap-1.5">
                      {BOT_AVATAR_MAP[botPrimaire] && <img src={BOT_AVATAR_MAP[botPrimaire]} className="h-5 w-5 rounded-full object-cover" alt="" />}
                      <span className="text-xs font-bold text-gray-700">{BOT_DISPLAY[botPrimaire]?.name || botPrimaire}</span>
                    </div>
                  </div>
                )}
                {echeance && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Échéance</span>
                    <span className="text-xs font-bold text-gray-700">{echeance}</span>
                  </div>
                )}
                {dateMaj && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Mise à jour</span>
                    <span className="text-xs font-bold text-gray-500">{dateMaj}</span>
                  </div>
                )}
                <div className="pt-1"><ProgressMiniPhased value={progression} phase={phase} /></div>
              </div>
            </div>
          </div>

      {/* ── ZONE 1: Sous-éléments (projets/missions/tâches) — box liste compacte ── */}
      {subItems && subItems.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <SubIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">{subTypeLabels[subTitle || ""] || subTitle}</span>
            <span className="text-[9px] text-gray-400 ml-auto">{subItems.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {subItems.map(item => {
              const ips = PHASE_COLORS[item.phase];
              return (
                <div key={item.id} onClick={() => onSubItemClick?.(item.id)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                  <SubIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.titre}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ips.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", ips.dot)} />{ips.label}
                  </span>
                  <div className="w-20 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
                  {item.subCount !== undefined && <span className="text-[9px] text-gray-400 shrink-0">{item.subCount} {item.subLabel}</span>}
                  {item.echeance && <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Smart detail blocks grid — packing intelligent par zones sémantiques ── */}
      {(() => {
        // Collect all visible detail blocks with weight (1=compact, 2=large)
        const dBlocks: { key: string; w: 1 | 2; node: React.ReactNode }[] = [];
        const formatColors: Record<string, string> = { PDF: "bg-red-100 text-red-700", XLSX: "bg-green-100 text-green-700", DOCX: "bg-blue-100 text-blue-700", PPTX: "bg-orange-100 text-orange-700", MD: "bg-gray-100 text-gray-700", JSON: "bg-violet-100 text-violet-700", SQL: "bg-cyan-100 text-cyan-700", PY: "bg-yellow-100 text-yellow-700" };

        if (objectifs && objectifs.length > 0) dBlocks.push({ key: "obj", w: objectifs.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Objectifs</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {objectifs.map((obj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )});
        if (botCodes && botCodes.length > 0) dBlocks.push({ key: "team", w: botCodes.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Équipe</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {botCodes.map(code => (
                <div key={code} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  {BOT_AVATAR_MAP[code] && <img src={BOT_AVATAR_MAP[code]} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 block">{BOT_DISPLAY[code]?.name || code}</span>
                    <span className="text-[10px] text-gray-500">{BOT_DISPLAY[code]?.role || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )});
        if (budget) dBlocks.push({ key: "budget", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Budget</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-lg font-bold text-gray-900">{budget}</div>
              <div className="flex items-center gap-1.5 mt-1.5"><ProgressMiniPhased value={progression} phase={phase} /></div>
              <span className="text-[9px] text-gray-400 mt-1 block">{progression}% du budget consommé</span>
            </div>
          </div>
        )});
        if (risques && risques.length > 0) dBlocks.push({ key: "risques", w: risques.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <AlertTriangle className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Risques</span>
              <span className="text-[9px] text-gray-400 ml-auto">{risques.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {risques.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )});
        if (jalons && jalons.length > 0) dBlocks.push({ key: "jalons", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Timeline — Jalons</span>
              <span className="text-[9px] text-gray-400 ml-auto">{jalons.filter(j => j.done).length}/{jalons.length} complétés</span>
            </div>
            <div className="px-4 py-3">
              {dateDebut && echeance && (
                <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-500">
                  <span>Début: <span className="font-bold text-gray-700">{dateDebut}</span></span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span>Fin: <span className="font-bold text-gray-700">{echeance}</span></span>
                </div>
              )}
              <div className="space-y-1.5">
                {jalons.map((j, i) => (
                  <div key={i} className="group relative flex items-center gap-2.5">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2", j.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300")}>
                      {j.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-[10px] text-gray-400 w-20 shrink-0">{j.date}</span>
                    <span className={cn("text-xs leading-tight flex-1", j.done ? "text-gray-500 line-through" : "text-gray-800 font-medium")}>{j.label}</span>
                    {onAction && <WorkActionsOverlay context={`Jalon: ${j.label}`} onAction={onAction} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )});
        if (livrables && livrables.length > 0) dBlocks.push({ key: "livrables", w: livrables.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Package className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Livrables attendus</span>
              <span className="text-[9px] text-gray-400 ml-auto">{livrables.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {livrables.map((l, i) => (
                <div key={i} className="group relative flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs text-gray-700">{l}</span>
                  {onAction && <WorkActionsOverlay context={`Livrable: ${l}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});
        if (documents && documents.length > 0) dBlocks.push({ key: "docs", w: documents.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Documents liés</span>
              <span className="text-[9px] text-gray-400 ml-auto">{documents.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {documents.map(doc => (
                <div key={doc.id} className="group relative flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
                  <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-800 block truncate">{doc.titre}</span>
                    <span className="text-[9px] text-gray-400">{doc.auteur} — {doc.modifie}</span>
                  </div>
                  <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", formatColors[doc.format] || "bg-gray-100 text-gray-600")}>{doc.format}</span>
                  {onAction && <WorkActionsOverlay context={`Document: ${doc.titre}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 1: Santé & KPIs (chantier, projet) ──
        if (sante) dBlocks.push({ key: "sante", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Stethoscope className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Santé & KPIs</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className={cn("text-2xl font-black", sante.score >= 70 ? "text-emerald-600" : sante.score >= 40 ? "text-amber-500" : "text-red-500")}>{sante.score}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    {sante.tendance === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : sante.tendance === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-500" /> : <Activity className="h-3.5 w-3.5 text-gray-400" />}
                    <span className="text-[10px] text-gray-500">{sante.tendance === "up" ? "En hausse" : sante.tendance === "down" ? "En baisse" : "Stable"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className={cn("h-full rounded-full", sante.score >= 70 ? "bg-emerald-500" : sante.score >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${sante.score}%` }} />
                  </div>
                </div>
              </div>
              {sante.burnRate && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-[10px] text-gray-400">Burn rate</span><span className="text-xs font-bold text-gray-700">{sante.burnRate}</span></div>}
              {sante.roi && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-[10px] text-gray-400">ROI</span><span className="text-xs font-bold text-gray-700">{sante.roi}</span></div>}
            </div>
          </div>
        )});

        // ── BOX 2: Matrice RACI (chantier, projet) ──
        if (raci && raci.length > 0) dBlocks.push({ key: "raci", w: raci.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Matrice RACI</span>
              <span className="text-[9px] text-gray-400 ml-auto">{raci.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {raci.map((r, i) => {
                const raciColors: Record<string, string> = { R: "bg-blue-100 text-blue-700", A: "bg-red-100 text-red-700", C: "bg-amber-100 text-amber-700", I: "bg-gray-100 text-gray-600" };
                const raciLabels: Record<string, string> = { R: "Responsable", A: "Approbateur", C: "Consulté", I: "Informé" };
                return (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded", raciColors[r.type])}>{r.type}</span>
                    {BOT_AVATAR_MAP[r.bot] && <img src={BOT_AVATAR_MAP[r.bot]} className="h-5 w-5 rounded-full object-cover shrink-0" alt="" />}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-800 block truncate">{r.role}</span>
                      <span className="text-[9px] text-gray-400">{BOT_DISPLAY[r.bot]?.name || r.bot} — {raciLabels[r.type]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX 3: Critères d'acceptation (mission, tâche) ──
        if (criteresAcceptation && criteresAcceptation.length > 0) dBlocks.push({ key: "criteres", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <ClipboardCheck className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Critères d'acceptation</span>
              <span className="text-[9px] text-gray-400 ml-auto">{criteresAcceptation.filter(c => c.done).length}/{criteresAcceptation.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {criteresAcceptation.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0", c.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300")}>
                    {c.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className={cn("text-xs leading-relaxed", c.done ? "text-gray-400 line-through" : "text-gray-700")}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 4: Journal des décisions (chantier, projet) ──
        if (decisions && decisions.length > 0) dBlocks.push({ key: "decisions", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Gavel className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Journal des décisions</span>
              <span className="text-[9px] text-gray-400 ml-auto">{decisions.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {decisions.map((d, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 shrink-0">{d.date}</span>
                    <span className="text-xs font-bold text-gray-800 flex-1">{d.decision}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500">{d.decideur}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed">{d.rationnel}</p>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 5: Dépendances & Bloquants (projet, mission, tâche) ──
        if (dependances && dependances.length > 0) dBlocks.push({ key: "deps", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <GitBranch className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Dépendances</span>
              <span className="text-[9px] text-gray-400 ml-auto">{dependances.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {dependances.map((dep, i) => {
                const statusColors: Record<string, string> = { resolu: "bg-emerald-100 text-emerald-700", "en-cours": "bg-amber-100 text-amber-700", critique: "bg-red-100 text-red-700" };
                const statusLabels: Record<string, string> = { resolu: "Résolu", "en-cours": "En cours", critique: "Critique" };
                return (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                    <div className="flex items-center gap-2">
                      {dep.type === "bloque" ? <Lock className="h-3.5 w-3.5 text-red-400 shrink-0" /> : <Route className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                      <span className="text-xs text-gray-700 flex-1">{dep.label}</span>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", statusColors[dep.statut])}>{statusLabels[dep.statut]}</span>
                    </div>
                    <span className="text-[9px] text-gray-400">{dep.type === "bloque" ? "Bloque →" : "Bloqué par ←"} {dep.entite}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX 6: Conférences AI (tous niveaux) ──
        if (conferences && conferences.length > 0) dBlocks.push({ key: "conferences", w: conferences.length > 2 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Video className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Conférences AI</span>
              <span className="text-[9px] text-gray-400 ml-auto">{conferences.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {conferences.map(conf => (
                <div key={conf.id} className="group relative bg-gray-50 rounded-lg px-3 py-2 space-y-1 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 shrink-0">{conf.date}</span>
                    <span className="text-xs font-bold text-gray-800 flex-1 truncate">{conf.titre}</span>
                    <span className="text-[9px] text-gray-400">{conf.duree}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {conf.participants.slice(0, 4).map(p => BOT_AVATAR_MAP[p] ? <img key={p} src={BOT_AVATAR_MAP[p]} className="h-4 w-4 rounded-full object-cover ring-1 ring-white" alt="" /> : <span key={p} className="text-[8px] text-gray-400">{BOT_DISPLAY[p]?.name?.charAt(0) || p}</span>)}
                    {conf.participants.length > 4 && <span className="text-[8px] text-gray-400">+{conf.participants.length - 4}</span>}
                  </div>
                  {conf.resume && <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{conf.resume}</p>}
                  {onAction && <WorkActionsOverlay context={`Conférence: ${conf.titre}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 7: Logs d'activité (chantier, projet) ──
        if (activites && activites.length > 0) dBlocks.push({ key: "activites", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <ClipboardList className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Logs d'activité</span>
              <span className="text-[9px] text-gray-400 ml-auto">{activites.length} entrées</span>
            </div>
            <div className="px-4 py-3 space-y-1">
              {activites.slice(0, 8).map((a, i) => {
                const typeIcons: Record<string, React.ElementType> = { creation: Plus, modification: PenLine, decision: Gavel, livrable: Package, commentaire: MessageCircle };
                const typeColors: Record<string, string> = { creation: "text-emerald-500", modification: "text-blue-500", decision: "text-amber-500", livrable: "text-violet-500", commentaire: "text-gray-400" };
                const TI = typeIcons[a.type] || Activity;
                return (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <TI className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", typeColors[a.type] || "text-gray-400")} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-700 leading-relaxed">{a.action}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-gray-400">{a.date}</span>
                        <span className="text-[9px] text-gray-400">— {a.auteur}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX 8: Rétrospective (chantier) ──
        if (retrospective) dBlocks.push({ key: "retro", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <RotateCcw className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Rétrospective</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ce qui va bien</span>
                {retrospective.positifs.map((p, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-emerald-50 rounded px-2 py-1">{p}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> À améliorer</span>
                {retrospective.negatifs.map((n, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-red-50 rounded px-2 py-1">{n}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1"><Rocket className="h-3.5 w-3.5" /> Actions</span>
                {retrospective.actions.map((a, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-blue-50 rounded px-2 py-1">{a}</div>)}
              </div>
            </div>
          </div>
        )});

        // ── BOX tâche: Instructions & Contexte ──
        if (type === "tache" && instructions) dBlocks.push({ key: "instructions", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <BookOpen className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Instructions & Contexte</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs text-gray-700 leading-relaxed">{instructions}</p>
              {validateur && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span className="text-xs text-gray-600">Validateur: <span className="font-bold">{validateur}</span></span></div>}
            </div>
          </div>
        )});

        // ── BOX tâche: Temps & Délais ──
        if (type === "tache" && (tempsEstime || tempsReel)) dBlocks.push({ key: "temps", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Clock className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Temps & Délais</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {tempsEstime && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Estimé</span><span className="text-xs font-bold text-gray-700">{tempsEstime}</span></div>}
              {tempsReel && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Réel</span><span className="text-xs font-bold text-gray-700">{tempsReel}</span></div>}
              {tempsEstime && tempsReel && (() => {
                const est = parseFloat(tempsEstime); const reel = parseFloat(tempsReel);
                if (!isNaN(est) && !isNaN(reel) && est > 0) {
                  const ratio = reel / est;
                  return <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Efficacité</span><span className={cn("text-xs font-bold", ratio <= 1 ? "text-emerald-600" : "text-amber-600")}>{Math.round(ratio * 100)}%</span></div>;
                }
                return null;
              })()}
            </div>
          </div>
        )});

        // ── BOX mission/tâche: Équipe ──
        if ((type === "mission" || type === "tache") && equipe && equipe.length > 0) dBlocks.push({ key: "equipe-mi", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Équipe</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {equipe.map(code => (
                <div key={code} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  {BOT_AVATAR_MAP[code] && <img src={BOT_AVATAR_MAP[code]} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 block">{BOT_DISPLAY[code]?.name || code}</span>
                    <span className="text-[10px] text-gray-500">{BOT_DISPLAY[code]?.role || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )});

        if (dBlocks.length === 0) return null;

        // Zone mapping — group blocks by semantic zone for logical flow
        const zoneMap: Record<string, number> = {
          sante: 2, budget: 2, temps: 2,
          obj: 3, team: 3, "equipe-mi": 3, raci: 3, risques: 3, livrables: 3, criteres: 3,
          jalons: 4, deps: 4, docs: 4,
          decisions: 5, conferences: 5, activites: 5,
          retro: 6, instructions: 6,
        };

        // Group blocks by zone
        const zoneGroups: Map<number, typeof dBlocks> = new Map();
        for (const b of dBlocks) {
          const z = zoneMap[b.key] || 3;
          if (!zoneGroups.has(z)) zoneGroups.set(z, []);
          zoneGroups.get(z)!.push(b);
        }

        // Pack a group of blocks into rows (capacity 3, merge solo w=2 pairs)
        const packToRows = (blocks: typeof dBlocks) => {
          const rows: { blocks: typeof dBlocks; totalW: number }[] = [];
          let curRow: typeof dBlocks = [];
          let curW = 0;
          for (const b of blocks) {
            if (curW + b.w > 3) {
              if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
              curRow = [b]; curW = b.w;
            } else {
              curRow.push(b); curW += b.w;
            }
          }
          if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
          // Merge consecutive solo w=2 rows into pairs
          const merged: typeof rows = [];
          let mi = 0;
          while (mi < rows.length) {
            const cur = rows[mi];
            if (cur.blocks.length === 1 && cur.blocks[0].w === 2 && mi + 1 < rows.length && rows[mi + 1].blocks.length === 1 && rows[mi + 1].blocks[0].w === 2) {
              merged.push({ blocks: [cur.blocks[0], rows[mi + 1].blocks[0]], totalW: 4 });
              mi += 2;
            } else { merged.push(cur); mi++; }
          }
          return merged;
        };

        const renderRow = (row: { blocks: typeof dBlocks; totalW: number }, ri: number) => {
          const n = row.blocks.length;
          if (n === 2 && row.totalW === 4) return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 1) return <div key={ri}>{row.blocks[0].node}</div>;
          if (n === 2 && row.totalW === 2) return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 3) return <div key={ri} className="grid grid-cols-3 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 2 && row.totalW === 3) return <div key={ri} className="grid grid-cols-3 gap-3">{row.blocks.map(b => <div key={b.key} className={b.w === 2 ? "col-span-2" : ""}>{b.node}</div>)}</div>;
          return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
        };

        // Render zones in order (2→3→4→5→6)
        return Array.from(zoneGroups.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([zoneNum, zoneBlocks]) => {
            const rows = packToRows(zoneBlocks);
            return <div key={`z${zoneNum}`} className="space-y-3">{rows.map((r, ri) => renderRow(r, ri))}</div>;
          });
      })()}

      {/* Extra content (tâche-detail actions) */}
      {extraContent && (
        <div className="space-y-3">{extraContent}</div>
      )}

    </div>
  );
}

// ── SubElementsToolbar — Toolbar viewMode (cards/list/table) pour sous-éléments drill-down ──
function SubElementsToolbar({ viewMode, onViewMode, count, label }: { viewMode: "cards" | "list" | "table"; onViewMode: (m: "cards" | "list" | "table") => void; count: number; label: string }) {
  const views = [
    { key: "cards" as const, icon: LayoutGrid, tip: "Cartes" },
    { key: "list" as const, icon: LayoutList, tip: "Liste" },
    { key: "table" as const, icon: Table2, tip: "Tableau" },
  ];
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        {views.map(v => (
          <button key={v.key} onClick={() => onViewMode(v.key)} title={v.tip}
            className={cn("p-1.5 rounded-md cursor-pointer transition-colors", viewMode === v.key ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>
            <v.icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <span className={SF.itemCount}>{count} {label}</span>
    </div>
  );
}

// ── SubElementsList — Rendu en mode liste ──
function SubElementsList({ items, onAction }: { items: { typeLabel: string; typeIcon: React.ElementType; title: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; onClick: () => void }[]; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const ps = PHASE_COLORS[item.phase];
        return (
          <div key={i} onClick={item.onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <item.typeIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.title}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}><span className={cn("w-1.5 h-1.5 rounded-full", ps.dot)} />{ps.label}</span>
            <div className="w-16 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
            {item.echeance && <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>}
            {item.assignee && <span className="text-[9px] text-gray-500 shrink-0">{item.assignee}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── SubElementsTable — Rendu en mode tableau ──
function SubElementsTable({ items, onAction }: { items: { typeLabel: string; title: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; onClick: () => void }[]; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Nom</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Phase</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase w-24">Progression</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Échéance</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Assigné</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const ps = PHASE_COLORS[item.phase];
            return (
              <tr key={i} onClick={item.onClick} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors">
                <td className="px-3 py-2 font-medium text-gray-900">{item.title}</td>
                <td className="px-3 py-2"><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", ps.badge)}>{ps.label}</span></td>
                <td className="px-3 py-2"><ProgressMiniPhased value={item.progression} phase={item.phase} /></td>
                <td className="px-3 py-2 text-gray-500">{item.echeance || "—"}</td>
                <td className="px-3 py-2 text-gray-500">{item.assignee || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ChantierView({ botCode, showHeader = true, onAction }: { botCode: string; showHeader?: boolean; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  // API data (real DB) + mock data (simulation réaliste)
  const { chantiers: apiChantiers, loading: loadingCh } = useChantiers();
  const mockData = getMockChantiers(botCode);
  const [selectedDept, setSelectedDept] = useState(botCode);
  const [level, setLevel] = useState<ChantierLevel>("chantiers");
  const [selectedChantier, setSelectedChantier] = useState<number | null>(null);
  const [selectedProjet, setSelectedProjet] = useState<number | null>(null);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [detailTache, setDetailTache] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [sortKey, setSortKey] = useState<ChantierSortKey>("phase");
  const [subViewMode, setSubViewMode] = useState<"cards" | "list" | "table">("cards");

  // Sync quand botCode change
  useEffect(() => { setSelectedDept(botCode); resetNav(); }, [botCode]);
  const resetNav = () => { setLevel("chantiers"); setSelectedChantier(null); setSelectedProjet(null); setSelectedMission(null); setDetailTache(null); };

  // Merge API + mock — mock data toujours visible pour la simulation
  const deptMock = selectedDept === botCode ? mockData : getMockChantiers(selectedDept);
  const allChantiers = deptMock;

  // Filter + sort
  const filtered = allChantiers
    .filter(c => !searchTerm || c.titre.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => filterPhase === "all" || c.phase === filterPhase)
    .sort((a, b) => {
      if (sortKey === "phase") { const phaseOrder: Record<string, number> = { discussion: 0, reflexion: 1, creation: 2, execution: 3, retroaction: 4 }; return (phaseOrder[a.phase] ?? 5) - (phaseOrder[b.phase] ?? 5); }
      if (sortKey === "progression") return b.progression - a.progression;
      if (sortKey === "alpha") return a.titre.localeCompare(b.titre);
      return 0;
    });

  // Drill-down selections
  const selCh = allChantiers.find(c => c.id === selectedChantier);
  const selPr = selCh?.projets.find(p => p.id === selectedProjet);
  const selMi = selPr?.missions.find(m => m.id === selectedMission);
  const selTa = selMi?.taches.find(t => t.id === detailTache);

  // Top 3 = highest progression in execution phase
  const top3 = [...allChantiers].sort((a, b) => {
    const phaseWeight: Record<string, number> = { execution: 3, creation: 2, reflexion: 1, retroaction: 0, discussion: 0 };
    return (phaseWeight[b.phase] ?? 0) - (phaseWeight[a.phase] ?? 0) || b.progression - a.progression;
  }).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* 1. LIVING HERO — Pattern SectionView */}
      {showHeader && level === "chantiers" && (
        <LivingHero blur1="bg-orange-100/70" blur2="bg-amber-100/60" subtitleColor="text-orange-600" subtitle="Gestion & Vélocité" title="Vos visions, érigées brique par brique." description="Suivez l'avancement stratégique, consolidez vos sprints et regardez vos chantiers prendre vie.">
          <div className="relative w-[360px] h-[140px]">
            <div className="absolute right-[30px] bottom-[-20px] w-48 h-32 flex items-end justify-between px-4 opacity-50 space-x-2">
              <div className="w-12 bg-orange-200 border-t-4 border-orange-400 anim-block-1" />
              <div className="w-12 bg-amber-200 border-t-4 border-amber-400 anim-block-2" />
              <div className="w-12 bg-orange-300 border-t-4 border-orange-500 anim-block-3" />
            </div>
            <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-orange-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sprints Q2</h4>
                <div className="w-4 h-4 rounded bg-orange-100 text-orange-500 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 w-[60%] bg-orange-400 rounded-full" /></div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b] anim-progress" /></div>
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      {/* 2. TOP 3 VEDETTES — Pattern SectionView (grid-cols-3 + CockpitSectionHeader) */}
      {level === "chantiers" && top3.length > 0 && (
        <div>
          <CockpitSectionHeader icon={Flame} title={`Top 3 — Chantiers prioritaires${selectedDept !== "CEOB" ? ` (${DEPT_SHORT_LABEL[selectedDept] || selectedDept})` : ""}`} count={allChantiers.length} color="text-orange-500" />
          <div className="grid grid-cols-3 gap-3">
            {top3.map((ch, i) => {
              const ps = PHASE_COLORS[ch.phase];
              const gradient = i === 0 ? "from-orange-500 to-amber-500" : i === 1 ? "from-blue-500 to-cyan-500" : "from-emerald-500 to-teal-500";
              return (
                <div key={ch.id} className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r cursor-pointer", gradient)} onClick={() => { setSelectedChantier(ch.id); setLevel("projets"); }}>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <Flame className="h-3.5 w-3.5 text-white/80" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">Chantier</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{ps.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{ch.titre}</h4>
                  <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed line-clamp-2">{ch.description}</p>
                  <div className="flex items-center gap-3 mt-2.5 text-[9px] text-white/70">
                    <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{ch.progression}%</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{ch.projets.length} projets</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{ch.echeance}</span>
                  </div>
                  {onAction && <WorkActionsOverlay context={ch.titre} onAction={onAction} position="top" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SIDEBAR DÉPARTEMENTS + CONTENT — Pattern SectionView */}
      <div className="flex gap-3">
        {/* Sidebar w-[180px] — départements (comme Cockpit) */}
        {level === "chantiers" && (
          <div className={SF.sidebarW}>
            {/* Vue d'ensemble */}
            <button onClick={() => { setSelectedDept(botCode); resetNav(); }} className={cn(SF.btnBase, selectedDept === botCode && level === "chantiers" ? SF.btnActive : SF.btnInactive)}>
              <Home className={selectedDept === botCode ? SF.iconActive : SF.iconInactive} />
              <span className={selectedDept === botCode ? SF.labelActive : SF.labelInactive}>Vue d'ensemble</span>
              <span className={SF.count}>{getMockChantiers(botCode).length}</span>
            </button>
            <div className={SF.separator} />
            {/* Départements — comme Cockpit sidebar */}
            {(botCode === "CEOB" ? DEPT_ORDER : [botCode]).map(code => {
              const isActive = selectedDept === code && selectedDept !== botCode;
              const Icon = DEPT_DASH_ICON[code] || Zap;
              const label = DEPT_SHORT_LABEL[code] || code;
              const deptCount = getMockChantiers(code).length;
              return (
                <button key={code} onClick={() => { setSelectedDept(code); resetNav(); }}
                  className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
                  <Icon className={isActive ? SF.iconActive : SF.iconInactive} />
                  <span className={isActive ? SF.labelActive : SF.labelInactive}>{label}</span>
                  <span className={SF.count}>{deptCount}</span>
                </button>
              );
            })}
            <div className={SF.separator} />
            {/* Filtres par phase */}
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2.5 pt-1">Phases</span>
            {([
              { key: "all", label: "Toutes", icon: Layers, count: allChantiers.length },
              { key: "discussion", label: "Discussion", icon: MessageCircle, count: allChantiers.filter(c => c.phase === "discussion").length },
              { key: "reflexion", label: "Réflexion", icon: Brain, count: allChantiers.filter(c => c.phase === "reflexion").length },
              { key: "creation", label: "Conception", icon: Hammer, count: allChantiers.filter(c => c.phase === "creation").length },
              { key: "execution", label: "Exécution", icon: Rocket, count: allChantiers.filter(c => c.phase === "execution").length },
              { key: "retroaction", label: "Rétroaction", icon: BarChart3, count: allChantiers.filter(c => c.phase === "retroaction").length },
            ] as const).map(item => {
              const isPhaseActive = filterPhase === item.key;
              const phaseColor = item.key !== "all" ? PHASE_COLORS[item.key as PhaseKey] : null;
              return (
                <button key={item.key} onClick={() => setFilterPhase(item.key)}
                  className={cn(SF.btnBase, isPhaseActive ? SF.btnActive : SF.btnInactive)}>
                  {phaseColor && <span className={cn("w-2 h-2 rounded-full shrink-0", phaseColor.dot)} />}
                  {!phaseColor && <item.icon className={isPhaseActive ? SF.iconActive : SF.iconInactive} />}
                  <span className={isPhaseActive ? SF.labelActive : SF.labelInactive}>{item.label}</span>
                  <span className={SF.count}>{item.count}</span>
                </button>
              );
            })}
            <div className={SF.separator} />
            {/* Sous-sections par type */}
            {[
              { id: "projets", label: "Projets", icon: FolderOpen, count: allChantiers.reduce((s, c) => s + c.projets.length, 0) },
              { id: "missions", label: "Missions", icon: Target, count: allChantiers.reduce((s, c) => s + c.projets.reduce((s2, p) => s2 + p.missions.length, 0), 0) },
              { id: "taches", label: "Tâches", icon: ListChecks, count: allChantiers.reduce((s, c) => s + c.projets.reduce((s2, p) => s2 + p.missions.reduce((s3, m) => s3 + m.taches.length, 0), 0), 0) },
            ].map(item => (
              <button key={item.id} onClick={() => {}} className={cn(SF.btnBase, SF.btnInactive)}>
                <item.icon className={SF.iconInactive} />
                <span className={SF.labelInactive}>{item.label}</span>
                <span className={SF.count}>{item.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content — Pattern SectionView (grid-cols-2 OU fiche detail) */}
        <div className={SF.content}>
          {/* LEVEL: chantiers — Toolbar + grid-cols-2 cards */}
          {level === "chantiers" && (
            <>
              {/* Toolbar — SF.toolbarWrap = UNE SEULE LIGNE */}
              <div className={SF.toolbarWrap}>
                <div className={SF.searchWrap}>
                  <Search className={SF.searchIcon} />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher un chantier..." className={SF.searchInput} />
                </div>
                <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className={SF.select}>
                  <option value="all">Toutes les phases</option>
                  <option value="discussion">Discussion</option>
                  <option value="reflexion">Réflexion</option>
                  <option value="creation">Conception</option>
                  <option value="execution">Exécution</option>
                  <option value="retroaction">Rétroaction</option>
                </select>
                <select value={sortKey} onChange={e => setSortKey(e.target.value as ChantierSortKey)} className={SF.select}>
                  <option value="phase">Phase</option>
                  <option value="progression">Progression</option>
                  <option value="recent">Récent</option>
                  <option value="alpha">A → Z</option>
                </select>
                <span className={SF.itemCount}>{filtered.length} chantier{filtered.length > 1 ? "s" : ""}</span>
              </div>

              {/* Section header + grid-cols-2 cards */}
              <CockpitSectionHeader icon={Flame} title="Chantiers" count={filtered.length} color="text-orange-500" />
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">Aucun chantier trouvé</div>
              ) : (
                <div className={SF.gridContent}>
                  {filtered.map(ch => (
                    <ChantierCard key={ch.id} typeLabel="Chantier" typeIcon={Flame} title={ch.titre} description={ch.description} phase={ch.phase} progression={ch.progression} subCount={ch.projets.length} subLabel="projets" echeance={ch.echeance} assignee={BOT_DISPLAY[ch.botPrimaire]?.name} onAction={onAction} onClick={() => { setSelectedChantier(ch.id); setLevel("projets"); }} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* LEVEL: projets — Fiche detail chantier + sous-éléments projets en grid-cols-2 */}
          {level === "projets" && selCh && (
            <ChantierEntityDetail type="chantier" title={selCh.titre} description={selCh.description} phase={selCh.phase} progression={selCh.progression} echeance={selCh.echeance} dateDebut={selCh.dateDebut} dateMaj={selCh.dateMaj} botPrimaire={selCh.botPrimaire} botCodes={selCh.botCodes} objectifs={selCh.objectifs} budget={selCh.budget} risques={selCh.risques} documents={selCh.documents} jalons={selCh.jalons} sante={selCh.sante} raci={selCh.raci} decisions={selCh.decisions} conferences={selCh.conferences} activites={selCh.activites} retrospective={selCh.retrospective} onBack={resetNav} onAction={onAction} backLabel="Retour aux chantiers" subTitle="projets" subCount={selCh.projets.length}
              subItems={selCh.projets.map(pr => ({ id: pr.id, titre: pr.titre, phase: pr.phase, progression: pr.progression, echeance: pr.echeance, subCount: pr.missions.length, subLabel: "missions" }))}
              onSubItemClick={(id) => { setSelectedProjet(id); setLevel("missions"); }} />
          )}

          {/* LEVEL: missions — Fiche detail projet + sous-éléments missions en grid-cols-2 */}
          {level === "missions" && selPr && (
            <ChantierEntityDetail type="projet" title={selPr.titre} description={selPr.description} phase={selPr.phase} progression={selPr.progression} echeance={selPr.echeance} botPrimaire={selPr.botPrimaire} objectifs={selPr.objectifs} budget={selPr.budget} livrables={selPr.livrables} documents={selPr.documents} jalons={selPr.jalons} sante={selPr.sante} raci={selPr.raci} dependances={selPr.dependances} decisions={selPr.decisions} conferences={selPr.conferences} onBack={() => { setSelectedProjet(null); setSelectedMission(null); setDetailTache(null); setLevel("projets"); }} onAction={onAction} backLabel={`Retour — ${selCh?.titre || "Chantier"}`} subTitle="missions" subCount={selPr.missions.length}
              subItems={selPr.missions.map(mi => ({ id: mi.id, titre: mi.titre, phase: mi.phase, progression: mi.progression, echeance: mi.echeance, subCount: mi.taches.length, subLabel: "tâches" }))}
              onSubItemClick={(id) => { setSelectedMission(id); setLevel("taches"); }} />
          )}

          {/* LEVEL: taches — Fiche detail mission + sous-éléments tâches en grid-cols-2 */}
          {level === "taches" && selMi && (
            <ChantierEntityDetail type="mission" title={selMi.titre} description={selMi.description} phase={selMi.phase} progression={selMi.progression} botPrimaire={selMi.botPrimaire} objectifs={selMi.objectifs} equipe={selMi.equipe} livrables={selMi.livrables} documents={selMi.documents} jalons={selMi.jalons} criteresAcceptation={selMi.criteresAcceptation} dependances={selMi.dependances} conferences={selMi.conferences} onBack={() => { setSelectedMission(null); setDetailTache(null); setLevel("missions"); }} onAction={onAction} backLabel={`Retour — ${selPr?.titre || "Projet"}`} subTitle="tâches" subCount={selMi.taches.length}
              subItems={selMi.taches.map(ta => ({ id: ta.id, titre: ta.titre, phase: ta.phase, progression: ta.progression, echeance: ta.echeance, assignee: ta.assignee }))}
              onSubItemClick={(id) => { setDetailTache(id); setLevel("tache-detail"); }} />
          )}

          {/* LEVEL: tache-detail — Fiche detail tâche avec contenu actionnable */}
          {level === "tache-detail" && selTa && (
            <ChantierEntityDetail type="tache" title={selTa.titre} description={selTa.description} phase={selTa.phase} progression={selTa.progression} echeance={selTa.echeance} documents={selTa.documents} jalons={selTa.jalons} instructions={selTa.instructions} validateur={selTa.validateur} criteresAcceptation={selTa.criteresAcceptation} dependances={selTa.dependances} conferences={selTa.conferences} tempsEstime={selTa.tempsEstime} tempsReel={selTa.tempsReel} onBack={() => { setDetailTache(null); setLevel("taches"); }} onAction={onAction} backLabel={`Retour — ${selMi?.titre || "Mission"}`} extraContent={
              <div className="space-y-3">
                {/* Contenu contextuel selon la phase */}
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">Contenu de la tâche</span>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {selTa.description && <p className="text-xs text-gray-700 leading-relaxed">{selTa.description}</p>}
                    {selTa.assignee && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Users className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600">Assigné à <span className="font-bold">{selTa.assignee}</span></span></div>}
                    {selTa.echeance && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Clock className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600">Échéance: <span className="font-bold">{selTa.echeance}</span></span></div>}
                  </div>
                </div>
                {/* Actions possibles selon la phase */}
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    <Rocket className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">Actions disponibles</span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {selTa.phase === "discussion" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-sky-50 rounded-lg px-3 py-2.5 hover:bg-sky-100 transition-colors cursor-pointer"><MessageCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" /><div><span className="text-xs font-bold text-sky-800 block">Discuter de cette tâche</span><span className="text-[9px] text-sky-600">Ouvrir une discussion avec l'équipe assignée</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-orange-50 rounded-lg px-3 py-2.5 hover:bg-orange-100 transition-colors cursor-pointer"><Brain className="h-3.5 w-3.5 text-orange-600 shrink-0" /><div><span className="text-xs font-bold text-orange-800 block">Lancer une réflexion</span><span className="text-[9px] text-orange-600">Analyser les enjeux avant de commencer</span></div></button>
                      </>
                    )}
                    {selTa.phase === "reflexion" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-orange-50 rounded-lg px-3 py-2.5 hover:bg-orange-100 transition-colors cursor-pointer"><Brain className="h-3.5 w-3.5 text-orange-600 shrink-0" /><div><span className="text-xs font-bold text-orange-800 block">Cristalliser la réflexion</span><span className="text-[9px] text-orange-600">Ouvrir DocForge pour documenter les conclusions</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-yellow-50 rounded-lg px-3 py-2.5 hover:bg-yellow-100 transition-colors cursor-pointer"><Hammer className="h-3.5 w-3.5 text-yellow-600 shrink-0" /><div><span className="text-xs font-bold text-yellow-800 block">Passer en conception</span><span className="text-[9px] text-yellow-600">Structurer le plan d'exécution</span></div></button>
                      </>
                    )}
                    {selTa.phase === "creation" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-yellow-50 rounded-lg px-3 py-2.5 hover:bg-yellow-100 transition-colors cursor-pointer"><Hammer className="h-3.5 w-3.5 text-yellow-600 shrink-0" /><div><span className="text-xs font-bold text-yellow-800 block">Compléter le document</span><span className="text-[9px] text-yellow-600">Finaliser la conception en mode DocForge</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5 hover:bg-green-100 transition-colors cursor-pointer"><Rocket className="h-3.5 w-3.5 text-green-600 shrink-0" /><div><span className="text-xs font-bold text-green-800 block">Lancer l'exécution</span><span className="text-[9px] text-green-600">Démarrer l'implémentation</span></div></button>
                      </>
                    )}
                    {selTa.phase === "execution" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5 hover:bg-green-100 transition-colors cursor-pointer"><CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" /><div><span className="text-xs font-bold text-green-800 block">Marquer comme complété</span><span className="text-[9px] text-green-600">Confirmer que la tâche est terminée</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-emerald-50 rounded-lg px-3 py-2.5 hover:bg-emerald-100 transition-colors cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /><div><span className="text-xs font-bold text-emerald-800 block">Passer en rétroaction</span><span className="text-[9px] text-emerald-600">Évaluer les résultats et documenter les apprentissages</span></div></button>
                      </>
                    )}
                    {selTa.phase === "retroaction" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-emerald-50 rounded-lg px-3 py-2.5 hover:bg-emerald-100 transition-colors cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /><div><span className="text-xs font-bold text-emerald-800 block">Voir le bilan</span><span className="text-[9px] text-emerald-600">Consulter les métriques et le résumé d'exécution</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-sky-50 rounded-lg px-3 py-2.5 hover:bg-sky-100 transition-colors cursor-pointer"><MessageCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" /><div><span className="text-xs font-bold text-sky-800 block">Discuter des résultats</span><span className="text-[9px] text-sky-600">Partager les apprentissages avec l'équipe</span></div></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            } />
          )}
        </div>
      </div>
    </div>
  );
}

