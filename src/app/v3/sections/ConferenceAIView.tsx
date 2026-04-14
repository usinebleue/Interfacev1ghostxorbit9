/**
 * ConferenceAIView.tsx — Réunions intelligentes (pattern SectionView)
 *
 * Extrait de BlueprintDepartement.tsx L7597-8490
 * Dépend de: PlaybookStoreView (PLAYBOOK_STORE_DATA, PlaybookCardV2)
 * Utilisé par: WorkspacePhasesPanel (section "conferenceai")
 */

import { useState, useEffect } from "react";
import {
  Activity, BarChart3, Bot, Building2, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Crown, ExternalLink, Eye, FileText, FolderOpen, Heart, Info, Layers, LayoutGrid,
  ListChecks, MessageSquare, PenLine, Play, Rocket, RotateCcw, Search, Settings, ShoppingBag,
  Sparkles, Star, Target, Users, Video, Zap,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR, BOT_NAME } from "../../v2/api/types";
import { LivingHero } from "./shared/LivingHero";
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON, DEPT_LABELS, DEPT_ICONS, DEPT_GRADIENT, DEPT_COLORS, BOT_DISPLAY, BOT_AVATAR_MAP } from "./shared/dept-data";
import { SF } from "../core/styles";
// Shared data from PlaybookStoreView
import { PLAYBOOK_STORE_DATA, PlaybookCardV2, CONFERENCE_FAMILIES, getPlaybookFamily, PLAYBOOK_WORKFLOWS, PLAYBOOK_LIVRABLES, PLAYBOOK_LONG_DESC } from "./PlaybookStoreView";

// ══════════════════════════════════════════
// CONFERENCE AI — Section DEDIEE (tab departement)
// Centre d'utilisation — lancer et planifier des conferences (PAS un store)
// Donnees = filtre sur PLAYBOOK_STORE_DATA (pas un silo)
// ══════════════════════════════════════════

const CONF_TOOLS: { key: string; label: string; icon: React.ElementType; description: string }[] = [
  { key: "transcription", label: "Transcription live", icon: MessageSquare, description: "Sous-titres temps reel" },
  { key: "enregistrement", label: "Enregistrement", icon: Video, description: "Timestamps automatiques" },
  { key: "sondages", label: "Sondages", icon: BarChart3, description: "Resultats en direct" },
  { key: "breakout", label: "Sous-groupes", icon: Users, description: "Exercices paralleles" },
  { key: "tableau_blanc", label: "Tableau blanc", icon: PenLine, description: "Canvas collaboratif" },
  { key: "presentateur", label: "Mode presentateur", icon: Eye, description: "Plein ecran" },
  { key: "chronometre", label: "Chronometre", icon: Clock, description: "Timer visible" },
  { key: "queue_parole", label: "Tour de parole", icon: ListChecks, description: "Gere par le bot" },
  { key: "reactions", label: "Reactions", icon: Heart, description: "Emoji temps reel" },
  { key: "annotation", label: "Annotation", icon: FileText, description: "Surligner documents" },
];

const CONF_CAMERA_MODES = [
  { key: "work", label: "Travail", description: "Vignettes en haut, DocForge maximise" },
  { key: "discussion", label: "Discussion", description: "Grille plein ecran, transcription minimale" },
];

const CONF_WORK_PHASES = [
  { key: "discussion", color: "blue", label: "Discussion libre" },
  { key: "reflexion", color: "red", label: "Ideation, brainstorm" },
  { key: "conception", color: "yellow", label: "Structuration, blueprint" },
  { key: "execution", color: "green", label: "Actions COMMAND" },
  { key: "retroaction", color: "emerald", label: "Bilan, VITAA recalcule" },
];

const MOCK_RECENT_SESSIONS = [
  { id: "rs-1", pbId: "pb-CEOB-VENT-001", date: "2026-04-07", duree: "47min", participants: 3, livrables: 2 },
  { id: "rs-2", pbId: "pb-CFOB-REC-001", date: "2026-04-05", duree: "1h12", participants: 5, livrables: 4 },
  { id: "rs-3", pbId: "pb-CMOB-POD-001", date: "2026-04-03", duree: "35min", participants: 2, livrables: 1 },
  { id: "rs-4", pbId: "pb-CEOB-EXP-001", date: "2026-04-01", duree: "12min", participants: 1, livrables: 1 },
  { id: "rs-5", pbId: "pb-CSOB-CREA-001", date: "2026-03-28", duree: "1h05", participants: 4, livrables: 3 },
];

