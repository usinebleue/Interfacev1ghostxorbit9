/**
 * EquipeHumaineView.tsx — Mon Equipe > Equipe Humaine
 * Sprint F4 — Multi-User MVP
 * Liste les users de l'org, gestion roles (admin), invite par email
 */

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Check,
  X,
  Crown,
  Briefcase,
  User as UserIcon,
  Eye,
  Bot,
  Loader2,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useAuth, getCurrentRole } from "../../context/AuthContext";
import { api } from "../../api/client";

interface TeamMember {
  id: number;
  email: string;
  nom: string;
  avatar?: string;
  role: string;
  department_scope: string[] | null;
  autonomy_override: string | null;
  actif: boolean;
  last_login?: string;
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: Crown,
  manager: Briefcase,
  membre: UserIcon,
  invite: Eye,
  bot: Bot,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-amber-500 bg-amber-500/10",
  manager: "text-blue-500 bg-blue-500/10",
  membre: "text-slate-500 bg-slate-500/10",
  invite: "text-green-500 bg-green-500/10",
  bot: "text-violet-500 bg-violet-500/10",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  manager: "Gestionnaire",
  membre: "Membre",
  invite: "Invite",
  bot: "Bot",
};

export function EquipeHumaineView() {
  const auth = useAuth();
  const currentRole = getCurrentRole();
  const isAdmin = currentRole === "admin";

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("membre");
  const [inviting, setInviting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState("");

  const loadMembers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setMembers(data.users || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.inviteUser(inviteEmail, inviteRole);
      setInviteEmail("");
      setShowInvite(false);
      loadMembers();
    } catch {
      // handle error
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: number) => {
    try {
      await api.updateMembership(userId, { role: editRole });
      setEditingId(null);
      loadMembers();
    } catch {
      // handle error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeMembers = members.filter((m) => m.actif);
  const inactiveMembers = members.filter((m) => !m.actif);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Equipe Humaine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeMembers.length} membre{activeMembers.length > 1 ? "s" : ""} actif{activeMembers.length > 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <UserPlus className="h-4 w-4" />
            Inviter
          </button>
        )}
      </div>

      {/* Invite form */}
      {showInvite && (
        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-white"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="membre">Membre</option>
                <option value="manager">Gestionnaire</option>
                <option value="invite">Invite</option>
              </select>
            </div>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Envoyer
            </button>
            <button
              onClick={() => setShowInvite(false)}
              className="px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {activeMembers.map((member) => {
          const RoleIcon = ROLE_ICONS[member.role] || UserIcon;
          const roleColor = ROLE_COLORS[member.role] || ROLE_COLORS.membre;
          const isEditing = editingId === member.id;

          return (
            <Card key={member.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                  {member.nom?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {member.nom || member.email}
                    </span>
                    {member.id === auth.user?.id && (
                      <Badge variant="secondary" className="text-[9px]">Vous</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>

                {/* Role badge */}
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="px-2 py-1 border rounded text-xs bg-white"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="membre">Membre</option>
                      <option value="invite">Invite</option>
                    </select>
                    <button onClick={() => handleUpdateRole(member.id)} className="text-green-600 hover:text-green-700">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Badge className={cn("text-xs font-medium", roleColor)}>
                    <RoleIcon className="h-3.5 w-3.5 mr-1" />
                    {ROLE_LABELS[member.role] || member.role}
                  </Badge>
                )}

                {/* Department scope */}
                {member.department_scope && member.department_scope.length > 0 && (
                  <div className="flex gap-1">
                    {member.department_scope.slice(0, 3).map((dept) => (
                      <Badge key={dept} variant="outline" className="text-[9px]">{dept}</Badge>
                    ))}
                    {member.department_scope.length > 3 && (
                      <Badge variant="outline" className="text-[9px]">+{member.department_scope.length - 3}</Badge>
                    )}
                  </div>
                )}

                {/* Actions (admin only) */}
                {isAdmin && member.id !== auth.user?.id && !isEditing && (
                  <button
                    onClick={() => { setEditingId(member.id); setEditRole(member.role); }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded"
                    title="Modifier le role"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                )}

                {/* Last login */}
                {member.last_login && (
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                    {new Date(member.last_login).toLocaleDateString("fr-CA")}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Inactive members */}
      {inactiveMembers.length > 0 && (
        <div className="space-y-2 mt-8">
          <h3 className="text-sm font-medium text-muted-foreground">Membres inactifs ({inactiveMembers.length})</h3>
          {inactiveMembers.map((member) => (
            <Card key={member.id} className="p-3 opacity-60">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-400">
                  {member.nom?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">{member.nom || member.email}</span>
                </div>
                <Badge variant="outline" className="text-[9px] text-muted-foreground">Inactif</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
