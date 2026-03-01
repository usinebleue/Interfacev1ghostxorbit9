/**
 * EspaceBureauView.tsx — Mon Espace Bureau (canevas central)
 * 5 sous-sections: Idees, Projets, Documents, Outils, Taches
 * Pattern: Orbit9DetailView (sub-tabs dans header)
 * Sprint B — Mon Espace Bureau
 */

import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  FolderKanban,
  FileText,
  Wrench,
  CheckSquare,
  Briefcase,
  Search,
  Plus,
  Upload,
  Clock,
  Bot,
  Filter,
  AlertCircle,
  Loader2,
  Timer,
  CheckCircle2,
  File,
  FileSpreadsheet,
  FileImage,
  Tag,
  LayoutGrid,
  List,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EspaceSection } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
import { BOT_AVATAR } from "../../api/types";

// ── Sub-tabs config (pattern Orbit9DetailView) ──

const ESPACE_TABS: { id: EspaceSection; label: string; icon: React.ElementType }[] = [
  { id: "idees", label: "Idees", icon: Sparkles },
  { id: "projets", label: "Projets", icon: FolderKanban },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "outils", label: "Outils", icon: Wrench },
  { id: "taches", label: "Taches", icon: CheckSquare },
];

// ── Mock Data ──

const MOCK_PROJETS = [
  { id: "p1", titre: "Expansion Ontario", description: "Strategie de penetration du marche ontarien pour les services manufacturiers", status: "En cours", bot: "BCS", date: "2026-02-27", tags: ["en-cours", "strategie"] },
  { id: "p2", titre: "Nouveau produit composite", description: "Developpement d'un produit composite innovant pour le secteur aeronautique", status: "Planifie", bot: "BPO", date: "2026-02-25", tags: ["planifie", "innovation"] },
  { id: "p3", titre: "Migration ERP", description: "Migration du systeme ERP legacy vers une solution cloud moderne", status: "En attente", bot: "BCT", date: "2026-02-20", tags: ["en-attente", "technologie"] },
  { id: "p4", titre: "Certification ISO 9001", description: "Mise a jour de la certification qualite pour 2026", status: "En cours", bot: "BOO", date: "2026-02-18", tags: ["en-cours", "operations"] },
  { id: "p5", titre: "Programme ambassadeurs", description: "Lancer un programme d'ambassadeurs clients pour le referral", status: "Planifie", bot: "BCM", date: "2026-02-15", tags: ["planifie", "marketing"] },
  { id: "p6", titre: "Optimisation cashflow Q2", description: "Restructuration des termes de paiement fournisseurs", status: "En cours", bot: "BCF", date: "2026-02-22", tags: ["en-cours", "finance"] },
];

const MOCK_OUTILS = [
  { id: "o1", titre: "Calculateur ROI", description: "Estimer le retour sur investissement d'un projet", bot: "BCF", tags: ["calculateur", "finance"] },
  { id: "o2", titre: "Estimateur TRS/OEE", description: "Taux de rendement synthetique pour ligne de production", bot: "BFA", tags: ["calculateur", "operations"] },
  { id: "o3", titre: "Generateur de pitch", description: "Creer un pitch deck structure en 5 minutes", bot: "BCM", tags: ["template", "marketing"] },
  { id: "o4", titre: "Analyseur de contrat", description: "Scanner et analyser les clauses d'un contrat", bot: "BLE", tags: ["connecteur", "legal"] },
  { id: "o5", titre: "Simulateur prix", description: "Modeliser l'impact d'un changement de pricing", bot: "BRO", tags: ["calculateur", "vente"] },
  { id: "o6", titre: "Audit securite IA", description: "Evaluation rapide de la posture securite IA", bot: "BSE", tags: ["template", "securite"] },
];

// Documents mock data
const MOCK_DOCUMENTS_GENERES = [
  { id: "dg1", titre: "Rapport strategique — Expansion Ontario", type: "PDF", date: "2026-02-27", bot: "BCS", taille: "2.4 MB" },
  { id: "dg2", titre: "Analyse financiere Q1 2026", type: "XLSX", date: "2026-02-26", bot: "BCF", taille: "1.1 MB" },
  { id: "dg3", titre: "Plan marketing digital 2026", type: "PDF", date: "2026-02-24", bot: "BCM", taille: "3.2 MB" },
  { id: "dg4", titre: "Wrap-up — Session strategie", type: "PDF", date: "2026-02-23", bot: "BCO", taille: "890 KB" },
  { id: "dg5", titre: "Benchmark concurrentiel secteur", type: "PDF", date: "2026-02-20", bot: "BCS", taille: "4.1 MB" },
];