const MOCK_PLANNED_SESSIONS: { id: string; pbId: string; date: string; heure: string; participants: string[] }[] = [];

type ConfAIView = "accueil" | "recentes" | "planifiees" | "famille" | "departement" | "tous";

export function ConferenceAIView({ headerGradient, onNavigateToStore, onLaunch, botCode }: {
  headerGradient: string;
  onNavigateToStore?: () => void;
  onLaunch?: (type: string, title: string) => void;
  botCode?: string;
}) {
  const [activeView, setActiveView] = useState<ConfAIView>("accueil");
  const [selectedPlaybook, setSelectedPlaybook] = useState<typeof PLAYBOOK_STORE_DATA[0] | null>(null);
  const [expandFamilies, setExpandFamilies] = useState(false);
  const [expandDepts, setExpandDepts] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // Synchroniser quand botCode change — revenir à l'accueil (le contenu s'adapte au département)
  useEffect(() => {
    setSelectedPlaybook(null);
    setActiveView("accueil");
    setSelectedFamily(null);
    setSelectedDept(botCode && botCode !== "CEOB" ? botCode : null);
  }, [botCode]);

  // Filtre les playbooks conference depuis le MEME PLAYBOOK_STORE_DATA
  // Poupée russe: non-CEOB = priorise les conférences du département
  const allConfRaw = PLAYBOOK_STORE_DATA.filter(pb => {
    const family = getPlaybookFamily(pb);
    return (family !== "" && CONFERENCE_FAMILIES[family] !== undefined) || pb.id.startsWith("pb-GHO-") || pb.type === "conference" || pb.type === "formation" || pb.type === "cognitif";
  });
  const allConf = botCode && botCode !== "CEOB"
    ? [...allConfRaw.filter(pb => pb.departement === botCode), ...allConfRaw.filter(pb => pb.departement !== botCode)]
    : allConfRaw;

  const familyEntries = Object.entries(CONFERENCE_FAMILIES).map(([key, info]) => {
    const count = allConf.filter(pb => getPlaybookFamily(pb) === key).length;
    return { key, ...info, count };
  }).filter(f => f.count > 0);

  const deptEntries = Object.entries(DEPT_LABELS).filter(([code]) => code !== "ORBIT9").map(([code, label]) => {
    const count = allConf.filter(pb => pb.departement === code).length;
    return { code, label, count };
  }).filter(d => d.count > 0);

  const handleOpenDetail = (pb: typeof PLAYBOOK_STORE_DATA[0]) => setSelectedPlaybook(pb);
  const handleBack = () => setSelectedPlaybook(null);

  const handleNavigate = (view: ConfAIView, extra?: { family?: string; dept?: string }) => {
    setSelectedPlaybook(null);
    if (view === "famille" && extra?.family) { setSelectedFamily(extra.family); setActiveView("famille"); }
    else if (view === "departement" && extra?.dept) { setSelectedDept(extra.dept); setActiveView("departement"); }
    else setActiveView(view);
  };

  const isNonCEOB = botCode && botCode !== "CEOB";
  const deptConfCount = isNonCEOB ? allConfRaw.filter(pb => pb.departement === botCode).length : allConf.length;
  type SidebarItem = { id: ConfAIView | "store"; label: string; icon: React.ElementType; count?: number; separator?: boolean; expandable?: "families" | "depts"; external?: boolean };
  const SIDEBAR_ITEMS: SidebarItem[] = [
    { id: "accueil", label: "Accueil", icon: Sparkles, count: deptConfCount },
    { id: "recentes", label: "Recentes", icon: Clock },
    { id: "planifiees", label: "Planifiees", icon: Calendar },
    { id: "famille", label: "Categories", icon: FolderOpen, separator: true, expandable: "families" },
    // Poupée russe: non-CEOB = pas d'explorateur départements (on est déjà DANS un département)
    ...(isNonCEOB ? [] : [{ id: "departement" as ConfAIView | "store", label: "Departements", icon: Building2, expandable: "depts" as const }]),
    { id: "store", label: "Playbook Store", icon: ShoppingBag, separator: true, external: true },
  ];

  return (
    <div className="space-y-3">
      {/* Hero — Living Heroes V20 Conference AI */}
      <LivingHero
        blur1="bg-fuchsia-100/60" blur2="bg-violet-100/50"
        subtitleColor="text-fuchsia-600" subtitle="Réunions intelligentes"
        title="Ici, l'organique fusionne avec l'artificielle."
        description="Mettez vos experts humains et AI face à face. Ce qui prenait des semaines se règle en une session."
      >
        <div className="relative w-[360px] h-[140px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full opacity-[0.15] text-violet-800" viewBox="0 0 360 140"><path d="M 20 70 L 60 40 L 180 40 L 220 70 L 180 100 L 60 100 Z" fill="none" stroke="currentColor" strokeWidth="1"/><path d="M 60 40 L 60 100 M 180 40 L 180 100 M 20 70 L 220 70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/><circle cx="120" cy="70" r="50" fill="none" stroke="currentColor" strokeWidth="0.5"/></svg>
          {/* Nodes */}
          <div className="absolute left-[40px] top-[50px] w-12 h-12 bg-white/80 border-2 border-fuchsia-200 rounded-full flex items-center justify-center z-10"><div className="w-2 h-2 bg-fuchsia-500 rounded-full" /></div>
          <div className="absolute right-[100px] top-[50px] w-12 h-12 bg-white/80 border-2 border-violet-200 rounded-full flex items-center justify-center z-10"><div className="w-2 h-2 bg-violet-500 rounded-full" /></div>
          <div className="absolute left-[120px] top-[10px] w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center z-10"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /></div>
          <div className="absolute left-[120px] bottom-[10px] w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center z-10"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full" /></div>
          {/* Packets */}
          <div className="absolute top-[55px] left-[55px] w-2.5 h-2.5 bg-fuchsia-500 rounded-full text-fuchsia-500 anim-packet-1" />
          <div className="absolute top-[55px] left-[55px] w-2.5 h-2.5 bg-violet-500 rounded-full text-violet-500 anim-packet-2" />
          <div className="absolute top-[55px] left-[55px] w-2.5 h-2.5 bg-indigo-500 rounded-full text-indigo-500 anim-packet-3" />
          {/* Hub */}
          <div className="glass-intense absolute top-[40px] left-[100px] w-[80px] h-16 rounded-2xl flex items-center justify-center gap-1 z-0 shadow-lg">
            <div className="w-1.5 bg-fuchsia-400 rounded-full" style={{height:'30%', animation:'wave-pulse 2s ease-in-out infinite 0.1s'}} />
            <div className="w-1.5 bg-violet-500 rounded-full" style={{height:'60%', animation:'wave-pulse 2.5s ease-in-out infinite 0.5s'}} />
            <div className="w-1.5 bg-indigo-400 rounded-full" style={{height:'90%', animation:'wave-pulse 1.8s ease-in-out infinite 0.2s'}} />
            <div className="w-1.5 bg-fuchsia-500 rounded-full" style={{height:'50%', animation:'wave-pulse 2.2s ease-in-out infinite 0.7s'}} />
            <div className="w-1.5 bg-pink-400 rounded-full" style={{height:'40%', animation:'wave-pulse 2.8s ease-in-out infinite 0.4s'}} />
          </div>
        </div>
      </LivingHero>

      {/* Top 3 Conferences — adaptatif au département (même pattern que Playbook Store) */}
      {activeView === "accueil" && !selectedPlaybook && (() => {
        const confPool = isNonCEOB
          ? allConfRaw.filter(pb => pb.departement === botCode)
          : allConfRaw;
        const top3 = [...confPool]
          .sort((a, b) => b.rating - a.rating || b.downloads - a.downloads)
          .slice(0, 3)
          .map((pb, i) => ({
            playbookId: pb.id,
            editorial: pb.description,
            rank: i + 1,
            gradient: isNonCEOB ? (DEPT_GRADIENT[botCode!] || DEPT_GRADIENT.CEOB) : "from-fuchsia-600 to-violet-600",
            pb,
          }));
        if (top3.length === 0) return null;
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <h3 className="text-xs font-bold text-gray-800">{isNonCEOB ? `Top 3 Conferences — ${DEPT_SHORT_LABEL[botCode!] || botCode}` : "Top 3 — Conferences les plus utiles"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {top3.map(f => (
                <div key={f.playbookId} className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow", f.gradient)} onClick={() => handleOpenDetail(f.pb)}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative p-4">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className={cn("text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center gap-0.5", f.rank === 1 ? "bg-amber-400 text-amber-900" : "bg-white/20 text-white")}>
                        {f.rank === 1 && <Crown className="h-3.5 w-3.5" />}
                        {f.rank !== 1 && f.rank}
                      </span>
                      <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.niveau}</span>
                      <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.prix === "Gratuit" ? "Inclus" : f.pb.prix}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight">{f.pb.nom}</h4>
                    <p className="text-[9px] text-white/80 mt-1.5 line-clamp-3 leading-relaxed">{f.editorial}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(f.pb.rating) ? "text-amber-300 fill-amber-300" : "text-white/20")} />
                        ))}
                      </div>
                      <span className="text-[9px] text-white font-bold">{f.pb.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[8px] text-white/70">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{f.pb.downloads} activations</span>
                      <span>{f.pb.etapes} etapes</span>
                      <span>{f.pb.duree}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-2 text-[9px] font-bold bg-white text-gray-900 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1">
                        <Rocket className="h-3.5 w-3.5" /> Decouvrir
                      </button>
                      <button className="flex-1 px-3 py-2 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> Previsualiser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

    <div className="flex gap-3">
      {/* Sidebar TOC */}
      <div className={SF.sidebarW}>
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = activeView === item.id && !item.expandable && !item.external;
          return (
            <div key={item.id}>
              {item.separator && idx > 0 && <div className={SF.separator} />}
              <button
                onClick={() => {
                  if (item.external && onNavigateToStore) { onNavigateToStore(); return; }
                  if (item.expandable === "families") { setExpandFamilies(!expandFamilies); }
                  else if (item.expandable === "depts") { setExpandDepts(!expandDepts); }
                  else if (item.id !== "store") { setActiveView(item.id as ConfAIView); setSelectedPlaybook(null); }
                }}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : item.external ? "text-gray-300" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : item.external ? "text-gray-400" : "text-gray-700")}>{item.label}</span>
                  {item.count !== undefined && <span className="text-[9px] text-gray-400">{item.count}</span>}
                  {item.external && <ExternalLink className="h-3.5 w-3.5 text-gray-300" />}
                  {item.expandable === "families" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandFamilies && "rotate-180")} />}
                  {item.expandable === "depts" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandDepts && "rotate-180")} />}
                </div>
              </button>
              {/* Expandable familles */}
              {item.expandable === "families" && expandFamilies && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {familyEntries.map(f => {
                    const FIcon = f.icon;
                    const isActiveF = activeView === "famille" && selectedFamily === f.key;
                    return (
                      <button key={f.key} onClick={() => { setSelectedFamily(f.key); setActiveView("famille"); setSelectedPlaybook(null); }}
                        className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all flex items-center gap-1",
                          isActiveF ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}>
                        <FIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{f.label}</span>
                        <span className="text-[8px] text-gray-400">{f.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Expandable departements */}
              {item.expandable === "depts" && expandDepts && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {deptEntries.map(d => {
                    const isActiveD = activeView === "departement" && selectedDept === d.code;
                    return (
                      <button key={d.code} onClick={() => { setSelectedDept(d.code); setActiveView("departement"); setSelectedPlaybook(null); }}
                        className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all",
                          isActiveD ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}>
                        {d.label} <span className="text-[8px] text-gray-400 ml-1">{d.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Fiche detaillee INLINE (drill-down) */}
        {selectedPlaybook ? (
          <ConfAIFicheDetail pb={selectedPlaybook} onBack={handleBack} onLaunch={onLaunch} allConf={allConf} />
        ) : (
          <>
            {activeView === "accueil" && <ConfAIAccueil playbooks={allConf} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} onLaunch={onLaunch} familyEntries={familyEntries} deptEntries={deptEntries} botCode={botCode} />}
            {activeView === "recentes" && <ConfAIRecentes allConf={allConf} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
            {activeView === "planifiees" && <ConfAIPlanifiees onBack={() => setActiveView("accueil")} />}
            {activeView === "famille" && selectedFamily && <ConfAIFiltered playbooks={allConf.filter(pb => getPlaybookFamily(pb) === selectedFamily)} title={CONFERENCE_FAMILIES[selectedFamily]?.label || selectedFamily} icon={CONFERENCE_FAMILIES[selectedFamily]?.icon || Video} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
            {activeView === "famille" && !selectedFamily && <ConfAIAccueil playbooks={allConf} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} onLaunch={onLaunch} familyEntries={familyEntries} deptEntries={deptEntries} botCode={botCode} />}
            {activeView === "departement" && selectedDept && <ConfAIFiltered playbooks={allConf.filter(pb => pb.departement === selectedDept)} title={DEPT_LABELS[selectedDept] || selectedDept} icon={DEPT_ICONS[selectedDept] || Building2} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
            {activeView === "departement" && !selectedDept && <ConfAIAccueil playbooks={allConf} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} onLaunch={onLaunch} familyEntries={familyEntries} deptEntries={deptEntries} botCode={botCode} />}
            {activeView === "tous" && <ConfAIFiltered playbooks={allConf} title="Toutes les conferences" icon={Video} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
          </>
        )}
      </div>
    </div>
    </div>
  );
}

/* ConfAIAccueil — Centre d'utilisation (pas un store) */
function ConfAIAccueil({ playbooks, onOpenDetail, onNavigate, onLaunch, familyEntries, deptEntries, botCode }: {
  playbooks: typeof PLAYBOOK_STORE_DATA;
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onNavigate: (view: ConfAIView, extra?: { family?: string; dept?: string }) => void;
  onLaunch?: (type: string, title: string) => void;
  familyEntries: { key: string; label: string; icon: React.ElementType; description: string; gradient: string; bg: string; text: string; count: number }[];
  deptEntries: { code: string; label: string; count: number }[];
  botCode?: string;
}) {
  const isNonCEOB = botCode && botCode !== "CEOB";
  // Poupée russe: non-CEOB = priorise les conférences du département
  const deptPlaybooks = isNonCEOB ? playbooks.filter(pb => pb.departement === botCode) : playbooks;
  const topUsed = [...deptPlaybooks].sort((a, b) => b.downloads - a.downloads).slice(0, 6);
  const express = deptPlaybooks.filter(pb => {
    const family = getPlaybookFamily(pb);
    return family === "EXP" || pb.duree.includes("5") || pb.duree.includes("10") || pb.duree.includes("15");
  }).slice(0, 6);
  // Familles filtrées par département pour non-CEOB
  const deptFamilyEntries = isNonCEOB
    ? familyEntries.map(f => ({ ...f, count: deptPlaybooks.filter(pb => getPlaybookFamily(pb) === f.key).length })).filter(f => f.count > 0)
    : familyEntries;

  return (
    <div className="space-y-4">
      {/* Section 1 — Les plus utilisees */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> {isNonCEOB ? `Conferences ${DEPT_SHORT_LABEL[botCode!] || botCode}` : "Les plus utilisees"}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {topUsed.map(pb => {
            const DeptIcon = DEPT_ICONS[pb.departement] || Target;
            return (
              <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">Inclus</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{pb.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {pb.bots.slice(0, 3).map((bot, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{bot}</span>
                      ))}
                      {pb.bots.length > 3 && <span className="text-[10px] text-gray-400">+{pb.bots.length - 3}</span>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                      <Play className="h-3.5 w-3.5" /> Lancer
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-500">{pb.duree}</span>
                    <span className="text-[10px] text-gray-500">{pb.etapes} etapes</span>
                    <span className="text-[10px] text-gray-400">({pb.downloads} utilisations)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2 — Lancement rapide (express) */}
      {express.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-orange-500" /> Lancement rapide</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {express.map(pb => {
              const DeptIcon = DEPT_ICONS[pb.departement] || Target;
              return (
                <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-[#00B4D8]/10">
                    <DeptIcon className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                    <span className="text-xs font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{pb.duree}</span>
                    <button onClick={e => { e.stopPropagation(); onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                      <Play className="h-3.5 w-3.5" /> Lancer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3 — Explorer par categorie */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-gray-500" /> {isNonCEOB ? `Categories ${DEPT_SHORT_LABEL[botCode!] || botCode}` : "Explorer par categorie"}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {deptFamilyEntries.map(f => {
            const FIcon = f.icon;
            return (
              <div key={f.key} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("famille", { family: f.key })}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <FIcon className="h-4 w-4 text-gray-900 stroke-[2.5] shrink-0" />
                  <span className="text-sm font-bold text-gray-900">{f.label}</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{f.description}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", f.bg, f.text)}>{f.count} conferences</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Explorer par departement (CEOB seulement — poupée russe) */}
      {!isNonCEOB && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-gray-500" /> Explorer par departement</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {deptEntries.map(d => {
              const DIcon = DEPT_ICONS[d.code] || Building2;
              const avatarSrc = BOT_AVATAR[d.code];
              const botName = BOT_NAME[d.code] || d.code;
              return (
                <div key={d.code} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("departement", { dept: d.code })}>
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={botName} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" />
                    ) : (
                      <DIcon className="h-5 w-5 text-gray-900 stroke-[2.5] shrink-0" />
                    )}
                    <span className="text-sm font-bold text-gray-900">{d.label}</span>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{d.count} conferences</span>
                    <span className="text-[10px] text-gray-500 ml-1.5">pour {botName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bandeau bottom */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Conference AI · {isNonCEOB ? `${deptPlaybooks.length} conferences ${DEPT_SHORT_LABEL[botCode!] || botCode}` : `${playbooks.length} conferences incluses`} · {deptFamilyEntries.length} categories · 10 outils interactifs</span>
      </div>
    </div>
  );
}

/* ConfAIRecentes — Dernieres sessions lancees */
function ConfAIRecentes({ allConf, onOpenDetail, onLaunch, onBack }: {
  allConf: typeof PLAYBOOK_STORE_DATA;
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onLaunch?: (type: string, title: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour</button>
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">Sessions recentes</h3>
      </div>
      {MOCK_RECENT_SESSIONS.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">Aucune session recente</p>
      ) : (
        <div className="space-y-2">
          {MOCK_RECENT_SESSIONS.map(session => {
            const pb = allConf.find(p => p.id === session.pbId);
            const name = pb?.nom || session.pbId;
            return (
              <div key={session.id} className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-800 block truncate">{name}</span>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                    <span>{session.date}</span>
                    <span>{session.duree}</span>
                    <span>{session.participants} participants</span>
                    <span>{session.livrables} livrables</span>
                  </div>
                </div>
                <button onClick={() => { if (pb) onOpenDetail(pb); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-[10px] font-bold cursor-pointer transition-colors">
                  <Eye className="h-3.5 w-3.5" /> Voir
                </button>
                <button onClick={() => { if (pb) onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" /> Relancer
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ConfAIPlanifiees — Conferences planifiees a venir */
function ConfAIPlanifiees({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour</button>
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">Conferences planifiees</h3>
      </div>
      {MOCK_PLANNED_SESSIONS.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Aucune conference planifiee</p>
          <p className="text-[10px] text-gray-400 mt-1">Ouvrez une conference et cliquez "Planifier" pour programmer une session</p>
        </div>
      ) : (
        <div className="space-y-2">
          {MOCK_PLANNED_SESSIONS.map(session => (
            <div key={session.id} className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-800 block truncate">{session.pbId}</span>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                  <span>{session.date} a {session.heure}</span>
                  <span>{session.participants.length} invites</span>
                </div>
              </div>
              <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer">Modifier</button>
              <button className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer">Annuler</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ConfAIFicheDetail — Fiche detail orientee UTILISATION (pas store) */
function ConfAIFicheDetail({ pb, onBack, onLaunch, allConf }: {
  pb: typeof PLAYBOOK_STORE_DATA[0];
  onBack: () => void;
  onLaunch?: (type: string, title: string) => void;
  allConf: typeof PLAYBOOK_STORE_DATA;
}) {
  const [planDate, setPlanDate] = useState("");
  const [planHeure, setPlanHeure] = useState("");
  const [planParticipants, setPlanParticipants] = useState("");
  const [planMessage, setPlanMessage] = useState("");

  const deptColor = DEPT_COLORS[pb.departement] || DEPT_COLORS.CEOB;
  const DeptIcon = DEPT_ICONS[pb.departement] || Building2;
  const botNameToCode = Object.fromEntries(Object.entries(BOT_DISPLAY).map(([code, d]) => [d.name, code]));
  const workflows = PLAYBOOK_WORKFLOWS[pb.id] || Array.from({ length: pb.etapes }, (_, i) => ({
    num: i + 1, label: i === 0 ? "Collecte des donnees et parametres" : i === pb.etapes - 1 ? "Generation du livrable final" : `Etape ${i + 1} — Traitement automatise`, bot: pb.bots[i % pb.bots.length], duree: "~2 min",
  }));
  const livrables = PLAYBOOK_LIVRABLES[pb.id] || [];
  const similarDept = allConf.filter(p => p.departement === pb.departement && p.id !== pb.id).slice(0, 3);
  const recentForThis = MOCK_RECENT_SESSIONS.filter(s => s.pbId === pb.id).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Back button */}
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour
      </button>

      {/* Section 1 — Hero + Details side by side */}
      <div className="grid grid-cols-5 gap-3">
        {/* Hero (3/5) */}
        <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", deptColor.gradient)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-4 space-y-3">
            <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              <DeptIcon className="h-5 w-5 text-white shrink-0" />
              {pb.nom}
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">{PLAYBOOK_LONG_DESC[pb.id] || pb.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-white/70">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{pb.duree}</span>
              <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{pb.etapes} etapes</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />2-8 participants</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => onLaunch?.(pb.type, pb.nom)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                <Rocket className="h-3.5 w-3.5" /> Lancer maintenant
              </button>
              <button onClick={() => { const el = document.getElementById("conf-plan-section"); el?.scrollIntoView({ behavior: "smooth" }); }} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
                <Calendar className="h-3.5 w-3.5" /> Planifier
              </button>
            </div>
          </div>
        </div>

        {/* Details (2/5) */}
        <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Details</span>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Departement</span>
                <span className="text-xs font-bold text-gray-700">{DEPT_LABELS[pb.departement] || pb.departement}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Bot principal</span>
                <span className="text-xs font-bold text-gray-700">{pb.bots[0]}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Mode camera</span>
                <span className="text-xs font-bold text-gray-700">Travail</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Phase</span>
                <span className="text-xs font-bold text-gray-700">Discussion</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Duree</span>
                <span className="text-xs font-bold text-gray-700">{pb.duree}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 — Preparation de la conference (INLINE, pas de modal) */}
      <div id="conf-plan-section" className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Preparer la conference</span>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Date</label>
              <input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)} className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Heure</label>
              <input type="time" value={planHeure} onChange={e => setPlanHeure(e.target.value)} className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Participants (emails)</label>
            <textarea value={planParticipants} onChange={e => setPlanParticipants(e.target.value)} placeholder="carl@usinebleue.ai, collegue@entreprise.com" rows={2} className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none resize-none" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Message personnalise (optionnel)</label>
            <input type="text" value={planMessage} onChange={e => setPlanMessage(e.target.value)} placeholder="Contexte ou objectif de la session..." className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => onLaunch?.(pb.type, pb.nom)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors">
              <Rocket className="h-3.5 w-3.5" /> Lancer maintenant
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors">
              <Calendar className="h-3.5 w-3.5" /> Planifier pour plus tard
            </button>
          </div>
        </div>
      </div>

      {/* Section 3 — Outils disponibles (features de conference) */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Outils disponibles</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{CONF_TOOLS.length} outils</span>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-2">
          {CONF_TOOLS.map(tool => {
            const ToolIcon = tool.icon;
            return (
              <div key={tool.key} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                <ToolIcon className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-800 block">{tool.label}</span>
                  <span className="text-[10px] text-gray-500">{tool.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Equipe IA */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Equipe IA</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {pb.bots.map((bot, i) => {
            const bCode = botNameToCode[bot] || "CEOB";
            const bAvatar = BOT_AVATAR_MAP[bCode] || BOT_AVATAR_MAP.CEOB;
            const bDisplay = BOT_DISPLAY[bCode];
            return (
              <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                <img src={bAvatar} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-800 block">{bot}</span>
                  <span className="text-[10px] text-gray-500">{bDisplay?.role || "Agent"} — {bDisplay?.dept || ""}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{i === 0 ? "Pilote" : i === 1 ? "Analyste" : "Support"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5 — Deroulement (workflow) */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Deroulement</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{workflows.length} etapes</span>
        </div>
        <div className="px-4 py-3 space-y-1">
          {workflows.map((step: any) => {
            const sCode = botNameToCode[step.bot] || "CEOB";
            const sAvatar = BOT_AVATAR_MAP[sCode] || BOT_AVATAR_MAP.CEOB;
            return (
              <div key={step.num} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[10px] font-bold text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{step.num}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-800">{step.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img src={sAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                  <span className="text-[10px] font-bold text-blue-600">{step.bot}</span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{step.duree}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6 — Livrables */}
      {livrables.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Livrables</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {livrables.map((l, i) => {
              const LivIcon = l.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  <LivIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700 flex-1">{l.nom}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">{l.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 7 — Dernieres sessions */}
      {recentForThis.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Clock className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Dernieres sessions</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {recentForThis.map(s => (
              <div key={s.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-700 flex-1">{s.date}</span>
                <span className="text-[10px] text-gray-500">{s.duree}</span>
                <span className="text-[10px] text-gray-500">{s.participants} participants</span>
                <span className="text-[10px] text-gray-500">{s.livrables} livrables</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 8 — Conferences similaires */}
      {similarDept.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Layers className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Conferences similaires</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {similarDept.map(sp => (
              <div key={sp.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => { onBack(); setTimeout(() => { /* parent will re-render */ }, 50); }}>
                <span className="text-xs font-bold text-gray-800 flex-1">{sp.nom}</span>
                <span className="text-[10px] text-gray-500">{sp.duree}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Inclus</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ConfAIFiltered — Liste filtree de conferences */
function ConfAIFiltered({ playbooks, title, icon: TitleIcon, onOpenDetail, onLaunch, onBack }: {
  playbooks: typeof PLAYBOOK_STORE_DATA;
  title: string;
  icon: React.ElementType;
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onLaunch?: (type: string, title: string) => void;
  onBack: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [filterDept, setFilterDept] = useState<string>("all");

  const depts = [...new Set(playbooks.map(p => p.departement))];
  let filtered = playbooks
    .filter(pb => !searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) || pb.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(pb => filterDept === "all" || pb.departement === filterDept);

  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sortBy === "populaires") filtered = [...filtered].sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "alpha") filtered = [...filtered].sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour</button>
      <div className="flex items-center gap-2 mb-1">
        <TitleIcon className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{playbooks.length}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[120px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full text-xs pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
        </div>
        {depts.length > 1 && (
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <option value="all">Tous les depts</option>
            {depts.map(d => <option key={d} value={d}>{DEPT_LABELS[d] || d}</option>)}
          </select>
        )}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
          <option value="rating">Note</option>
          <option value="populaires">Populaire</option>
          <option value="alpha">A-Z</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(pb => {
          const DeptIcon = DEPT_ICONS[pb.departement] || Target;
          return (
            <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">Inclus</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{pb.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {pb.bots.slice(0, 3).map((bot, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{bot}</span>
                    ))}
                  </div>
                  <button onClick={e => { e.stopPropagation(); onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                    <Play className="h-3.5 w-3.5" /> Lancer
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-gray-500">{pb.duree}</span>
                  <span className="text-[10px] text-gray-500">{pb.etapes} etapes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Aucune conference ne correspond a vos filtres</p>}
    </div>
  );
}

// ══════════════════════════════════════════
// ══════════════════════════════════════════
// DEPT DASHBOARD VIEW — Dashboard par département (12 bots)
// Pattern: gradient header + 5 VITAA + 3 rows × 3 blocs (style UB_PASTEL)
// ══════════════════════════════════════════

