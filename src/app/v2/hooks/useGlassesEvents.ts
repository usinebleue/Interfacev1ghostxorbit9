/**
 * useGlassesEvents.ts — Poll glasses push events from CarlOS API
 *
 * Quand Carl porte ses Ray-Ban Meta, Gemini peut pousser des canvas actions
 * vers le frontend web (laptop/phone) via /api/v1/glasses/push.
 * Ce hook poll toutes les 3s et dispatch les actions vers CanvasActionContext.
 *
 * S45 — Ray-Ban Meta integration
 */

import { useEffect, useRef } from "react";
import { useCanvasActions } from "../context/CanvasActionContext";
import type { CanvasAction } from "../api/types";

/** Mapping section parlee → ActiveView dans le frontend */
const SECTION_TO_VIEW: Record<string, string> = {
  dashboard: "dashboard",
  cockpit: "cockpit",
  sante: "health",
  health: "health",
  bureau: "espace-bureau",
  "mon bureau": "espace-bureau",
  blueprint: "blueprint",
  "blue print": "blueprint",
  scenarios: "scenarios",
  chantiers: "mes-chantiers",
  missions: "mes-chantiers",
  orbit9: "orbit9-detail",
  marketplace: "orbit9-detail",
  "think-room": "think-room",
  "war-room": "war-room",
  "board-room": "board-room",
  discussions: "discussion",
  "agent-settings": "agent-settings",
  reglages: "agent-settings",
  ventes: "department",
  production: "department",
  marketing: "department",
  finance: "department",
  rh: "department",
  operations: "department",
  strategie: "department",
  innovation: "department",
  securite: "department",
  legal: "department",
  technologie: "department",
};

/** Mapping section → bot code pour les departements */
const SECTION_TO_BOT: Record<string, string> = {
  ventes: "BCS",
  strategie: "BCS",
  production: "BOO",
  operations: "BOO",
  marketing: "BCM",
  finance: "BCF",
  rh: "BHR",
  technologie: "BCT",
  innovation: "BIO",
  securite: "BSE",
  legal: "BLE",
};

interface GlassesEvent {
  type: string;
  target: string;
  title: string;
  content: string;
  data: Record<string, string>;
  ts: number;
}

export function useGlassesEvents(userId = 1, enabled = true) {
  const { dispatch } = useCanvasActions();
  const cursorRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/v1/glasses/events/${userId}?cursor=${cursorRef.current}`,
          { headers: { "X-API-Key": import.meta.env.VITE_API_KEY || "missing-key" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        cursorRef.current = data.cursor;

        for (const evt of data.events as GlassesEvent[]) {
          const action = eventToCanvasAction(evt);
          if (action) {
            console.log("[Glasses] Push event:", evt.type, evt.target || evt.title);
            dispatch(action);
          }
        }
      } catch {
        // Silent fail — glasses might not be connected
      }
    };

    intervalRef.current = setInterval(poll, 3000);
    poll();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, enabled, dispatch]);
}

function eventToCanvasAction(evt: GlassesEvent): CanvasAction | null {
  switch (evt.type) {
    case "navigate": {
      const target = evt.target.toLowerCase().trim();
      const view = SECTION_TO_VIEW[target];
      if (!view) return null;

      const botCode = SECTION_TO_BOT[target];
      return {
        type: "navigate",
        layer: "bouche",
        view,
        params: botCode ? { bot: botCode } : undefined,
        bot: "BCO",
        priority: "high",
      };
    }
    case "push_content":
      return {
        type: "push_content",
        layer: "cerveau",
        data: {
          titre: evt.title || "Info CarlOS",
          contenu: evt.content || "",
          content_types: ["text"],
          full_length: (evt.content || "").length,
        },
        bot: "BCO",
        priority: "high",
      };
    case "show_kpi": {
      const target = evt.target.toLowerCase().trim();
      const botCode = SECTION_TO_BOT[target];
      return {
        type: "navigate",
        layer: "bouche",
        view: "department",
        params: botCode ? { bot: botCode } : undefined,
        bot: "BCO",
        priority: "high",
      };
    }
    default:
      return null;
  }
}
