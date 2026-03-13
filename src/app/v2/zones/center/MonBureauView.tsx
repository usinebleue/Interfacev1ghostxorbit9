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
  PenLine,
  Calculator,
  Zap,
  Ruler,
  DollarSign,
  BarChart3,
  Package,
  Gauge,
  Scale,
  Briefcase,
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
import { BOT_AVATAR } from "../../api/types";
import type { BureauItemCreate, PlaneTacheCreate, TemplatePreview } from "../../api/types";
import { useBureau, useTaches, useTemplates, useIdees } from "../../api/hooks";
import { api } from "../../api/client";
import { CarlOSPresence } from "../center/CarlOSPresence";
import { DocumentWorkflow } from "../center/DocumentWorkflow";
import { SectionFrame } from "./shared/SectionFrame";
import type { TabDef } from "./shared/section-types";

// ── Sub-tabs config (pattern Orbit9DetailView) ──

const ESPACE_TABS: { id: EspaceSection; label: string; icon: React.ElementType }[] = [
  { id: "idees", label: "Idees", icon: Sparkles },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "outils", label: "Outils", icon: Wrench },
  { id: "taches", label: "Taches", icon: CheckSquare },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
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

const BOT_LABELS: Record<string, { label: string; short: string }> = {
  CEOB: { label: "CarlOS", short: "CEO" },
  CTOB: { label: "Tim", short: "CTO" },
  CFOB: { label: "Frank", short: "CFO" },
  CMOB: { label: "Mathilde", short: "CMO" },
  CSOB: { label: "Simone", short: "CSO" },
  COOB: { label: "Olivier", short: "COO" },
  CPOB: { label: "Paco", short: "CPO" },
  CHROB: { label: "Helene", short: "CHRO" },
  CINOB: { label: "Ines", short: "CINO" },
  CROB: { label: "Rich", short: "CRO" },
  CLOB: { label: "Loulou", short: "CLO" },
  CISOB: { label: "Sebastien", short: "CISO" },
};

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddIdeeDialog, setShowAddIdeeDialog] = useState(false);
  const [botFilter, setBotFilter] = useState<string | null>(null);
  const ideesHook = useIdees();

  const handleAddIdee = async (titre: string, contenu: string) => {
    await ideesHook.create({ titre, contenu: contenu || titre, source: "Manuel", bot: "CEOB" });
  };

  const allIdees = ideesHook.idees;
  const idees = botFilter ? allIdees.filter(c => c.bot === botFilter) : allIdees;

  // Compteurs par bot pour les filter pills
  const botCounts = allIdees.reduce((acc, c) => {
    const b = c.bot || "CEOB";
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const activeBots = Object.keys(botCounts).sort();

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Rechercher dans les idees..."
        viewMode={viewMode}
        onToggleView={() => setViewMode(v => v === "grid" ? "list" : "grid")}
        onAdd={() => setShowAddIdeeDialog(true)}
        addLabel="Idee"
      />

      {/* Filter pills par bot (pattern Pipeline) */}
      {activeBots.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setBotFilter(null)}
            className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1",
              !botFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
          >
            Toutes ({allIdees.length})
          </button>
          {activeBots.map(bot => {
            const avatar = BOT_AVATAR[bot];
            const info = BOT_LABELS[bot];
            return (
              <button key={bot} onClick={() => setBotFilter(bot === botFilter ? null : bot)}
                className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1",
                  botFilter === bot ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
              >
                {avatar && <img src={avatar} alt={bot} className="w-3.5 h-3.5 rounded-full object-cover" />}
                {info?.label || bot} ({botCounts[bot]})
              </button>
            );
          })}
        </div>
      )}

      {ideesHook.loading ? (
        <LoadingSpinner />
      ) : idees.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          text={botFilter ? "Aucune idee de cet agent" : "Aucune idee pour l'instant"}
          sub="Discutez avec CarlOS — vos idees seront classees ici automatiquement"
        />
      ) : viewMode === "grid" ? (
        /* ── Vue grille — gradient header par bot (pattern Pipeline) ── */
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
      ) : (
        /* ── Vue liste — avatar bot + badges (pattern Pipeline) ── */
        <div className="space-y-1.5">
          {idees.map(c => {
            const bot = c.bot || "CEOB";
            const avatar = BOT_AVATAR[bot];
            const info = BOT_LABELS[bot];
            const tags = c.tags && c.tags.length > 0 ? c.tags : [c.mode || "brainstorm"];
            const date = c.created_at ? new Date(c.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
            return (
              <Card key={c.id} className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt={bot} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-800 truncate">{c.titre}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{info?.label || bot}</Badge>
                      {date && <span className="text-[9px] text-gray-400">{date}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
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

// ══════════════════════════════════════════
// GENERATE DOCUMENT DIALOG
// ══════════════════════════════════════════

function GenerateDocumentDialog({
  open,
  onClose,
  preview,
  loadingPreview,
  onGenerate,
  onWorkflow,
}: {
  open: boolean;
  onClose: () => void;
  preview: TemplatePreview | null;
  loadingPreview: boolean;
  onGenerate: (donnees: Record<string, string>, client: string) => Promise<void>;
  onWorkflow?: () => void;
}) {
  const [client, setClient] = useState("Client");
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ titre: string; download_url: string } | null>(null);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setPlaceholderValues({});
      setClient("Client");
      setGenerating(false);
      setResult(null);
    }
  }, [open, preview?.alias]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate(placeholderValues, client);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {preview ? preview.nom : "Charger..."}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {preview ? `${preview.categorie} — ${preview.placeholders.length} champ(s) a remplir` : ""}
          </DialogDescription>
        </DialogHeader>

        {loadingPreview ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : preview ? (
          <div className="space-y-4">
            {/* Apercu markdown (collapsed) */}
            <details className="group">
              <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                Apercu du template ({preview.contenu_md.split("\n").length} lignes)
              </summary>
              <pre className="mt-2 text-[10px] text-gray-500 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {preview.contenu_md.slice(0, 2000)}
                {preview.contenu_md.length > 2000 ? "\n..." : ""}
              </pre>
            </details>

            {/* Client name */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Nom du client</label>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Nom du client"
              />
            </div>

            {/* Placeholders */}
            {preview.placeholders.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Champs du template</p>
                {preview.placeholders.map((ph) => (
                  <div key={ph}>
                    <label className="text-[10px] text-gray-500 block mb-0.5">{ph}</label>
                    <input
                      value={placeholderValues[ph] || ""}
                      onChange={(e) => setPlaceholderValues((prev) => ({ ...prev, [ph]: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder={`Valeur pour ${ph}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Narratives info */}
            {preview.narratives.length > 0 && (
              <p className="text-[10px] text-gray-400">
                {preview.narratives.length} bloc(s) narratif(s) — seront completes par CarlOS en Phase 2
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Annuler
          </button>
          {onWorkflow && preview && (
            <button
              onClick={onWorkflow}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 border border-violet-200 cursor-pointer"
            >
              <PenLine className="h-3.5 w-3.5" />
              Travailler ce document
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating || !preview}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            Generer PDF
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentsPage() {
  const [docTab, setDocTab] = useState<"generes" | "templates" | "importes">("generes");
  const { items: allDocs, loading, error, uploadFile, refresh: refreshDocs } = useBureau("document");
  const { templates, categories, total: templateTotal, loading: loadingTemplates } = useTemplates();
  const [tplCatFilter, setTplCatFilter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Generate dialog state
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<TemplatePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Workflow state (Phase 2)
  const [workflowActive, setWorkflowActive] = useState(false);

  const generes = allDocs.filter((d) => (d.metadata as Record<string, unknown>)?.categorie === "genere");
  const importes = allDocs.filter((d) => (d.metadata as Record<string, unknown>)?.categorie !== "genere");

  // Grouper templates par categorie
  const templatesByCategory = categories.map((cat) => ({
    categorie: cat,
    items: templates.filter((t) => t.categorie === cat),
  }));

  const handleTemplateClick = async (alias: string) => {
    setGenerateDialogOpen(true);
    setSelectedPreview(null);
    setLoadingPreview(true);
    try {
      const preview = await api.previewTemplate(alias);
      setSelectedPreview(preview);
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGenerate = async (donnees: Record<string, string>, client: string) => {
    if (!selectedPreview) return;
    try {
      const result = await api.generateDocument({
        template_alias: selectedPreview.alias,
        donnees,
        client,
      });
      // Ouvrir le PDF dans un nouvel onglet
      const url = api.documentDownloadUrl(result.nom_fichier);
      window.open(url, "_blank");
      setGenerateDialogOpen(false);
      // Rafraichir la liste des documents generes
      refreshDocs();
    } catch (err) {
      console.error("Generate error:", err);
      alert(err instanceof Error ? err.message : "Erreur generation");
    }
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

  const DOC_TABS = [
    { id: "generes" as const, label: "Mes Documents" },
    { id: "templates" as const, label: `Templates (${templateTotal})` },
    { id: "importes" as const, label: "Importes" },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tabs internes */}
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

      {error && <ErrorBanner message={error} />}

      {/* Mes Documents — style Pipeline harmonise */}
      {docTab === "generes" && (
        <div className="space-y-3">
          {loading ? (
            <LoadingSpinner />
          ) : generes.length === 0 ? (
            <EmptyState icon={FileText} text="Aucun document genere" sub="Les documents generes par CarlOS apparaitront ici" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {generes.map((doc) => {
                const meta = doc.metadata as Record<string, string>;
                const fileType = meta?.file_type || "PDF";
                const bot = doc.bot || "CEOB";
                const gradient = BOT_GRADIENTS[bot] || "from-green-600 to-green-500";
                const avatar = BOT_AVATAR[bot];
                const info = BOT_LABELS[bot];
                const downloadUrl = meta?.source === "documents_generes" && meta?.file_path
                  ? api.documentDownloadUrl(meta.file_path)
                  : meta?.file_path
                    ? api.bureauDownloadUrl(meta.file_path)
                    : null;
                const date = doc.created_at ? new Date(doc.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
                return (
                  <Card key={doc.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", gradient)}>
                      {avatar ? (
                        <img src={avatar} alt={bot} className="w-7 h-7 rounded-lg object-cover border-2 border-white/30 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white">{info?.label || bot}</span>
                        <span className="text-[9px] text-white/60 ml-1.5">{info?.short}</span>
                      </div>
                      <Badge className="text-[9px] bg-white/20 text-white border-0">{fileType}</Badge>
                    </div>
                    <div className="p-3 space-y-1.5">
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2">{doc.titre}</h3>
                      {doc.description && (
                        <p className="text-[9px] text-gray-500 line-clamp-2">{doc.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {meta?.taille && <span className="text-[9px] text-gray-400">{meta.taille}</span>}
                          {date && <span className="text-[9px] text-gray-400">{date}</span>}
                        </div>
                        {downloadUrl && (
                          <a
                            href={downloadUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Telecharger"
                          >
                            <Download className="h-3.5 w-3.5 text-gray-400" />
                          </a>
                        )}
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {doc.tags.map(tag => (
                            <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Templates — cartes riches par document (style Pipeline) */}
      {docTab === "templates" && (
        <div className="space-y-3">
          {loadingTemplates ? (
            <LoadingSpinner />
          ) : templates.length === 0 ? (
            <EmptyState icon={FileText} text="Aucun template disponible" sub="Les templates seront charges depuis le serveur" />
          ) : (<>
            {/* Filtre pills par agent */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setTplCatFilter(null)}
                className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1", !tplCatFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
              >
                Tous ({templateTotal})
              </button>
              {categories.map(cat => {
                const botCode = CAT_TO_BOT[cat];
                const avatar = botCode ? BOT_AVATAR[botCode] : null;
                const info = botCode ? BOT_LABELS[botCode] : null;
                return (
                  <button key={cat} onClick={() => setTplCatFilter(cat === tplCatFilter ? null : cat)}
                    className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1", tplCatFilter === cat ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                  >
                    {avatar && <img src={avatar} alt={cat} className="w-3.5 h-3.5 rounded-full object-cover" />}
                    {info?.label || cat} ({templates.filter(t => t.categorie === cat).length})
                  </button>
                );
              })}
            </div>
            {/* Grille cartes individuelles par template */}
            <div className="grid grid-cols-2 gap-3">
              {templates.filter(t => !tplCatFilter || t.categorie === tplCatFilter).map((t) => {
                const botCode = CAT_TO_BOT[t.categorie];
                const gradient = TEMPLATE_COLORS[t.categorie] || "from-gray-600 to-gray-500";
                const avatar = botCode ? BOT_AVATAR[botCode] : null;
                const info = botCode ? BOT_LABELS[botCode] : null;
                // Extraire un apercu du nom pour donner du contexte
                const parts = t.nom.split(" — ");
                const mainTitle = parts[0] || t.nom;
                const subTitle = parts.length > 1 ? parts.slice(1).join(" — ") : null;
                return (
                  <Card
                    key={t.alias}
                    className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleTemplateClick(t.alias)}
                  >
                    <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", gradient)}>
                      {avatar ? (
                        <img src={avatar} alt={t.categorie} className="w-7 h-7 rounded-lg object-cover border-2 border-white/30 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white">{info?.label || t.categorie}</span>
                        <span className="text-[9px] text-white/60 ml-1.5">{info?.short || ""}</span>
                      </div>
                      <Eye className="h-3.5 w-3.5 text-white/40 group-hover:text-white/80 transition-colors shrink-0" />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2">{mainTitle}</h3>
                      {subTitle && (
                        <p className="text-[9px] text-gray-500 leading-relaxed">{subTitle}</p>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-medium">{t.categorie}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">PDF</span>
                        <span className="text-[9px] text-gray-400 ml-auto flex items-center gap-0.5 group-hover:text-gray-600 transition-colors">
                          <ChevronRight className="h-3.5 w-3.5" />
                          Generer
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>)}
        </div>
      )}

      {/* Importes — style harmonise */}
      {docTab === "importes" && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 text-blue-500 mx-auto mb-2 animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            )}
            <p className="text-xs text-gray-600 font-medium">
              {uploading ? "Telechargement en cours..." : "Glissez vos fichiers ici ou cliquez"}
            </p>
            <p className="text-[9px] text-gray-400 mt-1">PDF, DOCX, XLSX, images — max 50 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.zip,.txt,.pptx"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          {/* Grille fichiers importes — style Pipeline */}
          {loading ? (
            <LoadingSpinner />
          ) : importes.length === 0 ? (
            <EmptyState icon={Upload} text="Aucun fichier importe" sub="Glissez-deposez ou cliquez pour importer" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {importes.map((doc) => {
                const meta = doc.metadata as Record<string, string>;
                const fileType = meta?.file_type || "FILE";
                const FIcon = FILE_ICONS[fileType] || File;
                const date = doc.created_at ? new Date(doc.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
                return (
                  <Card key={doc.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="bg-gradient-to-r from-slate-600 to-slate-500 px-3 py-2.5 flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <FIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white flex-1 truncate">{fileType}</span>
                      {date && <span className="text-[9px] text-white/60">{date}</span>}
                    </div>
                    <div className="p-3 space-y-1.5">
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2">{doc.titre}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {meta?.taille && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{meta.taille}</span>}
                          {doc.tags.map(tag => (
                            <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        {meta?.file_path && (
                          <a
                            href={api.bureauDownloadUrl(meta.file_path)}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Telecharger"
                          >
                            <Download className="h-3.5 w-3.5 text-gray-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Generate Document Dialog */}
      <GenerateDocumentDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        preview={selectedPreview}
        loadingPreview={loadingPreview}
        onGenerate={handleGenerate}
        onWorkflow={() => {
          setGenerateDialogOpen(false);
          setWorkflowActive(true);
        }}
      />

      {/* Document Workflow (Phase 2) */}
      {workflowActive && selectedPreview && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <DocumentWorkflow
            templateAlias={selectedPreview.alias}
            templateName={selectedPreview.nom}
            categorie={selectedPreview.categorie}
            preview={selectedPreview}
            onClose={() => setWorkflowActive(false)}
            onDocumentGenerated={() => refreshDocs()}
          />
        </div>
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
  const [tacheSubTab, setTacheSubTab] = useState<"perso" | "projet">("perso");

  // Categoriser par priorite
  const urgentes = taches.filter((t) => t.priority === "urgent");
  const hautes = taches.filter((t) => t.priority === "high");
  const moyennes = taches.filter((t) => t.priority === "medium" || t.priority === "none");
  const basses = taches.filter((t) => t.priority === "low");

  const widgets = [
    { title: "Urgentes", icon: AlertCircle, gradient: "from-red-600 to-red-500", items: urgentes, borderColor: "border-l-red-400" },
    { title: "Hautes", icon: Loader2, gradient: "from-orange-600 to-orange-500", items: hautes, borderColor: "border-l-orange-400" },
    { title: "Moyennes", icon: Timer, gradient: "from-blue-600 to-blue-500", items: moyennes, borderColor: "border-l-blue-400" },
    { title: "Basses", icon: CheckCircle2, gradient: "from-green-600 to-green-500", items: basses, borderColor: "border-l-green-400" },
  ];

  const handleCreateTache = async (data: PlaneTacheCreate) => {
    await createTache(data);
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs: Mes Taches | Taches Projet (C.14) */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button
            onClick={() => setTacheSubTab("perso")}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
              tacheSubTab === "perso" ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200"
            )}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Mes Taches
            {taches.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">{taches.length}</span>}
          </button>
          <button
            onClick={() => setTacheSubTab("projet")}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
              tacheSubTab === "projet" ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200"
            )}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Taches Projet
          </button>
        </div>
        {tacheSubTab === "perso" && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle tache
          </button>
        )}
      </div>

      {/* Sub-tab: Mes Taches (Plane.so) */}
      {tacheSubTab === "perso" && (<>
        {error && <ErrorBanner message={error} />}

        {loading ? (
          <LoadingSpinner />
        ) : taches.length === 0 ? (
          <EmptyState icon={CheckSquare} text="Aucune tache ouverte" sub="Creez une tache ou attendez que Plane.so se synchronise" />
        ) : (
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
                      <p className="text-[9px] text-gray-400 py-2 text-center">Aucune tache</p>
                    ) : (
                      w.items.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => selectTache(t.id)}
                          className={cn("px-2.5 py-2 rounded-lg border-l-[3px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer", w.borderColor)}
                        >
                          <p className="text-xs font-medium text-gray-800 truncate">{t.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {t.labels.length > 0 && (
                              <>
                                <Bot className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-[9px] text-gray-400">{t.labels[0]}</span>
                                <span className="text-[9px] text-gray-300">|</span>
                              </>
                            )}
                            <span className="text-[9px] text-gray-400">
                              #{t.sequence_id}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </>)}

      {/* Sub-tab: Taches Projet (from Strategique) */}
      {tacheSubTab === "projet" && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
            <FolderKanban className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Taches Projet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Les taches extraites de votre Plan Strategique sont accessibles dans la section Strategique &gt; Taches.
              CarlOS synchronisera automatiquement vos taches projet ici.
            </p>
          </div>
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

function AgendaPage() {
  // Meetings reels depuis l'API + evenements demo
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    api.meetingList().then((r) => {
      setMeetings(Array.isArray(r?.meetings) ? r.meetings : []);
    }).catch(() => {}).finally(() => setLoadingMeetings(false));
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    active: "bg-green-100 text-green-700",
    ended: "bg-gray-100 text-gray-600",
    scheduled: "bg-blue-100 text-blue-700",
  };

  // Build events: real meetings + fallback demo events if empty
  const allEvents = useMemo(() => {
    const realEvents = meetings.map((m: any) => ({
      id: m.slug || m.id,
      titre: m.title || m.slug,
      heure: m.created_at ? new Date(m.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) : "",
      date: m.created_at ? new Date(m.created_at) : new Date(),
      type: m.status || "pending",
      bot: m.bot_code || "CEOB",
      duree: m.meeting_type || "meeting",
    }));

    // Si aucun meeting, afficher des events demo
    if (realEvents.length === 0) {
      const today = new Date();
      return [
        { id: "demo-1", titre: "Standup equipe dev", heure: "09:00", date: today, type: "scheduled", bot: "CTOB", duree: "30 min" },
        { id: "demo-2", titre: "Pipeline ventes — point hebdo", heure: "14:00", date: today, type: "scheduled", bot: "CROB", duree: "45 min" },
        { id: "demo-3", titre: "Comite direction", heure: "09:00", date: new Date(today.getTime() + 86400000), type: "scheduled", bot: "CEOB", duree: "1h30" },
      ];
    }
    return realEvents;
  }, [meetings]);

  // Group by day
  const JOURS_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const grouped = useMemo(() => {
    const groups: Record<string, typeof allEvents> = {};
    allEvents.forEach((ev) => {
      const key = ev.date.toLocaleDateString("fr-CA");
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 5);
  }, [allEvents]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-gray-800">
          {meetings.length > 0 ? `${meetings.length} meetings` : "Agenda"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => api.meetingList().then((r) => setMeetings(Array.isArray(r?.meetings) ? r.meetings : [])).catch(() => {})}
            className="px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >Rafraichir</button>
        </div>
      </div>

      {loadingMeetings ? (
        <div className="text-center py-8 text-gray-400 text-xs">Chargement...</div>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {grouped.map(([dateKey, events]) => {
            const d = new Date(dateKey);
            const jourLabel = `${JOURS_LABELS[d.getDay()]} ${d.getDate()}`;
            return (
              <div key={dateKey}>
                <div className="text-xs font-bold text-gray-600 mb-2 px-1">{jourLabel}</div>
                <div className="space-y-2">
                  {events.map((ev) => (
                    <Card key={ev.id} className="p-2.5 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-1.5 mb-1">
                        {BOT_AVATAR[ev.bot] ? (
                          <img src={BOT_AVATAR[ev.bot]} alt="" className="w-4 h-4 rounded-full" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-200" />
                        )}
                        <span className="text-[9px] text-gray-400">{ev.heure}</span>
                      </div>
                      <p className="text-[11px] font-medium text-gray-800 leading-tight mb-1.5">{ev.titre}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={cn("text-[9px]", STATUS_COLORS[ev.type] || "bg-gray-100 text-gray-600")}>
                          {ev.type}
                        </Badge>
                        <span className="text-[9px] text-gray-400">{ev.duree}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Fill remaining columns if less than 5 */}
          {Array.from({ length: Math.max(0, 5 - grouped.length) }).map((_, i) => (
            <div key={`empty-${i}`}>
              <div className="text-xs font-bold text-gray-300 mb-2 px-1">—</div>
              <div className="p-3 border border-dashed border-gray-200 rounded-lg text-center">
                <p className="text-[9px] text-gray-400">Aucun evenement</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    social: "Economie sociale",
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
            Generateur ({templates.length})
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
            Bibliotheque ({templatesDoc.length})
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
                    Generer
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
            <DialogDescription>Apercu du template — les placeholders seront remplaces a la generation.</DialogDescription>
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
              <Download className="h-3.5 w-3.5" /> Generer ce document
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

function OutilsPage() {
  const { navigateToDepartment } = useFrameMaster();
  const { newConversation, sendMessage } = useChatContext();

  const handleToolClick = (outil: typeof OUTILS_MANUFACTURIERS[0]) => {
    navigateToDepartment(outil.bot, "live-chat");
    newConversation();
    setTimeout(() => {
      sendMessage(outil.prompt);
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OUTILS_MANUFACTURIERS.map((outil) => {
          const Icon = outil.icon;
          return (
            <Card
              key={outil.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleToolClick(outil)}
            >
              {/* Gradient header */}
              <div className={cn("flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r", outil.color)}>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex-1 truncate">{outil.titre}</h3>
                <Badge className="text-[9px] bg-white/20 text-white border-0">Paco — CPO</Badge>
              </div>
              {/* Body */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-[9px] text-gray-500 line-clamp-2">{outil.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {outil.tags.map((tag) => (
                    <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>
                      {tag}
                    </span>
                  ))}
                  <span className="text-[9px] text-gray-400 ml-auto flex items-center gap-0.5">
                    <ChevronRight className="h-3.5 w-3.5" />
                    Lancer
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
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
      case "documents":
        return <DocumentsPage />;
      case "outils":
        return <OutilsPage />;
      case "taches":
        return <TachesPage />;
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
