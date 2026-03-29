/**
 * TabReseau.tsx — Stats overview of Orbit9 network
 * Bird's-eye view with KPI cards, members by sector, recent match activity
 * All data from real API calls — no mock/fake data
 */

import { useState, useEffect, useMemo } from "react";
import { Globe, Users, Hexagon, Handshake, Trophy } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import {
  TabSectionHeader,
  BlockHeader,
  StatGrid,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "../shared/SectionComponents";

// ================================================================
// PROPS
// ================================================================

interface Props {
  mode: string;
  tenantId?: number;
}

// ================================================================
// HELPERS
// ================================================================

function formatDate(d: string | undefined | null): string {
  if (!d) return "\u2014";
  try {
    return new Date(d).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

function mapMatchStatus(s: string | undefined): "done" | "en-cours" | "a-faire" | "bloque" {
  if (!s) return "a-faire";
  switch (s) {
    case "accepted":
    case "accepte":
      return "done";
    case "pending":
    case "en_attente":
      return "en-cours";
    case "rejected":
    case "refuse":
      return "bloque";
    default:
      return "a-faire";
  }
}

// ================================================================
// MAIN EXPORT
// ================================================================

export function TabReseau({ mode, tenantId }: Props) {
  const [members, setMembers] = useState<any[]>([]);
  const [cellules, setCellules] = useState<any[]>([]);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const safeCall = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn();
      } catch {
        return fallback;
      }
    };

    Promise.all([
      safeCall(() => api.listOrbit9Members(), { members: [] }),
      safeCall(() => api.listOrbit9Cellules(), { cellules: [] }),
      safeCall(() => api.listOrbit9Matches(), { matches: [] }),
      safeCall(() => api.listOrbit9Matches("accepted"), { matches: [] }),
    ]).then(([membersRaw, cellulesRaw, matchesRaw, acceptedRaw]) => {
      const mList = Array.isArray(membersRaw) ? membersRaw : (membersRaw as any)?.members || [];
      const cList = Array.isArray(cellulesRaw) ? cellulesRaw : (cellulesRaw as any)?.cellules || [];
      const maList = Array.isArray(matchesRaw) ? matchesRaw : (matchesRaw as any)?.matches || [];
      const acList = Array.isArray(acceptedRaw) ? acceptedRaw : (acceptedRaw as any)?.matches || [];

      setMembers(mList);
      setCellules(cList);
      setAllMatches(maList);
      setAcceptedMatches(acList);
      setLoading(false);
    });
  }, [mode, tenantId]);

  // Group members by secteur
  const membersBySecteur = useMemo(() => {
    const map: Record<string, { count: number; regions: Record<string, number> }> = {};
    for (const m of members) {
      const secteur = m.secteur || "Non specifie";
      if (!map[secteur]) map[secteur] = { count: 0, regions: {} };
      map[secteur].count++;
      const region = m.region || "Inconnue";
      map[secteur].regions[region] = (map[secteur].regions[region] || 0) + 1;
    }
    // Convert to sorted array
    return Object.entries(map)
      .map(([secteur, data]) => {
        // Find most common region
        let topRegion = "\u2014";
        let topCount = 0;
        for (const [region, count] of Object.entries(data.regions)) {
          if (count > topCount) {
            topRegion = region;
            topCount = count;
          }
        }
        return { secteur, count: data.count, topRegion };
      })
      .sort((a, b) => b.count - a.count);
  }, [members]);

  // Recent matches (last 10, sorted by date desc)
  const recentMatches = useMemo(() => {
    return [...allMatches]
      .sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      })
      .slice(0, 10);
  }, [allMatches]);

  if (loading) {
    return (
      <div className="space-y-6">
        <TabSectionHeader
          icon={Globe}
          title="Reseau"
          subtitle="Vue d'ensemble de l'ecosysteme Orbit9"
          gradient="from-blue-600 to-blue-500"
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabSectionHeader
        icon={Globe}
        title="Reseau"
        subtitle="Vue d'ensemble de l'ecosysteme Orbit9"
        gradient="from-blue-600 to-blue-500"
      />

      {/* KPI Cards */}
      <StatGrid
        items={[
          { value: members.length, label: "Total membres", color: "blue" },
          { value: cellules.length, label: "Cellules actives", color: "indigo" },
          { value: allMatches.length, label: "Total matchs", color: "emerald" },
          { value: acceptedMatches.length, label: "Matchs acceptes", color: "amber" },
        ]}
      />

      {/* Membres par secteur */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <BlockHeader
          icon={Users}
          title="Membres par secteur"
          gradient="from-blue-600 to-blue-500"
          count={membersBySecteur.length}
        />
        <div className="p-3">
          {members.length === 0 ? (
            <EmptyState message="Aucun membre dans le reseau Orbit9" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Secteur
                    </th>
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Nombre de membres
                    </th>
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Region la plus courante
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {membersBySecteur.map((row) => (
                    <tr
                      key={row.secteur}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-xs font-medium text-gray-700">
                        {row.secteur}
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="text-xs font-bold text-blue-600">
                          {row.count}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-[9px] text-gray-500">
                        {row.topRegion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Activite recente (matches) */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <BlockHeader
          icon={Handshake}
          title="Activite recente"
          gradient="from-violet-600 to-violet-500"
          count={recentMatches.length}
        />
        <div className="p-3">
          {allMatches.length === 0 ? (
            <EmptyState message="Aucun match Orbit9 enregistre" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Demandeur
                    </th>
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Fournisseur
                    </th>
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Besoin
                    </th>
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentMatches.map((m: any, i: number) => (
                    <tr
                      key={m.id || i}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-[9px] text-gray-500 whitespace-nowrap">
                        {formatDate(m.created_at)}
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-700 truncate max-w-[100px]">
                        {m.demandeur_nom || `#${m.demandeur_id || "\u2014"}`}
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-700 truncate max-w-[100px]">
                        {m.fournisseur_nom ||
                          (m.candidats && Array.isArray(m.candidats)
                            ? m.candidats.map((c: any) => c.nom || c.id).join(", ")
                            : `#${m.fournisseur_id || "\u2014"}`)}
                      </td>
                      <td className="py-1.5 px-2 text-[9px] text-gray-500 truncate max-w-[120px]">
                        {m.besoin || "\u2014"}
                      </td>
                      <td className="py-1.5 px-2">
                        {(m.score_global != null || m.score != null) ? (
                          <span className="text-xs font-bold text-emerald-600">
                            {m.score_global ?? m.score}
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400">{"\u2014"}</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2">
                        <StatusBadge status={mapMatchStatus(m.status || m.statut)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
