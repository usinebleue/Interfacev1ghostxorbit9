/**
 * StandingOrdersView.tsx — Gestion des ordres permanents (D3)
 *
 * Liste des standing orders actifs, pause/resume, creation.
 * Pattern: copie OperationsView (hero + sidebar + contenu)
 */

import { useState, useEffect, useCallback } from "react";
import { Calendar, Pause, Play, Trash2, Plus, Clock, RefreshCw } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR_MAP, BOT_DISPLAY } from "./shared/dept-data";
import type { StandingOrder } from "./shared/execution-data";

const API_BASE = "/api/v1";
const API_KEY = "dev-key-brain-2024";
const headers: HeadersInit = { "x-api-key": API_KEY, "Content-Type": "application/json" };

// ═══ Hook: useStandingOrders ═══
function useStandingOrders() {
  const [orders, setOrders] = useState<StandingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/standing-orders`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); const iv = setInterval(refresh, 30000); return () => clearInterval(iv); }, [refresh]);

  const pause = async (id: number) => {
    await fetch(`${API_BASE}/standing-orders/${id}/pause`, { method: "POST", headers });
    refresh();
  };
  const resume = async (id: number) => {
    await fetch(`${API_BASE}/standing-orders/${id}/resume`, { method: "POST", headers });
    refresh();
  };
  const remove = async (id: number) => {
    await fetch(`${API_BASE}/standing-orders/${id}`, { method: "DELETE", headers });
    refresh();
  };

  return { orders, loading, refresh, pause, resume, remove };
}

// ═══ Status badge ═══
function StatusBadge({ status }: { status: string }) {
  const conf: Record<string, { bg: string; text: string; label: string }> = {
    actif: { bg: "bg-green-100", text: "text-green-700", label: "Actif" },
    pause: { bg: "bg-amber-100", text: "text-amber-700", label: "En pause" },
    archive: { bg: "bg-gray-100", text: "text-gray-500", label: "Archive" },
  };
  const c = conf[status] || conf.archive;
  return <span className={cn("px-1.5 py-0.5 text-[8px] font-bold rounded-full", c.bg, c.text)}>{c.label}</span>;
}

// ═══ Schedule display ═══
function ScheduleDisplay({ schedule }: { schedule: Record<string, unknown> }) {
  if (schedule.cron) return <span className="text-[9px] text-gray-500 font-mono">{String(schedule.cron)}</span>;
  if (schedule.interval_hours) return <span className="text-[9px] text-gray-500">Chaque {String(schedule.interval_hours)}h</span>;
  return <span className="text-[9px] text-gray-400">Non configure</span>;
}

// ═══ Order Card ═══
function OrderCard({ order, onPause, onResume, onRemove }: {
  order: StandingOrder;
  onPause: () => void;
  onResume: () => void;
  onRemove: () => void;
}) {
  const display = BOT_DISPLAY[order.bot_code] || { name: order.bot_code, role: "Agent" };
  const avatar = BOT_AVATAR_MAP[order.bot_code];
  const config = order.config || {};

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-2">
        {avatar && <img src={avatar} alt={display.name} className="w-6 h-6 rounded-full" />}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gray-900 truncate">
            {(config.titre_pattern as string) || order.type_ordre}
          </p>
          <p className="text-[9px] text-gray-500">{display.name} · {order.type_ordre}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Schedule + execution info */}
      <div className="flex items-center gap-3 mb-2 text-[9px]">
        <div className="flex items-center gap-1 text-gray-500">
          <Calendar className="h-3 w-3" />
          <ScheduleDisplay schedule={order.schedule} />
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <RefreshCw className="h-3 w-3" />
          <span>{order.execution_count} executions</span>
        </div>
      </div>

      {/* Next / Last execution */}
      <div className="flex items-center gap-4 mb-2 text-[9px]">
        {order.last_execution && (
          <div className="text-gray-400">
            <span className="font-medium">Dernier:</span> {order.last_execution.slice(0, 16).replace("T", " ")}
          </div>
        )}
        {order.next_execution && order.status === "actif" && (
          <div className="text-blue-500">
            <span className="font-medium">Prochain:</span> {order.next_execution.slice(0, 16).replace("T", " ")}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        {order.status === "actif" ? (
          <button onClick={onPause} className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100">
            <Pause className="h-3 w-3" /> Pause
          </button>
        ) : order.status === "pause" ? (
          <button onClick={onResume} className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
            <Play className="h-3 w-3" /> Reprendre
          </button>
        ) : null}
        <button onClick={onRemove} className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
          <Trash2 className="h-3 w-3" /> Supprimer
        </button>
      </div>
    </div>
  );
}

// ═══ Composant principal ═══
export function StandingOrdersView() {
  const { orders, loading, pause, resume, remove } = useStandingOrders();

  const activeOrders = orders.filter(o => o.status === "actif");
  const pausedOrders = orders.filter(o => o.status === "pause");

  return (
    <div className="space-y-4 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <h2 className="text-xs font-bold text-gray-900">Ordres permanents</h2>
          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-blue-100 text-blue-700 rounded-full">
            {activeOrders.length} actif{activeOrders.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-[10px] text-gray-400 text-center py-6">Chargement...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-[11px] text-gray-500 font-medium">Aucun ordre permanent</p>
          <p className="text-[9px] text-gray-400 mt-1">Les ordres permanents permettent aux agents d&apos;executer des taches recurrentes automatiquement.</p>
        </div>
      ) : (
        <>
          {/* Active orders */}
          {activeOrders.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-green-700 uppercase mb-1.5">Actifs ({activeOrders.length})</p>
              <div className="space-y-2">
                {activeOrders.map(o => (
                  <OrderCard key={o.id} order={o} onPause={() => pause(o.id)} onResume={() => resume(o.id)} onRemove={() => remove(o.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Paused orders */}
          {pausedOrders.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-amber-700 uppercase mb-1.5">En pause ({pausedOrders.length})</p>
              <div className="space-y-2">
                {pausedOrders.map(o => (
                  <OrderCard key={o.id} order={o} onPause={() => pause(o.id)} onResume={() => resume(o.id)} onRemove={() => remove(o.id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
