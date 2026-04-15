/**
 * AdminView.tsx — Section Admin V3 (God Mode only)
 *
 * V3 NATIF — Appels API directs + design V3 (hero, DocForge sidebar, KPI cards).
 * AUCUN import de tabs V2. Tout est rendu avec les patterns V3.
 *
 * 6 sections: Dashboard, Instances, Utilisateurs, Packages, Monitoring, Connaissances
 */

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Server, Users, Package, Activity, BookOpen, Shield,
  Plus, Trash2, CheckCircle2, XCircle, Mail,
  Globe, CreditCard, Zap, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import type { SectionProps } from "../core/types";
import { api } from "../../v2/api/client";
import { LivingHero } from "./shared/LivingHero";

// ═══ Types ═══

type AdminSection = "dashboard" | "instances" | "users" | "packages" | "monitoring" | "knowledge";

interface SidebarItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
}

// ═══ Card wrapper — pattern V3 obligatoire ═══

function V3Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all", className)}>
      {children}
    </div>
  );
}

function V3CardHeader({ icon: Icon, title, badge, rightSlot }: { icon: React.ElementType; title: string; badge?: string | number; rightSlot?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
      <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
      <span className="text-sm font-bold text-gray-900">{title}</span>
      {badge !== undefined && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{badge}</span>}
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </div>
  );
}

// ═══ SECTION 1 — Dashboard ═══

