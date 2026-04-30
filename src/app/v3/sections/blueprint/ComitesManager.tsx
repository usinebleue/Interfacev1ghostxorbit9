/** ComitesManager.tsx — Gestion des comites par departement. Extracted from BlueprintDepartement.tsx */

import { useState } from "react";
import {
  Briefcase, Users, BarChart3, Calendar, Activity, ListChecks, ChevronRight,
  Sparkles, Settings, UserPlus, Trash2, Plus, Save, Loader2, Info,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useDataSource } from "../../data/use-data-source";
import { DomainBadge } from "../../data/source-badge";
import {
  type Membre, type Comite,
  COMITES_SUGGESTED_TEMPLATES, COMITE_MOCK_REUNIONS, COMITE_MOCK_DOCUMENTS,
} from "../../data/mock/blueprint.mock";

function parseJSON<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function parseComites(raw: string): Comite[] {
  return parseJSON<Comite[]>(raw, []);
}

export function ComitesManager({ botCode, deptLabel, headerGradient, data, onFieldChange, onSave, saving, dirty }: {
  botCode: string;
  deptLabel: string;
  headerGradient: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const { data: comitesSourceData } = useDataSource("comites", { COMITES_SUGGESTED_TEMPLATES, COMITE_MOCK_REUNIONS, COMITE_MOCK_DOCUMENTS });

  const KEY = `comites_${botCode}`;
  const comites = parseComites(data[KEY] || "");
  const [activeComite, setActiveComite] = useState<string | null>(comites[0]?.id || null);

  const updateComites = (updated: Comite[]) => {
    onFieldChange(KEY, JSON.stringify(updated));
  };

  const addComite = () => {
    const id = `comite_${Date.now()}`;
    const newComite: Comite = {
      id,
      nom: "",
      frequence: "Mensuelle",
      format: "Conférence AI",
      description: "",
      responsable: "",
      prochaine_reunion: "",
      membres: [],
    };
    updateComites([...comites, newComite]);
    setActiveComite(id);
  };

  const removeComite = (id: string) => {
    const updated = comites.filter(c => c.id !== id);
    updateComites(updated);
    if (activeComite === id) setActiveComite(updated[0]?.id || null);
  };

  const updateComite = (id: string, patch: Partial<Comite>) => {
    updateComites(comites.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const addMembre = (comiteId: string) => {
    const c = comites.find(c => c.id === comiteId);
    if (!c) return;
    updateComite(comiteId, { membres: [...c.membres, { nom: "", titre: "", courriel: "", type: "interne" }] });
  };

  const removeMembre = (comiteId: string, idx: number) => {
    const c = comites.find(c => c.id === comiteId);
    if (!c) return;
    updateComite(comiteId, { membres: c.membres.filter((_, i) => i !== idx) });
  };

  const updateMembre = (comiteId: string, idx: number, patch: Partial<Membre>) => {
    const c = comites.find(c => c.id === comiteId);
    if (!c) return;
    updateComite(comiteId, { membres: c.membres.map((m, i) => i === idx ? { ...m, ...patch } : m) });
  };

  const [showOverview, setShowOverview] = useState(true);
  const [comiteTab, setComiteTab] = useState<"config" | "participants" | "reunions" | "documents">("config");
  const active = comites.find(c => c.id === activeComite);
  const inputBase = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white";

  const COMITE_TABS = [
    { id: "config" as const, label: "Config" },
    { id: "participants" as const, label: "Participants" },
    { id: "reunions" as const, label: "Réunions" },
    { id: "documents" as const, label: "Documents" },
  ];

  const totalParticipants = comites.reduce((sum, c) => sum + c.membres.length, 0);

  return (
    <div className="space-y-3">
      {/* Header — style Personnel/Bot */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden", headerGradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Comités — {deptLabel}</h3>
              <DomainBadge domain="comites" className="ml-1" />
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{comites.length} comité{comites.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-xs text-white/80">
              Créez et gérez les comités du département. Participants internes et externes, Conférences AI et minutes automatiques.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
      {/* Sidebar — Vue d'ensemble + liste des comités */}
      <div className="w-[180px] shrink-0 space-y-1">
        {/* Vue d'ensemble */}
        <button onClick={() => { setShowOverview(true); setActiveComite(null); }} className={cn(
          "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
          showOverview && !activeComite ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
        )}>
          <div className="flex items-center gap-1.5">
            <BarChart3 className={cn("h-3.5 w-3.5", showOverview && !activeComite ? "text-blue-600" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold leading-tight", showOverview && !activeComite ? "text-blue-700" : "text-gray-700")}>Vue d'ensemble</span>
          </div>
          <div className="text-[9px] text-gray-400 ml-[20px]">{comites.length} comités</div>
        </button>

        {/* Séparateur */}
        {comites.length > 0 && <div className="border-t border-gray-100 my-1" />}

        {/* Liste comités */}
        {comites.map(c => (
          <button key={c.id} onClick={() => { setActiveComite(c.id); setShowOverview(false); setComiteTab("config"); }} className={cn(
            "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer group",
            activeComite === c.id && !showOverview ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
          )}>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[10px] font-bold flex-1 leading-tight truncate", activeComite === c.id && !showOverview ? "text-blue-700" : "text-gray-700")}>
                {c.nom || "Nouveau comité"}
              </span>
              <button onClick={e => { e.stopPropagation(); removeComite(c.id); }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-gray-400">{c.membres.length} membre{c.membres.length !== 1 ? "s" : ""}</span>
              <span className="text-[9px] text-gray-300">·</span>
              <span className="text-[9px] text-gray-400">{c.frequence}</span>
            </div>
          </button>
        ))}

        {/* Bouton ajouter */}
        <button onClick={addComite} className="w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer hover:bg-gray-50 border border-dashed border-gray-200 mt-1">
          <div className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400">Nouveau comité</span>
          </div>
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-3">

          {/* Vue d'ensemble */}
          {(showOverview || !activeComite) && (<>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Briefcase className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Comités</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{comites.length}</div>
                  <div className="text-[9px] text-gray-400">Total actifs</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Participants</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalParticipants}</div>
                  <div className="text-[9px] text-gray-400">Total membres</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Réunions</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{comites.filter(c => c.prochaine_reunion).length}</div>
                  <div className="text-[9px] text-gray-400">Planifiées</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Activité</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{comites.length > 0 ? Math.round((comites.filter(c => c.membres.length > 0).length / comites.length) * 100) : 0}%</div>
                  <div className="text-[9px] text-gray-400">Comités actifs</div>
                </div>
              </div>
            </div>

            {/* Résumé des comités */}
            {comites.length > 0 && (
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <ListChecks className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                  <span className="text-xs font-bold text-gray-900">Résumé des comités</span>
                </div>
                <div className="p-3 space-y-2">
                  {comites.map(c => (
                    <div key={c.id} onClick={() => { setActiveComite(c.id); setShowOverview(false); setComiteTab("config"); }} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                      <div>
                        <div className="text-xs font-bold text-gray-700">{c.nom || "Sans nom"}</div>
                        <div className="text-[9px] text-gray-400">{c.responsable || "Pas de responsable"} · {c.membres.length} membres · {c.frequence}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.prochaine_reunion && <span className="text-[9px] text-blue-600 font-medium">{c.prochaine_reunion}</span>}
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modèles suggérés */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Sparkles className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                <span className="text-xs font-bold text-gray-900">Modèles de comités suggérés</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {COMITES_SUGGESTED_TEMPLATES.map((t, i) => (
                  <div key={i} onClick={() => {
                    const id = `comite_${Date.now()}_${i}`;
                    const newC: Comite = { id, nom: t.nom, frequence: t.frequence, format: "Conférence AI", description: t.description, responsable: "", prochaine_reunion: "", membres: [] };
                    updateComites([...comites, newC]);
                    setActiveComite(id);
                    setShowOverview(false);
                    setComiteTab("config");
                  }} className="px-3 py-2 rounded-lg border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all">
                    <div className="text-xs font-bold text-gray-700">{t.nom}</div>
                    <div className="text-[9px] text-gray-400">{t.description}</div>
                    <div className="text-[9px] text-blue-500 font-medium mt-1">{t.frequence}</div>
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {/* Comité actif avec sous-tabs */}
          {!showOverview && active && (<>
            {/* Sous-tabs */}
            <div className="flex items-center gap-1 pb-1">
              {COMITE_TABS.map(t => (
                <button key={t.id} onClick={() => setComiteTab(t.id)} className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  comiteTab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>{t.label}</button>
              ))}
            </div>

            {/* Tab: Config */}
            {comiteTab === "config" && (
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Settings className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                  <span className="text-xs font-bold text-gray-900">Configuration du comité</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Nom du comité</label>
                      <input className={inputBase} value={active.nom} onChange={e => updateComite(active.id, { nom: e.target.value })} placeholder="Ex: Comité stratégique, Comité SST..." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Mandat / Objectifs</label>
                      <input className={inputBase} value={active.description} onChange={e => updateComite(active.id, { description: e.target.value })} placeholder="Mandat et objectifs du comité" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Responsable</label>
                      <input className={inputBase} value={active.responsable || ""} onChange={e => updateComite(active.id, { responsable: e.target.value })} placeholder="Nom du responsable" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Fréquence</label>
                      <select className={inputBase} value={active.frequence} onChange={e => updateComite(active.id, { frequence: e.target.value })}>
                        <option value="Hebdomadaire">Hebdomadaire</option>
                        <option value="Bimensuelle">Bimensuelle</option>
                        <option value="Mensuelle">Mensuelle</option>
                        <option value="Bimestrielle">Bimestrielle</option>
                        <option value="Trimestrielle">Trimestrielle</option>
                        <option value="Semestrielle">Semestrielle</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Format de réunion</label>
                      <select className={inputBase} value={active.format} onChange={e => updateComite(active.id, { format: e.target.value })}>
                        <option value="Conférence AI">Conférence AI</option>
                        <option value="Présentiel">Présentiel</option>
                        <option value="Hybride">Hybride</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Prochaine réunion</label>
                      <input type="date" className={inputBase} value={active.prochaine_reunion || ""} onChange={e => updateComite(active.id, { prochaine_reunion: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Participants */}
            {comiteTab === "participants" && (
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                    <span className="text-xs font-bold text-gray-900">Participants ({active.membres.length})</span>
                  </div>
                  <button onClick={() => addMembre(active.id)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer">
                    <UserPlus className="h-3.5 w-3.5" /> Ajouter un participant
                  </button>
                </div>
                <div className="p-4">
                  {active.membres.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                      <Users className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 mb-3">Aucun participant dans ce comité</p>
                      <button onClick={() => addMembre(active.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all mx-auto">
                        <UserPlus className="h-3.5 w-3.5" /> Ajouter le premier participant
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {active.membres.map((m, idx) => (
                        <div key={idx} className={cn("rounded-lg border px-3 py-3 group transition-all", m.type === "externe" ? "border-amber-200 bg-amber-50/30" : "border-gray-200 bg-white")}>
                          <div className="grid grid-cols-5 gap-2 items-center">
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Nom</label>
                              <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.nom} onChange={e => updateMembre(active.id, idx, { nom: e.target.value })} placeholder="Nom complet" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Titre / Rôle</label>
                              <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.titre} onChange={e => updateMembre(active.id, idx, { titre: e.target.value })} placeholder="VP Finance, Directeur..." />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Courriel</label>
                              <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.courriel} onChange={e => updateMembre(active.id, idx, { courriel: e.target.value })} placeholder="courriel@..." />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Type</label>
                              <select className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.type} onChange={e => updateMembre(active.id, idx, { type: e.target.value as "interne" | "externe" })}>
                                <option value="interne">Interne</option>
                                <option value="externe">Externe</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button onClick={() => removeMembre(active.id, idx)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer shrink-0 pb-1">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {active.membres.some(m => m.type === "externe") && (
                    <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200/50">
                      <Info className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[9px] text-amber-700 leading-relaxed">
                        Les membres externes recevront une invitation par courriel pour accéder à la plateforme en tant qu'invité et participer aux Conférences AI. Les minutes leur seront envoyées automatiquement.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Réunions */}
            {comiteTab === "reunions" && (<>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Historique des réunions — {active.nom || "Comité"}</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                  <Plus className="h-3.5 w-3.5" /> Planifier une réunion
                </button>
              </div>
              <div className="space-y-2">
                {COMITE_MOCK_REUNIONS.map((r, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[80px]">
                          <div className="text-xs font-bold text-gray-700">{r.date}</div>
                          <div className="text-[9px] text-gray-400">{r.duree}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-700">{r.sujet}</div>
                          <div className="text-[9px] text-gray-400">{r.type} · {r.participants} participants</div>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                        r.statut_pv === "Approuvé" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      )}>{r.statut_pv}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <p className="text-[9px] text-blue-700">Brain Team peut générer les procès-verbaux automatiquement à partir des transcriptions de Conférence AI.</p>
              </div>
            </>)}

            {/* Tab: Documents */}
            {comiteTab === "documents" && (<>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Documents — {active.nom || "Comité"}</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                  <Sparkles className="h-3.5 w-3.5" /> Générer avec AI
                </button>
              </div>
              <div className="space-y-2">
                {COMITE_MOCK_DOCUMENTS.map((d, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-700">{d.titre}</div>
                        <div className="text-[9px] text-gray-400">{d.type} · Dernière MAJ: {d.maj}</div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                        d.statut === "Actif" || d.statut === "Approuvé" ? "bg-emerald-50 text-emerald-700" :
                        d.statut === "En révision" ? "bg-amber-50 text-amber-700" :
                        "bg-gray-100 text-gray-500"
                      )}>{d.statut}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>)}

            {/* Save */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] text-gray-400">{dirty ? "Modifications non sauvegardées" : "À jour"}</span>
              <button onClick={onSave} disabled={saving || !dirty} className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                dirty ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </>)}

          {/* Empty state quand pas de comités et overview */}
          {!showOverview && !active && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-xs text-gray-400 mb-2">Sélectionnez un comité ou créez-en un nouveau</p>
              <button onClick={addComite} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Plus className="h-3.5 w-3.5" /> Créer un premier comité
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}
