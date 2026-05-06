/**
 * useWorkspaceSync.ts — Synchronise les contributions externes (vocal, réunion)
 * avec le workspace local (simV3Cristallises).
 *
 * Poll toutes les 3s quand une phase est active et un workspaceSessionId existe.
 * Merge les nouvelles contributions dans AmorcerContext.
 */

import { useEffect, useRef } from "react";
import { useAmorcer } from "../AmorcerContext";

const API_KEY = import.meta.env.VITE_API_KEY || "";
const API_BASE = import.meta.env.VITE_API_URL || "";

export function useWorkspaceSync(sessionId: string | null) {
  const { addSimV3Cristallise, activePhase } = useAmorcer();
  const cursorRef = useRef(0);

  useEffect(() => {
    if (!sessionId || !activePhase || activePhase === "observation") return;

    const interval = setInterval(async () => {
      try {
        const resp = await fetch(
          `${API_BASE}/api/v1/workspace/contributions/${sessionId}?cursor=${cursorRef.current}`,
          { headers: { "X-API-Key": API_KEY } }
        );
        if (!resp.ok) return;
        const data = await resp.json();
        for (const contrib of data.contributions || []) {
          addSimV3Cristallise(
            contrib.content,
            contrib.author_code,
            contrib.section_id,
            contrib.source_type as "chat" | "voice" | "meeting"
          );
          cursorRef.current = Math.max(cursorRef.current, contrib.id);
        }
      } catch {
        // Silently ignore network errors during polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, activePhase, addSimV3Cristallise]);
}
