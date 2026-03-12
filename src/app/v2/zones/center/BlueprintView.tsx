/**
 * BlueprintView.tsx — Blueprint Unifie (fusion RD.7 + BlueprintLiveView + BlueprintGestionView)
 * 8 tabs: Vue d'ensemble, Timeline, Chantiers, Projets, Missions, Taches, Opportunites, Equipes
 * Donnees seed RD.7 (plan Carl) + API reelles (COMMAND, templates, CRUD) fusionnees
 */

import { useState, useEffect, useCallback } from "react";
import {
  Rocket, Wrench, Shield, Package, Users, Globe,
  Target, Brain, ChevronRight, ChevronDown,
  Flame, Bot, Code2, Eye, Zap,
  CheckCircle2, Clock, Lock,
  Layers, CreditCard, Network,
  BarChart3, Cpu,
  BookOpen, Scale, Radio, FileText, Route,
  Sparkles, Calendar, ListChecks,
  Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";
import { api } from "../../api/client";
import { BlueprintFrame } from "./shared/BlueprintFrame";
import { StatusBadge, BotBadge, ChaleurBadge, PlaybookCard, TemplateSection, KPICard } from "./shared/BlueprintComponents";
import {
  BLUEPRINT_TABS, STATUS_CONFIG, CHALEUR_CONFIG, BOT_INFO, ROLE_CONFIG,
  PLAYBOOK_TEMPLATES, CHANTIERS,
  NB_PROJETS, NB_MISSIONS, NB_TACHES, MISSIONS_DONE, MISSIONS_EN_COURS,
  parseMission,
} from "./shared/blueprint-config";
import type { BlueprintTabId, BlueprintNav, Chantier, Projet } from "./shared/blueprint-types";

// ================================================================
// COMMAND STAGES (from BlueprintLiveView)
// ================================================================

const STAGE_LABELS: Record<string, { label: string; progress: number }> = {
  scan: { label: "Scan en cours", progress: 25 },
  strategie: { label: "Strategie", progress: 50 },
  execution: { label: "Execution", progress: 75 },
  bilan: { label: "Bilan", progress: 90 },
  done: { label: "Termine", progress: 100 },
};

const CLEVEL_BOTS = [
  { code: "CEOB", nom: "CarlOS", role: "CEO", dept: "Direction", deptColor: "bg-blue-100 text-blue-700" },
  { code: "CTOB", nom: "Thierry", role: "CTO", dept: "Technologie", deptColor: "bg-violet-100 text-violet-700" },
  { code: "CFOB", nom: "Francois", role: "CFO", dept: "Finance", deptColor: "bg-emerald-100 text-emerald-700" },
  { code: "CMOB", nom: "Martine", role: "CMO", dept: "Marketing", deptColor: "bg-pink-100 text-pink-700" },
  { code: "CSOB", nom: "Sophie", role: "CSO", dept: "Strategie", deptColor: "bg-red-100 text-red-700" },
  { code: "COOB", nom: "Olivier", role: "COO", dept: "Operations", deptColor: "bg-orange-100 text-orange-700" },
];

// ================================================================
// TAB: VUE D'ENSEMBLE
// ================================================================

function TabOverview({ nav }: { nav: BlueprintNav }) {
  const [commandMissions, setCommandMissions] = useState<Record<string, unknown>[]>([]);
  const [loadingCommand, setLoadingCommand] = useState(true);

  useEffect(() => {
    api.commandMissions(10)
      .then((res) => setCommandMissions(Array.isArray(res) ? res : (res as Record<string, unknown>).missions as Record<string, unknown>[] || []))
      .catch(() => setCommandMissions([]))
      .finally(() => setLoadingCommand(false));
  }, []);

  const allMissions = CHANTIERS.flatMap((c) => c.projets.flatMap((p) => p.missions));
  const opportunites = allMissions.filter((m) => m.toLowerCase().includes("externe") || m.toLowerCase().includes("fournisseur") || m.toLowerCase().includes("ouverte") || m.toLowerCase().includes("partenaire"));
  const pctDone = Math.round((MISSIONS_DONE / NB_MISSIONS) * 100);
  const pctEnCours = Math.round((MISSIONS_EN_COURS / NB_MISSIONS) * 100);
  const pctAFaire = 100 - pctDone - pctEnCours;

  const botStatus = (code: string) => {
    const activeMission = commandMissions.find(
      (m) => Array.isArray(m.scan_bots) && (m.scan_bots as string[]).includes(code) && m.current_stage !== "done"
    );
    if (activeMission) {
      const stage = STAGE_LABELS[activeMission.current_stage as string] || { label: "Actif", progress: 50 };
      return { label: stage.label, progress: stage.progress, active: true };
    }
    return { label: "Standby", progress: 0, active: false };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* COLONNE GAUCHE */}
      <div className="space-y-4">
        {/* 4 KPIs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Chantiers", value: "1", sub: "Usine Bleue AI", color: "red", icon: Flame, tab: "chantiers" as BlueprintTabId },
            { label: "Projets", value: String(NB_PROJETS), sub: `${CHANTIERS.filter((c) => c.chaleur === "brule").length} brulent`, color: "blue", icon: Package, tab: "projets" as BlueprintTabId },
            { label: "Missions", value: String(NB_MISSIONS), sub: `${MISSIONS_DONE} completes`, color: "violet", icon: ListChecks, tab: "missions" as BlueprintTabId },
            { label: "Taches", value: String(NB_TACHES), sub: `${MISSIONS_EN_COURS} en cours`, color: "emerald", icon: CheckCircle2, tab: "taches" as BlueprintTabId },
          ].map((kpi) => (
            <KPICard key={kpi.label} kpi={{ ...kpi, onClick: () => nav.goTo(kpi.tab) }} />
          ))}
        </div>

        {/* Progression */}
        <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Progression</span>
            <span className="ml-auto text-sm font-bold text-emerald-400">{pctDone}%</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full flex items-center justify-center transition-all" style={{ width: `${pctDone}%` }}>
                {pctDone > 8 && <span className="text-[8px] font-bold text-white">{pctDone}%</span>}
              </div>
              <div className="bg-amber-400 h-full flex items-center justify-center transition-all" style={{ width: `${pctEnCours}%` }}>
                {pctEnCours > 8 && <span className="text-[8px] font-bold text-white">{pctEnCours}%</span>}
              </div>
              <div className="bg-gray-200 h-full flex items-center justify-center transition-all" style={{ width: `${pctAFaire}%` }}>
                {pctAFaire > 8 && <span className="text-[8px] font-bold text-gray-500">{pctAFaire}%</span>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { v: MISSIONS_DONE, l: "COMPLETES", c: "emerald" },
                { v: MISSIONS_EN_COURS, l: "EN COURS", c: "amber" },
                { v: NB_TACHES, l: "TACHES", c: "blue" },
              ].map((s) => (
                <div key={s.l} className={cn("text-center p-2 rounded-lg border", `bg-${s.c}-50 border-${s.c}-100`)}>
                  <div className={cn("text-lg font-bold", `text-${s.c}-600`)}>{s.v}</div>
                  <div className={cn("text-[9px] font-medium", `text-${s.c}-600`)}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 13 Projets tree */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">1 Chantier — {NB_PROJETS} Projets</div>
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <button onClick={() => nav.goTo("chantiers")} className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/20">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Application Usine Bleue AI</div>
                <span className="text-[9px] font-bold text-white/80">{NB_PROJETS} projets · {NB_MISSIONS} missions · {NB_TACHES} taches</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
            </button>
            <div className="border-t border-blue-400/20 divide-y divide-gray-50">
              {CHANTIERS.map((c) => {
                const Icon = c.icon;
                const done = c.projets.filter((p) => p.status === "done").length;
                const ChaleurIcon = CHALEUR_CONFIG[c.chaleur].icon;
                return (
                  <button key={c.id} onClick={() => nav.goTo("chantiers", c.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left cursor-pointer">
                    <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0 bg-gradient-to-br", `from-${c.color}-500 to-${c.color}-600`)}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-800 flex-1 truncate">{c.label}</span>
                    <span className="text-[9px] font-bold text-emerald-600">{done}/{c.projets.length}</span>
                    <ChaleurIcon className={cn("h-3.5 w-3.5", CHALEUR_CONFIG[c.chaleur].color)} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COLONNE DROITE */}
      <div className="space-y-4">
        {/* Bots COMMAND Status (live) */}
        <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-600 flex items-center gap-2">
            <Bot className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Equipe C-Level</span>
            {loadingCommand && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50 ml-auto" />}
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {CLEVEL_BOTS.map((bot) => {
              const status = botStatus(bot.code);
              return (
                <div key={bot.code} className="p-2 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img src={BOT_AVATAR[bot.code]} alt={bot.nom} className="w-6 h-6 rounded-full ring-1 ring-white shadow-sm" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-gray-800 truncate">{bot.nom}</p>
                      <p className="text-[8px] text-gray-400">{bot.role}</p>
                    </div>
                    {status.active && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto shrink-0" />}
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", status.active ? "bg-blue-500" : "bg-gray-300")} style={{ width: `${status.progress}%` }} />
                  </div>
                  <p className="text-[8px] text-gray-400 mt-0.5">{status.label}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Opportunites */}
        {opportunites.length > 0 && (
          <Card className="p-0 overflow-hidden border-2 border-orange-200">
            <div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center gap-2">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Opportunites</span>
              <span className="text-[9px] px-2 py-0.5 bg-white/20 rounded text-white ml-auto font-bold">{opportunites.length}</span>
            </div>
            <div className="p-3 space-y-1.5">
              {opportunites.slice(0, 5).map((m, i) => {
                const parts = m.split(": ");
                const text = parts.length > 1 ? parts.slice(1).join(": ") : m;
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-orange-100 bg-orange-50/50">
                    <Zap className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <span className="text-[9px] text-gray-800 flex-1 truncate">{text}</span>
                  </div>
                );
              })}
              {opportunites.length > 5 && (
                <button onClick={() => nav.goTo("opportunites")} className="w-full text-center text-[9px] text-orange-600 font-bold py-1 hover:bg-orange-50 rounded transition-colors">
                  Voir les {opportunites.length} opportunites →
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Playbooks Populaires */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            Playbooks Populaires
          </div>
          <div className="space-y-2">
            {PLAYBOOK_TEMPLATES.filter((p) => p.populaire).map((pb) => (
              <PlaybookCard key={pb.id} pb={pb} />
            ))}
          </div>
        </div>

        {/* Flow CREDO → Blueprint */}
        <Card className="p-0 overflow-hidden border border-gray-200">
          <div className="px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-600 flex items-center gap-2">
            <Route className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Flow CREDO → Blueprint</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Discussion", color: "gray", desc: "LiveChat CREDO" },
                { label: "→", color: "" },
                { label: "Action Footer", color: "violet", desc: "Nuancer, Deleguer..." },
                { label: "→", color: "" },
                { label: "Mission creee", color: "blue", desc: "Dans un projet" },
                { label: "→", color: "" },
                { label: "Blueprint", color: "emerald", desc: "Execution + suivi" },
              ].map((step, i) => step.label === "→" ? (
                <ChevronRight key={i} className="h-4 w-4 text-gray-300" />
              ) : (
                <div key={i} className={cn("text-center p-2 rounded-lg border min-w-[70px]", `bg-${step.color}-50 border-${step.color}-200`)}>
                  <div className={cn("text-[9px] font-bold", `text-${step.color}-700`)}>{step.label}</div>
                  <div className="text-[8px] text-gray-400">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ================================================================
// TAB: CHANTIERS
// ================================================================

function TabChantiers({ nav }: { nav: BlueprintNav }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2.5 bg-red-50 rounded-lg border border-red-100">
          <div className="text-lg font-bold text-red-600">1</div>
          <div className="text-[9px] text-red-600 font-medium">CHANTIER</div>
        </div>
        <div className="text-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-lg font-bold text-blue-600">{NB_PROJETS}</div>
          <div className="text-[9px] text-blue-600 font-medium">PROJETS</div>
        </div>
        <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
          <div className="text-lg font-bold text-violet-600">{NB_MISSIONS}</div>
          <div className="text-[9px] text-violet-600 font-medium">MISSIONS</div>
        </div>
        <div className="text-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="text-lg font-bold text-emerald-600">{NB_TACHES}</div>
          <div className="text-[9px] text-emerald-600 font-medium">TACHES</div>
        </div>
      </div>

      <button onClick={() => nav.goTo("projets")} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20"><Rocket className="h-5 w-5 text-white" /></div>
          <div className="flex-1">
            <span className="text-sm font-bold text-white">Application Usine Bleue AI</span>
            <div className="text-[9px] text-white/70">{NB_PROJETS} projets · {NB_MISSIONS} missions</div>
          </div>
          <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
        </div>
        <div className="px-4 py-3">
          <p className="text-[9px] text-gray-500">Plateforme CarlOS complete — de la fondation technique a l'expansion marche.</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB"].map((b) => <BotBadge key={b} code={b} />)}
          </div>
        </div>
      </button>

      <TemplateSection niveau="chantier" label="Chantier" />
    </div>
  );
}

// ================================================================
// TAB: PROJETS
// ================================================================

function TabProjets({ nav, ch }: { nav: BlueprintNav; ch: Chantier | null }) {
  if (!ch) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[9px]">
          <button onClick={() => nav.goTo("chantiers")} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">← Chantiers</button>
          <span className="text-gray-400">{NB_PROJETS} projets dans Usine Bleue AI</span>
        </div>
        <div className="space-y-2">
          {CHANTIERS.map((c) => {
            const Icon = c.icon;
            const nbMissions = c.projets.length;
            const done = c.projets.filter((p) => p.status === "done").length;
            return (
              <button key={c.id} onClick={() => nav.goTo("projets", c.id)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
                <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
                  <Icon className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">{c.label}</span>
                  <span className="text-[9px] text-white/70 ml-auto">{nbMissions} missions</span>
                  <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                </div>
                <div className="px-4 py-2.5">
                  <p className="text-[9px] text-gray-500 line-clamp-2">{c.desc}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] font-bold text-emerald-600">{done}/{nbMissions} done</span>
                    <span className="text-[9px] text-gray-400">{c.timing}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {[...new Set(c.bots)].map((b) => <BotBadge key={b} code={b} />)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <TemplateSection niveau="projet" label="Projet" />
      </div>
    );
  }

  const Icon = ch.icon;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 text-[9px] flex-wrap">
        <button onClick={() => nav.goTo("chantiers")} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">Chantiers</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button onClick={() => nav.goTo("projets")} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">Projets</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className={cn("px-2 py-1 rounded font-bold", `bg-${ch.color}-100 text-${ch.color}-700`)}>{ch.label}</span>
      </div>

      <Card className="p-0 overflow-hidden border shadow-sm">
        <div className={cn("px-4 py-3 bg-gradient-to-r", `from-${ch.color}-600 to-${ch.color}-500`)}>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">{ch.label}</span>
          </div>
          <p className="text-[9px] text-white/80 mt-1">{ch.desc}</p>
        </div>
        <div className="px-4 py-2 flex items-center gap-1 flex-wrap">
          {ch.bots.map((b) => <BotBadge key={b} code={b} />)}
          <span className="text-[9px] text-gray-400 ml-2">{ch.responsable}</span>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        {[
          { v: ch.projets.filter((p) => p.status === "done").length, l: "DONE", c: "emerald" },
          { v: ch.projets.filter((p) => p.status === "en-cours").length, l: "EN COURS", c: "amber" },
          { v: ch.projets.filter((p) => p.status === "a-faire").length, l: "A FAIRE", c: "gray" },
          { v: ch.projets.filter((p) => p.status === "bloque").length, l: "BLOQUES", c: "red" },
        ].map((s) => (
          <div key={s.l} className={cn("text-center p-2 rounded-lg border", `bg-${s.c}-50 border-${s.c}-100`)}>
            <div className={cn("text-lg font-bold", `text-${s.c}-600`)}>{s.v}</div>
            <div className={cn("text-[9px] font-medium", `text-${s.c}-600`)}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {ch.projets.map((p) => (
          <button key={p.id} onClick={() => nav.goTo("missions", ch.id, p.id)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
            <div className="px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500">
              <code className="text-[9px] font-mono font-bold text-blue-200">{p.id}</code>
              <span className="text-xs font-bold text-white flex-1 truncate">{p.label}</span>
              <StatusBadge status={p.status} />
              <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <div className="px-4 py-2.5">
              <p className="text-[9px] text-gray-500 line-clamp-2">{p.desc}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[9px] text-gray-400">{p.missions.length} taches</span>
                {p.bloque_par && <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> {p.bloque_par}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
      <TemplateSection niveau="mission" label="Mission" />
    </div>
  );
}

// ================================================================
// TAB: MISSIONS
// ================================================================

function TabMissionsView({ nav, ch, projet }: { nav: BlueprintNav; ch: Chantier | null; projet: Projet | null }) {
  if (!ch || !projet) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[9px]">
          <button onClick={() => nav.goTo("projets")} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">← Projets</button>
          <span className="text-gray-400">Selectionnez un projet pour voir ses missions</span>
        </div>
        {CHANTIERS.map((c) => {
          const chMissions = c.projets.flatMap((p) => p.missions.map((m, idx) => ({ ...parseMission(m), projet: p, idx })));
          if (chMissions.length === 0) return null;
          const Icon = c.icon;
          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Icon className={cn("h-3.5 w-3.5", `text-${c.color}-500`)} />
                <span className="text-[9px] font-bold text-gray-600">{c.label}</span>
                <span className="text-[9px] text-gray-400">{chMissions.length} taches</span>
              </div>
              {chMissions.slice(0, 5).map((m, i) => (
                <button key={`${c.id}-${m.projet.id}-${m.idx}-${i}`} onClick={() => nav.goTo("taches", c.id, m.projet.id, m.idx)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
                  <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
                    <span className="text-xs font-bold text-white flex-1 truncate">{m.text}</span>
                    <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <div className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-gray-400">{m.projet.id}</span>
                      <BotBadge code={m.botCode} />
                    </div>
                  </div>
                </button>
              ))}
              {chMissions.length > 5 && (
                <button onClick={() => nav.goTo("projets", c.id)} className="w-full text-center text-[9px] text-blue-600 font-bold py-1 hover:bg-blue-50 rounded transition-colors">
                  Voir les {chMissions.length} taches →
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 text-[9px] flex-wrap">
        <button onClick={() => nav.goTo("projets")} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">Projets</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button onClick={() => nav.goTo("projets", ch.id)} className={cn("px-2 py-1 rounded font-bold", `bg-${ch.color}-100 text-${ch.color}-700`)}>{ch.label}</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="px-2 py-1 rounded font-bold bg-blue-100 text-blue-700">{projet.id}: {projet.label}</span>
      </div>

      <div className="p-0 overflow-hidden rounded-lg border shadow-sm">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-600">
          <div className="flex items-center gap-2">
            <code className="text-[9px] font-mono font-bold text-blue-200">{projet.id}</code>
            <span className="text-sm font-bold text-white">{projet.label}</span>
            <StatusBadge status={projet.status} />
          </div>
          <p className="text-[9px] text-white/80 mt-1">{projet.desc}</p>
          {projet.bloque_par && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-red-500/20 rounded">
              <Lock className="h-3.5 w-3.5 text-red-200" />
              <span className="text-[9px] text-red-200">Bloque par: {projet.bloque_par}</span>
            </div>
          )}
        </div>
        <div className="px-4 py-2 flex items-center gap-2">
          <BotBadge code={projet.bot} />
          <span className="text-[9px] text-gray-500">Responsable</span>
          <span className="text-[9px] text-gray-400 ml-auto">{projet.missions.length} taches</span>
        </div>
      </div>

      <div className="space-y-2">
        {projet.missions.map((m, idx) => {
          const parsed = parseMission(m);
          const rc = ROLE_CONFIG[parsed.role];
          return (
            <button key={idx} onClick={() => nav.goTo("taches", ch.id, projet.id, idx)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
              <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r",
                parsed.role === "master" ? "from-blue-600 to-blue-500" :
                parsed.role === "humain-ceo" ? "from-slate-700 to-slate-600" :
                parsed.role === "humain-pm" ? "from-sky-600 to-sky-500" :
                parsed.role === "externe" ? "from-orange-500 to-orange-400" :
                "from-violet-600 to-violet-500"
              )}>
                <span className="text-[9px] font-mono font-bold text-white/70">#{idx + 1}</span>
                <span className="text-xs font-bold text-white flex-1 truncate">{parsed.text}</span>
                <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <div className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <BotBadge code={parsed.botCode} />
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold text-white", rc.bg)}>{rc.badge}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <TemplateSection niveau="tache" label="Tache" />
    </div>
  );
}

// ================================================================
// TAB: TACHES
// ================================================================

function TabTaches({ nav, ch, projet, missionIdx }: { nav: BlueprintNav; ch: Chantier | null; projet: Projet | null; missionIdx: number | null }) {
  if (!ch || !projet || missionIdx === null) {
    const allTaches: { text: string; botCode: string; role: string; chantier: Chantier; projet: Projet; missionIdx: number }[] = [];
    CHANTIERS.forEach((c) => {
      c.projets.forEach((p) => {
        p.missions.forEach((m, idx) => {
          const parsed = parseMission(m);
          allTaches.push({ ...parsed, chantier: c, projet: p, missionIdx: idx });
        });
      });
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[9px]">
          <button onClick={() => nav.goTo("missions")} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">← Missions</button>
          <span className="text-gray-400">{allTaches.length} taches au total</span>
        </div>
        {CHANTIERS.map((c) => {
          const chTaches = c.projets.flatMap((p) => p.missions.map((m, idx) => ({ ...parseMission(m), projet: p, idx })));
          if (chTaches.length === 0) return null;
          const Icon = c.icon;
          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Icon className={cn("h-3.5 w-3.5", `text-${c.color}-500`)} />
                <span className="text-[9px] font-bold text-gray-600">{c.label}</span>
                <span className="text-[9px] text-gray-400">{chTaches.length} taches</span>
              </div>
              {chTaches.slice(0, 5).map((t, i) => (
                <button key={`${c.id}-${t.projet.id}-${t.idx}-${i}`} onClick={() => nav.goTo("taches", c.id, t.projet.id, t.idx)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
                  <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
                    <span className="text-xs font-bold text-white flex-1 truncate">{t.text}</span>
                    <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <div className="px-4 py-2.5">
                    <span className="text-[9px] text-gray-400">{t.projet.id} — {t.projet.label}</span>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  const missionRaw = projet.missions[missionIdx];
  if (!missionRaw) return null;

  const parsed = parseMission(missionRaw);
  const botInfo2 = BOT_INFO[parsed.botCode];
  const rc = ROLE_CONFIG[parsed.role];

  const mockSousTaches = parsed.role === "humain-ceo" ? [
    { label: "CarlOS prepare le contexte et les options", assignee: "CEOB", status: "done" as const },
    { label: "Presentation au CEO avec recommandation", assignee: "CEOB", status: "en-cours" as const },
    { label: "Decision GO/STOP du CEO", assignee: parsed.botCode, status: "a-faire" as const },
    { label: "CarlOS execute selon la decision", assignee: "CEOB", status: "a-faire" as const },
  ] : parsed.role === "master" ? [
    { label: "Analyser le contexte et les donnees disponibles", assignee: "CEOB", status: "done" as const },
    { label: "Deleguer aux sous-bots specialises", assignee: "CEOB", status: "en-cours" as const },
    { label: "Synthetiser et proposer au CEO", assignee: "CEOB", status: "a-faire" as const },
    { label: "Ajuster selon feedback humain", assignee: "CEOB", status: "a-faire" as const },
  ] : [
    { label: "Recevoir le briefing de CarlOS", assignee: parsed.botCode, status: "done" as const },
    { label: "Executer la tache", assignee: parsed.botCode, status: "en-cours" as const },
    { label: "Reporter a CarlOS pour validation", assignee: parsed.botCode, status: "a-faire" as const },
    { label: "CarlOS valide et presente au CEO", assignee: "CEOB", status: "a-faire" as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 text-[9px] flex-wrap">
        <button onClick={() => nav.goTo("projets", ch.id)} className={cn("px-2 py-1 rounded font-bold", `bg-${ch.color}-100 text-${ch.color}-700`)}>{ch.label}</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button onClick={() => nav.goTo("missions", ch.id, projet.id)} className="px-2 py-1 rounded font-bold bg-blue-100 text-blue-700">{projet.id}</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="px-2 py-1 rounded font-bold bg-violet-100 text-violet-700">Tache #{missionIdx + 1}</span>
      </div>

      <div className="p-0 overflow-hidden rounded-lg border shadow-sm">
        <div className={cn("px-4 py-3 bg-gradient-to-r",
          parsed.role === "master" ? "from-blue-700 to-blue-600" :
          parsed.role === "humain-ceo" ? "from-slate-800 to-slate-700" :
          parsed.role === "humain-pm" ? "from-sky-700 to-sky-600" :
          parsed.role === "externe" ? "from-orange-600 to-orange-500" :
          "from-violet-700 to-violet-600"
        )}>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 text-white shrink-0">{missionIdx + 1}</span>
            <span className="text-sm font-bold text-white flex-1">{parsed.text}</span>
          </div>
          <span className="text-[9px] text-white/70 mt-2 block">Projet: {projet.id} — {projet.label}</span>
        </div>
        <div className="px-4 py-2 flex items-center gap-2">
          {botInfo2 && <span className={cn("text-[8px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", botInfo2.gradient)}>{botInfo2.label}</span>}
          <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold text-white", rc.bg)}>{rc.badge}</span>
          <StatusBadge status={projet.status} />
        </div>
      </div>

      <div className="space-y-2">
        {mockSousTaches.map((t, i) => {
          const assigneeInfo = BOT_INFO[t.assignee];
          return (
            <div key={i} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm">
              <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r",
                t.status === "done" ? "from-emerald-600 to-emerald-500" :
                t.status === "en-cours" ? "from-amber-600 to-amber-500" :
                "from-gray-500 to-gray-400"
              )}>
                <CheckCircle2 className={cn("h-4 w-4 text-white", t.status === "done" ? "opacity-100" : "opacity-50")} />
                <span className={cn("text-xs font-bold text-white flex-1", t.status === "done" && "line-through opacity-80")}>{t.label}</span>
              </div>
              <div className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  {assigneeInfo ? (
                    <span className={cn("text-[8px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", assigneeInfo.gradient)}>{assigneeInfo.label}</span>
                  ) : (
                    <span className="text-[9px] text-gray-400">{t.assignee}</span>
                  )}
                  <StatusBadge status={t.status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {missionIdx > 0 && (
          <button onClick={() => nav.goTo("taches", ch.id, projet.id, missionIdx - 1)} className="flex-1 p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer">
            <div className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-400"><span className="text-xs font-bold text-white">← Precedente</span></div>
            <div className="px-4 py-2 text-[9px] text-gray-500 truncate">{parseMission(projet.missions[missionIdx - 1]).text}</div>
          </button>
        )}
        {missionIdx < projet.missions.length - 1 && (
          <button onClick={() => nav.goTo("taches", ch.id, projet.id, missionIdx + 1)} className="flex-1 p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer">
            <div className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-400"><span className="text-xs font-bold text-white ml-auto block text-right">Suivante →</span></div>
            <div className="px-4 py-2 text-[9px] text-gray-500 truncate text-right">{parseMission(projet.missions[missionIdx + 1]).text}</div>
          </button>
        )}
      </div>
    </div>
  );
}

// ================================================================
// TAB: OPPORTUNITES
// ================================================================

function TabOpportunites({ nav }: { nav: BlueprintNav }) {
  const allOpps: { mission: string; parsed: ReturnType<typeof parseMission>; chantier: Chantier; projet: Projet; missionIdx: number }[] = [];
  CHANTIERS.forEach((c) => {
    c.projets.forEach((p) => {
      p.missions.forEach((m, idx) => {
        const lower = m.toLowerCase();
        if (lower.includes("externe") || lower.includes("fournisseur") || lower.includes("ouverte") || lower.includes("partenaire")) {
          allOpps.push({ mission: m, parsed: parseMission(m), chantier: c, projet: p, missionIdx: idx });
        }
      });
    });
  });

  const grouped = CHANTIERS.map((c) => ({ chantier: c, opps: allOpps.filter((o) => o.chantier.id === c.id) })).filter((g) => g.opps.length > 0);

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden border-2 border-orange-200">
        <div className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center gap-2">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Opportunites Detectees</span>
          <span className="ml-auto text-xs font-bold text-white bg-white/20 px-2.5 py-1 rounded">{allOpps.length}</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-600">Missions necessitant une expertise externe ou un partenaire. Publiables sur Orbit9.</p>
        </div>
      </Card>

      {grouped.map(({ chantier: c, opps }) => {
        const Icon = c.icon;
        return (
          <Card key={c.id} className="p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className={cn("px-4 py-2 flex items-center gap-2 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
              <Icon className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white">{c.id} — {c.label}</span>
              <span className="ml-auto text-[9px] font-bold text-white bg-white/20 px-2 py-0.5 rounded">{opps.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {opps.map((o, i) => (
                <button key={i} onClick={() => nav.goTo("taches", o.chantier.id, o.projet.id, o.missionIdx)} className="w-full text-left px-4 py-3 hover:bg-orange-50/50 transition-colors group flex items-start gap-3">
                  <BotBadge code={o.parsed.botCode} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-800 group-hover:text-orange-700 transition-colors">{o.parsed.text}</div>
                    <span className="text-[9px] text-gray-400">{o.projet.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ================================================================
// TAB: EQUIPE
// ================================================================

function TabEquipe() {
  const team = [
    { role: "Carl Fugere", code: "N1 Commandant", color: "cyan", icon: Users, chantiers: ["CH-9", "CH-13"], desc: "Vision, decisions, GO/STOP.", actions: ["Valider plans avant execution", "Pioneer Circle: 9 meetings"] },
    { role: "Claude Code", code: "CTOB D1-D2 CTO", color: "violet", icon: Code2, chantiers: ["CH-1", "CH-2", "CH-4", "CH-8"], desc: "Execution technique. Code, build, deploy.", actions: ["Nettoyage code (CH-1)", "JWT auth (CH-2)", "Wiring reel (CH-4)"] },
    { role: "Gemini", code: "PM D2 Sentinelle", color: "amber", icon: Eye, chantiers: ["CH-3", "CH-5", "CH-11", "CH-12"], desc: "Generation contenu bulk. SOULs enrichis.", actions: ["7 catalogues JSON (CH-3)", "SOULs 12 bots (CH-5)"] },
    { role: "CarlOS (CEOB)", code: "CEO Bot", color: "blue", icon: Bot, chantiers: ["CH-6", "CH-10"], desc: "Onboarding, GPS, orchestration COMMAND.", actions: ["Playbooks M1/M2/M3 (CH-6)", "Orbit9 scout (CH-10)"] },
    { role: "12 Bots C-Level", code: "Specialistes", color: "gray", icon: Users, chantiers: ["Selon specialite"], desc: "Chaque bot dans son domaine.", actions: ["CFOB: Stripe + pricing", "CMOB: Marketing", "CSOB: Strategie", "CLOB: Legal", "CISOB: Securite"] },
  ];

  return (
    <div className="space-y-4">
      {team.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.role} className="p-0 overflow-hidden border shadow-sm">
            <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r", `from-${m.color}-600 to-${m.color}-500`)}>
              <Icon className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{m.role}</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">{m.code}</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-2">{m.desc}</p>
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className="text-[9px] font-bold text-gray-500">Chantiers:</span>
                {m.chantiers.map((chId) => (
                  <span key={chId} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{chId}</span>
                ))}
              </div>
              <div className="space-y-1 pt-2 border-t border-gray-100">
                {m.actions.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-gray-600">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ================================================================
// TAB: TIMELINE
// ================================================================

function TabTimeline() {
  const phases = [
    { phase: "Phase 1", label: "Fondations + Contenu", timing: "Semaine 1-2", color: "violet", chantiers: ["CH-1", "CH-2", "CH-3"], milestone: "Base solide + contenu reel" },
    { phase: "Phase 2", label: "Produit + Intelligence + Parcours", timing: "Semaine 3-5", color: "blue", chantiers: ["CH-4", "CH-5", "CH-6"], milestone: "Produit demo-ready avec bots intelligents" },
    { phase: "Phase 3", label: "Gouvernance + Communication + Commercial", timing: "Semaine 5-8", color: "pink", chantiers: ["CH-7", "CH-8", "CH-9"], milestone: "9 pioneers signes" },
    { phase: "Phase 4", label: "Reseau + Documentation", timing: "Mois 2-3", color: "orange", chantiers: ["CH-10", "CH-11"], milestone: "Effet de reseau + docs auto" },
    { phase: "Phase 5", label: "Intelligence Predictive + Scale", timing: "Mois 3-12", color: "amber", chantiers: ["CH-12", "CH-13"], milestone: "Ecosysteme autonome et profitable" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">5 phases, 13 chantiers, de fondations a ecosysteme.</p>
      {phases.map((p, i) => (
        <Card key={p.phase} className="p-0 overflow-hidden border shadow-sm">
          <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r", `from-${p.color}-600 to-${p.color}-500`)}>
            <span className="text-sm font-bold text-white">{p.phase}</span>
            <span className="text-xs text-white/80">— {p.label}</span>
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">{p.timing}</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="text-[9px] font-bold text-gray-500">Chantiers:</span>
              {p.chantiers.map((chId) => {
                const ch = CHANTIERS.find((c) => c.id === chId);
                return ch ? (
                  <span key={chId} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", `bg-${ch.color}-100 text-${ch.color}-700`)}>{chId}</span>
                ) : null;
              })}
            </div>
            <div className={cn("p-2 rounded-lg border", `bg-${p.color}-50 border-${p.color}-200`)}>
              <div className="flex items-center gap-1.5">
                <Target className={cn("h-3.5 w-3.5", `text-${p.color}-600`)} />
                <span className={cn("text-[9px] font-bold", `text-${p.color}-700`)}>Milestone:</span>
                <span className={cn("text-[9px]", `text-${p.color}-600`)}>{p.milestone}</span>
              </div>
            </div>
            {i < phases.length - 1 && <div className="flex justify-center pt-2"><ChevronRight className="h-4 w-4 text-gray-300 rotate-90" /></div>}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function BlueprintView() {
  const { setActiveView } = useFrameMaster();
  const [activeTab, setActiveTab] = useState<BlueprintTabId>("overview");
  const [chantierId, setChantierId] = useState<string | null>(null);
  const [projetId, setProjetId] = useState<string | null>(null);
  const [missionIdx, setMissionIdx] = useState<number | null>(null);

  const goTo = (tab: BlueprintTabId, chId?: string | null, pId?: string | null, mIdx?: number | null) => {
    setActiveTab(tab);
    if (chId !== undefined) setChantierId(chId);
    if (pId !== undefined) setProjetId(pId);
    if (mIdx !== undefined) setMissionIdx(mIdx);
  };

  const nav: BlueprintNav = { tab: activeTab, chantierId, projetId, missionIdx, goTo };
  const ch = chantierId ? CHANTIERS.find((c) => c.id === chantierId) || null : null;
  const projet = ch && projetId ? ch.projets.find((p) => p.id === projetId) || null : null;

  return (
    <BlueprintFrame
      title="Mon Blueprint"
      subtitle={`1 chantier · ${NB_PROJETS} projets · ${NB_MISSIONS} missions`}
      icon={Rocket}
      iconColor="text-blue-600"
      tabs={BLUEPRINT_TABS}
      activeTab={activeTab}
      onTabChange={(t) => goTo(t as BlueprintTabId)}
      onBack={() => setActiveView("dashboard")}
    >
      {activeTab === "overview" && <TabOverview nav={nav} />}
      {activeTab === "timeline" && <TabTimeline />}
      {activeTab === "chantiers" && <TabChantiers nav={nav} />}
      {activeTab === "projets" && <TabProjets nav={nav} ch={ch} />}
      {activeTab === "missions" && <TabMissionsView nav={nav} ch={ch} projet={projet} />}
      {activeTab === "taches" && <TabTaches nav={nav} ch={ch} projet={projet} missionIdx={missionIdx} />}
      {activeTab === "opportunites" && <TabOpportunites nav={nav} />}
      {activeTab === "equipes" && <TabEquipe />}
    </BlueprintFrame>
  );
}
