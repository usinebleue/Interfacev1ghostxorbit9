/**
 * TabSetup.tsx — Configuration et onboarding
 * Sous-tabs: Profil Client | Connexions API | Onboarding
 */

import { useState, useEffect } from "react";
import {
  Building2,
  Globe,
  Users,
  MessageCircle,
  Calculator,
  ShoppingCart,
  Inbox,
  Loader2,
  CheckCircle2,
  Circle,
  Plug,
  ClipboardList,
  TestTube,
  Settings,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "profil", label: "Profil Client" },
  { id: "connexions", label: "Connexions API" },
  { id: "onboarding", label: "Onboarding" },
] as const;

// ═══════════════════════════════════════
// Sous-tab: Profil Client
// ═══════════════════════════════════════

function SubProfil({ mode, tenantId }: { mode: "god" | "instance"; tenantId?: number }) {
  const [profil, setProfil] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<number | undefined>(tenantId);
  const [tenants, setTenants] = useState<any[]>([]);

  // God mode: load tenant list for selector
  useEffect(() => {
    if (mode === "god") {
      api.getTenants()
        .then(data => {
          const list = Array.isArray(data) ? data : (data as any)?.tenants || [];
          setTenants(list);
          if (!selectedTenant && list.length > 0) {
            setSelectedTenant(list[0].id);
          }
        })
        .catch(() => setTenants([]));
    }
  }, [mode]);

  // Load profil when tenant changes
  useEffect(() => {
    const tid = selectedTenant || tenantId || 1;
    setLoading(true);
    api.getEntrepriseProfil(tid)
      .then(data => {
        const p = data?.profil || null;
        setProfil(p);
        if (p) {
          setDraft({
            nom: p.nom || "",
            secteur: p.secteur || p.industrie || "",
            taille: p.taille || p.nb_employes || "",
            region: p.region || p.localisation || "",
          });
        }
        setError(null);
      })
      .catch(() => {
        setProfil(null);
        setError("Endpoint non disponible");
      })
      .finally(() => setLoading(false));
  }, [selectedTenant, tenantId]);

  const handleSave = async () => {
    const tid = selectedTenant || tenantId || 1;
    setSaving(true);
    try {
      await api.saveEntrepriseProfil({
        nom: draft.nom,
        secteur: draft.secteur,
        taille: draft.taille,
        region: draft.region,
      } as any, tid);
      setEditing(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
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
    <div className="space-y-3">
      {/* God mode: tenant selector */}
      {mode === "god" && tenants.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Tenant:</span>
          <select
            value={selectedTenant || ""}
            onChange={e => setSelectedTenant(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {tenants.map((t: any) => (
              <option key={t.id} value={t.id}>{t.nom || t.slug}</option>
            ))}
          </select>
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
          <Building2 className="h-8 w-8" />
          <span className="text-sm">{error}</span>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Profil entreprise</span>
            </div>
            {mode === "instance" && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-[9px] font-medium text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                Modifier
              </button>
            )}
          </div>
          <div className="p-4 space-y-3">

          {[
            { key: "nom", label: "Nom de l'entreprise" },
            { key: "secteur", label: "Secteur d'activite" },
            { key: "taille", label: "Taille (employes)" },
            { key: "region", label: "Region" },
          ].map(field => (
            <div key={field.key} className="space-y-0.5">
              <label className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">{field.label}</label>
              {editing ? (
                <input
                  type="text"
                  value={draft[field.key] || ""}
                  onChange={e => setDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              ) : (
                <p className="text-sm text-gray-800">
                  {draft[field.key] || <span className="text-gray-400 italic">Non renseigne</span>}
                </p>
              )}
            </div>
          ))}

          {editing && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Sous-tab: Connexions API
// ═══════════════════════════════════════

interface IntegrationDef {
  key: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    key: "google_workspace",
    name: "Google Workspace",
    description: "Calendar, Drive, Docs",
    icon: Globe,
    gradient: "from-blue-600 to-blue-500",
  },
  {
    key: "crm",
    name: "CRM",
    description: "HubSpot, Pipedrive, Salesforce",
    icon: Users,
    gradient: "from-orange-600 to-orange-500",
  },
  {
    key: "erp",
    name: "ERP",
    description: "SAP, Odoo, NetSuite",
    icon: Building2,
    gradient: "from-indigo-600 to-indigo-500",
  },
  {
    key: "communication",
    name: "Communication",
    description: "Slack, Teams, Email SMTP",
    icon: MessageCircle,
    gradient: "from-green-600 to-green-500",
  },
  {
    key: "comptabilite",
    name: "Comptabilite",
    description: "QuickBooks, Xero",
    icon: Calculator,
    gradient: "from-emerald-600 to-emerald-500",
  },
  {
    key: "ecommerce",
    name: "E-commerce",
    description: "Shopify",
    icon: ShoppingCart,
    gradient: "from-purple-600 to-purple-500",
  },
];

function SubConnexions({ tenantId }: { tenantId?: number }) {
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

  const handleConfigure = (key: string) => {
    alert(`Configuration via Setup > Connexions API — ${key}`);
  };

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {INTEGRATIONS.map(integ => {
        const Icon = integ.icon;
        const isConnected = statuses[integ.key] === true;
        return (
          <Card key={integ.key} className="p-0 overflow-hidden">
            <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", integ.gradient)}>
              <Icon className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{integ.name}</span>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded border ml-auto",
                isConnected
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              )}>
                {isConnected ? "CONNECTE" : "NON CONNECTE"}
              </span>
            </div>
            <div className="px-3 py-3 space-y-2">
              <p className="text-[9px] text-gray-500">{integ.description}</p>
              {testResult?.key === integ.key && (
                <p className={cn(
                  "text-[9px] font-medium",
                  testResult.ok ? "text-green-600" : "text-red-500"
                )}>
                  {testResult.message}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfigure(integ.key)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configurer
                </button>
                <button
                  onClick={() => handleTest(integ.key)}
                  disabled={testing === integ.key}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {testing === integ.key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <TestTube className="h-3.5 w-3.5" />
                  )}
                  Tester
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// Sous-tab: Onboarding
// ═══════════════════════════════════════

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "profil", label: "Profil complete", description: "Nom, secteur, taille et region renseignes" },
  { id: "premier_chat", label: "Premier chat", description: "Premiere conversation avec CarlOS" },
  { id: "premier_chantier", label: "Premier chantier", description: "Un chantier strategique cree" },
  { id: "blueprint", label: "Blueprint cree", description: "Blueprint departement genere" },
  { id: "bot_configure", label: "Bot configure", description: "Au moins un bot specialise active" },
  { id: "integration", label: "Integration connectee", description: "Une connexion API configuree" },
  { id: "equipe_invitee", label: "Equipe invitee", description: "Au moins un membre invite" },
  { id: "premier_briefing", label: "Premier briefing", description: "Briefing quotidien consulte" },
];

function SubOnboarding({ tenantId }: { tenantId?: number }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const tid = tenantId || 1;

  useEffect(() => {
    // Try to determine which steps are completed by checking various endpoints
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

      // Profil
      const profil = (profilRes as PromiseFulfilledResult<any>)?.value?.profil;
      if (profil?.nom) done.add("profil");

      // Chantiers
      const chantiers = (chantiersRes as PromiseFulfilledResult<any>)?.value?.chantiers || [];
      if (Array.isArray(chantiers) && chantiers.length > 0) done.add("premier_chantier");

      // Bots
      const bots = (botsRes as PromiseFulfilledResult<any>)?.value;
      if (Array.isArray(bots) && bots.length > 0) done.add("bot_configure");

      // Integrations
      const integ = (integRes as PromiseFulfilledResult<any>)?.value;
      if (integ && typeof integ === "object") {
        const hasConnected = Object.values(integ).some(
          (v: any) => v?.connected === true || v?.status === "connected"
        );
        if (hasConnected) done.add("integration");
      }

      // Users (equipe)
      const users = (usersRes as PromiseFulfilledResult<any>)?.value?.users || [];
      if (Array.isArray(users) && users.length > 1) done.add("equipe_invitee");

      // Briefings
      const briefs = (briefRes as PromiseFulfilledResult<any>)?.value?.briefings || [];
      if (Array.isArray(briefs) && briefs.length > 0) done.add("premier_briefing");

      setCompleted(done);
      setLoading(false);
    });
  }, [tid]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  const completedCount = completed.size;
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
          <ClipboardList className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Progression onboarding</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-blue-800 ml-auto">{completedCount}/{totalSteps}</span>
        </div>
        <div className="px-3 py-3">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-500 mt-1">{progressPct}% complete</p>
        </div>
      </Card>

      {/* Checklist */}
      <div className="space-y-2">
        {ONBOARDING_STEPS.map(step => {
          const isDone = completed.has(step.id);
          return (
            <Card key={step.id} className="p-3 flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                isDone ? "bg-emerald-100" : "bg-gray-100"
              )}>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium truncate",
                  isDone ? "text-gray-800" : "text-gray-500"
                )}>
                  {step.label}
                </div>
                <div className="text-[9px] text-gray-400">{step.description}</div>
              </div>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                isDone
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              )}>
                {isDone ? "DONE" : "A FAIRE"}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TabSetup — Composant principal
// ═══════════════════════════════════════

export function TabSetup({ mode, tenantId }: Props) {
  const [sub, setSub] = useState<string>("profil");

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sub === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {sub === "profil" && <SubProfil mode={mode} tenantId={tenantId} />}
      {sub === "connexions" && <SubConnexions tenantId={tenantId} />}
      {sub === "onboarding" && <SubOnboarding tenantId={tenantId} />}
    </div>
  );
}
