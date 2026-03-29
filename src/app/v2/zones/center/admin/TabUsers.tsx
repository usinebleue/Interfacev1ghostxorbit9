/**
 * TabUsers.tsx — Gestion utilisateurs admin
 * 3 sections empilees: Utilisateurs | Invitations | Sessions actives
 * God mode: tous les users. Instance: users du tenant.
 */

import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Shield, Monitor, Pencil } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { StatusBadge, BotBadge, BlockHeader, LoadingState, EmptyState, TabSectionHeader } from "../shared/SectionComponents";
import { AdminModal, type FieldDef } from "./AdminModal";

// ═══════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════

interface Props {
  mode: string;
  tenantId?: number;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "membre", label: "Membre" },
  { value: "invite", label: "Invite" },
];

const USER_EDIT_FIELDS: FieldDef[] = [
  { key: "role", label: "Role", type: "select", options: ROLE_OPTIONS, required: true },
  { key: "department_scope", label: "Departements (scope)", type: "text", placeholder: "CEOB, CTOB, CFOB" },
  { key: "autonomy_override", label: "Autonomie (override)", type: "text", placeholder: "full, limited, none" },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  manager: "bg-blue-100 text-blue-700 border-blue-200",
  membre: "bg-gray-100 text-gray-600 border-gray-200",
  invite: "bg-amber-100 text-amber-700 border-amber-200",
};

// ═══════════════════════════════════════
// TabUsers — 3 sections empilees
// ═══════════════════════════════════════

export function TabUsers({ mode, tenantId }: Props) {
  return (
    <div className="space-y-6">
      <TabSectionHeader icon={Users} title="Utilisateurs" subtitle="Gestion des comptes et invitations" gradient="from-violet-600 to-violet-500" />
      <UsersSection mode={mode} tenantId={tenantId} />
      <InvitationsSection mode={mode} tenantId={tenantId} />
      <SessionsSection mode={mode} tenantId={tenantId} />
    </div>
  );
}

// ═══════════════════════════════════════
// Section 1 — Utilisateurs (blue)
// ═══════════════════════════════════════

function UsersSection({ mode, tenantId }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    api.getUsers()
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.users || [];
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={Users}
        title="Utilisateurs"
        gradient="from-blue-600 to-blue-500"
        count={users.length}
      />
      <div className="p-3 space-y-2">
        {loading ? (
          <LoadingState />
        ) : users.length === 0 ? (
          <EmptyState message="Aucun utilisateur" />
        ) : (
          users.map(u => {
            const role = u.role || "membre";
            return (
              <Card key={u.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate flex-1">
                    {u.nom || u.name || u.email}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                    ROLE_COLORS[role] || "bg-gray-100 text-gray-600 border-gray-200"
                  )}>
                    {role.toUpperCase()}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="text-[9px] text-gray-400">
                    {u.email}{u.created_at ? ` — ${new Date(u.created_at).toLocaleDateString("fr-CA")}` : ""}
                  </div>
                  <button
                    onClick={() => setEditing(u)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {editing && (
        <AdminModal
          title={`Modifier — ${editing.nom || editing.name || editing.email}`}
          fields={USER_EDIT_FIELDS}
          initialData={{
            role: editing.role || "membre",
            department_scope: Array.isArray(editing.department_scope) ? editing.department_scope.join(", ") : (editing.department_scope || ""),
            autonomy_override: editing.autonomy_override || "",
          }}
          onSave={async (data) => {
            const scopeStr = String(data.department_scope || "");
            const scope = scopeStr ? scopeStr.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined;
            try {
              await api.updateMembership(editing.id, {
                role: String(data.role),
                department_scope: scope,
                autonomy_override: data.autonomy_override ? String(data.autonomy_override) : undefined,
              });
              refresh();
            } catch {
              throw new Error("Endpoint non disponible");
            }
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </Card>
  );
}

// ═══════════════════════════════════════
// Section 2 — Invitations (violet)
// ═══════════════════════════════════════

function InvitationsSection({ mode, tenantId }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("membre");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setMessage(null);
    try {
      await api.inviteUser(email.trim(), role);
      setMessage({ type: "success", text: `Invitation envoyee a ${email}` });
      setEmail("");
      setRole("membre");
    } catch {
      setMessage({ type: "error", text: "Endpoint non disponible" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={UserPlus}
        title="Invitations"
        gradient="from-violet-600 to-violet-500"
      />
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="utilisateur@entreprise.com"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {ROLE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleInvite}
          disabled={sending || !email.trim()}
          className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {sending ? "Envoi..." : "Inviter"}
        </button>

        {message && (
          <div className={cn(
            "text-xs px-3 py-2 rounded-lg",
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          )}>
            {message.text}
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════
// Section 3 — Sessions actives (amber)
// ═══════════════════════════════════════

function SessionsSection({ mode, tenantId }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<number | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    api.getActiveSessions()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setSessions(list);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRevoke = async (id: number) => {
    setRevoking(id);
    try {
      await api.revokeSession(id);
      refresh();
    } catch {
      // silent
    } finally {
      setRevoking(null);
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={Monitor}
        title="Sessions actives"
        gradient="from-amber-600 to-amber-500"
        count={sessions.length}
      />
      <p className="px-3 pt-2 text-xs text-gray-500">
        Sessions actuellement connectees a la plateforme. Revoquer une session deconnecte l'utilisateur immediatement.
      </p>
      <div className="p-3 space-y-2">
        {loading ? (
          <LoadingState />
        ) : sessions.length === 0 ? (
          <EmptyState message="Aucune session active" />
        ) : (
          sessions.map(s => (
            <Card key={s.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                <Monitor className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white truncate flex-1">
                  {s.user_email || s.user_name || `Session #${s.id}`}
                </span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="text-[9px] text-gray-400">
                  {s.ip_address && <span className="mr-2">{s.ip_address}</span>}
                  {s.user_agent && <span className="mr-2">{String(s.user_agent).slice(0, 40)}</span>}
                  {s.created_at && <span>{new Date(s.created_at).toLocaleDateString("fr-CA")}</span>}
                </div>
                <button
                  onClick={() => handleRevoke(s.id)}
                  disabled={revoking === s.id}
                  className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {revoking === s.id ? "..." : "Revoquer"}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
