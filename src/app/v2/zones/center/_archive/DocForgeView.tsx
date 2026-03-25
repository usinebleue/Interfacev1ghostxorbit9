/**
 * DocForgeView.tsx — Bibliothèque Intelligente DocForge
 * Sub-tabs: Bibliothèques | Blocs en revue | Faits & Contradictions
 * Sprint DocForge — Phase 1 MVP
 */

import { useState, useEffect } from "react";
import {
  Library,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  BookOpen,
  Eye,
  Trash2,
} from "lucide-react";
import { PageLayout } from "./layouts/PageLayout";
import { PageHeader } from "./layouts/PageHeader";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useDocForge, useDocForgeLibrary } from "../../api/hooks";
import { api } from "../../api/client";
import type { DocForgeLibrary, DocForgeBlock, DocForgeFact } from "../../api/types";

type SubTab = "libraries" | "blocks" | "facts";

export function DocForgeView() {
  const [activeTab, setActiveTab] = useState<SubTab>("libraries");
  const [selectedLibId, setSelectedLibId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { libraries, loading, refresh, createLibrary, deleteLibrary } = useDocForge();
  const { library, blocks, facts, loading: libLoading, refresh: refreshLib, approveBlock, rejectBlock, resolveFact, process } = useDocForgeLibrary(selectedLibId);

  const tabs = (
    <div className="flex items-center gap-1">
      {([
        { id: "libraries" as SubTab, label: "Bibliothèques", icon: Library },
        { id: "blocks" as SubTab, label: "Blocs", icon: FileText },
        { id: "facts" as SubTab, label: "Faits", icon: AlertTriangle },
      ]).map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 ${
              activeTab === t.id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <PageLayout maxWidth="4xl" header={
      <PageHeader
        icon={BookOpen}
        iconColor="text-indigo-600"
        title="DocForge"
        subtitle="Bibliothèque Intelligente"
        rightSlot={tabs}
      />
    }>
      {activeTab === "libraries" && (
        <LibraryList
          libraries={libraries}
          loading={loading}
          onSelect={(id) => { setSelectedLibId(id); setActiveTab("blocks"); }}
          onDelete={deleteLibrary}
          onCreate={() => setShowCreate(true)}
          onProcess={async (id) => {
            setProcessingId(id);
            try {
              await process(id);
              // Poll progress after 2s
              setTimeout(() => refresh(), 2000);
              setTimeout(() => refresh(), 5000);
            } finally {
              setTimeout(() => setProcessingId(null), 5000);
            }
          }}
          processingId={processingId}
          refresh={refresh}
        />
      )}

      {activeTab === "blocks" && selectedLibId && (
        <BlocksReview
          library={library}
          blocks={blocks}
          loading={libLoading}
          onApprove={approveBlock}
          onReject={rejectBlock}
          onRefresh={refreshLib}
        />
      )}

      {activeTab === "facts" && selectedLibId && (
        <FactsPanel
          facts={facts}
          loading={libLoading}
          onResolve={resolveFact}
        />
      )}

      {(activeTab === "blocks" || activeTab === "facts") && !selectedLibId && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Sélectionnez une bibliothèque dans l'onglet Bibliothèques
        </div>
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            await createLibrary(data);
            setShowCreate(false);
          }}
        />
      )}
    </PageLayout>
  );
}

// --- Library List ---

