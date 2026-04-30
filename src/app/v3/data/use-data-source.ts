/**
 * use-data-source.ts — Hook générique SIMU → LIVE
 *
 * Usage dans un composant V3:
 *   const { data, source } = useDataSource("chantiers", MOCK_CHANTIERS);
 *
 * Logique:
 *   1. Cherche le domaine dans registry.ts
 *   2. Si status === "live" ou "mixte" ET endpoint existe → appelle l'API
 *   3. Si erreur API ou status === "simu" → retourne le mock passé en paramètre
 *   4. Retourne { data, source, isLive, loading, error }
 */

import { useState, useEffect, useRef } from "react";
import type { SourceStatus, DataSourceResult } from "./types";
import { REGISTRY } from "./registry";

// ── Fetch wrapper (même pattern que client.ts) ──
const BASE_URL = "/api/v1";
const API_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_KEY) || "";

async function dataFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Hook générique de données V3
 *
 * @param domain - Clé du domaine dans registry.ts (ex: "chantiers")
 * @param fallbackMock - Données mock à utiliser quand status === "simu" ou en cas d'erreur API
 * @returns DataSourceResult<T> avec data, source, isLive, loading, error
 */
export function useDataSource<T>(domain: string, fallbackMock: T): DataSourceResult<T> {
  const entry = REGISTRY[domain];
  const status = entry?.status ?? "simu";
  const endpoint = entry?.endpoint ?? null;

  const [apiData, setApiData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Ne fetch que si le domaine est "live" ou "mixte" ET a un endpoint
    if (status === "simu" || !endpoint) return;
    if (fetchedRef.current) return;

    fetchedRef.current = true;
    setLoading(true);

    dataFetch<T>(endpoint)
      .then((data) => {
        setApiData(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [status, endpoint]);

  // Déterminer la source effective
  const hasApiData = apiData !== null && !error;
  const effectiveSource: SourceStatus =
    status === "live" && hasApiData ? "live" :
    status === "mixte" && hasApiData ? "mixte" :
    "simu";

  const data = hasApiData && status !== "simu" ? apiData : fallbackMock;

  return {
    data,
    source: effectiveSource,
    isLive: effectiveSource === "live",
    loading,
    error,
  };
}