const MOCK_TEMPLATES = [
  { id: "tv1", categorie: "Vente", items: ["Soumission commerciale", "Proposition de valeur", "Pipeline review"] },
  { id: "tv2", categorie: "Finance", items: ["Budget previsionnel", "Analyse ROI", "Rapport financier", "Cashflow"] },
  { id: "tv3", categorie: "Strategie", items: ["Plan strategique", "Analyse SWOT", "Matrice BCG", "Benchmark"] },
  { id: "tv4", categorie: "Marketing", items: ["Brief marketing", "Plan contenu", "Campagne", "Persona client"] },
  { id: "tv5", categorie: "Operations", items: ["Plan d'action", "Audit processus", "SOP", "Checklist qualite"] },
  { id: "tv6", categorie: "RH", items: ["Fiche de poste", "Plan formation", "Evaluation", "Onboarding"] },
  { id: "tv7", categorie: "Legal", items: ["NDA", "Contrat service", "Conditions generales", "Politique interne"] },
  { id: "tv8", categorie: "Innovation", items: ["Cahier des charges", "Brief R&D", "Fiche projet", "Rapport veille"] },
  { id: "tv9", categorie: "Diagnostic", items: ["Diagnostic IA", "Securite", "Robotique", "Logistique", "Energie"] },
];

const MOCK_IMPORTES = [
  { id: "di1", titre: "Contrat fournisseur ABC", type: "PDF", taille: "1.2 MB", date: "2026-02-25", tags: ["contrat", "fournisseur"] },
  { id: "di2", titre: "Etats financiers 2025", type: "XLSX", taille: "3.8 MB", date: "2026-02-20", tags: ["finance", "annuel"] },
  { id: "di3", titre: "Photos usine renovation", type: "ZIP", taille: "45 MB", date: "2026-02-18", tags: ["operations", "photos"] },
  { id: "di4", titre: "Organigramme 2026", type: "PDF", taille: "520 KB", date: "2026-02-15", tags: ["rh", "organisation"] },
];

// Taches mock data
const MOCK_TACHES = [
  { id: "t1", titre: "Valider soumission ABC Corp", bot: "BCF", deadline: "Aujourd'hui", priorite: "urgente" as const, status: "urgente" as const },
  { id: "t2", titre: "Approuver budget automatisation", bot: "BCF", deadline: "Aujourd'hui", priorite: "urgente" as const, status: "urgente" as const },
  { id: "t3", titre: "Analyser stack technique candidat", bot: "BCT", deadline: "En cours", priorite: "moyenne" as const, status: "en-cours" as const },
  { id: "t4", titre: "Rediger plan contenu LinkedIn Q2", bot: "BCM", deadline: "En cours", priorite: "moyenne" as const, status: "en-cours" as const },
  { id: "t5", titre: "Preparer brief acquisition", bot: "BCS", deadline: "En cours", priorite: "haute" as const, status: "en-cours" as const },
  { id: "t6", titre: "Revoir contrat fournisseur XYZ", bot: "BLE", deadline: "Demain", priorite: "moyenne" as const, status: "en-attente" as const },
  { id: "t7", titre: "Approuver budget formation Q2", bot: "BHR", deadline: "5 mars", priorite: "basse" as const, status: "en-attente" as const },
  { id: "t8", titre: "Mettre a jour pricing Q2", bot: "BRO", deadline: "3 mars", priorite: "moyenne" as const, status: "en-attente" as const },
  { id: "t9", titre: "Rapport ROI automatisation", bot: "BCF", deadline: "Complete", priorite: "haute" as const, status: "completee" as const },
  { id: "t10", titre: "Audit securite IT Q1", bot: "BSE", deadline: "Complete", priorite: "haute" as const, status: "completee" as const },
  { id: "t11", titre: "Plan marketing Q1 valide", bot: "BCM", deadline: "Complete", priorite: "moyenne" as const, status: "completee" as const },
];

// ── Tag color helper ──

