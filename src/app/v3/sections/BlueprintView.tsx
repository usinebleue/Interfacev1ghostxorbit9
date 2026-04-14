/**
 * BlueprintView.tsx — Plan de match département (pattern SectionView DocForge)
 *
 * Extrait de BlueprintDepartement.tsx L9949-10639
 * Utilisé par: WorkspacePhasesPanel (section "blueprint")
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertTriangle, Award, Bell, Bot, Brain, ChevronDown, ChevronRight,
  FileText, FolderOpen, GitBranch, Heart, Layers, Loader2, PenLine,
  Sparkles, TrendingDown, TrendingUp, User, Users, Zap,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { useCanvasActions } from "../../v2/context/CanvasActionContext";
import { api } from "../../v2/api/client";
import {
  resolveIcon,
  PertinenceBadge,
  SubSectionContent,
  CrossReferencePanel,
  ConseilAdminManager,
  ComitesManager,
  BlueprintPersonnel,
  BlueprintBot,
  VueConsolidee,
} from "../../v2/zones/center/blueprint/BlueprintDepartement";
import { LivingHero } from "./shared/LivingHero";
import { DEPT_DASH_ICON, OTHER_BOTS } from "./shared/dept-data";
import { SF } from "../core/styles";
import {
  getBlueprintConfig,
  getSizeTier,
  getVisibleSubSections,
  getFieldsForTier,
  calculateCompletionScore,
  getCrossReferences,
  type SizeTier,
  type Phase,
  type SubSectionDef,
  type FieldDef,
  type KPIDef,
  type DeptBlueprintConfig,
  type Pertinence,
  type CrossRef,
  SIZE_TIERS,
  PHASES,
} from "../../v2/zones/center/blueprint/blueprint-config";

// COMPOSANT PRINCIPAL — Layout DocForge (Sidebar TOC + Contenu)
// ══════════════════════════════════════════

interface BlueprintViewProps {
  botCode: string;
  headerGradient: string;
  sizeTier?: SizeTier;
  /** Quand true, le header gradient interne est caché (intégré dans la top barre parent) */
  hideHeader?: boolean;
  /** State lifté: vue active (blueprint/ca/comites/personnel/bot) contrôlée par le parent */
  activeHeaderView?: HeaderView;
  /** Callback quand l'utilisateur change de sous-tab */
  onHeaderViewChange?: (view: HeaderView) => void;
  /** Callback pour remonter tier + score au parent */
  onStats?: (stats: { tier: string; tierLabel: string; score: number }) => void;
  /** Quand true, applique le style V2 (pattern Cockpit/Playbook Store) */
  useV2Style?: boolean;
  /** Quand true, rend SEULEMENT le contenu (grille sections + drill-down), sans sidebar/hero/KPIs */
  contentOnly?: boolean;
  /** Section active forcée depuis le parent (utilisé avec contentOnly pour synchroniser sidebar parent) */
  activeSectionId?: string;
}

export type HeaderView = "blueprint" | "ca" | "comites" | "personnel" | "bot";

export const BLUEPRINT_HEADER_TABS: { key: HeaderView; label: string; icon: React.ElementType; ceoOnly?: boolean }[] = [
  { key: "blueprint", label: "Direction", icon: Zap },
  { key: "ca", label: "CA", icon: Users, ceoOnly: true },
  { key: "comites", label: "Comités", icon: GitBranch },
  { key: "personnel", label: "Personnel", icon: User },
  { key: "bot", label: "Brain Team", icon: Bot },
];

