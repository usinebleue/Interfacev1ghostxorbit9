/**
 * MeetingVideoStrip.tsx — Barre vidéo en bas du workspace pendant une réunion
 *
 * Layout: h-24 bg-gray-900 border-t border-gray-700 shrink-0
 * Contient: indicateur réunion, vignettes participants, contrôles (mic/cam/fin), timer
 */

import { useRef, useEffect } from "react";
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Users, Loader2 } from "lucide-react";
import { cn } from "../../components/ui/utils";
import type { MeetingStatus, ParticipantInfo } from "../hooks/useLiveKitMeeting";

interface MeetingVideoStripProps {
  meetingStatus: MeetingStatus;
  meetingTitle: string;
  participants: Map<string, ParticipantInfo>;
  micEnabled: boolean;
  cameraEnabled: boolean;
  elapsedTime: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEndMeeting: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function ParticipantTile({ participant }: { participant: ParticipantInfo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLocal = participant.identity === "host-1";

  useEffect(() => {
    if (participant.videoTrack && videoRef.current) {
      const stream = new MediaStream([participant.videoTrack]);
      videoRef.current.srcObject = stream;
    } else if (!participant.videoTrack && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [participant.videoTrack]);

  return (
    <div className={cn(
      "w-20 h-14 bg-gray-700 rounded-lg relative overflow-hidden flex items-center justify-center shrink-0",
      participant.isSpeaking && "ring-2 ring-green-400"
    )}>
      {participant.videoTrack ? (
        <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", isLocal && "[transform:scaleX(-1)]")} />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold">
          {(participant.name || "?")[0].toUpperCase()}
        </div>
      )}
      <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[8px] text-white/80 text-center truncate bg-black/40 rounded px-0.5">
        {participant.name}
      </span>
    </div>
  );
}

export function MeetingVideoStrip({
  meetingStatus,
  meetingTitle,
  participants,
  micEnabled,
  cameraEnabled,
  elapsedTime,
  onToggleMic,
  onToggleCamera,
  onEndMeeting,
}: MeetingVideoStripProps) {
  if (meetingStatus === "idle") return null;

  const participantList = Array.from(participants.values());

  // Creating/connecting state
  if (meetingStatus === "creating" || meetingStatus === "connecting") {
    return (
      <div className="h-16 bg-gray-900 border-t border-gray-700 shrink-0 flex items-center justify-center gap-2 px-3">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-xs text-white/70">
          {meetingStatus === "creating" ? "Création de la réunion..." : "Connexion à LiveKit..."}
        </span>
      </div>
    );
  }

  // Ended state — brief confirmation
  if (meetingStatus === "ended") {
    return (
      <div className="h-16 bg-gray-900 border-t border-gray-700 shrink-0 flex items-center justify-center gap-2 px-3">
        <span className="text-xs text-white/70">Réunion terminée</span>
      </div>
    );
  }

  // Error state
  if (meetingStatus === "error") {
    return (
      <div className="h-16 bg-gray-900 border-t border-gray-700 shrink-0 flex items-center justify-center gap-2 px-3">
        <span className="text-xs text-red-400">Erreur de connexion</span>
      </div>
    );
  }

  // Live state
  return (
    <div className="h-24 bg-gray-900 border-t border-gray-700 shrink-0 flex items-center px-3 gap-3">
      {/* Indicateur réunion */}
      <div className="flex flex-col items-start gap-0.5 shrink-0 min-w-0 max-w-[140px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-white/60 font-medium truncate">En réunion</span>
        </div>
        <span className="text-[9px] text-white/40 truncate w-full">{meetingTitle}</span>
        <span className="text-[10px] text-white/50 font-mono">{formatTime(elapsedTime)}</span>
      </div>

      {/* Vignettes participants */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
        {participantList.map(p => (
          <ParticipantTile key={p.identity} participant={p} />
        ))}
        {/* CarlOS tile */}
        <div className="w-20 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shrink-0 relative">
          <img
            src="/agents/generated/ceo-carlos-standby.png"
            alt="CarlOS"
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[8px] text-white/80 text-center bg-black/40 rounded px-0.5">CarlOS</span>
        </div>
      </div>

      {/* Compteur participants */}
      <div className="flex items-center gap-1 shrink-0">
        <Users className="h-3.5 w-3.5 text-white/50" />
        <span className="text-[10px] text-white/50">{participantList.length + 1}</span>
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMic}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer",
            micEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>
        <button
          onClick={onToggleCamera}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer",
            cameraEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-600 hover:bg-gray-500 text-white/70"
          )}
        >
          {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </button>
        <button
          onClick={onEndMeeting}
          className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
