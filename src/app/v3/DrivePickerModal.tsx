/**
 * DrivePickerModal.tsx — Sélecteur de fichiers Google Drive
 *
 * Style identique au ControlPanel (Modes/Agents) :
 *   shrink-0 bg-white border-t border-gray-200 flex flex-col
 *   grid grid-cols-3 gap-1.5 pour les éléments
 *
 * Un seul onglet : Google Drive (rclone /api/v1/drive/list)
 */

import { useState, useEffect, useCallback } from "react";
import { X, FileText, Folder, ChevronRight, Loader2, HardDrive } from "lucide-react";
import { cn } from "../components/ui/utils";

// ── Auth headers ──────────────────────────────────────────────────────────────
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

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Composant ─────────────────────────────────────────────────────────────────

export function DrivePickerModal({ botCode: _botCode, onClose, onSelect }: DrivePickerModalProps) {
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [drivePath, setDrivePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => { loadDrive(""); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDriveItem = (item: DriveItem) => {
    if (item.IsDir) {
      const newPath = drivePath ? `${drivePath}/${item.Name}` : item.Name;
      loadDrive(newPath);
    } else {
      onSelect(`[Fichier Drive: ${item.Name}]`, item.Name);
    }
  };

  const pathParts = drivePath ? drivePath.split("/") : [];

  return (
    <div className="shrink-0 bg-white border-t border-gray-200 flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <div className="flex items-center gap-1.5">
          <HardDrive className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[10px] font-semibold text-gray-700">Google Drive</span>
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

        {loading && (
          <div className="flex items-center justify-center py-5">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {error && !loading && (
          <p className="text-[10px] text-red-500 text-center py-4">{error}</p>
        )}

        {!loading && !error && (
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
