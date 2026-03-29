/**
 * TabParametres.tsx — Merged admin tab: Gouvernance + Autonomie Bots + Connexions API + Onboarding
 * NO sub-tabs — sections empilees avec space-y-6.
 * Replaces: TabConfig + TabSetup + TabSupport
 */

import { useState, useEffect, useCallback } from "react";
import { Settings, Bot, Shield, Link, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BlockHeader, LoadingState, EmptyState, TabSectionHeader } from "../shared/SectionComponents";
import { BOT_INFO } from "../shared/section-config";

// ================================================================
// PROPS
// ================================================================

interface Props {
  mode: string;
  tenantId?: number;
}

// ================================================================
// CONSTANTS
// ================================================================

const BOTS = [
  { code: "CEOB", name: "CarlOS", role: "CEO" },
  { code: "CTOB", name: "Tim", role: "CTO" },
  { code: "CFOB", name: "Frank", role: "CFO" },
  { code: "CMOB", name: "Mathilde", role: "CMO" },
  { code: "CSOB", name: "Simone", role: "CSO" },
  { code: "COOB", name: "Olivier", role: "COO" },
  { code: "CPOB", name: "Paco", role: "CPO" },
  { code: "CHROB", name: "Helene", role: "CHRO" },
  { code: "CINOB", name: "Ines", role: "CINO" },
  { code: "CROB", name: "Rich", role: "CRO" },
  { code: "CLOB", name: "Loulou", role: "CLO" },
  { code: "CISOB", name: "Sebastien", role: "CISO" },
] as const;

const AUTONOMY_LEVELS = [
  { value: 1, label: "Niveau 1" },
  { value: 2, label: "Niveau 2" },
  { value: 3, label: "Niveau 3" },
  { value: 4, label: "Niveau 4" },
  { value: 5, label: "Niveau 5" },
];

interface IntegrationDef {
  key: string;
  name: string;
  color: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  { key: "google_workspace", name: "Google Workspace", color: "blue" },
  { key: "crm", name: "CRM", color: "orange" },
  { key: "erp", name: "ERP", color: "indigo" },
  { key: "communication", name: "Communication", color: "violet" },
  { key: "comptabilite", name: "Comptabilite", color: "emerald" },
  { key: "ecommerce", name: "E-commerce", color: "pink" },
];

const ONBOARDING_STEPS = [
  { id: "profil", label: "Profil complete", icon: Settings },
  { id: "premier_chat", label: "Premier chat avec CarlOS", icon: Bot },
  { id: "premier_chantier", label: "Premier chantier cree", icon: Shield },
  { id: "blueprint", label: "Blueprint genere", icon: FileText },
  { id: "bot_configure", label: "Bot specialise active", icon: Bot },
  { id: "integration", label: "Integration connectee", icon: Link },
  { id: "equipe_invitee", label: "Equipe invitee", icon: Settings },
  { id: "premier_briefing", label: "Briefing consulte", icon: CheckCircle2 },
];

// ================================================================
// SECTION 1 — GOUVERNANCE
// ================================================================

