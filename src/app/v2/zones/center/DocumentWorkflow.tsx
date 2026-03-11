/**
 * DocumentWorkflow.tsx — Flow interactif bloc par bloc pour Document Lego Phase 2
 * 4 etapes: Briefing → Edition bloc par bloc → Revision → Export
 * CarlOS peut challenger ou completer chaque section via chatStream
 *
 * TODO: PageLayout migration — This component is rendered inside a fixed overlay
 * (fixed inset-0 z-50 bg-white overflow-auto in EspaceBureauView.tsx), not as a
 * standard page view. It has its own inline header with back button + StepIndicator.
 * Migration to PageLayout would require reworking the overlay context in
 * EspaceBureauView.tsx as well. Skipping for now.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Loader2,
  CheckCircle2,
  Zap,
  PenLine,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { api, type StreamDoneEvent } from "../../api/client";
import type { DocumentBlock, DocumentWorkflowStep, TemplatePreview } from "../../api/types";
import { CahierProgressBar } from "./shared/cahier-components";

// ── Parse markdown template en blocs editables ──

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
    // H3 AVANT H2 pour ne pas matcher ### comme ##
    const h3Match = line.match(/^### (.+)/);
    const h2Match = !h3Match ? line.match(/^## (.+)/) : null;

    if (h2Match || h3Match) {
      if (currentBlock) {
        currentBlock.content = contentLines.join("\n").trim();
        currentBlock.status = hasUnfilledPlaceholders(currentBlock.content) ? "empty" : "draft";
        blocks.push(currentBlock);
      } else if (headerLines.length > 0) {
        // C4: Contenu avant le premier H2 → bloc "En-tete"
        const headerContent = headerLines.join("\n").trim();
        if (headerContent) {
          blocks.push({
            id: "section-header",
            title: "En-tete du document",
            content: headerContent,
            level: 1,
            status: hasUnfilledPlaceholders(headerContent) ? "empty" : "draft",
          });
        }
      }
      contentLines = [];
      currentBlock = {
        id: `section-${blocks.length}`,
        title: (h2Match || h3Match)![1],
        content: "",
        level: h2Match ? 2 : 3,
        status: "empty",
      };
    } else if (currentBlock) {
      contentLines.push(line);
    } else {
      // Avant le premier heading → header
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

// ── Status badge colors ──

const STATUS_CONFIG: Record<DocumentBlock["status"], { label: string; bg: string; text: string }> = {
  empty: { label: "Vide", bg: "bg-gray-100", text: "text-gray-500" },
  draft: { label: "Brouillon", bg: "bg-amber-100", text: "text-amber-700" },
  completed: { label: "Complete", bg: "bg-green-100", text: "text-green-700" },
  challenged: { label: "Revise", bg: "bg-violet-100", text: "text-violet-700" },
};

// ── Step indicator ──

const STEPS: { id: DocumentWorkflowStep; label: string; num: number }[] = [
  { id: "briefing", label: "Briefing", num: 1 },
  { id: "editing", label: "Blue Print", num: 2 },
  { id: "review", label: "Revision", num: 3 },
  { id: "export", label: "Export", num: 4 },
];

function StepIndicator({ current }: { current: DocumentWorkflowStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
              i < currentIdx
                ? "bg-green-500 text-white"
                : i === currentIdx
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-400"
            )}
          >
            {i < currentIdx ? <Check className="h-3 w-3" /> : step.num}
          </div>
          <span
            className={cn(
              "text-[10px] font-medium",
              i === currentIdx ? "text-gray-900" : "text-gray-400"
            )}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200 mx-0.5" />}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════
// BLOCK CARD — section editable individuelle
// ══════════════════════════════════════════

// Bot options pour le selecteur Blue Print
const BOT_COLORS: Record<string, string> = {
  CEOB: "bg-blue-500",
  CTOB: "bg-cyan-500",
  CFOB: "bg-emerald-500",
  CMOB: "bg-pink-500",
  CSOB: "bg-indigo-500",
  COOB: "bg-teal-500",
};
const BOT_LABELS: Record<string, string> = {
  CEOB: "CarlOS",
  CTOB: "CTO",
  CFOB: "CFO",
  CMOB: "CMO",
  CSOB: "CSO",
  COOB: "COO",
};
const BLUEPRINT_BOTS = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB"];

function BlockCard({
  block,
  onUpdateContent,
  onChallenge,
  onComplete,
  templateName,
  categorie,
  clientName,
  allBlocks,
}: {
  block: DocumentBlock;
  onUpdateContent: (id: string, content: string, newStatus?: DocumentBlock["status"]) => void;
  onChallenge: (block: DocumentBlock) => void;
  onComplete: (block: DocumentBlock) => void;
  templateName: string;
  categorie: string;
  clientName: string;
  allBlocks: DocumentBlock[];
}) {
  const [expanded, setExpanded] = useState(block.status === "empty");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"challenge" | "complete" | null>(null);
  const [selectedBot, setSelectedBot] = useState("CEOB");
  const lastActionRef = useRef<"challenge" | "complete" | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const statusCfg = STATUS_CONFIG[block.status];

  const handleAIAction = useCallback(
    (action: "challenge" | "complete") => {
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

      const message =
        action === "challenge"
          ? `${docContext}\n\nCritique et ameliore cette section:\n\n## ${block.title}\n${block.content}\n\nContexte des autres sections:\n${contextSummary}\n\nDonne une version amelioree en markdown. Sois direct et concret.`
          : `${docContext}\n\nComplete cette section:\n\n## ${block.title}\n${block.content || "(section vide — genere le contenu a partir du titre et du contexte)"}\n\nContexte des autres sections:\n${contextSummary}\n\nRemplace les placeholders {{ }} et [A COMPLETER] par du contenu professionnel pertinent. Garde le format markdown.`;

      const controller = api.chatStream(
        {
          message,
          agent: selectedBot,
          mode: action === "challenge" ? "debat" : "credo",
          msg_type: action === "challenge" ? "challenge" : "synthesis",
          direct: true,
        },
        {
          onToken: (_chunk: string, accumulated: string) => {
            setSuggestion(accumulated);
          },
          onDone: (_data: StreamDoneEvent) => {
            setLoading(false);
            setLoadingAction(null);
          },
          onError: (err: string) => {
            console.error("BlockCard AI error:", err);
            setSuggestion("Erreur: " + err);
            setLoading(false);
            setLoadingAction(null);
          },
        }
      );
      abortRef.current = controller;
    },
    [block, allBlocks, templateName, categorie, clientName, selectedBot]
  );

  // Q1: Quand on accepte apres un challenge → status "challenged"
  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
      const newStatus = lastActionRef.current === "challenge" ? "challenged" : undefined;
      onUpdateContent(block.id, suggestion, newStatus);
      setSuggestion(null);
    }
  }, [suggestion, block.id, onUpdateContent]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null);
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-xs font-medium text-gray-400">
          H{block.level}
        </span>
        <span className="text-xs font-bold text-gray-800 flex-1 text-left truncate">
          {block.title}
        </span>
        <Badge className={cn("text-[9px] border-0", statusCfg.bg, statusCfg.text)}>
          {statusCfg.label}
        </Badge>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
          <textarea
            value={block.content}
            onChange={(e) => onUpdateContent(block.id, e.target.value)}
            rows={Math.max(4, block.content.split("\n").length + 1)}
            className="w-full px-3 py-2 text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
            placeholder="Contenu de la section..."
          />

          {/* Bot selector — Blue Print */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400 mr-1">Bot:</span>
            {BLUEPRINT_BOTS.map((code) => (
              <button
                key={code}
                onClick={() => setSelectedBot(code)}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer",
                  selectedBot === code
                    ? `${BOT_COLORS[code]} text-white`
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}
              >
                {BOT_LABELS[code]}
              </button>
            ))}
          </div>

          {/* AI action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAIAction("challenge")}
              disabled={loading || !block.content.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {loadingAction === "challenge" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Zap className="h-3 w-3" />
              )}
              Challenger
            </button>
            <button
              onClick={() => handleAIAction("complete")}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {loadingAction === "complete" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Completer
            </button>
            {block.content.trim() && block.status !== "completed" && (
              <button
                onClick={() => onComplete(block)}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer ml-auto"
              >
                <CheckCircle2 className="h-3 w-3" />
                Marquer complete
              </button>
            )}
          </div>

          {/* AI Suggestion */}
          {suggestion !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700">
                  Suggestion CarlOS
                </span>
                {loading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
              </div>
              <pre className="text-[10px] text-blue-800 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                {suggestion}
              </pre>
              {!loading && suggestion && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={acceptSuggestion}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    Accepter
                  </button>
                  <button
                    onClick={dismissSuggestion}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    Ignorer
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
// DOCUMENT WORKFLOW — composant principal 4 etapes
// ══════════════════════════════════════════

interface DocumentWorkflowProps {
  templateAlias: string;
  templateName: string;
  categorie: string;
  preview: TemplatePreview;
  onClose: () => void;
  onDocumentGenerated: () => void;
}

export function DocumentWorkflow({
  templateAlias,
  templateName,
  categorie,
  preview,
  onClose,
  onDocumentGenerated,
}: DocumentWorkflowProps) {
  const [step, setStep] = useState<DocumentWorkflowStep>("briefing");
  const [blocks, setBlocks] = useState<DocumentBlock[]>([]);
  const [client, setClient] = useState("Client");
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Q3: Confirmation avant fermeture si travail en cours
  const hasWork = blocks.some((b) => b.status !== "empty");
  const safeClose = useCallback(() => {
    if (hasWork && step !== "export") {
      if (!window.confirm("Quitter le workflow? Votre travail en cours sera perdu.")) return;
    }
    onClose();
  }, [hasWork, step, onClose]);

  // Q5: Proteger retour au briefing si blocs edites
  const safeRetourBriefing = useCallback(() => {
    if (hasWork) {
      if (!window.confirm("Retourner au briefing? Les modifications de vos blocs seront perdues.")) return;
    }
    setStep("briefing");
  }, [hasWork]);

  // ── Briefing → start editing ──
  const startEditing = useCallback(() => {
    // Remplacer les placeholders — syntaxe backend {{ key }} et {{key}}
    let md = preview.contenu_md;
    for (const [key, val] of Object.entries(placeholderValues)) {
      if (val.trim()) {
        md = md.replaceAll(`{{ ${key} }}`, val);
        md = md.replaceAll(`{{${key}}}`, val);
      }
    }
    if (client.trim()) {
      md = md.replaceAll("{{ nom_client }}", client);
      md = md.replaceAll("{{nom_client}}", client);
      md = md.replaceAll("{{ entreprise }}", client);
      md = md.replaceAll("{{entreprise}}", client);
    }

    const parsed = parseMarkdownToBlocks(md);
    setBlocks(parsed);
    setStep("editing");
  }, [preview.contenu_md, placeholderValues, client]);

  // ── Update block content ──
  const updateBlockContent = useCallback((id: string, content: string, newStatus?: DocumentBlock["status"]) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, content, status: newStatus || (hasUnfilledPlaceholders(content) ? "empty" : "draft") }
          : b
      )
    );
  }, []);

  // ── Mark block as completed ──
  const markBlockCompleted = useCallback((block: DocumentBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, status: "completed" } : b))
    );
  }, []);

  // ── Challenge callback (updates status) ──
  const handleChallenge = useCallback((_block: DocumentBlock) => {
    // Status update is handled in BlockCard acceptSuggestion
  }, []);

  // ── Assemble final markdown ──
  const assembleMarkdown = useCallback(() => {
    return blocks
      .map((b) => {
        if (b.level === 1) return b.content; // Header — pas de heading
        const heading = b.level === 2 ? `## ${b.title}` : `### ${b.title}`;
        return `${heading}\n\n${b.content}`;
      })
      .join("\n\n");
  }, [blocks]);

  // ── Stats ──
  const completedCount = blocks.filter((b) => b.status === "completed" || b.status === "challenged").length;
  const totalBlocks = blocks.length;
  const filledCount = blocks.filter((b) => b.content.trim() && !b.content.includes("[A COMPLETER")).length;
  const fillRate = totalBlocks > 0 ? Math.round((filledCount / totalBlocks) * 100) : 0;

  // ── Generate PDF ──
  const handleExport = useCallback(async () => {
    setGenerating(true);
    try {
      const finalMd = assembleMarkdown();
      const donnees = { ...placeholderValues, _contenu_assemble: finalMd };
      const result = await api.generateDocument({
        template_alias: templateAlias,
        donnees,
        client,
      });
      const url = api.documentDownloadUrl(result.nom_fichier);
      setDownloadUrl(url);
      setStep("export");
      onDocumentGenerated();
    } catch (err) {
      console.error("Export error:", err);
      alert(err instanceof Error ? err.message : "Erreur generation PDF");
    } finally {
      setGenerating(false);
    }
  }, [assembleMarkdown, placeholderValues, templateAlias, client, onDocumentGenerated]);

  return (
    <div className="max-w-4xl mx-auto px-10 py-5 space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={safeClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-gray-900 truncate">{templateName}</h2>
          <p className="text-[10px] text-gray-400">{categorie} — Blue Print interactif</p>
        </div>
        <StepIndicator current={step} />
      </div>

      {/* ═══════ STEP 1: BRIEFING ═══════ */}
      {step === "briefing" && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-800">Briefing du document</h3>
              <p className="text-[10px] text-gray-400">
                {preview.placeholders.length} champ(s), {parseMarkdownToBlocks(preview.contenu_md).length} section(s),{" "}
                {preview.narratives.length} bloc(s) narratif(s)
              </p>
            </div>
          </div>

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
                    onChange={(e) =>
                      setPlaceholderValues((prev) => ({ ...prev, [ph]: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder={`Valeur pour ${ph}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Template preview */}
          <details className="group">
            <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-800">
              Apercu du template ({preview.contenu_md.split("\n").length} lignes)
            </summary>
            <pre className="mt-2 text-[10px] text-gray-500 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {preview.contenu_md.slice(0, 2000)}
              {preview.contenu_md.length > 2000 ? "\n..." : ""}
            </pre>
          </details>

          <button
            onClick={startEditing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <PenLine className="h-3.5 w-3.5" />
            Commencer l'edition
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Card>
      )}

      {/* ═══════ STEP 2: EDITING ═══════ */}
      {step === "editing" && (
        <div className="space-y-3">
          {/* Progress bar */}
          <CahierProgressBar
            current={completedCount}
            total={totalBlocks}
            label={`Sections completees: ${completedCount}/${totalBlocks}`}
          />

          {/* Block list */}
          <div className="space-y-2">
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onUpdateContent={updateBlockContent}
                onChallenge={handleChallenge}
                onComplete={markBlockCompleted}
                templateName={templateName}
                categorie={categorie}
                clientName={client}
                allBlocks={blocks}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={safeRetourBriefing}
              className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour briefing
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setStep("review")}
              disabled={filledCount < 1}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Passer a la revision
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 3: REVIEW ═══════ */}
      {step === "review" && (
        <div className="space-y-4">
          {/* Stats */}
          <Card className="p-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{totalBlocks}</p>
                <p className="text-[10px] text-gray-500">Sections</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{completedCount}</p>
                <p className="text-[10px] text-gray-500">Completees</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{fillRate}%</p>
                <p className="text-[10px] text-gray-500">Remplissage</p>
              </div>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-gray-500" />
              Apercu du document final
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-[11px] text-gray-700 whitespace-pre-wrap font-mono">
                {assembleMarkdown()}
              </pre>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("editing")}
              className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour au Blue Print
            </button>
            <div className="flex-1" />
            <button
              onClick={handleExport}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              Generer PDF
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 4: EXPORT ═══════ */}
      {step === "export" && (
        <Card className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Document genere!</h3>
            <p className="text-xs text-gray-500 mt-1">
              {templateName} — {client}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Telecharger PDF
              </a>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Retour aux templates
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
