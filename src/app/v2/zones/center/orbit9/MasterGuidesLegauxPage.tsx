/**
 * MasterGuidesLegauxPage.tsx — Guides d'Intégration C-Level & Cadre Juridique QC/CA
 * Source: Bible-GHML-V2 Annexe K + Annexe I (Conformité)
 * Master GHML — Session 48
 */

import {
  Scale, FileText, Shield, Users, Building2, AlertTriangle,
  CheckCircle2, BookOpen, Lock, Briefcase, Gavel,
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
  { role: "CEO", bot: "BCO", size: "26,719 chars", status: "extracted", content: "5 piliers d'intégration, cadre emploi QC, gouvernance, ESG", color: "bg-blue-50 text-blue-700" },
  { role: "CFO", bot: "BCF", size: "35,709 chars", status: "extracted", content: "NI 52-109, responsabilité personnelle ARC/RQ, fiducie présumée", color: "bg-emerald-50 text-emerald-700" },
  { role: "CTO", bot: "BCT", size: "~30,000 chars", status: "pending", content: "Conformité technique, PI, cybersécurité", color: "bg-violet-50 text-violet-700" },
  { role: "CMO", bot: "BCM", size: "~30,000 chars", status: "pending", content: "Loi 25 (marketing), Projet de loi 96 (langue), droit d'auteur", color: "bg-pink-50 text-pink-700" },
  { role: "CSO", bot: "BCS", size: "~30,000 chars", status: "pending", content: "Contrats commerciaux, concurrence, exportation", color: "bg-red-50 text-red-700" },
  { role: "COO", bot: "BOO", size: "~30,000 chars", status: "pending", content: "CNESST, normes manufacturières, chaîne d'approvisionnement", color: "bg-orange-50 text-orange-700" },
];

const CEO_PILIERS = [
  { num: 1, name: "Conformité", detail: "Cadre juridique, statut de cadre supérieur (CNESST), obligations fiduciaires" },
  { num: 2, name: "Clarification", detail: "Vision stratégique, KPIs, plan d'action annuel, cibles ESG" },
  { num: 3, name: "Culture", detail: "Immersion dans la culture organisationnelle, valeurs, dynamiques d'équipe" },
  { num: 4, name: "Connexion", detail: "Relations avec le C.A., actionnaires, partenaires clés, écosystème" },
  { num: 5, name: "Suivi rétroactif", detail: "Mécanismes de rétroaction, ajustements post-intégration" },
];

const CEO_DOCS = [
  { type: "Documents Organiques", content: "Statuts, règlements, lettres patentes", importance: "Pouvoirs légaux" },
  { type: "Cadre de Gouvernance", content: "Charte du C.A., mandats des comités", importance: "Mécanismes supervision" },
  { type: "Éthique et Conformité", content: "Code de déontologie, politique de conflit", importance: "Standards moraux" },
  { type: "Registres Publics", content: "États financiers audités (3 ans), rapports", importance: "Trajectoire financière" },
  { type: "Gouvernance Durable", content: "Rapports ESG, plans de décarbonation", importance: "Enjeux climatiques/sociaux" },
];

const CFO_CERTIF = [
  { obligation: "Fidélité de la présentation", nonPrecaire: "Obligatoire (Ann+Trim)", precaire: "Obligatoire (Ann+Trim)" },
  { obligation: "Conception des DC&P et ICFR", nonPrecaire: "Obligatoire et documentée", precaire: "Attestation de base" },
  { obligation: "Évaluation de l'efficacité", nonPrecaire: "Annuelle, dans le MD&A", precaire: "Non requise par défaut" },
  { obligation: "Divulgation faiblesses matérielles", nonPrecaire: "Obligatoire immédiatement", precaire: "Obligatoire si identifiée" },
];

const REGLEMENTATION_QC = [
  { loi: "Loi 25", desc: "Protection des données personnelles", impact: "Consentement, registre incidents, politique vie privée, responsable nommé" },
  { loi: "Projet de loi 96", desc: "Langue française au travail", impact: "Communications internes/externes, affichage, contrats, marketing" },
  { loi: "CNESST", desc: "Santé et sécurité au travail", impact: "Statut cadre supérieur, obligations de l'employeur, régime d'indemnisation" },
  { loi: "ISO 9001:2015", desc: "Système de gestion de la qualité", impact: "Documentation processus, audits, amélioration continue, non-conformités" },
  { loi: "NI 52-109", desc: "Certification CEO/CFO des dépôts financiers", impact: "Responsabilité personnelle, sanctions administratives, poursuites pénales" },
  { loi: "LIR art. 227.1", desc: "Responsabilité fiscale des administrateurs", impact: "Fiducie présumée ARC, super-priorité sur fonds retenus, défense de diligence" },
];

