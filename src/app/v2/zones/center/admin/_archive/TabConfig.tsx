/**
 * TabConfig.tsx — Configuration admin: Gouvernance, Autonomie Bots, Info Systeme
 * God Mode: tout visible. Instance: gouvernance + autonomie scopees.
 */

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Bot,
  Server,
  Loader2,
  Inbox,
  ChevronDown,
  Activity,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BOT_INFO } from "../shared/section-config";
import { BotBadge } from "../shared/SectionComponents";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "gouvernance", label: "Gouvernance", icon: ShieldCheck },
  { id: "autonomie", label: "Autonomie Bots", icon: Bot },
  { id: "systeme", label: "Info Systeme", icon: Server },
] as const;

// ═══════════════════════════════════════
// Bot definitions (12 bots)
// ═══════════════════════════════════════

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
  { value: "1", label: "1 — Consultatif" },
  { value: "2", label: "2 — Assisté" },
  { value: "3", label: "3 — Supervisé" },
  { value: "4", label: "4 — Autonome" },
  { value: "5", label: "5 — Plein pouvoir" },
];

// ═══════════════════════════════════════
// Gouvernance sub-tab
// ═══════════════════════════════════════

function GouvernancePanel() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getGovernanceConfig()
      .then(data => {
        if (data && typeof data === "object") {
          setConfig(data as Record<string, unknown>);
        } else {
          setConfig({});
        }
      })
      .catch((err: Error) => {
        setError(err.message || "Erreur de chargement");
        setConfig(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-red-600">
          <Inbox className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </Card>
    );
  }

  if (!config || Object.keys(config).length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-gray-400">
        <Inbox className="h-8 w-8" />
        <span className="text-sm">Aucune configuration de gouvernance</span>
      </div>
    );
  }

  const entries = Object.entries(config).filter(
    ([, v]) => v !== null && v !== undefined
  );

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-bold text-gray-800">Configuration Gouvernance</span>
      </div>
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
    </Card>
  );
}

// ═══════════════════════════════════════
// Autonomie Bots sub-tab
// ═══════════════════════════════════════

function AutonomieBotsPanel() {
  const [levels, setLevels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    setLoading(true);
    const result: Record<string, string> = {};
    const promises = BOTS.map(async (bot) => {
      try {
        const data = await api.getBotAutonomy(bot.code);
        result[bot.code] = data?.autonomy_level || "3";
      } catch {
        result[bot.code] = "3";
      }
    });
    await Promise.allSettled(promises);
    setLevels(result);
    setLoading(false);
  }, []);

  useEffect(() => { loadLevels(); }, [loadLevels]);

  const handleChange = async (botCode: string, level: string) => {
    setSaving(botCode);
    setLevels(prev => ({ ...prev, [botCode]: level }));
    try {
      await api.setBotAutonomy(botCode, level);
    } catch {
      // Revert on failure — reload
      loadLevels();
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {BOTS.map(bot => {
        const currentLevel = levels[bot.code] || "3";
        const isSaving = saving === bot.code;
        const botInfo = BOT_INFO[bot.code];
        const gradient = botInfo?.gradient || "from-gray-600 to-gray-500";
        return (
          <Card key={bot.code} className="p-0 overflow-hidden shadow-sm">
            {/* Header gradient — couleur du bot */}
            <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", gradient)}>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {bot.name.charAt(0)}
              </div>
              <span className="text-sm font-bold text-white">{bot.name}</span>
              <BotBadge code={bot.code} />
            </div>
            {/* Body */}
            <div className="px-3 py-3">
              <div className="text-[9px] text-gray-400 mb-2">{bot.code} — {bot.role}</div>
              <div className="relative">
                <select
                  value={currentLevel}
                  onChange={e => handleChange(bot.code, e.target.value)}
                  disabled={isSaving}
                  className={cn(
                    "w-full appearance-none text-xs px-2.5 py-1.5 pr-7 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors",
                    isSaving && "opacity-50 cursor-wait"
                  )}
                >
                  {AUTONOMY_LEVELS.map(lvl => (
                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// Info Systeme sub-tab
// ═══════════════════════════════════════

function InfoSystemePanel({ mode }: { mode: "god" | "instance" }) {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [systemStatus, setSystemStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetches: Promise<void>[] = [
      api.health()
        .then(data => { setHealth(data as unknown as Record<string, unknown>); })
        .catch(() => { setHealth(null); }),
    ];

    if (mode === "god") {
      fetches.push(
        api.getSystemStatus()
          .then(data => { setSystemStatus(data as Record<string, unknown>); })
          .catch(() => { setSystemStatus(null); })
      );
    }

    Promise.allSettled(fetches).finally(() => setLoading(false));
  }, [mode]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Health card */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="text-sm font-bold text-gray-800">Health</span>
        </div>
        {health ? (
          <div className="space-y-1.5">
            {(health as any).version && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Version</span>
                <span className="font-medium text-gray-800">{String((health as any).version)}</span>
              </div>
            )}
            {(health as any).uptime && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Uptime
                </span>
                <span className="font-medium text-gray-800">{String((health as any).uptime)}</span>
              </div>
            )}
            {(health as any).status && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className={cn(
                  "font-medium flex items-center gap-1",
                  (health as any).status === "ok" || (health as any).status === "healthy"
                    ? "text-green-600" : "text-red-600"
                )}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {String((health as any).status)}
                </span>
              </div>
            )}
            {/* Render any other health fields */}
            {Object.entries(health)
              .filter(([k]) => !["version", "uptime", "status"].includes(k))
              .map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500 text-xs">
            <Inbox className="h-4 w-4" />
            <span>Impossible de recuperer le health check</span>
          </div>
        )}
      </Card>

      {/* System status — God mode only */}
      {mode === "god" && systemStatus && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-bold text-gray-800">Status Systeme (God)</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(systemStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-500 font-medium">{key}</span>
                <span className="text-gray-800 font-medium text-right max-w-[60%] truncate">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// TabConfig — Composant principal
// ═══════════════════════════════════════

export function TabConfig({ mode, tenantId }: Props) {
  const [sub, setSub] = useState<string>("gouvernance");

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                sub === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {sub === "gouvernance" && <GouvernancePanel />}
      {sub === "autonomie" && <AutonomieBotsPanel />}
      {sub === "systeme" && <InfoSystemePanel mode={mode} />}
    </div>
  );
}