function AdminDashboard({ onNav }: { onNav: (s: AdminSection) => void }) {
  const [kpis, setKpis] = useState<{ label: string; value: string | number; sub: string; color: string; icon: React.ElementType }[]>([]);
  const [health, setHealth] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tenants, users, members, matches, balance, status] = await Promise.allSettled([
          api.getTenants(), api.getUsers(), api.listOrbit9Members(),
          api.listOrbit9Matches(), api.getUtBalance(), api.getSystemStatus(),
        ]);
        setKpis([
          { label: "Instances", value: tenants.status === "fulfilled" ? (tenants.value?.tenants?.length ?? 0) : "—", sub: "Tenants actifs", color: "blue", icon: Server },
          { label: "Utilisateurs", value: users.status === "fulfilled" ? (users.value?.users?.length ?? 0) : "—", sub: "Comptes créés", color: "emerald", icon: Users },
          { label: "Orbit9", value: members.status === "fulfilled" ? (Array.isArray(members.value) ? members.value.length : 0) : "—", sub: "Membres réseau", color: "teal", icon: Globe },
          { label: "Matches", value: matches.status === "fulfilled" ? (Array.isArray(matches.value) ? matches.value.length : 0) : "—", sub: "Jumelages actifs", color: "amber", icon: Zap },
          { label: "TimeTokens", value: balance.status === "fulfilled" ? (balance.value?.balance ?? 0) : "—", sub: "Solde UT", color: "purple", icon: CreditCard },
        ]);
        if (status.status === "fulfilled" && status.value) {
          const s = status.value as Record<string, unknown>;
          setHealth({ API: true, PostgreSQL: !!s.database, LiveKit: !!s.livekit, Nginx: true });
        }
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-xs text-gray-400 p-4">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {kpis.map(k => (
          <V3Card key={k.label}>
            <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", `from-${k.color}-600 to-${k.color}-500`)}>
              <k.icon className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{k.label}</span>
            </div>
            <div className="px-3 py-2">
              <div className={cn("text-2xl font-bold", `text-${k.color}-600`)}>{k.value}</div>
              <div className="text-[10px] text-gray-500">{k.sub}</div>
            </div>
          </V3Card>
        ))}
      </div>

      {health && (
        <V3Card>
          <V3CardHeader icon={Activity} title="Santé Système" />
          <div className="px-4 py-3 flex items-center gap-4 flex-wrap">
            {Object.entries(health).map(([svc, ok]) => (
              <div key={svc} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", ok ? "bg-emerald-500" : "bg-red-500")} />
                <span className="text-xs text-gray-700 font-medium">{svc}</span>
              </div>
            ))}
          </div>
        </V3Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        {([
          { id: "instances" as const, label: "Gérer Instances", icon: Server },
          { id: "users" as const, label: "Gérer Utilisateurs", icon: Users },
          { id: "packages" as const, label: "Packages & Pricing", icon: Package },
          { id: "monitoring" as const, label: "Monitoring", icon: Activity },
          { id: "knowledge" as const, label: "Centre d'aide", icon: BookOpen },
        ] as const).map(s => (
          <button key={s.id} onClick={() => onNav(s.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
            <s.icon className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-700">{s.label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ SECTION 2 — Instances ═══

function AdminInstances() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nom: "", slug: "", tier_code: "pioneer", is_active: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const res = await api.getTenants(); setTenants(res?.tenants || []); } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.nom || !form.slug) return;
    setSaving(true);
    try { await api.createTenant(form); setShowCreate(false); setForm({ nom: "", slug: "", tier_code: "pioneer", is_active: true }); load(); } catch { /* silent */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette instance?")) return;
    try { await api.deleteTenant(id); load(); } catch { /* silent */ }
  };

  if (loading) return <div className="text-xs text-gray-400 p-4">Chargement...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800">{tenants.length} instance{tenants.length > 1 ? "s" : ""}</span>
        <button onClick={() => setShowCreate(!showCreate)} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer">
          <Plus className="h-3.5 w-3.5" /> Nouvelle instance
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom" className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug (unique)" className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
          </div>
          <div className="flex items-center gap-2">
            <select value={form.tier_code} onChange={e => setForm({ ...form, tier_code: e.target.value })} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="free">Free</option><option value="solo">Solo</option><option value="direction">Direction</option><option value="csuite">C-Suite</option><option value="pioneer">Pioneer</option>
            </select>
            <button onClick={handleCreate} disabled={saving} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium cursor-pointer disabled:opacity-50">{saving ? "..." : "Créer"}</button>
            <button onClick={() => setShowCreate(false)} className="text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {tenants.map((t: any) => (
          <div key={t.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition-all">
            <span className={cn("w-2 h-2 rounded-full shrink-0", t.is_active ? "bg-emerald-500" : "bg-gray-300")} />
            <span className="text-xs font-bold text-gray-900 flex-1">{t.nom || t.name}</span>
            <span className="text-[9px] text-gray-400 font-mono">{t.slug}</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{t.tier_code}</span>
            <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ SECTION 3 — Utilisateurs ═══

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("membre");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.allSettled([api.getUsers(), api.getActiveSessions()]);
      if (u.status === "fulfilled") setUsers(u.value?.users || []);
      if (s.status === "fulfilled") setSessions(Array.isArray(s.value) ? s.value : []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const ROLE_COLOR: Record<string, string> = { admin: "purple", manager: "blue", membre: "gray", invite: "amber" };

  const handleInvite = async () => {
    if (!email) return;
    setSending(true);
    try { await api.inviteUser(email, role); setMsg({ type: "ok", text: `Invitation envoyée à ${email}` }); setEmail(""); load(); }
    catch { setMsg({ type: "err", text: "Erreur lors de l'envoi" }); }
    setSending(false);
  };

  if (loading) return <div className="text-xs text-gray-400 p-4">Chargement...</div>;

  return (
    <div className="space-y-4">
      <V3Card>
        <V3CardHeader icon={Mail} title="Inviter un utilisateur" />
        <div className="px-4 py-3 flex items-center gap-2">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com" className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
          <select value={role} onChange={e => setRole(e.target.value)} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
            <option value="admin">Admin</option><option value="manager">Manager</option><option value="membre">Membre</option>
          </select>
          <button onClick={handleInvite} disabled={sending} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium cursor-pointer disabled:opacity-50">{sending ? "..." : "Inviter"}</button>
        </div>
        {msg && <div className={cn("px-4 py-2 text-[10px] font-medium", msg.type === "ok" ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50")}>{msg.text}</div>}
      </V3Card>

      <div className="space-y-1.5">
        <span className="text-xs font-bold text-gray-800">{users.length} utilisateur{users.length > 1 ? "s" : ""}</span>
        {users.map((u: any) => {
          const c = ROLE_COLOR[u.role] || "gray";
          return (
            <div key={u.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition-all">
              <span className="text-xs font-bold text-gray-900 flex-1">{u.email || u.nom || `User #${u.id}`}</span>
              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded", `bg-${c}-50 text-${c}-700`)}>{u.role}</span>
              <span className="text-[9px] text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString("fr-CA") : ""}</span>
            </div>
          );
        })}
      </div>

      {sessions.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-800">{sessions.length} session{sessions.length > 1 ? "s" : ""} active{sessions.length > 1 ? "s" : ""}</span>
          {sessions.slice(0, 10).map((s: any) => (
            <div key={s.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center gap-3 text-[10px] hover:shadow-md hover:border-blue-200 transition-all">
              <span className="font-medium text-gray-700 flex-1">{s.email || s.user_id}</span>
              <span className="text-gray-400 font-mono">{s.ip_address}</span>
              <button onClick={async () => { await api.revokeSession(s.id); load(); }} className="text-red-500 hover:text-red-700 cursor-pointer text-[9px] font-bold">Révoquer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ SECTION 4 — Packages & Pricing ═══

function AdminPackages() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ tenant_id: "", tier_code: "pioneer", type_acteur: "MFG", niveau: "coequipier", prix_mensuel: "", ut_inclus: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, o, b, tx] = await Promise.allSettled([api.getSubscriptionTiers(), api.listPricingOverrides(), api.getUtBalance(), api.getUtTransactions()]);
      if (t.status === "fulfilled") setTiers(Array.isArray(t.value) ? t.value : []);
      if (o.status === "fulfilled") setOverrides(Array.isArray(o.value) ? o.value : []);
      if (b.status === "fulfilled") setBalance(b.value);
      if (tx.status === "fulfilled") setTransactions(Array.isArray(tx.value) ? tx.value : []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateOverride = async () => {
    setSaving(true);
    try {
      await api.createPricingOverride({ tenant_id: parseInt(form.tenant_id), tier_code: form.tier_code, type_acteur: form.type_acteur, niveau: form.niveau, prix_mensuel: parseFloat(form.prix_mensuel) || 0, ut_inclus: parseInt(form.ut_inclus) || 0, description: form.description });
      setShowCreate(false);
      setForm({ tenant_id: "", tier_code: "pioneer", type_acteur: "MFG", niveau: "coequipier", prix_mensuel: "", ut_inclus: "", description: "" });
      load();
    } catch { /* silent */ }
    setSaving(false);
  };

  if (loading) return <div className="text-xs text-gray-400 p-4">Chargement...</div>;

  return (
    <div className="space-y-4">
      <V3Card>
        <V3CardHeader icon={Package} title="Plans disponibles" badge={tiers.length} />
        <div className="px-4 py-3 space-y-1.5">
          {tiers.map((t: any) => (
            <div key={t.code || t.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50">
              <span className={cn("w-2 h-2 rounded-full shrink-0", t.is_active !== false ? "bg-emerald-500" : "bg-gray-300")} />
              <span className="text-xs font-bold text-gray-900 w-20">{t.code || t.nom}</span>
              <span className="text-xs text-gray-600 flex-1">{t.nom || t.name}</span>
              <span className="text-[10px] font-bold text-emerald-700">{t.prix_mensuel ? `${t.prix_mensuel}$/mois` : "Gratuit"}</span>
              <span className="text-[9px] text-gray-400">{t.ut_inclus || 0} UT</span>
              <span className="text-[9px] text-gray-400">{t.max_bots || "∞"} bots</span>
            </div>
          ))}
          {tiers.length === 0 && <div className="text-[10px] text-gray-400">Aucun plan configuré</div>}
        </div>
      </V3Card>

      <V3Card>
        <V3CardHeader icon={CreditCard} title="Overrides de prix" rightSlot={
          <button onClick={() => setShowCreate(!showCreate)} className="text-[10px] bg-blue-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Créer
          </button>
        } />

        {showCreate && (
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/30 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} placeholder="Tenant ID" className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
              <select value={form.tier_code} onChange={e => setForm({ ...form, tier_code: e.target.value })} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                <option value="free">Free</option><option value="solo">Solo</option><option value="direction">Direction</option><option value="csuite">C-Suite</option><option value="pioneer">Pioneer</option>
              </select>
              <select value={form.type_acteur} onChange={e => setForm({ ...form, type_acteur: e.target.value })} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                <option value="MFG">MFG</option><option value="FEQ">FEQ</option><option value="DEV">DEV</option><option value="INT">INT</option><option value="DST">DST</option><option value="ORG">ORG</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input value={form.prix_mensuel} onChange={e => setForm({ ...form, prix_mensuel: e.target.value })} placeholder="Prix/mois ($)" type="number" className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
              <input value={form.ut_inclus} onChange={e => setForm({ ...form, ut_inclus: e.target.value })} placeholder="UT inclus" type="number" className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCreateOverride} disabled={saving} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium cursor-pointer disabled:opacity-50">{saving ? "..." : "Créer l'override"}</button>
              <button onClick={() => setShowCreate(false)} className="text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer">Annuler</button>
            </div>
          </div>
        )}

        <div className="px-4 py-3 space-y-1.5">
          {overrides.map((o: any) => (
            <div key={o.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50">
              <span className="text-[10px] text-gray-400 font-mono w-8">#{o.tenant_id}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{o.tier_code}</span>
              <span className="text-[9px] text-gray-500">{o.type_acteur}</span>
              <span className="text-xs font-bold text-emerald-700 flex-1">{o.prix_mensuel}$/mois</span>
              <span className="text-[9px] text-gray-400">{o.ut_inclus} UT</span>
              <button onClick={async () => { await api.deletePricingOverride(o.id); load(); }} className="text-gray-300 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {overrides.length === 0 && <div className="text-[10px] text-gray-400">Aucun override configuré</div>}
        </div>
      </V3Card>

      {balance && (
        <V3Card>
          <V3CardHeader icon={Zap} title="Usage TimeTokens" />
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-purple-600">{balance.balance ?? 0}</span>
              <span className="text-[10px] text-gray-500">UT disponibles</span>
            </div>
            {transactions.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-600">Dernières transactions</span>
                {transactions.slice(0, 8).map((tx: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] px-1 py-0.5">
                    <span className="text-gray-400 w-16">{tx.created_at ? new Date(tx.created_at).toLocaleDateString("fr-CA") : ""}</span>
                    <span className={cn("font-bold w-12 text-right", tx.montant > 0 ? "text-emerald-600" : tx.montant < 0 ? "text-red-600" : "text-gray-400")}>{tx.montant > 0 ? "+" : ""}{tx.montant}</span>
                    <span className="text-gray-600 flex-1 truncate">{tx.description || tx.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </V3Card>
      )}
    </div>
  );
}

// ═══ SECTION 5 — Monitoring ═══

function AdminMonitoring() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, e] = await Promise.allSettled([api.getSystemStatus(), api.listAuthEvents(50)]);
        if (s.status === "fulfilled") setHealth(s.value as Record<string, unknown>);
        if (e.status === "fulfilled") setEvents(Array.isArray(e.value) ? e.value : []);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-xs text-gray-400 p-4">Chargement...</div>;

  const services = [
    { name: "API FastAPI", ok: true, icon: Zap },
    { name: "PostgreSQL", ok: !!(health as any)?.database, icon: Server },
    { name: "LiveKit", ok: !!(health as any)?.livekit, icon: Activity },
    { name: "Nginx", ok: true, icon: Globe },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {services.map(s => (
          <div key={s.name} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2 hover:shadow-md hover:border-blue-200 transition-all">
            <s.icon className={cn("h-4 w-4", s.ok ? "text-emerald-500" : "text-red-500")} />
            <span className="text-xs font-bold text-gray-900 flex-1">{s.name}</span>
            {s.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
          </div>
        ))}
      </div>

      <V3Card>
        <V3CardHeader icon={Activity} title="Distribution API" />
        <div className="px-4 py-3 space-y-2">
          {[
            { tier: "T0 Cache", pct: 35, color: "emerald", cost: "Gratuit" },
            { tier: "T1 Gemini Flash", pct: 30, color: "blue", cost: "Gratuit" },
            { tier: "T2 Gemini Pro", pct: 20, color: "cyan", cost: "Gratuit" },
            { tier: "T3 Claude Sonnet", pct: 10, color: "amber", cost: "~$0.03/req" },
            { tier: "T4 Claude Opus", pct: 5, color: "red", cost: "~$0.30/req" },
          ].map(t => (
            <div key={t.tier} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-700 w-28 font-medium">{t.tier}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", `bg-${t.color}-500`)} style={{ width: `${t.pct}%` }} />
              </div>
              <span className="text-[9px] font-bold text-gray-600 w-6 text-right">{t.pct}%</span>
              <span className="text-[9px] text-gray-400 w-16 text-right">{t.cost}</span>
            </div>
          ))}
        </div>
      </V3Card>

      <V3Card>
        <V3CardHeader icon={Shield} title="Événements de sécurité" badge={events.length} />
        <div className="px-4 py-2 max-h-60 overflow-y-auto space-y-0.5">
          {events.slice(0, 20).map((e: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[10px] px-1 py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-400 w-24 shrink-0">{e.created_at ? new Date(e.created_at).toLocaleString("fr-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
              <span className="text-gray-700 flex-1 truncate">{e.action || e.event_type}</span>
              <span className="text-gray-400 font-mono w-20 shrink-0 text-right">{e.ip_address || ""}</span>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", e.success !== false ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{e.success !== false ? "OK" : "ÉCHEC"}</span>
            </div>
          ))}
          {events.length === 0 && <div className="text-[10px] text-gray-400 py-2">Aucun événement</div>}
        </div>
      </V3Card>
    </div>
  );
}

// ═══ SECTION 6 — Centre de connaissances ═══

function AdminKnowledge({ onNav }: { onNav: (s: AdminSection) => void }) {
  const [openQ, setOpenQ] = useState<number | null>(null);

  const FAQ = [
    { q: "Comment inviter un utilisateur?", a: "Allez dans la section Utilisateurs, entrez l'email et le rôle, puis cliquez Inviter." },
    { q: "Comment créer un package personnalisé?", a: "Allez dans Packages, cliquez 'Créer' dans les Overrides de prix pour définir un pricing custom par tenant." },
    { q: "Quels sont les niveaux d'autonomie des bots?", a: "4 niveaux: dieu (accès total), coequipier (collaboration), operateur (exécution), client (consultation)." },
    { q: "Comment fonctionne le système TimeTokens?", a: "Chaque action IA consomme des UT. Le solde est visible dans Packages. Les transactions sont tracées automatiquement." },
    { q: "Comment vérifier la santé du système?", a: "Allez dans Monitoring pour voir l'état de chaque service (API, PostgreSQL, LiveKit, Nginx)." },
    { q: "Que faire si un service est en panne?", a: "Vérifiez les logs dans Monitoring. Les services critiques sont surveillés par le Guardian VPS2." },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-gray-800">Guide des sections</span>
        {([
          { id: "dashboard" as const, label: "Dashboard", desc: "Vue d'ensemble avec KPIs et santé système", icon: LayoutDashboard },
          { id: "instances" as const, label: "Instances", desc: "Gérer les tenants et verticals", icon: Server },
          { id: "users" as const, label: "Utilisateurs", desc: "Inviter, gérer les rôles et sessions", icon: Users },
          { id: "packages" as const, label: "Packages", desc: "Plans, pricing overrides et TimeTokens", icon: Package },
          { id: "monitoring" as const, label: "Monitoring", desc: "Santé système, logs sécurité, distribution API", icon: Activity },
        ] as const).map(s => (
          <button key={s.id} onClick={() => onNav(s.id)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
            <s.icon className="h-4 w-4 text-gray-400 shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-xs font-bold text-gray-900">{s.label}</div>
              <div className="text-[10px] text-gray-500">{s.desc}</div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          </button>
        ))}
      </div>

      <V3Card>
        <V3CardHeader icon={BookOpen} title="Questions fréquentes" />
        <div className="divide-y divide-gray-100">
          {FAQ.map((f, i) => (
            <div key={i}>
              <button onClick={() => setOpenQ(openQ === i ? null : i)} className="w-full px-4 py-2.5 flex items-center gap-2 text-left hover:bg-gray-50 cursor-pointer">
                <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform shrink-0", openQ === i && "rotate-180")} />
                <span className="text-xs font-medium text-gray-800">{f.q}</span>
              </button>
              {openQ === i && <div className="px-4 pb-3 pl-9 text-xs text-gray-600 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </V3Card>
    </div>
  );
}

// ═══ SIDEBAR CONFIG ═══

const ADMIN_SIDEBAR: SidebarItem[] = [
  { id: "dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { id: "instances",  label: "Instances",      icon: Server },
  { id: "users",      label: "Utilisateurs",   icon: Users },
  { id: "packages",   label: "Packages",       icon: Package },
  { id: "monitoring", label: "Monitoring",      icon: Activity },
  { id: "knowledge",  label: "Connaissances",   icon: BookOpen },
];

// ═══ COMPOSANT PRINCIPAL ═══

export function AdminView({ showHeader }: SectionProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  return (
    <div className="space-y-4">
      {showHeader && (
        <LivingHero blur1="bg-slate-200/70" blur2="bg-gray-100/60" subtitleColor="text-slate-500" subtitle="God Mode" title="Le centre de contrôle absolu." description="Instances, utilisateurs, packages, monitoring — tout le système sous vos yeux.">
          <div className="relative w-[360px] h-[140px]">
            {/* Shield background */}
            <div className="absolute right-[20px] bottom-[-10px] opacity-[0.12] text-slate-600 anim-admin-shield">
              <svg viewBox="0 0 100 120" className="w-36 h-36"><path d="M50 5 L90 25 L90 65 Q90 95 50 115 Q10 95 10 65 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M50 20 L75 35 L75 60 Q75 80 50 95 Q25 80 25 60 L25 35 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/></svg>
            </div>
            {/* Glass panel */}
            <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{fontFamily:'ui-monospace,monospace'}}>System Status</h4>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-bold text-emerald-500 tracking-wider">LIVE</span></div>
              </div>
              {/* Scan line */}
              <div className="absolute left-5 right-5 h-px bg-slate-400 shadow-[0_0_8px_#64748b] anim-admin-scan" />
              {/* Monitoring nodes */}
              <div className="flex items-end justify-between gap-4 h-[50px] mt-2 px-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 anim-admin-node-1" />
                  <div className="text-[6px] font-mono text-slate-400">API</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-400 anim-admin-node-2" />
                  <div className="text-[6px] font-mono text-slate-400">DB</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-violet-400 anim-admin-node-3" />
                  <div className="text-[6px] font-mono text-slate-400">LK</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-400 anim-admin-node-4" />
                  <div className="text-[6px] font-mono text-slate-400">NGX</div>
                </div>
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      <div className="flex gap-3">
        <div className="w-[180px] shrink-0 space-y-0.5 pt-1">
          {ADMIN_SIDEBAR.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={cn("w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent")}>
                <div className="flex items-center gap-1.5">
                  <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex-1 min-w-0">
          {activeSection === "dashboard" && <AdminDashboard onNav={setActiveSection} />}
          {activeSection === "instances" && <AdminInstances />}
          {activeSection === "users" && <AdminUsers />}
          {activeSection === "packages" && <AdminPackages />}
          {activeSection === "monitoring" && <AdminMonitoring />}
          {activeSection === "knowledge" && <AdminKnowledge onNav={setActiveSection} />}
        </div>
      </div>
    </div>
  );
}
