/** ConseilAdminManager.tsx — Conseil d'Administration Manager (CEOB seulement). Extracted from BlueprintDepartement.tsx */

import { useState } from "react";
import {
  Users, Shield, UserPlus, Briefcase, Calendar, FileText, Target, DollarSign,
  Headphones, Bot, Settings, Sparkles, TrendingUp, Activity, Trash2, Plus,
  Save, Loader2, BarChart3, Info,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useIsMobile } from "../../../components/ui/use-mobile";
import { useDataSource } from "../../data/use-data-source";
import { DomainBadge } from "../../data/source-badge";
import { MobileSidebarSheet } from "../../core/MobileSidebarSheet";
import {
  type MembreCA, type ConseilAdmin,
  CA_DEFAULT, CA_MOCK_REUNIONS, CA_MOCK_CONFERENCES, CA_MOCK_DOCUMENTS, CA_BLUEPRINT_COMPLETIONS,
} from "../../data/mock/blueprint.mock";

function parseJSON<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function ConseilAdminManager({ headerGradient, data, onFieldChange, onSave, saving, dirty }: {
  headerGradient: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const isMobile = useIsMobile();
  const { data: caSourceData } = useDataSource("conseil-admin", { CA_DEFAULT, CA_MOCK_REUNIONS, CA_MOCK_CONFERENCES, CA_MOCK_DOCUMENTS });

  const [activeCASection, setActiveCASection] = useState("tableau");
  const KEY = "ca_conseil";
  const ca: ConseilAdmin = parseJSON(data[KEY] || "", CA_DEFAULT);

  const update = (patch: Partial<ConseilAdmin>) => {
    onFieldChange(KEY, JSON.stringify({ ...ca, ...patch }));
  };

  const addMembre = () => {
    update({ membres: [...ca.membres, { nom: "", titre: "", courriel: "", expertise: "", type: "externe", independant: true, depuis: "" }] });
  };

  const removeMembre = (idx: number) => {
    update({ membres: ca.membres.filter((_, i) => i !== idx) });
  };

  const updateMembre = (idx: number, patch: Partial<MembreCA>) => {
    update({ membres: ca.membres.map((m, i) => i === idx ? { ...m, ...patch } : m) });
  };

  const inputBase = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white";
  const nbIndependants = ca.membres.filter(m => m.independant).length;
  const nbExternes = ca.membres.filter(m => m.type === "externe").length;

  const CA_SECTIONS = [
    { id: "tableau", label: "Vue d'ensemble", icon: BarChart3, meta: `${ca.membres.length} membres` },
    { id: "membres", label: "Membres du CA", icon: Users, meta: `${ca.membres.length} actifs` },
    { id: "reunions", label: "Réunions & PV", icon: Calendar, meta: `${CA_MOCK_REUNIONS.length} réunions` },
    { id: "conferences", label: "Conférences AI", icon: Headphones, meta: `${CA_MOCK_CONFERENCES.length} sessions` },
    { id: "documents", label: "Documents & Charte", icon: FileText, meta: `${CA_MOCK_DOCUMENTS.length} docs` },
    { id: "blueprints", label: "Blueprints personnels", icon: Target, meta: `${ca.membres.length} profils` },
    { id: "gouvernance", label: "Gouvernance", icon: Shield, meta: ca.charte === "Oui" ? "Charte active" : "À configurer" },
    { id: "surveillance", label: "Surveillance financière", icon: DollarSign, meta: "4 indicateurs" },
  ];

  return (
    <div className="space-y-3">
      {/* Header — style Personnel/Bot */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden", headerGradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Conseil d'administration</h3>
              <DomainBadge domain="conseil-admin" className="ml-1" />
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{ca.membres.length} membre{ca.membres.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-xs text-white/80">
              L'organe de gouvernance suprême de votre organisation. Suivez les résultats, participez aux réunions (Conférence AI) et recevez les minutes automatiquement.
            </p>
          </div>
        </div>
      </div>

      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
      {/* Sidebar TOC */}
      {(() => {
        const sidebarContent = (<>
          {CA_SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActiveCASection(s.id)} className={cn(
                "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                activeCASection === s.id ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
              )}>
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", activeCASection === s.id ? "text-blue-600" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold leading-tight", activeCASection === s.id ? "text-blue-700" : "text-gray-700")}>{s.label}</span>
                </div>
                <div className="text-[9px] text-gray-400 ml-[20px]">{s.meta}</div>
              </button>
            );
          })}
        </>);
        return isMobile ? (
          <MobileSidebarSheet currentLabel={CA_SECTIONS.find(s => s.id === activeCASection)?.label ?? "Conseil"} itemCount={CA_SECTIONS.length}>
            {sidebarContent}
          </MobileSidebarSheet>
        ) : (
          <div className="w-[180px] shrink-0 space-y-1">
            {sidebarContent}
          </div>
        );
      })()}

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">

          {/* 1. Tableau de bord */}
          {activeCASection === "tableau" && (<>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Membres</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{ca.membres.length}</div>
                  <div className="text-[9px] text-gray-400">Total CA</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Shield className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Indépendants</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{nbIndependants}</div>
                  <div className="text-[9px] text-gray-400">{ca.membres.length > 0 ? Math.round((nbIndependants / ca.membres.length) * 100) : 0}% du CA</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <UserPlus className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Externes</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{nbExternes}</div>
                  <div className="text-[9px] text-gray-400">Invités plateforme</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Briefcase className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Réunions</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">{ca.frequence || "—"}</div>
                  <div className="text-[9px] text-gray-400">{ca.format}</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-[9px] text-gray-400">Prochaine réunion</div>
                    <div className="text-xs font-bold text-gray-700">{ca.prochaine_reunion || "Non planifiée"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-[9px] text-gray-400">Charte du CA</div>
                    <div className="text-xs font-bold text-gray-700">{ca.charte}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-[9px] text-gray-400">Assurance D&O</div>
                    <div className="text-xs font-bold text-gray-700">{ca.assurance_do}</div>
                  </div>
                </div>
              </div>
            </div>
          </>)}

          {/* 2. Membres du CA */}
          {activeCASection === "membres" && (
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                  <span className="text-xs font-bold text-gray-900">Membres du conseil ({ca.membres.length})</span>
                </div>
                <button onClick={addMembre} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer">
                  <UserPlus className="h-3.5 w-3.5" /> Ajouter un membre
                </button>
              </div>
              <div className="p-4">
                {ca.membres.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                    <Users className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-3">Aucun membre au conseil d'administration</p>
                    <button onClick={addMembre} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all mx-auto">
                      <UserPlus className="h-3.5 w-3.5" /> Ajouter le premier membre
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ca.membres.map((m, idx) => (
                      <div key={idx} className={cn("rounded-lg border px-3 py-3 group transition-all", m.type === "externe" ? "border-amber-200 bg-amber-50/30" : "border-gray-200 bg-white")}>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 items-center">
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Nom</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.nom} onChange={e => updateMembre(idx, { nom: e.target.value })} placeholder="Nom complet" />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Rôle au CA</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.titre} onChange={e => updateMembre(idx, { titre: e.target.value })} placeholder="Président, Secrétaire..." />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Expertise</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.expertise} onChange={e => updateMembre(idx, { expertise: e.target.value })} placeholder="Finance, Juridique..." />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Courriel</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.courriel} onChange={e => updateMembre(idx, { courriel: e.target.value })} placeholder="courriel@..." />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] text-gray-400 block mb-0.5">Type</label>
                              <select className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.type} onChange={e => updateMembre(idx, { type: e.target.value as "interne" | "externe" })}>
                                <option value="interne">Interne</option>
                                <option value="externe">Externe</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="text-[9px] text-gray-400 block mb-0.5">Indépendant</label>
                              <select className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.independant ? "oui" : "non"} onChange={e => updateMembre(idx, { independant: e.target.value === "oui" })}>
                                <option value="oui">Oui</option>
                                <option value="non">Non</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] text-gray-400 block mb-0.5">Membre depuis</label>
                              <input type="date" className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.depuis} onChange={e => updateMembre(idx, { depuis: e.target.value })} />
                            </div>
                            <button onClick={() => removeMembre(idx)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer shrink-0 pb-1">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {ca.membres.some(m => m.type === "externe") && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200/50">
                    <Info className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[9px] text-amber-700 leading-relaxed">
                      Les membres externes recevront une invitation par courriel pour accéder à la plateforme Brain Team en tant qu'administrateur invité. Ils pourront consulter les résultats, participer aux Conférences AI du CA et recevoir les minutes automatiquement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Réunions & PV */}
          {activeCASection === "reunions" && (<>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Historique des réunions</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Plus className="h-3.5 w-3.5" /> Planifier une réunion
              </button>
            </div>
            <div className="space-y-2">
              {CA_MOCK_REUNIONS.map((r, i) => (
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
                      r.statut_pv === "Approuvé" ? "bg-emerald-50 text-emerald-700" :
                      r.statut_pv === "À venir" ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-700"
                    )}>{r.statut_pv}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <p className="text-[9px] text-blue-700">Brain Team peut générer automatiquement les procès-verbaux de vos réunions à partir des transcriptions de Conférence AI.</p>
            </div>
          </>)}

          {/* 4. Conférences AI */}
          {activeCASection === "conferences" && (<>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Conférences AI du board</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Headphones className="h-3.5 w-3.5" /> Lancer une Conférence AI
              </button>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-r from-violet-50 to-blue-50/30">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-violet-700 mb-1">Conférence AI pour le CA</p>
                  <p className="text-[9px] text-violet-600 leading-relaxed">Brain Team peut animer des sessions de conseil d'administration avec vos bots spécialisés (CEO, CFO, CSO...). Chaque bot apporte son expertise unique pour enrichir les discussions stratégiques.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {CA_MOCK_CONFERENCES.map((c, i) => (
                <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[80px]">
                        <div className="text-xs font-bold text-gray-700">{c.date}</div>
                        <div className="text-[9px] text-gray-400">{c.duree}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-700">{c.sujet}</div>
                        <div className="text-[9px] text-gray-400">{c.participants} participants · Bots: {c.bots.join(", ")}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 shrink-0">Terminée</span>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* 5. Documents & Charte */}
          {activeCASection === "documents" && (<>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Documents de gouvernance</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Sparkles className="h-3.5 w-3.5" /> Générer un document avec AI
              </button>
            </div>
            <div className="space-y-2">
              {CA_MOCK_DOCUMENTS.map((d, i) => (
                <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-700">{d.titre}</div>
                      <div className="text-[9px] text-gray-400">{d.type} · Dernière MAJ: {d.maj}</div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      d.statut === "Actif" ? "bg-emerald-50 text-emerald-700" :
                      d.statut === "En révision" ? "bg-amber-50 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    )}>{d.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* 6. Blueprints personnels */}
          {activeCASection === "blueprints" && (<>
            <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50/30">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-1">Blueprints personnels du CA</p>
                  <p className="text-[9px] text-blue-600 leading-relaxed">Chaque administrateur complète son blueprint personnel pour aligner ses intentions et compétences avec la croissance de l'organisation. Ce processus est guidé par Brain Team.</p>
                </div>
              </div>
            </div>
            {ca.membres.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                <Target className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Ajoutez des membres au CA pour voir leurs blueprints personnels</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {ca.membres.map((m, i) => {
                  const completion = CA_BLUEPRINT_COMPLETIONS[i % CA_BLUEPRINT_COMPLETIONS.length];
                  return (
                    <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs font-bold text-gray-700">{m.nom || "Sans nom"}</div>
                          <div className="text-[9px] text-gray-400">{m.titre || "Membre du CA"}</div>
                        </div>
                        <span className={cn("text-xs font-bold", completion >= 75 ? "text-emerald-600" : completion >= 50 ? "text-amber-600" : "text-red-500")}>{completion}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", completion >= 75 ? "bg-emerald-500" : completion >= 50 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${completion}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>)}

          {/* 7. Gouvernance */}
          {activeCASection === "gouvernance" && (
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Settings className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                <span className="text-xs font-bold text-gray-900">Configuration du CA</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Président(e) du CA</label>
                    <input className={inputBase} value={ca.president} onChange={e => update({ president: e.target.value })} placeholder="Nom du président(e)" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Fréquence des réunions</label>
                    <select className={inputBase} value={ca.frequence} onChange={e => update({ frequence: e.target.value })}>
                      <option value="Mensuelle">Mensuelle</option>
                      <option value="Bimestrielle">Bimestrielle</option>
                      <option value="Trimestrielle">Trimestrielle</option>
                      <option value="Semestrielle">Semestrielle</option>
                      <option value="Annuelle">Annuelle</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Format</label>
                    <select className={inputBase} value={ca.format} onChange={e => update({ format: e.target.value })}>
                      <option value="Conférence AI">Conférence AI</option>
                      <option value="Présentiel">Présentiel</option>
                      <option value="Hybride">Hybride</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Prochaine réunion</label>
                    <input type="date" className={inputBase} value={ca.prochaine_reunion} onChange={e => update({ prochaine_reunion: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Charte du CA</label>
                    <select className={inputBase} value={ca.charte} onChange={e => update({ charte: e.target.value })}>
                      <option value="Oui">Oui</option>
                      <option value="En rédaction">En rédaction</option>
                      <option value="Non">Non</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Assurance D&O</label>
                    <select className={inputBase} value={ca.assurance_do} onChange={e => update({ assurance_do: e.target.value })}>
                      <option value="Oui">Oui</option>
                      <option value="En évaluation">En évaluation</option>
                      <option value="Non">Non</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. Surveillance financière */}
          {activeCASection === "surveillance" && (<>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Revenu YTD</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">2.4M$</div>
                  <div className="text-[9px] text-gray-400">+12% vs objectif</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <TrendingUp className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">EBITDA</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">18.5%</div>
                  <div className="text-[9px] text-gray-400">Marge opérationnelle</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Cash Flow</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">+340K$</div>
                  <div className="text-[9px] text-gray-400">Flux de trésorerie</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Shield className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Ratio dette</span>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-900">1.8x</div>
                  <div className="text-[9px] text-gray-400">Dette/EBITDA</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-r from-emerald-50 to-blue-50/20">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-700 mb-1">Surveillance financière automatisée</p>
                  <p className="text-[9px] text-emerald-600 leading-relaxed">Ce tableau de bord est alimenté automatiquement par les données de votre département Finance. Les administrateurs du CA peuvent suivre la santé financière en temps réel.</p>
                </div>
              </div>
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

      </div>
      </div>
    </div>
  );
}
