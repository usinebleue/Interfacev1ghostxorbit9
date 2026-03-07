/**
 * MasterRoadmapPage.tsx — Roadmap & Decisions
 * SUMMARY page: shows FINAL STATE of sprints and decisions, not full history.
 * Single scrollable page (no tabs): Timeline, Sessions, Decisions, Blockers, Next Steps.
 */

import {
  Map, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  Circle, ChevronRight, XCircle, Zap, Target,
  CalendarDays, Flag, AlertOctagon, TrendingUp,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// DATA — Sprint Timeline
// ======================================================================

interface SubTask {
  label: string;
  status: "done" | "en-cours" | "a-faire" | "reporte";
  note?: string;
}

interface Sprint {
  id: string;
  name: string;
  dates: string;
  status: "done" | "en-cours" | "prochain" | "pas-commence";
  summary: string;
  subtasks?: SubTask[];
}

const SPRINTS: Sprint[] = [
  {
    id: "A",
    name: "CarlOS MVP",
    dates: "26-27 fev",
    status: "done",
    summary: "CarlOS fonctionnel, 14 Bots live, API 8 endpoints, Telegram bridge",
  },
  {
    id: "B",
    name: "Mega Sprint CarlOS Live",
    dates: "28 fev - 7 mars",
    status: "en-cours",
    summary: "Plateforme complete, prete a seduire les pionniers. 95% complete.",
    subtasks: [
      { label: "B.1 LiveChat complet", status: "done" },
      { label: "B.2 11 Bots meme pattern", status: "done" },
      { label: "B.3 Sidebar V2 + Cockpit", status: "done" },
      { label: "B.4 Bloc Communication", status: "done", note: "sauf B.4.7 stabilite vocale" },
      { label: "B.5 Transcription Meetings", status: "done" },
      { label: "B.6 Templates Lego", status: "reporte", note: "reporte Sprint C" },
      { label: "B.7 36 Teintures cognitives", status: "reporte", note: "reporte Sprint C" },
      { label: "B.8 Sprint Securite", status: "done", note: "S32" },
      { label: "B.9 Architecture 2 VPS", status: "done", note: "S32" },
      { label: "B.10 Telephonie Twilio", status: "done", note: "S33" },
    ],
  },
  {
    id: "B.C",
    name: "Consolidation",
    dates: "D-093",
    status: "done",
    summary: "COMMAND Protocol, Gemini PM, Known issues Pioneer, Roadmap V3.4",
  },
  {
    id: "C",
    name: "Pioneer-Ready",
    dates: "Apres B.Consolidation",
    status: "prochain",
    summary: "Securiser la plateforme pour les 9 premiers pionniers.",
    subtasks: [
      { label: "C.1 COMMAND Engine", status: "done", note: "S36" },
      { label: "C.2 Stabilite vocale", status: "a-faire", note: "BLOQUANT" },
      { label: "C.3 Onboarding Boxes", status: "a-faire" },
      { label: "C.4 Auth JWT", status: "a-faire" },
      { label: "C.5 Separation dev/live", status: "a-faire" },
      { label: "C.9 Gouvernance CarlOS", status: "done", note: "Phase 1 (decision_log)" },
      { label: "C.10 COMMAND Engine", status: "done", note: "MVP bridge_command.py" },
      { label: "C.12 Orbit9 Matching", status: "done", note: "S37" },
    ],
  },
  {
    id: "D",
    name: "Scale 9 vers 81",
    dates: "Apres Sprint C",
    status: "pas-commence",
    summary: "Multi-tenant, Bot-to-Bot V2, Auto-generation bots, Grande Offensive",
  },
];

// ======================================================================
// DATA — Session Timeline (S33-S46)
// ======================================================================

interface SessionEntry {
  session: string;
  highlights: string[];
}

const SESSIONS: SessionEntry[] = [
  { session: "S33", highlights: ["COMMAND Protocol", "Gemini PM", "Roadmap V3.4"] },
  { session: "S34", highlights: ["Beton Arme protocol", "pm000_boot.py"] },
  { session: "S35", highlights: ["deploy.sh fix", "Telnyx bridge pret", "Voice stability fixes"] },
  { session: "S36", highlights: ["COMMAND Engine MVP LIVE", "bridge_command.py"] },
  { session: "S37", highlights: ["Orbit9 Matching", "3 tables + 15 endpoints + scoring"] },
  { session: "S38", highlights: ["D-101 User Flow Engine", "28 DATA + 6 ACTION sections"] },
  { session: "S39-40", highlights: ["Infra migration VPS2 LIVE", "DNS app.usinebleue.ai"] },
  { session: "S41", highlights: ["3 Rooms (D-109)", "Voice events fix (VPS2 URL)"] },
  { session: "S42", highlights: ["Bot cleanup (12 voix)", "Delete endpoints", "Sidebar droite"] },
  { session: "S43", highlights: ["Architecture docs V2", "Design Bible V1"] },
  { session: "S44", highlights: ["Style audit", "design-system.md standardisation"] },
  { session: "S45", highlights: ["Frontend gate hooks", "CSS audit"] },
  { session: "S46", highlights: ["Espace Unifie", "Dept tabs", "141 templates", "APK cleanup"] },
];

// ======================================================================
// DATA — Key Decisions
// ======================================================================

interface Decision {
  id: string;
  title: string;
  session: string;
  impact: string;
  status: "done" | "en-cours" | "a-faire";
}

const DECISIONS: Decision[] = [
  { id: "D-075", title: "Onboarding Box Progressives", session: "S28", impact: "UX Pioneer", status: "a-faire" },
  { id: "D-078", title: "Stack Communication (LiveKit+ElevenLabs+Deepgram)", session: "S26", impact: "Voice/Video", status: "done" },
  { id: "D-081", title: "CarlOS Noyau Omnipresent", session: "S28", impact: "Architecture", status: "en-cours" },
  { id: "D-083", title: "Sprint Securite", session: "S32", impact: "Securite", status: "done" },
  { id: "D-087", title: "Architecture 2 VPS", session: "S32", impact: "Infrastructure", status: "done" },
  { id: "D-088", title: "Telephonie Twilio/SIP", session: "S33", impact: "Communication", status: "done" },
  { id: "D-089", title: "NIP N2 Authentification", session: "S33", impact: "Securite", status: "done" },
  { id: "D-091", title: "COMMAND Protocol", session: "S33", impact: "Core Engine", status: "done" },
  { id: "D-092", title: "Gemini Chef d'Etat-Major", session: "S33", impact: "Dev Parallele", status: "done" },
  { id: "D-093", title: "Sprint B.Consolidation", session: "S33", impact: "Stabilisation", status: "done" },
  { id: "D-094", title: "Multi-tenant DOMINO/FORGE", session: "S33", impact: "Scale", status: "a-faire" },
  { id: "D-095", title: "Orbit9 Matching Engine", session: "S37", impact: "Reseau", status: "done" },
  { id: "D-097", title: "Migration Twilio vers Telnyx", session: "S35", impact: "Communication", status: "en-cours" },
  { id: "D-098", title: "Protocole Gouvernance CarlOS", session: "S36", impact: "Gouvernance", status: "done" },
  { id: "D-099", title: "Board Room CA Robotique", session: "S41", impact: "Feature", status: "a-faire" },
  { id: "D-101", title: "User Flow Engine (28 DATA + 6 ACTION)", session: "S38", impact: "Architecture", status: "en-cours" },
  { id: "D-108", title: "Core Type System", session: "S40", impact: "Architecture", status: "en-cours" },
  { id: "D-109", title: "3 Rooms (Think/War/Board)", session: "S41", impact: "Feature", status: "en-cours" },
];

// ======================================================================
// DATA — Blockers
// ======================================================================

interface Blocker {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
}

const BLOCKERS: Blocker[] = [
  { title: "B.4.7 Stabilite vocale", description: "Coupure apres ~2min. BLOQUANT avant demos terrain.", severity: "critical" },
  { title: "Migration Telnyx", description: "bridge_telnyx.py pret mais bloque sur credentials Carl (API key, phone, connection ID).", severity: "high" },
  { title: "Auth JWT/sessions", description: "Pas commence. Requis Sprint C pour multi-user.", severity: "medium" },
  { title: "Google OAuth", description: "Casse. Sprint dedie necessaire. Le MVP fonctionne sans Google.", severity: "medium" },
];

// ======================================================================
// DATA — Next Steps
// ======================================================================

const NEXT_STEPS = [
  { priority: 1, label: "Mega mise a niveau Master GHML", status: "EN COURS" },
  { priority: 2, label: "Stabilite vocale B.4.7", status: "BLOQUANT" },
  { priority: 3, label: "Auth JWT/sessions", status: "Sprint C" },
  { priority: 4, label: "Sprint Pioneer-Ready", status: "Sprint C" },
  { priority: 5, label: "Scale 9 vers 81", status: "Sprint D" },
];

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function SprintStatusBadge({ status }: { status: Sprint["status"] }) {
  const config = {
    done: { label: "DONE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "95%", className: "bg-amber-100 text-amber-700 border-amber-200" },
    prochain: { label: "PROCHAIN", className: "bg-blue-100 text-blue-700 border-blue-200" },
    "pas-commence": { label: "PAS COMMENCE", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function SubtaskStatusIcon({ status }: { status: SubTask["status"] }) {
  if (status === "done") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
  if (status === "en-cours") return <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
  if (status === "reporte") return <ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />;
  return <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0" />;
}

function DecisionStatusBadge({ status }: { status: Decision["status"] }) {
  const config = {
    done: { label: "DONE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", config.className)}>
      {config.label}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterRoadmapPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Map}
          iconColor="text-amber-600"
          title="Roadmap & Decisions"
          subtitle="Sprints, timeline, journal des decisions"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* SECTION 1 — Sprint Timeline */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Timeline des Sprints</h3>
        <p className="text-xs text-gray-400 mb-4">
          Roadmap V3.4 — de CarlOS MVP a Scale 9 vers 81. Chaque sprint est un bloc de travail dev.
        </p>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200" />

          <div className="space-y-4">
            {SPRINTS.map((sprint) => (
              <div key={sprint.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 shrink-0 mt-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[9px]",
                      sprint.status === "done" ? "bg-emerald-500" :
                      sprint.status === "en-cours" ? "bg-amber-500" :
                      sprint.status === "prochain" ? "bg-blue-500" :
                      "bg-gray-300"
                    )}
                  >
                    {sprint.id}
                  </div>
                </div>

                {/* Card */}
                <Card className="flex-1 p-4 bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-bold text-gray-800">Sprint {sprint.id} — {sprint.name}</span>
                    <SprintStatusBadge status={sprint.status} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[9px] text-gray-500">{sprint.dates}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{sprint.summary}</p>

                  {sprint.subtasks && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <div className="space-y-1.5">
                        {sprint.subtasks.map((sub) => (
                          <div key={sub.label} className="flex items-center gap-2">
                            <SubtaskStatusIcon status={sub.status} />
                            <span className={cn(
                              "text-xs",
                              sub.status === "done" ? "text-gray-700" :
                              sub.status === "reporte" ? "text-gray-400 italic" :
                              "text-gray-600"
                            )}>
                              {sub.label}
                            </span>
                            {sub.note && (
                              <span className="text-[9px] text-gray-400 ml-auto">{sub.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 2 — Last 5 Weeks (S33-S46) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Dernieres 5 Semaines de Dev (S33-S46)</h3>
        <p className="text-xs text-gray-400 mb-4">
          Accomplissements cles par session de travail.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SESSIONS.map((s) => (
            <Card key={s.session} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-blue-700">{s.session}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {s.highlights.map((h) => (
                      <span
                        key={h}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Key Decisions Table */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Decisions Cles (D-075 a D-109)</h3>
        <p className="text-xs text-gray-400 mb-4">
          {DECISIONS.length} decisions recentes — le journal complet en contient 111+.
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[60px_1fr_60px_100px_70px] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">#</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Titre</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Session</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Impact</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide text-right">Status</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {DECISIONS.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-[60px_1fr_60px_100px_70px] gap-2 px-4 py-2.5 items-center hover:bg-gray-50 transition-colors"
              >
                <code className="text-xs font-mono font-bold text-amber-700">{d.id}</code>
                <span className="text-xs text-gray-700 truncate">{d.title}</span>
                <span className="text-[9px] text-gray-500">{d.session}</span>
                <Badge variant="outline" className="text-[9px] font-medium w-fit">{d.impact}</Badge>
                <div className="text-right">
                  <DecisionStatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Blockers */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Bloquants Actuels</h3>
        <p className="text-xs text-gray-400 mb-4">
          {BLOCKERS.length} bloquants identifies — a resoudre avant les demos Pioneer.
        </p>

        <div className="space-y-3">
          {BLOCKERS.map((b) => (
            <Card
              key={b.title}
              className={cn(
                "p-4 border shadow-sm",
                b.severity === "critical" ? "bg-red-50 border-red-200" :
                b.severity === "high" ? "bg-amber-50 border-amber-200" :
                "bg-orange-50 border-orange-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  b.severity === "critical" ? "bg-red-100" :
                  b.severity === "high" ? "bg-amber-100" :
                  "bg-orange-100"
                )}>
                  {b.severity === "critical" ? (
                    <AlertOctagon className={cn("h-4 w-4", "text-red-600")} />
                  ) : b.severity === "high" ? (
                    <AlertTriangle className={cn("h-4 w-4", "text-amber-600")} />
                  ) : (
                    <XCircle className={cn("h-4 w-4", "text-orange-600")} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{b.title}</span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                      b.severity === "critical" ? "bg-red-100 text-red-700 border-red-200" :
                      b.severity === "high" ? "bg-amber-100 text-amber-700 border-amber-200" :
                      "bg-orange-100 text-orange-700 border-orange-200"
                    )}>
                      {b.severity === "critical" ? "CRITIQUE" : b.severity === "high" ? "HAUT" : "MOYEN"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{b.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Next Steps */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Prochaines Etapes</h3>
        <p className="text-xs text-gray-400 mb-4">
          Priorites ordonnees pour atteindre Pioneer-Ready.
        </p>

        <div className="space-y-2">
          {NEXT_STEPS.map((step) => (
            <Card key={step.priority} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  step.priority === 1 ? "bg-blue-100 text-blue-700" :
                  step.priority === 2 ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {step.priority}
                </div>
                <span className="text-sm font-medium text-gray-800 flex-1">{step.label}</span>
                <span className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded border",
                  step.status === "EN COURS" ? "bg-blue-100 text-blue-700 border-blue-200" :
                  step.status === "BLOQUANT" ? "bg-red-100 text-red-700 border-red-200" :
                  "bg-gray-100 text-gray-500 border-gray-200"
                )}>
                  {step.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Quick Stats */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Decisions", value: "111+", icon: Flag, color: "amber" },
            { label: "Sessions", value: "46", icon: CalendarDays, color: "blue" },
            { label: "Sprints", value: "5", icon: Target, color: "emerald" },
            { label: "Bloquants", value: String(BLOCKERS.length), icon: AlertTriangle, color: "red" },
          ].map((stat) => {
            const SIcon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
                <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