const TAG_COLORS: Record<string, string> = {
  "en-cours": "bg-blue-100 text-blue-700",
  "planifie": "bg-amber-100 text-amber-700",
  "termine": "bg-green-100 text-green-700",
  "en-attente": "bg-gray-100 text-gray-600",
  "strategie": "bg-indigo-100 text-indigo-700",
  "innovation": "bg-violet-100 text-violet-700",
  "technologie": "bg-cyan-100 text-cyan-700",
  "operations": "bg-orange-100 text-orange-700",
  "marketing": "bg-pink-100 text-pink-700",
  "finance": "bg-emerald-100 text-emerald-700",
  "brainstorm": "bg-amber-100 text-amber-700",
  "credo": "bg-blue-100 text-blue-700",
  "calculateur": "bg-emerald-100 text-emerald-700",
  "connecteur": "bg-cyan-100 text-cyan-700",
  "template": "bg-violet-100 text-violet-700",
  "export": "bg-gray-100 text-gray-600",
  "vente": "bg-green-100 text-green-700",
  "legal": "bg-indigo-100 text-indigo-700",
  "securite": "bg-red-100 text-red-700",
  "contrat": "bg-indigo-100 text-indigo-700",
  "fournisseur": "bg-orange-100 text-orange-700",
  "annuel": "bg-blue-100 text-blue-700",
  "photos": "bg-pink-100 text-pink-700",
  "rh": "bg-teal-100 text-teal-700",
  "organisation": "bg-purple-100 text-purple-700",
};

const TEMPLATE_COLORS: Record<string, string> = {
  "Vente": "from-green-600 to-green-500",
  "Finance": "from-emerald-600 to-emerald-500",
  "Strategie": "from-blue-600 to-blue-500",
  "Marketing": "from-pink-600 to-pink-500",
  "Operations": "from-orange-600 to-orange-500",
  "RH": "from-teal-600 to-teal-500",
  "Legal": "from-indigo-600 to-indigo-500",
  "Innovation": "from-violet-600 to-violet-500",
  "Diagnostic": "from-cyan-600 to-cyan-500",
};

const FILE_ICONS: Record<string, React.ElementType> = {
  "PDF": FileText,
  "XLSX": FileSpreadsheet,
  "ZIP": File,
  "DOC": FileText,
  "IMG": FileImage,
};

// ══════════════════════════════════════════
// BANDEAU PROACTIF CarlOS
// ══════════════════════════════════════════

function BandeauProactif({ message, section }: { message: string; section: EspaceSection }) {
  const sectionColors: Record<EspaceSection, string> = {
    idees: "from-amber-500 to-orange-500",
    projets: "from-blue-500 to-indigo-500",
    documents: "from-green-500 to-emerald-500",
    outils: "from-orange-500 to-red-500",
    taches: "from-purple-500 to-violet-500",
  };

  return (
    <div className={cn("bg-gradient-to-r rounded-xl p-3 flex items-center gap-3", sectionColors[section])}>
      <img
        src={BOT_AVATAR["BCO"]}
        alt="CarlOS"
        className="w-8 h-8 rounded-full ring-2 ring-white/30 shrink-0"
      />
      <p className="text-xs text-white/90 flex-1">{message}</p>
      <button className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0">
        Explorer
      </button>
    </div>
  );
}

// ══════════════════════════════════════════
// BARRE DE RECHERCHE + FILTRE
// ══════════════════════════════════════════

function SearchBar({ placeholder, viewMode, onToggleView }: { placeholder: string; viewMode: "grid" | "list"; onToggleView: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
      <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
        <Filter className="h-3.5 w-3.5" />
        Filtrer
      </button>
      {/* Toggle grille / liste */}
      <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => viewMode !== "grid" && onToggleView()}
          className={cn(
            "p-2 transition-colors cursor-pointer",
            viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          )}
          title="Vue grille"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => viewMode !== "list" && onToggleView()}
          className={cn(
            "p-2 transition-colors cursor-pointer",
            viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          )}
          title="Vue liste"
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// LISTING PAGE (Idees, Projets, Outils)
// ══════════════════════════════════════════

