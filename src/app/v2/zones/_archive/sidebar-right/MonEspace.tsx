/**
 * MonEspace.tsx — "Mon Espace" — raccourcis productivite
 * 5 items collapsibles : Idees (cristaux), Projets, Documents, Taches, Outils Factory
 * Sprint B — B.1 cristallisation live
 */

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  FolderKanban,
  FileText,
  CheckSquare,
  Wrench,
  Briefcase,
  Trash2,
  Maximize2,
} from "lucide-react";
import { api } from "../../api/client";
import type { BureauItem, PlaneTache } from "../../api/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EspaceSection } from "../../context/FrameMasterContext";

interface EspaceSectionMeta {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  emptyMessage: string;
}

const SECTIONS_META: EspaceSectionMeta[] = [
  { id: "idees", label: "Mes Idees", icon: Sparkles, color: "text-amber-500", emptyMessage: "Cristallise une reponse de CarlOS pour la sauvegarder ici." },
  { id: "projets", label: "Mes Projets", icon: FolderKanban, color: "text-blue-500", emptyMessage: "Les cahiers SMART et projets en cours." },
  { id: "documents", label: "Mes Documents", icon: FileText, color: "text-green-500", emptyMessage: "PDF, exports et documents generes." },
  { id: "taches", label: "Mes Taches", icon: CheckSquare, color: "text-purple-500", emptyMessage: "Actions a valider et taches en attente." },
  { id: "outils", label: "Outils Factory", icon: Wrench, color: "text-orange-500", emptyMessage: "Calculateurs, estimateurs et skills du Factory Bot." },
];

