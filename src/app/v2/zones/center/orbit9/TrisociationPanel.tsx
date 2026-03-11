/**
 * TrisociationPanel.tsx — Panel video LiveKit pour rencontre 3 participants
 * Integre en stage 5 du flow JumelageLivePage
 * Reutilise la logique de VideoCallWidget (Room, events, reconnection)
 * Sprint C — Flow C Jumelage Live
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Camera, CameraOff, PhoneOff, BarChart3, Clock,
  Video, Users, Handshake, Loader2,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Button } from "../../../../components/ui/button";
import { BotAvatar } from "../shared/cahier-components";

// ── Types ──

interface TrisociationPanelProps {
  roomName: string;
  token: string;
  livekitUrl: string;
  matchId: number;
  besoin: string;
  demandeurName?: string;
  partenaireNames: string[];
  onEnd?: () => void;
}

// ── Composant ──

export function TrisociationPanel({
  roomName,
  token,
  livekitUrl,
  matchId,
  besoin,
  demandeurName = "Vous",
  partenaireNames,
  onEnd,
}: TrisociationPanelProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connected]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Simuler la connexion (en vrai, ca utiliserait livekit-client Room)
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnd = () => {
    setConnected(false);
    if (timerRef.current) clearInterval(timerRef.current);
    onEnd?.();
  };

  // ── Render ──

  if (connecting) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl p-8 text-white text-center shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-300" />
        <h3 className="text-lg font-bold mb-2">Connexion a la Trisociation...</h3>
        <p className="text-sm text-purple-300">Room: {roomName}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm text-red-700 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={onEnd}>Fermer</Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Trisociation en cours</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-200">Match #{matchId} — {besoin.slice(0, 40)}</span>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
            <Clock className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-mono text-white tabular-nums">{formatTime(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* Video grid — 3 participants */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {/* Demandeur (vous) */}
        <div className="aspect-video bg-gray-700 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
          {camOn ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
              <Users className="h-12 w-12 text-blue-300/50" />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <CameraOff className="h-8 w-8 text-gray-500" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 rounded-full px-2 py-0.5">
            <span className="text-[9px] text-white font-medium">{demandeurName}</span>
          </div>
          {!micOn && (
            <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
              <MicOff className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>

        {/* CarlOS (Tavus avatar ou placeholder) */}
        <div className="aspect-video bg-gray-700 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center">
            <BotAvatar code="CEOB" size="lg" />
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 rounded-full px-2 py-0.5">
            <span className="text-[9px] text-white font-medium">CarlOS</span>
          </div>
          <div className="absolute top-2 left-2 bg-green-500 rounded-full px-1.5 py-0.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[9px] text-white font-medium">IA</span>
          </div>
        </div>

        {/* Partenaire(s) */}
        <div className="aspect-video bg-gray-700 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-amber-800 to-orange-900 flex items-center justify-center">
            <Handshake className="h-12 w-12 text-amber-300/50" />
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 rounded-full px-2 py-0.5">
            <span className="text-[9px] text-white font-medium">{partenaireNames[0] || "Partenaire"}</span>
          </div>
          {!connected && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-xs text-gray-300">En attente...</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-gray-900 px-5 py-3 flex items-center justify-center gap-4">
        <button
          onClick={() => setMicOn(!micOn)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            micOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setCamOn(!camOn)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            camOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {camOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </button>

        <button
          className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all"
        >
          <BarChart3 className="h-4 w-4" />
        </button>

        <button
          onClick={handleEnd}
          className="w-12 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
