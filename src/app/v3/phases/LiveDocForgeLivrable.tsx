/**
 * LiveDocForgeLivrable.tsx — Composant principal DocForge workspace
 *
 * Miroir de PhaseConceptionLivrable (SimAmorcer L6239-6528) avec contenu reel.
 * 3 sources de contenu convergent: chat, upload document, agent plugins.
 * 5 types de livrables: document, spreadsheet, presentation, code, jumelage.
 *
 * Layout: Back button + Hero compact + Upload zone + Flex(sidebar TOC + contenu)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft, CheckCircle2, Circle, Upload, FileUp, Loader2, Check, X,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useAmorcer } from "../AmorcerContext";
import { useChatContext } from "../../v2/context/ChatContext";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { formatCristallise } from "./content-formatters";

import { DOCFORGE_CONFIGS, type DocForgeSection, type L2Theme } from "./docforge-config";
import { CodeTerminalRenderer } from "./CodeTerminalRenderer";
import { DocForgeActionButtons } from "./DocForgeActionButtons";
import { CompletionBanner } from "./CompletionBanner";

// ═══ Props ═══

interface LiveDocForgeLivrableProps {
  deliverableType: string;
  context: string | null;
  onBack: () => void;
  onStartJumelage?: () => void;
  initialSections?: DocForgeSection[];
  draftLibraryId?: number;
  reviewMode?: boolean;
}

// ═══ Composant principal ═══

export function LiveDocForgeLivrable({
  deliverableType, context, onBack, onStartJumelage, initialSections, draftLibraryId, reviewMode,
}: LiveDocForgeLivrableProps) {
  const config = DOCFORGE_CONFIGS[deliverableType];
  if (!config) return null;

  const theme = config.theme;
  const Icon = config.icon;
  const sections = initialSections || config.sections;

  const { workspaceBlocks, addWorkspaceBlock, addWorkflowItem, activeBotCode } = useAmorcer();

  // D1: Pre-fill from draft if draftLibraryId is provided
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => {
    if (!draftLibraryId || draftLoaded) return;
    const loadDraft = async () => {
      try {
        const res = await fetch(`/api/v1/docforge/libraries/${draftLibraryId}/draft-preview`, {
          headers: { "x-api-key": "dev-key-brain-2024" },
        });
        if (res.ok) {
          const data = await res.json();
          const draftSections = data.sections || [];
          for (const ds of draftSections) {
            addWorkspaceBlock({
              id: `draft-${ds.id || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              type: "text",
              title: ds.title || "Section",
              summary: ds.content_md || "",
              credo_step: "E",
              confidence: 0.7,
              source: `Brouillon DocForge #${draftLibraryId}`,
              sourceType: "chat",
              sectionId: ds.sectionId || `section-${ds.id}`,
              timestamp: Date.now(),
            });
          }
        }
      } catch { /* silent */ }
      setDraftLoaded(true);
    };
    loadDraft();
  }, [draftLibraryId, draftLoaded, addWorkspaceBlock]);

  // D2: Review mode — approve/reject handlers
  const handleApprove = useCallback(async () => {
    if (!draftLibraryId) return;
    try {
      await fetch(`/api/v1/docforge/libraries/${draftLibraryId}/approve`, {
        method: "POST",
        headers: { "x-api-key": "dev-key-brain-2024", "Content-Type": "application/json" },
      });
      onBack();
    } catch { /* silent */ }
  }, [draftLibraryId, onBack]);

  const [rejectFeedback, setRejectFeedback] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const handleReject = useCallback(async () => {
    if (!draftLibraryId) return;
    try {
      await fetch(`/api/v1/docforge/libraries/${draftLibraryId}/reject?feedback=${encodeURIComponent(rejectFeedback)}`, {
        method: "POST",
        headers: { "x-api-key": "dev-key-brain-2024", "Content-Type": "application/json" },
      });
      onBack();
    } catch { /* silent */ }
  }, [draftLibraryId, rejectFeedback, onBack]);
  const { sendMessage } = useChatContext();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? 1);
  const [sectionValidation, setSectionValidation] = useState<Record<number, boolean>>({});
  const [pinnedSection, setPinnedSection] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<{ sectionId: number; action: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pinnedFeedback, setPinnedFeedback] = useState(false);

  // Section courante
  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  // Blocs workspace pour cette section
  const sectionBlocks = workspaceBlocks.filter(
    (b: any) => b.sectionId === currentSection?.sectionId
  );

  // Compteur validees
  const validatedCount = Object.values(sectionValidation).filter(Boolean).length;
  const allValidated = validatedCount === sections.length;

  // Progress
  const sectionsWithContent = sections.filter(s =>
    workspaceBlocks.some((b: any) => b.sectionId === s.sectionId) || sectionValidation[s.id]
  ).length;
  const progressPct = Math.round((sectionsWithContent / sections.length) * 100);

  // ═══ Handlers ═══

  const handleValidate = useCallback((sectionId: number) => {
    setSectionValidation(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  const handlePin = useCallback(() => {
    if (!currentSection) return;
    const content = sectionBlocks.map((b: any) => b.summary || b.title).join("\n");
    if (content) {
      addWorkflowItem({
        id: `pin-${Date.now()}`,
        phase: "creation",
        text: `[${currentSection.title}] ${content.substring(0, 200)}`,
        type: "insight",
        timestamp: Date.now(),
      });
      setPinnedFeedback(true);
      setPinnedSection(currentSection.id);
      setTimeout(() => setPinnedFeedback(false), 2000);
    }
  }, [currentSection, sectionBlocks, addWorkflowItem]);

  const handleAction = useCallback((action: string) => {
    if (!currentSection) return;
    const actionPrompts: Record<string, string> = {
      approfondir: `Approfondis la section "${currentSection.title}": donne plus de details, chiffres, et exemples concrets.`,
      reformuler: `Reformule la section "${currentSection.title}": version plus claire, directe et impactante.`,
      challenger: `Challenge la section "${currentSection.title}": trouve les failles, risques et angles morts.`,
      fusionner: `Fusionne et synthetise tout le contenu de "${currentSection.title}" en une version consolidee.`,
    };
    setActiveAction({ sectionId: currentSection.id, action });
    sendMessage(actionPrompts[action] || `Action "${action}" sur: ${currentSection.title}`, activeBotCode);
    setTimeout(() => setActiveAction(null), 3000);
  }, [currentSection, sendMessage, activeBotCode]);

  const handleAskAI = useCallback(() => {
    if (!currentSection) return;
    const promptPrefix = context ? `Contexte: ${context}\n\n` : "";
    sendMessage(`${promptPrefix}${currentSection.prompt}`, activeBotCode);
  }, [currentSection, context, sendMessage, activeBotCode]);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      // Upload via bureau API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("titre", file.name);
      const uploadResp = await fetch("/api/v1/bureau/upload", {
        method: "POST",
        headers: { "X-API-Key": "dev" },
        body: formData,
      });
      if (!uploadResp.ok) throw new Error("Upload failed");
      const uploadData = await uploadResp.json();

      // Parse vers workspace
      const parseResp = await fetch("/api/v1/docforge/parse-to-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "dev" },
        body: JSON.stringify({
          bureau_item_id: uploadData.id,
          deliverable_type: deliverableType,
        }),
      });
      if (!parseResp.ok) throw new Error("Parse failed");
      const parseData = await parseResp.json();

      // Injecter les sections parsees dans le workspace
      for (const sec of parseData.sections || []) {
        addWorkspaceBlock({
          id: `upload-${Date.now()}-${sec.sectionId}`,
          type: "docforge_section" as any,
          title: sec.title,
          summary: sec.content,
          credo_step: "E" as const,
          confidence: sec.confidence || 0.7,
          source: activeBotCode,
          sourceType: "chat",
          sectionId: sec.sectionId,
          timestamp: Date.now(),
        });
      }
    } catch {
      // Silently handle — upload zone will still be visible
    } finally {
      setIsUploading(false);
    }
  }, [deliverableType, activeBotCode, addWorkspaceBlock]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleSaveTemplate = useCallback(async (name: string) => {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
      await fetch("/api/v1/docforge/templates-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "dev" },
        body: JSON.stringify({
          alias: slug,
          titre: name,
          sections: sections.map(s => ({ id: s.sectionId, title: s.title, level: 1 })),
          type_template: "custom",
        }),
      });
    } catch {
      // silent
    }
  }, [sections]);

  // ═══ Sidebar TOC ═══

  const sidebarContent = (
    <div className="space-y-0.5">
      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2.5">Sections</span>
      {sections.map(s => {
        const hasContent = workspaceBlocks.some((b: any) => b.sectionId === s.sectionId);
        const isValidated = sectionValidation[s.id];
        const isActive = activeSection === s.id;
        return (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0",
              isValidated ? "bg-emerald-100" : isActive ? theme.bgLight : "bg-gray-100")}>
              {isValidated
                ? <CheckCircle2 className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                : hasContent
                  ? <s.icon className={cn("h-3 w-3 stroke-[2.5]", isActive ? theme.iconColor : "text-gray-500")} />
                  : <Circle className="h-3 w-3 text-gray-300 stroke-[2.5]" />}
            </div>
            <span className={cn(isActive ? SF.labelActive : SF.labelInactive)}>{s.title}</span>
          </button>
        );
      })}

      {/* Barre de progression */}
      <div className="px-2.5 pt-3">
        <div className={cn("w-full h-1.5 rounded-full", theme.progressBg)}>
          <div className={cn("h-1.5 rounded-full transition-all duration-500", theme.progressFill)}
            style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-gray-400">{validatedCount}/{sections.length} validees</span>
          <span className={cn("text-[8px] font-bold", theme.text)}>{progressPct}%</span>
        </div>
      </div>
    </div>
  );

  // ═══ Rendu ═══

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-12">
      {/* Back button */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-3 cursor-pointer">
        <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" /> Retour au chantier
      </button>

      {/* Hero compact */}
      <div className={cn("relative rounded-xl p-4 mb-4 overflow-hidden", theme.bgLight, theme.border, "border")}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-60" />
        <div className="relative flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", theme.border, "border bg-white/80")}>
            <Icon className={cn("h-4 w-4 stroke-[2.5]", theme.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={cn("text-sm font-bold", theme.text)}>{currentSection?.title || config.title}</h2>
            <p className="text-[10px] text-gray-500">
              Section {activeSection} de {sections.length} — {config.title}
            </p>
          </div>
          <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", theme.bgLight, theme.text)}>
            {progressPct}%
          </div>
        </div>
      </div>

      {/* Upload zone — visible quand aucun bloc n'existe encore */}
      {workspaceBlocks.filter((b: any) => b.sectionId?.startsWith("docforge-")).length === 0 && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="mb-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 p-6 text-center transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden"
            accept=".pdf,.docx,.xlsx,.csv,.txt,.pptx" onChange={handleFileSelect} />
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin stroke-[2.5]" />
              <span className="text-xs text-gray-500">Analyse du document...</span>
            </div>
          ) : (
            <>
              <FileUp className="h-8 w-8 text-gray-300 mx-auto mb-2 stroke-[2.5]" />
              <p className="text-xs font-medium text-gray-600">Importer un document</p>
              <p className="text-[10px] text-gray-400 mt-1">
                DOCX, XLSX, PPTX, PDF, CSV, TXT — glissez ou cliquez
              </p>
            </>
          )}
        </div>
      )}

      {/* Layout principal: sidebar + contenu */}
      <div className="flex gap-3">
        {/* Sidebar TOC — desktop */}
        {!isMobile && (
          <div className={SF.sidebarW}>
            {sidebarContent}
          </div>
        )}

        {/* Mobile sidebar */}
        {isMobile && (
          <MobileSidebarSheet title="Sections">
            {sidebarContent}
          </MobileSidebarSheet>
        )}

        {/* Zone contenu */}
        <div className="flex-1 min-w-0">
          {currentSection && (
            <div className={cn("rounded-xl border bg-white p-4 shadow-sm", "border-gray-200",
              `border-l-[3px]`, theme.borderLeft)}>

              {/* Titre section */}
              <div className="flex items-center gap-2 mb-3">
                <currentSection.icon className={cn("h-4 w-4 stroke-[2.5]", theme.iconColor)} />
                <h3 className="text-sm font-bold text-gray-900 flex-1">{currentSection.title}</h3>
                <button
                  onClick={() => handleValidate(currentSection.id)}
                  className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors",
                    sectionValidation[currentSection.id]
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                  )}
                >
                  {sectionValidation[currentSection.id] ? "Validee" : "Valider"}
                </button>
              </div>

              {/* Contenu de la section */}
              {sectionBlocks.length > 0 ? (
                <div className="space-y-3">
                  {sectionBlocks.map((block: any) => (
                    <div key={block.id} className={cn("rounded-lg p-3", theme.sectionBg)}>
                      {deliverableType === "code" ? (
                        <CodeTerminalRenderer
                          content={block.summary || ""}
                          animate={Date.now() - block.timestamp < 10000}
                        />
                      ) : (
                        <div className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatCristallise(block.summary || block.title) }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Pas de contenu — bouton "Demander a l'equipe AI" */
                <div className="text-center py-8">
                  <Circle className={cn("h-8 w-8 mx-auto mb-2 stroke-[2.5]", theme.iconColor, "opacity-30")} />
                  <p className="text-xs text-gray-400 mb-3">Aucun contenu pour cette section</p>
                  <button onClick={handleAskAI}
                    className={cn("px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                      theme.bgLight, theme.text, "hover:shadow-sm border", theme.border)}>
                    Demander a l'equipe AI
                  </button>
                  {/* Upload inline */}
                  <button onClick={() => fileInputRef.current?.click()}
                    className="ml-2 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">
                    <Upload className="h-3 w-3 inline mr-1 stroke-[2.5]" /> Importer
                  </button>
                </div>
              )}

              {/* Action buttons — si contenu existe */}
              {sectionBlocks.length > 0 && (
                <DocForgeActionButtons
                  sectionTitle={currentSection.title}
                  theme={theme}
                  onPin={handlePin}
                  onApprofondir={() => handleAction("approfondir")}
                  onReformuler={() => handleAction("reformuler")}
                  onChallenger={() => handleAction("challenger")}
                  onFusionner={() => handleAction("fusionner")}
                  pinnedFeedback={pinnedFeedback}
                  activeAction={activeAction?.sectionId === currentSection.id ? activeAction.action : null}
                />
              )}
            </div>
          )}

          {/* Completion banner */}
          {allValidated && !reviewMode && (
            <CompletionBanner
              icon={Icon}
              theme={theme}
              sectionCount={sections.length}
              onExportPdf={() => sendMessage("Genere le PDF final du livrable complet.", activeBotCode)}
              onStartJumelage={onStartJumelage}
              onBack={onBack}
              onSaveTemplate={handleSaveTemplate}
            />
          )}

          {/* D2: Review mode — approve/reject footer */}
          {reviewMode && draftLibraryId && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[10px] font-bold text-amber-700 uppercase mb-2">En attente d&apos;approbation</p>
              {showRejectForm ? (
                <div className="space-y-2">
                  <textarea
                    value={rejectFeedback}
                    onChange={e => setRejectFeedback(e.target.value)}
                    placeholder="Raison du rejet ou modifications demandees..."
                    className="w-full text-[10px] p-2 border rounded-lg resize-none h-16"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowRejectForm(false)} className="px-3 py-1.5 text-[10px] text-gray-500 hover:text-gray-700">Annuler</button>
                    <button onClick={handleReject} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-red-700 bg-red-100 rounded-lg hover:bg-red-200">
                      <X className="h-3 w-3" /> Confirmer rejet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleApprove} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200">
                    <Check className="h-3.5 w-3.5" /> Approuver et publier
                  </button>
                  <button onClick={() => setShowRejectForm(true)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200">
                    <X className="h-3.5 w-3.5" /> Rejeter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