export function MonEspace() {
  const { crystals, deleteCrystal } = useChatContext();
  const { navigateEspace } = useFrameMaster();
  const [sectionOpen, setSectionOpen] = useState(true);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Donnees reelles depuis API
  const [projets, setProjets] = useState<BureauItem[]>([]);
  const [documents, setDocuments] = useState<BureauItem[]>([]);
  const [taches, setTaches] = useState<PlaneTache[]>([]);

  useEffect(() => {
    api.listBureauItems("projet").then((r) => setProjets(r.items)).catch(() => {});
    api.listBureauItems("document").then((r) => setDocuments(r.items)).catch(() => {});
    api.listTaches().then((r) => setTaches(r.taches)).catch(() => {});
  }, []);

  // Outils statiques (pas encore en DB)
  const mockOutils = [
    { id: "o1", titre: "Calculateur ROI", description: "Estimer le retour sur investissement" },
    { id: "o2", titre: "Estimateur TRS/OEE", description: "Taux de rendement synthetique" },
    { id: "o3", titre: "Generateur de pitch", description: "Creer un pitch deck en 5 min" },
  ];

  // Count items per section — crystals go into "idees"
  const sectionCounts: Record<string, number> = {
    idees: crystals.length,
    projets: projets.length,
    documents: documents.length,
    taches: taches.length,
    outils: mockOutils.length,
  };
  const totalItems = Object.values(sectionCounts).reduce((a, b) => a + b, 0);

  return (
    <Collapsible open={sectionOpen} onOpenChange={setSectionOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-semibold text-gray-700 hover:text-gray-900">
        {sectionOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Briefcase className="h-3.5 w-3.5 text-orange-500" />
        Mon Espace
        {totalItems > 0 && (
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 bg-orange-100 text-orange-700">
            {totalItems}
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-1">
          {SECTIONS_META.map((section) => {
            const count = sectionCounts[section.id] || 0;
            return (
              <Collapsible
                key={section.id}
                open={openItems[section.id] || false}
                onOpenChange={() => toggleItem(section.id)}
              >
                <div className="flex items-center w-full">
                  <CollapsibleTrigger
                    className={cn(
                      "flex items-center gap-2 flex-1 px-2 py-1.5 rounded text-xs transition-colors",
                      "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <section.icon className={cn("h-3.5 w-3.5 shrink-0", section.color)} />
                    <span className="flex-1 text-left font-medium">{section.label}</span>
                    {count > 0 ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                        {count}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-gray-300">0</span>
                    )}
                    {openItems[section.id] ? (
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    )}
                  </CollapsibleTrigger>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateEspace(section.id as EspaceSection); }}
                    className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer shrink-0"
                    title={`Ouvrir ${section.label} dans le canevas`}
                  >
                    <Maximize2 className="h-3 w-3" />
                  </button>
                </div>

                <CollapsibleContent>
                  <div className="pl-7 pr-2 py-1 space-y-1">
                    {/* Mes Idees — affiche les cristaux */}
                    {section.id === "idees" ? (
                      crystals.length === 0 ? (
                        <p className="text-[10px] text-gray-400 py-1">{section.emptyMessage}</p>
                      ) : (
                        crystals.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => navigateEspace("idees")}
                            className="group text-xs text-gray-600 py-1.5 border-l-2 border-amber-200 pl-2 hover:border-amber-500 hover:text-gray-900 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 truncate">{c.titre}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  {c.bot} — {c.mode} — {new Date(c.date).toLocaleDateString("fr-CA")}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                  {c.contenu.slice(0, 120)}
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteCrystal(c.id); }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )
                    ) : section.id === "projets" ? (
                      projets.length === 0 ? (
                        <p className="text-[9px] text-gray-400 py-1">{section.emptyMessage}</p>
                      ) : (
                        projets.slice(0, 5).map((p) => (
                          <div key={p.id} onClick={() => navigateEspace("projets")} className="text-xs py-1.5 border-l-2 border-blue-200 pl-2 hover:border-blue-500 hover:text-gray-900 transition-colors cursor-pointer">
                            <div className="font-medium text-gray-800 truncate">{p.titre}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span className={cn(
                                "px-1 py-0.5 rounded text-[9px] font-medium",
                                p.status === "actif" ? "bg-blue-100 text-blue-700" :
                                p.status === "planification" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-500"
                              )}>{p.status}</span>
                              {p.bot && <span>{p.bot}</span>}
                            </div>
                          </div>
                        ))
                      )
                    ) : section.id === "documents" ? (
                      documents.length === 0 ? (
                        <p className="text-[9px] text-gray-400 py-1">{section.emptyMessage}</p>
                      ) : (
                        documents.slice(0, 5).map((d) => (
                          <div key={d.id} onClick={() => navigateEspace("documents")} className="text-xs py-1.5 border-l-2 border-green-200 pl-2 hover:border-green-500 hover:text-gray-900 transition-colors cursor-pointer">
                            <div className="font-medium text-gray-800 truncate">{d.titre}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5">
                              {new Date(d.created_at).toLocaleDateString("fr-CA")}
                            </div>
                          </div>
                        ))
                      )
                    ) : section.id === "taches" ? (
                      taches.length === 0 ? (
                        <p className="text-[9px] text-gray-400 py-1">{section.emptyMessage}</p>
                      ) : (
                        taches.slice(0, 5).map((t) => (
                          <div key={t.id} onClick={() => navigateEspace("taches")} className="text-xs py-1.5 border-l-2 border-purple-200 pl-2 hover:border-purple-500 hover:text-gray-900 transition-colors cursor-pointer">
                            <div className="font-medium text-gray-800 truncate">{t.name}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span className={cn(
                                "px-1 py-0.5 rounded text-[9px] font-medium",
                                t.priority === "urgent" ? "bg-red-100 text-red-700" :
                                t.priority === "high" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-500"
                              )}>{t.priority}</span>
                            </div>
                          </div>
                        ))
                      )
                    ) : section.id === "outils" ? (
                      mockOutils.map((o) => (
                        <div key={o.id} onClick={() => navigateEspace("outils")} className="text-xs py-1.5 border-l-2 border-orange-200 pl-2 hover:border-orange-500 hover:text-gray-900 transition-colors cursor-pointer">
                          <div className="font-medium text-gray-800 truncate">{o.titre}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{o.description}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-gray-400 py-1">{section.emptyMessage}</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
