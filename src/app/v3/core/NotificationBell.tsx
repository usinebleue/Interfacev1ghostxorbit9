/**
 * NotificationBell.tsx — Cloche de notifications dans le header workspace
 *
 * Badge avec count non-lu + dropdown liste notifications recentes.
 * Clic sur une notification → navigue vers le document/library concerne.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR_MAP, BOT_DISPLAY } from "../sections/shared/dept-data";

const API_BASE = "/api/v1";
const API_KEY = "dev-key-brain-2024";
const headers = { "x-api-key": API_KEY, "Content-Type": "application/json" };

interface NotifPreview {
  id: number;
  bot_code: string;
  type_notif: string;
  titre: string;
  message: string;
  lu: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifPreview[]>([]);
  const dropRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/count`, { headers });
      if (res.ok) { const d = await res.json(); setCount(d.count || 0); }
    } catch { /* silent */ }
  }, []);

  const loadNotifs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications?limit=8`, { headers });
      if (res.ok) { const d = await res.json(); setNotifs(d.notifications || []); }
    } catch { /* silent */ }
  }, []);

  // Poll count every 30s
  useEffect(() => {
    refreshCount();
    const iv = setInterval(refreshCount, 30000);
    return () => clearInterval(iv);
  }, [refreshCount]);

  // Load notifs when dropdown opens
  useEffect(() => {
    if (open) loadNotifs();
  }, [open, loadNotifs]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markRead = async (id: number) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers });
    refreshCount();
    loadNotifs();
  };

  const markAllRead = async () => {
    await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers });
    setCount(0);
    loadNotifs();
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-4 w-4 text-gray-500" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-1 text-[8px] font-bold bg-red-500 text-white rounded-full">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-900">Notifications</span>
            {count > 0 && (
              <button onClick={markAllRead} className="text-[9px] text-blue-600 hover:underline">Tout marquer lu</button>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-[10px] text-gray-400 text-center py-6">Aucune notification</p>
            ) : (
              notifs.map(n => {
                const display = BOT_DISPLAY[n.bot_code] || { name: n.bot_code };
                const avatar = BOT_AVATAR_MAP[n.bot_code];
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-start gap-2",
                      !n.lu && "bg-blue-50/40",
                    )}
                  >
                    {avatar && <img src={avatar} alt="" className="w-5 h-5 rounded-full mt-0.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-900 truncate">{n.titre}</p>
                      <p className="text-[9px] text-gray-500 line-clamp-1">{n.message}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">{display.name} · {n.created_at?.slice(0, 16).replace("T", " ")}</p>
                    </div>
                    {!n.lu && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
