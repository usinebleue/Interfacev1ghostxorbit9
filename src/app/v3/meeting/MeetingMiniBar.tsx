/**
 * MeetingMiniBar.tsx — Barre compacte h-12 pour mobile (onglet discussion)
 *
 * Lit meetingControls + activeMeeting depuis AmorcerContext.
 * Pas d'appel a useLiveKitMeeting() — evite un 2e mount du hook.
 *
 * - Idle/pas de meeting → null
 * - Creating/connecting → h-10 loader
 * - Live → h-12 : red pulse dot + titre + timer + mic toggle + hangup
 * - Ended → h-10 "Reunion terminee" (auto-dismiss)
 */

import { useState, useEffect } from "react";
import { Mic, MicOff, PhoneOff, Loader2 } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { useAmorcer } from "../AmorcerContext";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function MeetingMiniBar() {
  const { meetingControls, activeMeeting } = useAmorcer();
  const [showEnded, setShowEnded] = useState(false);

  // Auto-dismiss "ended" after 2.5s
  useEffect(() => {
    if (meetingControls?.meetingStatus === "ended") {
      setShowEnded(true);
      const t = setTimeout(() => setShowEnded(false), 2500);
      return () => clearTimeout(t);
    }
    setShowEnded(false);
  }, [meetingControls?.meetingStatus]);

  // Nothing to show
  if (!meetingControls || meetingControls.meetingStatus === "idle") return null;

  const { meetingStatus, micEnabled, elapsedTime, toggleMic, endMeeting } = meetingControls;
  const title = activeMeeting?.title || "Reunion";

  // Creating / connecting
  if (meetingStatus === "creating" || meetingStatus === "connecting") {
    return (
      <div className="h-10 bg-gray-900 shrink-0 flex items-center justify-center gap-2 px-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
        <span className="text-[11px] text-white/70">
          {meetingStatus === "creating" ? "Creation..." : "Connexion..."}
        </span>
      </div>
    );
  }

  // Ended
  if (meetingStatus === "ended" || showEnded) {
    if (!showEnded) return null;
    return (
      <div className="h-10 bg-gray-900 shrink-0 flex items-center justify-center px-3">
        <span className="text-[11px] text-white/60">Reunion terminee</span>
      </div>
    );
  }

  // Error
  if (meetingStatus === "error") {
    return (
      <div className="h-10 bg-gray-900 shrink-0 flex items-center justify-center px-3">
        <span className="text-[11px] text-red-400">Erreur de connexion</span>
      </div>
    );
  }

  // Live
  return (
    <div className="h-12 bg-gray-900 shrink-0 flex items-center px-3 gap-2">
      {/* Red pulse dot */}
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />

      {/* Title — truncated */}
      <span className="text-[11px] text-white/80 font-medium truncate min-w-0 flex-1">
        {title}
      </span>

      {/* Timer */}
      <span className="text-[11px] text-white/60 font-mono shrink-0">
        {formatTime(elapsedTime)}
      </span>

      {/* Mic toggle */}
      <button
        onClick={toggleMic}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0",
          micEnabled ? "bg-gray-700 text-white" : "bg-red-500 text-white"
        )}
      >
        {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
      </button>

      {/* Hangup */}
      <button
        onClick={endMeeting}
        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
      >
        <PhoneOff className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
