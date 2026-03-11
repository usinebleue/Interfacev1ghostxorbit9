/**
 * MasterCartographieIndustriellePage.tsx — E.5 Cartographie Industrielle
 * Reference GHML: Taxonomie acteurs, secteurs, technologies, regions
 * DONNEES 2024-2026 — Sources: REAI, STIQ 16e ed, MEIE, ISQ, IFR, FCEI, Orbit9 V2.5, KPMG
 * Derniere mise a jour: Mars 2026
 */

import {
  Map, Factory, Users, Cpu, Globe, BarChart3,
  AlertTriangle, Layers, ArrowRight, Building2,
  Wrench, Package, Truck, Microscope, Cog,
  MapPin, TrendingUp, ShieldAlert, Target,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// DATA — Taxonomie des acteurs
// ================================================================

const ACTEURS = [
  {
    type: "Fabricants d'equipements/outils",
    code: "FEQ",
    desc: "Fournisseurs de machines, robots, systemes d'automatisation — 59% de l'offre (REAI 2019, convergence IT/OT)",
    categories: ["Robotique industrielle", "Cobots", "Systemes de vision", "Outillage CNC", "Equipements de soudage", "Convoyeurs/manutention"],
    color: "violet",
    icon: Cog,
  },
  {
    type: "Developpeurs logiciels",
    code: "DEV",
    desc: "Editeurs ERP, MES, IoT, IA, SCADA, PLM — 52% de l'offre (REAI 2019), IA passee de 21% a priorite transversale",
    categories: ["ERP/MRP", "MES/SCADA", "IoT industriel", "IA generative & predictive", "PLM/CAO", "Cybersecurite OT"],
    color: "blue",
    icon: Cpu,
  },
  {
    type: "Integrateurs/consultants",
    code: "INT",
    desc: "Firmes d'integration, consultants en transformation — 57% de l'offre (REAI 2019), convergence hybride",
    categories: ["Integration systemes", "Conseil 4.0 / ADN 4.0", "Formation", "Gestion de projet", "Lean/Six Sigma"],
    color: "emerald",
    icon: Wrench,
  },
  {
    type: "Manufacturiers (clients)",
    code: "MFG",
    desc: "13,694 etablissements employeurs QC — 93% ont < 100 employes, 31.5% ont < 5 employes",
    categories: ["Transformation metallique", "Plastique/composites", "Alimentaire", "Bois/meubles", "Electronique", "Aeronautique"],
    color: "orange",
    icon: Factory,
  },
  {
    type: "Organismes/associations",
    code: "ORG",
    desc: "REAI (130+ membres), STIQ, MEI, BDC, Scale AI, IID, Mila, CCTT, MEQ",
    categories: ["Associations sectorielles", "Organismes gouvernementaux", "Centres de transfert (CCTT)", "Accelerateurs", "Universites / IID / Mila"],
    color: "teal",
    icon: Building2,
  },
  {
    type: "Distributeurs/revendeurs",
    code: "DST",
    desc: "Chaine d'approvisionnement — pression achat local via PASQE (AIEQ)",
    categories: ["Distributeurs industriels", "Revendeurs specialises", "Marketplaces B2B", "Logistique industrielle"],
    color: "pink",
    icon: Truck,
  },
];

// ================================================================
// DATA — Top secteurs manufacturiers QC (2024-2026)
// ================================================================

const SECTEURS = [
  { code: "SCIAN 336", nom: "Transport / Aerospatiale", poids: "17.1%", detail: "Premier secteur QC" },
  { code: "SCIAN 332", nom: "Produits metalliques", poids: "14.6%", detail: "Forte concentration PME" },
  { code: "SCIAN 311", nom: "Aliments", poids: "13.5%", detail: "Stable, automatisation croissante" },
  { code: "SCIAN 331", nom: "Premiere transformation metaux", poids: "12.9%", detail: "Aluminium, acier" },
  { code: "SCIAN 333", nom: "Machines", poids: "8.5%", detail: "Exportation forte" },
  { code: "SCIAN 325", nom: "Chimie", poids: "8.5%", detail: "Forte intensite capitalistique" },
  { code: "SCIAN 326", nom: "Produits plastique/caoutchouc", poids: "~5%", detail: "Innovation materiaux" },
  { code: "SCIAN 334", nom: "Informatique/electronique", poids: "~4%", detail: "Forte R&D" },
  { code: "SCIAN 335", nom: "Materiel electrique", poids: "~3%", detail: "Transition energetique" },
  { code: "SCIAN 337", nom: "Meubles", poids: "~2%", detail: "Automatisation en hausse" },
];

// ================================================================
// DATA — Technologies 4.0 (DONNEES 2024-2026)
// ================================================================

const TECHNOLOGIES = [
  { nom: "CAO/DAO", adoption: "61%", adoptionNum: 61, maturite: "Haute", categorie: "Logiciel", evolution: "stable", source: "MEIE 2025" },
  { nom: "ERP/MRP", adoption: "51%", adoptionNum: 51, maturite: "Haute", categorie: "Logiciel", evolution: "stagnant (3% connecte)", source: "MEIE 2025" },
  { nom: "Infonuagique (Cloud)", adoption: "49%", adoptionNum: 49, maturite: "Haute", categorie: "Infrastructure", evolution: "+7pts", source: "StatCan" },
  { nom: "IA / Machine Learning", adoption: "43%", adoptionNum: 43, maturite: "Moyenne", categorie: "Intelligence", evolution: "+39pts vs 2019!", source: "STIQ/MEIE" },
  { nom: "Robotique / FMS / MES", adoption: "38%", adoptionNum: 38, maturite: "Moyenne", categorie: "Equipement", evolution: "+4pts vs 2019", source: "MEIE 2025" },
  { nom: "Impression 3D", adoption: "16%", adoptionNum: 16, maturite: "Emergente", categorie: "Equipement", evolution: "+4pts (niche)", source: "MEIE 2025" },
  { nom: "Interconnexion elevee", adoption: "14%", adoptionNum: 14, maturite: "Emergente", categorie: "Infrastructure", evolution: "tres faible", source: "MEIE 2025" },
  { nom: "IA pour production", adoption: "7%", adoptionNum: 7, maturite: "Naissante", categorie: "Intelligence", evolution: "plancher usine", source: "STIQ 2025" },
  { nom: "Vision artificielle / QC", adoption: "6%", adoptionNum: 6, maturite: "Naissante", categorie: "Intelligence", evolution: "controle qualite", source: "STIQ 2025" },
  { nom: "Jumeaux numeriques", adoption: "~3%", adoptionNum: 3, maturite: "Naissante", categorie: "Intelligence", evolution: "bloque par ERP", source: "Analyse" },
];

// ================================================================
// DATA — Regions du Quebec (2024-2026)
// ================================================================

// NOTE: poids regionaux = estimations basees sur ISQ 2024 (emploi manuf. par region).
// Les ~ indiquent des approximations. A remplacer par donnees exactes Oracle9 Phase 1.
const REGIONS = [
  { nom: "Montreal metropolitain", poids: "~35%", force: "Aerospatiale, TI, pharma, IA (Scale AI, Mila)" },
  { nom: "Monteregie", poids: "~18%", force: "Transformation metallique, plastique" },
  { nom: "Chaudiere-Appalaches", poids: "~12%", force: "PME manufacturieres, bois, metal" },
  { nom: "Centre-du-Quebec / Mauricie", poids: "~10%", force: "392M$ IQ en 2024-2025 pour productivite (IQ 2025)" },
  { nom: "Estrie", poids: "~7%", force: "Caoutchouc, plastique, electronique" },
  { nom: "Lanaudiere/Laurentides", poids: "~6%", force: "Bois, transformation, logistique" },
  { nom: "Capitale-Nationale", poids: "~5%", force: "Optique/photonique, defense, IID (Univ. Laval)" },
  { nom: "Bas-Saint-Laurent/Gaspesie", poids: "~4%", force: "Bois, eolien, maritime" },
  { nom: "Saguenay/Lac-Saint-Jean", poids: "~3%", force: "Aluminium, foret, energie" },
  { nom: "Abitibi/Nord-du-Quebec", poids: "~2%", force: "Mines, premiere transformation" },
];

// ================================================================
// DATA — Obstacles a l'adoption 4.0 (2024-2026)
// ================================================================

const OBSTACLES = [
  { obstacle: "Manque de connaissances sur la pertinence de l'IA", impact: 67, type: "Humain", source: "STIQ 2025" },
  { obstacle: "Manque de personnel qualifie (TI/OT)", impact: 66, type: "Humain", source: "STIQ 2025" },
  { obstacle: "Manque de temps", impact: 66, type: "Humain", source: "STIQ 2025" },
  { obstacle: "Difficulte a evaluer le ROI", impact: 53, type: "Financier", source: "STIQ 2025" },
  { obstacle: "Manque de competences numeriques generales", impact: 51, type: "Humain", source: "FCEI 2025" },
  { obstacle: "Couts eleves", impact: 48, type: "Financier", source: "FCEI 2025" },
  { obstacle: "Cybersecurite / Loi 25", impact: 40, type: "Technique", source: "FCCQ 2024" },
  { obstacle: "Fragmentation systemes (silos ERP)", impact: 35, type: "Technique", source: "MEIE 2025" },
];

// ================================================================
// DATA — Codes internationaux
// ================================================================

const CODES_INTERNATIONAUX = [
  { systeme: "SCIAN", region: "Canada/USA/Mexique", niveaux: "5 niveaux (2-6 chiffres)", usage: "Primaire pour Usine Bleue" },
  { systeme: "NACE Rev.2", region: "Union Europeenne", niveaux: "4 niveaux (A-99.99)", usage: "Pour GearsHub EU" },
  { systeme: "ISIC Rev.4", region: "ONU (mondial)", niveaux: "4 niveaux", usage: "Pont universel SCIAN-NACE" },
  { systeme: "NAICS", region: "USA", niveaux: "6 chiffres", usage: "Compatible SCIAN (meme base)" },
];

// ================================================================
// DATA — Maturite numerique 2019 vs 2025 (Orbit9 V2.5 + MEIE 2025)
// ================================================================

const MATURITE_COMPAREE = [
  {
    stade: "Exploration (processus manuels)",
    niveaux: "Stade 1",
    pct2019: 18,
    pct2025: 16,
    evolution: "-2 pts",
    insight: "Resorbtion lente des retardataires. Micro-entreprises (1-4 employes) = noyau dur de ce segment.",
    besoins: "Diagnostics, consultants Audit 4.0, ERP/CRM de base",
    color: "red",
  },
  {
    stade: "Amorcee & Avancee (silos)",
    niveaux: "Stades 2-3",
    pct2019: 62,
    pct2025: 41,
    evolution: "-21 pts",
    insight: "Contraction massive du 'ventre mou'. Polarisation: certaines PME ont fait le saut, d'autres stagnent en silos.",
    besoins: "Integrateurs systemes, IoT, MES/SCADA, robotique avancee",
    color: "amber",
  },
  {
    stade: "Quasi complete & Complete (interconnexion)",
    niveaux: "Stades 4-5",
    pct2019: 14,
    pct2025: 19,
    evolution: "+5 pts",
    insight: "Hausse de l'elite 4.0. Bondit a 38% chez les entreprises de 50+ employes (MEIE 2025).",
    besoins: "Analytics, cybersecurite OT, IA agentique, jumeaux numeriques",
    color: "emerald",
  },
];

// ================================================================
// DATA — 3 Archetypes manufacturiers (Orbit9 V2.5 Volet 3)
// ================================================================

const ARCHETYPES = [
  {
    nom: "TPE Innovatrice",
    taille: "< 20 employes",
    traits: ["42% du personnel en R&D", "Investissement < 500K$", "Age median ~15 ans", "R&D intra-muros intensive"],
    vitaaForce: "Idee",
    vitaaFaiblesse: "Argent",
    strategie: "Orienter vers integrateurs ou financements R&D (RS&DE, CRIC)",
    color: "violet",
  },
  {
    nom: "PE Championne de Niche",
    taille: "20-99 employes",
    traits: ["43% CA en exportation", "60% obstacle RH", "Specialisation sectorielle forte", "23% personnel en R&D"],
    vitaaForce: "Vente",
    vitaaFaiblesse: "Temps",
    strategie: "Partenaires pour soulager la capacite de production",
    color: "blue",
  },
  {
    nom: "MGE Integratrice",
    taille: "100+ employes",
    traits: ["100% exportation", "42% siege hors QC", "65% ont investi > 1M$", "83% R&D collaborative"],
    vitaaForce: "Actif",
    vitaaFaiblesse: "Agilite",
    strategie: "Fournisseurs d'usines completes, investissements massifs",
    color: "emerald",
  },
];

// ================================================================
// DATA — Gaps Offre vs Demande (Orbit9 V2.5 Volet 3)
// ================================================================

const GAPS_OFFRE_DEMANDE = [
  { categorie: "Mise en forme soustractive (fraisage/tournage)", demandePct: 53, rangDemande: 1, rangOffre: 8, gap: "Critique", detail: "#1 besoin des usines, #8 priorite fournisseurs locaux" },
  { categorie: "Ingenierie numerique (CAO/FAO/PLM)", demandePct: 44, rangDemande: 1, rangOffre: 5, gap: "Eleve", detail: "#1 import logiciel, #5 offre locale" },
  { categorie: "Traitement de surface", demandePct: 16, rangDemande: 2, rangOffre: 6, gap: "Modere", detail: "Besoin significatif, faible offre locale" },
];

// ================================================================
// DATA — Dynamique collaborative (Orbit9 V2.5 Volets 3+7)
// ================================================================

const COLLABORATION = [
  { type: "Sous-traitance", pct: 59 },
  { type: "R&D conjointe", pct: 56 },
  { type: "Integration technologique", pct: 48 },
  { type: "Co-conception", pct: 35 },
  { type: "Commercialisation partagee", pct: 35 },
];

const CRITERES_SELECTION = [
  { critere: "Proximite geographique", pct: 67 },
  { critere: "Flexibilite / adaptabilite", pct: 57 },
  { critere: "Qualite SAV", pct: 45 },
  { critere: "Expertise technique", pct: 40 },
];

// ================================================================
// HELPER
// ================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterCartographieIndustriellePage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Map}
          iconColor="text-cyan-600"
          title="Cartographie Industrielle"
          subtitle="Donnees 2024-2026 — STIQ, ISQ, MEIE, REAI, IFR, FCEI"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* E.5.1 — Chiffres cles 2024-2026 */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.1</span>
          Chiffres Cles — Industrie Manufacturiere QC
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Donnees 2024-2026 | Sources: REAI, STIQ Barometre 16e ed., ISQ, MEIE
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Etablissements", value: "13,694", detail: "Employeurs QC (800+ en automatisation)", color: "blue", source: "ISQ/REAI" },
            { label: "Emplois", value: "417K", detail: "-0.8% vs 2023 (substitution capital/travail)", color: "emerald", source: "STIQ 2025" },
            { label: "Revenus", value: "218 G$", detail: "+22.8% vs 2019 (177.5G$)", color: "violet", source: "ISQ 2024" },
            { label: "Grand V (IQ)", value: "1 G$", detail: "225 projets en 5 mois", color: "amber", source: "IQ 2024-25" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
                <BarChart3 className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{kpi.label}</span>
              </div>
              <div className="px-3 py-2">
                <div className={cn("text-2xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
                <div className="text-[9px] text-gray-500">{kpi.detail}</div>
                <div className="text-[9px] text-gray-400 italic">{kpi.source}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Structure PME */}
        <Card className="p-3 bg-amber-50 border-amber-200 mt-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-[9px] text-amber-700">
              <span className="font-bold">Hyper-fragmentation:</span> 93% des etablissements ont &lt; 100 employes. 31.5% ont &lt; 5 employes. Ces PME manquent de bande passante pour orchestrer des virages numeriques complexes (STIQ 2025).
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.2 — Taxonomie des acteurs */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.2</span>
          Taxonomie des Acteurs
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          6 types d'acteurs — convergence IT/OT acceleree depuis 2019
        </p>

        <div className="space-y-3">
          {ACTEURS.map((a) => {
            const Icon = a.icon;
            return (
              <Card key={a.code} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${a.color}-100`)}>
                    <Icon className={cn("h-4 w-4", `text-${a.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-gray-700">{a.type}</span>
                      <Badge variant="outline" className="text-[9px] font-bold">{a.code}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{a.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.categories.map((cat) => (
                        <span key={cat} className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", `bg-${a.color}-50 text-${a.color}-700`)}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.3 — Secteurs manufacturiers */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.3</span>
          Secteurs Manufacturiers (SCIAN)
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Top 10 par contribution au PIB manufacturier QC — 6 secteurs = 62% du total
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {SECTEURS.map((s, i) => (
              <div key={s.code} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[9px] font-bold text-gray-400 w-4">{i + 1}</span>
                <code className="text-[9px] font-mono font-bold text-gray-500 min-w-[70px]">{s.code}</code>
                <span className="text-xs text-gray-700 flex-1">{s.nom}</span>
                <span className="text-xs font-bold text-blue-600 min-w-[40px] text-right">{s.poids}</span>
                <span className="text-[9px] text-gray-400 min-w-[130px] text-right">{s.detail}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 mt-2 italic">Source: STIQ Barometre 16e edition 2025</p>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.4 — Technologies 4.0 (DONNEES 2024-2026) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.4</span>
          Technologies 4.0 — Taux d'Adoption 2024-2026
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Donnees reelles — MEIE, STIQ Barometre 16e ed., StatCan
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2.5">
            {TECHNOLOGIES.map((t) => (
              <div key={t.nom}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 min-w-[140px]">{t.nom}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        t.maturite === "Haute" ? "bg-emerald-500" :
                        t.maturite === "Moyenne" ? "bg-blue-500" :
                        t.maturite === "Emergente" ? "bg-amber-500" : "bg-violet-500"
                      )}
                      style={{ width: t.adoption }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 min-w-[35px] text-right">{t.adoption}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[65px] text-center",
                    t.maturite === "Haute" ? "bg-emerald-100 text-emerald-700" :
                    t.maturite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                    t.maturite === "Emergente" ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"
                  )}>
                    {t.maturite}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-[152px] mt-0.5">
                  <span className="text-[9px] text-gray-400">{t.evolution}</span>
                  <span className="text-[9px] text-gray-300">·</span>
                  <span className="text-[9px] text-gray-400 italic">{t.source}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-xs text-blue-700">L'IA est passee de 4% (2019) a 43% (2025) — mais 39% l'utilisent "un peu" (textes/courriels) vs 6% "beaucoup" (production)</span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.5 — Regions du Quebec */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.5</span>
          Geographie Manufacturiere
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Poids regionaux estimes (ISQ 2024, emploi manuf. par RA). ~ = approximation a preciser via Oracle9.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {REGIONS.map((r) => (
            <Card key={r.nom} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span className="text-xs font-bold text-gray-700 flex-1">{r.nom}</span>
                <span className="text-xs font-bold text-cyan-600">{r.poids}</span>
              </div>
              <div className="text-[9px] text-gray-500">{r.force}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.6 — Obstacles a l'adoption (2024-2026) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.6</span>
          Obstacles a l'Adoption 4.0 — 2024-2026
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Changement de paradigme: l'obstacle est l'incapacite a absorber le changement, pas le refus de changer
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {OBSTACLES.map((o) => (
              <div key={o.obstacle}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-700 flex-1">{o.obstacle}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                    o.type === "Humain" ? "bg-pink-100 text-pink-700" :
                    o.type === "Financier" ? "bg-emerald-100 text-emerald-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {o.type}
                  </span>
                  <span className="text-xs font-bold text-gray-700 min-w-[30px] text-right">{o.impact}%</span>
                  <span className="text-[9px] text-gray-400 min-w-[60px] text-right">{o.source}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      o.impact >= 60 ? "bg-red-400" :
                      o.impact >= 50 ? "bg-amber-400" : "bg-blue-400"
                    )}
                    style={{ width: `${o.impact}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-red-50 border-red-200 mt-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
            <span className="text-[9px] text-red-700">En 2019, 45% disaient que le numerique n'etait "pas necessaire". Cet argument a ete pulverise par la realite post-pandemique. Aujourd'hui le frein #1 est le manque de connaissances sur l'IA (67%).</span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.7 — Codes internationaux (GearsHub) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.7</span>
          Codes Internationaux — GearsHub Ready
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Architecture 3 couches : universelle (ISIC) → regionale (SCIAN/NACE) → locale (specialites)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {CODES_INTERNATIONAUX.map((c) => (
            <Card key={c.systeme} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold text-gray-700">{c.systeme}</span>
                <Badge variant="outline" className="text-[9px]">{c.region}</Badge>
              </div>
              <div className="text-[9px] text-gray-500 mb-0.5">Niveaux : {c.niveaux}</div>
              <div className="text-[9px] text-gray-400 italic">{c.usage}</div>
            </Card>
          ))}
        </div>

        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-2">
            <Globe className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-blue-700">Architecture a 3 couches pour l'international</span>
              <div className="flex items-center gap-2 mt-2">
                {["ISIC (universel)", "SCIAN/NACE (regional)", "Specialites (local)"].map((layer, i) => (
                  <div key={layer} className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-2 py-1 rounded bg-white text-blue-700">{layer}</span>
                    {i < 2 && <ArrowRight className="h-3.5 w-3.5 text-blue-400" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.8 — Scoring Orbit9 */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.8</span>
          Wiring Orbit9 — Scoring Composite
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Comment la cartographie alimente le Matching Engine
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {[
              { composante: "Complementarite sectorielle", poids: "30%", desc: "Secteurs differents = score plus eleve (anti-cartel)", icon: Layers },
              { composante: "Alignement specialites", poids: "25%", desc: "Specialites croisees mais complementaires", icon: Target },
              { composante: "Proximite geographique", poids: "15%", desc: "Meme region = bonus collaboration", icon: MapPin },
              { composante: "Score VITAA", poids: "15%", desc: "Niveau de maturite business (0-100 par pilier)", icon: TrendingUp },
              { composante: "Potentiel d'innovation", poids: "15%", desc: "Technologies adoptees + projets en cours", icon: Microscope },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.composante} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <Icon className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-700">{c.composante}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{c.poids}</span>
                    </div>
                    <span className="text-[9px] text-gray-500">{c.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-3 bg-gray-50 border border-gray-200 mt-3">
          <div className="text-[9px] font-mono text-gray-600 text-center">
            Score_final = (0.30 x Sect) + (0.25 x Spec) + (0.15 x Geo) + (0.15 x VITAA) + (0.15 x Innov)
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.10 — Maturite Numerique 2019 vs 2025 (Orbit9 V2.5 + MEIE) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.10</span>
          Maturite Numerique — 2019 vs 2025
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Source: Etude REAI/Orbit9 (2019) vs Enquete MEIE/BIP (2025) — Evolution sur 6 ans
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-4">
            {MATURITE_COMPAREE.map((m) => (
              <div key={m.stade} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-700 flex-1">{m.stade}</span>
                  <Badge variant="outline" className="text-[9px]">{m.niveaux}</Badge>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                    m.evolution.startsWith("+") ? "bg-emerald-100 text-emerald-700" :
                    m.evolution.includes("21") ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  )}>{m.evolution}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <div className="text-[9px] text-gray-400 mb-1">2019 (Orbit9)</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", `bg-${m.color}-300`)} style={{ width: `${m.pct2019}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{m.pct2019}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 mb-1">2025 (MEIE)</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", `bg-${m.color}-500`)} style={{ width: `${m.pct2025}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{m.pct2025}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-gray-500">{m.insight}</p>
                <p className="text-[9px] text-gray-400 mt-1"><span className="font-bold">Besoins Orbit9:</span> {m.besoins}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-red-50 border-red-200 mt-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
            <div className="text-[9px] text-red-700">
              <span className="font-bold">Angle mort critique:</span> Seulement 14% des entreprises QC ont une interconnexion logicielle elevee (MEIE 2025). 39% n'ont AUCUNE interconnexion. 52% gerent encore l'info sur papier ou Excel. La double saisie manuelle reste la norme.
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.11 — Archetypes Manufacturiers (Orbit9 V2.5) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.11</span>
          Archetypes Manufacturiers
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Source: Orbit9 V2.5 Volet 3 — Modelisation predictive pour le Matching Engine
        </p>

        <div className="space-y-3">
          {ARCHETYPES.map((a) => (
            <Card key={a.nom} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold", `bg-${a.color}-100 text-${a.color}-700`)}>
                  {a.nom.charAt(0)}{a.nom.split(" ")[1]?.charAt(0) || ""}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-700">{a.nom}</span>
                    <Badge variant="outline" className="text-[9px]">{a.taille}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {a.traits.map((t) => (
                      <span key={t} className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", `bg-${a.color}-50 text-${a.color}-700`)}>{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] text-gray-400">VITAA:</span>
                    <span className="text-[9px] font-bold text-emerald-600">Force: {a.vitaaForce}</span>
                    <span className="text-[9px] font-bold text-red-500">Faiblesse: {a.vitaaFaiblesse}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 italic">{a.strategie}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-[9px] text-blue-700">
              <span className="font-bold">Orbit9 Matching:</span> Chaque membre se voit assigner dynamiquement un archetype (K-means) pour adapter la strategie de jumelage selon la resilience et la capacite de l'entreprise.
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.12 — Gaps Offre vs Demande (Orbit9 V2.5) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.12</span>
          Gaps Offre vs Demande
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Source: Orbit9 V2.5 Volet 3 — Frictions du marche manufacturier QC
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {GAPS_OFFRE_DEMANDE.map((g) => (
              <div key={g.categorie} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-700 flex-1">{g.categorie}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                    g.gap === "Critique" ? "bg-red-100 text-red-700" :
                    g.gap === "Eleve" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  )}>{g.gap}</span>
                </div>
                <div className="flex items-center gap-4 mb-1">
                  <span className="text-[9px] text-gray-500">Demande: <span className="font-bold text-blue-600">{g.demandePct}% (#{g.rangDemande})</span></span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                  <span className="text-[9px] text-gray-500">Offre locale: <span className="font-bold text-red-500">#{g.rangOffre}</span></span>
                </div>
                <p className="text-[9px] text-gray-400">{g.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Import Paradox */}
        <Card className="p-4 bg-amber-50 border-amber-200 mt-3">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <span className="text-xs font-bold text-amber-700">Paradoxe de l'Approvisionnement</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">63%</div>
              <div className="text-[9px] text-gray-600">Equipement lourd achete a l'etranger</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">83%</div>
              <div className="text-[9px] text-gray-600">Integration confiee a des firmes QC</div>
            </div>
          </div>
          <p className="text-[9px] text-amber-700">85% justifient l'import par l'absence d'expertise locale. 79% ont analyse l'offre QC avant. Orbit9 doit generer des maillages composes: fournisseur etranger (GearsHub) + integrateur QC (Usine Bleue).</p>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.13 — Dynamique Collaborative (Orbit9 V2.5) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.13</span>
          Dynamique Collaborative
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Source: Orbit9 V2.5 Volets 3 & 7 — Matrice des collaborations et criteres de selection
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Types de collaboration */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Types de Collaboration</h4>
            <div className="space-y-2">
              {COLLABORATION.map((c) => (
                <div key={c.type}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] text-gray-600 min-w-[130px]">{c.type}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-700 min-w-[28px] text-right">{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-2">Note: 53% des acteurs collaborent avec des concurrents directs (coopetition)</p>
          </Card>

          {/* Criteres de selection */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Criteres de Selection Fournisseur</h4>
            <div className="space-y-2">
              {CRITERES_SELECTION.map((c) => (
                <div key={c.critere}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] text-gray-600 min-w-[130px]">{c.critere}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-700 min-w-[28px] text-right">{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-2">Expertise technique = 4e seulement. Proximite et flexibilite priment.</p>
          </Card>
        </div>

        {/* Geographie des collaborations */}
        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-blue-700">Portee Geographique des Collaborations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-700">89%</div>
              <div className="text-[9px] text-blue-600">Quebec</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
            <div className="text-center">
              <div className="text-sm font-bold text-blue-700">45%</div>
              <div className="text-[9px] text-blue-600">Canada</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
            <div className="text-center">
              <div className="text-sm font-bold text-blue-700">43%</div>
              <div className="text-[9px] text-blue-600">International</div>
            </div>
            <span className="text-[9px] text-blue-500 ml-2">(71% chez les MGE)</span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* E.5.14 — Sources et mise a jour */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">E.5.14</span>
          Sources Citees (35+ references)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">Sources principales</span>
            </div>
            <div className="space-y-1 text-[9px] text-gray-600">
              <div>STIQ — Barometre industriel 16e edition (2025)</div>
              <div>MEIE — Enquete numerique manufacturier (2025)</div>
              <div>ISQ — Statistiques fabrication QC</div>
              <div>REAI — L'automatisation au Quebec (2024-2025)</div>
              <div>IFR — World Robotics Report (2024 & 2025)</div>
              <div>StatCan — Innovation, emploi, commerce</div>
              <div>FCEI — Transformation numerique PME (2025)</div>
              <div>Investissement Quebec — Rapport annuel 2024-25</div>
              <div>BDC — Etudes PME canadiennes</div>
              <div>Scale AI — Projets IA chaines approvisionnement</div>
              <div>Orbit9 V2.5 — Architecture de donnees (2026)</div>
              <div>REAI — Rapport fabrication de pointe QC (2019)</div>
              <div>KPMG — Working Capital Trends NA (2024)</div>
            </div>
          </Card>

          <Card className="p-3 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-xs font-bold text-orange-700">Mise a jour via Oracle9</span>
            </div>
            <div className="space-y-1 text-[9px] text-orange-600">
              <div>API CKAN (ISQ) — donnees manufacturieres auto</div>
              <div>API WDS StatCan (PIDs 8 chiffres)</div>
              <div>Web scraping: MEI, BDC, STIQ, Scale AI</div>
              <div>Micro-sondages CarlOS (donnees proprietaires)</div>
              <div>Enquetes trimestrielles reseau Orbit9</div>
              <div>Barometre Usine Bleue (annuel)</div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
