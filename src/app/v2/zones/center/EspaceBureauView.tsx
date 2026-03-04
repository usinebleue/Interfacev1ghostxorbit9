/**
 * EspaceBureauView.tsx — Mon Espace Bureau (canevas central)
 * 5 sous-sections: Idees, Projets, Documents, Outils, Taches
 * Pattern: Orbit9DetailView (sub-tabs dans header)
 * Sprint B — Mon Espace Bureau
 *
 * Donnees reelles: PostgreSQL (projets, docs, outils) + Plane.so (taches) + localStorage (idees)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  FolderKanban,
  FileText,
  Wrench,
  CheckSquare,
  CalendarDays,
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
  X,
  Download,
  MessageSquare,
  ChevronRight,
  Eye,
  PenLine,
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
import { useBureau, useTaches, useTemplates } from "../../api/hooks";
import { api } from "../../api/client";
import { CarlOSPresence } from "../center/CarlOSPresence";
import { DocumentWorkflow } from "../center/DocumentWorkflow";

// ── Sub-tabs config (pattern Orbit9DetailView) ──

const ESPACE_TABS: { id: EspaceSection; label: string; icon: React.ElementType }[] = [
  { id: "idees", label: "Idees", icon: Sparkles },
  { id: "projets", label: "Projets", icon: FolderKanban },
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

const BOT_OPTIONS = ["BCO", "BCT", "BCF", "BCM", "BCS", "BOO", "BHR", "BIO", "BCC", "BPO", "BRO", "BLE"];

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
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
// LISTING PAGE (Idees, Projets, Outils)
// ══════════════════════════════════════════

function ListingPage({ section }: { section: EspaceSection }) {
  const { crystals, addCrystal } = useChatContext();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddIdeeDialog, setShowAddIdeeDialog] = useState(false);

  const projetsHook = useBureau("projet");
  const outilsHook = useBureau("outil");

  const handleCreateBureau = async (data: BureauItemCreate) => {
    if (section === "projets") {
      await projetsHook.createItem(data);
    } else if (section === "outils") {
      await outilsHook.createItem(data);
    }
  };

  const handleAddIdee = (titre: string, contenu: string) => {
    addCrystal({
      titre,
      contenu: contenu || titre,
      source: "Manuel",
      bot: "BCO",
      mode: "brainstorm",
      tags: ["manuel"],
    });
  };

  // Build config per section
  const getConfig = () => {
    if (section === "idees") {
      return {
        color: "amber",
        headerGradient: "from-amber-600 to-amber-500",
        loading: false,
        error: null as string | null,
        items: crystals.map((c) => ({
          id: c.id,
          titre: c.titre,
          description: c.contenu.slice(0, 120),
          bot: c.bot,
          date: new Date(c.date).toLocaleDateString("fr-CA"),
          tags: [c.mode || "brainstorm"],
        })),
      };
    } else if (section === "projets") {
      return {
        color: "blue",
        headerGradient: "from-blue-600 to-blue-500",
        loading: projetsHook.loading,
        error: projetsHook.error,
        items: projetsHook.items.map((p) => ({
          id: String(p.id),
          titre: p.titre,
          description: p.description,
          bot: p.bot || undefined,
          date: p.created_at ? new Date(p.created_at).toLocaleDateString("fr-CA") : undefined,
          tags: p.tags.length > 0 ? p.tags : [p.status || "actif"],
        })),
      };
    } else {
      return {
        color: "orange",
        headerGradient: "from-orange-600 to-orange-500",
        loading: outilsHook.loading,
        error: outilsHook.error,
        items: outilsHook.items.map((o) => ({
          id: String(o.id),
          titre: o.titre,
          description: o.description,
          bot: o.bot || undefined,
          tags: o.tags.length > 0 ? o.tags : [],
        })),
      };
    }
  };

  const config = getConfig();

  const bandeauMessages: Record<string, string> = {
    idees: crystals.length > 0
      ? `${crystals.length} idee${crystals.length > 1 ? "s" : ""} cristallisee${crystals.length > 1 ? "s" : ""} depuis vos conversations. Explorez ou relancez un sujet.`
      : "Cristallisez des reponses de CarlOS pour les retrouver ici. Cliquez sur l'icone cristal dans le LiveChat.",
    projets: config.items.length > 0
      ? `${config.items.length} projet${config.items.length > 1 ? "s" : ""} dans votre bureau.`
      : "Creez votre premier projet pour commencer a organiser votre travail.",
    outils: config.items.length > 0
      ? `${config.items.length} outil${config.items.length > 1 ? "s" : ""} disponible${config.items.length > 1 ? "s" : ""}.`
      : "Ajoutez des outils pour retrouver vos calculateurs et templates.",
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
      {(section === "idees" || section === "projets") && (
        <BandeauProactif message={bandeauMessages[section]} section={section} />
      )}
      <SearchBar
        placeholder={`Rechercher dans ${section === "idees" ? "les idees" : section === "projets" ? "les projets" : "les outils"}...`}
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
        onAdd={() => section === "idees" ? setShowAddIdeeDialog(true) : setShowAddDialog(true)}
        addLabel={section === "idees" ? "Idee" : section === "projets" ? "Projet" : "Outil"}
      />

      {config.error && <ErrorBanner message={config.error} />}
      {config.loading ? (
        <LoadingSpinner />
      ) : config.items.length === 0 ? (
        <EmptyState
          icon={section === "idees" ? Sparkles : section === "projets" ? FolderKanban : Wrench}
          text="Aucun element pour l'instant"
          sub={section === "idees" ? "Cristallisez des reponses ou ajoutez une idee manuellement" : "Cliquez sur + pour ajouter"}
        />
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

      {/* Dialogs */}
      {(section === "projets" || section === "outils") && (
        <AddBureauItemDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          type={section === "projets" ? "projet" : "outil"}
          onCreate={handleCreateBureau}
        />
      )}
      {section === "idees" && (
        <AddIdeeDialog
          open={showAddIdeeDialog}
          onClose={() => setShowAddIdeeDialog(false)}
          onAdd={handleAddIdee}
        />
      )}
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
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
      <BandeauProactif
        message={`${allDocs.length} document${allDocs.length !== 1 ? "s" : ""}, ${templateTotal} templates disponibles.`}
        section="documents"
      />

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

      {/* Mes Documents */}
      {docTab === "generes" && (
        <div className="space-y-2">
          {loading ? (
            <LoadingSpinner />
          ) : generes.length === 0 ? (
            <EmptyState icon={FileText} text="Aucun document genere" sub="Les documents generes par CarlOS apparaitront ici" />
          ) : (
            generes.map((doc) => {
              const meta = doc.metadata as Record<string, string>;
              const fileType = meta?.file_type || "PDF";
              const FIcon = FILE_ICONS[fileType] || FileText;
              // Documents generes → utiliser /documents/download au lieu de /bureau/download
              const downloadUrl = meta?.source === "documents_generes" && meta?.file_path
                ? api.documentDownloadUrl(meta.file_path)
                : meta?.file_path
                  ? api.bureauDownloadUrl(meta.file_path)
                  : null;
              return (
                <Card key={doc.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <FIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-800 truncate">{doc.titre}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{fileType}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400">{meta?.taille || ""}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString("fr-CA") : ""}
                        </span>
                      </div>
                    </div>
                    {doc.bot && (
                      <Badge className="text-[9px] bg-green-50 text-green-700 border-green-200" variant="outline">{doc.bot}</Badge>
                    )}
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title="Telecharger"
                      >
                        <Download className="h-3.5 w-3.5 text-gray-400" />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Templates — donnees reelles bridge_documents */}
      {docTab === "templates" && (
        <div className="space-y-3">
          {loadingTemplates ? (
            <LoadingSpinner />
          ) : templatesByCategory.length === 0 ? (
            <EmptyState icon={FileText} text="Aucun template disponible" sub="Les templates seront charges depuis le serveur" />
          ) : (
            templatesByCategory.map((cat) => (
              <Card key={cat.categorie} className="p-0 overflow-hidden">
                <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", TEMPLATE_COLORS[cat.categorie] || "from-gray-600 to-gray-500")}>
                  <FileText className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{cat.categorie}</span>
                  <Badge className="text-[9px] bg-white/20 text-white border-0 ml-auto">{cat.items.length}</Badge>
                </div>
                <div className="p-2.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    {cat.items.map((t) => (
                      <button
                        key={t.alias}
                        onClick={() => handleTemplateClick(t.alias)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100 group"
                      >
                        <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-700 truncate flex-1">{t.nom}</span>
                        <Eye className="h-3 w-3 text-gray-300 group-hover:text-gray-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Importes */}
      {docTab === "importes" && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            )}
            <p className="text-sm text-gray-600 font-medium">
              {uploading ? "Telechargement en cours..." : "Glissez vos fichiers ici"}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, XLSX, images — max 50 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.zip,.txt,.pptx"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          {/* Liste fichiers importes */}
          {loading ? (
            <LoadingSpinner />
          ) : importes.length === 0 ? (
            <EmptyState icon={Upload} text="Aucun fichier importe" sub="Glissez-deposez ou cliquez pour importer" />
          ) : (
            <div className="space-y-2">
              {importes.map((doc) => {
                const meta = doc.metadata as Record<string, string>;
                const fileType = meta?.file_type || "FILE";
                const FIcon = FILE_ICONS[fileType] || File;
                return (
                  <Card key={doc.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-gray-800 truncate">{doc.titre}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{fileType}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] text-gray-400">{meta?.taille || ""}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] text-gray-400">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString("fr-CA") : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {doc.tags.map((tag) => (
                          <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", TAG_COLORS[tag] || "bg-gray-100 text-gray-600")}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      {meta?.file_path && (
                        <a
                          href={api.bureauDownloadUrl(meta.file_path)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                          title="Telecharger"
                        >
                          <Download className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      )}
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
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <BandeauProactif
          message={loading ? "Chargement des taches..." : `${taches.length} tache${taches.length !== 1 ? "s" : ""} ouverte${taches.length !== 1 ? "s" : ""} dans Plane.so`}
          section="taches"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nouvelle tache
        </button>
      </div>

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
                    <p className="text-[10px] text-gray-400 py-2 text-center">Aucune tache</p>
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
                              <Bot className="h-3 w-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400">{t.labels[0]}</span>
                              <span className="text-[10px] text-gray-300">|</span>
                            </>
                          )}
                          <span className="text-[10px] text-gray-400">
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
  // Evenements simules — sera branche sur Google Calendar / API quand pret
  const EVENTS = [
    { id: 1, titre: "Standup equipe dev", heure: "09:00", duree: "30 min", type: "recurrent", bot: "BCT", jour: "Lun" },
    { id: 2, titre: "Revue financiere Q1", heure: "10:30", duree: "1h", type: "reunion", bot: "BCF", jour: "Lun" },
    { id: 3, titre: "Pipeline ventes — point hebdo", heure: "14:00", duree: "45 min", type: "reunion", bot: "BRO", jour: "Mar" },
    { id: 4, titre: "Demo client — Alimentation Boreal", heure: "15:30", duree: "1h", type: "demo", bot: "BCO", jour: "Mar" },
    { id: 5, titre: "Comite direction", heure: "09:00", duree: "1h30", type: "strategique", bot: "BCO", jour: "Mer" },
    { id: 6, titre: "Sprint review CarlOS", heure: "11:00", duree: "1h", type: "recurrent", bot: "BCT", jour: "Jeu" },
    { id: 7, titre: "Rencontre RH — embauche dev", heure: "13:00", duree: "45 min", type: "reunion", bot: "BHR", jour: "Jeu" },
    { id: 8, titre: "Board Room — CA mensuel", heure: "10:00", duree: "2h", type: "strategique", bot: "BCO", jour: "Ven" },
  ];

  const TYPE_COLORS: Record<string, string> = {
    recurrent: "bg-blue-100 text-blue-700",
    reunion: "bg-emerald-100 text-emerald-700",
    demo: "bg-amber-100 text-amber-700",
    strategique: "bg-violet-100 text-violet-700",
  };

  const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
      {/* Semaine en cours */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-gray-800">Semaine du 3 mars 2026</div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Aujourd'hui</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            Nouveau
          </button>
        </div>
      </div>

      {/* Grille par jour */}
      <div className="grid grid-cols-5 gap-3">
        {JOURS.map((jour) => {
          const events = EVENTS.filter((e) => e.jour === jour);
          return (
            <div key={jour}>
              <div className="text-xs font-bold text-gray-600 mb-2 px-1">{jour}</div>
              <div className="space-y-2">
                {events.length === 0 ? (
                  <div className="p-3 border border-dashed border-gray-200 rounded-lg text-center">
                    <p className="text-[10px] text-gray-400">Aucun evenement</p>
                  </div>
                ) : (
                  events.map((ev) => (
                    <Card key={ev.id} className="p-2.5 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-1.5 mb-1">
                        <img src={BOT_AVATAR[ev.bot]} alt="" className="w-4 h-4 rounded-full" />
                        <span className="text-[10px] text-gray-400">{ev.heure}</span>
                      </div>
                      <p className="text-[11px] font-medium text-gray-800 leading-tight mb-1.5">{ev.titre}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={cn("text-[9px]", TYPE_COLORS[ev.type] || "bg-gray-100 text-gray-600")}>
                          {ev.type}
                        </Badge>
                        <span className="text-[9px] text-gray-400">{ev.duree}</span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
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
      case "agenda":
        return <AgendaPage />;
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
              <p className="text-[10px] text-gray-400">Idees, projets, documents, outils, taches et agenda</p>
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
        <CarlOSPresence />
        {renderPage()}
      </div>
    </div>
  );
}