const ANTI_PATTERNS = [
  { name: "Syndrome du Document Fantôme", desc: "Compliance théâtre — manuels qualité volumineux pour les auditeurs, jamais utilisés" },
  { name: "Copier-Coller Toxique", desc: "Templates irréalistes copiés d'internet sans adaptation au contexte PME" },
  { name: "Amnésie des Réunions", desc: "Décisions non documentées, perdues après la réunion" },
  { name: "Archipel Documentaire", desc: "Silos d'information entre départements — chacun a sa version" },
];

const MATURITE_PALIERS = [
  { palier: "SURVIE", period: "Mois 1-3", docs: "20-30 vitaux", desc: "Documents minimaux pour opérer légalement et efficacement" },
  { palier: "MATURITÉ", period: "Mois 3-9", docs: "30-50", desc: "Standardisation, automatisation partielle, conformité complète" },
  { palier: "EXCELLENCE", period: "Mois 9-18", docs: "20-40 World Class", desc: "Documentation intelligente, auto-mise à jour, cascade automatique" },
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
// COMPOSANT
// ======================================================================

export default function MasterGuidesLegauxPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Guides Légaux & Intégration C-Level"
        subtitle="Cadre juridique QC/CA × 6 guides C-Level × 90 profils GhostX × Conformité"
        gradient="from-slate-700 to-slate-500"
        icon={<Scale className="h-5 w-5" />}
      />

      {/* ── 6 Guides d'Intégration ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">6 Guides d'Intégration C-Level (~200K chars)</h2>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Guide CEO — 5 Piliers d'Intégration</h2>
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
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Architecture Documentaire d'Accueil</h3>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Guide CFO — Certification NI 52-109</h2>
        <Card className="p-4 bg-amber-50/50 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-700">
              <strong>Responsabilité personnelle :</strong> En vertu de l'art. 227.1 LIR et art. 323 LTA, les administrateurs sont personnellement responsables des montants non versés (retenues sur paie, TPS/TVH). L'ARC possède une super-priorité sur ces fonds.
            </p>
          </div>
        </Card>
        <div className="space-y-2">
          {CFO_CERTIF.map((c) => (
            <Card key={c.obligation} className="p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">{c.obligation}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Non-Précaire</p>
                  <p className="text-xs text-gray-600">{c.nonPrecaire}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Précaire</p>
                  <p className="text-xs text-gray-600">{c.precaire}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Réglementation QC/CA ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cadre Réglementaire Québec / Canada</h2>
        <div className="space-y-2">
          {REGLEMENTATION_QC.map((r) => (
            <Card key={r.loi} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gavel className="h-4 w-4 text-gray-500 shrink-0" />
                <p className="text-sm font-medium text-gray-800">{r.loi}</p>
                <span className="text-xs text-gray-400">— {r.desc}</span>
              </div>
              <p className="text-xs text-gray-600">{r.impact}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 4 Anti-Patterns + 3 Paliers Maturité ── */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">4 Anti-Patterns Endémiques en Manufacture</h3>
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
          <h3 className="text-sm font-semibold text-gray-800 mb-3">3 Paliers de Maturité Documentaire</h3>
          <div className="space-y-2">
            {MATURITE_PALIERS.map((p) => (
              <Card key={p.palier} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{p.palier}</Badge>
                  <span className="text-xs text-gray-400">{p.period} · {p.docs} docs</span>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">90 Profils GhostX — Expansion 12 → 90</h2>
        <p className="text-sm text-gray-500 mb-4">15 profils par rôle C-Level, chacun avec : OS Mental, Philosophie, Patterns Décisionnels, Question Signature.</p>
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
          Sources : Bible-GHML-V2 Annexe K · Annexe I · 6 Guides C-Level (~200K chars) ·
          NI 52-109 · LIR art. 227.1 · Loi 25 · CNESST · 90 Profils GhostX
        </p>
      </div>
    </PageLayout>
  );
}
