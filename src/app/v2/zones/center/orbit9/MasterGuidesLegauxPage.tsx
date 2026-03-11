/**
 * MasterGuidesLegauxPage.tsx — Guides d'Integration C-Level & Cadre Juridique QC/CA
 * Source: Bible-GHML-V2 Annexe K + Annexe I (Conformite) + Prompt 7 Deep Research (53K chars, 49 sources)
 * Master GHML — Session 48 + Enrichissement Session 49
 */

import {
  Scale, FileText, Shield, Users, Building2, AlertTriangle,
  CheckCircle2, BookOpen, Lock, Briefcase, Gavel,
  Globe, Languages, Brain, ShieldAlert, FileWarning,
  BadgeCheck, Eye, Database, UserCheck, Landmark,
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

const GUIDES = [
  { role: "CEO", bot: "BCO", size: "26,719 chars", status: "extracted", content: "5 piliers d'integration, cadre emploi QC, gouvernance, ESG", color: "bg-blue-50 text-blue-700" },
  { role: "CFO", bot: "BCF", size: "35,709 chars", status: "extracted", content: "NI 52-109, responsabilite personnelle ARC/RQ, fiducie presumee", color: "bg-emerald-50 text-emerald-700" },
  { role: "CTO", bot: "BCT", size: "~30,000 chars", status: "pending", content: "Conformite technique, PI, cybersecurite", color: "bg-violet-50 text-violet-700" },
  { role: "CMO", bot: "BCM", size: "~30,000 chars", status: "pending", content: "Loi 25 (marketing), Projet de loi 96 (langue), droit d'auteur", color: "bg-pink-50 text-pink-700" },
  { role: "CSO", bot: "BCS", size: "~30,000 chars", status: "pending", content: "Contrats commerciaux, concurrence, exportation", color: "bg-red-50 text-red-700" },
  { role: "COO", bot: "BOO", size: "~30,000 chars", status: "pending", content: "CNESST, normes manufacturieres, chaine d'approvisionnement", color: "bg-orange-50 text-orange-700" },
];

const CEO_PILIERS = [
  { num: 1, name: "Conformite", detail: "Cadre juridique, statut de cadre superieur (CNESST), obligations fiduciaires" },
  { num: 2, name: "Clarification", detail: "Vision strategique, KPIs, plan d'action annuel, cibles ESG" },
  { num: 3, name: "Culture", detail: "Immersion dans la culture organisationnelle, valeurs, dynamiques d'equipe" },
  { num: 4, name: "Connexion", detail: "Relations avec le C.A., actionnaires, partenaires cles, ecosysteme" },
  { num: 5, name: "Suivi retroactif", detail: "Mecanismes de retroaction, ajustements post-integration" },
];

const CEO_DOCS = [
  { type: "Documents Organiques", content: "Statuts, reglements, lettres patentes", importance: "Pouvoirs legaux" },
  { type: "Cadre de Gouvernance", content: "Charte du C.A., mandats des comites", importance: "Mecanismes supervision" },
  { type: "Ethique et Conformite", content: "Code de deontologie, politique de conflit", importance: "Standards moraux" },
  { type: "Registres Publics", content: "Etats financiers audites (3 ans), rapports", importance: "Trajectoire financiere" },
  { type: "Gouvernance Durable", content: "Rapports ESG, plans de decarbonation", importance: "Enjeux climatiques/sociaux" },
];

const CFO_CERTIF = [
  { obligation: "Fidelite de la presentation", nonPrecaire: "Obligatoire (Ann+Trim)", precaire: "Obligatoire (Ann+Trim)" },
  { obligation: "Conception des DC&P et ICFR", nonPrecaire: "Obligatoire et documentee", precaire: "Attestation de base" },
  { obligation: "Evaluation de l'efficacite", nonPrecaire: "Annuelle, dans le MD&A", precaire: "Non requise par defaut" },
  { obligation: "Divulgation faiblesses materielles", nonPrecaire: "Obligatoire immediatement", precaire: "Obligatoire si identifiee" },
];

const REGLEMENTATION_QC = [
  { loi: "Loi 25", desc: "Protection des donnees personnelles", impact: "Consentement, registre incidents, politique vie privee, responsable nomme" },
  { loi: "Projet de loi 96", desc: "Langue francaise au travail", impact: "Communications internes/externes, affichage, contrats, marketing" },
  { loi: "CNESST", desc: "Sante et securite au travail", impact: "Statut cadre superieur, obligations de l'employeur, regime d'indemnisation" },
  { loi: "ISO 9001:2015", desc: "Systeme de gestion de la qualite", impact: "Documentation processus, audits, amelioration continue, non-conformites" },
  { loi: "NI 52-109", desc: "Certification CEO/CFO des depots financiers", impact: "Responsabilite personnelle, sanctions administratives, poursuites penales" },
  { loi: "LIR art. 227.1", desc: "Responsabilite fiscale des administrateurs", impact: "Fiducie presumee ARC, super-priorite sur fonds retenus, defense de diligence" },
];

const ANTI_PATTERNS = [
  { name: "Syndrome du Document Fantome", desc: "Compliance theatre — manuels qualite volumineux pour les auditeurs, jamais utilises" },
  { name: "Copier-Coller Toxique", desc: "Templates irrealistes copies d'internet sans adaptation au contexte PME" },
  { name: "Amnesie des Reunions", desc: "Decisions non documentees, perdues apres la reunion" },
  { name: "Archipel Documentaire", desc: "Silos d'information entre departements — chacun a sa version" },
];

const MATURITE_PALIERS = [
  { palier: "SURVIE", period: "Mois 1-3", docs: "20-30 vitaux", desc: "Documents minimaux pour operer legalement et efficacement" },
  { palier: "MATURITE", period: "Mois 3-9", docs: "30-50", desc: "Standardisation, automatisation partielle, conformite complete" },
  { palier: "EXCELLENCE", period: "Mois 9-18", docs: "20-40 World Class", desc: "Documentation intelligente, auto-mise a jour, cascade automatique" },
];

const PROFILS_90 = [
  { role: "CEO", profils: "Jobs, Musk, Bezos, Nadella, Welch, Grove, Hastings, Walton, Kelleher, Nooyi, Schultz, Iacocca, Barra, Huang, Chesky" },
  { role: "CFO", profils: "Buffett, Porat (Google), Hood (Microsoft), Maestri (Apple), Munger, Dalio, Yellen, Lagarde, Dimon, Wood, Icahn, Graham, Malone, Peltz, Johnson" },
  { role: "CTO", profils: "15 profils (sur Google Drive)" },
  { role: "COO", profils: "15 profils (sur Google Drive)" },
  { role: "CMO", profils: "15 profils (sur Google Drive)" },
  { role: "CSO", profils: "15 profils (sur Google Drive)" },
];

// ======================================================================
// PROMPT 7 — DEEP RESEARCH DATA (Reglementation & Subventions)
// ======================================================================

const LOI25_OBLIGATIONS = [
  { obligation: "Portabilite des donnees", detail: "Obligatoire depuis sept. 2024 — format structure (API, JSON, CSV) sur demande", icon: Database },
  { obligation: "Transparence decisions automatisees", detail: "Informer la personne, expliquer raisons/facteurs/parametres, droit de correction", icon: Eye },
  { obligation: "EFVP obligatoire", detail: "Evaluation facteurs vie privee avant envoi donnees hors QC (serveurs ON/US)", icon: FileWarning },
  { obligation: "Anonymisation", detail: "Irreversible selon standards gouv. — obligatoire si reutilisation donnees", icon: Lock },
  { obligation: "Responsable PRP", detail: "PDG par defaut — si delegue, coordonnees publiees sur site corporatif", icon: UserCheck },
  { obligation: "Registre incidents", detail: "Obligatoire + notification CAI + personnes concernees si prejudice serieux", icon: ShieldAlert },
];

const LOI25_GHML_IMPACT = [
  { module: "Bot CHRO (RH)", type: "Renseignements personnels", loiApplique: true, detail: "Salaires (moy. 67,800$/an), performances, dossiers employes, roulement (seuil 8%/16%)" },
  { module: "Bot CFO (Finance)", type: "Donnees corporatives", loiApplique: false, detail: "CCC, DSO, DPO = donnees abstraites — hors portee des dispositions lourdes Loi 25" },
  { module: "Bot COO (Ops)", type: "Mixte", loiApplique: true, detail: "TRS/OEE, cadences — corporatif sauf si lie aux performances individuelles" },
];

const LOI96_POINTS = [
  { point: "Seuil abaisse a 25 employes", detail: "En vigueur 1er juin 2025 — inscription OQLF obligatoire (etait 50 employes)", badge: "CRITIQUE", badgeColor: "bg-red-50 text-red-700" },
  { point: "Nette predominance", detail: "Le texte francais doit etre au moins 2x plus grand/visible que toute autre langue", badge: "UI/UX", badgeColor: "bg-violet-50 text-violet-700" },
  { point: "Interface/docs/ToS en francais", detail: "Version anglaise acceptee SEULEMENT si version francaise d'egale ou superieure qualite", badge: "PRODUIT", badgeColor: "bg-blue-50 text-blue-700" },
  { point: "Representant = dirigeant interne", detail: "Art. 139.1 — membre de la direction avec pouvoir decisionnel reel (pas un cabinet externe)", badge: "GOUVERNANCE", badgeColor: "bg-amber-50 text-amber-700" },
  { point: "Amendes 3K-30K$/infraction", detail: "Majorations severes en cas de recidive + risque d'injonctions et listes publiques non-conformite", badge: "SANCTIONS", badgeColor: "bg-red-50 text-red-700" },
];

const EU_AI_ACT_CLASSIFICATION = [
  { bot: "CHRO", classification: "Haut Risque", annexe: "Annexe III", raison: "Emploi, recrutement, evaluation performances, conditions de travail", color: "bg-red-50 text-red-700 border-red-200" },
  { bot: "CFO", classification: "Potentiellement Haut Risque", annexe: "Annexe III", raison: "Evaluation credit, cote de solvabilite pour personnes physiques", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { bot: "CEO/CTO/CMO/CSO/COO", classification: "Risque Limite", annexe: "Usage general B2B", raison: "Aide a la decision strategique sans impact direct sur individus", color: "bg-green-50 text-green-700 border-green-200" },
];

const EU_AI_ACT_ARTICLES = [
  { article: "Art. 9", titre: "Gestion des risques", desc: "Processus continu et iteratif d'evaluation et d'attenuation" },
  { article: "Art. 10", titre: "Gouvernance des donnees", desc: "Qualite, representativite, absence de biais dans les jeux de donnees" },
  { article: "Art. 11-12", titre: "Documentation & Journalisation", desc: "Tracabilite complete et automatique des operations du systeme" },
  { article: "Art. 13", titre: "Transparence", desc: "Instructions d'utilisation claires aux deployeurs (clients)" },
  { article: "Art. 14", titre: "Supervision humaine", desc: "Permettre aux personnes physiques d'exercer une surveillance adequate" },
  { article: "Art. 15", titre: "Precision & Cybersecurite", desc: "Robustesse, precision des resultats, protection contre les attaques" },
];

const SOC2_BUDGET = [
  { poste: "Auditeurs externes (CPA)", cout: "12,000-25,000$", pctBudget: "30-40%", detail: "Audit formel Type II — firmes specialisees" },
  { poste: "Plateforme automatisation", cout: "~10,000$/an", pctBudget: "15-20%", detail: "Vanta ou Drata — monitoring continu conformite" },
  { poste: "Temps interne (perte d'opportunite)", cout: "Variable", pctBudget: "30-40%", detail: "10-14 semaines d'ingenierie — documentation processus + remediation" },
];

const TOP3_RISQUES = [
  {
    rang: 1,
    titre: "Non-conformite linguistique (Loi 96 / OQLF)",
    risque: "Seuil 25 employes au 1er juin 2025. Interface/docs/ToS sans nette predominance francaise = blocage reglementaire. Amendes jusqu'a 30K$/jour en recidive.",
    mitigation: "Audit linguistique exhaustif de la base de code. Identifier immediatement un dirigeant cle (haute direction avec pouvoir reel) pour sieger au comite de francisation — ne peut PAS etre externalise.",
    severite: "CRITIQUE",
    severiteColor: "bg-red-600",
  },
  {
    rang: 2,
    titre: "Requalification RS&DE par ARC (API IA = routine)",
    risque: "L'ARC considere les API commerciales (Anthropic, OpenAI) comme solutions standardisees. L'integration/appel d'API = pratique d'ingenierie courante, pas incertitude technologique.",
    mitigation: "Documenter les reclamations sur les incertitudes algorithmiques du GHML proprietaire et de la Trisociation — l'innovation reside dans le chef d'orchestre, PAS dans le modele fondamental.",
    severite: "ELEVE",
    severiteColor: "bg-amber-600",
  },
  {
    rang: 3,
    titre: "EU AI Act — Effet d'entrainement (CHRO/CFO Haut Risque)",
    risque: "Classification expresse des systemes IA emploi (CHRO) et solvabilite (CFO) comme Haut Risque Annexe III. Standard qui influencera les regulateurs canadiens post-C-27.",
    mitigation: "Capitaliser sur l'architecture deterministe du GHML — taxonomie tracable (220+ elements), explicabilite et supervision humaine (Art. 14) = fosse defensif vs concurrents horizontaux.",
    severite: "ELEVE",
    severiteColor: "bg-amber-600",
  },
];

const EO_ASSURANCE = [
  { fournisseur: "Beazley", couverture: "Jusqu'a 25M$ USD", specialite: "Institutions financieres/technologiques, startups IA" },
  { fournisseur: "Chubb", couverture: "Sur mesure", specialite: "Integrity by Chubb — responsabilite civile professionnelle" },
  { fournisseur: "Intact", couverture: "Standard CA", specialite: "Assurance responsabilite civile generale professionnels" },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterGuidesLegauxPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Guides Legaux & Integration C-Level"
        subtitle="Cadre juridique QC/CA + Loi 25 + Loi 96 + EU AI Act + SOC 2 + E&O + Top 3 Risques"
        gradient="from-slate-700 to-slate-500"
        icon={Scale}
      />

      {/* ── 6 Guides d'Integration ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.1</span>6 Guides d'Integration C-Level (~200K chars)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {GUIDES.map((g) => (
            <Card key={g.role} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("text-xs", g.color)}>{g.role}</Badge>
                <Badge variant="outline" className="text-xs font-mono">{g.bot}</Badge>
                <Badge className={cn("text-xs ml-auto", g.status === "extracted" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500")}>
                  {g.status === "extracted" ? "Extrait" : "Export 403"}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{g.content}</p>
              <p className="text-xs text-gray-400 mt-1">{g.size}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Guide CEO — 5 Piliers ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.2</span>Guide CEO — 5 Piliers d'Integration</h2>
        <div className="space-y-2">
          {CEO_PILIERS.map((p) => (
            <div key={p.num} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                {p.num}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500">{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Architecture documentaire CEO ── */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.2.1</span>Architecture Documentaire d'Accueil</h3>
        <div className="space-y-2">
          {CEO_DOCS.map((d) => (
            <Card key={d.type} className="p-3 flex items-start gap-3">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{d.type}</p>
                <p className="text-xs text-gray-500">{d.content}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">{d.importance}</Badge>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Guide CFO — NI 52-109 ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.3</span>Guide CFO — Certification NI 52-109</h2>
        <Card className="p-4 bg-amber-50/50 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-700">
              <strong>Responsabilite personnelle :</strong> En vertu de l'art. 227.1 LIR et art. 323 LTA, les administrateurs sont personnellement responsables des montants non verses (retenues sur paie, TPS/TVH). L'ARC possede une super-priorite sur ces fonds.
            </p>
          </div>
        </Card>
        <div className="space-y-2">
          {CFO_CERTIF.map((c) => (
            <Card key={c.obligation} className="p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">{c.obligation}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Non-Precaire</p>
                  <p className="text-xs text-gray-600">{c.nonPrecaire}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Precaire</p>
                  <p className="text-xs text-gray-600">{c.precaire}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Reglementation QC/CA (resume) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.4</span>Cadre Reglementaire Quebec / Canada</h2>
        <div className="space-y-2">
          {REGLEMENTATION_QC.map((r) => (
            <Card key={r.loi} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gavel className="h-4 w-4 text-gray-500 shrink-0" />
                <p className="text-sm font-medium text-gray-800">{r.loi}</p>
                <span className="text-xs text-gray-400">-- {r.desc}</span>
              </div>
              <p className="text-xs text-gray-600">{r.impact}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PROMPT 7 — DEEP RESEARCH : REGLEMENTATION DETAILLEE             */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      {/* ── LOI 25 — Obligations detaillees ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Shield className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Loi 25 — Protection des Renseignements Personnels</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-indigo-800">Amendes jusqu'a 25M$ ou 4% CA mondial</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Impact par module GHML */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Impact par module GhostX</h4>
              <div className="space-y-2">
                {LOI25_GHML_IMPACT.map((m) => (
                  <Card key={m.module} className={cn("p-3 border-l-[3px]", m.loiApplique ? "border-l-red-400 bg-red-50/30" : "border-l-green-400 bg-green-50/30")}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-800">{m.module}</p>
                      <Badge className={cn("text-[9px]", m.loiApplique ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                        {m.loiApplique ? "Loi 25 s'applique" : "Hors portee"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{m.type} — {m.detail}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* 6 Obligations */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">6 Obligations incompressibles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {LOI25_OBLIGATIONS.map((o) => (
                  <Card key={o.obligation} className="p-3 flex items-start gap-2">
                    <o.icon className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.obligation}</p>
                      <p className="text-xs text-gray-500">{o.detail}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Avantage GHML */}
            <Card className="p-3 bg-indigo-50/50 border-indigo-100">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-800">Avantage GHML : Tracabilite deterministe</p>
                  <p className="text-xs text-gray-600">Le protocole GHML permet d'isoler, retracer et expliquer la ponderation exacte (scoring VITAA) ayant conduit a une recommandation RH — evitant l'opacite illegale d'une boite noire probabiliste. Avantage concurrentiel asymetrique face aux LLM traditionnels.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── LOI 96 — Exigences linguistiques ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Languages className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Loi 96 — Charte de la Langue Francaise</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-blue-800">1er juin 2025</span>
          </div>
          <div className="p-4 space-y-3">
            {LOI96_POINTS.map((p) => (
              <Card key={p.point} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-800">{p.point}</p>
                  <Badge className={cn("text-[9px] ml-auto", p.badgeColor)}>{p.badge}</Badge>
                </div>
                <p className="text-xs text-gray-500">{p.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── EU AI Act — Classification Haut Risque ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Globe className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">EU AI Act — Classification & Conformite</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-purple-800">Pleinement applicable 2 aout 2026</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Classification par bot */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Classification par module GhostX</h4>
              <div className="space-y-2">
                {EU_AI_ACT_CLASSIFICATION.map((c) => (
                  <Card key={c.bot} className={cn("p-3 border", c.color)}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-800">Bot {c.bot}</p>
                      <Badge className={cn("text-[9px]", c.color)}>{c.classification}</Badge>
                      <span className="text-xs text-gray-400 ml-auto">{c.annexe}</span>
                    </div>
                    <p className="text-xs text-gray-500">{c.raison}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Articles 9-15 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Obligations Haut Risque (Chapitre III)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {EU_AI_ACT_ARTICLES.map((a) => (
                  <Card key={a.article} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[9px] font-mono">{a.article}</Badge>
                      <p className="text-sm font-medium text-gray-800">{a.titre}</p>
                    </div>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Avantage GHML */}
            <Card className="p-3 bg-purple-50/50 border-purple-100">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Avantage GHML : Fosse defensif reglementaire</p>
                  <p className="text-xs text-gray-600">La taxonomie GHML (220+ elements proprietaires) permet une cartographie precise de l'arbre decisionnel. Contrairement aux GPAI opaques, le GHML facilite l'evaluation de conformite (Conformity Assessment, Art. 43) requise par les autorites europeennes. Obstacle reglementaire transforme en avantage concurrentiel.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Bill C-27 / AIDA — Mort au feuilleton ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Landmark className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Bill C-27 / AIDA — Loi sur l'IA et les Donnees</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">MORT au feuilleton</span>
          </div>
          <div className="p-4 space-y-3">
            <Card className="p-3 bg-gray-50/50">
              <p className="text-sm text-gray-700 leading-relaxed">
                Le projet de loi C-27 (incluant la LIAD/AIDA) est officiellement <strong>mort au feuilleton</strong> suite a la prorogation parlementaire du 6 janvier 2025. Toutes les etudes du comite INDU ont ete interrompues.
              </p>
            </Card>
            <Card className="p-3 border-l-[3px] border-l-amber-400 bg-amber-50/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Aucune reglementation federale IA en vigueur au Canada (2026)</p>
                  <p className="text-xs text-gray-500 mt-1">La doctrine AIDA (responsabilite, attenuation biais, supervision humaine) reste le plan directeur futur. Approche concue pour etre interoperable avec l'EU AI Act et les normes NIST. Les modules decisionnels de GhostX seront ultimement traites comme systemes a incidence elevee.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Assurance E&O ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Briefcase className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Assurance Erreurs & Omissions (E&O)</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-teal-800">Responsabilite civile pro</span>
          </div>
          <div className="p-4 space-y-3">
            <Card className="p-3 bg-amber-50/30 border-l-[3px] border-l-amber-400">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Risque :</strong> Si un client applique les directives du bot CFO (ratio dette/equite 1.5-2.5) et subit des pertes, ou si le bot COO recommande un ajustement degradant le OTD (&gt;98% en aero/auto), la responsabilite de l'editeur peut etre invoquee.
              </p>
            </Card>

            <div className="space-y-2">
              {EO_ASSURANCE.map((a) => (
                <Card key={a.fournisseur} className="p-3 flex items-start gap-3">
                  <Shield className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-800">{a.fournisseur}</p>
                      <Badge variant="outline" className="text-[9px]">{a.couverture}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{a.specialite}</p>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-3 bg-teal-50/50 border-teal-100">
              <div className="flex items-start gap-2">
                <BadgeCheck className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-teal-800">Mitigation contractuelle obligatoire</p>
                  <p className="text-xs text-gray-600">Clauses de Limitation of Liability dans tous les contrats : GhostX fournit des modeles d'aide a la decision strategique — execution, validation et decision finale incombent exclusivement a la direction humaine de la PME.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── SOC 2 Type II ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-slate-600 to-zinc-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Lock className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">SOC 2 Type II — Cybersecurite & Conformite</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-slate-800">Exige par BDC/FTQ/Novacap</span>
          </div>
          <div className="p-4 space-y-4">
            {/* KPIs Budget */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-500">
                  <span className="text-sm font-bold text-white">Budget total</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-slate-600">50-80K$</div>
                  <div className="text-[9px] text-gray-500">Startup 5-25 employes</div>
                </div>
              </Card>
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-500">
                  <span className="text-sm font-bold text-white">Timeline</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-slate-600">6-9 mois</div>
                  <div className="text-[9px] text-gray-500">Observation 3-6 mois (Type II)</div>
                </div>
              </Card>
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-500">
                  <span className="text-sm font-bold text-white">Temps interne</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-slate-600">10-14 sem.</div>
                  <div className="text-[9px] text-gray-500">Depense cachee la plus importante</div>
                </div>
              </Card>
            </div>

            {/* Budget breakdown */}
            <div className="space-y-2">
              {SOC2_BUDGET.map((b) => (
                <Card key={b.poste} className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-800">{b.poste}</p>
                    <Badge variant="outline" className="text-[9px] ml-auto">{b.pctBudget}</Badge>
                    <Badge className="text-[9px] bg-slate-50 text-slate-700">{b.cout}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{b.detail}</p>
                </Card>
              ))}
            </div>

            <Card className="p-3 bg-slate-50/50 border-slate-100">
              <p className="text-xs text-gray-600">
                <strong>Exigence marchee :</strong> BDC, Novacap, FTQ et CDPQ exigent SOC 2 Type II de maniere quasi systematique avant tout deploiement SaaS B2B dans leur portefeuille. Standard de facto de l'industrie.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── TOP 3 RISQUES REGLEMENTAIRES ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <AlertTriangle className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Top 3 Risques Reglementaires (Horizon 12-24 mois)</span>
          </div>
          <div className="p-4 space-y-4">
            {TOP3_RISQUES.map((r) => (
              <Card key={r.rang} className="overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b">
                  <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white", r.severiteColor)}>
                    {r.rang}
                  </span>
                  <p className="text-sm font-bold text-gray-800">{r.titre}</p>
                  <Badge className={cn("text-[9px] ml-auto", r.severite === "CRITIQUE" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>
                    {r.severite}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Risque</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{r.risque}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Mitigation</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{r.mitigation}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── 4 Anti-Patterns + 3 Paliers Maturite ── */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.5.1</span>4 Anti-Patterns Endemiques en Manufacture</h3>
          <div className="space-y-2">
            {ANTI_PATTERNS.map((a) => (
              <Card key={a.name} className="p-3">
                <p className="text-sm font-medium text-gray-800">{a.name}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.5.2</span>3 Paliers de Maturite Documentaire</h3>
          <div className="space-y-2">
            {MATURITE_PALIERS.map((p) => (
              <Card key={p.palier} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{p.palier}</Badge>
                  <span className="text-xs text-gray-400">{p.period} -- {p.docs} docs</span>
                </div>
                <p className="text-xs text-gray-600">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── 90 Profils GhostX ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.4.6</span>{"90 Profils GhostX — Expansion 12 → 90"}</h2>
        <p className="text-sm text-gray-500 mb-4">15 profils par role C-Level, chacun avec : OS Mental, Philosophie, Patterns Decisionnels, Question Signature.</p>
        <div className="space-y-2">
          {PROFILS_90.map((p) => (
            <Card key={p.role} className="p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">{p.role} — 15 profils</p>
              <p className="text-xs text-gray-600">{p.profils}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : Bible-GHML-V2 Annexe K -- Annexe I -- 6 Guides C-Level (~200K chars) --
          NI 52-109 -- LIR art. 227.1 -- Loi 25 (CAI) -- Loi 96 (OQLF) -- EU AI Act Annexe III --
          Bill C-27/AIDA -- SOC 2 Type II (Cavanex/CyberArrow) -- E&O (Beazley/Chubb/Intact) --
          Prompt 7 Deep Research (53K chars, 49 sources)
        </p>
      </div>
    </PageLayout>
  );
}
