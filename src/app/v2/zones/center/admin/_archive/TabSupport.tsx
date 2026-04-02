/**
 * TabSupport.tsx — Support admin: Diagnostics, DocForge, Templates
 * God Mode: toutes les donnees. Instance: donnees du tenant.
 */

import { useState, useEffect } from "react";
import {
  Stethoscope,
  BookOpen,
  FileText,
  Loader2,
  Inbox,
  Hash,
  Calendar,
  Layers,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BotBadge, StatusBadge } from "../shared/SectionComponents";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "diagnostics", label: "Diagnostics", icon: Stethoscope },
  { id: "docforge", label: "DocForge", icon: BookOpen },
  { id: "templates", label: "Templates", icon: FileText },
] as const;

// ═══════════════════════════════════════
// Diagnostics sub-tab
// ═══════════════════════════════════════

function DiagnosticsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.diagnosticIAList()
      .then(data => {
        const list = data?.items || [];
        if (Array.isArray(list)) setItems(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-gray-400">
        <Inbox className="h-8 w-8" />
        <span className="text-sm">Aucun diagnostic</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((d: any) => (
        <Card key={d.id} className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {d.nom || d.titre || d.type || `Diagnostic #${d.id}`}
            </div>
            <div className="flex items-center gap-2 text-[9px] text-gray-500">
              {d.type && (
                <span className="flex items-center gap-0.5">
                  <Hash className="h-3.5 w-3.5" />
                  {d.type}
                </span>
              )}
              {d.created_at && (
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(d.created_at).toLocaleDateString("fr-CA")}
                </span>
              )}
            </div>
          </div>
          {(d.score != null || d.score_global != null) && (
            <div className="flex flex-col items-end shrink-0">
              <span className={cn(
                "text-sm font-bold",
                (d.score ?? d.score_global) >= 70 ? "text-emerald-600" :
                (d.score ?? d.score_global) >= 40 ? "text-amber-600" : "text-red-600"
              )}>
                {d.score ?? d.score_global}/100
              </span>
              <span className="text-[9px] text-gray-400">score global</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// DocForge sub-tab
// ═══════════════════════════════════════

function DocForgePanel() {
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDocForgeLibraries()
      .then(data => {
        const list = data?.libraries || [];
        if (Array.isArray(list)) setLibraries(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (libraries.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-gray-400">
        <Inbox className="h-8 w-8" />
        <span className="text-sm">Aucune bibliotheque DocForge</span>
      </div>
    );
  }

  const mapDocForgeStatus = (s: string): "done" | "en-cours" | "a-faire" => {
    if (s === "done") return "done";
    if (s === "processing") return "en-cours";
    return "a-faire";
  };

  return (
    <div className="space-y-2">
      {libraries.map((lib: any) => (
        <Card key={lib.id} className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {lib.titre || lib.nom || `Bibliotheque #${lib.id}`}
            </div>
            <div className="flex items-center gap-2 text-[9px] text-gray-500">
              {lib.nb_blocs != null && (
                <span className="flex items-center gap-0.5">
                  <Layers className="h-3.5 w-3.5" />
                  {lib.nb_blocs} blocs
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={mapDocForgeStatus(lib.status || "pending")} />
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Templates sub-tab
// ═══════════════════════════════════════

function TemplatesPanel() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.docForgeTemplatesV2()
      .then(data => {
        const list = data?.templates || [];
        if (Array.isArray(list)) setTemplates(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-gray-400">
        <Inbox className="h-8 w-8" />
        <span className="text-sm">Aucun template DocForge</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {templates.map((t: any) => {
        const sections = Array.isArray(t.sections) ? t.sections : [];
        return (
          <Card key={t.id} className="p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="text-sm font-medium text-gray-800 truncate">
                  {t.titre || t.alias || `Template #${t.id}`}
                </span>
              </div>
              {t.type_template && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-purple-50 text-purple-700 border-purple-200 shrink-0 whitespace-nowrap">
                  {t.type_template}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[9px] text-gray-500">
              <span className="flex items-center gap-0.5">
                <Layers className="h-3.5 w-3.5" />
                {sections.length} section{sections.length !== 1 ? "s" : ""}
              </span>
              {t.bot_recommande && (
                <BotBadge code={t.bot_recommande} />
              )}
            </div>
            {t.description && (
              <p className="text-[9px] text-gray-400 line-clamp-2">{t.description}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// TabSupport — Composant principal
// ═══════════════════════════════════════

export function TabSupport({ mode, tenantId }: Props) {
  const [sub, setSub] = useState<string>("diagnostics");

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
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
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
      {sub === "diagnostics" && <DiagnosticsPanel />}
      {sub === "docforge" && <DocForgePanel />}
      {sub === "templates" && <TemplatesPanel />}
    </div>
  );
}
