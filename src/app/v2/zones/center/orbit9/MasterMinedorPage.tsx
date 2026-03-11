/**
 * MasterMinedorPage.tsx — Mine d'Or & Data
 * Reference GHML: Inventaire complet des donnees traitees, brutes, et manquantes
 * Summary page — scannable, FINAL STATE, cards + grids + status badges
 */

import {
  Gem, Database, FileText, Users, Phone, Mail,
  FolderOpen, HardDrive, AlertCircle, CheckCircle2,
  Clock, ArrowRight, BarChart3, BookOpen, Layers, Download,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// HELPER — Status Badge
// ================================================================

function StatusBadge({ status }: { status: "traite" | "brut" | "partiel" | "a-acquerir" | "non-traite" }) {
  const config = {
    "traite": { label: "TRAITE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "brut": { label: "BRUT", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "partiel": { label: "PARTIEL", className: "bg-blue-100 text-blue-600 border-blue-200" },
    "a-acquerir": { label: "A ACQUERIR", className: "bg-red-100 text-red-700 border-red-200" },
    "non-traite": { label: "NON TRAITE", className: "bg-gray-100 text-gray-600 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ================================================================
// DATA — Methode CREDO
// ================================================================

const CREDO_MODULES = [
  { name: "Connecter", pages: 74, status: "traite" as const, mapping: "session_credo.py Phase C" },
  { name: "Rechercher", pages: 32, status: "traite" as const, mapping: "session_credo.py Phase R" },
  { name: "Exposer", pages: 82, status: "traite" as const, mapping: "session_credo.py Phase E" },
  { name: "Demontrer", pages: 18, status: "traite" as const, mapping: "session_credo.py Phase D" },
  { name: "Obtenir", pages: 56, status: "traite" as const, mapping: "session_credo.py Phase O" },
  { name: "Module Creatif", pages: 34, status: "brut" as const, mapping: "pas encore integre" },
  { name: "TCC Vente Creative Light", pages: null, status: "brut" as const, mapping: "pas encore integre" },
  { name: "TCC Vente Creative Full", pages: null, status: "brut" as const, mapping: "pas encore integre" },
];

// ================================================================
// DATA — Boost Camp
// ================================================================

const BOOST_PHASES = [
  { name: "Phase 1 VIST", duration: "15 jours", status: "traite" as const, files: "4 PowerPoints, 2 Excel", mapping: "DiagnosticDemo.tsx" },
  { name: "Phase 2 JUAN", duration: "45 jours", status: "traite" as const, files: "Jumelage Master spreadsheet", mapping: "Orbit9 Matching" },
  { name: "Phase 3 CPRJ", duration: "105 jours", status: "partiel" as const, files: "6 sections Word (S00-S05)", mapping: "CahierSmartDemo" },
  { name: "Dashboard AIGU", duration: null, status: "brut" as const, files: "2 PowerPoints, 1 Excel template", mapping: null },
  { name: "Gantts", duration: null, status: "brut" as const, files: "6 Excel estimation sheets", mapping: null },
];

// ================================================================
// DATA — Templates & Docs
// ================================================================

const TEMPLATES_DOCS = [
  { type: "Courriels", count: 6, detail: "JUAN follow-ups, member retention" },
  { type: "Formulaires", count: 1, detail: "Hands-up form" },
  { type: "Trousses PDF", count: 4, detail: "REAI/JUAN kits Sep 2024 - Mar 2025" },
  { type: "Offres de service", count: 5, detail: "Standard/large agreements, T&C" },
  { type: "Evaluation membres", count: 2, detail: "Criteres + lettre acceptation" },
];

// ================================================================
// DATA — Prospection
// ================================================================

const PROSPECTION_ITEMS = [
  { category: "iCRIQ data", count: 3, detail: "Excel lead lists Sep 2023, website matches, FIVER1" },
  { category: "Scripts cold call", count: 3, detail: "Jan 2025, Nov 2024, member scripts" },
  { category: "Listes regionales", count: 19, detail: "Excel par region Quebec (Abitibi, Laurentides, Monteregie, Mauricie, etc.)" },
];

// ================================================================
// DATA — Donnees Manquantes
// ================================================================

const MISSING_DATA = [
  { label: "Donnees financieres reelles clients", detail: "Actuellement simulees dans simulation-data.ts" },
  { label: "Historique de conversation Telegram", detail: "Messages passes non archives" },
  { label: "Metriques d'usage reelles", detail: "Sessions, duree, features utilisees" },
  { label: "Feedback clients structure", detail: "NPS, CSAT, interviews" },
  { label: "Benchmark industrie", detail: "Comparables SaaS B2B" },
  { label: "Donnees IoT/terrain reelles", detail: "Manufacturiers du REAI" },
  { label: "Conversations reelles client-CarlOS", detail: "Pour fine-tuning des agents — pas encore de vrais clients" },
  { label: "Tests A/B sur outputs agents", detail: "Comparer les reponses entre modeles/prompts" },
  { label: "Video temoignages clients", detail: "Preuves visuelles pour marketing et demos" },
  { label: "Captures d'ecran avant/apres", detail: "Impact visuel de CarlOS sur les operations PME" },
  { label: "ROI documente sur cas reels", detail: "Chiffres concrets d'economies ou gains avec CarlOS" },
  { label: "Corpus de formation par secteur", detail: "Donnees specifiques manufacturier, alimentaire, construction, etc." },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterMinedorPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Gem}
          iconColor="text-yellow-600"
          title="Mine d'Or & Data"
          subtitle="Inventaire complet des donnees traitees et brutes"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* 1. Vue d'Ensemble */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.1</span>Vue d'Ensemble</h3>

        <Card className="p-4 bg-yellow-50 border-yellow-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
              <Gem className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-yellow-800 mb-2">58 fichiers dans mine-dor/</div>
              <p className="text-xs text-yellow-700 mb-3">
                Retire de git (1.4 GB), reste sur disque + Google Drive
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Methode CREDO", count: "296p", icon: BookOpen, color: "emerald" },
                  { label: "Boost Camp", count: "3 phases", icon: Layers, color: "blue" },
                  { label: "Templates", count: "18 docs", icon: FileText, color: "amber" },
                  { label: "CRM/Contacts", count: "7 fichiers", icon: Users, color: "violet" },
                  { label: "Prospection", count: "25 fichiers", icon: Phone, color: "orange" },
                  { label: "Archives Email", count: "14.4 GB", icon: Mail, color: "gray" },
                  { label: "Projets-Tracker", count: "divers", icon: FolderOpen, color: "pink" },
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.label} className="text-center p-2 bg-white rounded-lg border border-yellow-100">
                      <CatIcon className={cn("h-4 w-4 mx-auto mb-1", `text-${cat.color}-500`)} />
                      <div className="text-xs font-bold text-gray-800">{cat.count}</div>
                      <div className="text-[9px] text-gray-500 font-medium">{cat.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-yellow-700">
                <Database className="h-4 w-4 shrink-0" />
                <span>Google Drive Master: <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono text-[9px]">1-GmOSBge4hnxmLqoB8oiaz-o4e84dlXZ</code> (272 fichiers, miroir complet)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 2. Methode CREDO — 296 pages */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.2</span>Methode CREDO — 296 pages</h3>
          <StatusBadge status="traite" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Protocole maitre Usine Bleue — Connecter, Rechercher, Exposer, Demontrer, Obtenir
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CREDO_MODULES.map((mod) => (
            <Card key={mod.name} className={cn(
              "p-4 border shadow-sm",
              mod.status === "traite" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={cn("h-4 w-4", mod.status === "traite" ? "text-emerald-500" : "text-amber-500")} />
                <span className="font-bold text-sm text-gray-800">{mod.name}</span>
                {mod.pages && <span className="text-[9px] text-gray-500 font-mono">{mod.pages}p</span>}
                <div className="ml-auto">
                  <StatusBadge status={mod.status} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                <span>{mod.mapping}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 3. Boost Camp — 3 Phases Usine Bleue */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.3</span>Boost Camp — 3 Phases Usine Bleue</h3>
          <StatusBadge status="partiel" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Programme d'acceleration manufacturier — VIST (15j) + JUAN (45j) + CPRJ (105j)
        </p>

        <div className="space-y-3">
          {BOOST_PHASES.map((phase) => (
            <Card key={phase.name} className={cn(
              "p-4 border shadow-sm",
              phase.status === "traite" ? "bg-emerald-50 border-emerald-200" :
              phase.status === "partiel" ? "bg-blue-50 border-blue-200" :
              "bg-amber-50 border-amber-200"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  phase.status === "traite" ? "bg-emerald-100" :
                  phase.status === "partiel" ? "bg-blue-100" :
                  "bg-amber-100"
                )}>
                  <Layers className={cn(
                    "h-4 w-4",
                    phase.status === "traite" ? "text-emerald-600" :
                    phase.status === "partiel" ? "text-blue-600" :
                    "text-amber-600"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{phase.name}</span>
                    {phase.duration && (
                      <Badge variant="outline" className="text-[9px] font-bold">{phase.duration}</Badge>
                    )}
                    <div className="ml-auto">
                      <StatusBadge status={phase.status} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{phase.files}</div>
                  {phase.mapping && (
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      <span>Mappe a <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">{phase.mapping}</code></span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 4. Templates & Documents Operationnels */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.4</span>Templates & Documents Operationnels</h3>
          <StatusBadge status="brut" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          18 documents — courriels, formulaires, trousses PDF, offres de service
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            {/* Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide flex-1">Type</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-12 text-center">Qty</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-64 hidden md:block">Detail</span>
            </div>

            {TEMPLATES_DOCS.map((doc) => (
              <div key={doc.type} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-medium text-gray-700">{doc.type}</span>
                </div>
                <span className="text-xs font-bold text-gray-600 w-12 text-center">{doc.count}</span>
                <span className="text-[9px] text-gray-400 w-64 truncate hidden md:block">{doc.detail}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 5. CRM & Contacts */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.5</span>CRM & Contacts</h3>
          <StatusBadge status="partiel" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Listes de membres REAI, contacts, base email — partiellement integre dans PostgreSQL
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-sm text-blue-700"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.5.1</span>Fichiers Sources</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Excel REAI member lists", size: "1.8 MB total" },
                { label: "Converted members", size: "inclus" },
                { label: "Email database", size: "inclus" },
                { label: "CSV export Oct 2025", size: "1 fichier" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="text-xs text-blue-700">{item.label}</span>
                  <span className="text-[9px] text-blue-500 ml-auto">{item.size}</span>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-blue-600 font-bold mt-2">6 Excel + 1 CSV = 7 fichiers</div>
          </Card>

          <Card className="p-4 bg-emerald-50 border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-bold text-sm text-emerald-700"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.5.2</span>Integration</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-700">PARTIELLEMENT integre dans <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[9px]">orbit9_members</code></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-xs text-gray-600">Import complet a terminer</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 6. Prospection */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.6</span>Prospection</h3>
          <StatusBadge status="brut" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Leads iCRIQ, scripts cold call, listes regionales — 25 fichiers non integres
        </p>

        <div className="space-y-3">
          {PROSPECTION_ITEMS.map((item) => (
            <Card key={item.category} className="p-4 bg-amber-50 border-amber-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{item.category}</span>
                    <Badge variant="outline" className="text-[9px] font-bold">{item.count} fichiers</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{item.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 7. Archives Email */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.7</span>Archives Email</h3>
          <StatusBadge status="non-traite" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          2 fichiers PST Outlook — 14.4 GB total, necessitent extraction + indexation
        </p>

        <Card className="p-4 bg-gray-50 border-gray-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <HardDrive className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                {[
                  { file: "backup-outlook-reai-250910.pst", size: "7.2 GB" },
                  { file: "backup-outlook-reai-250910-CarlFugere.pst", size: "7.2 GB" },
                ].map((pst) => (
                  <div key={pst.file} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <code className="text-xs font-mono text-gray-700 flex-1">{pst.file}</code>
                    <span className="text-xs font-bold text-gray-500">{pst.size}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span>Stockes dans <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">/tmp/mine-dor-8/</code></span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Besoin: extraction PST &rarr; indexation &rarr; recherche semantique</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 8. Donnees Manquantes — A Acquerir */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">D.5.8</span>Donnees Manquantes — A Acquerir</h3>
          <StatusBadge status="a-acquerir" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Donnees critiques absentes — necessaires pour atteindre Pioneer-Ready
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MISSING_DATA.map((item) => (
            <Card key={item.label} className="p-4 bg-red-50 border-red-200 shadow-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-700">{item.label}</span>
                    <div className="ml-auto">
                      <StatusBadge status="a-acquerir" />
                    </div>
                  </div>
                  <p className="text-[9px] text-red-600">{item.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Quick Stats */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Fichiers", value: "58", icon: FolderOpen, color: "yellow" },
            { label: "Drive Miroir", value: "272", icon: Download, color: "blue" },
            { label: "CREDO Pages", value: "296", icon: BookOpen, color: "emerald" },
            { label: "A Acquerir", value: String(MISSING_DATA.length), icon: AlertCircle, color: "red" },
          ].map((stat) => {
            const SIcon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
                <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
