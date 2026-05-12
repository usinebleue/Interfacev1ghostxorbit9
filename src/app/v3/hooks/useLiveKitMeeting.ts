/**
 * useLiveKitMeeting.ts — Hook LiveKit réunion extrait de MeetingRoomView
 *
 * Gère: création room, connexion, événements participants, micro/caméra, timer, cleanup.
 * Utilisé par WorkspacePhasesPanel pour intégrer la réunion dans le workspace.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "../../v2/api/client";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  Participant,
} from "livekit-client";

export type MeetingStatus = "idle" | "creating" | "connecting" | "live" | "ended" | "error";

export interface ParticipantInfo {
  identity: string;
  name: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  isSpeaking?: boolean;
}

export interface MeetingData {
  slug: string;
  title: string;
  room_name: string;
  token: string;
  livekit_url: string;
}

export interface UseLiveKitMeetingReturn {
  meetingStatus: MeetingStatus;
  meetingData: MeetingData | null;
  participants: Map<string, ParticipantInfo>;
  micEnabled: boolean;
  cameraEnabled: boolean;
  elapsedTime: number;
  startMeeting: (type: string, title: string, botCodes?: string[]) => Promise<void>;
  endMeeting: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  roomRef: React.MutableRefObject<Room | null>;
}

export function useLiveKitMeeting(): UseLiveKitMeetingReturn {
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>("idle");
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [participants, setParticipants] = useState<Map<string, ParticipantInfo>>(new Map());
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);

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
      if (timerRef.current) clearInterval(timerRef.current);
      if (roomRef.current) roomRef.current.disconnect();
      audioElementsRef.current.forEach(el => { el.srcObject = null; el.remove(); });
      audioElementsRef.current = [];
    };
  }, []);

  const startMeeting = useCallback(async (type: string, title: string, botCodes?: string[]) => {
    if (meetingStatus === "creating" || meetingStatus === "connecting" || meetingStatus === "live") return;
    setMeetingStatus("creating");
    setElapsedTime(0);

    // Mobile autoplay fix: warm up AudioContext during user gesture (synchronous, before any await)
    // iOS/Android require AudioContext.resume() within a tap/click context
    try {
      const _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (_ctx.state === "suspended") _ctx.resume();
    } catch {}

    try {
      const data = await api.meetingCreate({ title, meeting_type: type, ...(botCodes && botCodes.length > 0 ? { bot_codes: botCodes } : {}) });
      setMeetingData({
        slug: data.slug,
        title: data.title || title,
        room_name: data.room_name,
        token: data.token,
        livekit_url: data.livekit_url,
      });
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
            // Reuse pre-warmed audio element or create new one
            let el = audioElementsRef.current.find(a => !a.srcObject);
            if (!el) {
              el = document.createElement("audio");
              el.autoplay = true;
              (el as any).playsInline = true;
              document.body.appendChild(el);
              audioElementsRef.current.push(el);
            }
            track.attach(el);
            el.play().catch(() => {});
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
          next.forEach((info, _id) => {
            info.isSpeaking = speakerIds.has(info.identity);
          });
          return next;
        });
      });

      await room.connect(data.livekit_url, data.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      // LiveKit native autoplay handler — enables audio playback on mobile browsers
      room.startAudio().catch(() => {});

      roomRef.current = room;

      // Add self as participant
      setParticipants(new Map([
        ["host-1", { identity: "host-1", name: "Carl (Vous)" }],
      ]));

      setMeetingStatus("live");

      // Start the meeting (recording)
      api.meetingStart(data.slug).catch(err => console.warn("Recording start failed:", err));

    } catch (err) {
      console.error("Meeting creation failed:", err);
      setMeetingStatus("error");
    }
  }, [meetingStatus]);

  const endMeeting = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    // Clean up audio elements
    audioElementsRef.current.forEach(el => { el.srcObject = null; el.remove(); });
    audioElementsRef.current = [];
    if (meetingData?.slug) {
      api.meetingEnd(meetingData.slug).catch(err => console.warn("Meeting end failed:", err));
    }
    setMeetingStatus("ended");
    setParticipants(new Map());
    // Reset after 2s so UI can clean up
    setTimeout(() => {
      setMeetingStatus("idle");
      setMeetingData(null);
      setElapsedTime(0);
    }, 2000);
  }, [meetingData]);

  const toggleMic = useCallback(async () => {
    if (roomRef.current && meetingStatus === "live") {
      const next = !micEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
    }
  }, [micEnabled, meetingStatus]);

  const toggleCamera = useCallback(async () => {
    if (roomRef.current && meetingStatus === "live") {
      const next = !cameraEnabled;
      await roomRef.current.localParticipant.setCameraEnabled(next);
      setCameraEnabled(next);

      // Attach/detach local video track to the host-1 participant tile
      setParticipants(prev => {
        const updated = new Map(prev);
        const hostInfo = updated.get("host-1") || { identity: "host-1", name: "Carl (Vous)" };
        if (next) {
          const camPub = roomRef.current?.localParticipant.getTrackPublication(Track.Source.Camera);
          hostInfo.videoTrack = camPub?.track?.mediaStreamTrack;
        } else {
          hostInfo.videoTrack = undefined;
        }
        updated.set("host-1", { ...hostInfo });
        return updated;
      });
    }
  }, [cameraEnabled, meetingStatus]);

  return {
    meetingStatus,
    meetingData,
    participants,
    micEnabled,
    cameraEnabled,
    elapsedTime,
    startMeeting,
    endMeeting,
    toggleMic,
    toggleCamera,
    roomRef,
  };
}
