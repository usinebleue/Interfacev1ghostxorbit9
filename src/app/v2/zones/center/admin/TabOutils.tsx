/**
 * TabOutils.tsx — Outils: playbooks, templates documentaires, configuration COMMAND
 * Remplace TabOperations.tsx — panneau de creation/gestion (pas un viewer pipeline)
 * Toutes les donnees proviennent de l'API reelle.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Wrench,
  BookOpen,
  FileText,
  Zap,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BotBadge, BlockHeader, LoadingState, EmptyState, StatusBadge, TabSectionHeader } from "../shared/SectionComponents";

// =======================================
// Types
// =======================================

interface Props {
  mode: string;
  tenantId?: number;
}

// =======================================
// Status mapper (same as HierarchieGHML)
// =======================================

function mapStatus(s: string): "done" | "en-cours" | "a-faire" | "bloque" {
  switch (s) {
    case "completee": case "completed": case "done": return "done";
    case "en_cours": case "en-cours": case "active": return "en-cours";
    case "en_attente": case "a-faire": case "a_faire": return "a-faire";
    case "bloque": case "archivee": return "bloque";
    default: return "a-faire";
  }
}

// =======================================
// SECTION 1 — Playbooks
// =======================================

function SectionPlaybooks() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.listPlaybooks()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.playbooks || [];
        setPlaybooks(list);
      })
      .catch(() => setError("Endpoint non disponible"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <Card className="p-0 overflow-hidden">
        <BlockHeader icon={BookOpen} title="Playbooks" gradient="from-indigo-600 to-indigo-500" />
        <div className="p-4">
          <EmptyState message={error} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader icon={BookOpen} title="Playbooks" count={playbooks.length} gradient="from-indigo-600 to-indigo-500" />
      <div className="p-3">
        {playbooks.length === 0 ? (
          <EmptyState message="Aucun playbook cree. Les playbooks seront disponibles prochainement." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Titre</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Description</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Tags</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Bots</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {playbooks.map((pb: any) => {
                  const id = pb.id || pb.playbook_id || pb.alias;
                  const titre = pb.titre || pb.nom || pb.alias || "Playbook";
                  const description = pb.description || "";
                  const truncDesc = description.length > 80 ? description.slice(0, 80) + "..." : description;
                  const tags = Array.isArray(pb.tags) ? pb.tags : [];
                  const botCodes = Array.isArray(pb.bot_codes) ? pb.bot_codes : [];
                  const createdAt = pb.created_at;

                  return (
                    <tr key={id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 px-2 font-medium text-gray-800">{titre}</td>
                      <td className="py-2 px-2 text-gray-600 max-w-[200px]">
                        <span className="truncate block">{truncDesc || "-"}</span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {tags.length > 0 ? tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-[9px]">
                              {tag}
                            </Badge>
                          )) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {botCodes.length > 0 ? botCodes.slice(0, 3).map((bc: string, i: number) => (
                            <BotBadge key={bc + i} code={bc} />
                          )) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-gray-500 whitespace-nowrap">
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString("fr-CA")
                          : "\u2014"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

// =======================================
// SECTION 2 — Templates documentaires
// =======================================

interface TemplateForm {
  alias: string;
  titre: string;
  description: string;
  keywords: string;
  bot_recommande: string;
}

const EMPTY_TEMPLATE_FORM: TemplateForm = {
  alias: "",
  titre: "",
  description: "",
  keywords: "",
  bot_recommande: "",
};

function SectionTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TemplateForm>({ ...EMPTY_TEMPLATE_FORM });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api.docForgeTemplatesV2()
      .then((data: any) => {
        const list = data?.templates || [];
        setTemplates(Array.isArray(list) ? list : []);
      })
      .catch(() => setError("Endpoint non disponible"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await api.docForgeTemplateV2Delete(id);
      refresh();
    } catch {
      setError("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = async () => {
    if (!form.alias || !form.titre) {
      setSaveError("Alias et titre sont requis");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const keywordsArray = form.keywords
        ? form.keywords.split(",").map(k => k.trim()).filter(Boolean)
        : [];
      await api.docForgeTemplateV2Create({
        alias: form.alias,
        titre: form.titre,
        description: form.description || undefined,
        keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
        bot_recommande: form.bot_recommande || undefined,
      });
      setForm({ ...EMPTY_TEMPLATE_FORM });
      setShowForm(false);
      refresh();
    } catch {
      setSaveError("Erreur lors de la creation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error && templates.length === 0) {
    return (
      <Card className="p-0 overflow-hidden">
        <BlockHeader icon={FileText} title="Templates documentaires" gradient="from-violet-600 to-violet-500" />
        <div className="p-4">
          <EmptyState message={error} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader icon={FileText} title="Templates documentaires" count={templates.length} gradient="from-violet-600 to-violet-500" />
      <div className="p-3 space-y-3">
        {error && (
          <div className="text-xs text-red-500 px-1">{error}</div>
        )}

        {templates.length === 0 ? (
          <EmptyState message="Aucun template documentaire" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Titre</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Alias</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Bot</th>
                  <th className="text-right py-2 px-2 font-bold text-gray-600">Sections</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Keywords</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl: any) => {
                  const id = tpl.id;
                  const titre = tpl.titre || tpl.title || "-";
                  const alias = tpl.alias || "-";
                  const botRec = tpl.bot_recommande || tpl.bot || "-";
                  const sections = Array.isArray(tpl.sections) ? tpl.sections.length : 0;
                  const keywords = Array.isArray(tpl.keywords) ? tpl.keywords : [];

                  return (
                    <tr key={id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 px-2 font-medium text-gray-800">{titre}</td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-[9px] font-bold">{alias}</Badge>
                      </td>
                      <td className="py-2 px-2">
                        {botRec !== "-" ? <BotBadge code={botRec} /> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700">{sections}</td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {keywords.length > 0 ? keywords.slice(0, 4).map((kw: string) => (
                            <span key={kw} className="text-[9px] px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-200 rounded">
                              {kw}
                            </span>
                          )) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deleting === id}
                          className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 text-[9px] font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Inline create form */}
        {showForm && (
          <Card className="p-3 space-y-3 border-violet-200 bg-violet-50/30">
            <p className="text-xs font-bold text-violet-700">Nouveau template</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Alias *</label>
                <input
                  type="text"
                  value={form.alias}
                  onChange={(e) => setForm(prev => ({ ...prev, alias: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="plan-strategique"
                />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Titre *</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm(prev => ({ ...prev, titre: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Plan Strategique"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Description du template..."
                />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Keywords (virgules)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="strategie, plan, objectifs"
                />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Bot recommande</label>
                <input
                  type="text"
                  value={form.bot_recommande}
                  onChange={(e) => setForm(prev => ({ ...prev, bot_recommande: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="CEOB"
                />
              </div>
            </div>
            {saveError && (
              <div className="text-xs text-red-500">{saveError}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Sauvegarder
              </button>
              <button
                onClick={() => { setShowForm(false); setSaveError(null); }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </Card>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau template
          </button>
        )}
      </div>
    </Card>
  );
}

// =======================================
// SECTION 3 — Configuration COMMAND
// =======================================

function SectionCommand() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.commandMissionsList(5)
      .then((data: any) => {
        const list = data?.missions || data;
        if (Array.isArray(list)) setMissions(list);
      })
      .catch(() => setError("Endpoint non disponible"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader icon={Zap} title="Configuration COMMAND" gradient="from-orange-600 to-orange-500" />
      <div className="p-3 space-y-3">
        {/* Static description */}
        <div className="space-y-1.5">
          <p className="text-xs text-gray-700">
            Le protocole <span className="font-bold text-orange-600">COMMAND</span> est le moteur d'execution de GhostX.
            Il detecte automatiquement les directives dans les messages, les transforme en missions,
            et orchestre les bots pour les executer.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-100">
              <div className="text-[9px] font-bold text-orange-600">Detection</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Messages analyses en temps reel</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-100">
              <div className="text-[9px] font-bold text-orange-600">Dispatch</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Missions assignees aux bots</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-100">
              <div className="text-[9px] font-bold text-orange-600">Execution</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Bots executent en autonomie</p>
            </div>
          </div>
        </div>

        {/* Recent COMMAND activity */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-[9px] font-bold text-gray-500 mb-2">Activite recente</p>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState message={error} />
          ) : missions.length === 0 ? (
            <EmptyState message="Aucune mission COMMAND recente" />
          ) : (
            <div className="space-y-2">
              {missions.map((m: any) => {
                const mStatus = m.stage || m.status || "pending";
                const scanBots = Array.isArray(m.scan_bots) ? m.scan_bots : [];

                return (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <Zap className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {m.titre || m.message_original || `Mission #${m.id}`}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusBadge status={mapStatus(mStatus)} />
                        {m.urgency && (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                            m.urgency === "urgente" || m.urgency === "critique"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : m.urgency === "importante"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          )}>
                            {m.urgency}
                          </span>
                        )}
                        {scanBots.slice(0, 3).map((bc: string, i: number) => (
                          <BotBadge key={bc + i} code={bc} />
                        ))}
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-400 shrink-0">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleDateString("fr-CA")
                        : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// =======================================
// MAIN EXPORT — TabOutils
// =======================================

export function TabOutils({ mode, tenantId }: Props) {
  return (
    <div className="space-y-6">
      <TabSectionHeader
        icon={Wrench}
        title="Outils"
        subtitle="Playbooks, templates et configuration COMMAND"
        gradient="from-orange-600 to-orange-500"
      />

      {/* Section 1 — Playbooks */}
      <SectionPlaybooks />

      {/* Section 2 — Templates documentaires */}
      <SectionTemplates />

      {/* Section 3 — Configuration COMMAND */}
      <SectionCommand />
    </div>
  );
}
