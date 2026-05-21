/**
 * DrivePickerModal.tsx — Panneau de sélection de fichiers
 *
 * Style identique au ControlPanel (Modes/Agents) :
 *   shrink-0 bg-white border-t border-gray-200 flex flex-col
 *   grid grid-cols-3 gap-1.5 pour les éléments
 *
 * Deux onglets :
 *   "Brain Team" — Documents générés par les bots (/api/v1/bot-documents)
 *   "Google Drive" — Fichiers rclone (/api/v1/drive/list)
 */

import { useState, useEffect, useCallback } from "react";
import {
  X, FileText, Folder, ChevronRight, Loader2, HardDrive, Bot,
} from "lucide-react";
import { cn } from "../components/ui/utils";

// ── Auth headers (même pattern que client.ts) ──────────────────────────────────
function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("brain_token");
  if (token) {
    h["Authorization"] = `Bearer ${token}`;
  } else {
    const key = (import.meta as any).env?.VITE_API_KEY ?? "";
    if (key) h["X-API-Key"] = key;
  }
  return h;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type BotDoc = {
  id: number;
  titre: string;
  bot_code: string;
  tool_name: string;
  type_doc: string;
  created_at: string;
  contenu_preview?: string;
};

type DriveItem = {
  ID: string;
  Name: string;
  IsDir: boolean;
  Size: number;
  MimeType: string;
};

interface DrivePickerModalProps {
  botCode: string;
  onClose: () => void;
  onSelect: (content: string, label: string) => void;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

const BOT_LABEL: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "Tim",   CFOB: "Frank",    CMOB: "Mathilde",
  CSOB: "Simone", COOB: "Olivier", CPOB: "Paco",   CHROB: "Hélène",
  CROB: "Rich",   CISOB: "Sébastien", CLOB: "Loulou", CINOB: "Inès",
};

// ── Composant ─────────────────────────────────────────────────────────────────

export function DrivePickerModal({ botCode, onClose, onSelect }: DrivePickerModalProps) {
  const [tab, setTab] = useState<"brain" | "drive">("brain");
  const [docs, setDocs] = useState<BotDoc[]>([]);
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [drivePath, setDrivePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Charger les documents Brain Team
  const loadDocs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/bot-documents?limit=30", { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDocs(data.documents ?? []);
    } catch {
      setError("Impossible de charger les fichiers Brain Team");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les fichiers Drive
  const loadDrive = useCallback(async (path: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/drive/list?path=${encodeURIComponent(path)}`,
        { headers: getHeaders() },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDriveItems(data.items ?? []);
      setDrivePath(path);
    } catch {
      setError("Google Drive non connecté — configurez-le dans Données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "brain") loadDocs();
    else loadDrive(drivePath);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sélectionner un document Brain Team
  const handleSelectDoc = async (doc: BotDoc) => {
    setLoadingDoc(doc.id);
    try {
      const res = await fetch(`/api/v1/bot-documents/${doc.id}/content`, { headers: getHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onSelect(data.contenu ?? doc.contenu_preview ?? "", doc.titre);
    } catch {
      onSelect(doc.contenu_preview ?? "", doc.titre);
    } finally {
      setLoadingDoc(null);
    }
  };

  // Naviguer / sélectionner dans Drive
  const handleDriveItem = async (item: DriveItem) => {
    if (item.IsDir) {
      const newPath = drivePath ? `${drivePath}/${item.Name}` : item.Name;
      loadDrive(newPath);
    } else {
      onSelect(`[Fichier Drive: ${item.Name}]`, item.Name);
    }
  };

  // Breadcrumb Drive
  const pathParts = drivePath ? drivePath.split("/") : [];

  return (
    <div className="shrink-0 bg-white border-t border-gray-200 flex flex-col">

      {/* ── Header : onglets + fermer ── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("brain")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer",
              tab === "brain"
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100",
            )}
          >
            <Bot className="h-3 w-3" />
            Fichiers Brain Team
          </button>
          <button
            onClick={() => setTab("drive")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer",
              tab === "drive"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100",
            )}
          >
            <HardDrive className="h-3 w-3" />
            Google Drive
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded cursor-pointer"
        >
          <X className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      {/* ── Contenu ── */}
      <div className="px-3 pb-3 max-h-44 overflow-y-auto">

        {/* Chargement */}
        {loading && (
          <div className="flex items-center justify-center py-5">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {/* Erreur */}
        {error && !loading && (
          <p className="text-[10px] text-red-500 text-center py-4">{error}</p>
        )}

        {/* ── Onglet Brain Team ── */}
        {tab === "brain" && !loading && !error && (
          <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Fichiers générés par les bots
            </div>
            {docs.length === 0 ? (
              <p className="text-[10px] text-gray-400 text-center py-4">
                Aucun fichier généré — demandez un rapport à un bot
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {docs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    disabled={loadingDoc === doc.id}
                    className="flex flex-col items-start gap-1 px-2 py-2 rounded-xl text-[10px] font-medium border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300 transition-colors cursor-pointer text-left"
                  >
                    {loadingDoc === doc.id
                      ? <Loader2 className="h-3 w-3 animate-spin shrink-0 text-sky-400" />
                      : <FileText className="h-3 w-3 shrink-0 text-sky-500" />
                    }
                    <span className="line-clamp-2 leading-tight">{doc.titre}</span>
                    <span className="text-sky-400 text-[9px]">
                      {BOT_LABEL[doc.bot_code] ?? doc.bot_code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Onglet Google Drive ── */}
        {tab === "drive" && !loading && !error && (
          <div>
            {/* Breadcrumb */}
            {pathParts.length > 0 && (
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                <button
                  onClick={() => loadDrive("")}
                  className="text-[10px] text-emerald-600 hover:underline cursor-pointer"
                >
                  Racine
                </button>
                {pathParts.map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <ChevronRight className="h-2.5 w-2.5 text-gray-400" />
                    {i < pathParts.length - 1 ? (
                      <button
                        onClick={() => loadDrive(pathParts.slice(0, i + 1).join("/"))}
                        className="text-[10px] text-emerald-600 hover:underline cursor-pointer"
                      >
                        {part}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-600">{part}</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Liste */}
            {driveItems.length === 0 ? (
              <p className="text-[10px] text-gray-400 text-center py-4">
                Dossier vide ou Drive non configuré
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {driveItems.map(item => (
                  <button
                    key={item.ID || item.Name}
                    onClick={() => handleDriveItem(item)}
                    className={cn(
                      "flex flex-col items-start gap-1 px-2 py-2 rounded-xl text-[10px] font-medium border transition-colors cursor-pointer text-left",
                      item.IsDir
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300",
                    )}
                  >
                    {item.IsDir
                      ? <Folder className="h-3 w-3 shrink-0 text-emerald-500" />
                      : <FileText className="h-3 w-3 shrink-0 text-gray-400" />
                    }
                    <span className="line-clamp-2 leading-tight">{item.Name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
