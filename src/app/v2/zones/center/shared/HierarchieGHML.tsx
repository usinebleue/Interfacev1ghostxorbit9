/**
 * HierarchieGHML.tsx — Composant partage pour la hierarchie Chantier > Projet > Mission > Tache
 * Source: API PostgreSQL via hooks existants
 * Utilise par: StrategiqueView, DepartmentTourDeControle, MonReseauView
 * Design: memes patterns que StrategiqueView (gradient headers, StatusBadge, BotBadge)
 *
 * Phase 1 — Plan Harmonisation Strategique
 */

import { useState, useMemo } from "react";
import {
  ChevronRight, Loader2, Inbox,
  Rocket, FolderOpen, CheckCircle2,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { useChantiers, useProjets, useMissions, useTachesUser } from "../../../api/hooks";
import type {
  Chantier as APIChantier,
  Projet as APIProjet,
  Mission as APIMission,
} from "../../../api/types";
import { StatusBadge, BotBadge, ChaleurBadge, TemplateSection, type PlaybookDeployOptions } from "./SectionComponents";
import { BOT_INFO } from "./section-config";

// ================================================================
// TYPES
// ================================================================

type Level = "chantiers" | "projets" | "missions" | "taches";

interface HierarchieGHMLProps {
  /** Filtre par bot (departement) */
  botCode?: string;
  /** Filtre par type de chantier (reseau, interne, etc.) */
  typeChantier?: string;
  /** Mode compact (moins de details par card) */
  compact?: boolean;
  /** Afficher la grille de stats en haut */
  showStats?: boolean;
  /** Afficher les templates playbook en bas */
  showTemplates?: boolean;
  /** Callback pour deployer un playbook (composable — avec parent_ids) */
  onDeploy?: (playbookId: string, options?: PlaybookDeployOptions) => Promise<void>;
  /** Callback quand l'utilisateur navigue */
  onSelect?: (level: Level, id: number) => void;
  /** Niveau de depart (defaut: chantiers) */
  defaultLevel?: Level;
}

// ================================================================
// STATUS MAPPER — API statuts → section-config STATUS_CONFIG keys
// ================================================================

function mapStatus(s: string): "done" | "en-cours" | "a-faire" | "bloque" {
  switch (s) {
    case "completee": case "completed": case "done": return "done";
    case "en_cours": case "en-cours": case "active": return "en-cours";
    case "en_attente": case "a-faire": case "a_faire": return "a-faire";
    case "bloque": case "archivee": return "bloque";
    default: return "a-faire";
  }
}

// ================================================================
// STAT GRID — 2 a 4 colonnes
// ================================================================

function StatGrid({ items }: { items: { value: number; label: string; color: string }[] }) {
  return (
    <div className={cn("grid gap-2",
      items.length === 2 ? "grid-cols-2" :
      items.length === 3 ? "grid-cols-3" :
      "grid-cols-4"
    )}>
      {items.map((s) => (
        <div key={s.label} className={cn("text-center p-2.5 rounded-lg border",
          `bg-${s.color}-50 border-${s.color}-100`
        )}>
          <div className={cn("text-lg font-bold", `text-${s.color}-600`)}>{s.value}</div>
          <div className={cn("text-[9px] font-medium", `text-${s.color}-600`)}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// LOADING & EMPTY STATES
// ================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Chargement...</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
      <Inbox className="h-8 w-8" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function HierarchieGHML({
  botCode,
  typeChantier,
  compact = false,
  showStats = true,
  showTemplates = false,
  onDeploy,
  onSelect,
  defaultLevel = "chantiers",
}: HierarchieGHMLProps) {
  // ===== Navigation state =====
  const [level, setLevel] = useState<Level>(defaultLevel);
  const [selectedChantier, setSelectedChantier] = useState<APIChantier | null>(null);
  const [selectedProjet, setSelectedProjet] = useState<APIProjet | null>(null);
  const [selectedMission, setSelectedMission] = useState<APIMission | null>(null);

  // ===== Data hooks =====
  const { chantiers, loading: loadingC } = useChantiers();
  const { projets, loading: loadingP } = useProjets(selectedChantier?.id);
  const { missions, loading: loadingM } = useMissions(
    selectedChantier?.id,
    selectedProjet?.id,
  );

  const tacheFilters = useMemo(() => {
    if (selectedMission) return { mission_id: selectedMission.id };
    if (selectedProjet) return { projet_id: selectedProjet.id };
    if (selectedChantier) return { chantier_id: selectedChantier.id };
    return undefined;
  }, [selectedMission?.id, selectedProjet?.id, selectedChantier?.id]);

  const { taches, loading: loadingT } = useTachesUser(tacheFilters);

  // ===== Filtered data =====
  const filteredChantiers = useMemo(() => {
    let list = chantiers;
    if (botCode) list = list.filter((c) => c.bot_codes?.includes(botCode));
    if (typeChantier) list = list.filter((c) => c.type_chantier === typeChantier);
    return list;
  }, [chantiers, botCode, typeChantier]);

  const filteredProjets = useMemo(() => {
    if (!botCode) return projets;
    return projets.filter((p) => p.bot_primaire === botCode || p.bot_codes?.includes(botCode));
  }, [projets, botCode]);

  const filteredMissions = useMemo(() => {
    if (!botCode) return missions;
    return missions.filter((m) => m.bot_primaire === botCode);
  }, [missions, botCode]);

  // ===== Navigation helpers =====
  const goToChantiers = () => {
    setLevel("chantiers");
    setSelectedChantier(null);
    setSelectedProjet(null);
    setSelectedMission(null);
  };

  const goToProjets = (chantier: APIChantier) => {
    setLevel("projets");
    setSelectedChantier(chantier);
    setSelectedProjet(null);
    setSelectedMission(null);
    onSelect?.("projets", chantier.id);
  };

  const goToAllProjets = () => {
    setLevel("projets");
    setSelectedChantier(null);
    setSelectedProjet(null);
    setSelectedMission(null);
  };

  const goToMissions = (projet: APIProjet) => {
    setLevel("missions");
    setSelectedProjet(projet);
    setSelectedMission(null);
    onSelect?.("missions", projet.id);
  };

  const goToAllMissions = () => {
    setLevel("missions");
    setSelectedProjet(null);
    setSelectedMission(null);
  };

  const goToTaches = (mission: APIMission) => {
    setLevel("taches");
    setSelectedMission(mission);
    onSelect?.("taches", mission.id);
  };

  // =================================================================
  // RENDER: CHANTIERS
  // =================================================================
  if (level === "chantiers") {
    if (loadingC) return <LoadingState />;
    if (filteredChantiers.length === 0) return <EmptyState message="Aucun chantier" />;

    return (
      <div className="space-y-4">
        {showStats && !compact && (
          <StatGrid items={[
            { value: filteredChantiers.length, label: "CHANTIERS", color: "red" },
            { value: filteredChantiers.reduce((s, c) => s + (c.missions_count || 0), 0), label: "PROJETS", color: "blue" },
          ]} />
        )}

        <div className="space-y-2">
          {filteredChantiers.map((ch) => (
            <button
              key={ch.id}
              onClick={() => goToProjets(ch)}
              className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-white block truncate">{ch.titre}</span>
                  <div className="text-[9px] text-white/70">
                    Progression: {ch.progression || 0}%
                  </div>
                </div>
                {ch.chaleur && (
                  <ChaleurBadge chaleur={ch.chaleur as "brule" | "couve" | "meurt"} />
                )}
                <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
              </div>
              {!compact && (
                <div className="px-4 py-3">
                  {ch.description && (
                    <p className="text-[9px] text-gray-500 line-clamp-2">{ch.description}</p>
                  )}
                  {(ch.bot_codes || []).length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {ch.bot_codes!.slice(0, 6).map((b) => <BotBadge key={b} code={b} />)}
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {showTemplates && <TemplateSection niveau="chantier" label="Chantier" onDeploy={onDeploy} />}
      </div>
    );
  }

  // =================================================================
  // RENDER: PROJETS
  // =================================================================
  if (level === "projets") {
    if (loadingP) return <LoadingState />;

    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[9px]">
          <button
            onClick={goToChantiers}
            className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            &larr; Chantiers
          </button>
          {selectedChantier && (
            <span className="text-gray-400 truncate">{selectedChantier.titre}</span>
          )}
          <span className="text-gray-400 ml-auto">{filteredProjets.length} projets</span>
        </div>

        {showStats && !compact && filteredProjets.length > 0 && (
          <StatGrid items={[
            { value: filteredProjets.filter((p) => mapStatus(p.status) === "done").length, label: "DONE", color: "emerald" },
            { value: filteredProjets.filter((p) => mapStatus(p.status) === "en-cours").length, label: "EN COURS", color: "amber" },
            { value: filteredProjets.filter((p) => mapStatus(p.status) === "a-faire").length, label: "A FAIRE", color: "gray" },
            { value: filteredProjets.filter((p) => mapStatus(p.status) === "bloque").length, label: "BLOQUES", color: "red" },
          ]} />
        )}

        {filteredProjets.length === 0 ? (
          <EmptyState message="Aucun projet dans ce chantier" />
        ) : (
          <div className="space-y-2">
            {filteredProjets.map((p) => (
              <button
                key={p.id}
                onClick={() => goToMissions(p)}
                className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500">
                  <FolderOpen className="h-4 w-4 text-white shrink-0" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{p.titre}</span>
                  <StatusBadge status={mapStatus(p.status)} />
                  <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
                </div>
                {!compact && (
                  <div className="px-4 py-2.5">
                    {p.description && (
                      <p className="text-[9px] text-gray-500 line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <BotBadge code={p.bot_primaire} />
                      <span className="text-[9px] text-gray-400">
                        {p.missions_count || 0} missions · {p.progression || 0}%
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {showTemplates && <TemplateSection niveau="projet" label="Projet" onDeploy={onDeploy} />}
      </div>
    );
  }

  // =================================================================
  // RENDER: MISSIONS
  // =================================================================
  if (level === "missions") {
    if (loadingM) return <LoadingState />;

    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[9px] flex-wrap">
          <button onClick={goToChantiers} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            Chantiers
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <button
            onClick={selectedChantier ? () => goToProjets(selectedChantier) : goToAllProjets}
            className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Projets
          </button>
          {selectedProjet && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              <span className="px-2 py-1 rounded font-bold bg-blue-100 text-blue-700 truncate max-w-[200px]">
                {selectedProjet.titre}
              </span>
            </>
          )}
          <span className="text-gray-400 ml-auto">{filteredMissions.length} missions</span>
        </div>

        {filteredMissions.length === 0 ? (
          <EmptyState message="Aucune mission dans ce projet" />
        ) : (
          <div className="space-y-2">
            {filteredMissions.map((m, idx) => {
              const isMaster = m.bot_primaire === "CEOB";
              const gradient = isMaster
                ? "from-blue-600 to-blue-500"
                : "from-violet-600 to-violet-500";
              return (
                <button
                  key={m.id}
                  onClick={() => goToTaches(m)}
                  className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
                >
                  <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", gradient)}>
                    <span className="text-[9px] font-mono font-bold text-white/70">#{idx + 1}</span>
                    <span className="text-xs font-bold text-white flex-1 truncate">{m.titre}</span>
                    <StatusBadge status={mapStatus(m.status)} />
                    <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
                  </div>
                  {!compact && (
                    <div className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <BotBadge code={m.bot_primaire} />
                        {m.priorite > 0 && (
                          <span className="text-[9px] text-gray-400">Priorite: {m.priorite}</span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {showTemplates && <TemplateSection niveau="mission" label="Mission" onDeploy={onDeploy} />}
      </div>
    );
  }

  // =================================================================
  // RENDER: TACHES
  // =================================================================
  if (level === "taches") {
    if (loadingT) return <LoadingState />;

    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[9px] flex-wrap">
          <button onClick={goToChantiers} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            Chantiers
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <button
            onClick={selectedChantier ? () => goToProjets(selectedChantier) : goToAllProjets}
            className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Projets
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          {selectedProjet ? (
            <button
              onClick={() => goToMissions(selectedProjet)}
              className="px-2 py-1 rounded font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors truncate max-w-[150px]"
            >
              {selectedProjet.titre}
            </button>
          ) : (
            <button
              onClick={goToAllMissions}
              className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Missions
            </button>
          )}
          {selectedMission && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              <span className="px-2 py-1 rounded font-bold bg-violet-100 text-violet-700 truncate max-w-[200px]">
                {selectedMission.titre}
              </span>
            </>
          )}
          <span className="text-gray-400 ml-auto">{taches.length} taches</span>
        </div>

        {taches.length === 0 ? (
          <EmptyState message="Aucune tache" />
        ) : (
          <div className="space-y-2">
            {taches.map((t) => {
              const status = mapStatus(t.status);
              const gradient =
                status === "done" ? "from-emerald-600 to-emerald-500" :
                status === "en-cours" ? "from-amber-600 to-amber-500" :
                "from-gray-500 to-gray-400";
              return (
                <div
                  key={t.id}
                  className="w-full p-0 overflow-hidden rounded-lg border shadow-sm"
                >
                  <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", gradient)}>
                    <CheckCircle2 className={cn("h-4 w-4 text-white", status === "done" ? "opacity-100" : "opacity-50")} />
                    <span className={cn("text-xs font-bold text-white flex-1 truncate", status === "done" && "line-through opacity-80")}>
                      {t.titre}
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  {!compact && (
                    <div className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <BotBadge code={t.bot_primaire} />
                        {t.assignee_nom && (
                          <span className="text-[9px] text-gray-400">{t.assignee_nom}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showTemplates && <TemplateSection niveau="tache" label="Tache" onDeploy={onDeploy} />}
      </div>
    );
  }

  return null;
}
