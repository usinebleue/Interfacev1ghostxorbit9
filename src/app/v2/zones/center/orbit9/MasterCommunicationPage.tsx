/**
 * MasterCommunicationPage.tsx — Stack Communication
 * Reference GHML: Voice, video, telephone, integrations temps reel
 * Summary page — scannable, FINAL STATE, cards + grids + status badges
 */

import {
  Radio, Mic, Video, Phone, ArrowRight, CheckCircle2,
  AlertTriangle, Clock, MonitorSpeaker, Wifi, Zap,
  Navigation, MessageSquare, Volume2, PhoneCall,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// HELPER — Status Badge
// ================================================================

function StatusBadge({ status }: { status: "live" | "en-cours" | "bloque" | "a-faire" }) {
  const config = {
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "bloque": { label: "BLOQUE", className: "bg-red-100 text-red-700 border-red-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ================================================================
// DATA — 12 Bot Voices
// ================================================================

const BOT_VOICES = [
  { code: "BCO", name: "CarlOS", role: "CEO", voice: "Chris", voiceId: "iP95p4xoKVk53GoZ742B", desc: "Voix principale Carl" },
  { code: "BCT", name: "Thierry", role: "CTO", voice: "Quebec Tremblay", voiceId: "0Z7Lo7cYVyjM6WL0AP0n", desc: "Jeune homme quebecois" },
  { code: "BCF", name: "Francois", role: "CFO", voice: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb", desc: "Warm, Captivating Storyteller" },
  { code: "BCM", name: "Martine", role: "CMO", voice: "Amelie", voiceId: "UJCi4DDncuo0VJDSIegj", desc: "Quebec, Canada (feminine)" },
  { code: "BCS", name: "Sophie", role: "CSO", voice: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2", desc: "Clear, Engaging Educator" },
  { code: "BOO", name: "Olivier", role: "COO", voice: "Eric", voiceId: "cjVigY5qzO86Huf0OWal", desc: "Smooth, Trustworthy" },
  { code: "BFA", name: "Fabien", role: "CPO", voice: "Daniel", voiceId: "onwK4e9ZLuTAKqWW03F9", desc: "Steady Broadcaster" },
  { code: "BHR", name: "Helene", role: "CHRO", voice: "Matilda", voiceId: "XrExE9yKIg1WjnnlVkGX", desc: "Knowledgable, Professional" },
  { code: "BIO", name: "Ines", role: "CINO", voice: "Lily", voiceId: "pFZP5JQG7iQjIQuC4Bku", desc: "Velvety Actress" },
  { code: "BRO", name: "Raphael", role: "CRO", voice: "Liam", voiceId: "TX3LPaxmHKxFdv7VOQHJ", desc: "Energetic, Social Media Creator" },
  { code: "BLE", name: "Louise", role: "CLO", voice: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL", desc: "Mature, Reassuring, Confident" },
  { code: "BSE", name: "Sebastien", role: "CISO", voice: "Brian", voiceId: "nPczCjzI2devNBz1zQrb", desc: "Deep, Resonant and Comforting" },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterCommunicationPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Radio}
          iconColor="text-teal-600"
          title="Stack Communication"
          subtitle="Voice, video, telephone, integrations temps reel"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* 1. Vue d'Ensemble du Pipeline */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Vue d'Ensemble du Pipeline</h3>
        <p className="text-xs text-gray-400 mb-3">
          Pipeline vocal complet — de la voix utilisateur a la reponse audio CarlOS
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "User parle", color: "bg-blue-100 text-blue-700" },
              { label: "LiveKit Room", color: "bg-violet-100 text-violet-700" },
              { label: "Deepgram STT", color: "bg-green-100 text-green-700" },
              { label: "CarlOS API", color: "bg-orange-100 text-orange-700" },
              { label: "Gemini / Claude", color: "bg-pink-100 text-pink-700" },
              { label: "ElevenLabs TTS", color: "bg-indigo-100 text-indigo-700" },
              { label: "User entend", color: "bg-emerald-100 text-emerald-700" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold px-2 py-1 rounded", step.color)}>{step.label}</span>
                {i < 6 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 2. Voice Pipeline (LIVE) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Voice Pipeline</h3>
          <StatusBadge status="live" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Agent LiveKit avec Deepgram STT + CarlOS API + ElevenLabs TTS
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Agent", value: "carlos_livekit_agent.py", icon: Mic, color: "blue" },
            { label: "Room convention", value: "carlos-{bot}-{user}-{uuid}", icon: Radio, color: "violet" },
            { label: "STT", value: "Deepgram nova-3 fr (endpointing 300ms)", icon: Wifi, color: "green" },
            { label: "TTS", value: "ElevenLabs eleven_multilingual_v2", icon: Volume2, color: "indigo" },
            { label: "LLM", value: "Gemini Flash (voice) / Claude (complex)", icon: Zap, color: "amber" },
            { label: "Log", value: "/tmp/carlos_livekit_new.log", icon: MonitorSpeaker, color: "gray" },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <Card key={item.label} className="p-3 bg-white border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <ItemIcon className={cn("h-3.5 w-3.5", `text-${item.color}-500`)} />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</span>
                </div>
                <code className="text-xs text-gray-700 font-mono">{item.value}</code>
              </Card>
            );
          })}
        </div>

        <Card className="p-3 bg-gray-50 border-gray-200 mt-3">
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Greeting: "Salut Carl! Qu'est-ce que je peux faire pour toi?"</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Connection sound: Web Audio API "Neural Link Activated" (sub bass + resonant filter + A major chord)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>startCall() &rarr; newConversation(): chaque appel vocal repart a zero</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 3. Video Avatar (LIVE) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Video Avatar</h3>
          <StatusBadge status="live" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Tavus lip-sync en temps reel — replica Lucas Studio
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Replica", value: "Lucas Studio", detail: "r5f0577fc829" },
            { label: "Room", value: "-vid-", detail: "carlos-vid-{bot}-{user}-{uuid}" },
            { label: "Cout", value: "$0.37/min", detail: "Free tier 25 min" },
            { label: "Activation", value: "Auto", detail: "Si '-vid-' dans room name" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">{kpi.label}</div>
              <div className="text-sm font-bold text-gray-800">{kpi.value}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{kpi.detail}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 4. Canvas Auto-Navigation (LIVE) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Canvas Auto-Navigation</h3>
          <StatusBadge status="live" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Mots-cles vocaux routent directement vers des actions canvas
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {[
              { feature: "Keyword Router", desc: "Pre-LLM routing — mots-cles vocaux detectes avant l'appel API", icon: Navigation, color: "violet" },
              { feature: "Anti-bounce", desc: "Par room, skip navigation si message < 20 chars", icon: Zap, color: "amber" },
              { feature: "Actions", desc: "navigate, push_content, annotate — 3 types d'actions canvas", icon: ArrowRight, color: "blue" },
              { feature: "State tracking", desc: "CanvasActionContext.navigateAction — state dedie React 18 safe (survit au batching)", icon: CheckCircle2, color: "emerald" },
              { feature: "Anti-leak", desc: "Metadata codee [_R:nav=Ventes,] au lieu de texte lisible — 'NAVIGATION SILENCIEUSE'", icon: MonitorSpeaker, color: "gray" },
              { feature: "Word boundaries", desc: "\\b sur TOUS les 30+ patterns regex — evite les faux positifs", icon: Wifi, color: "teal" },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.feature} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <ItemIcon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", `text-${item.color}-500`)} />
                  <div>
                    <span className="text-xs font-medium text-gray-700">{item.feature}</span>
                    <span className="text-xs text-gray-500 ml-2">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 5. Pont Vocal -> LiveChat (LIVE) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Pont Vocal &rarr; LiveChat</h3>
          <StatusBadge status="live" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Les transcripts vocaux apparaissent dans le LiveChat en temps reel
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {[
              { label: "Agent", color: "bg-blue-100 text-blue-700" },
              { label: "POST /voice/event", color: "bg-violet-100 text-violet-700" },
              { label: "VPS2 (VOICE_EVENT_URL)", color: "bg-orange-100 text-orange-700" },
              { label: "Frontend poll 2s", color: "bg-pink-100 text-pink-700" },
              { label: "LiveChat bubble", color: "bg-emerald-100 text-emerald-700" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold px-2 py-1 rounded", step.color)}>{step.label}</span>
                {i < 4 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Frontend poll <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">/voice/events/{"{room}"}</code> toutes les 2 secondes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Auto-TTS skip: messages <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">msgType="voice"</code> exclus (deja parles par ElevenLabs)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>VOICE_EVENT_URL dans .env DOIT pointer vers VPS2 — sinon events restent sur VPS1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Voice events TTL 2h — cleanup automatique</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 6. Telephonie */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Telephonie</h3>
          <StatusBadge status="en-cours" />
          <Badge variant="outline" className="text-[9px] font-bold">D-097</Badge>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Migration Twilio &rarr; Telnyx — code pret, en attente credentials Carl
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-xs text-gray-700">bridge_phone.py</span>
              <StatusBadge status="live" />
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <div>5 endpoints telephonie LIVE</div>
              <div>NIP N2 (D-089): Carl PIN = 6284</div>
              <div>Numero: +15149912284 dans phone_auth</div>
              <div>setup_sip_livekit.py pour SIP trunk</div>
            </div>
          </Card>

          <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <PhoneCall className="h-4 w-4 text-amber-600" />
              <span className="font-bold text-xs text-amber-700">bridge_telnyx.py</span>
              <StatusBadge status="bloque" />
            </div>
            <div className="space-y-1 text-xs text-amber-600">
              <div>Code complet pret a deployer</div>
              <div>JSON webhooks (pas form-encoded)</div>
              <div className="font-bold">Bloque sur: Carl doit fournir</div>
              <div className="ml-3">TELNYX_API_KEY (KEY_xxx)</div>
              <div className="ml-3">TELNYX_PHONE_NUMBER</div>
              <div className="ml-3">TELNYX_CONNECTION_ID</div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 7. 12 Voix ElevenLabs (S42) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">12 Voix ElevenLabs</h3>
        <p className="text-xs text-gray-400 mb-3">
          1 voix distincte par bot C-Level — model <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">eleven_multilingual_v2</code> — source: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">carlos_livekit_agent.py BOT_VOICES</code>
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            {/* Header row */}
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-10">Code</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-20">Bot</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-12">Role</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-28">Voix</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide flex-1">Voice ID</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-44 hidden md:block">Description</span>
            </div>

            {BOT_VOICES.map((bot) => (
              <div key={bot.code} className="flex items-center gap-3 py-1 border-b border-gray-50 last:border-0">
                <code className="text-[9px] font-mono font-bold text-gray-800 w-10">{bot.code}</code>
                <span className="text-xs text-gray-700 w-20">{bot.name}</span>
                <Badge variant="outline" className="text-[9px] w-12 justify-center">{bot.role}</Badge>
                <span className="text-xs font-medium text-gray-700 w-28">{bot.voice}</span>
                <code className="text-[9px] font-mono text-gray-500 flex-1 truncate">{bot.voiceId}</code>
                <span className="text-[9px] text-gray-400 w-44 truncate hidden md:block">{bot.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 8. Problemes Connus */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h3 className="text-base font-bold text-gray-800">Problemes Connus</h3>
        </div>

        <div className="space-y-2">
          {[
            {
              title: "B.4.7: Coupure apres 2 minutes",
              desc: "La connexion vocale coupe apres ~2min. 4 fixes deployes (S35), non confirme par Carl.",
              severity: "bloque" as const,
              tag: "BLOQUANT avant demos",
            },
            {
              title: "Telnyx: En attente credentials Carl",
              desc: "bridge_telnyx.py pret. Carl doit aller sur app.telnyx.com et fournir API key + phone number + connection ID.",
              severity: "bloque" as const,
              tag: "D-097",
            },
            {
              title: "VOICE_EVENT_URL doit pointer vers VPS2",
              desc: "Si la variable .env VOICE_EVENT_URL pointe vers localhost, les voice events restent sur VPS1 et ne sont jamais visibles dans le frontend.",
              severity: "en-cours" as const,
              tag: "Fix S41",
            },
            {
              title: "Groq: Role a clarifier",
              desc: "Groq est mentionne dans la stack communication (D-078) mais son utilisation exacte doit etre verifiee. Possiblement utilise pour transcription rapide ou fallback STT.",
              severity: "a-faire" as const,
              tag: "Verification",
            },
            {
              title: "Orbit9 LLM scoring mismatch",
              desc: "_scorer_match_orbit9 fallback keyword only — ClientGoogle.appeler() signature mismatch (got unexpected kwarg messages).",
              severity: "en-cours" as const,
              tag: "Bug",
            },
          ].map((issue) => (
            <Card key={issue.title} className={cn(
              "p-3 border shadow-sm",
              issue.severity === "bloque" ? "bg-red-50 border-red-200" :
              issue.severity === "en-cours" ? "bg-amber-50 border-amber-200" :
              "bg-gray-50 border-gray-200"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  issue.severity === "bloque" ? "text-red-500" :
                  issue.severity === "en-cours" ? "text-amber-500" :
                  "text-gray-400"
                )} />
                <span className={cn(
                  "text-xs font-bold",
                  issue.severity === "bloque" ? "text-red-700" :
                  issue.severity === "en-cours" ? "text-amber-700" :
                  "text-gray-700"
                )}>{issue.title}</span>
                <StatusBadge status={issue.severity} />
                <Badge variant="outline" className="text-[9px] font-bold ml-auto">{issue.tag}</Badge>
              </div>
              <div className={cn(
                "text-xs ml-5",
                issue.severity === "bloque" ? "text-red-600" :
                issue.severity === "en-cours" ? "text-amber-600" :
                "text-gray-500"
              )}>{issue.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
