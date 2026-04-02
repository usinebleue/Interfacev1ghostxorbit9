/**
 * TabMarketplace.tsx — Orbit9 Marketplace admin view
 * Sous-tabs: Membres | Cellules | Matches
 * God: shows all. Instance: scoped to tenant.
 */

import { useState, useEffect } from "react";
import { Users, Hexagon, GitMerge, Inbox, Loader2, MapPin, Factory, Star } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "membres", label: "Membres", icon: Users },
  { id: "cellules", label: "Cellules", icon: Hexagon },
  { id: "matches", label: "Matches", icon: GitMerge },
] as const;

// ═══════════════════════════════════════
// Status badge — matches design-system pattern: text-[9px] font-bold px-1.5 py-0.5 rounded border
// ═══════════════════════════════════════

function MarketStatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    actif:      { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    active:     { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    pending:    { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
    en_attente: { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
    accepted:   { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
    accepte:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
    rejected:   { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
    refuse:     { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
    inactif:    { bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200" },
    fermee:     { bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200" },
  };
  const cfg = colors[status?.toLowerCase()] || { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", cfg.bg, cfg.text, cfg.border)}>
      {status || "\u2014"}
    </span>
  );
}

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return null;
  const color = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-bold", color)}>
      <Star className="h-3.5 w-3.5" />
      {score}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-xs">Chargement...</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
      <Inbox className="h-8 w-8" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════
// Membres sub-tab
// ═══════════════════════════════════════

function MembresView({ mode, tenantId }: Props) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listOrbit9Members()
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.members || [];
        setMembers(list);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [mode, tenantId]);

  if (loading) return <LoadingState />;
  if (members.length === 0) return <EmptyState label="Aucun membre Orbit9" />;

  return (
    <div className="space-y-2">
      {members.map((m: any) => (
        <Card key={m.id} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-[9px] font-bold text-white">
              {(m.nom_entreprise || m.nom || "??").slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-white truncate flex-1">{m.nom_entreprise || m.nom || "Sans nom"}</span>
            <ScoreBadge score={m.score_global || m.score} />
            <MarketStatusBadge status={m.status || "actif"} />
          </div>
          <div className="px-3 py-2">
            <div className="flex items-center gap-3 text-[9px] text-gray-400">
              {m.secteur && (
                <span className="flex items-center gap-0.5">
                  <Factory className="h-3.5 w-3.5" />
                  {m.secteur}
                </span>
              )}
              {m.region && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {m.region}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Cellules sub-tab
// ═══════════════════════════════════════

function CellulesView({ mode, tenantId }: Props) {
  const [cellules, setCellules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listOrbit9Cellules()
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.cellules || [];
        setCellules(list);
      })
      .catch(() => setCellules([]))
      .finally(() => setLoading(false));
  }, [mode, tenantId]);

  if (loading) return <LoadingState />;
  if (cellules.length === 0) return <EmptyState label="Aucune cellule Orbit9" />;

  return (
    <div className="space-y-2">
      {cellules.map((c: any) => (
        <Card key={c.id} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500">
            <Hexagon className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white truncate flex-1">{c.nom || "Cellule sans nom"}</span>
            <MarketStatusBadge status={c.status || "active"} />
          </div>
          <div className="px-3 py-2">
            <div className="text-xs text-gray-600">
              {c.type_cellule || "standard"}
              {c.nb_membres != null && ` \u2014 ${c.nb_membres} membre${c.nb_membres !== 1 ? "s" : ""}`}
              {c.membres && Array.isArray(c.membres) && ` \u2014 ${c.membres.length} membre${c.membres.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Matches sub-tab
// ═══════════════════════════════════════

function MatchesView({ mode, tenantId }: Props) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listOrbit9Matches()
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.matches || [];
        setMatches(list);
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [mode, tenantId]);

  if (loading) return <LoadingState />;
  if (matches.length === 0) return <EmptyState label="Aucun match Orbit9" />;

  return (
    <div className="space-y-2">
      {matches.map((m: any) => (
        <Card key={m.id} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <GitMerge className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white truncate flex-1">
              {m.demandeur_nom || `#${m.demandeur_id || "?"}`}
              <span className="text-white/60 mx-1">x</span>
              {m.fournisseur_nom || m.candidats?.map((c: any) => c.nom || c.id).join(", ") || `#${m.fournisseur_id || "?"}`}
            </span>
            <ScoreBadge score={m.score_global || m.score} />
            <MarketStatusBadge status={m.status || "pending"} />
          </div>
          <div className="px-3 py-2">
            <div className="text-xs text-gray-600 truncate">
              {m.besoin || "Aucun besoin specifie"}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Main export
// ═══════════════════════════════════════

export function TabMarketplace({ mode, tenantId }: Props) {
  const [sub, setSub] = useState<string>("membres");

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                sub === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {sub === "membres" && <MembresView mode={mode} tenantId={tenantId} />}
      {sub === "cellules" && <CellulesView mode={mode} tenantId={tenantId} />}
      {sub === "matches" && <MatchesView mode={mode} tenantId={tenantId} />}
    </div>
  );
}
