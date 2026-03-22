/**
 * FocusModeLayout.tsx — Focus Mode Canvas WOW
 * Header gradient identitaire du bot + LiveChat avec bulle focus card
 * Les données KPI apparaissent dans la bulle de discussion, pas en doublon
 * Les modes de réflexion sont dans la LiveChat (pas de doublon)
 * Phase 1 Canvas WOW — Sprint B/C
 * V3: DocumentEditorFocus — Unified document editor (scratch + library modes)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Target, TrendingUp,
  CheckCircle2, CalendarDays, Newspaper, BarChart3,
  DollarSign, Cpu, Megaphone, Sparkles,
  FileText, ChevronRight, Loader2, Check,
  ChevronDown, ChevronUp, Zap, PenLine,
  Eye, Download, MessageSquare, ArrowRight,
  FolderKanban,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { BOT_AVATAR, BOT_NAME, BOT_ROLE } from "../../api/types";
import type { DocumentBlock, UnifiedTemplate, DocForgeLibrary } from "../../api/types";
import { api, type StreamDoneEvent } from "../../api/client";

// ── Types ──────────────────────────────────────────────────

export interface FocusData {
  title: string;
  elementType: string;
  data: unknown;
  bot: string;
}

// ── Gradient par bot ──────────────────────────────────────

const BOT_GRADIENTS: Record<string, string> = {
  CEOB: "from-blue-600 to-blue-500",
  CTOB: "from-violet-600 to-violet-500",
  CFOB: "from-emerald-600 to-emerald-500",
  CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500",
  COOB: "from-orange-600 to-orange-500",
  CHROB: "from-teal-600 to-teal-500",
  CINOB: "from-rose-600 to-rose-500",
  CROB: "from-amber-600 to-amber-500",
  CLOB: "from-indigo-600 to-indigo-500",
};

const BOT_LABELS: Record<string, string> = {
  kpi_ceo: "CEO",
  kpi_cfo: "CFO",
  kpi_cto: "CTO",
  kpi_cmo: "CMO",
  kpi_cso: "CSO",
  pipeline: "Ventes",
  projets: "Projets",
  calendrier: "Agenda",
  industrie: "Industrie",
  ops: "Opérations",
  generic: "Focus",
  docforge_library: "DocForge",
  document_editor: "DocForge",
};

const ELEMENT_ICONS: Record<string, React.ElementType> = {
  kpi_ceo: Target,
  kpi_cfo: DollarSign,
  kpi_cto: Cpu,
  kpi_cmo: Megaphone,
  kpi_cso: Target,
  pipeline: TrendingUp,
  projets: CheckCircle2,
  calendrier: CalendarDays,
  industrie: Newspaper,
  ops: BarChart3,
  docforge_library: Sparkles,
  document_editor: FileText,
};

// ── Composant principal ────────────────────────────────────

export function FocusModeLayout({
  focusData,
  onClose,
}: {
  focusData: FocusData;
  onClose: () => void;
}) {
  const gradient = BOT_GRADIENTS[focusData.bot] || "from-blue-600 to-blue-500";
  const avatarSrc = BOT_AVATAR[focusData.bot] || BOT_AVATAR["CEOB"];
  const typeLabel = BOT_LABELS[focusData.elementType] || focusData.elementType;
  const ElementIcon = ELEMENT_ICONS[focusData.elementType] || Target;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header gradient identitaire du bot ──────────── */}
      <div className={cn(
        "bg-gradient-to-r px-4 py-2.5 flex items-center gap-2.5 shrink-0",
        gradient
      )}>
        <img
          src={avatarSrc}
          alt={focusData.bot}
          className="w-7 h-7 rounded-full ring-1 ring-white/30 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-white truncate block">{focusData.title}</span>
        </div>
        <span className="flex items-center gap-1 text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0">
          <ElementIcon className="h-3.5 w-3.5" />
          {typeLabel}
        </span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors shrink-0"
          title="Quitter le focus"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Bandeau trio — CarlOS + spécialiste */}
      {focusData.bot !== "CEOB" && (
        <div className="bg-gray-50 border-b px-4 py-1.5 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[9px] font-medium text-gray-500">CarlOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[9px] font-medium text-gray-500">
              {({
                CTOB: "Tim", CFOB: "Frank", CMOB: "Mathilde", CSOB: "Simone",
                COOB: "Olivier", CHROB: "Hélène", CINOB: "Inès",
                CROB: "Rich", CLOB: "Loulou", CISOB: "Sébastien",
              } as Record<string, string>)[focusData.bot] || focusData.bot}
            </span>
          </div>
          <span className="text-[9px] text-gray-400 ml-auto">Session trio</span>
        </div>
      )}

      {/* ── Contenu focus ─────── */}
      {(focusData.elementType === "document_editor" || focusData.elementType === "docforge_library") ? (
        <DocumentEditorFocus focusData={focusData.data as any} />
      ) : (
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-50/50">
          <div className="text-center space-y-3 max-w-md px-6">
            <div className={cn("w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br text-white shadow-lg", gradient)}>
              <ElementIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{focusData.title}</h3>
            <p className="text-sm text-gray-500">
              Utilise le chat dans le sidebar droit pour interagir avec {typeLabel}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════
// DocumentEditorFocus — Unified document editor V3
// Handles both "scratch" (from template) and "library" (from DocForge) modes
// Chat with Paco happens in sidebar LiveChat
// ══════════════════════════════════════════

// ── Parse markdown template to editable blocks ──

function hasUnfilledPlaceholders(text: string): boolean {
  return /\{\{.*?\}\}/.test(text) || text.includes("[A COMPLETER");
}

function parseMarkdownToBlocks(md: string): DocumentBlock[] {
  const lines = md.split("\n");
  const blocks: DocumentBlock[] = [];
  let currentBlock: DocumentBlock | null = null;
  let contentLines: string[] = [];
  let headerLines: string[] = [];

  for (const line of lines) {
    const h3Match = line.match(/^### (.+)/);
    const h2Match = !h3Match ? line.match(/^## (.+)/) : null;

    if (h2Match || h3Match) {
      if (currentBlock) {
        currentBlock.content = contentLines.join("\n").trim();
        currentBlock.status = hasUnfilledPlaceholders(currentBlock.content) ? "empty" : "draft";
        blocks.push(currentBlock);
      } else if (headerLines.length > 0) {
        const headerContent = headerLines.join("\n").trim();
        if (headerContent) {
          blocks.push({ id: "section-header", title: "En-tete du document", content: headerContent, level: 1, status: hasUnfilledPlaceholders(headerContent) ? "empty" : "draft" });
        }
      }
      contentLines = [];
      currentBlock = { id: `section-${blocks.length}`, title: (h2Match || h3Match)![1], content: "", level: h2Match ? 2 : 3, status: "empty" };
    } else if (currentBlock) {
      contentLines.push(line);
    } else {
      headerLines.push(line);
    }
  }
  if (currentBlock) {
    currentBlock.content = contentLines.join("\n").trim();
    currentBlock.status = hasUnfilledPlaceholders(currentBlock.content) ? "empty" : "draft";
    blocks.push(currentBlock);
  }
  return blocks;
}

// ── Status badge config ──

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  empty: { label: "Vide", bg: "bg-gray-100", text: "text-gray-500" },
  draft: { label: "Brouillon", bg: "bg-amber-100", text: "text-amber-700" },
  completed: { label: "Complete", bg: "bg-green-100", text: "text-green-700" },
  challenged: { label: "Revise", bg: "bg-violet-100", text: "text-violet-700" },
  approuve: { label: "Approuve", bg: "bg-green-100", text: "text-green-700" },
};

// ── Bot options for the selector ──

const EDITOR_BOT_COLORS: Record<string, string> = {
  CEOB: "bg-blue-500", CTOB: "bg-cyan-500", CFOB: "bg-emerald-500",
  CMOB: "bg-pink-500", CSOB: "bg-indigo-500", COOB: "bg-teal-500",
};
const EDITOR_BOT_LABELS: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "CTO", CFOB: "CFO", CMOB: "CMO", CSOB: "CSO", COOB: "COO",
};
const EDITOR_BOTS = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB"];

// ── BlockCard — individual section editor with AI Challenger/Completer ──

function BlockCard({
  block, onUpdateContent, onComplete, templateName, categorie, clientName, allBlocks, defaultBot,
}: {
  block: DocumentBlock;
  onUpdateContent: (id: string, content: string, newStatus?: DocumentBlock["status"]) => void;
  onComplete: (block: DocumentBlock) => void;
  templateName: string;
  categorie: string;
  clientName: string;
  allBlocks: DocumentBlock[];
  defaultBot?: string;
}) {
  const [expanded, setExpanded] = useState(block.status === "empty");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"challenge" | "complete" | null>(null);
  const [selectedBot, setSelectedBot] = useState(defaultBot || "CPOB");
  const lastActionRef = useRef<"challenge" | "complete" | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const statusCfg = STATUS_CONFIG[block.status] || STATUS_CONFIG.draft;

  const handleAIAction = useCallback((action: "challenge" | "complete") => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(true);
    setLoadingAction(action);
    lastActionRef.current = action;
    setSuggestion("");

    const contextSummary = allBlocks
      .filter((b) => b.id !== block.id && b.content && b.content.length > 10)
      .map((b) => `## ${b.title}\n${b.content.slice(0, 200)}`)
      .join("\n\n");

    const docContext = `Document: "${templateName}" (${categorie}), Client: ${clientName}`;
    const message = action === "challenge"
      ? `${docContext}\n\nCritique et ameliore cette section:\n\n## ${block.title}\n${block.content}\n\nContexte des autres sections:\n${contextSummary}\n\nDonne une version amelioree en markdown. Sois direct et concret.`
      : `${docContext}\n\nComplete cette section:\n\n## ${block.title}\n${block.content || "(section vide — genere le contenu a partir du titre et du contexte)"}\n\nContexte des autres sections:\n${contextSummary}\n\nRemplace les placeholders {{ }} et [A COMPLETER] par du contenu professionnel pertinent. Garde le format markdown.`;

    const controller = api.chatStream(
      { message, agent: selectedBot, mode: action === "challenge" ? "debat" : "credo", msg_type: action === "challenge" ? "challenge" : "synthesis", direct: true },
      {
        onToken: (_chunk: string, accumulated: string) => { setSuggestion(accumulated); },
        onDone: (_data: StreamDoneEvent) => { setLoading(false); setLoadingAction(null); },
        onError: (err: string) => { setSuggestion("Erreur: " + err); setLoading(false); setLoadingAction(null); },
      }
    );
    abortRef.current = controller;
  }, [block, allBlocks, templateName, categorie, clientName, selectedBot]);

  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
      const newStatus = lastActionRef.current === "challenge" ? ("challenged" as DocumentBlock["status"]) : undefined;
      onUpdateContent(block.id, suggestion, newStatus);
      setSuggestion(null);
    }
  }, [suggestion, block.id, onUpdateContent]);

  useEffect(() => { return () => { if (abortRef.current) abortRef.current.abort(); }; }, []);

  return (
    <Card className="overflow-hidden">
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
        <span className="text-xs font-medium text-gray-400">H{block.level}</span>
        <span className="text-xs font-bold text-gray-800 flex-1 text-left truncate">{block.title}</span>
        <Badge className={cn("text-[9px] border-0", statusCfg.bg, statusCfg.text)}>{statusCfg.label}</Badge>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
          <textarea value={block.content} onChange={(e) => onUpdateContent(block.id, e.target.value)}
            rows={Math.max(4, block.content.split("\n").length + 1)}
            className="w-full px-3 py-2 text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
            placeholder="Contenu de la section..." />

          {/* Bot selector */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400 mr-1">Bot:</span>
            {EDITOR_BOTS.map((code) => (
              <button key={code} onClick={() => setSelectedBot(code)}
                className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer",
                  selectedBot === code ? `${EDITOR_BOT_COLORS[code]} text-white` : "bg-gray-100 text-gray-400 hover:bg-gray-200")}>
                {EDITOR_BOT_LABELS[code]}
              </button>
            ))}
          </div>

          {/* AI action buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => handleAIAction("challenge")} disabled={loading || !block.content.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 disabled:opacity-40 transition-colors cursor-pointer">
              {loadingAction === "challenge" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Challenger
            </button>
            <button onClick={() => handleAIAction("complete")} disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors cursor-pointer">
              {loadingAction === "complete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Completer
            </button>
            {block.content.trim() && block.status !== "completed" && (
              <button onClick={() => onComplete(block)}
                className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer ml-auto">
                <CheckCircle2 className="h-3.5 w-3.5" /> Marquer complete
              </button>
            )}
          </div>

          {/* AI Suggestion */}
          {suggestion !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[9px] font-bold text-blue-700">Suggestion IA</span>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />}
              </div>
              <pre className="text-[9px] text-blue-800 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">{suggestion}</pre>
              {!loading && suggestion && (
                <div className="flex items-center gap-2">
                  <button onClick={acceptSuggestion}
                    className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Check className="h-3.5 w-3.5" /> Accepter
                  </button>
                  <button onClick={() => setSuggestion(null)}
                    className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                    <X className="h-3.5 w-3.5" /> Ignorer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ══════════════════════════════════════════
// DocumentEditorFocus — Main unified editor
// ══════════════════════════════════════════

type EditorPhase = "briefing" | "redaction" | "revision" | "export";

interface DocForgeLiveBlock {
  id: number;
  section_id: string;
  section_title: string;
  contenu_md: string;
  contenu_resume: string;
  status: string;
  confiance: number;
  source_type: string;
  source_ref: string;
}

function DocumentEditorFocus({ focusData }: { focusData: any }) {
  // Detect mode from focusData
  const template: UnifiedTemplate | null = focusData?.template || null;
  const libraryData: DocForgeLibrary | null = focusData?.library || null;
  const initialMode: "scratch" | "library" = focusData?.mode || (libraryData ? "library" : "scratch");

  const [phase, setPhase] = useState<EditorPhase>(initialMode === "library" ? "redaction" : "briefing");

  // Scratch mode state
  const [blocks, setBlocks] = useState<DocumentBlock[]>([]);
  const [client, setClient] = useState("Client");
  const [docTitle, setDocTitle] = useState(template?.titre || "");
  const [templatePreview, setTemplatePreview] = useState<string>("");
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Library mode state
  const [library, setLibrary] = useState<any>(libraryData || null);
  const [dfBlocks, setDfBlocks] = useState<DocForgeLiveBlock[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [processing, setProcessing] = useState(false);

  // Shared
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const libId = libraryData?.id || library?.id;

  // ── Load template preview for Lego templates (scratch) ──
  useEffect(() => {
    if (initialMode === "scratch" && template?.source === "lego" && template.alias) {
      setLoadingPreview(true);
      api.previewTemplate(template.alias).then(prev => {
        setTemplatePreview(prev.contenu_md);
        setPlaceholders(prev.placeholders || []);
        setDocTitle(prev.nom || template.titre);
      }).catch(() => {}).finally(() => setLoadingPreview(false));
    } else if (initialMode === "scratch" && template?.source === "blueprint" && template.sections) {
      const md = (template.sections || [])
        .sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0))
        .map((s: any) => `## ${s.titre_section || s.title || "Section"}\n\n${s.exemple_contenu || s.description || "{{ A COMPLETER }}"}`)
        .join("\n\n");
      setTemplatePreview(md);
      setPlaceholders([]);
      setDocTitle(template.titre);
    } else if (initialMode === "scratch" && template?.source === "docforge") {
      const md = (template.sections || [])
        .map((s: any) => `## ${s.title || s.titre_section || "Section"}\n\n{{ A COMPLETER }}`)
        .join("\n\n");
      setTemplatePreview(md);
      setPlaceholders([]);
      setDocTitle(template.titre);
    }
  }, [template, initialMode]);

  // ── Load library + blocks (library mode) ──
  const loadLibraryData = useCallback(async () => {
    if (!libId) return;
    setLoading(true);
    try {
      const [lib, blocs] = await Promise.all([
        api.getDocForgeLibrary(libId),
        api.docForgeBlocks(libId),
      ]);
      setLibrary(lib);
      setDfBlocks(blocs.blocks || blocs || []);
      const sections = lib?.template_sections || [];
      if (sections.length > 0 && !activeSection) {
        setActiveSection(sections[0].id);
      }
    } catch (e) {
      console.error("Load DocForge data:", e);
    } finally {
      setLoading(false);
    }
  }, [libId, activeSection]);

  useEffect(() => {
    if (initialMode === "library" && libId) loadLibraryData();
  }, [libId, initialMode]);

  // ── Scratch: Start editing (briefing → redaction) ──
  const startEditing = useCallback(() => {
    let md = templatePreview;
    for (const [key, val] of Object.entries(placeholderValues)) {
      if (val.trim()) {
        md = md.replaceAll(`{{ ${key} }}`, val);
        md = md.replaceAll(`{{${key}}}`, val);
      }
    }
    if (client.trim()) {
      md = md.replaceAll("{{ nom_client }}", client).replaceAll("{{nom_client}}", client);
      md = md.replaceAll("{{ entreprise }}", client).replaceAll("{{entreprise}}", client);
    }
    setBlocks(parseMarkdownToBlocks(md));
    setPhase("redaction");
  }, [templatePreview, placeholderValues, client]);

  // ── Scratch: Update block content ──
  const updateBlockContent = useCallback((id: string, content: string, newStatus?: DocumentBlock["status"]) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, content, status: newStatus || (hasUnfilledPlaceholders(content) ? "empty" : "draft") } : b
    ));
  }, []);

  const markBlockCompleted = useCallback((block: DocumentBlock) => {
    setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, status: "completed" } : b));
  }, []);

  // ── Scratch: Assemble final markdown ──
  const assembleMarkdown = useCallback(() => {
    return blocks.map(b => {
      if (b.level === 1) return b.content;
      const heading = b.level === 2 ? `## ${b.title}` : `### ${b.title}`;
      return `${heading}\n\n${b.content}`;
    }).join("\n\n");
  }, [blocks]);

  // ── Library: Launch pipeline ──
  const handleProcess = async () => {
    if (!libId) return;
    setProcessing(true);
    try {
      await api.docForgeProcess(libId);
      const poll = setInterval(async () => {
        const progress = await api.docForgeProgress(libId);
        if (progress.status !== "en_cours") { clearInterval(poll); setProcessing(false); loadLibraryData(); }
      }, 5000);
    } catch (e) { console.error("Process:", e); setProcessing(false); }
  };

  // ── Library: Approve/edit blocks ──
  const handleApprove = async (blockId: number) => {
    try {
      await api.docForgeBlockApprove(blockId);
      setDfBlocks(prev => prev.map(b => b.id === blockId ? { ...b, status: "approuve" } : b));
    } catch (e) { console.error(e); }
  };

  const handleSaveEdit = async (blockId: number) => {
    try {
      await api.docForgeBlockUpdate(blockId, { contenu_md: editContent });
      setDfBlocks(prev => prev.map(b => b.id === blockId ? { ...b, contenu_md: editContent } : b));
      setEditingBlock(null);
    } catch (e) { console.error(e); }
  };

  // ── Export PDF (scratch) ──
  const handleExportPDF = useCallback(async () => {
    if (!template) return;
    setGenerating(true);
    try {
      const finalMd = assembleMarkdown();
      const donnees = { ...placeholderValues, _contenu_assemble: finalMd };
      const result = await api.generateDocument({ template_alias: template.alias, donnees, client });
      setDownloadUrl(api.documentDownloadUrl(result.nom_fichier));
      setPhase("export");
    } catch (err) {
      console.error("Export error:", err);
      alert(err instanceof Error ? err.message : "Erreur generation PDF");
    } finally {
      setGenerating(false);
    }
  }, [assembleMarkdown, placeholderValues, template, client]);

  // ── Export Markdown (library) ──
  const handleExportMd = async () => {
    try {
      const r = await api.docForgePreview(libId);
      const blob = new Blob([r.markdown || r], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${library?.titre || "document"}.md`; a.click();
    } catch (e) { console.error(e); }
  };

  // ── Stats ──
  const completedCount = blocks.filter(b => b.status === "completed" || b.status === "challenged").length;
  const totalBlocks = blocks.length;
  const filledCount = blocks.filter(b => b.content.trim() && !b.content.includes("[A COMPLETER")).length;
  const fillRate = totalBlocks > 0 ? Math.round((filledCount / totalBlocks) * 100) : 0;

  const libSections = library?.template_sections || [];
  const libSectionBlocks = dfBlocks.filter(b => b.section_id === activeSection && b.status !== "archive" && b.status !== "rejete");
  const overflowBlocks = dfBlocks.filter(b => b.section_id?.startsWith("overflow"));

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 text-teal-500 animate-spin" /></div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Phase progress bar — 4 etapes visibles */}
      <div className="bg-white border-b px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-1">
          {([
            { key: "briefing" as EditorPhase, label: "1. Briefing", icon: FileText },
            { key: "redaction" as EditorPhase, label: "2. Redaction", icon: PenLine },
            { key: "revision" as EditorPhase, label: "3. Revision", icon: Eye },
            { key: "export" as EditorPhase, label: "4. Export", icon: Download },
          ]).map((step, i, arr) => {
            const phaseOrder = ["briefing", "redaction", "revision", "export"];
            const currentIdx = phaseOrder.indexOf(phase);
            const stepIdx = phaseOrder.indexOf(step.key);
            const isActive = phase === step.key;
            const isCompleted = stepIdx < currentIdx;
            const isFuture = stepIdx > currentIdx;
            const isDisabled = step.key === "briefing" && initialMode === "library";
            const StepIcon = step.icon;
            return (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => {
                    if (isDisabled) return;
                    if (step.key === "redaction" && phase === "briefing" && blocks.length === 0) return;
                    setPhase(step.key);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-semibold transition-all cursor-pointer",
                    isActive && "bg-blue-600 text-white shadow-sm",
                    isCompleted && "bg-emerald-50 text-emerald-700",
                    isFuture && "bg-gray-100 text-gray-400",
                    isDisabled && "opacity-30 cursor-not-allowed",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <StepIcon className="h-3.5 w-3.5" />
                  )}
                  {step.label}
                </button>
                {i < arr.length - 1 && (
                  <ChevronRight className={cn("h-3.5 w-3.5 mx-0.5 shrink-0", isCompleted ? "text-emerald-400" : "text-gray-300")} />
                )}
              </div>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            {initialMode === "library" && library?.status === "draft" && (
              <button onClick={handleProcess} disabled={processing}
                className="text-[9px] px-2.5 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Scanner Drive
              </button>
            )}
            {initialMode === "scratch" && phase === "redaction" && (
              <span className="text-[9px] text-gray-400">{totalBlocks} sections | {fillRate}% complet</span>
            )}
            {initialMode === "library" && (
              <span className="text-[9px] text-gray-400">{dfBlocks.length} blocs | {library?.completude_pct || 0}% complet</span>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ BRIEFING (scratch only) ═══════ */}
      {phase === "briefing" && initialMode === "scratch" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {loadingPreview ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 text-teal-500 animate-spin" /></div>
            ) : (<>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Briefing du document</h3>
                  <p className="text-[9px] text-gray-400">{docTitle} — {template?.source === "lego" ? "Template Lego" : template?.source === "blueprint" ? "Blueprint" : "DocForge"}</p>
                </div>
              </div>

              {/* Titre document */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Titre du document</label>
                <input value={docTitle} onChange={e => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>

              {/* Nom du client */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Nom du client</label>
                <input value={client} onChange={e => setClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder="Nom du client" />
              </div>

              {/* Placeholders (Lego only) */}
              {placeholders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">Champs du template</p>
                  {placeholders.map(ph => (
                    <div key={ph}>
                      <label className="text-[9px] text-gray-500 block mb-0.5">{ph}</label>
                      <input value={placeholderValues[ph] || ""} onChange={e => setPlaceholderValues(prev => ({ ...prev, [ph]: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder={`Valeur pour ${ph}`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Template preview */}
              {templatePreview && (
                <details className="group">
                  <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                    Apercu du template ({templatePreview.split("\n").length} lignes)
                  </summary>
                  <pre className="mt-2 text-[9px] text-gray-500 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {templatePreview.slice(0, 2000)}{templatePreview.length > 2000 ? "\n..." : ""}
                  </pre>
                </details>
              )}

              <button onClick={startEditing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <PenLine className="h-3.5 w-3.5" /> Commencer la redaction <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>)}
          </div>
        </div>
      )}

      {/* ═══════ REDACTION — Scratch mode (BlockCard) ═══════ */}
      {phase === "redaction" && initialMode === "scratch" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="space-y-2">
            {blocks.map(block => (
              <BlockCard key={block.id} block={block}
                onUpdateContent={updateBlockContent} onComplete={markBlockCompleted}
                templateName={docTitle} categorie={template?.categorie || ""} clientName={client} allBlocks={blocks}
                defaultBot={template?.bot_recommande || "CPOB"} />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button onClick={() => setPhase("briefing")}
              className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
              Retour briefing
            </button>
            <div className="flex-1" />
            <button onClick={() => setPhase("revision")} disabled={filledCount < 1}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors cursor-pointer">
              <Eye className="h-3.5 w-3.5" /> Passer a la revision <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ REDACTION — Library mode (DocForge blocks) ═══════ */}
      {phase === "redaction" && initialMode === "library" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Sections nav */}
          <div className="w-48 border-r bg-gray-50/50 overflow-y-auto shrink-0">
            <div className="p-2 space-y-0.5">
              {libSections.map((s: any) => {
                const sBlocs = dfBlocks.filter(b => b.section_id === s.id && b.status !== "archive" && b.status !== "rejete");
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={cn("w-full text-left px-2.5 py-1.5 rounded-lg text-[9px] transition-all cursor-pointer",
                      activeSection === s.id ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-600 hover:bg-gray-100")}>
                    <span className="block truncate">{s.title}</span>
                    <span className="text-gray-400">{sBlocs.length} blocs</span>
                  </button>
                );
              })}
              {overflowBlocks.length > 0 && (
                <button onClick={() => setActiveSection("overflow")}
                  className={cn("w-full text-left px-2.5 py-1.5 rounded-lg text-[9px] transition-all cursor-pointer",
                    activeSection === "overflow" ? "bg-amber-100 text-amber-800 font-medium" : "text-amber-600 hover:bg-amber-50")}>
                  <span className="block truncate">Sections suggerees</span>
                  <span className="text-amber-400">{overflowBlocks.length} blocs</span>
                </button>
              )}
            </div>
          </div>

          {/* Blocks editor */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSection && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-700">
                  {libSections.find((s: any) => s.id === activeSection)?.title || "Sections suggerees"}
                </h3>
                {(activeSection === "overflow" ? overflowBlocks : libSectionBlocks).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Aucun bloc dans cette section</p>
                    <p className="text-[9px] text-gray-400 mt-1">Lancez le scan ou utilisez Paco dans le chat pour ajouter du contenu</p>
                  </div>
                ) : (
                  (activeSection === "overflow" ? overflowBlocks : libSectionBlocks).map(bloc => (
                    <div key={bloc.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-1.5 flex items-center gap-2 border-b">
                        <Badge className={cn("text-[9px] border-0",
                          bloc.status === "approuve" ? "bg-green-100 text-green-700" :
                          bloc.status === "suggere" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>
                          {bloc.status}
                        </Badge>
                        <span className="text-[9px] text-gray-400">{bloc.source_type}</span>
                        {bloc.confiance < 1 && <span className="text-[9px] text-gray-400">{Math.round(bloc.confiance * 100)}% confiance</span>}
                        <div className="ml-auto flex items-center gap-1.5">
                          {bloc.status !== "approuve" && (
                            <button onClick={() => handleApprove(bloc.id)}
                              className="text-[9px] px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Approuver
                            </button>
                          )}
                          <button onClick={() => { setEditingBlock(bloc.id); setEditContent(bloc.contenu_md); }}
                            className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 cursor-pointer">Editer</button>
                        </div>
                      </div>
                      <div className="p-3">
                        {editingBlock === bloc.id ? (
                          <div className="space-y-2">
                            <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                              rows={8} className="w-full text-xs px-2.5 py-1.5 border rounded-lg resize-none font-mono" />
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveEdit(bloc.id)}
                                className="text-[9px] px-2.5 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer">Sauvegarder</button>
                              <button onClick={() => setEditingBlock(null)}
                                className="text-[9px] px-2.5 py-1 border rounded-lg hover:bg-gray-50 cursor-pointer">Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {bloc.contenu_md.slice(0, 2000)}
                            {bloc.contenu_md.length > 2000 && <span className="text-gray-400">... ({bloc.contenu_md.length} chars)</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ REVISION ═══════ */}
      {phase === "revision" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {initialMode === "scratch" ? (<>
            <Card className="p-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center"><p className="text-lg font-bold text-gray-900">{totalBlocks}</p><p className="text-[9px] text-gray-500">Sections</p></div>
                <div className="text-center"><p className="text-lg font-bold text-green-600">{completedCount}</p><p className="text-[9px] text-gray-500">Completees</p></div>
                <div className="text-center"><p className="text-lg font-bold text-blue-600">{fillRate}%</p><p className="text-[9px] text-gray-500">Remplissage</p></div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-gray-500" />Apercu du document final</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-[9px] text-gray-700 whitespace-pre-wrap font-mono">{assembleMarkdown()}</pre>
              </div>
            </Card>
            <div className="flex items-center gap-2">
              <button onClick={() => setPhase("redaction")}
                className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                Retour a la redaction
              </button>
              <div className="flex-1" />
              <button onClick={handleExportPDF} disabled={generating}
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer">
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                Generer PDF <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </>) : (<>
            <h3 className="text-xs font-bold text-gray-700">Revision — Vue assemblee</h3>
            <p className="text-[9px] text-gray-500">Apercu du document complet avec toutes les sections.</p>
            {libSections.map((s: any) => {
              const sBlocs = dfBlocks.filter(b => b.section_id === s.id && (b.status === "approuve" || b.status === "suggere"));
              return (
                <div key={s.id} className="border rounded-lg p-3">
                  <h4 className="text-xs font-bold text-gray-800 mb-2">{s.title}</h4>
                  {sBlocs.length === 0 ? (
                    <p className="text-[9px] text-gray-400 italic">Section vide</p>
                  ) : sBlocs.map(b => (
                    <div key={b.id} className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed mb-2">{b.contenu_md.slice(0, 1000)}</div>
                  ))}
                </div>
              );
            })}
            {/* Navigation buttons — fix Library mode (manquait) */}
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setPhase("redaction")}
                className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                Retour a la redaction
              </button>
              <div className="flex-1" />
              <button onClick={() => setPhase("export")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Passer a l'export
              </button>
            </div>
          </>)}
        </div>
      )}

      {/* ═══════ EXPORT ═══════ */}
      {phase === "export" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto space-y-4 py-8">
            <div className="text-center">
              {downloadUrl ? (
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <Sparkles className="h-8 w-8 text-teal-500 mx-auto mb-3" />
              )}
              <h3 className="text-sm font-bold text-gray-800 mt-3">{downloadUrl ? "Document genere!" : "Exporter votre document"}</h3>
              <p className="text-xs text-gray-500 mt-1">{downloadUrl ? `${docTitle} — ${client}` : "Choisissez le format de sortie"}</p>
            </div>
            <div className="space-y-2">
              {downloadUrl && (
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <Download className="h-4 w-4 text-green-600" />
                  <div><p className="text-xs font-medium text-gray-800">Telecharger PDF</p></div>
                </a>
              )}
              {initialMode === "scratch" && !downloadUrl && (
                <button onClick={handleExportPDF} disabled={generating}
                  className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                  {generating ? <Loader2 className="h-4 w-4 text-gray-500 animate-spin" /> : <FileText className="h-4 w-4 text-gray-500" />}
                  <div><p className="text-xs font-medium text-gray-800">Generer PDF</p><p className="text-[9px] text-gray-400">Depuis le contenu assemble</p></div>
                </button>
              )}
              {initialMode === "library" && (
                <button onClick={handleExportMd}
                  className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div><p className="text-xs font-medium text-gray-800">Markdown</p><p className="text-[9px] text-gray-400">Telecharger en .md</p></div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
