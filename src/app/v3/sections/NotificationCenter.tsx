/**
 * NotificationCenter.tsx — Centre de notifications agents (D2/D3)
 *
 * Liste les PendingApproval de type 'docforge_publish' + notifications.
 * Actions: Voir (ouvre en review), Approuver, Rejeter.
 * Pattern: copie OperationsView (hero + sidebar + contenu)
 */

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, X, Eye, FileText, Clock, AlertTriangle } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR_MAP, BOT_DISPLAY } from "./shared/dept-data";
import type { AgentNotification } from "./shared/execution-data";
import { useAmorcer } from "../AmorcerContext";

const API_BASE = "/api/v1";
const API_KEY = "dev-key-brain-2024";
const headers = { "x-api-key": API_KEY, "Content-Type": "application/json" };

// ═══ Hook: useApprovals ═══
function useApprovals() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/approvals?status=pending`, { headers });
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch { /* silently fail */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); const iv = setInterval(refresh, 15000); return () => clearInterval(iv); }, [refresh]);

  const approve = async (libraryId: number) => {
    await fetch(`${API_BASE}/docforge/libraries/${libraryId}/approve`, { method: "POST", headers });
    refresh();
  };
  const reject = async (libraryId: number, feedback: string) => {
    await fetch(`${API_BASE}/docforge/libraries/${libraryId}/reject?feedback=${encodeURIComponent(feedback)}`, { method: "POST", headers });
    refresh();
  };

  return { approvals, loading, refresh, approve, reject };
}

// ═══ Hook: useNotifications ═══
function useNotifications() {
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/notifications?limit=20`, { headers }),
        fetch(`${API_BASE}/notifications/count`, { headers }),
      ]);
      if (nRes.ok) { const d = await nRes.json(); setNotifications(d.notifications || []); }
      if (cRes.ok) { const d = await cRes.json(); setCount(d.count || 0); }
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => { refresh(); const iv = setInterval(refresh, 30000); return () => clearInterval(iv); }, [refresh]);

  const markRead = async (id: number) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers });
    refresh();
  };
  const markAllRead = async () => {
    await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers });
    refresh();
  };

  return { notifications, count, refresh, markRead, markAllRead };
}

// ═══ Approval Card ═══
function ApprovalCard({ approval, onApprove, onReject }: {
  approval: any;
  onApprove: () => void;
  onReject: (feedback: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const display = BOT_DISPLAY[approval.bot_code] || { name: approval.bot_code, role: "Agent" };
  const avatar = BOT_AVATAR_MAP[approval.bot_code];
  const params = approval.action_params || {};

  return (
    <div className="p-3 bg-white border border-amber-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {avatar && <img src={avatar} alt={display.name} className="w-6 h-6 rounded-full" />}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gray-900">{display.name} a cree un document</p>
          <p className="text-[9px] text-gray-500">{approval.bot_rationale || params.deliverable_type || "document"}</p>
        </div>
        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-amber-100 text-amber-700 rounded-full">
          En attente
        </span>
      </div>

      {rejecting ? (
        <div className="mt-2 space-y-1">
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Raison du rejet..."
            className="w-full text-[10px] p-2 border rounded-lg resize-none h-16"
          />
          <div className="flex gap-1 justify-end">
            <button onClick={() => setRejecting(false)} className="px-2 py-1 text-[9px] text-gray-500 hover:text-gray-700">Annuler</button>
            <button onClick={() => { onReject(feedback); setRejecting(false); }} className="px-2 py-1 text-[9px] font-bold text-red-700 bg-red-50 rounded-lg">Confirmer rejet</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5 mt-2">
          <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
            <Eye className="h-3 w-3" /> Voir
          </button>
          <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
            <Check className="h-3 w-3" /> Approuver
          </button>
          <button onClick={() => setRejecting(true)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
            <X className="h-3 w-3" /> Rejeter
          </button>
        </div>
      )}
    </div>
  );
}

// ═══ Notification Item ═══
function NotifItem({ notif, onRead }: { notif: AgentNotification; onRead: () => void }) {
  const display = BOT_DISPLAY[notif.bot_code] || { name: notif.bot_code };
  const avatar = BOT_AVATAR_MAP[notif.bot_code];
  const iconMap: Record<string, { icon: typeof Bell; color: string }> = {
    docforge_complete: { icon: FileText, color: "text-emerald-500" },
    docforge_started: { icon: Clock, color: "text-blue-500" },
    error: { icon: AlertTriangle, color: "text-red-500" },
  };
  const { icon: Icon, color } = iconMap[notif.type_notif] || { icon: Bell, color: "text-gray-500" };

  return (
    <div className={cn("p-2.5 rounded-lg flex items-start gap-2 transition-all", notif.lu ? "bg-white" : "bg-blue-50/50 border border-blue-100")} onClick={onRead}>
      {avatar && <img src={avatar} alt={display.name} className="w-5 h-5 rounded-full mt-0.5" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-900">{notif.titre}</p>
        <p className="text-[9px] text-gray-500">{notif.message}</p>
        <p className="text-[8px] text-gray-400 mt-0.5">{display.name} · {notif.created_at?.slice(0, 16).replace("T", " ")}</p>
      </div>
      <Icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", color)} />
    </div>
  );
}

// ═══ Composant principal ═══
export function NotificationCenter() {
  const { approvals, approve, reject } = useApprovals();
  const { notifications, count, markRead, markAllRead } = useNotifications();

  return (
    <div className="space-y-4 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-500" />
          <h2 className="text-xs font-bold text-gray-900">Centre de notifications</h2>
          {count > 0 && <span className="px-1.5 py-0.5 text-[8px] font-bold bg-red-100 text-red-700 rounded-full">{count}</span>}
        </div>
        {count > 0 && (
          <button onClick={markAllRead} className="text-[9px] text-blue-600 hover:underline">Tout marquer lu</button>
        )}
      </div>

      {/* Approvals pending */}
      {approvals.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-amber-700 uppercase mb-1.5">En attente d&apos;approbation ({approvals.length})</p>
          <div className="space-y-2">
            {approvals.map(a => (
              <ApprovalCard
                key={a.id}
                approval={a}
                onApprove={() => approve(a.action_params?.library_id)}
                onReject={(fb) => reject(a.action_params?.library_id, fb)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent notifications */}
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Notifications recentes</p>
        {notifications.length === 0 ? (
          <p className="text-[10px] text-gray-400 text-center py-6">Aucune notification</p>
        ) : (
          <div className="space-y-1">
            {notifications.map(n => (
              <NotifItem key={n.id} notif={n} onRead={() => markRead(n.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