function LibraryList({
  libraries, loading, onSelect, onDelete, onCreate, onProcess, refresh, processingId,
}: {
  libraries: DocForgeLibrary[];
  loading: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onProcess: (id: number) => void;
  refresh: () => void;
  processingId?: number | null;
}) {
  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{libraries.length} bibliothèque{libraries.length !== 1 ? "s" : ""}</span>
        <button
          onClick={onCreate}
          className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-indigo-700 font-medium"
        >
          <Plus className="h-3.5 w-3.5" /> Nouvelle
        </button>
      </div>

      {libraries.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Aucune bibliothèque. Créez-en une pour commencer.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {libraries.map((lib) => (
          <div key={lib.id} className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 flex items-center gap-2 border-b">
              <BookOpen className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white flex-1">{lib.titre}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-indigo-800">
                {lib.status}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3">{lib.description || lib.template_alias || "Pas de description"}</p>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">{lib.nb_blocs}</div>
                  <div className="text-[9px] text-gray-400">Blocs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{lib.completude_pct}%</div>
                  <div className="text-[9px] text-gray-400">Complétude</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{lib.nb_faits}</div>
                  <div className="text-[9px] text-gray-400">Faits</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{lib.nb_contradictions}</div>
                  <div className="text-[9px] text-gray-400">Contradictions</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${lib.completude_pct}%` }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(lib.id)}
                  className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 font-medium"
                >
                  <Eye className="h-3.5 w-3.5" /> Voir blocs
                </button>
                <button
                  onClick={() => onProcess(lib.id)}
                  disabled={processingId === lib.id}
                  className={`text-xs border px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium ${
                    processingId === lib.id
                      ? "bg-amber-50 text-amber-700 border-amber-200 cursor-wait"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {processingId === lib.id ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Pipeline en cours...</>
                  ) : (
                    <><Play className="h-3.5 w-3.5" /> Pipeline</>
                  )}
                </button>
                <button
                  onClick={() => { if (confirm("Supprimer cette bibliothèque?")) onDelete(lib.id); }}
                  className="text-xs text-gray-400 hover:text-red-500 ml-auto p-1.5 rounded hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Blocks Review ---

function BlocksReview({
  library, blocks, loading, onApprove, onReject, onRefresh,
}: {
  library: DocForgeLibrary | null;
  blocks: DocForgeBlock[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onRefresh: () => void;
}) {
  const [filterSection, setFilterSection] = useState<string>("");

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  }

  const sections = library?.template_sections || [];
  const filteredBlocks = filterSection
    ? blocks.filter((b) => b.section_id === filterSection)
    : blocks;

  return (
    <div className="space-y-4">
      {/* Section filter */}
      {sections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilterSection("")}
            className={`px-2 py-1 text-[9px] rounded-full font-medium ${!filterSection ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Tous ({blocks.length})
          </button>
          {sections.map((s) => {
            const count = blocks.filter((b) => b.section_id === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setFilterSection(s.id)}
                className={`px-2 py-1 text-[9px] rounded-full font-medium ${filterSection === s.id ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {s.title} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filteredBlocks.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">Aucun bloc à afficher</div>
      )}

      {/* Blocks */}
      {filteredBlocks.map((block) => (
        <div key={block.id} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 border-b">
            <FileText className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700 flex-1">
              {block.section_title || block.section_id || "Non classé"}
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
              block.status === "approuve" ? "bg-emerald-100 text-emerald-700" :
              block.status === "rejete" ? "bg-red-100 text-red-700" :
              block.status === "suggere" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {block.status}
            </span>
            {block.confiance < 1 && (
              <span className="text-[9px] text-gray-400">{Math.round(block.confiance * 100)}%</span>
            )}
          </div>
          <div className="p-3">
            {block.contenu_resume && (
              <p className="text-xs text-gray-500 italic mb-2">{block.contenu_resume}</p>
            )}
            <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
              {block.contenu_md.slice(0, 1000)}{block.contenu_md.length > 1000 ? "..." : ""}
            </pre>
            <div className="text-[9px] text-gray-400 mt-2">
              Source: {block.source_type} — {block.source_ref || "n/a"}
            </div>
          </div>
          {block.status !== "approuve" && block.status !== "rejete" && (
            <div className="bg-gray-50 px-3 py-2 border-t flex items-center gap-2">
              <button
                onClick={() => onApprove(block.id)}
                className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-700 font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approuver
              </button>
              <button
                onClick={() => onReject(block.id)}
                className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-100 font-medium"
              >
                <XCircle className="h-3.5 w-3.5" /> Rejeter
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Facts Panel ---

function FactsPanel({
  facts, loading, onResolve,
}: {
  facts: DocForgeFact[];
  loading: boolean;
  onResolve: (id: number, valeur: string) => void;
}) {
  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  }

  const contradictions = facts.filter((f) => f.status === "contradiction");
  const confirmed = facts.filter((f) => f.status === "confirme");

  return (
    <div className="space-y-4">
      {contradictions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Contradictions ({contradictions.length})
          </h3>
          {contradictions.map((fact) => (
            <div key={fact.id} className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-red-400 bg-red-50/30">
              <div className="text-sm font-medium text-gray-800">{fact.sujet}</div>
              <div className="text-xs text-gray-600 mt-1">Valeur: {fact.valeur || "Non définie"}</div>
              {fact.valeurs_alternatives?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {fact.valeurs_alternatives.map((alt: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => onResolve(fact.id, alt.valeur)}
                      className="text-xs bg-white border px-2 py-1 rounded hover:bg-blue-50 text-gray-700 block w-full text-left"
                    >
                      → {alt.valeur} <span className="text-gray-400">(bloc #{alt.source_block_id})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Faits confirmés ({confirmed.length})
        </h3>
        {confirmed.map((fact) => (
          <div key={fact.id} className="border rounded-lg px-3 py-2 border-l-[3px] border-l-emerald-400 bg-emerald-50/30">
            <div className="text-xs font-medium text-gray-700">{fact.sujet}</div>
            <div className="text-xs text-gray-500">{fact.valeur}</div>
            <div className="text-[9px] text-gray-400 mt-1">{fact.categorie}</div>
          </div>
        ))}
        {confirmed.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-xs">Aucun fait extrait</div>
        )}
      </div>
    </div>
  );
}

// --- Create Modal ---

function CreateModal({
  onClose, onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { titre: string; template_alias: string; description: string }) => void;
}) {
  const [selectedAlias, setSelectedAlias] = useState<string>("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [templates, setTemplates] = useState<{ alias: string; titre: string; description: string; nb_sections: number }[]>([]);
  const [loadingTpl, setLoadingTpl] = useState(true);

  // Charger les templates depuis l'API
  useEffect(() => {
    api.docForgeTemplates()
      .then((res) => {
        setTemplates(res.templates || []);
        setLoadingTpl(false);
      })
      .catch(() => setLoadingTpl(false));
  }, []);

  const handleSelectTemplate = (tpl: typeof templates[0]) => {
    setSelectedAlias(tpl.alias);
    if (!titre) setTitre(tpl.titre);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl z-10">
          <h3 className="text-sm font-bold text-gray-900">Nouvelle bibliothèque</h3>
          <p className="text-xs text-gray-400 mt-0.5">Choisis un template, puis lance le Pipeline pour ingérer automatiquement depuis Drive</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Template selection */}
          <div>
            <label className="text-xs text-gray-500 block mb-2 font-medium">Template de structure</label>
            {loadingTpl ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.alias}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      selectedAlias === tpl.alias
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-800">{tpl.titre}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5 leading-tight">{tpl.description}</div>
                    <div className="text-[9px] text-indigo-500 mt-1 font-medium">{tpl.nb_sections} sections</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Titre */}
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">Titre de la bibliothèque</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Ex: Bible GHML V3"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Objectif de cette bible..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-xl flex items-center gap-2 justify-between">
          <div className="text-[9px] text-gray-400">
            {selectedAlias ? "Le Pipeline scannera Google Drive automatiquement" : "Sélectionne un template"}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">
              Annuler
            </button>
            <button
              onClick={() => titre && selectedAlias && onCreate({ titre, template_alias: selectedAlias, description })}
              disabled={!titre || !selectedAlias}
              className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              Créer la bibliothèque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
