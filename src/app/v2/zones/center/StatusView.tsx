/**
 * StatusView.tsx — Status page (C.6)
 * Checks: PostgreSQL, Gemini, LiveKit, ElevenLabs, Deepgram
 */

import { useState, useEffect } from "react";
import { Activity, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { PageLayout } from "./layouts/PageLayout";

interface StatusData {
  status: string;
  uptime_seconds: number;
  version: string;
  checks: Record<string, string>;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function StatusView() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  return (
    <PageLayout maxWidth="3xl" spacing="space-y-4">
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Status</h2>
              <p className="text-sm text-white/70">
                {data ? `Uptime: ${formatUptime(data.uptime_seconds)} — v${data.version}` : "Chargement..."}
              </p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Rafraichir
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Erreur: {error}
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {Object.entries(data.checks).map(([service, status]) => {
            const isOk = status === "ok" || status === "configured";
            return (
              <Card key={service} className="p-3 flex items-center gap-3">
                {isOk ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800 capitalize">{service}</span>
                </div>
                <span className={cn("text-[9px] font-medium px-2 py-0.5 rounded-full",
                  isOk ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}>
                  {status}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