function ListingPage({ section }: { section: EspaceSection }) {
  const { crystals } = useChatContext();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const configs: Record<string, { color: string; headerGradient: string; items: { id: string; titre: string; description?: string; bot?: string; date?: string; tags: string[] }[] }> = {
    idees: {
      color: "amber",
      headerGradient: "from-amber-600 to-amber-500",
      items: crystals.map(c => ({
        id: c.id,
        titre: c.titre,
        description: c.contenu.slice(0, 120),
        bot: c.bot,
        date: new Date(c.date).toLocaleDateString("fr-CA"),
        tags: [c.mode || "brainstorm"],
      })),
    },
    projets: {
      color: "blue",
      headerGradient: "from-blue-600 to-blue-500",
      items: MOCK_PROJETS.map(p => ({
        id: p.id,
        titre: p.titre,
        description: p.description,
        bot: p.bot,
        date: p.date,
        tags: p.tags,
      })),
    },
    outils: {
      color: "orange",
      headerGradient: "from-orange-600 to-orange-500",
      items: MOCK_OUTILS.map(o => ({
        id: o.id,
        titre: o.titre,
        description: o.description,
        bot: o.bot,
        tags: o.tags,
      })),
    },
  };

  const config = configs[section];
  if (!config) return null;

  const bandeauMessages: Record<string, string> = {
    idees: crystals.length > 0
      ? `${crystals.length} idee${crystals.length > 1 ? "s" : ""} cristallisee${crystals.length > 1 ? "s" : ""} depuis vos conversations. Explorez ou relancez un sujet.`
      : "Cristallisez des reponses de CarlOS pour les retrouver ici. Cliquez sur l'icone cristal dans le LiveChat.",
    projets: `${MOCK_PROJETS.length} projets en cours. 2 necessitent votre attention cette semaine.`,
    outils: `${MOCK_OUTILS.length} outils disponibles. Utilisez-les directement dans le LiveChat.`,
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
      <BandeauProactif message={bandeauMessages[section]} section={section} />
      <SearchBar
        placeholder={`Rechercher dans ${section === "idees" ? "les idees" : section === "projets" ? "les projets" : "les outils"}...`}
        viewMode={viewMode}
        onToggleView={() => setViewMode(v => v === "grid" ? "list" : "grid")}
      />

      {config.items.length === 0 ? (
        <div className="text-center py-12">
          <div className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-gray-100")}>
            <Sparkles className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Aucun element pour l'instant</p>
          <p className="text-xs text-gray-400 mt-1">Les elements apparaitront ici au fil de vos conversations</p>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Vue grille ── */
        <div className="grid grid-cols-3 gap-2.5">
          {config.items.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className={cn("px-3 py-2 bg-gradient-to-r", config.headerGradient)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {section === "idees" && <Sparkles className="h-3.5 w-3.5 text-white" />}
                    {section === "projets" && <FolderKanban className="h-3.5 w-3.5 text-white" />}
                    {section === "outils" && <Wrench className="h-3.5 w-3.5 text-white" />}
                    <span className="text-[10px] font-medium text-white/80 uppercase">{section.slice(0, -1)}</span>
                  </div>
                  {item.bot && (
                    <Badge className="text-[9px] bg-white/20 text-white border-0">{item.bot}</Badge>
                  )}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-bold text-gray-800 truncate">{item.titre}</h3>
                {item.description && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>
                      {tag}
                    </span>
                  ))}
                </div>
                {item.date && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                    <Clock className="h-3 w-3" />
                    {item.date}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* ── Vue liste ── */
        <div className="space-y-1.5">
          {config.items.map((item) => {
            const SectionIcon = section === "idees" ? Sparkles : section === "projets" ? FolderKanban : Wrench;
            const iconBg = section === "idees" ? "bg-amber-50" : section === "projets" ? "bg-blue-50" : "bg-orange-50";
            const iconColor = section === "idees" ? "text-amber-600" : section === "projets" ? "text-blue-600" : "text-orange-600";
            return (
              <Card key={item.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
                    <SectionIcon className={cn("h-4 w-4", iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-800 truncate">{item.titre}</h3>
                    {item.description && (
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.tags.map((tag) => (
                      <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {item.bot && (
                    <Badge variant="outline" className="text-[9px] shrink-0">{item.bot}</Badge>
                  )}
                  {item.date && (
                    <span className="text-[10px] text-gray-400 shrink-0">{item.date}</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// DOCUMENTS PAGE (3 volets)
// ══════════════════════════════════════════

function DocumentsPage() {
  const [docTab, setDocTab] = useState<"generes" | "templates" | "importes">("generes");

  const DOC_TABS = [
    { id: "generes" as const, label: "Mes Documents" },
    { id: "templates" as const, label: "Templates" },
    { id: "importes" as const, label: "Importes" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
      <BandeauProactif
        message={`${MOCK_DOCUMENTS_GENERES.length} documents generes, ${MOCK_TEMPLATES.reduce((a, t) => a + t.items.length, 0)} templates disponibles. Generez un nouveau document depuis le LiveChat.`}
        section="documents"
      />

      {/* Sub-tabs internes — meme pattern */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {DOC_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDocTab(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              docTab === tab.id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mes Documents */}
      {docTab === "generes" && (
        <div className="space-y-2">
          {MOCK_DOCUMENTS_GENERES.map((doc) => {
            const FIcon = FILE_ICONS[doc.type] || FileText;
            return (
              <Card key={doc.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <FIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-800 truncate">{doc.titre}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400">{doc.type}</span>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] text-gray-400">{doc.taille}</span>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] text-gray-400">{doc.date}</span>
                    </div>
                  </div>
                  <Badge className="text-[9px] bg-green-50 text-green-700 border-green-200" variant="outline">{doc.bot}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Templates */}
      {docTab === "templates" && (
        <div className="space-y-3">
          {MOCK_TEMPLATES.map((cat) => (
            <Card key={cat.id} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", TEMPLATE_COLORS[cat.categorie] || "from-gray-600 to-gray-500")}>
                <FileText className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{cat.categorie}</span>
                <Badge className="text-[9px] bg-white/20 text-white border-0 ml-auto">{cat.items.length}</Badge>
              </div>
              <div className="p-2.5">
                <div className="grid grid-cols-2 gap-1.5">
                  {cat.items.map((item) => (
                    <button
                      key={item}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
                    >
                      <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-700 truncate">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Importes */}
      {docTab === "importes" && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">Glissez vos fichiers ici</p>
            <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, XLSX, images — max 50 MB</p>
          </div>

          {/* Liste fichiers */}
          <div className="space-y-2">
            {MOCK_IMPORTES.map((doc) => {
              const FIcon = FILE_ICONS[doc.type] || File;
              return (
                <Card key={doc.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-800 truncate">{doc.titre}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{doc.type}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400">{doc.taille}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400">{doc.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {doc.tags.map((tag) => (
                        <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// TACHES PAGE (4 widgets grille)
// ══════════════════════════════════════════

function TachesPage() {
  const urgentes = MOCK_TACHES.filter(t => t.status === "urgente");
  const enCours = MOCK_TACHES.filter(t => t.status === "en-cours");
  const enAttente = MOCK_TACHES.filter(t => t.status === "en-attente");
  const completees = MOCK_TACHES.filter(t => t.status === "completee");

  const widgets = [
    { title: "Urgentes", icon: AlertCircle, gradient: "from-red-600 to-red-500", items: urgentes, borderColor: "border-l-red-400" },
    { title: "En cours", icon: Loader2, gradient: "from-blue-600 to-blue-500", items: enCours, borderColor: "border-l-blue-400" },
    { title: "En attente", icon: Timer, gradient: "from-amber-600 to-amber-500", items: enAttente, borderColor: "border-l-amber-400" },
    { title: "Completees", icon: CheckCircle2, gradient: "from-green-600 to-green-500", items: completees, borderColor: "border-l-green-400" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
      <BandeauProactif
        message={`${urgentes.length} tache${urgentes.length > 1 ? "s" : ""} urgente${urgentes.length > 1 ? "s" : ""}, ${enAttente.length} en attente de validation. ${enCours.length} tache${enCours.length > 1 ? "s" : ""} en cours par vos bots.`}
        section="taches"
      />

      <div className="grid grid-cols-4 gap-3">
        {widgets.map((w) => {
          const WIcon = w.icon;
          return (
            <Card key={w.title} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", w.gradient)}>
                <WIcon className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{w.title}</span>
                <span className="ml-auto text-xs bg-white/25 text-white rounded-full px-1.5 py-0.5 font-bold">{w.items.length}</span>
              </div>
              <div className="p-2 space-y-1">
                {w.items.length === 0 ? (
                  <p className="text-[10px] text-gray-400 py-2 text-center">Aucune tache</p>
                ) : (
                  w.items.map((t) => (
                    <div
                      key={t.id}
                      className={cn("px-2.5 py-2 rounded-lg border-l-[3px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer", w.borderColor)}
                    >
                      <p className="text-xs font-medium text-gray-800 truncate">{t.titre}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Bot className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400">{t.bot}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400">{t.deadline}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN VIEW — EspaceBureauView
// ══════════════════════════════════════════

export function EspaceBureauView() {
  const { activeEspaceSection, setActiveView, navigateEspace } = useFrameMaster();

  const renderPage = () => {
    switch (activeEspaceSection) {
      case "idees":
        return <ListingPage section="idees" />;
      case "projets":
        return <ListingPage section="projets" />;
      case "documents":
        return <DocumentsPage />;
      case "outils":
        return <ListingPage section="outils" />;
      case "taches":
        return <TachesPage />;
      default:
        return <ListingPage section="idees" />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header — barre d'action du Canvas (pattern Orbit9DetailView) */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView("department")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-orange-500" />
            <div>
              <h1 className="text-sm font-bold text-gray-900">Mon Espace Bureau</h1>
              <p className="text-[10px] text-gray-400">Idees, projets, documents, outils et taches</p>
            </div>
          </div>

          {/* Sub-tabs a droite (pattern Orbit9DetailView) */}
          <div className="flex gap-1 ml-auto">
            {ESPACE_TABS.map((tab) => {
              const TIcon = tab.icon;
              const isActive = tab.id === activeEspaceSection;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateEspace(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  <TIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}
