/**
 * MonBureauView.tsx — Mon Bureau (canevas central)
 * 5 sous-sections: Idees, Projets, Documents, Outils, Taches
 * Pattern: sub-tabs dans header
 * Sprint B — Mon Bureau
 *
 * Donnees reelles: PostgreSQL (projets, docs, outils) + Plane.so (taches) + localStorage (idees)
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Sparkles,
  FolderKanban,
  FileText,
  Wrench,
  CheckSquare,
  CalendarDays,
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
  X,
  Download,
  MessageSquare,
  ChevronRight,
  Eye,
  Calculator,
  Zap,
  Ruler,
  DollarSign,
  BarChart3,
  Package,
  Gauge,
  Scale,
  Briefcase,
  Table2,
  ArrowUpDown, ArrowUp, ArrowDown, Bell,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EspaceSection } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
import { BOT_AVATAR, BOT_NAME, BOT_ROLE } from "../../api/types";
import type { BureauItemCreate, PlaneTacheCreate, TemplatePreview } from "../../api/types";
import { useBureau, useTaches, useTemplates, useIdees, useDocForge, useUnifiedTemplates, DEPT_LABELS } from "../../api/hooks";
import { api } from "../../api/client";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { CarlOSPresence } from "../center/CarlOSPresence";
import { SectionFrame } from "./shared/SectionFrame";
import { DiscussionView } from "./DiscussionView";
import { CatalogueUnifie } from "./shared/CatalogueUnifie";
import { DocumentsUnifie } from "./shared/DocumentsUnifie";
import { HierarchieGHML } from "./shared/HierarchieGHML";
import { LivingHero } from "./blueprint/BlueprintDepartement";
import type { TabDef } from "./shared/section-types";
import type { DocForgeTemplateV2, DocForgeLibrary, DriveBrowseItem, UnifiedTemplate } from "../../api/types";

// ── Sub-tabs config (pattern Orbit9DetailView) ──

const ESPACE_TABS: { id: EspaceSection; label: string; icon: React.ElementType }[] = [
  { id: "idees", label: "Blueprint", icon: Sparkles },
  { id: "taches", label: "Taches", icon: CheckSquare },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "outils", label: "Outils", icon: Wrench },
];

// ── Tag color helper ──

const TAG_COLORS: Record<string, string> = {
  "en-cours": "bg-blue-100 text-blue-700",
  "planifie": "bg-amber-100 text-amber-700",
  "termine": "bg-green-100 text-green-700",
  "en-attente": "bg-gray-100 text-gray-600",
  "actif": "bg-blue-100 text-blue-700",
  "archive": "bg-gray-100 text-gray-600",
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
  // Categories reelles bridge_documents
  "FACTORY": "from-orange-600 to-orange-500",
  "CEO": "from-blue-600 to-blue-500",
  "CTO": "from-cyan-600 to-cyan-500",
  "CFO": "from-emerald-600 to-emerald-500",
  "CMO": "from-pink-600 to-pink-500",
  "CSO": "from-indigo-600 to-indigo-500",
  "COO": "from-teal-600 to-teal-500",
  "INTERNE-UB": "from-violet-600 to-violet-500",
  // Anciennes (fallback)
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

// Mapping categorie template → bot code (pour avatar)
const CAT_TO_BOT: Record<string, string> = {
  "CEO": "CEOB", "CTO": "CTOB", "CFO": "CFOB", "CMO": "CMOB",
  "CSO": "CSOB", "COO": "COOB", "FACTORY": "CPOB", "INTERNE-UB": "CEOB",
};

// ── Bot gradients + labels (pattern Pipeline) ──

const BOT_GRADIENTS: Record<string, string> = {
  CEOB: "from-blue-600 to-blue-500",
  CTOB: "from-violet-600 to-violet-500",
  CFOB: "from-emerald-600 to-emerald-500",
  CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500",
  COOB: "from-orange-600 to-orange-500",
  CPOB: "from-amber-600 to-amber-500",
  CHROB: "from-teal-600 to-teal-500",
  CINOB: "from-rose-600 to-rose-500",
  CROB: "from-amber-600 to-amber-500",
  CLOB: "from-indigo-600 to-indigo-500",
  CISOB: "from-gray-600 to-gray-500",
};

// BOT_LABELS derivé de BOT_NAME + BOT_ROLE (types.ts = source unique)
const BOT_LABELS: Record<string, { label: string; short: string }> = Object.fromEntries(
  Object.keys(BOT_NAME).map(code => [code, { label: BOT_NAME[code], short: BOT_ROLE[code] }])
);

const FILE_ICONS: Record<string, React.ElementType> = {
  "PDF": FileText,
  "XLSX": FileSpreadsheet,
  "ZIP": File,
  "DOC": FileText,
  "DOCX": FileText,
  "IMG": FileImage,
  "PNG": FileImage,
  "JPG": FileImage,
  "CSV": FileSpreadsheet,
  "PPTX": FileText,
  "TXT": FileText,
};

const PRIORITY_ICONS: Record<string, { icon: string; color: string }> = {
  urgent: { icon: "🔴", color: "text-red-600" },
  high: { icon: "🟠", color: "text-orange-600" },
  medium: { icon: "🟡", color: "text-yellow-600" },
  low: { icon: "🟢", color: "text-green-600" },
  none: { icon: "⚪", color: "text-gray-400" },
};

const BOT_OPTIONS = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB", "CHROB", "CINOB", "CROB", "CLOB"];

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
    agenda: "from-rose-500 to-pink-500",
    templates: "from-cyan-500 to-teal-500",
  };

  return (
    <div className={cn("bg-gradient-to-r rounded-xl p-3 flex items-center gap-3", sectionColors[section])}>
      <img
        src={BOT_AVATAR["CEOB"]}
        alt="CarlOS"
        className="w-8 h-8 rounded-full ring-2 ring-white/30 shrink-0"
      />
      <p className="text-xs text-white/90 flex-1">{message}</p>
      <button className="text-[9px] bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0">
        Explorer
      </button>
    </div>
  );
}

// ══════════════════════════════════════════
// BARRE DE RECHERCHE + FILTRE
// ══════════════════════════════════════════

function SearchBar({
  placeholder,
  viewMode,
  onToggleView,
  onAdd,
  addLabel,
}: {
  placeholder: string;
  viewMode: "grid" | "list";
  onToggleView: () => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel || "Ajouter"}
        </button>
      )}
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
// ADD BUREAU ITEM DIALOG (Projets, Outils)
// ══════════════════════════════════════════

function AddBureauItemDialog({
  open,
  onClose,
  type,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  type: "projet" | "outil";
  onCreate: (data: BureauItemCreate) => Promise<void>;
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("actif");
  const [bot, setBot] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!titre.trim()) return;
    setSaving(true);
    try {
      await onCreate({
        type_item: type,
        titre: titre.trim(),
        description,
        status,
        bot: bot || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      setTitre("");
      setDescription("");
      setStatus("actif");
      setBot("");
      setTags("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const label = type === "projet" ? "Projet" : "Outil";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Nouveau {label}</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Ajouter un {label.toLowerCase()} a votre espace bureau
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Titre *</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder={`Nom du ${label.toLowerCase()}`}
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description..."
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>
          {type === "projet" && (
            <div>
              <label className="text-xs font-medium text-gray-700">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="actif">Actif</option>
                <option value="en-cours">En cours</option>
                <option value="planifie">Planifie</option>
                <option value="en-attente">En attente</option>
                <option value="termine">Termine</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-700">Bot assigne</label>
            <select
              value={bot}
              onChange={(e) => setBot(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">Aucun</option>
              {BOT_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Tags (separes par virgule)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="strategie, finance, urgent"
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!titre.trim() || saving}
            className="px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
            Creer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════
// ADD TACHE DIALOG (Plane.so)
// ══════════════════════════════════════════

function AddTacheDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: PlaneTacheCreate) => Promise<void>;
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [priorite, setPriorite] = useState("none");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!titre.trim()) return;
    setSaving(true);
    try {
      await onCreate({ titre: titre.trim(), description, priorite });
      setTitre("");
      setDescription("");
      setPriorite("none");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Nouvelle tache</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            La tache sera creee dans Plane.so
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Titre *</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Decrire la tache..."
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Details supplementaires..."
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Priorite</label>
            <select
              value={priorite}
              onChange={(e) => setPriorite(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="none">Aucune</option>
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!titre.trim() || saving}
            className="px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
            Creer dans Plane
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════
// ADD IDEE DIALOG
// ══════════════════════════════════════════

function AddIdeeDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (titre: string, contenu: string) => void;
}) {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");

  const handleSubmit = () => {
    if (!titre.trim()) return;
    onAdd(titre.trim(), contenu);
    setTitre("");
    setContenu("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Nouvelle idee</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Ajoutez une idee manuellement a votre banque
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Titre *</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de l'idee..."
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Contenu</label>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              rows={4}
              placeholder="Decrivez votre idee..."
              className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!titre.trim()}
            className="px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            Ajouter
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════
// TACHE DETAIL PANEL
// ══════════════════════════════════════════

function TacheDetailPanel({
  tache,
  loading,
  onClose,
  onComplete,
  onComment,
}: {
  tache: { id: string; name: string; description_html: string; priority: string; labels: string[]; created_at: string; comments: Array<{ id: string; comment: string; created_at: string }> } | null;
  loading: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  onComment: (id: string, text: string) => void;
}) {
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  if (!tache && !loading) return null;

  const handleComment = async () => {
    if (!newComment.trim() || !tache) return;
    setCommenting(true);
    try {
      onComment(tache.id, newComment.trim());
      setNewComment("");
    } finally {
      setCommenting(false);
    }
  };

  const prioInfo = PRIORITY_ICONS[tache?.priority || "none"] || PRIORITY_ICONS.none;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Chargement...</span>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-bold text-gray-900 truncate">{tache?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px]">{prioInfo.icon}</span>
                  {tache?.labels.map((lb) => (
                    <Badge key={lb} className="text-[9px]" variant="outline">{lb}</Badge>
                  ))}
                  {tache?.created_at && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(tache.created_at).toLocaleDateString("fr-CA")}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {!loading && tache && (
          <>
            {/* Description */}
            {tache.description_html && (
              <div className="px-4 py-3 border-b">
                <div
                  className="text-xs text-gray-700 prose prose-xs max-w-none"
                  dangerouslySetInnerHTML={{ __html: tache.description_html }}
                />
              </div>
            )}

            {/* Comments */}
            <div className="flex-1 overflow-auto px-4 py-3">
              <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Commentaires ({tache.comments.length})
              </h3>
              {tache.comments.length === 0 ? (
                <p className="text-[10px] text-gray-400">Aucun commentaire</p>
              ) : (
                <div className="space-y-2">
                  {tache.comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-700">{c.comment}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {c.created_at ? new Date(c.created_at).toLocaleString("fr-CA") : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t space-y-2">
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim() || commenting}
                  className="px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                  Envoyer
                </button>
              </div>
              <button
                onClick={() => onComplete(tache.id)}
                className="w-full px-3 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Marquer completee
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// LOADING / ERROR STATES
// ══════════════════════════════════════════

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
      <p className="text-xs text-red-700">{message}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }: { icon: React.ElementType; text: string; sub: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-gray-100">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">{text}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

// ══════════════════════════════════════════
// IDEES PAGE — Style Pipeline harmonisé
// ══════════════════════════════════════════

function IdeesPage() {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "spreadsheet">("cards");
  const [showAddIdeeDialog, setShowAddIdeeDialog] = useState(false);
  const [botFilter, setBotFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"titre" | "date" | "bot">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const ideesHook = useIdees();

  const handleAddIdee = async (titre: string, contenu: string) => {
    await ideesHook.create({ titre, contenu: contenu || titre, source: "Manuel", bot: "CEOB" });
  };

  const allIdees = ideesHook.idees;

  // Compteurs par bot pour les filter pills
  const botCounts = allIdees.reduce((acc, c) => {
    const b = c.bot || "CEOB";
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const activeBots = Object.keys(botCounts).sort();

  // Filter + Sort (pattern chantier)
  const idees = useMemo(() => {
    let items = [...allIdees];
    if (botFilter) items = items.filter(c => c.bot === botFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(c => c.titre.toLowerCase().includes(q) || (c.contenu || "").toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "titre": cmp = a.titre.localeCompare(b.titre); break;
        case "date": cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(); break;
        case "bot": cmp = (a.bot || "").localeCompare(b.bot || ""); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [allIdees, botFilter, search, sortField, sortDir]);

  // Sort header helper (spreadsheet)
  const SortTh = ({ field, label, cls }: { field: typeof sortField; label: string; cls?: string }) => {
    const active = sortField === field;
    const SIcon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <th className={cn("text-left px-2 py-2 font-bold text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100 transition-colors text-[9px]", cls)}
        onClick={() => { if (active) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("asc"); } }}>
        <span className="inline-flex items-center gap-1">{label}<SIcon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-blue-500" : "text-gray-300")} /></span>
      </th>
    );
  };

  return (
    <div className="space-y-3">
      {/* TOOLBAR — pattern chantier unifie */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setBotFilter(null)}
            className={cn("px-2.5 py-1 text-[9px] font-medium rounded-full border transition-colors cursor-pointer",
              !botFilter ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
            Toutes ({allIdees.length})
          </button>
          {activeBots.map(bot => {
            const info = BOT_LABELS[bot];
            return (
              <button key={bot} onClick={() => setBotFilter(bot === botFilter ? null : bot)}
                className={cn("px-2.5 py-1 text-[9px] font-medium rounded-full border transition-colors cursor-pointer",
                  botFilter === bot ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
                {info?.label || bot} ({botCounts[bot]})
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowAddIdeeDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shrink-0">
          <Plus className="h-3.5 w-3.5" /> Idee
        </button>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {([
            { mode: "cards" as const, icon: LayoutGrid, title: "Cartes" },
            { mode: "list" as const, icon: List, title: "Liste" },
            { mode: "spreadsheet" as const, icon: Table2, title: "Tableur" },
          ]).map(({ mode, icon: MIcon, title }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}
              title={title}>
              <MIcon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <span className="text-[9px] font-bold text-gray-400">{idees.length} items</span>
      </div>

      {ideesHook.loading ? <LoadingSpinner /> : idees.length === 0 ? (
        <EmptyState icon={Sparkles} text={search ? `Aucun resultat pour "${search}"` : "Aucune idee"} sub="Discutez avec CarlOS — vos idees seront classees ici" />
      ) : null}

      {/* CARDS VIEW — gradient header par bot */}
      {viewMode === "cards" && idees.length > 0 && !ideesHook.loading && (
        <div className="grid grid-cols-2 gap-3">
          {idees.map(c => {
            const bot = c.bot || "CEOB";
            const gradient = BOT_GRADIENTS[bot] || "from-amber-600 to-amber-500";
            const avatar = BOT_AVATAR[bot];
            const info = BOT_LABELS[bot];
            const tags = c.tags && c.tags.length > 0 ? c.tags : [c.mode || "brainstorm"];
            const date = c.created_at ? new Date(c.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
            return (
              <Card key={c.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", gradient)}>
                  {avatar ? (
                    <img src={avatar} alt={bot} className="w-7 h-7 rounded-lg object-cover border-2 border-white/30 shrink-0" />
                  ) : (
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white">{info?.label || bot}</span>
                    <span className="text-[9px] text-white/60 ml-1.5">{info?.short}</span>
                  </div>
                  {date && <span className="text-[9px] text-white/60">{date}</span>}
                </div>
                <div className="p-3 space-y-1.5">
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-2">{c.titre}</h3>
                  {c.contenu && (
                    <p className="text-[9px] text-gray-500 line-clamp-2">{(c.contenu || "").slice(0, 120)}</p>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tags.map(tag => (
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
      )}

      {/* LIST VIEW — compact single-line */}
      {viewMode === "list" && idees.length > 0 && !ideesHook.loading && (
        <div className="space-y-1">
          {idees.map(c => {
            const bot = c.bot || "CEOB";
            const info = BOT_LABELS[bot];
            const tags = c.tags && c.tags.length > 0 ? c.tags : [c.mode || "brainstorm"];
            const date = c.created_at ? new Date(c.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
            return (
              <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-[9px] font-bold flex-1 truncate text-gray-800">{c.titre}</span>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200">{info?.label || bot}</span>
                {tags.slice(0, 2).map(tag => (
                  <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>{tag}</span>
                ))}
                {date && <span className="text-[8px] text-gray-400">{date}</span>}
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* SPREADSHEET VIEW — tableur */}
      {viewMode === "spreadsheet" && idees.length > 0 && !ideesHook.loading && (
        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-[9px] table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <SortTh field="titre" label="Titre" cls="w-[40%] px-3" />
                <SortTh field="bot" label="Bot" cls="w-[15%]" />
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[20%]">Tags</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[15%]">Source</th>
                <SortTh field="date" label="Date" cls="w-[10%]" />
              </tr>
            </thead>
            <tbody>
              {idees.map(c => {
                const bot = c.bot || "CEOB";
                const info = BOT_LABELS[bot];
                const tags = c.tags && c.tags.length > 0 ? c.tags : [c.mode || "brainstorm"];
                const date = c.created_at ? new Date(c.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
                return (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-800 truncate">{c.titre}</td>
                    <td className="px-2 py-2"><span className="px-1.5 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200 font-medium">{info?.label || bot}</span></td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1 flex-wrap">{tags.slice(0, 3).map(tag => (
                        <span key={tag} className={cn("px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>{tag}</span>
                      ))}</div>
                    </td>
                    <td className="px-2 py-2 text-gray-500">{c.source || "Chat"}</td>
                    <td className="px-2 py-2 text-gray-400">{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddIdeeDialog
        open={showAddIdeeDialog}
        onClose={() => setShowAddIdeeDialog(false)}
        onAdd={handleAddIdee}
      />
    </div>
  );
}

// ══════════════════════════════════════════
// DOCUMENTS PAGE (3 volets)
// ══════════════════════════════════════════


export function DocumentsPage() {
  const { items: allDocs, loading, error, uploadFile } = useBureau("document");
  const { libraries: dfLibraries, loading: dfLoading, refresh: dfRefresh } = useDocForge();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [dfTemplates, setDfTemplates] = useState<DocForgeTemplateV2[]>([]);
  const [dfTemplatesLoading, setDfTemplatesLoading] = useState(false);
  const [docStateFilter, setDocStateFilter] = useState<"all" | "en-cours" | "orphelins" | "termines">("all");
  const [docViewMode, setDocViewMode] = useState<"cards" | "list" | "spreadsheet">("cards");
  const [docSearch, setDocSearch] = useState("");

  const { dispatch } = useCanvasActions();

  // Load DocForge templates V2 for create wizard
  useEffect(() => {
    if (showCreateWizard && dfTemplates.length === 0 && !dfTemplatesLoading) {
      setDfTemplatesLoading(true);
      api.docForgeTemplatesV2().then(r => setDfTemplates(r.templates || [])).catch(() => {}).finally(() => setDfTemplatesLoading(false));
    }
  }, [showCreateWizard]);

  // Click library → dispatch focus mode
  const handleLibraryClick = (lib: DocForgeLibrary) => {
    dispatch({
      type: "focus", layer: "cerveau",
      data: { title: lib.titre, element_type: "document_editor", data: { library: lib, mode: "library" } },
      bot: "CPOB",
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 3-state filter for DocForge libraries
  const enCoursLibs = dfLibraries.filter(l => l.status === "en_cours" || l.status === "draft");
  const orphelinLibs = dfLibraries.filter(l => l.status === "review");
  const terminesLibs = dfLibraries.filter(l => l.status === "publie");
  const filteredLibsBase = docStateFilter === "all" ? dfLibraries
    : docStateFilter === "en-cours" ? enCoursLibs
    : docStateFilter === "orphelins" ? orphelinLibs
    : terminesLibs;

  // Apply search filter
  const filteredLibs = useMemo(() => {
    if (!docSearch.trim()) return filteredLibsBase;
    const q = docSearch.toLowerCase();
    return filteredLibsBase.filter(l => l.titre.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q));
  }, [filteredLibsBase, docSearch]);

  const DOC_STATE_TABS = [
    { id: "all" as const, label: "Tous", count: dfLibraries.length },
    { id: "en-cours" as const, label: "En cours", count: enCoursLibs.length },
    { id: "orphelins" as const, label: "En attente", count: orphelinLibs.length },
    { id: "termines" as const, label: "Termines", count: terminesLibs.length },
  ];

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600", en_cours: "bg-blue-100 text-blue-700",
    review: "bg-amber-100 text-amber-700", publie: "bg-green-100 text-green-700",
  };
  const statusLabel: Record<string, string> = {
    draft: "Brouillon", en_cours: "En cours", review: "A reviser", publie: "Publie",
  };

  return (
    <div className="space-y-3">
      {error && <ErrorBanner message={error} />}
      <input ref={fileInputRef} type="file" className="hidden" multiple
        accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.zip,.txt,.pptx"
        onChange={(e) => handleFileUpload(e.target.files)} />

      {/* TOOLBAR — pattern chantier unifie */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={docSearch} onChange={e => setDocSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
        </div>
        <div className="flex items-center gap-1">
          {DOC_STATE_TABS.map(tab => (
            <button key={tab.id} onClick={() => setDocStateFilter(tab.id)}
              className={cn("px-2.5 py-1 text-[9px] font-medium rounded-full border transition-colors cursor-pointer",
                docStateFilter === tab.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <button onClick={() => {
          dispatch({ type: "focus", layer: "cerveau", data: { title: "Nouveau document", element_type: "document_editor", data: { mode: "scratch" } }, bot: "CPOB" });
        }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shrink-0">
          <Plus className="h-3.5 w-3.5" /> Creer
        </button>
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shrink-0">
          <Upload className="h-3.5 w-3.5" /> Importer
        </button>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {([
            { mode: "cards" as const, icon: LayoutGrid, title: "Cartes" },
            { mode: "list" as const, icon: List, title: "Liste" },
            { mode: "spreadsheet" as const, icon: Table2, title: "Tableur" },
          ]).map(({ mode, icon: MIcon, title }) => (
            <button key={mode} onClick={() => setDocViewMode(mode)}
              className={cn("p-1.5 transition-colors cursor-pointer", docViewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}
              title={title}>
              <MIcon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        {uploading && <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />}
        <span className="text-[9px] font-bold text-gray-400">{filteredLibs.length + allDocs.length} items</span>
      </div>

      {/* Drop zone */}
      <div onDrop={handleDrop} onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-200 rounded-xl p-2 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}>
        <p className="text-[9px] text-gray-400">Glissez-deposez vos fichiers ici</p>
      </div>

      {/* DOCUMENTS — 3 view modes */}
      <div className="space-y-3">

        {dfLoading ? <LoadingSpinner /> : (filteredLibs.length === 0 && allDocs.length === 0) ? (
          <EmptyState icon={FileText} text={docSearch ? `Aucun resultat pour "${docSearch}"` : "Aucun document"} sub="Creez un document ou importez-en un" />
        ) : null}

        {/* CARDS VIEW */}
        {docViewMode === "cards" && !dfLoading && (filteredLibs.length > 0 || allDocs.length > 0) && (<>
          {filteredLibs.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filteredLibs.map((lib) => (
                <Card key={lib.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleLibraryClick(lib)}>
                  <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2.5",
                    lib.status === "en_cours" ? "from-teal-600 to-teal-500" : lib.status === "publie" ? "from-emerald-600 to-emerald-500" : "from-amber-500 to-amber-400")}>
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-white flex-1 truncate">{lib.titre}</span>
                    <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full", statusColors[lib.status] || "bg-gray-100 text-gray-600")}>
                      {statusLabel[lib.status] || lib.status}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors shrink-0" />
                  </div>
                  <div className="p-3 space-y-1.5">
                    {lib.description && <p className="text-[9px] text-gray-500 line-clamp-2">{lib.description}</p>}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-teal-500 rounded-full h-1.5 transition-all" style={{ width: `${lib.completude_pct}%` }} />
                      </div>
                      <span className="text-[9px] text-gray-500 font-medium">{lib.completude_pct}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                      <span>{lib.nb_blocs} blocs</span>
                      {lib.nb_contradictions > 0 && <span className="text-amber-600">{lib.nb_contradictions} contradictions</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {allDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-700">Fichiers importes ({allDocs.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {allDocs.map((doc) => {
                  const meta = doc.metadata as Record<string, string>;
                  const fileType = meta?.file_type || "FILE";
                  const FIcon = FILE_ICONS[fileType] || File;
                  const date = doc.created_at ? new Date(doc.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
                  const downloadUrl = meta?.file_path ? api.bureauDownloadUrl(meta.file_path) : null;
                  return (
                    <Card key={doc.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                      <div className="bg-gradient-to-r from-slate-600 to-slate-500 px-3 py-2 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <FIcon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-white flex-1 truncate">{doc.titre}</span>
                        {downloadUrl && (
                          <a href={downloadUrl} onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-white/20 rounded transition-colors" title="Telecharger">
                            <Download className="h-3.5 w-3.5 text-white/70" />
                          </a>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                          <span>{fileType}</span>
                          {meta?.taille && <><span>·</span><span>{meta.taille}</span></>}
                          {date && <><span>·</span><span>{date}</span></>}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>)}

        {/* LIST VIEW */}
        {docViewMode === "list" && !dfLoading && (filteredLibs.length > 0 || allDocs.length > 0) && (
          <div className="space-y-1">
            {filteredLibs.map((lib) => (
              <div key={lib.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleLibraryClick(lib)}>
                <span className={cn("w-2 h-2 rounded-full shrink-0",
                  lib.status === "en_cours" ? "bg-blue-500" : lib.status === "publie" ? "bg-emerald-500" : "bg-amber-400")} />
                <Sparkles className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span className="text-[9px] font-bold flex-1 truncate text-gray-800">{lib.titre}</span>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", statusColors[lib.status] || "bg-gray-100 text-gray-600")}>{statusLabel[lib.status] || lib.status}</span>
                <span className="text-[8px] text-gray-400">{lib.completude_pct}%</span>
                <span className="text-[8px] text-gray-400">{lib.nb_blocs} blocs</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              </div>
            ))}
            {allDocs.map((doc) => {
              const meta = doc.metadata as Record<string, string>;
              const fileType = meta?.file_type || "FILE";
              const date = doc.created_at ? new Date(doc.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
              return (
                <div key={doc.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-[9px] font-bold flex-1 truncate text-gray-800">{doc.titre}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{fileType}</span>
                  {date && <span className="text-[8px] text-gray-400">{date}</span>}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* SPREADSHEET VIEW */}
        {docViewMode === "spreadsheet" && !dfLoading && (filteredLibs.length > 0 || allDocs.length > 0) && (
          <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-[9px] table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase text-[9px] w-[35%]">Titre</th>
                  <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[12%]">Type</th>
                  <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[12%]">Statut</th>
                  <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[12%]">Progres</th>
                  <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[10%]">Blocs</th>
                  <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[10%]">Taille</th>
                  <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[9%]">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLibs.map((lib) => (
                  <tr key={lib.id} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                    onClick={() => handleLibraryClick(lib)}>
                    <td className="px-3 py-2 font-medium text-gray-800 truncate">{lib.titre}</td>
                    <td className="px-2 py-2"><span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-medium">DocForge</span></td>
                    <td className="px-2 py-2"><span className={cn("px-1.5 py-0.5 rounded font-bold", statusColors[lib.status] || "bg-gray-100 text-gray-600")}>{statusLabel[lib.status] || lib.status}</span></td>
                    <td className="px-2 py-2 text-gray-500">{lib.completude_pct}%</td>
                    <td className="px-2 py-2 text-gray-500">{lib.nb_blocs}</td>
                    <td className="px-2 py-2 text-gray-400">—</td>
                    <td className="px-2 py-2 text-gray-400">—</td>
                  </tr>
                ))}
                {allDocs.map((doc) => {
                  const meta = doc.metadata as Record<string, string>;
                  const date = doc.created_at ? new Date(doc.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
                  return (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-800 truncate">{doc.titre}</td>
                      <td className="px-2 py-2"><span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-medium">{(meta?.file_type || "FILE")}</span></td>
                      <td className="px-2 py-2"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Importe</span></td>
                      <td className="px-2 py-2 text-gray-400">—</td>
                      <td className="px-2 py-2 text-gray-400">—</td>
                      <td className="px-2 py-2 text-gray-500">{meta?.taille || "—"}</td>
                      <td className="px-2 py-2 text-gray-400">{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Catalogue unifie — Templates + Playbooks + Diagnostics */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-700">Catalogue — Creer a partir d'un modele</h3>
        <CatalogueUnifie
          onAction={(item) => {
            if (item.type === "template") {
              dispatch({ type: "focus", layer: "cerveau",
                data: { title: `Template: ${item.titre}`, element_type: "document_editor", data: { template: item._raw, mode: "scratch" } },
                bot: item.bot_recommande || "CPOB"
              });
            } else if (item.type === "playbook") {
              dispatch({ type: "focus", layer: "cerveau",
                data: { title: `Playbook: ${item.titre}`, element_type: "playbook", data: item._raw },
                bot: item.bot_recommande || "CPOB"
              });
            } else {
              dispatch({ type: "focus", layer: "cerveau",
                data: { title: `Diagnostic: ${item.titre}`, element_type: "diagnostic_enrichi", data: item._raw },
                bot: item.bot_recommande || "CPOB"
              });
            }
          }}
        />
      </div>

      {/* Create Wizard Dialog (Importer depuis Drive) */}
      {showCreateWizard && (
        <DocForgeCreateWizard
          templates={dfTemplates}
          templatesLoading={dfTemplatesLoading}
          onClose={() => setShowCreateWizard(false)}
          onCreated={() => { setShowCreateWizard(false); dfRefresh(); }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// TACHES PAGE (4 widgets grille + Plane.so)
// ══════════════════════════════════════════

function TachesPage() {
  const {
    taches, loading, error,
    selectedTache, loadingDetail, selectTache, closeTache,
    createTache, completeTache, commentTache,
  } = useTaches();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [tacheStateFilter, setTacheStateFilter] = useState<"a-faire" | "completees">("a-faire");
  const [tacheViewMode, setTacheViewMode] = useState<"cards" | "list" | "spreadsheet">("cards");
  const [tacheSearch, setTacheSearch] = useState("");

  // 2-state: A faire / Completees (spec §4.2)
  const tachesAFaire = taches.filter((t: any) => t.state_detail?.group !== "completed");
  const tachesCompletees = taches.filter((t: any) => t.state_detail?.group === "completed");

  // Categoriser par priorite (pour la vue A faire)
  const urgentes = tachesAFaire.filter((t) => t.priority === "urgent");
  const hautes = tachesAFaire.filter((t) => t.priority === "high");
  const moyennes = tachesAFaire.filter((t) => t.priority === "medium" || t.priority === "none");
  const basses = tachesAFaire.filter((t) => t.priority === "low");

  const widgets = [
    { title: "Urgentes", icon: AlertCircle, gradient: "from-red-600 to-red-500", items: urgentes, borderColor: "border-l-red-400" },
    { title: "Hautes", icon: Loader2, gradient: "from-orange-600 to-orange-500", items: hautes, borderColor: "border-l-orange-400" },
    { title: "Moyennes", icon: Timer, gradient: "from-blue-600 to-blue-500", items: moyennes, borderColor: "border-l-blue-400" },
    { title: "Basses", icon: CheckCircle2, gradient: "from-green-600 to-green-500", items: basses, borderColor: "border-l-green-400" },
  ];

  const handleCreateTache = async (data: PlaneTacheCreate) => {
    await createTache(data);
  };

  const TACHE_STATE_TABS = [
    { id: "a-faire" as const, label: "A faire", count: tachesAFaire.length },
    { id: "completees" as const, label: "Completees", count: tachesCompletees.length },
  ];

  // Search filter
  const displayTaches = useMemo(() => {
    const base = tacheStateFilter === "a-faire" ? tachesAFaire : tachesCompletees;
    if (!tacheSearch.trim()) return base;
    const q = tacheSearch.toLowerCase();
    return base.filter((t: any) => t.name.toLowerCase().includes(q));
  }, [tachesAFaire, tachesCompletees, tacheStateFilter, tacheSearch]);

  return (
    <div className="space-y-3">
      {/* TOOLBAR — pattern chantier unifie */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={tacheSearch} onChange={e => setTacheSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
        </div>
        <div className="flex items-center gap-1">
          {TACHE_STATE_TABS.map(tab => (
            <button key={tab.id} onClick={() => setTacheStateFilter(tab.id)}
              className={cn("px-2.5 py-1 text-[9px] font-medium rounded-full border transition-colors cursor-pointer",
                tacheStateFilter === tab.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shrink-0">
          <Plus className="h-3.5 w-3.5" /> Tache
        </button>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {([
            { mode: "cards" as const, icon: LayoutGrid, title: "Cartes" },
            { mode: "list" as const, icon: List, title: "Liste" },
            { mode: "spreadsheet" as const, icon: Table2, title: "Tableur" },
          ]).map(({ mode, icon: MIcon, title }) => (
            <button key={mode} onClick={() => setTacheViewMode(mode)}
              className={cn("p-1.5 transition-colors cursor-pointer", tacheViewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}
              title={title}>
              <MIcon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <span className="text-[9px] font-bold text-gray-400">{displayTaches.length} items</span>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? <LoadingSpinner /> : displayTaches.length === 0 ? (
        <EmptyState icon={CheckSquare} text={tacheSearch ? `Aucun resultat pour "${tacheSearch}"` : "Aucune tache"} sub="Creez une tache ou attendez Plane.so" />
      ) : null}

      {/* CARDS VIEW */}
      {tacheViewMode === "cards" && !loading && displayTaches.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {displayTaches.map((t: any) => {
            const prioInfo = PRIORITY_ICONS[t.priority] || PRIORITY_ICONS.none;
            const isCompleted = t.state_detail?.group === "completed";
            const gradient = t.priority === "urgent" ? "from-red-600 to-red-500"
              : t.priority === "high" ? "from-orange-600 to-orange-500"
              : t.priority === "medium" || t.priority === "none" ? "from-blue-600 to-blue-500"
              : "from-green-600 to-green-500";
            return (
              <Card key={t.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => selectTache(t.id)}>
                <div className={cn("bg-gradient-to-r px-4 py-3 flex items-center gap-3", isCompleted ? "from-gray-500 to-gray-400" : gradient)}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20">
                    {isCompleted ? <CheckCircle2 className="h-5 w-5 text-white" /> : <CheckSquare className="h-5 w-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-xs font-bold text-white block truncate", isCompleted && "line-through")}>{t.name}</span>
                  </div>
                  <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-white/90">#{t.sequence_id}</span>
                  <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 text-[9px] flex-wrap">
                    <span>{prioInfo.icon}</span>
                    {t.labels.length > 0 && <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">{t.labels[0]}</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {tacheViewMode === "list" && !loading && displayTaches.length > 0 && (
        <div className="space-y-1">
          {displayTaches.map((t: any) => {
            const prioInfo = PRIORITY_ICONS[t.priority] || PRIORITY_ICONS.none;
            const isCompleted = t.state_detail?.group === "completed";
            return (
              <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => selectTache(t.id)}>
                <span className={cn("w-2 h-2 rounded-full shrink-0",
                  t.priority === "urgent" ? "bg-red-500" : t.priority === "high" ? "bg-orange-500" : t.priority === "medium" ? "bg-blue-500" : "bg-green-500")} />
                <span className="text-[9px]">{prioInfo.icon}</span>
                <span className={cn("text-[9px] font-bold flex-1 truncate text-gray-800", isCompleted && "line-through text-gray-400")}>{t.name}</span>
                {t.labels.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">{t.labels[0]}</span>}
                <span className="text-[8px] text-gray-400">#{t.sequence_id}</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* SPREADSHEET VIEW */}
      {tacheViewMode === "spreadsheet" && !loading && displayTaches.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-[9px] table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase text-[9px] w-[40%]">Titre</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[12%]">Priorite</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[12%]">Statut</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[15%]">Labels</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[10%]">#</th>
              </tr>
            </thead>
            <tbody>
              {displayTaches.map((t: any) => {
                const prioInfo = PRIORITY_ICONS[t.priority] || PRIORITY_ICONS.none;
                const isCompleted = t.state_detail?.group === "completed";
                return (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                    onClick={() => selectTache(t.id)}>
                    <td className={cn("px-3 py-2 font-medium text-gray-800 truncate", isCompleted && "line-through text-gray-400")}>{t.name}</td>
                    <td className="px-2 py-2"><span>{prioInfo.icon} {t.priority || "none"}</span></td>
                    <td className="px-2 py-2"><span className={cn("px-1.5 py-0.5 rounded font-bold", isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{isCompleted ? "Completee" : "A faire"}</span></td>
                    <td className="px-2 py-2">{t.labels.length > 0 ? t.labels[0] : "—"}</td>
                    <td className="px-2 py-2 text-gray-400">{t.sequence_id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {(selectedTache || loadingDetail) && (
        <TacheDetailPanel
          tache={selectedTache}
          loading={loadingDetail}
          onClose={closeTache}
          onComplete={completeTache}
          onComment={commentTache}
        />
      )}

      {/* Create dialog */}
      <AddTacheDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onCreate={handleCreateTache}
      />
    </div>
  );
}

// ══════════════════════════════════════════
// AGENDA PAGE
// ══════════════════════════════════════════

export function AgendaPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [agendaViewMode, setAgendaViewMode] = useState<"jour" | "semaine" | "mois">("semaine");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper: YYYY-MM-DD
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Compute visible range based on view mode + currentDate
  const getWeekStartFn = (d: Date) => {
    const s = new Date(d); const day = s.getDay();
    s.setDate(s.getDate() + (day === 0 ? -6 : 1 - day));
    s.setHours(0, 0, 0, 0); return s;
  };
  const visibleRange = useMemo(() => {
    if (agendaViewMode === "jour") {
      return { start: fmt(currentDate), end: fmt(currentDate) };
    } else if (agendaViewMode === "semaine") {
      const ws = getWeekStartFn(currentDate);
      const we = new Date(ws.getTime() + 6 * 86400000);
      return { start: fmt(ws), end: fmt(we) };
    } else {
      const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return { start: fmt(first), end: fmt(last) };
    }
  }, [agendaViewMode, currentDate]);

  // Fetch meetings on mount
  useEffect(() => {
    api.meetingList().then((r) => setMeetings(Array.isArray(r?.meetings) ? r.meetings : []))
      .catch(() => {}).finally(() => setLoadingMeetings(false));
  }, []);

  // Fetch calendar events for visible range
  useEffect(() => {
    setLoadingCalendar(true);
    api.calendarRange(visibleRange.start, visibleRange.end).then((r) => {
      const evts = Array.isArray(r?.events) ? r.events : [];
      setCalendarEvents(evts);
    }).catch(() => {
      setCalendarEvents([]);
    }).finally(() => setLoadingCalendar(false));
  }, [visibleRange.start, visibleRange.end]);

  const BOT_GRADIENT: Record<string, string> = {
    CEOB: "bg-blue-500", CTOB: "bg-violet-500", CFOB: "bg-emerald-500", CMOB: "bg-pink-500",
    CSOB: "bg-red-500", COOB: "bg-orange-500", CPOB: "bg-slate-500", CHROB: "bg-teal-500",
    CINOB: "bg-rose-500", CROB: "bg-amber-500", CLOB: "bg-indigo-500", CISOB: "bg-zinc-500",
  };

  // Merge all events into unified format
  const allEvents = useMemo(() => {
    const events: { id: string; titre: string; heure: string; hourNum: number; date: Date; bot: string; duree: string; source: string }[] = [];

    meetings.forEach((m: any) => {
      const d = m.created_at ? new Date(m.created_at) : new Date();
      const h = d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
      events.push({ id: m.slug || m.id, titre: m.title || m.slug, heure: h, hourNum: d.getHours(), date: d, bot: m.bot_code || "CEOB", duree: m.meeting_type || "meeting", source: "meeting" });
    });

    calendarEvents.forEach((c: any, idx: number) => {
      if (typeof c === "string") {
        // Legacy format: "HH:MM-HH:MM Titre"
        const match = c.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})\s+(.+)$/);
        if (match) {
          const hourStart = parseInt(match[1]);
          const minuteStart = match[2];
          const hourEnd = parseInt(match[3]);
          const minuteEnd = match[4];
          const titre = match[5];
          const dureeMin = (hourEnd * 60 + parseInt(minuteEnd)) - (hourStart * 60 + parseInt(minuteStart));
          const d = new Date(); d.setHours(hourStart, parseInt(minuteStart), 0, 0);
          events.push({ id: `gcal-${idx}`, titre, heure: `${match[1]}:${minuteStart}`, hourNum: hourStart, date: d, bot: "CEOB", duree: dureeMin > 0 ? `${dureeMin} min` : "", source: "google" });
        }
      } else {
        // Range format: {summary, start, end, date, formatted}
        const d = c.start ? new Date(c.start) : (c.date ? new Date(c.date + "T00:00:00") : new Date());
        const h = d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
        const endD = c.end ? new Date(c.end) : null;
        const dureeMin = endD ? Math.round((endD.getTime() - d.getTime()) / 60000) : 0;
        events.push({ id: `gcal-${idx}`, titre: c.summary || "Événement", heure: h, hourNum: d.getHours(), date: d, bot: "CEOB", duree: dureeMin > 0 ? `${dureeMin} min` : "", source: "google" });
      }
    });

    return events;
  }, [meetings, calendarEvents]);

  const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const MOIS = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
  const HEURES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  // Navigation helpers
  const navPrev = () => {
    const d = new Date(currentDate);
    if (agendaViewMode === "jour") d.setDate(d.getDate() - 1);
    else if (agendaViewMode === "semaine") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const navNext = () => {
    const d = new Date(currentDate);
    if (agendaViewMode === "jour") d.setDate(d.getDate() + 1);
    else if (agendaViewMode === "semaine") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  const goToday = () => setCurrentDate(new Date());

  const getWeekStart = getWeekStartFn;

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isToday = (d: Date) => isSameDay(d, new Date());

  // Events for a specific day
  const eventsForDay = (day: Date) => allEvents.filter(e => isSameDay(e.date, day));

  // Title for current view
  const viewTitle = agendaViewMode === "jour"
    ? `${JOURS[currentDate.getDay()]} ${currentDate.getDate()} ${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : agendaViewMode === "semaine"
    ? (() => { const ws = getWeekStart(currentDate); const we = new Date(ws.getTime() + 6 * 86400000); return `${ws.getDate()} - ${we.getDate()} ${MOIS[we.getMonth()]} ${we.getFullYear()}`; })()
    : `${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Render an event block (reused across views)
  const EventBlock = ({ ev, compact = false }: { ev: typeof allEvents[0]; compact?: boolean }) => (
    <div className={cn("rounded-md px-2 py-1.5 text-white text-[9px] font-bold truncate cursor-pointer hover:opacity-80 transition-opacity shadow-sm", BOT_GRADIENT[ev.bot] || "bg-blue-500")}
      title={`${ev.titre} — ${ev.heure} (${ev.duree})`}>
      {compact ? ev.titre : <><span className="opacity-80">{ev.heure}</span> {ev.titre}</>}
      {ev.duree && !compact && <span className="opacity-70 ml-1">({ev.duree})</span>}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* ═══ HERO V20 — Agenda Clock + Timeline ═══ */}
      <LivingHero blur1="bg-rose-100/70" blur2="bg-red-100/40" subtitleColor="text-rose-600" subtitle="Synchronisation Totale" title="La maîtrise absolue de votre temps." description="Synchronisez vos équipes et vos bots sur une frise temporelle parfaite.">
        <div className="relative flex items-center justify-end" style={{ width: 360, height: 140 }}>
          <div className="absolute right-[20px] opacity-[0.15] text-rose-600">
            <svg viewBox="0 0 100 100" className="w-36 h-36">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" className="anim-clock-outer"/>
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="anim-clock-inner" style={{ transformOrigin: '50px 50px' }}/>
              <circle cx="50" cy="50" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div className="glass-base absolute right-[80px] top-[20px] w-56 h-24 p-4 border-rose-100 overflow-hidden">
            <div className="absolute top-[35px] left-4 w-12 h-6 bg-rose-100/50 rounded border border-rose-200" />
            <div className="absolute top-[50px] left-[80px] w-16 h-6 bg-red-50/50 rounded border border-red-200" />
            <div className="absolute top-0 bottom-0 w-px bg-rose-500 shadow-[0_0_15px_#f43f5e] anim-ticker flex justify-center z-10">
              <div className="w-2 h-2 rounded-full bg-rose-500 -mt-1" />
            </div>
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
            <div className="absolute inset-x-0 bottom-2 flex justify-between px-4 opacity-30 text-[6px] font-mono font-bold text-slate-800">
              <span>08:00</span><span>12:00</span><span>16:00</span>
            </div>
          </div>
        </div>
      </LivingHero>

      {/* TOOLBAR — navigation date + vue toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date nav */}
        <button onClick={navPrev} className="px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">&lt;</button>
        <button onClick={goToday} className="px-2.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer">Aujourd'hui</button>
        <button onClick={navNext} className="px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">&gt;</button>
        <span className="text-xs font-bold text-gray-700 flex-1">{viewTitle}</span>

        {/* View mode toggle — Jour / Semaine / Mois */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {(["jour", "semaine", "mois"] as const).map(mode => (
            <button key={mode} onClick={() => setAgendaViewMode(mode)}
              className={cn("px-3 py-1.5 text-[9px] font-bold transition-colors cursor-pointer capitalize",
                agendaViewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:text-gray-700")}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {(loadingMeetings || loadingCalendar) && <LoadingSpinner />}

      {/* Aucun evenement */}
      {!loadingMeetings && !loadingCalendar && allEvents.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-xs">Aucun evenement aujourd'hui</div>
      )}

      {/* ══ VUE JOUR — grille horaire verticale ══ */}
      {!loadingMeetings && !loadingCalendar && agendaViewMode === "jour" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {HEURES.map(h => {
            const dayEvents = eventsForDay(currentDate).filter(e => e.hourNum === h);
            return (
              <div key={h} className="flex border-b border-gray-100 min-h-[40px]">
                <div className="w-14 shrink-0 text-[9px] font-bold text-gray-400 text-right pr-2 py-2 bg-gray-50 border-r border-gray-200">
                  {String(h).padStart(2, "0")}:00
                </div>
                <div className="flex-1 px-2 py-1 space-y-0.5">
                  {dayEvents.map(ev => <EventBlock key={ev.id} ev={ev} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ VUE SEMAINE — 7 colonnes avec heures ══ */}
      {!loadingMeetings && !loadingCalendar && agendaViewMode === "semaine" && (() => {
        const weekStart = getWeekStart(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * 86400000));
        return (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header row — jours */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="w-14 shrink-0 border-r border-gray-200" />
              {weekDays.map((d, i) => (
                <div key={i} className={cn("flex-1 text-center py-2 border-r border-gray-100 last:border-r-0",
                  isToday(d) && "bg-blue-50")}>
                  <div className="text-[9px] font-bold text-gray-500">{JOURS[(i + 1) % 7]}</div>
                  <div className={cn("text-xs font-bold", isToday(d) ? "text-blue-600" : "text-gray-700")}>{d.getDate()}</div>
                </div>
              ))}
            </div>
            {/* Hour rows */}
            {HEURES.map(h => (
              <div key={h} className="flex border-b border-gray-100 min-h-[36px]">
                <div className="w-14 shrink-0 text-[9px] font-bold text-gray-400 text-right pr-2 py-1 bg-gray-50 border-r border-gray-200">
                  {String(h).padStart(2, "0")}:00
                </div>
                {weekDays.map((d, i) => {
                  const dayEv = eventsForDay(d).filter(e => e.hourNum === h);
                  return (
                    <div key={i} className={cn("flex-1 px-0.5 py-0.5 border-r border-gray-100 last:border-r-0 space-y-0.5",
                      isToday(d) && "bg-blue-50/30")}>
                      {dayEv.map(ev => <EventBlock key={ev.id} ev={ev} compact />)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}

      {/* ══ VUE MOIS — grille calendrier classique ══ */}
      {!loadingMeetings && !loadingCalendar && agendaViewMode === "mois" && (() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lundi = 0
        const totalDays = lastDay.getDate();
        const weeks: Date[][] = [];
        let week: Date[] = [];
        // Fill empty slots before month start
        for (let i = 0; i < startOffset; i++) {
          const d = new Date(year, month, 1 - startOffset + i);
          week.push(d);
        }
        for (let d = 1; d <= totalDays; d++) {
          week.push(new Date(year, month, d));
          if (week.length === 7) { weeks.push(week); week = []; }
        }
        // Fill remaining
        if (week.length > 0) {
          let nextDay = 1;
          while (week.length < 7) { week.push(new Date(year, month + 1, nextDay++)); }
          weeks.push(week);
        }
        return (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header — jours de la semaine */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(j => (
                <div key={j} className="text-center py-2 text-[9px] font-bold text-gray-500">{j}</div>
              ))}
            </div>
            {/* Weeks */}
            {weeks.map((w, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
                {w.map((d, di) => {
                  const inMonth = d.getMonth() === month;
                  const dayEv = eventsForDay(d);
                  return (
                    <div key={di} className={cn("min-h-[60px] p-1 border-r border-gray-100 last:border-r-0",
                      !inMonth && "bg-gray-50/50", isToday(d) && "bg-blue-50")}>
                      <div className={cn("text-[9px] font-bold mb-0.5",
                        isToday(d) ? "text-blue-600" : inMonth ? "text-gray-700" : "text-gray-300")}>
                        {d.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayEv.slice(0, 3).map(ev => <EventBlock key={ev.id} ev={ev} compact />)}
                        {dayEv.length > 3 && <div className="text-[8px] text-gray-400 font-medium">+{dayEv.length - 3} autres</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════════
// DocForge Create Wizard — 4 etapes
// ══════════════════════════════════════════

function DocForgeCreateWizard({ templates, templatesLoading, onClose, onCreated }: {
  templates: DocForgeTemplateV2[];
  templatesLoading: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<DocForgeTemplateV2 | null>(null);

  // Step 2 — Drive folder
  const [folderId, setFolderId] = useState("1IRU1xnc3Me_Ku5jAxs8ZZXIc055O8QCJ"); // GhostX-Master default
  const [folderName, setFolderName] = useState("GhostX-Master");
  const [browsing, setBrowsing] = useState(false);
  const [browseItems, setBrowseItems] = useState<{ folders: DriveBrowseItem[]; files: DriveBrowseItem[] }>({ folders: [], files: [] });
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string }>>([{ id: "1IRU1xnc3Me_Ku5jAxs8ZZXIc055O8QCJ", name: "GhostX-Master" }]);
  const [noFolder, setNoFolder] = useState(false);

  // Step 3 — Scan config
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [megaPrompt, setMegaPrompt] = useState("");
  const [excludePrompts, setExcludePrompts] = useState(true);
  const [excludeArchive, setExcludeArchive] = useState(true);
  const [botPrimaire, setBotPrimaire] = useState("CPOB");

  // Step 4 — Creating
  const [creating, setCreating] = useState(false);
  const [titre, setTitre] = useState("");

  // Browse Drive folder
  const browseDrive = async (id: string) => {
    setBrowsing(true);
    try {
      const result = await api.driveBrowse(id);
      setBrowseItems({ folders: result.folders || [], files: result.files || [] });
    } catch (e) {
      console.error("Browse Drive:", e);
    } finally {
      setBrowsing(false);
    }
  };

  // When selecting a template, pre-fill keywords + mega_prompt
  const handleSelectTemplate = (tpl: DocForgeTemplateV2) => {
    setSelectedTemplate(tpl);
    setKeywords(tpl.keywords || []);
    setMegaPrompt(tpl.mega_prompt || "");
    setTitre(tpl.titre);
    setBotPrimaire(tpl.bot_recommande || "CPOB");
    setStep(2);
  };

  // Navigate into a subfolder
  const handleFolderClick = (folder: DriveBrowseItem) => {
    setFolderId(folder.id);
    setFolderName(folder.name);
    setBreadcrumb(prev => [...prev, { id: folder.id, name: folder.name }]);
    browseDrive(folder.id);
  };

  // Navigate breadcrumb
  const handleBreadcrumbClick = (index: number) => {
    const item = breadcrumb[index];
    setFolderId(item.id);
    setFolderName(item.name);
    setBreadcrumb(prev => prev.slice(0, index + 1));
    browseDrive(item.id);
  };

  // Step 2 init
  useEffect(() => {
    if (step === 2 && browseItems.folders.length === 0 && browseItems.files.length === 0) {
      browseDrive(folderId);
    }
  }, [step]);

  // Create library
  const handleCreate = async () => {
    if (!titre.trim()) return;
    setCreating(true);
    try {
      const exclusionRules: Array<{ type: string; value: string }> = [];
      if (excludePrompts) exclusionRules.push({ type: "keyword", value: "deep search prompt" });
      if (excludeArchive) exclusionRules.push({ type: "keyword", value: "archive" });

      await api.createDocForgeLibrary({
        titre: titre.trim(),
        template_alias: selectedTemplate?.alias || "",
        description: selectedTemplate?.description || "",
        bot_primaire: botPrimaire,
        source_folder_id: noFolder ? "" : folderId,
        exclusion_rules: exclusionRules,
        scan_config: { keywords },
      });
      onCreated();
    } catch (e) {
      console.error("Create library:", e);
      alert("Erreur creation bibliotheque");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Importer depuis Drive — Etape {step}/4</DialogTitle>
          <DialogDescription className="text-[9px] text-gray-500">
            {step === 1 && "Choisissez un template qui servira de structure pour votre document."}
            {step === 2 && "Selectionnez le dossier Drive a scanner. Le scanner ira chercher le contenu pertinent."}
            {step === 3 && "Configurez les mots-cles et les regles de scan."}
            {step === 4 && "Verifiez et creez votre bibliotheque."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Step 1 — Template selection */}
          {step === 1 && (
            <div className="space-y-2">
              {templatesLoading ? <LoadingSpinner /> : templates.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Aucun template disponible. Lancez le seed.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(tpl => (
                    <Card key={tpl.id} onClick={() => handleSelectTemplate(tpl)}
                      className={cn("p-3 cursor-pointer hover:shadow-md transition-shadow", selectedTemplate?.id === tpl.id && "ring-2 ring-teal-500")}>
                      <h4 className="text-xs font-bold text-gray-800">{tpl.titre}</h4>
                      <p className="text-[9px] text-gray-500 mt-1 line-clamp-2">{tpl.description}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-medium">{tpl.nb_sections} sections</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{tpl.type_template}</span>
                        {tpl.keywords.length > 0 && (
                          <span className="text-[9px] text-gray-400">{tpl.keywords.length} keywords</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Drive folder picker */}
          {step === 2 && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={noFolder} onChange={e => setNoFolder(e.target.checked)} className="rounded" />
                Aucun dossier (import manuel seulement)
              </label>
              {!noFolder && (<>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 flex-wrap text-[9px]">
                  {breadcrumb.map((bc, i) => (
                    <span key={bc.id} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                      <button onClick={() => handleBreadcrumbClick(i)}
                        className={cn("px-1.5 py-0.5 rounded cursor-pointer", i === breadcrumb.length - 1 ? "bg-teal-100 text-teal-700 font-medium" : "text-gray-500 hover:bg-gray-100")}>
                        {bc.name}
                      </button>
                    </span>
                  ))}
                </div>
                {/* Folder list */}
                {browsing ? <LoadingSpinner /> : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {browseItems.folders.map(f => (
                      <button key={f.id} onClick={() => handleFolderClick(f)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-xs cursor-pointer">
                        <FolderKanban className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="font-medium text-gray-700">{f.name}</span>
                      </button>
                    ))}
                    {browseItems.files.length > 0 && (
                      <p className="text-[9px] text-gray-400 px-3 pt-2">{browseItems.files.length} fichiers dans ce dossier</p>
                    )}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[9px] text-gray-600">
                    Dossier selectionne: <strong>{folderName}</strong>
                  </p>
                </div>
              </>)}
            </div>
          )}

          {/* Step 3 — Scan config */}
          {step === 3 && (
            <div className="space-y-3">
              {/* Keywords */}
              <div>
                <label className="text-xs font-medium text-gray-700">Mots-cles de recherche</label>
                <p className="text-[9px] text-gray-400 mb-1">Le scanner cherchera ces mots dans vos fichiers Drive.</p>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {keywords.map((kw, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 flex items-center gap-1">
                      {kw}
                      <button onClick={() => setKeywords(prev => prev.filter((_, j) => j !== i))} className="cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && keywordInput.trim()) { setKeywords(prev => [...prev, keywordInput.trim()]); setKeywordInput(""); } }}
                    placeholder="Ajouter un mot-cle..." className="text-xs px-2.5 py-1.5 border rounded-lg flex-1" />
                  <button onClick={() => { if (keywordInput.trim()) { setKeywords(prev => [...prev, keywordInput.trim()]); setKeywordInput(""); } }}
                    className="text-[9px] px-2.5 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">Ajouter</button>
                </div>
              </div>
              {/* Mega prompt */}
              <div>
                <label className="text-xs font-medium text-gray-700">Instructions de scan (optionnel)</label>
                <textarea value={megaPrompt} onChange={e => setMegaPrompt(e.target.value)}
                  rows={3} placeholder="Instructions pour guider le scanner IA..."
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg mt-1 resize-none" />
              </div>
              {/* Exclusions */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Exclusions</label>
                <label className="flex items-center gap-2 text-[9px] text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={excludePrompts} onChange={e => setExcludePrompts(e.target.checked)} className="rounded" />
                  Exclure prompts Gemini deep search
                </label>
                <label className="flex items-center gap-2 text-[9px] text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={excludeArchive} onChange={e => setExcludeArchive(e.target.checked)} className="rounded" />
                  Exclure fichiers archives
                </label>
              </div>
              {/* Bot primaire */}
              <div>
                <label className="text-xs font-medium text-gray-700">Bot primaire</label>
                <select value={botPrimaire} onChange={e => setBotPrimaire(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg mt-1">
                  <option value="CPOB">Paco (CPO / Usine)</option>
                  <option value="CEOB">CarlOS (CEO)</option>
                  <option value="CTOB">Tim (CTO)</option>
                  <option value="CFOB">Frank (CFO)</option>
                  <option value="CMOB">Mathilde (CMO)</option>
                  <option value="CSOB">Simone (CSO)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4 — Review + Create */}
          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Titre de la bibliotheque</label>
                <input value={titre} onChange={e => setTitre(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg mt-1" placeholder="Ex: Bible GHML V3" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <p className="text-[9px] text-gray-600"><strong>Template:</strong> {selectedTemplate?.titre || "Aucun"}</p>
                <p className="text-[9px] text-gray-600"><strong>Dossier:</strong> {noFolder ? "Manuel seulement" : folderName}</p>
                <p className="text-[9px] text-gray-600"><strong>Keywords:</strong> {keywords.length > 0 ? keywords.join(", ") : "Aucun"}</p>
                <p className="text-[9px] text-gray-600"><strong>Bot:</strong> {botPrimaire}</p>
                <p className="text-[9px] text-gray-600"><strong>Sections:</strong> {selectedTemplate?.nb_sections || 0}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 cursor-pointer">Precedent</button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 cursor-pointer">Annuler</button>
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !selectedTemplate}
                className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 cursor-pointer">
                Suivant
              </button>
            ) : (
              <button onClick={handleCreate} disabled={creating || !titre.trim()}
                className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Creer
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ══════════════════════════════════════════
// Templates Page — Parcourir + generer des documents
// ══════════════════════════════════════════

function TemplatesPage() {
  const { templates, categories, loading, previewTemplate, generateDocument } = useTemplates();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [templateTab, setTemplateTab] = useState<"generateur" | "bibliotheque" | "diagnostics">("generateur");
  const [diagnosticsEnrichis, setDiagnosticsEnrichis] = useState<import("../../api/types").DiagnosticCatalogue[]>([]);
  const [templatesDoc, setTemplatesDoc] = useState<import("../../api/types").TemplateDocumentaire[]>([]);
  const [diagFilter, setDiagFilter] = useState<string | null>(null);
  const [libFilter, setLibFilter] = useState<string | null>(null);

  useEffect(() => {
    api.listDiagnosticsEnrichis().then(d => setDiagnosticsEnrichis(d || [])).catch(() => {});
    api.listTemplatesDocumentaires().then(d => setTemplatesDoc(d || [])).catch(() => {});
  }, []);

  const filtered = activeCategory
    ? templates.filter((t) => t.categorie === activeCategory)
    : templates;

  // Group diagnostics by department
  const DEPT_LABELS: Record<string, { label: string; gradient: string }> = {
    direction: { label: "Tactique (CEO)", gradient: "from-slate-700 to-slate-600" },
    finance: { label: "Finance (CFO)", gradient: "from-emerald-600 to-teal-500" },
    technologie: { label: "Technologie (CTO)", gradient: "from-blue-700 to-indigo-600" },
    marketing: { label: "Marketing (CMO)", gradient: "from-fuchsia-600 to-pink-500" },
    strategie: { label: "Strategie (CSO)", gradient: "from-violet-700 to-purple-600" },
    operations: { label: "Operations (COO)", gradient: "from-orange-600 to-orange-500" },
    production: { label: "Production (CPO)", gradient: "from-slate-600 to-slate-500" },
    rh: { label: "RH (CHRO)", gradient: "from-teal-600 to-teal-500" },
    innovation: { label: "Innovation (CINO)", gradient: "from-rose-600 to-rose-500" },
    ventes: { label: "Ventes (CRO)", gradient: "from-amber-600 to-amber-500" },
    legal: { label: "Legal (CLO)", gradient: "from-indigo-600 to-indigo-500" },
    securite: { label: "Securite (CISO)", gradient: "from-zinc-700 to-zinc-600" },
  };

  const INDUSTRIE_LABELS: Record<string, string> = {
    manufacturier: "Manufacturier",
    agroalimentaire: "Agroalimentaire",
    construction: "Construction",
    services: "Services professionnels",
    distribution: "Distribution",
    technologie: "Technologie / SaaS",
    ressources: "Ressources naturelles",
    sante: "Sante / Sciences de la vie",
    transport: "Transport / Logistique",
    social: "Économie sociale",
  };

  const diagDepts = [...new Set(diagnosticsEnrichis.map(d => d.departement))];

  const filteredDiag = diagFilter
    ? diagnosticsEnrichis.filter(d => d.departement === diagFilter)
    : diagnosticsEnrichis;

  // Bibliotheque: group by department
  const LIB_DEPT_MAP: Record<string, string> = {
    CEOB: "direction", CTOB: "technologie", CFOB: "finance", CMOB: "marketing",
    CSOB: "strategie", COOB: "operations", CPOB: "production", CHROB: "rh",
    CINOB: "innovation", CROB: "ventes", CLOB: "legal", CISOB: "securite",
  };
  const libDepts = [...new Set(templatesDoc.map(t => t.departement))];
  const filteredLib = libFilter
    ? templatesDoc.filter(t => t.departement === libFilter)
    : templatesDoc;

  const handlePreview = async (alias: string) => {
    const data = await previewTemplate(alias);
    if (data) {
      setPreviewData(data);
      setPreviewOpen(true);
    }
  };

  const handleGenerate = async (alias: string) => {
    setGenerating(alias);
    try {
      const res = await generateDocument(alias);
      if (res?.download_url) {
        window.open(res.download_url, "_blank");
      }
    } finally {
      setGenerating(null);
    }
  };

  // Gradient par categorie
  const CAT_GRADIENTS: Record<string, string> = {
    FACTORY: "from-slate-500 to-slate-600",
    CEO: "from-blue-500 to-blue-600",
    CTO: "from-violet-500 to-violet-600",
    CFO: "from-emerald-500 to-emerald-600",
    CMO: "from-pink-500 to-pink-600",
    CSO: "from-red-500 to-red-600",
    COO: "from-orange-500 to-orange-600",
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher: Generateur | Bibliotheque | Diagnostics */}
      <div className="flex gap-2 border-b border-gray-100 pb-2">
        <button
          onClick={() => setTemplateTab("generateur")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-t-lg font-medium transition-colors cursor-pointer",
            templateTab === "generateur" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Générateur ({templates.length})
          </div>
        </button>
        <button
          onClick={() => setTemplateTab("bibliotheque")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-t-lg font-medium transition-colors cursor-pointer",
            templateTab === "bibliotheque" ? "bg-violet-50 text-violet-700 border-b-2 border-violet-600" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Bibliothèque ({templatesDoc.length})
          </div>
        </button>
        <button
          onClick={() => setTemplateTab("diagnostics")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-t-lg font-medium transition-colors cursor-pointer",
            templateTab === "diagnostics" ? "bg-cyan-50 text-cyan-700 border-b-2 border-cyan-600" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Diagnostics ({diagnosticsEnrichis.length})
          </div>
        </button>
      </div>

      {/* ── DIAGNOSTICS TAB ── */}
      {templateTab === "diagnostics" && (
        <div className="space-y-4">
          {/* Filtres par departement */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setDiagFilter(null)}
              className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", !diagFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
            >
              Tous ({diagnosticsEnrichis.length})
            </button>
            {diagDepts.map(dept => (
              <button key={dept} onClick={() => setDiagFilter(dept === diagFilter ? null : dept)}
                className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", diagFilter === dept ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
              >
                {DEPT_LABELS[dept]?.label || dept} ({diagnosticsEnrichis.filter(d => d.departement === dept).length})
              </button>
            ))}
          </div>

          {/* Grille diagnostics enrichis */}
          <div className="grid grid-cols-2 gap-3">
            {filteredDiag.map(diag => {
              const deptCfg = DEPT_LABELS[diag.departement];
              const gradient = diag.gradient || deptCfg?.gradient || "from-gray-500 to-gray-600";
              const dpCount = diag.data_points?.length || 0;
              return (
                <Card key={diag.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className={cn("bg-gradient-to-r px-3 py-2.5", gradient)}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-white/70 uppercase">{deptCfg?.label || diag.departement}</span>
                      {dpCount > 0 && <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">{dpCount} indicateurs</span>}
                    </div>
                    <p className="text-xs font-semibold text-white mt-0.5 truncate">{diag.titre}</p>
                  </div>
                  <div className="px-3 py-2.5 space-y-2">
                    <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{diag.description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{diag.duree_minutes} min</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{diag.nb_questions} questions</span>
                      <span className="text-[9px] text-gray-400 ml-auto">{diag.bot_primaire}</span>
                    </div>
                    {diag.valeur_potentielle && (
                      <p className="text-[9px] text-emerald-600 leading-relaxed line-clamp-1">
                        {diag.valeur_potentielle}
                      </p>
                    )}
                    {diag.gaps_typiques && diag.gaps_typiques.length > 0 && (
                      <div className="text-[9px] text-amber-600 bg-amber-50 rounded px-2 py-1">
                        Gap: {diag.gaps_typiques[0].gap.slice(0, 80)}...
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          {filteredDiag.length === 0 && (
            <EmptyState icon={Search} text="Aucun diagnostic" sub="Les diagnostics seront charges depuis le serveur" />
          )}
        </div>
      )}

      {/* ── BIBLIOTHEQUE TAB ── */}
      {templateTab === "bibliotheque" && (
        <div className="space-y-4">
          {/* Filtres par departement */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setLibFilter(null)}
              className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", !libFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
            >
              Tous ({templatesDoc.length})
            </button>
            {libDepts.map(dept => {
              const deptKey = LIB_DEPT_MAP[dept] || dept.toLowerCase();
              return (
                <button key={dept} onClick={() => setLibFilter(dept === libFilter ? null : dept)}
                  className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", libFilter === dept ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                >
                  {DEPT_LABELS[deptKey]?.label || dept} ({templatesDoc.filter(t => t.departement === dept).length})
                </button>
              );
            })}
          </div>

          {/* Grille templates documentaires */}
          <div className="grid grid-cols-2 gap-3">
            {filteredLib.map(tpl => {
              const deptKey = LIB_DEPT_MAP[tpl.departement] || tpl.departement.toLowerCase();
              const deptCfg = DEPT_LABELS[deptKey];
              const gradient = deptCfg?.gradient || "from-gray-500 to-gray-600";
              const nbSections = tpl.sections?.length || 0;
              return (
                <Card key={tpl.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className={cn("bg-gradient-to-r px-3 py-2.5", gradient)}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-white/70 uppercase">{deptCfg?.label || tpl.departement}</span>
                      <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">{tpl.categorie}</span>
                    </div>
                    <p className="text-xs font-semibold text-white mt-0.5 truncate">{tpl.titre}</p>
                  </div>
                  <div className="px-3 py-2.5 space-y-2">
                    <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{tpl.description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-medium">{tpl.pages_estimees} pages</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{tpl.frequence}</span>
                      {nbSections > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{nbSections} sections</span>}
                    </div>
                    {tpl.sections && tpl.sections.length > 0 && (
                      <div className="text-[9px] text-gray-400 leading-relaxed">
                        {tpl.sections.slice(0, 3).map((s, i) => (
                          <span key={i}>{i > 0 ? " · " : ""}{s.titre_section}</span>
                        ))}
                        {tpl.sections.length > 3 && <span className="text-gray-300"> +{tpl.sections.length - 3}</span>}
                      </div>
                    )}
                    {tpl.tags && tpl.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {tpl.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] text-gray-400">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          {filteredLib.length === 0 && (
            <EmptyState icon={FileText} text="Aucun template" sub="Les templates documentaires seront charges depuis le serveur" />
          )}
        </div>
      )}

      {/* ── GENERATEUR TAB ── */}
      {templateTab === "generateur" && (<>
      {/* Filtre par categorie */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer",
            !activeCategory ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200"
          )}
        >
          Tous ({templates.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={cn(
              "text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer",
              activeCategory === cat ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200"
            )}
          >
            {cat} ({templates.filter((t) => t.categorie === cat).length})
          </button>
        ))}
      </div>

      {/* Grille de templates */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} text="Aucun template" sub="Les templates seront charges depuis le serveur" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((tpl) => {
            const gradient = CAT_GRADIENTS[tpl.categorie] || "from-gray-500 to-gray-600";
            return (
              <Card key={tpl.alias} className="overflow-hidden">
                <div className={cn("bg-gradient-to-r px-3 py-2", gradient)}>
                  <span className="text-[9px] font-bold text-white/80">{tpl.categorie}</span>
                  <p className="text-xs font-semibold text-white truncate mt-0.5">{tpl.nom}</p>
                </div>
                <div className="px-3 py-2 flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(tpl.alias)}
                    className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer font-medium transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Apercu
                  </button>
                  <button
                    onClick={() => handleGenerate(tpl.alias)}
                    disabled={generating === tpl.alias}
                    className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer font-medium transition-colors disabled:opacity-50"
                  >
                    {generating === tpl.alias ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Générer
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      </>)}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewData?.nom || "Apercu"}</DialogTitle>
            <DialogDescription>Aperçu du template — les placeholders seront remplacés à la génération.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border rounded-lg p-4 bg-gray-50 max-h-[50vh] overflow-auto">
            {previewData?.contenu || "Chargement..."}
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                if (previewData?.alias) handleGenerate(previewData.alias);
                setPreviewOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer font-medium transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Générer ce document
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ══════════════════════════════════════════
// OUTILS PAGE — Calculateurs manufacturiers intégrés
// ══════════════════════════════════════════

const OUTILS_MANUFACTURIERS = [
  {
    id: "oee",
    titre: "Calculateur OEE / TRS",
    description: "Mesure le Taux de Rendement Synthetique: disponibilite x performance x qualite. Benchmarks World Class (85%+) et analyse des 6 grandes pertes.",
    icon: Gauge,
    bot: "CPOB",
    color: "from-emerald-600 to-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    tags: ["production", "performance"],
    prompt: "Je veux calculer mon OEE (TRS). Guide-moi etape par etape pour entrer ma disponibilite, performance et qualite.",
  },
  {
    id: "roi",
    titre: "Calculateur ROI automatisation",
    description: "Calcule le retour sur investissement d'un projet d'automatisation: payback, VAN, TRI, flux de tresorerie sur 5 ans.",
    icon: BarChart3,
    bot: "CPOB",
    color: "from-blue-600 to-blue-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    tags: ["finance", "automatisation"],
    prompt: "Je veux calculer le ROI d'un projet d'automatisation. Guide-moi pour entrer l'investissement, les gains annuels et la duree.",
  },
  {
    id: "materiaux",
    titre: "Prix des materiaux industriels",
    description: "Reference des prix: acier (HRC, CRC, inox 304/316), aluminium (6061, 7075), cuivre, laiton, titane, plastiques techniques.",
    icon: Package,
    bot: "CPOB",
    color: "from-amber-600 to-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    tags: ["matieres-premieres", "approvisionnement"],
    prompt: "Montre-moi les prix de reference des materiaux industriels. J'ai besoin de comparer les couts.",
  },
  {
    id: "convertir",
    titre: "Convertisseur d'unites industrielles",
    description: "40+ conversions: longueur (mm/in), poids (kg/lb), pression (psi/bar), temperature, couple, debit, vitesse, puissance.",
    icon: Ruler,
    bot: "CPOB",
    color: "from-violet-600 to-violet-500",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    tags: ["conversion", "unites"],
    prompt: "J'ai besoin de convertir des unites industrielles. Quelles conversions sont disponibles?",
  },
  {
    id: "energie",
    titre: "Calculateur cout energetique",
    description: "Estime les couts d'electricite selon les tarifs Hydro-Quebec 2025-2026: tarif G, M et LG avec puissance et consommation.",
    icon: Zap,
    bot: "CPOB",
    color: "from-yellow-600 to-yellow-500",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    tags: ["energie", "couts"],
    prompt: "Je veux calculer mes couts energetiques avec les tarifs Hydro-Quebec. Guide-moi pour entrer ma puissance et ma consommation.",
  },
  {
    id: "gains",
    titre: "Calculateur de gains manufacturier",
    description: "Analyse complete des gains potentiels: pertes d'opportunites, capacite, personnel, retention, qualite, volume. Budget et ROI 5 ans.",
    icon: DollarSign,
    bot: "CPOB",
    color: "from-green-600 to-green-500",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    tags: ["finance", "gains"],
    prompt: "Je veux analyser les gains potentiels d'un projet manufacturier. Guide-moi a travers les 6 categories de gains.",
  },
  {
    id: "estimation",
    titre: "Estimateur de couts de projet",
    description: "Estimation par postes: main-d'oeuvre, materiaux, equipements, sous-traitance. Majoration frais generaux, profit et contingence.",
    icon: Calculator,
    bot: "CPOB",
    color: "from-slate-600 to-slate-500",
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
    tags: ["estimation", "budget"],
    prompt: "J'ai besoin d'estimer les couts d'un projet manufacturier. Guide-moi pour batir l'estimation par postes.",
  },
  {
    id: "qualite",
    titre: "Audit qualite et conformite",
    description: "Verification de conformite ISO 13485, FDA 21 CFR 820. KPIs qualite: FPY, taux de non-conformite, efficacite CAPA.",
    icon: Scale,
    bot: "CPOB",
    color: "from-red-600 to-red-500",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    tags: ["qualite", "conformite"],
    prompt: "Je veux faire un audit qualite de mon processus de production. Quels KPIs et standards devrions-nous verifier?",
  },
];

export function NotificationsPage() {
  // Notifications: decisions recentes, alertes, rappels
  const MOCK_NOTIFS = [
    { id: 1, type: "decision", titre: "Nouveau chantier cree", detail: "Chantier 'Expansion Ontario' ajoute par CarlOS", time: "Il y a 2h", read: false },
    { id: 2, type: "mission", titre: "Mission completee", detail: "Mission V7 Training terminee (77%)", time: "Hier", read: false },
    { id: 3, type: "alerte", titre: "Document en attente", detail: "Bible Produit V2.1 en revision depuis 3 jours", time: "Il y a 3j", read: true },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Notifications recentes</span>
        <button className="text-[9px] text-blue-600 hover:underline cursor-pointer">Tout marquer lu</button>
      </div>
      <div className="space-y-2">
        {MOCK_NOTIFS.map(n => (
          <div key={n.id} className={cn(
            "w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer",
            !n.read && "border-blue-200"
          )}>
            <div className={cn("px-4 py-3 flex items-center gap-3 bg-gradient-to-r",
              n.type === "decision" ? "from-blue-600 to-blue-500"
                : n.type === "mission" ? "from-violet-600 to-violet-500"
                : "from-amber-600 to-amber-500"
            )}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">{n.titre}</span>
              </div>
              {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />}
              <ChevronRight className="h-4 w-4 text-white/50 shrink-0" />
            </div>
            <div className="px-4 py-3">
              <p className="text-[9px] text-gray-500">{n.detail}</p>
              <span className="text-[9px] text-gray-400 mt-1 block">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutilsPage() {
  const { navigateToDepartment } = useFrameMaster();
  const { newConversation, sendMessage } = useChatContext();
  const [outilViewMode, setOutilViewMode] = useState<"cards" | "list" | "spreadsheet">("cards");
  const [outilSearch, setOutilSearch] = useState("");

  const handleToolClick = (outil: typeof OUTILS_MANUFACTURIERS[0]) => {
    navigateToDepartment(outil.bot, "live-chat");
    newConversation();
    setTimeout(() => {
      sendMessage(outil.prompt);
    }, 300);
  };

  const filteredOutils = useMemo(() => {
    if (!outilSearch.trim()) return OUTILS_MANUFACTURIERS;
    const q = outilSearch.toLowerCase();
    return OUTILS_MANUFACTURIERS.filter(o => o.titre.toLowerCase().includes(q) || o.description.toLowerCase().includes(q) || o.tags.some(t => t.toLowerCase().includes(q)));
  }, [outilSearch]);

  return (
    <div className="space-y-3">
      {/* TOOLBAR — pattern chantier unifie */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={outilSearch} onChange={e => setOutilSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
        </div>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {([
            { mode: "cards" as const, icon: LayoutGrid, title: "Cartes" },
            { mode: "list" as const, icon: List, title: "Liste" },
            { mode: "spreadsheet" as const, icon: Table2, title: "Tableur" },
          ]).map(({ mode, icon: MIcon, title }) => (
            <button key={mode} onClick={() => setOutilViewMode(mode)}
              className={cn("p-1.5 transition-colors cursor-pointer", outilViewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}
              title={title}>
              <MIcon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <span className="text-[9px] font-bold text-gray-400">{filteredOutils.length} items</span>
      </div>

      {filteredOutils.length === 0 && (
        <EmptyState icon={Wrench} text={`Aucun resultat pour "${outilSearch}"`} sub="Modifiez votre recherche" />
      )}

      {/* CARDS VIEW */}
      {outilViewMode === "cards" && filteredOutils.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredOutils.map((outil) => {
            const OIcon = outil.icon;
            return (
              <Card key={outil.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleToolClick(outil)}>
                <div className={cn("flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r", outil.color)}>
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <OIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-white flex-1 truncate">{outil.titre}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors shrink-0" />
                </div>
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[9px] text-gray-500 line-clamp-2">{outil.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {outil.tags.map((tag) => (
                      <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>{tag}</span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {outilViewMode === "list" && filteredOutils.length > 0 && (
        <div className="space-y-1">
          {filteredOutils.map((outil) => {
            const OIcon = outil.icon;
            return (
              <div key={outil.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleToolClick(outil)}>
                <OIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                <span className="text-[9px] font-bold flex-1 truncate text-gray-800">{outil.titre}</span>
                {outil.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>{tag}</span>
                ))}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Paco</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* SPREADSHEET VIEW */}
      {outilViewMode === "spreadsheet" && filteredOutils.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-[9px] table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase text-[9px] w-[35%]">Outil</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[35%]">Description</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[15%]">Tags</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase text-[9px] w-[15%]">Bot</th>
              </tr>
            </thead>
            <tbody>
              {filteredOutils.map((outil) => (
                <tr key={outil.id} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                  onClick={() => handleToolClick(outil)}>
                  <td className="px-3 py-2 font-medium text-gray-800 truncate">{outil.titre}</td>
                  <td className="px-2 py-2 text-gray-500 truncate">{outil.description.slice(0, 80)}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1 flex-wrap">{outil.tags.map(tag => (
                      <span key={tag} className={cn("px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>{tag}</span>
                    ))}</div>
                  </td>
                  <td className="px-2 py-2"><span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Paco</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN VIEW — MonBureauView
// ══════════════════════════════════════════

export function MonBureauView() {
  const { activeEspaceSection, navigateEspace } = useFrameMaster();

  const tabs: TabDef[] = ESPACE_TABS.map(t => ({ id: t.id, label: t.label, icon: t.icon }));

  const renderPage = () => {
    switch (activeEspaceSection) {
      case "idees":
        return <IdeesPage />;
      case "discussions":
        return <DiscussionView />;
      case "documents":
        return <DocumentsUnifie />;
      case "notifications":
        return <NotificationsPage />;
      case "outils":
        return <OutilsPage />;
      case "taches":
        return <HierarchieGHML defaultLevel="taches" />;
      case "agenda":
        return <AgendaPage />;
      case "templates":
        return <TemplatesPage />;
      default:
        return <IdeesPage />;
    }
  };

  return (
    <SectionFrame
      title="Mon Bureau"
      subtitle=""
      icon={Briefcase}
      iconColor="text-amber-600"
      tabs={tabs}
      activeTab={activeEspaceSection}
      onTabChange={(tab) => navigateEspace(tab as EspaceSection)}
    >
      {renderPage()}
    </SectionFrame>
  );
}