export function BlueprintView({ botCode, headerGradient, sizeTier: propTier, hideHeader, activeHeaderView, onHeaderViewChange, onStats, useV2Style, contentOnly, activeSectionId }: BlueprintViewProps) {
  const config = getBlueprintConfig(botCode);
  const { dispatch } = useCanvasActions();
  const [tier, setTier] = useState<SizeTier>(propTier || "T2");
  const [phase, setPhase] = useState<Phase>("startup");
  const [headerViewLocal, setHeaderViewLocal] = useState<HeaderView>("blueprint");
  const headerView = activeHeaderView ?? headerViewLocal;
  const setHeaderView = onHeaderViewChange ?? setHeaderViewLocal;
  const [activeSub, setActiveSub] = useState<string>("");
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sectionGridView, setSectionGridView] = useState(true);
  // Département sélectionné dans la section "Départements" (sidebar) — null = pas de drill-down dept
  const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null);
  // Sous-section active du département sélectionné (indépendant de activeSub qui est pour Direction)
  const [selectedDeptSub, setSelectedDeptSub] = useState<string | undefined>(undefined);
  // Départements expandés dans la sidebar (accordion, même pattern que Data Room)
  const [expandedBpDepts, setExpandedBpDepts] = useState<Set<string>>(new Set());

  // Synchroniser activeSub avec activeSectionId (prop parent → contentOnly mode)
  useEffect(() => {
    if (activeSectionId) {
      setActiveSub(activeSectionId);
      setSectionGridView(false);
    }
  }, [activeSectionId]);

  useEffect(() => {
    if (!config) return;
    if (!propTier) {
      api.getEntrepriseProfil().then(res => {
        if (res.profil?.nb_employes) setTier(getSizeTier(res.profil.nb_employes));
      }).catch(() => {});
    }
    api.getOrCreateCanvas(`blueprint_${botCode}`).then(res => {
      if (res.data && typeof res.data === "object") {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.data)) flat[k] = typeof v === "string" ? v : JSON.stringify(v);
        setData(flat);
      }
    }).catch(() => {}).finally(() => setLoading(false));
    const visible = getVisibleSubSections(config, propTier || "T2");
    if (visible.length > 0 && !activeSub) setActiveSub(visible[0].id);
  }, [botCode, config, propTier]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!config) return;
    const visible = getVisibleSubSections(config, tier);
    if (visible.length > 0 && !visible.find(s => s.id === activeSub)) setActiveSub(visible[0].id);
  }, [tier, config, activeSub]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setData(prev => ({ ...prev, [fieldId]: value }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const canvas = await api.getOrCreateCanvas(`blueprint_${botCode}`);
      await api.updateCanvas(canvas.id, data as Record<string, unknown>);
      setDirty(false);
    } catch { /* retry later */ } finally { setSaving(false); }
  };

  const openInAtelier = (section: SubSectionDef) => {
    dispatch({
      layer: "focus",
      type: "focus",
      bot: botCode,
      data: {
        title: section.label,
        element_type: "blueprint_section",
        data: {
          canvasKey: `blueprint_${botCode}`,
          botCode,
          sectionId: section.id,
          sectionLabel: section.label,
          sectionDescription: section.description,
          sectionIntro: section.intro,
        },
      },
    });
  };

  if (!config) return <p className="text-xs text-gray-400 text-center py-8">Configuration Blueprint non disponible pour {botCode}</p>;

  // Filtrer CA et comités hors de la sidebar (CEOB seulement — ils ont leurs propres boutons header)
  const allVisibleSections = getVisibleSubSections(config, tier);
  const HEADER_SECTION_IDS = botCode === "CEOB" ? ["conseil_administration"] : [];
  const visibleSections = allVisibleSections.filter(s => !HEADER_SECTION_IDS.includes(s.id) && !s.id.startsWith("playbooks_"));
  const caSection = allVisibleSections.find(s => s.id === "conseil_administration");
  const activeSection = visibleSections.find(s => s.id === activeSub) || visibleSections[0];
  const completionScore = calculateCompletionScore(config, tier, data as Record<string, unknown>);

  useEffect(() => {
    if (onStats) {
      const tierInfo = SIZE_TIERS.find(t => t.id === tier);
      onStats({ tier, tierLabel: tierInfo?.label || tier, score: completionScore });
    }
  }, [tier, completionScore, onStats]);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  // Calcul progression par section pour la sidebar
  const sectionProgress = (section: SubSectionDef) => {
    const sectionFields = getFieldsForTier(section.fields, tier);
    const filled = sectionFields.filter(f => {
      const v = data[`${section.id}.${f.id}`];
      return v !== undefined && v !== "" && v !== "[]";
    }).length;
    const total = sectionFields.length;
    return total > 0 ? Math.round((filled / total) * 100) : (section.kpis.length > 0 ? 0 : 100);
  };

  // ═══ MODE CONTENT ONLY — Rend SEULEMENT le contenu (grille sections + drill-down), pas de sidebar/hero/KPIs ═══
  if (contentOnly) {
    const coActiveSection = visibleSections.find(s => s.id === activeSub) || visibleSections[0];
    const coSectionGridView = !activeSectionId; // Grille si pas de section forcée

    return (
      <div className="space-y-3">
        {coSectionGridView ? (
          /* Grille de sections avec % complétion — même pattern que le mode normal */
          <div className="grid grid-cols-2 gap-3">
            {visibleSections.filter(s => s.id !== "vue_consolidee").map(section => {
              const SIcon = resolveIcon(section.icon);
              const pct = sectionProgress(section);
              const fields = getFieldsForTier(section.fields, tier);
              const filled = fields.filter(f => { const v = data[`${section.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
              return (
                <div key={section.id} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl cursor-pointer hover:bg-[#00B4D8]/20 transition-colors"
                    onClick={() => { setActiveSub(section.id); }}
                  >
                    <SIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{section.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{pct}%</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{section.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-gray-400">{filled}/{fields.length}</span>
                    </div>
                    <PertinenceBadge p={section.pertinence[tier]} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : coActiveSection && (
          /* Drill-down section — même pattern que le mode normal */
          <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              {(() => { const Icon = resolveIcon(coActiveSection.icon); return <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />; })()}
              <span className="text-sm font-bold text-gray-900 flex-1 truncate">{coActiveSection.label}</span>
              <button onClick={(e) => { e.stopPropagation(); openInAtelier(coActiveSection); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer bg-[#00B4D8]/15 text-[#00B4D8] hover:bg-[#00B4D8]/25"
                title="Ouvrir dans l'Atelier">
                <PenLine className="h-3.5 w-3.5" /> Atelier
              </button>
              <PertinenceBadge p={coActiveSection.pertinence[tier]} />
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 font-medium leading-relaxed">{coActiveSection.description}</p>
              {coActiveSection.intro && (
                <div className="mt-2 flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2 border border-blue-100/50">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-gray-500 leading-relaxed">{coActiveSection.intro}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <SubSectionContent section={coActiveSection} tier={tier} data={data} onFieldChange={handleFieldChange} onSave={handleSave} saving={saving} dirty={dirty} />
              <CrossReferencePanel botCode={botCode} sectionId={coActiveSection.id} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* HEADER — caché quand hideHeader (intégré dans top barre parent) */}
      {!hideHeader && (
        <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3 transition-all duration-300", headerGradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Blueprint — {
                  headerView === "blueprint" ? config.deptLabel :
                  headerView === "ca" ? "Conseil d'administration" :
                  headerView === "comites" ? "Comités" :
                  headerView === "personnel" ? "Personnel" :
                  headerView === "bot" ? "Brain Team" :
                  config.deptLabel
                }</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-white/60">{SIZE_TIERS.find(t => t.id === tier)?.label} · {PHASES.find(p => p.id === phase)?.emoji} {PHASES.find(p => p.id === phase)?.label}</span>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{completionScore}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {BLUEPRINT_HEADER_TABS.filter(t => !t.ceoOnly || botCode === "CEOB").map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setHeaderView(tab.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer",
                    headerView === tab.key
                      ? "bg-white/25 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.key === "blueprint" ? config.deptLabel : tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VUE CA — Conseil d'administration */}
      {headerView === "ca" && (
        <ConseilAdminManager
          headerGradient={headerGradient}
          data={data}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          saving={saving}
          dirty={dirty}
        />
      )}

      {/* VUE COMITÉS — Gestion des comités par département */}
      {headerView === "comites" && (
        <ComitesManager
          botCode={botCode}
          deptLabel={config.deptLabel}
          headerGradient={headerGradient}
          data={data}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          saving={saving}
          dirty={dirty}
        />
      )}

      {/* VUE PERSONNEL — Blueprint Personnel du dirigeant */}
      {headerView === "personnel" && (
        <BlueprintPersonnel botCode={botCode} headerGradient={headerGradient} data={data} onFieldChange={handleFieldChange} onSave={handleSave} saving={saving} dirty={dirty} tier={tier} />
      )}

      {/* VUE BOT — Blueprint de l'Agent IA */}
      {headerView === "bot" && (
        <BlueprintBot botCode={botCode} headerGradient={headerGradient} />
      )}

      {/* LAYOUT DOCFORGE — Sidebar TOC + Contenu (pattern SectionView standard) */}
      {headerView === "blueprint" && (
        <div className="space-y-3">
          {/* Hero — Living Heroes V20 Blueprint */}
          <LivingHero
            blur1="bg-indigo-100/60" blur2="bg-sky-100/50"
            subtitleColor="text-indigo-600" subtitle="Plan de match"
            title="Le plan de votre département, noir sur blanc."
            description="Objectifs, équipe, forces, faiblesses — tout ce qui définit où vous allez et comment."
          >
            <div className="relative w-[340px] h-[160px] flex flex-col items-center justify-center mt-2 px-6">
              {/* ROOT NODE */}
              <div className="org-node anim-org-root bg-gradient-to-br from-indigo-500 to-sky-500 shadow-md w-32 h-10 flex items-center justify-center text-white relative z-10 scale-90">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 relative pt-1">Architecture</span>
              </div>
              {/* VERTICAL LINE DOWN FROM ROOT */}
              <div className="relative w-full h-8 z-0">
                <div className="absolute w-px bg-slate-200 left-1/2 top-0 bottom-0 -ml-[0.5px]" />
                <div className="absolute w-px bg-indigo-400 left-1/2 top-0 -ml-[0.5px] shadow-[0_0_10px_#6366f1] anim-org-line-vert" />
              </div>
              {/* HORIZONTAL BRANCHING LINE */}
              <div className="relative w-[220px] h-px bg-slate-200 z-0">
                <div className="absolute left-1/2 top-0 h-full bg-sky-400 shadow-[0_0_8px_#38bdf8] anim-org-line-hor" style={{transform:'translateX(-50%)'}} />
                <div className="absolute w-px h-6 bg-slate-200 left-0 top-0" /><div className="absolute w-px h-6 bg-slate-200 left-1/2 top-0" /><div className="absolute w-px h-6 bg-slate-200 right-0 top-0" />
              </div>
              {/* CHILD NODES */}
              <div className="flex justify-between w-[260px] mt-6 relative z-10">
                <div className="org-node anim-org-child-1 w-20 h-8 flex flex-col items-center justify-center px-1">
                  <div className="w-8 h-1 bg-slate-200 rounded-full mb-1" /><div className="w-12 h-1 bg-slate-100 rounded-full" />
                </div>
                <div className="org-node anim-org-child-2 w-20 h-8 flex flex-col items-center justify-center px-1">
                  <div className="w-8 h-1 bg-slate-200 rounded-full mb-1" /><div className="w-12 h-1 bg-slate-100 rounded-full" />
                </div>
                <div className="org-node anim-org-child-3 w-20 h-8 flex flex-col items-center justify-center px-1">
                  <div className="w-8 h-1 bg-slate-200 rounded-full mb-1" /><div className="w-12 h-1 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          </LivingHero>

          {/* KPI Cards — Pattern Cockpit VITAA (grid-cols-5, bg-[#00B4D8]/10 rounded-t-xl) */}
          {(() => {
            const totalFields = visibleSections.reduce((acc, s) => acc + getFieldsForTier(s.fields, tier).length, 0);
            const filledFields = visibleSections.reduce((acc, s) => {
              return acc + getFieldsForTier(s.fields, tier).filter(f => { const v = data[`${s.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
            }, 0);
            const completedSections = visibleSections.filter(s => sectionProgress(s) >= 100).length;
            const prioritySections = visibleSections.filter(s => s.fields.length > 0 && sectionProgress(s) < 50).length;
            const kpis = [
              { icon: Award, label: "Score", value: `${completionScore}%`, delta: completionScore >= 50 ? "En bonne voie" : "À compléter", up: completionScore >= 50 },
              { icon: FolderOpen, label: "Sections", value: `${completedSections}/${visibleSections.length}`, delta: `${completedSections} complétées`, up: completedSections > 0 },
              { icon: FileText, label: "Champs", value: `${filledFields}/${totalFields}`, delta: `${totalFields - filledFields} restants`, up: filledFields > totalFields / 2 },
              { icon: Bell, label: "Priorités", value: `${prioritySections}`, delta: prioritySections === 0 ? "Aucune urgence" : "À compléter", up: prioritySections === 0 },
              { icon: Zap, label: "Phase", value: PHASES.find(p => p.id === phase)?.emoji || "🚀", delta: PHASES.find(p => p.id === phase)?.label || "Démarrage", up: true },
            ];
            return (
              <div className="grid grid-cols-5 gap-3">
                {kpis.map(kpi => (
                  <div key={kpi.label} className="rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
                      <div className={cn("text-xs flex items-center gap-1 mt-0.5", kpi.up ? "text-emerald-600" : "text-red-500")}>
                        {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {kpi.delta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* SECTIONS EN VEDETTE — Pattern CockpitSignalCard (grid-cols-3, gradients vibrants) */}
          {(() => {
            const vedettes = visibleSections
              .filter(s => s.id !== "vue_consolidee" && s.fields.length > 0)
              .map(s => ({ ...s, pct: sectionProgress(s) }))
              .filter(s => s.pct < 100)
              .sort((a, b) => a.pct - b.pct)
              .slice(0, 3);
            if (vedettes.length === 0) return null;
            const getVedetteGradient = (pct: number) => {
              if (pct === 0) return "from-red-600 to-red-500";
              if (pct < 50) return "from-amber-600 to-amber-500";
              return "from-sky-600 to-sky-500";
            };
            const getVedetteTag = (pct: number) => {
              if (pct === 0) return { label: "À démarrer", classes: "bg-red-400/30 text-white" };
              if (pct < 50) return { label: `${pct}% complété`, classes: "bg-amber-400/30 text-white" };
              return { label: `${pct}% complété`, classes: "bg-sky-400/30 text-white" };
            };
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Sections prioritaires
                  </h3>
                  <span className="text-[9px] text-gray-400">{vedettes.length} à compléter</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {vedettes.map(s => {
                    const SIcon = resolveIcon(s.icon);
                    const tag = getVedetteTag(s.pct);
                    return (
                      <button key={s.id} onClick={() => { setActiveSub(s.id); setSectionGridView(false); }}
                        className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r text-left cursor-pointer", getVedetteGradient(s.pct))}>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", tag.classes)}>{tag.label}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-tight">{s.label}</h4>
                        <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed line-clamp-2">{s.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="flex gap-3">

          {/* SIDEBAR — Pattern identique au Cockpit (w-[180px], items rounded-lg, icon + label + count) */}
          <div className="w-[180px] shrink-0 space-y-0.5">
            {visibleSections.map(section => {
              const pct = sectionProgress(section);
              const isActive = activeSub === section.id && !selectedDeptCode;
              const isConsolidee = section.id === "vue_consolidee";
              const SectionIcon = resolveIcon(section.icon);

              return (
                <button
                  key={section.id}
                  onClick={() => { setActiveSub(section.id); setSectionGridView(isConsolidee); setSelectedDeptCode(null); setSelectedDeptSub(undefined); }}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                    isConsolidee && sectionGridView && !selectedDeptCode ? "bg-blue-50 border border-blue-200 shadow-sm" : isActive && !sectionGridView ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent",
                    isConsolidee && !sectionGridView && !selectedDeptCode && "bg-gradient-to-r from-slate-50 to-blue-50/50 border-blue-100/50"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <SectionIcon className={cn("h-3.5 w-3.5", isActive && !sectionGridView ? "text-blue-500" : "text-gray-400")} />
                    <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive && !sectionGridView ? "text-blue-700" : "text-gray-700")}>{section.label}</span>
                    <span className="text-[9px] text-gray-400">{pct}%</span>
                  </div>
                </button>
              );
            })}

            {/* ── SECTION DÉPARTEMENTS — Accordion (même pattern que Data Room sidebar) ── */}
            {botCode === "CEOB" && (
              <>
                <div className={SF.separator} />
                <div className={SF.sectionLabel}>
                  Départements
                </div>
                {OTHER_BOTS.map(dept => {
                  const DIcon = DEPT_DASH_ICON[dept.code] || Zap;
                  const isActiveDept = selectedDeptCode === dept.code;
                  const isExpanded = expandedBpDepts.has(dept.code);
                  const deptConfig = getBlueprintConfig(dept.code);
                  const deptSections = deptConfig ? getVisibleSubSections(deptConfig, tier).filter(s => s.id !== "vue_consolidee" && !s.id.startsWith("playbooks_")) : [];
                  return (
                    <div key={dept.code}>
                      <button
                        onClick={() => {
                          setExpandedBpDepts(prev => {
                            const next = new Set(prev);
                            if (next.has(dept.code)) next.delete(dept.code); else next.add(dept.code);
                            return next;
                          });
                          setSelectedDeptCode(dept.code);
                          setSelectedDeptSub(undefined);
                          setSectionGridView(false);
                        }}
                        className={cn(
                          "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                          isActiveDept && !isExpanded ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isExpanded ? "" : "-rotate-90", isActiveDept ? "text-blue-500" : "text-gray-300")} />
                          <DIcon className={cn("h-3.5 w-3.5 shrink-0", isActiveDept ? "text-blue-500" : "text-gray-400")} />
                          <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActiveDept ? "text-blue-700" : "text-gray-700")}>{dept.label}</span>
                          <span className="text-[9px] text-gray-400">{deptSections.length}</span>
                        </div>
                      </button>
                      {isExpanded && deptSections.map(s => {
                        const SIcon = resolveIcon(s.icon);
                        const isSubActive = selectedDeptCode === dept.code && selectedDeptSub === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedDeptCode(dept.code); setSelectedDeptSub(s.id); setSectionGridView(false); }}
                            className={cn(
                              "w-full pl-6 pr-2.5 py-1 rounded-lg text-left transition-all cursor-pointer",
                              isSubActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <SIcon className={cn("h-3.5 w-3.5 shrink-0", isSubActive ? "text-blue-500" : "text-gray-400")} />
                              <span className={cn("text-[10px] font-medium flex-1 leading-tight", isSubActive ? "text-blue-700" : "text-gray-600")}>{s.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* CONTENU — Pattern Store exact: grid-cols-2 CockpitCards OU drill-down CockpitBlocDetail OU Blueprint département */}
          <div className="flex-1 min-w-0 space-y-3">
            {selectedDeptCode ? (
              /* DRILL-DOWN DÉPARTEMENT — Contenu seulement (pas de double sidebar) */
              <BlueprintView
                botCode={selectedDeptCode}
                headerGradient={OTHER_BOTS.find(b => b.code === selectedDeptCode)?.gradient || "from-blue-600 to-blue-500"}
                sizeTier={tier}
                contentOnly
                activeSectionId={selectedDeptSub}
                hideHeader
              />
            ) : sectionGridView ? (
              /* VUE D'ENSEMBLE — VITAA/FAAS + grille sections */
              <div className="space-y-3">
                {/* VITAA + FAAS — boxes côte à côte */}
                <div className="grid grid-cols-2 gap-3">
                  {/* VITAA — 5 piliers d'affaires */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <Heart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900 flex-1">VITAA — Piliers d'affaires</span>
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      {[
                        { letter: "V", label: "Vente", score: 38, color: "bg-blue-500" },
                        { letter: "I", label: "Idée", score: 42, color: "bg-purple-500" },
                        { letter: "T", label: "Temps", score: 61, color: "bg-emerald-500" },
                        { letter: "A", label: "Argent", score: 55, color: "bg-amber-500" },
                        { letter: "A", label: "Actif", score: 29, color: "bg-red-500" },
                      ].map((p) => (
                        <div key={p.letter + p.label}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                            <span className="text-[9px] font-medium text-gray-800 flex-1">{p.label}</span>
                            <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                            <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                              p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                              p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                              "text-green-600 bg-green-50 border-green-200"
                            )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                          </div>
                          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                            <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="pt-1.5 border-t border-gray-100 mt-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Score VITAA</span>
                          <span className="text-sm font-bold text-gray-800">45/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* FAAS — 4 piliers relationnels */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900 flex-1">FAAS — Capital social</span>
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      {[
                        { letter: "F", label: "Fraternité", score: 52, color: "bg-rose-500", desc: "Cohésion équipe, rétention, culture" },
                        { letter: "A", label: "Alliance", score: 35, color: "bg-pink-500", desc: "Partenaires B2B, co-création, REAI" },
                        { letter: "A", label: "Associés", score: 28, color: "bg-fuchsia-500", desc: "CA, mentors, conseillers, pairs" },
                        { letter: "S", label: "Social", score: 44, color: "bg-violet-500", desc: "Réputation, thought leadership" },
                      ].map((p) => (
                        <div key={p.letter + p.label}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-medium text-gray-800">{p.label}</span>
                              <p className="text-[9px] text-gray-400 leading-tight truncate">{p.desc}</p>
                            </div>
                            <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                            <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                              p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                              p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                              "text-green-600 bg-green-50 border-green-200"
                            )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                          </div>
                          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                            <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="pt-1.5 border-t border-gray-100 mt-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Score FAAS</span>
                          <span className="text-sm font-bold text-gray-800">40/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Sections du Blueprint — grille avec % complétion */}
                <div className="grid grid-cols-2 gap-3">
                {visibleSections.filter(s => s.id !== "vue_consolidee").map(section => {
                  const SIcon = resolveIcon(section.icon);
                  const pct = sectionProgress(section);
                  const fields = getFieldsForTier(section.fields, tier);
                  const filled = fields.filter(f => { const v = data[`${section.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
                  return (
                    <div key={section.id} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
                      <div
                        className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl cursor-pointer hover:bg-[#00B4D8]/20 transition-colors"
                        onClick={() => { setActiveSub(section.id); setSectionGridView(false); }}
                      >
                        <SIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{section.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{pct}%</span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{section.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] text-gray-400">{filled}/{fields.length}</span>
                        </div>
                        <PertinenceBadge p={section.pertinence[tier]} />
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            ) : activeSection && activeSection.id === "vue_consolidee" && botCode === "CEOB" ? (
              /* VUE CONSOLIDÉE (CEOB seulement) */
              <div className="space-y-3">
                <VueConsolidee tier={tier} />
              </div>
            ) : activeSection && (
              /* DRILL-DOWN — Pattern CockpitBlocDetail exact */
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                    {(() => { const Icon = resolveIcon(activeSection.icon); return <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />; })()}
                    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{activeSection.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); openInAtelier(activeSection); }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer bg-[#00B4D8]/15 text-[#00B4D8] hover:bg-[#00B4D8]/25"
                      title="Ouvrir dans l'Atelier">
                      <PenLine className="h-3.5 w-3.5" /> Atelier
                    </button>
                    <PertinenceBadge p={activeSection.pertinence[tier]} />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{activeSection.description}</p>
                    {activeSection.intro && (
                      <div className="mt-2 flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2 border border-blue-100/50">
                        <Sparkles className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-gray-500 leading-relaxed">{activeSection.intro}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <SubSectionContent section={activeSection} tier={tier} data={data} onFieldChange={handleFieldChange} onSave={handleSave} saving={saving} dirty={dirty} />
                    <CrossReferencePanel botCode={botCode} sectionId={activeSection.id} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
