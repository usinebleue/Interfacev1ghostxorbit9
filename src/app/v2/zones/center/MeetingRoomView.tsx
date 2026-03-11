/**
 * MeetingRoomView.tsx — Vue hôte pour les meetings CarlOS (D-114)
 * Grille vidéo participants + transcript live + contrôles meeting
 * CarlOS = co-animateur IA dans la room LiveKit
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Copy,
  Check,
  Users,
  CircleDot,
  Square,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { api } from "../../api/client";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  Participant,
  LocalParticipant,
} from "livekit-client";

type MeetingStatus = "idle" | "creating" | "connecting" | "live" | "ended" | "error";

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: number;
}

interface MeetingData {
  slug: string;
  title: string;
  room_name: string;
  token: string;
  livekit_url: string;
  join_url: string;
  status: string;
}

interface ParticipantInfo {
  identity: string;
  name: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  isSpeaking?: boolean;
}

export function MeetingRoomView() {
  const { setActiveView } = useFrameMaster();

  // State
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>("idle");
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [meetingTitle, setMeetingTitle] = useState("Réunion Pioneer");
  const [participants, setParticipants] = useState<Map<string, ParticipantInfo>>(new Map());
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [existingMeetings, setExistingMeetings] = useState<any[]>([]);

  // Refs
  const roomRef = useRef<Room | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCursorRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Load existing meetings on mount
  useEffect(() => {
    api.meetingList().then(res => {
      setExistingMeetings(res.meetings || []);
    }).catch(() => {});
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Timer
  useEffect(() => {
    if (meetingStatus === "live") {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [meetingStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (roomRef.current) roomRef.current.disconnect();
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Create meeting
  const handleCreate = useCallback(async () => {
    setMeetingStatus("creating");
    try {
      const data = await api.meetingCreate({ title: meetingTitle });
      setMeetingData(data);
      setMeetingStatus("connecting");

      // Connect to LiveKit room
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

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        setParticipants(prev => {
          const next = new Map(prev);
          next.set(participant.identity, {
            identity: participant.identity,
            name: participant.name || participant.identity,
          });
          return next;
        });
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setParticipants(prev => {
          const next = new Map(prev);
          next.delete(participant.identity);
          return next;
        });
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        const speakerIds = new Set(speakers.map(s => s.identity));
        setParticipants(prev => {
          const next = new Map(prev);
          next.forEach((info, id) => {
            info.isSpeaking = speakerIds.has(id);
          });
          return next;
        });
      });

      await room.connect(data.livekit_url, data.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;

      // Add self as participant
      setParticipants(new Map([
        ["host-1", { identity: "host-1", name: "Carl (Vous)" }],
      ]));

      setMeetingStatus("live");
      setIsRecording(false);

      // Start transcript polling
      startTranscriptPolling(data.room_name);

      // Start the meeting (recording)
      api.meetingStart(data.slug).then(() => {
        setIsRecording(true);
      }).catch(err => console.warn("Recording start failed:", err));

    } catch (err) {
      console.error("Meeting creation failed:", err);
      setMeetingStatus("error");
    }
  }, [meetingTitle]);

  // Transcript polling (reuse voice events pattern)
  const startTranscriptPolling = useCallback((roomName: string) => {
    pollCursorRef.current = 0;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/voice/events/${roomName}?cursor=${pollCursorRef.current}`,
          { headers: { "X-API-Key": import.meta.env.VITE_API_KEY || "" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.events?.length > 0) {
          for (const evt of data.events) {
            if (evt.type === "exchange") {
              if (evt.user_text) {
                setTranscript(prev => [...prev, {
                  speaker: "Participant",
                  text: evt.user_text,
                  timestamp: Date.now() / 1000,
                }]);
              }
              if (evt.bot_text) {
                setTranscript(prev => [...prev, {
                  speaker: `CarlOS`,
                  text: evt.bot_text,
                  timestamp: Date.now() / 1000,
                }]);
              }
            }
          }
          pollCursorRef.current = data.cursor;
        }
      } catch { /* silent */ }
    }, 2000);
  }, []);

  // End meeting
  const handleEnd = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (meetingData?.slug) {
      try {
        await api.meetingEnd(meetingData.slug);
      } catch (err) {
        console.warn("Meeting end API failed:", err);
      }
    }
    setMeetingStatus("ended");
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [meetingData]);

  // Toggle mic
  const toggleMic = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
    }
  }, [micEnabled]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.setCameraEnabled(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    }
  }, [cameraEnabled]);

  // Copy join link
  const copyJoinLink = useCallback(() => {
    if (meetingData) {
      const url = `${window.location.origin}/meeting/${meetingData.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [meetingData]);

  // Resume existing meeting
  const handleResume = useCallback(async (slug: string) => {
    try {
      const data = await api.meetingGet(slug);
      if (data.status === "ended") return;
      // Rejoin with new token
      const joinRes = await api.meetingJoin(slug, { display_name: "Carl" });
      setMeetingData({
        slug: data.slug,
        title: data.title,
        room_name: data.room_name,
        token: joinRes.token,
        livekit_url: joinRes.livekit_url,
        join_url: `/meeting/${slug}`,
        status: data.status,
      });
      // Connect to room
      const room = new Room({ adaptiveStream: true, dynacast: true, disconnectOnPageLeave: false });
      room.on(RoomEvent.ParticipantConnected, (p) => {
        setParticipants(prev => { const n = new Map(prev); n.set(p.identity, { identity: p.identity, name: p.name || p.identity }); return n; });
      });
      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        setParticipants(prev => { const n = new Map(prev); n.delete(p.identity); return n; });
      });
      await room.connect(joinRes.livekit_url, joinRes.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;
      setParticipants(new Map([["host-1", { identity: "host-1", name: "Carl (Vous)" }]]));
      setMeetingStatus("live");
      startTranscriptPolling(data.room_name);
    } catch (err) {
      console.error("Resume failed:", err);
    }
  }, [startTranscriptPolling]);

  // ── IDLE: formulaire de création ──
  if (meetingStatus === "idle") {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-3xl mx-auto px-10 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-8">
            <h1 className="text-xl font-bold">Réunion CarlOS</h1>
            <p className="text-sm text-white/80 mt-1">
              Meetings avec CarlOS comme co-animateur IA — l'effet wow pour vos pionniers
            </p>
          </div>

          {/* Create new */}
          <div className="bg-white border rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Nouvelle réunion</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={meetingTitle}
                onChange={e => setMeetingTitle(e.target.value)}
                placeholder="Titre de la réunion"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer
              </button>
            </div>
          </div>

          {/* Existing meetings */}
          {existingMeetings.length > 0 && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Réunions récentes</h2>
              <div className="space-y-2">
                {existingMeetings.map(m => (
                  <div key={m.slug} className="flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-gray-500">
                        {m.status === "live" && <span className="text-red-500 font-medium">EN COURS</span>}
                        {m.status === "ended" && <span className="text-gray-400">Terminé</span>}
                        {m.status === "scheduled" && <span className="text-blue-500">Planifié</span>}
                        {" "}— {m.created_at ? new Date(m.created_at).toLocaleDateString("fr-CA") : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(m.status === "live" || m.status === "scheduled") && (
                        <button
                          onClick={() => handleResume(m.slug)}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Rejoindre
                        </button>
                      )}
                      {m.status === "ended" && m.ai_summary && Object.keys(m.ai_summary).length > 0 && (
                        <button
                          onClick={() => setActiveView("meeting-room")}
                          className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Podcast
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CREATING / CONNECTING ──
  if (meetingStatus === "creating" || meetingStatus === "connecting") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            {meetingStatus === "creating" ? "Création du meeting..." : "Connexion à LiveKit..."}
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (meetingStatus === "error") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-4">Erreur lors de la connexion au meeting.</p>
          <button onClick={() => setMeetingStatus("idle")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── ENDED ──
  if (meetingStatus === "ended") {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-3xl mx-auto px-10 py-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white mb-6">
            <h1 className="text-xl font-bold">Réunion terminée</h1>
            <p className="text-sm text-white/80 mt-1">{meetingData?.title} — {formatTime(elapsedTime)}</p>
          </div>

          {/* Transcript summary */}
          {transcript.length > 0 && (
            <div className="bg-white border rounded-xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Transcription ({transcript.length} entrées)</h2>
              <div className="max-h-96 overflow-auto space-y-2">
                {transcript.map((entry, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-semibold text-blue-600">{entry.speaker}:</span>{" "}
                    <span className="text-gray-700">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setMeetingStatus("idle")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              Nouvelle réunion
            </button>
            {meetingData?.slug && (
              <button
                onClick={() => window.open(`/api/v1/meetings/${meetingData.slug}/podcast`, "_blank")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                Voir le podcast
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── LIVE: meeting en cours ──
  const participantList = Array.from(participants.values());

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          {isRecording && (
            <div className="flex items-center gap-1.5">
              <CircleDot className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-500">REC</span>
            </div>
          )}
          <h1 className="text-sm font-semibold truncate">{meetingData?.title}</h1>
          <span className="text-xs text-gray-400 font-mono">{formatTime(elapsedTime)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">{participantList.length}</span>
        </div>

        {/* Copy invite link */}
        <button
          onClick={copyJoinLink}
          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copié!" : "Lien d'invitation"}
        </button>
      </div>

      {/* Main content: grid + transcript */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participant grid */}
        <div className="flex-1 p-4">
          <div className={cn(
            "grid gap-3 h-full",
            participantList.length <= 2 && "grid-cols-1 md:grid-cols-2",
            participantList.length <= 4 && participantList.length > 2 && "grid-cols-2",
            participantList.length > 4 && "grid-cols-3",
          )}>
            {participantList.map(p => (
              <ParticipantTile key={p.identity} participant={p} />
            ))}

            {/* CarlOS tile */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center relative">
              <img
                src="/agents/generated/ceo-carlos-standby-v3.png?v=5"
                alt="CarlOS"
                className="w-24 h-24 rounded-full object-cover ring-2 ring-white/30"
              />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-semibold text-white">CarlOS</p>
                <p className="text-[9px] text-white/70">Co-animateur IA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript panel */}
        <div className="w-80 border-l bg-white flex flex-col shrink-0">
          <div className="px-4 py-3 border-b">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Transcription Live</h3>
          </div>
          <div className="flex-1 overflow-auto px-4 py-2 space-y-2">
            {transcript.length === 0 && (
              <p className="text-xs text-gray-400 italic">En attente de parole...</p>
            )}
            {transcript.map((entry, i) => (
              <div key={i} className="text-xs leading-relaxed">
                <span className={cn(
                  "font-semibold",
                  entry.speaker === "CarlOS" ? "text-blue-600" : "text-gray-700"
                )}>
                  {entry.speaker}:
                </span>{" "}
                <span className="text-gray-600">{entry.text}</span>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-center gap-3 shrink-0">
        <button
          onClick={toggleMic}
          className={cn(
            "p-3 rounded-full transition-colors",
            micEnabled ? "bg-gray-100 hover:bg-gray-200" : "bg-red-500 text-white hover:bg-red-600"
          )}
          title={micEnabled ? "Couper le micro" : "Activer le micro"}
        >
          {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className={cn(
            "p-3 rounded-full transition-colors",
            cameraEnabled ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-200"
          )}
          title={cameraEnabled ? "Couper la caméra" : "Activer la caméra"}
        >
          {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </button>

        <button
          onClick={handleEnd}
          className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-2 font-medium text-sm"
        >
          <Square className="h-4 w-4" />
          Terminer
        </button>
      </div>
    </div>
  );
}


// ── Participant tile ──

function ParticipantTile({ participant }: { participant: ParticipantInfo }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (participant.videoTrack && videoRef.current) {
      const stream = new MediaStream([participant.videoTrack]);
      videoRef.current.srcObject = stream;
    }
  }, [participant.videoTrack]);

  return (
    <div className={cn(
      "bg-gray-200 rounded-xl relative overflow-hidden flex items-center justify-center",
      participant.isSpeaking && "ring-2 ring-green-400"
    )}>
      {participant.videoTrack ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl font-bold">
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
