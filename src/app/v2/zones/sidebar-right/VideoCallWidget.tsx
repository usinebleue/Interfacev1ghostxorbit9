/**
 * VideoCallWidget.tsx — Bloc Communication unifie
 * Video bot 16:9 (change par departement) + call bar
 * Call bar: avatar Carl + presence + boutons Appel/Video
 * Sprint B — Bloc Communication (D-078)
 */

import { useState } from "react";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";

const BOT_GRADIENT: Record<string, string> = {
  BCO: "from-blue-600 to-blue-500",
  BCT: "from-violet-600 to-violet-500",
  BCF: "from-emerald-600 to-emerald-500",
  BCM: "from-pink-600 to-pink-500",
  BCS: "from-red-600 to-red-500",
  BOO: "from-orange-600 to-orange-500",
  BFA: "from-slate-600 to-slate-500",
  BHR: "from-teal-600 to-teal-500",
  BIO: "from-cyan-600 to-cyan-500",
  BCC: "from-rose-600 to-rose-500",
  BPO: "from-fuchsia-600 to-fuchsia-500",
  BRO: "from-amber-600 to-amber-500",
  BLE: "from-indigo-600 to-indigo-500",
  BSE: "from-zinc-600 to-zinc-500",
};

const BOT_ROLES: Record<string, string> = {
  BCO: "CEO", BCT: "CTO", BCF: "CFO", BCM: "CMO",
  BCS: "CSO", BOO: "COO", BFA: "Factory", BHR: "CHRO",
  BIO: "CIO", BCC: "CCO", BPO: "CPO", BRO: "CRO",
  BLE: "Legal", BSE: "Security",
};

export function VideoCallWidget() {
  const { activeBotCode, activeBot } = useFrameMaster();
  const [phoneOn, setPhoneOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [botAudioOn, setBotAudioOn] = useState(true);

  const avatar = BOT_AVATAR[activeBotCode];
  const botName = activeBot?.nom || BOT_ROLES[activeBotCode] || "CarlOS";
  const botRole = BOT_ROLES[activeBotCode] || "Agent";
  const gradient = BOT_GRADIENT[activeBotCode] || "from-blue-600 to-blue-500";

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
        </span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          CarlOS Live
        </span>
      </div>

      {/* Bot video — 16:9 */}
      <div className="relative rounded-t-lg overflow-hidden aspect-video bg-gray-900">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", gradient)} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {avatar ? (
            <img
              src={avatar}
              alt={botName}
              className="w-10 h-10 rounded-full ring-2 ring-white/40 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
              {botRole.slice(0, 2)}
            </div>
          )}
          <span className="text-[10px] text-white/90 font-medium mt-1">{botName}</span>
          <span className="text-[8px] text-white/50">{BOT_SUBTITLE[activeBotCode] || botRole}</span>
        </div>

        {/* Audio toggle — top right */}
        <button
          onClick={() => setBotAudioOn(!botAudioOn)}
          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/80 transition-colors cursor-pointer"
        >
          {botAudioOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        </button>

        {/* Role badge — bottom left */}
        <div className="absolute bottom-1.5 left-1.5">
          <span className="text-[9px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded">{botRole}</span>
        </div>
      </div>

      {/* Call bar — avatar Carl + presence + Appel / Video */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-b-lg px-2.5 py-2 -mt-2">
        {/* Avatar Carl + presence */}
        <div className="relative shrink-0">
          <img
            src="/agents/carl-fugere.jpg"
            alt="Carl"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-[1.5px] border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-700 leading-tight">Carl Fugere</p>
          <p className="text-[9px] text-green-600 font-medium">En ligne</p>
        </div>

        {/* Appel */}
        <button
          onClick={() => setPhoneOn(!phoneOn)}
          className={cn(
            "p-2 rounded-full transition-all cursor-pointer",
            phoneOn
              ? "bg-blue-100 text-blue-600 ring-1 ring-blue-300 shadow-sm"
              : "bg-white text-gray-400 hover:bg-blue-50 hover:text-blue-500 border border-gray-200"
          )}
          title={phoneOn ? "Raccrocher" : "Appeler"}
        >
          {phoneOn ? <PhoneOff className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
        </button>

        {/* Video */}
        <button
          onClick={() => setVideoOn(!videoOn)}
          className={cn(
            "p-2 rounded-full transition-all cursor-pointer",
            videoOn
              ? "bg-purple-100 text-purple-600 ring-1 ring-purple-300 shadow-sm"
              : "bg-white text-gray-400 hover:bg-purple-50 hover:text-purple-500 border border-gray-200"
          )}
          title={videoOn ? "Couper la video" : "Activer la video"}
        >
          {videoOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