function SectionGouvernance() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getGovernanceConfig()
      .then(data => {
        if (data && typeof data === "object") {
          setConfig(data as Record<string, unknown>);
        } else {
          setConfig({});
        }
      })
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, []);

  const entries = config
    ? Object.entries(config).filter(([, v]) => v !== null && v !== undefined)
    : [];

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader icon={Shield} title="Gouvernance" gradient="from-blue-600 to-blue-500" />
      <div className="px-3 py-3">
        {loading ? (
          <LoadingState />
        ) : !config || entries.length === 0 ? (
          <EmptyState message="Aucune configuration de gouvernance" />
        ) : (
          <div className="space-y-1.5">
            {entries.map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-500 font-medium">{key}</span>
                <span className="text-gray-800 font-medium text-right max-w-[60%] truncate">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================================
// SECTION 2 — AUTONOMIE DES BOTS
// ================================================================

function SectionAutonomieBots() {
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    setLoading(true);
    const result: Record<string, number> = {};
    const promises = BOTS.map(async (bot) => {
      try {
        const data = await api.getBotAutonomy(bot.code);
        result[bot.code] = Number(data?.autonomy_level) || 3;
      } catch {
        result[bot.code] = 3;
      }
    });
    await Promise.allSettled(promises);
    setLevels(result);
    setLoading(false);
  }, []);

  useEffect(() => { loadLevels(); }, [loadLevels]);

  const handleChange = async (botCode: string, level: number) => {
    setSaving(botCode);
    setLevels(prev => ({ ...prev, [botCode]: level }));
    try {
      await api.setBotAutonomy(botCode, String(level));
    } catch {
      loadLevels();
    } finally {
      setSaving(null);
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader icon={Bot} title="Autonomie des Bots" gradient="from-violet-600 to-violet-500" count={12} />
      <div className="px-3 py-3">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BOTS.map(bot => {
              const info = BOT_INFO[bot.code];
              const gradient = info?.gradient || "from-gray-600 to-gray-500";
              const currentLevel = levels[bot.code] || 3;
              const isSaving = saving === bot.code;
              return (
                <Card key={bot.code} className="p-0 overflow-hidden shadow-sm">
                  <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", gradient)}>
                    <Bot className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">{info?.label || bot.code}</span>
                  </div>
                  <div className="px-3 py-3">
                    <select
                      value={currentLevel}
                      onChange={e => handleChange(bot.code, Number(e.target.value))}
                      disabled={isSaving}
                      className={cn(
                        "w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-400",
                        isSaving && "opacity-50 cursor-wait"
                      )}
                    >
                      {AUTONOMY_LEVELS.map(n => (
                        <option key={n.value} value={n.value}>{n.label}</option>
                      ))}
                    </select>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================================
// SECTION 3 — CONNEXIONS API
// ================================================================

function SectionConnexionsAPI({ tenantId }: { tenantId?: number }) {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ key: string; ok: boolean; message: string } | null>(null);
  const tid = tenantId || 1;

  useEffect(() => {
    api.getTenantIntegrations(tid)
      .then((data: any) => {
        if (data && typeof data === "object") {
          const mapped: Record<string, boolean> = {};
          for (const key of Object.keys(data)) {
            mapped[key] = data[key]?.connected === true || data[key]?.status === "connected";
          }
          setStatuses(mapped);
        }
      })
      .catch(() => {});
  }, [tid]);

  const handleTest = async (key: string) => {
    setTesting(key);
    setTestResult(null);
    try {
      const result = await api.testIntegration(tid, key);
      setTestResult({ key, ok: result.ok, message: result.message || (result.ok ? "Connexion OK" : "Echec") });
    } catch {
      setTestResult({ key, ok: false, message: "Test echoue — endpoint non disponible" });
    } finally {
      setTesting(null);
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader icon={Link} title="Connexions API" gradient="from-teal-600 to-teal-500" />
      <div className="px-3 py-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INTEGRATIONS.map(integ => {
            const isConnected = statuses[integ.key] === true;
            return (
              <Card key={integ.key} className="p-0 overflow-hidden shadow-sm">
                <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", `from-${integ.color}-600 to-${integ.color}-500`)}>
                  <Link className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{integ.name}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border ml-auto",
                    isConnected
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  )}>
                    {isConnected ? "CONNECTE" : "NON CONNECTE"}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-2">
                  <button className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Configurer</button>
                  <button
                    onClick={() => handleTest(integ.key)}
                    disabled={testing === integ.key}
                    className={cn(
                      "text-xs text-gray-500 hover:bg-gray-50 px-2 py-1 rounded",
                      testing === integ.key && "opacity-50 cursor-wait"
                    )}
                  >
                    {testing === integ.key ? "..." : "Tester"}
                  </button>
                </div>
                {testResult?.key === integ.key && (
                  <div className="px-3 pb-2">
                    <span className={cn(
                      "text-[9px] font-medium",
                      testResult.ok ? "text-emerald-600" : "text-red-500"
                    )}>
                      {testResult.message}
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ================================================================
// SECTION 4 — ONBOARDING
// ================================================================

function SectionOnboarding({ tenantId }: { tenantId?: number }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const tid = tenantId || 1;

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.getEntrepriseProfil(tid).catch(() => null),
      api.listChantiers().catch(() => ({ chantiers: [] })),
      api.listBots().catch(() => []),
      api.getTenantIntegrations(tid).catch(() => null),
      api.getUsers().catch(() => ({ users: [] })),
      api.listBriefings(undefined, undefined, 1).catch(() => ({ briefings: [] })),
    ]).then(([profilRes, chantiersRes, botsRes, integRes, usersRes, briefRes]) => {
      const done = new Set<string>();

      const profil = (profilRes as PromiseFulfilledResult<any>)?.value?.profil;
      if (profil?.nom) done.add("profil");

      const chantiers = (chantiersRes as PromiseFulfilledResult<any>)?.value?.chantiers || [];
      if (Array.isArray(chantiers) && chantiers.length > 0) done.add("premier_chantier");

      const bots = (botsRes as PromiseFulfilledResult<any>)?.value;
      if (Array.isArray(bots) && bots.length > 0) done.add("bot_configure");

      const integ = (integRes as PromiseFulfilledResult<any>)?.value;
      if (integ && typeof integ === "object") {
        const hasConnected = Object.values(integ).some(
          (v: any) => v?.connected === true || v?.status === "connected"
        );
        if (hasConnected) done.add("integration");
      }

      const users = (usersRes as PromiseFulfilledResult<any>)?.value?.users || [];
      if (Array.isArray(users) && users.length > 1) done.add("equipe_invitee");

      const briefs = (briefRes as PromiseFulfilledResult<any>)?.value?.briefings || [];
      if (Array.isArray(briefs) && briefs.length > 0) done.add("premier_briefing");

      setCompleted(done);
      setLoading(false);
    });
  }, [tid]);

  const completedCount = completed.size;
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader icon={CheckCircle2} title="Progression Onboarding" gradient="from-emerald-600 to-emerald-500" />
      <div className="px-3 py-3">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-3">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{completedCount}/{totalSteps} etapes</span>
                <span className="text-xs font-bold text-gray-800">{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              {ONBOARDING_STEPS.map(step => {
                const isDone = completed.has(step.id);
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3 py-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      isDone ? "bg-emerald-100" : "bg-gray-100"
                    )}>
                      <Icon className={cn("h-3.5 w-3.5", isDone ? "text-emerald-600" : "text-gray-400")} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium flex-1",
                      isDone ? "text-gray-800" : "text-gray-500"
                    )}>
                      {step.label}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                      isDone
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    )}>
                      {isDone ? "DONE" : "A FAIRE"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================================
// TABPARAMETRES — Composant principal (sections empilees)
// ================================================================

export function TabParametres({ mode, tenantId }: Props) {
  return (
    <div className="space-y-6">
      <TabSectionHeader icon={Settings} title="Paramètres" subtitle="Gouvernance, bots et connexions" gradient="from-gray-700 to-gray-600" />
      <SectionGouvernance />
      <SectionAutonomieBots />
      <SectionConnexionsAPI tenantId={tenantId} />
      <SectionOnboarding tenantId={tenantId} />
    </div>
  );
}
