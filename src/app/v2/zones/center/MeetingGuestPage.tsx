/**
 * MeetingGuestPage.tsx — Page externe pour les pionniers qui rejoignent un meeting (D-114)
 * Standalone — pas de sidebar, pas de canvas, pas d'auth requise
 * URL: app.usinebleue.ai/meeting/{slug}
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  Participant,
} from "livekit-client";

type GuestStatus = "join" | "connecting" | "connected" | "ended" | "error";

interface ParticipantInfo {
  identity: string;
  name: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  isSpeaking?: boolean;
}

interface Props {
  slug: string;
}

const API_KEY = import.meta.env.VITE_API_KEY || "";

// Noms humains des bots
const BOT_NAMES: Record<string, string> = {
  BCO: "CarlOS (CEO)", BCT: "Alex (CTO)", BCF: "François (CFO)",
  BCM: "Sophie (CMO)", BCS: "Simon (CSO)", BOO: "Julie (COO)",
  BFA: "Denis (Usine)", BHR: "Marie (RH)", BIO: "Inès (Innovation)",
  BRO: "Pierre (Ventes)", BLE: "Laurent (Légal)", BSE: "Samuel (Sécurité)",
};

// Labels humains pour les types
const TYPE_LABELS: Record<string, string> = {
  podcast: "Podcast — Table Ronde", board: "Conseil d'Administration",
  client: "Rencontre Client", brainstorm: "Brainstorm",
  strategie: "Session Stratégie", innovation: "Session Innovation",
  crise: "Mode Crise", debat: "Débat", analyse: "Analyse",
  decision: "Prise de Décision", diagnostic: "Diagnostic VITAA",
  aiguillage: "Aiguillage", resonance: "Deep Resonance",
  credo: "Protocole CREDO", travail: "Réunion de Travail",
  onboarding: "Onboarding", capsule: "Capsule Bot-à-Bot",
};

export function MeetingGuestPage({ slug }: Props) {
  const [status, setStatus] = useState<GuestStatus>("join");
  const [displayName, setDisplayName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [botCodes, setBotCodes] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Map<string, ParticipantInfo>>(new Map());
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [error, setError] = useState("");

  const roomRef = useRef<Room | null>(null);

  // Load meeting info on mount
  useEffect(() => {
    fetch(`/api/v1/meetings/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject("Meeting non trouvé"))
      .then(data => {
        setMeetingTitle(data.title || "Réunion");
        setMeetingType(data.meeting_type || "");
        setBotCodes(data.bot_codes || [data.bot_code || "BCO"]);
        if (data.status === "ended") {
          setError("Cette réunion est terminée.");
          setStatus("ended");
        }
      })
      .catch(() => {
        setError("Meeting non trouvé.");
        setStatus("error");
      });
  }, [slug]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.disconnect();
    };
  }, []);

  // Join meeting
  const handleJoin = useCallback(async () => {
    if (!displayName.trim()) return;
    setStatus("connecting");

    try {
      const res = await fetch(`/api/v1/meetings/${slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Erreur" }));
        throw new Error(body.detail || "Erreur de connexion");
      }

      const data = await res.json();

      // Connect to LiveKit
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        disconnectOnPageLeave: false,
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, participant) => {
        setParticipants(prev => {
          const next = new Map(prev);
          const info = next.get(participant.identity) || {
            identity: participant.identity,
            name: participant.name || participant.identity,
          };
          if (track.kind === Track.Kind.Audio) {
            const el = document.createElement("audio");
            el.autoplay = true;
            track.attach(el);
            info.audioTrack = track.mediaStreamTrack;
          } else if (track.kind === Track.Kind.Video) {
            info.videoTrack = track.mediaStreamTrack;
          }
          next.set(participant.identity, info);
          return next;
        });
      });

      room.on(RoomEvent.ParticipantConnected, (p) => {
        setParticipants(prev => {
          const next = new Map(prev);
          next.set(p.identity, { identity: p.identity, name: p.name || p.identity });
          return next;
        });
      });

      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        setParticipants(prev => {
          const next = new Map(prev);
          next.delete(p.identity);
          return next;
        });
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        const ids = new Set(speakers.map(s => s.identity));
        setParticipants(prev => {
          const next = new Map(prev);
          next.forEach((info) => { info.isSpeaking = ids.has(info.identity); });
          return next;
        });
      });

      room.on(RoomEvent.Disconnected, () => {
        setStatus("ended");
      });

      await room.connect(data.livekit_url, data.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;

      // Add existing participants
      const initial = new Map<string, ParticipantInfo>();
      initial.set(data.identity, { identity: data.identity, name: displayName + " (Vous)" });
      room.remoteParticipants.forEach((p) => {
        initial.set(p.identity, { identity: p.identity, name: p.name || p.identity });
      });
      setParticipants(initial);

      setStatus("connected");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
      setStatus("error");
    }
  }, [slug, displayName]);

  // Leave
  const handleLeave = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setStatus("ended");
  }, []);

  // Toggle mic/camera
  const toggleMic = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
    }
  }, [micEnabled]);

  const toggleCamera = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.setCameraEnabled(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    }
  }, [cameraEnabled]);

  // ── JOIN FORM ──
  if (status === "join") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/usine-bleue-logo.svg" alt="Usine Bleue" className="h-10 mx-auto mb-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <h1 className="text-xl font-bold text-gray-800">Réunion CarlOS</h1>
            {meetingTitle && (
              <p className="text-sm text-gray-500 mt-1">{meetingTitle}</p>
            )}
          </div>

          {/* Meeting info */}
          {meetingType && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-4 text-white text-center">
              <p className="text-xs opacity-80 mb-1">{TYPE_LABELS[meetingType] || meetingType}</p>
              {botCodes.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {botCodes.map(code => (
                    <span key={code} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full text-xs">
                      <span className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[8px] font-bold">
                        {(BOT_NAMES[code] || code)[0]}
                      </span>
                      {BOT_NAMES[code] || code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Join card */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre nom
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Entrez votre nom"
              className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              autoFocus
            />
            <button
              onClick={handleJoin}
              disabled={!displayName.trim()}
              className={cn(
                "w-full py-3 rounded-lg text-sm font-medium transition-colors",
                displayName.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Rejoindre la réunion
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Propulsé par CarlOS — Usine Bleue AI
          </p>
        </div>
      </div>
    );
  }

  // ── CONNECTING ──
  if (status === "connecting") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={() => { setStatus("join"); setError(""); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── ENDED ──
  if (status === "ended") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Réunion terminée</h2>
          <p className="text-sm text-gray-500 mb-6">Merci pour votre participation!</p>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
            <h3 className="text-base font-bold mb-2">Cette rencontre a été animée par CarlOS</h3>
            <p className="text-sm opacity-90 mb-4">Votre CEO Bot IA — Essayez gratuitement.</p>
            <a
              href={`/signup?ref=meeting-${slug}`}
              className="inline-block px-6 py-2.5 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Créer mon compte gratuit
            </a>
          </div>

          <p className="text-xs text-gray-400">
            Propulsé par CarlOS — Usine Bleue AI
          </p>
        </div>
      </div>
    );
  }

  // ── CONNECTED: video grid ──
  const participantList = Array.from(participants.values());

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-white flex-1 truncate">{meetingTitle}</h1>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-300">{participantList.length}</span>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4">
        <div className={cn(
          "grid gap-3 h-full",
          participantList.length <= 2 && "grid-cols-1 md:grid-cols-2",
          participantList.length <= 4 && participantList.length > 2 && "grid-cols-2",
          participantList.length > 4 && "grid-cols-3",
        )}>
          {participantList.map(p => (
            <GuestParticipantTile key={p.identity} participant={p} />
          ))}
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-center gap-3 shrink-0">
        <button
          onClick={toggleMic}
          className={cn(
            "p-3 rounded-full transition-colors",
            micEnabled ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-red-500 text-white hover:bg-red-600"
          )}
        >
          {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className={cn(
            "p-3 rounded-full transition-colors",
            cameraEnabled ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-700 text-gray-300"
          )}
        >
          {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </button>

        <button
          onClick={handleLeave}
          className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-2 font-medium text-sm"
        >
          <PhoneOff className="h-4 w-4" />
          Quitter
        </button>
      </div>
    </div>
  );
}


function GuestParticipantTile({ participant }: { participant: ParticipantInfo }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (participant.videoTrack && videoRef.current) {
      const stream = new MediaStream([participant.videoTrack]);
      videoRef.current.srcObject = stream;
    }
  }, [participant.videoTrack]);

  return (
    <div className={cn(
      "bg-gray-700 rounded-xl relative overflow-hidden flex items-center justify-center",
      participant.isSpeaking && "ring-2 ring-green-400"
    )}>
      {participant.videoTrack ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-500 flex items-center justify-center text-white text-2xl font-bold">
          {(participant.name || "?")[0].toUpperCase()}
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
        {participant.name}
      </div>
      {participant.isSpeaking && (
        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
      )}
    </div>
  );
}
