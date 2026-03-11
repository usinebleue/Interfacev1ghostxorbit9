/**
 * MasterOracle9Page.tsx — E.6 Oracle9 — Oracle Industriel
 * Reference GHML: Intelligence predictive, barometre, sondages, web scraping
 * Source: Concept-Oracle-Industriel-V1.md + Gemini Deep Search Gap Analysis (7 volets)
 * O = Orbit9 (reseau) + Oracle9 (prediction) dans Gh(OS)T-X
 * Enrichi S47 avec donnees reelles 2026: outils, sources API, Loi 25, concurrence, budget
 */

import {
  Eye, Search, MessageSquare, BarChart3, TrendingUp,
  Database, Globe, ArrowRight, Clock, Zap,
  FileText, Users, Radio, Brain, Layers,
  AlertTriangle, CheckCircle2, Target, Newspaper,
  Shield, DollarSign, Cpu, BookOpen, Scale,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// HELPER
// ================================================================

function StatusBadge({ status }: { status: "live" | "en-cours" | "a-faire" | "planifie" }) {
  const config = {
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
    "planifie": { label: "PLANIFIE", className: "bg-blue-100 text-blue-600 border-blue-200" },
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
// DATA — 4 couches de l'Oracle (enrichi Doc 3 — outils specifiques)
// ================================================================

const COUCHES = [
  {
    num: 1,
    nom: "Le Chercheur",
    desc: "Bot de web scraping automatise — collecte les donnees publiques via API CKAN, WDS et scraping PDF",
    sources: ["ISQ (CKAN API)", "StatCan (WDS)", "BDC", "STIQ", "IFR", "OCDE", "LinkedIn Jobs", "Google Trends"],
    outils: "Playwright (headless browser) + MinerU (PDF→JSON/Markdown) + Pydantic (validation schema)",
    frequence: "Quotidien → mensuel selon la source",
    icon: Search,
    color: "blue",
    status: "a-faire" as const,
  },
  {
    num: 2,
    nom: "Le Sondeur",
    desc: "Micro-sondages integres dans CarlOS — 3 modes (A: passif, B: contextuel, C: trimestriel officiel)",
    sources: ["Mode A — Passif LiveChat", "Mode B — Contextuel vocal", "Mode C — Enquete trimestrielle", "Ponderation ISQ"],
    outils: "LiveKit + Deepgram STT + Gemini Flash NLP + Typeform API (Mode C)",
    frequence: "Continu (A/B) + trimestriel (C) — max 1 question/semaine/user",
    icon: MessageSquare,
    color: "emerald",
    status: "a-faire" as const,
  },
  {
    num: 3,
    nom: "L'Analyste",
    desc: "Agregation, nettoyage, croisement des sources — k-anonymat dynamique (k=5-10) avant publication",
    sources: ["Donnees Chercheur", "Reponses Sondeur", "Historique REAI", "Donnees membres Orbit9"],
    outils: "MotherDuck/DuckDB (analytique colonnes) + dbt (transformation) + Metabase (prototypage BI)",
    frequence: "Hebdomadaire (aggregation) + mensuel (rapport)",
    icon: BarChart3,
    color: "violet",
    status: "a-faire" as const,
  },
  {
    num: 4,
    nom: "L'Oracle",
    desc: "Predictions via modeles statistiques deterministes — LLMs = interpretation textuelle seulement (NLG)",
    sources: ["Series temporelles", "Modeles Bass (courbe S)", "Benchmarks internationaux IFR", "Signaux faibles"],
    outils: "statsforecast/Nixtla (500x plus rapide que Prophet) + markbassmodel (diffusion S-curve) + WeasyPrint (PDF)",
    frequence: "Trimestriel (predictions) + annuel (mega-etude)",
    icon: Eye,
    color: "amber",
    status: "planifie" as const,
  },
];

// ================================================================
// DATA — Tables PostgreSQL
// ================================================================

const ORACLE_TABLES = [
  { name: "industry_data", desc: "Donnees statistiques collectees (source + source_url metadata)", cols: "source, indicator, value, date_point, region, sector, metadata (JSONB), source_url, created_at", status: "a-faire" as const },
  { name: "surveys", desc: "Enquetes et micro-sondages (Mode A/B/C)", cols: "id, title, mode (A|B|C), questions (JSONB), target_audience, status, created_at", status: "a-faire" as const },
  { name: "survey_responses", desc: "Reponses anonymisees — k-anonymat verifie avant publication", cols: "survey_id (FK), member_id, answers (JSONB), sector, region, size_category, created_at", status: "a-faire" as const },
  { name: "predictions", desc: "Predictions Oracle (statsforecast + Bass)", cols: "indicator, predicted_value, confidence_interval, horizon, model_used (arima|bass|theta), created_at", status: "planifie" as const },
];

// ================================================================
// DATA — Sources prioritaires (enrichi Doc 3 — details API)
// ================================================================

const SOURCES_PRIORITAIRES = [
  { nom: "ISQ", type: "API CKAN", frequence: "Mensuel", cout: "Gratuit", fiabilite: "Haute", detail: "package_search + DataStore SQL, UTF-8, CC-BY 4.0" },
  { nom: "StatCan", type: "API WDS", frequence: "Mensuel", cout: "Gratuit", fiabilite: "Haute", detail: "PIDs 8 chiffres (ex-CANSIM 7), tables vintages, Licence ouverte Canada" },
  { nom: "BDC", type: "PDF/Web", frequence: "Trimestriel", cout: "Gratuit", fiabilite: "Haute", detail: "Rapports transformation numerique PME, scraping portail public" },
  { nom: "STIQ Barometre", type: "PDF", frequence: "Annuel", cout: "Partenariat", fiabilite: "Haute", detail: "Sondage 500 PME (marge 3.9%), BIP Recherche, extraction MinerU" },
  { nom: "IFR World Robotics", type: "Payant", frequence: "Annuel", cout: "~2800 CAD/an", fiabilite: "Haute", detail: "542K robots installes/an mondial, licence VDMA requise pour republication" },
  { nom: "OCDE iLibrary", type: "API REST", frequence: "Trimestriel", cout: "Gratuit", fiabilite: "Haute", detail: "Competitivite manufacturiere, bulk data download" },
  { nom: "MEI / IQ", type: "Scraping", frequence: "Continu", cout: "Gratuit", fiabilite: "Haute", detail: "ESSOR, appels de projets, Grand V — signaux subventions critiques" },
  { nom: "Google Trends", type: "API", frequence: "Quotidien", cout: "Gratuit", fiabilite: "Moyenne", detail: "Proxy interet techno: cobots, ERP, IA manufacturiere" },
  { nom: "LinkedIn Jobs", type: "Scraping", frequence: "Hebdo", cout: "~125 USD/mois proxys", fiabilite: "Moyenne", detail: "Non-authentifie SEULEMENT (hiQ v LinkedIn), ISP proxys rotatifs" },
  { nom: "CIPO / USPTO", type: "API", frequence: "Mensuel", cout: "Gratuit", fiabilite: "Haute", detail: "Depots brevets comme proxy d'innovation sectorielle" },
];

// ================================================================
// DATA — Roadmap (enrichi Doc 3 — 7 phases + GearsHub)
// ================================================================

const ROADMAP = [
  { phase: "Phase 0", nom: "Setup", desc: "Table industry_data + schema survey_responses + ToS mise a jour consentement", duree: "2-3 semaines", status: "a-faire" as const },
  { phase: "Phase 1", nom: "Chercheur V1", desc: "ISQ CKAN + StatCan WDS + MinerU Docker (PoC PDF STIQ) + 5 sources automatisees", duree: "1 mois", status: "a-faire" as const },
  { phase: "Phase 2", nom: "Sondeur V1", desc: "Modes A+B LiveChat + Give-to-Get gamification + EFVP documentation Loi 25", duree: "1 mois", status: "planifie" as const },
  { phase: "Phase 3", nom: "Barometre Q1", desc: "Premier Barometre Usine Bleue publie + k-anonymat + WeasyPrint PDF", duree: "2 semaines", status: "planifie" as const },
  { phase: "Phase 4", nom: "Oracle V1", desc: "statsforecast (AutoARIMA) + Bass S-curves + predictions narratives via LLM (NLG)", duree: "1 mois", status: "planifie" as const },
  { phase: "Phase 5", nom: "Mega-etude", desc: "Etude annuelle complete — successeur du REAI 2019 — PDF 100+ pages", duree: "3 mois", status: "planifie" as const },
  { phase: "Phase 6", nom: "GearsHub International", desc: "Export hors Quebec via CanExport PME (50K$) — benchmarks OCDE/Eurostat/US Census", duree: "6 mois", status: "planifie" as const },
];

// ================================================================
// DATA — Paysage concurrentiel (Doc 3 Volet 4)
// ================================================================

const CONCURRENTS = [
  { nom: "MachineMetrics", type: "IIoT / OEE", desc: "Capteurs sur machines CNC — efficacite globale equipements. Requiert installation materielle.", gap: "Pas d'intelligence macro/sectorielle, pas de C-Level insights" },
  { nom: "Xometry", type: "Marketplace IA", desc: "Place de marche sous-traitance avec tarification dynamique IA en temps reel.", gap: "Transactionnel seulement — pas de predictions ou benchmarks sectoriels" },
  { nom: "Thomasnet", type: "Annuaire / Intent", desc: "1.3M utilisateurs, Buyer Intent Reports vendus aux manufacturiers.", gap: "Limite aux intentions d'achat pieces — pas de budgets techno ou RH" },
  { nom: "IIR", type: "Recherche marche", desc: "Bases de donnees projets industriels mondiaux. Rapport 5 ans = 7 900 USD.", gap: "Prix prohibitif pour PME, donnees statiques, pas de micro-sondages" },
];

// ================================================================
// DATA — Risques systemiques (Doc 3 Volet 7)
// ================================================================

const RISQUES = [
  { risque: "Injonction scraping (CGU)", prob: "Moderee", gravite: "Haute", mitigation: "Scraping non-authentifie SEULEMENT, respect robots.txt, proxys ISP rotatifs, jurisprudence hiQ v LinkedIn" },
  { risque: "Hallucination LLM (fausses donnees)", prob: "Tres haute", gravite: "Haute", mitigation: "LLMs = NLG seulement (jamais calculs). MinerU pour extraction. Rejet auto si variation > 100% sur indicateur stable" },
  { risque: "Attrition sondages (fatigue users)", prob: "Haute", gravite: "Moderee", mitigation: "Max 1 question/semaine, rotation formulations, Give-to-Get (benchmark debloque apres 4 reponses/trimestre)" },
  { risque: "Enquete CAI / Loi 25", prob: "Moderee", gravite: "Critique", mitigation: "k-anonymat (k=5-10) dynamique, EFVP documentee, registre anonymisation, exception statistique art. 54" },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterOracle9ConceptPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Eye}
          iconColor="text-amber-600"
          title="Oracle9 — Oracle Industriel"
          subtitle="Intelligence predictive, barometre, sondages reseau"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* E.6.1 — Vision */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.1</span>
          Vision Oracle9
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          O = Orbit9 (reseau) + Oracle9 (prediction) dans Gh(OS)T-X — Terminal Bloomberg des PME manufacturieres
        </p>

        <Card className="p-4 bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-sm mb-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Eye className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-1">L'Oracle Industriel d'Usine Bleue</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Transition d'une intelligence d'affaires statique et retrospective vers une intelligence
                dynamique, centralisee et predictive. Architecture hybride fusionnant l'extraction automatisee
                de sources publiques (ISQ, StatCan, IFR) avec des donnees primaires exclusives obtenues via
                micro-sondages conversationnels dans CarlOS. Fossé concurrentiel : la conversation quotidienne
                avec les PDG = donnees que personne d'autre ne possede.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sources", value: "30+", detail: "Publiques + proprietaires", color: "blue" },
            { label: "Frequence", value: "Continu", detail: "Scraping + sondages", color: "emerald" },
            { label: "Output", value: "Barometre", detail: "Trimestriel + annuel", color: "violet" },
            { label: "Prediction", value: "Oracle", detail: "statsforecast + Bass S-curves", color: "amber" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
                <BarChart3 className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{kpi.label}</span>
              </div>
              <div className="px-3 py-2">
                <div className={cn("text-2xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
                <div className="text-[9px] text-gray-500">{kpi.detail}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.2 — 4 couches (enrichi avec outils specifiques) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.2</span>
          Architecture 4 Couches
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Chaque couche alimente la suivante — donnees brutes → intelligence actionnable
        </p>

        <div className="space-y-3">
          {COUCHES.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.num} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${c.color}-100`)}>
                    <Icon className={cn("h-4 w-4", `text-${c.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-gray-400">Couche {c.num}</span>
                      <span className="font-bold text-xs text-gray-700">{c.nom}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{c.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {c.sources.map((s) => (
                        <span key={s} className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", `bg-${c.color}-50 text-${c.color}-700`)}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Cpu className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-[9px] text-gray-500 font-medium">{c.outils}</span>
                    </div>
                    <div className="text-[9px] text-gray-400 italic">{c.frequence}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pipeline visuel */}
        <Card className="p-3 bg-gray-50 border border-gray-200 mt-3">
          <div className="flex items-center justify-center gap-2">
            {COUCHES.map((c, i) => (
              <div key={c.num} className="flex items-center gap-2">
                <span className={cn("text-[9px] font-bold px-2.5 py-1 rounded", `bg-${c.color}-100 text-${c.color}-700`)}>
                  {c.nom}
                </span>
                {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.3 — Sources prioritaires (enrichi Doc 3 — details API) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.3</span>
          Sources de Donnees Prioritaires
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          10 sources a integrer en priorite — details techniques d'acces valides 2026
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            {SOURCES_PRIORITAIRES.map((s) => (
              <div key={s.nom} className="py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 min-w-[120px]">{s.nom}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[55px] text-center",
                    s.type.includes("API") ? "bg-blue-100 text-blue-700" :
                    s.type === "PDF" ? "bg-violet-100 text-violet-700" :
                    s.type === "Payant" ? "bg-red-100 text-red-700" :
                    s.type === "Scraping" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {s.type}
                  </span>
                  <span className="text-[9px] text-gray-400 flex-1">{s.frequence}</span>
                  <span className="text-[9px] text-gray-500">{s.cout}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                    s.fiabilite === "Haute" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {s.fiabilite}
                  </span>
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5 ml-[120px] pl-2">{s.detail}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-center gap-2">
            <Scale className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-[9px] text-blue-700 font-medium">
              Licences: ISQ = CC-BY 4.0, StatCan = Licence ouverte Canada, IFR = payant (VDMA copyright strict).
              LinkedIn = non-authentifie SEULEMENT (hiQ v LinkedIn, injonction permanente 2022).
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.4 — Tables PostgreSQL */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.4</span>
          Schema PostgreSQL Oracle9
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          4 tables dans carlosdb — source_url heritee pour conformite licence
        </p>

        <div className="space-y-2">
          {ORACLE_TABLES.map((table) => (
            <Card key={table.name} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Database className="h-3.5 w-3.5 text-blue-500" />
                <code className="text-xs font-mono font-bold text-gray-800">{table.name}</code>
                <StatusBadge status={table.status} />
              </div>
              <div className="text-xs text-gray-500 mb-1.5">{table.desc}</div>
              <div className="text-[9px] text-gray-400 font-mono bg-gray-50 rounded px-2 py-1">{table.cols}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.5 — Monetisation Asymetrique (Doc 3 Volet 4) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.5</span>
          Monetisation Asymetrique (Freemium)
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Barometre gratuit = acquisition. Oracle Premium = monetisation. Give-to-Get = retention.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Newspaper className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700">Barometre Trimestriel</div>
                <div className="text-[9px] text-gray-400">GRATUIT — lead gen + PR</div>
              </div>
            </div>
            <div className="space-y-1 text-[9px] text-gray-600">
              <div>Tendances du trimestre</div>
              <div>Indices sectoriels agreges</div>
              <div>Taux d'adoption techno</div>
              <div>Distribution: email + LinkedIn + medias</div>
              <div className="text-blue-600 font-medium mt-1">Vecteur PR principal d'Usine Bleue</div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700">Mega-etude Annuelle</div>
                <div className="text-[9px] text-gray-400">Premium — successeur REAI 2019</div>
              </div>
            </div>
            <div className="space-y-1 text-[9px] text-gray-600">
              <div>Donnees proprietaires exclusives</div>
              <div>Predictions et benchmarks sectoriels</div>
              <div>PDF professionnel 100+ pages (WeasyPrint)</div>
              <div>Citations rigoureuses, intervalles de confiance</div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Eye className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-700">Oracle Premium</div>
                <div className="text-[9px] text-gray-400">Abonnes CarlOS Enterprise</div>
              </div>
            </div>
            <div className="space-y-1 text-[9px] text-gray-600">
              <div>Dashboard Industrie live + predictions</div>
              <div>Gap Analysis vs concurrents du sous-secteur</div>
              <div>Alertes subventions + jumelage Orbit9</div>
              <div>Comparables et benchmarks personnalises</div>
            </div>
          </Card>
        </div>

        <Card className="p-3 bg-amber-50 border-amber-200 mt-3">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="text-xs text-amber-700 font-medium">
              Give-to-Get : Score de Contribution — benchmark debloque apres 4+ micro-sondages/trimestre
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.6 — Paysage Concurrentiel (Doc 3 Volet 4) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.6</span>
          Paysage Concurrentiel
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Aucun concurrent n'offre intelligence macro + insights C-Level sans installation materielle
        </p>

        <div className="space-y-2">
          {CONCURRENTS.map((c) => (
            <Card key={c.nom} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">{c.nom}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{c.type}</span>
              </div>
              <p className="text-[9px] text-gray-500 mb-1">{c.desc}</p>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-[9px] text-amber-700 font-medium">{c.gap}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-3 bg-emerald-50 border-emerald-200 mt-3">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">
              Avantage Usine Bleue : conversation quotidienne CarlOS avec les PDG = donnees que personne d'autre ne possede
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.7 — Micro-sondages 3 modes (Doc 3 Volet 2) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.7</span>
          Micro-sondages CarlOS — 3 Modes
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Donnees proprietaires exclusives — max 1 question/semaine par user (anti-fatigue)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold text-xs text-gray-700">Mode A — Passif</span>
            </div>
            <div className="space-y-1 text-[9px] text-gray-600">
              <div>1 question aleatoire par session LiveChat</div>
              <div>Bassin de 5 questions non-sensibles</div>
              <div>Reponse texte interceptee par Gemini Flash</div>
              <div>Categorisation auto (budget, obstacle, adoption)</div>
              <div className="text-emerald-600 font-medium mt-1">Minimal friction — user ne remarque presque pas</div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-bold text-xs text-gray-700">Mode B — Contextuel</span>
            </div>
            <div className="space-y-1 text-[9px] text-gray-600">
              <div>Question declenchee par le contexte vocal/chat</div>
              <div>Ex: discussion robotique → "Utilisez-vous des cobots?"</div>
              <div>Reponse vocale via Deepgram STT + NLP</div>
              <div>Plus naturel que Mode A</div>
              <div className="text-blue-600 font-medium mt-1">Conversationnel — integre au flow CarlOS</div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-bold text-xs text-gray-700">Mode C — Trimestriel</span>
            </div>
            <div className="space-y-1 text-[9px] text-gray-600">
              <div>Enquete officielle (Typeform/SurveyMonkey API)</div>
              <div>Methodologie rigoureuse — echantillon repressentatif</div>
              <div>Branchement conditionnel + redressement</div>
              <div>Ponderation ISQ (taille, secteur, region)</div>
              <div className="text-violet-600 font-medium mt-1">Credibilite institutionnelle — base du Barometre</div>
            </div>
          </Card>
        </div>

        <Card className="p-3 bg-emerald-50 border-emerald-200 mt-3">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">
              Ponderation obligatoire : clientele Usine Bleue = early adopters → correction biais avec demographie ISQ reelle
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.8 — Loi 25 / Conformite (Doc 3 Volet 3) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.8</span>
          Conformite Loi 25 — Protocole d'Anonymisation
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Anonymisation irréversible obligatoire — 4 phases CAI + exception statistique art. 54
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-bold text-gray-700">Protocole 4 Phases (CAI)</span>
            </div>
            <div className="space-y-1.5 text-[9px] text-gray-600">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-gray-400 shrink-0">1.</span>
                <span><span className="font-medium">Preparatoire</span> — Designation responsable + validation fins "serieuses et legitimes"</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-gray-400 shrink-0">2.</span>
                <span><span className="font-medium">Analytique</span> — Purge identifiants directs + analyse risque (individualisation, correlation, inference)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-gray-400 shrink-0">3.</span>
                <span><span className="font-medium">Mise en oeuvre</span> — k-anonymat (k=5 a 10), bruit statistique, risque residuel "tres faible"</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-gray-400 shrink-0">4.</span>
                <span><span className="font-medium">Maintien</span> — Surveillance periodique, registre anonymisation, reevaluation vs nouvelles technos</span>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">Regles pour l'Oracle</span>
            </div>
            <div className="space-y-1.5 text-[9px] text-gray-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>k-anonymat dynamique : si croisement &lt; k repondants → agreger au niveau macro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Exception art. 54 : communication sans consentement si fins statistiques + EFVP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>EFVP (PIA) obligatoire AVANT collecte active de donnees privees (Phase 2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span className="text-red-600 font-medium">Sanctions : jusqu'a 10M$ ou 2% du CA mondial</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-3 bg-red-50 border-red-200 mt-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
            <span className="text-[9px] text-red-700 font-medium">
              Budget juridique recommande : 2 500$ - 5 000$ consultation droit des technologies (ToS + registre + EFVP)
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.9 — Budget & Financement (Doc 3 Volet 6) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.9</span>
          Budget & Financement
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Couts d'infrastructure minimaux + subventions non-dilutives disponibles 2026
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-gray-700">Couts Infrastructure</span>
            </div>
            <div className="space-y-1.5 text-[9px] text-gray-600">
              <div className="flex justify-between">
                <span>VPS OVH (2 serveurs existants)</span>
                <span className="font-medium">Deja couvert</span>
              </div>
              <div className="flex justify-between">
                <span>MotherDuck/DuckDB (analytique)</span>
                <span className="font-medium">&lt; 50 USD/mois</span>
              </div>
              <div className="flex justify-between">
                <span>API LLM (Claude/Gemini)</span>
                <span className="font-medium">20-50 $/mois</span>
              </div>
              <div className="flex justify-between">
                <span>Proxys ISP (scraping legal)</span>
                <span className="font-medium">~125 USD/mois</span>
              </div>
              <div className="flex justify-between">
                <span>IFR World Robotics (licence annuelle)</span>
                <span className="font-medium">~2 800 CAD/an</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="font-bold">Total estime</span>
                <span className="font-bold text-emerald-600">~450 CAD/mois + 2800/an</span>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">Subventions Disponibles 2026</span>
            </div>
            <div className="space-y-2 text-[9px] text-gray-600">
              <div>
                <div className="font-bold text-gray-700">ESSOR (Investissement Quebec)</div>
                <div>Etudes faisabilite, diagnostics numeriques, innovation techno. Premier choix pour l'Oracle.</div>
              </div>
              <div>
                <div className="font-bold text-gray-700">CanExport PME (Federal)</div>
                <div>50% couts expansion internationale, max 50K$. Ideal pour Phase 6 GearsHub.</div>
              </div>
              <div>
                <div className="font-bold text-gray-700">Fonds C (Desjardins)</div>
                <div>Transformation numerique + innovation — financement corporatif regional.</div>
              </div>
              <div className="text-amber-600 font-medium mt-1">
                PCAN (Volet 2) ferme — plus de nouvelles demandes depuis fev 2024.
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.10 — Roadmap (enrichi Doc 3 — 7 phases) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.10</span>
          Roadmap Implementation
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          7 phases progressives — chaque phase livre de la valeur. Quick Wins en &lt; 30 jours.
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {ROADMAP.map((r) => (
              <div key={r.phase} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-[9px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 min-w-[55px] text-center shrink-0">
                  {r.phase}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-700">{r.nom}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-[9px] text-gray-500">{r.desc}</p>
                </div>
                <span className="text-[9px] text-gray-400 shrink-0">{r.duree}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-[9px] text-blue-700 font-medium">
              Dependance critique : Oracle V1 (Phase 4) requiert 6-12 mois de donnees dans industry_data pour backtesting fiable.
              La conformite Loi 25 (Phase 2) est un goulot d'etranglement AVANT toute publication (Phase 3).
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.11 — Risques & Mitigation (Doc 3 Volet 7) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.11</span>
          Risques Systemiques & Mitigation
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          4 show-stoppers identifies — chacun avec mesure d'attenuation concrete
        </p>

        <div className="space-y-2">
          {RISQUES.map((r) => (
            <Card key={r.risque} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0",
                  r.gravite === "Critique" ? "text-red-500" : r.gravite === "Haute" ? "text-amber-500" : "text-yellow-500"
                )} />
                <span className="text-xs font-bold text-gray-700">{r.risque}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                  r.prob === "Tres haute" ? "bg-red-100 text-red-700" :
                  r.prob === "Haute" ? "bg-amber-100 text-amber-700" :
                  "bg-yellow-100 text-yellow-700"
                )}>
                  {r.prob}
                </span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                  r.gravite === "Critique" ? "bg-red-100 text-red-700" :
                  r.gravite === "Haute" ? "bg-amber-100 text-amber-700" :
                  "bg-yellow-100 text-yellow-700"
                )}>
                  {r.gravite}
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[9px] text-gray-500">{r.mitigation}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.12 — Lien Orbit9 */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.12</span>
          Oracle9 x Orbit9 — Synergie
        </h3>

        <Card className="p-4 bg-gradient-to-b from-orange-50 to-white border border-orange-200 shadow-sm">
          <div className="space-y-3">
            {[
              { de: "Orbit9 Members", vers: "Oracle9 Sondeur", desc: "Les membres du reseau repondent aux micro-sondages = donnees exclusives (Give-to-Get)" },
              { de: "Oracle9 Predictions", vers: "Orbit9 Matching", desc: "Predictions sectorielles ameliorent le scoring de matching entre membres" },
              { de: "Oracle9 Dashboard", vers: "CarlOS Coaching", desc: "CarlOS utilise les donnees industrie pour contextualiser ses conseils C-Level" },
              { de: "Oracle9 Barometre", vers: "Marketing Usine Bleue", desc: "Publications gratuites attirent nouveaux membres Orbit9 (boucle d'acquisition)" },
            ].map((lien) => (
              <div key={lien.de} className="flex items-start gap-3 py-2 border-b border-orange-100 last:border-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-bold px-2 py-1 rounded bg-orange-100 text-orange-700">{lien.de}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-[9px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">{lien.vers}</span>
                </div>
                <span className="text-[9px] text-gray-500 flex-1">{lien.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 mt-3 bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700 italic text-center">
            Orbit9 construit le reseau. Oracle9 genere l'intelligence. Ensemble = avantage concurrentiel inimitable.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.6.13 — Horizons 2026-2028 (Orbit9 V2.5 Volet 4) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.6.13</span>
          Horizons 2026-2028 — Vecteurs de Transformation
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          3 ruptures post-2019 que l'Oracle doit traquer dans ses modeles predictifs (Orbit9 V2.5 Volet 4)
        </p>

        <div className="space-y-3">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-gray-700">IA Agentique & Physique</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">CRITIQUE</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Transition de l'IA analytique (21% du marche offre 2019) vers des systemes autonomes :
                  IA agentique (raisonne + planifie + execute sans humain), robots humanoides (interet grimpe a 13%),
                  AMR logistiques + LLMs pour controle qualite, jumeaux numeriques boucle fermee.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["IA agentique", "Robots humanoides", "AMR logistiques", "Jumeaux numeriques", "Calcul quantique"].map((t) => (
                    <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-gray-700">Conformite Climatique & Cybersecurite OT</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">CRITIQUE</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Regulation = moteur de modernisation. CSRD + CBAM forcent le reporting Scope 3 (2026-2028).
                  NIS2 + IEC 62443 imposent Zero-Trust sur les reseaux OT. Les PME dans les chaines de valeur
                  mondiales n'ont PAS le choix — conformite ou exclusion.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["CSRD/CBAM (Scope 3)", "NIS2", "IEC 62443", "Zero-Trust OT", "Tracabilite ESG"].map((t) => (
                    <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-gray-700">Manufacturing-as-a-Service (MaaS)</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">MOYEN</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Les plateformes IoT hyperscalers deportent la valeur vers l'orchestration logicielle.
                  Emergence de fournisseurs infonuagiques dedies a l'industrie et de startups Deep Tech.
                  L'Oracle doit tracker les nouveaux entrants qui changent les modeles d'affaires de l'offre.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["MaaS", "IoT hyperscalers", "Deep Tech", "Cloud industriel"].map((t) => (
                    <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-3 bg-violet-50 border-violet-200 mt-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-violet-600 shrink-0" />
            <span className="text-xs text-violet-700 font-medium">
              Ces 3 vecteurs doivent etre encodes dans les modeles Bass (courbe S) de l'Oracle pour predire les taux d'adoption sectoriels.
              Source : Orbit9 V2.5 Volet 4 — Projection 2026.
            </span>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
