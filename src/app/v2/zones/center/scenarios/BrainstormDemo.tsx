/**
 * BrainstormDemo.tsx — Simulation Mode Brainstorm (sticky-notes board)
 * Sujet : "Comment doubler nos clients en 12 mois sans augmenter l'equipe vente?"
 * Methode SCAMPER, post-its board, 4 bots contribuent simultanement
 * Temperature 1.0 — maximum divergence, zero jugement, quantite > qualite
 * Sprint A — Frame Master V2
 */

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Lightbulb,
  Star,
  RotateCcw,
  Layers,
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotAvatar,
  UserBubble,
} from "../shared/simulation-components";
import { BOT_COLORS } from "../shared/simulation-data";
import { BRAINSTORM_DATA } from "./brainstorm-data";
import type { StickyNote as StickyNoteType } from "./brainstorm-data";

// ========== SCAMPER LABELS ==========

const SCAMPER_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  COMBINER: { label: "COMBINER", bg: "bg-blue-100", text: "text-blue-700" },
  ADAPTER: { label: "ADAPTER", bg: "bg-green-100", text: "text-green-700" },
  SUBSTITUER: { label: "SUBSTITUER", bg: "bg-violet-100", text: "text-violet-700" },
  ELIMINER: { label: "ELIMINER", bg: "bg-red-100", text: "text-red-700" },
  REORGANISER: { label: "REORGANISER", bg: "bg-orange-100", text: "text-orange-700" },
};

function extractScamperKey(text: string): string | null {
  for (const key of Object.keys(SCAMPER_LABELS)) {
    if (text.startsWith(key + " :") || text.startsWith(key + ":")) return key;
  }
  return null;
}

// ========== ROTATION ANGLES (organic sticky-note feel) ==========

const ROTATIONS = [
  "-rotate-[1deg]",
  "rotate-[0.5deg]",
  "-rotate-[0.5deg]",
  "rotate-[1.5deg]",
  "-rotate-[1.5deg]",
  "rotate-[0.8deg]",
  "-rotate-[0.3deg]",
  "rotate-[2deg]",
  "-rotate-[1deg]",
  "rotate-[1deg]",
  "-rotate-[0.8deg]",
  "rotate-[0.3deg]",
  "-rotate-[2deg]",
];

// ========== STICKY NOTE COMPONENT ==========

function StickyNote({
  note,
  index,
  visible,
  showVotes,
}: {
  note: StickyNoteType;
  index: number;
  visible: boolean;
  showVotes?: boolean;
}) {
  const botColor = BOT_COLORS[note.bot];
  const scamperKey = extractScamperKey(note.text);
  const scamper = scamperKey ? SCAMPER_LABELS[scamperKey] : null;
  const displayText = scamper
    ? note.text.replace(/^[A-Z]+ ?: ?/, "")
    : note.text;
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <div
      className={cn(
        "transition-all duration-500 origin-center",
        visible ? "scale-100 opacity-100" : "scale-0 opacity-0",
        rotation,
      )}
    >
      <div
        className={cn(
          "rounded-lg border-2 p-3 shadow-md hover:shadow-lg transition-shadow cursor-default relative min-h-[90px]",
          note.color,
        )}
      >
        {/* Bot emoji in top-right corner */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {botColor?.avatar ? (
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white">
              <img
                src={botColor.avatar}
                alt={botColor.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <span className="text-xs">{botColor?.emoji}</span>
          )}
        </div>

        {/* SCAMPER badge */}
        {scamper && (
          <div className="mb-1.5">
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                scamper.bg,
                scamper.text,
              )}
            >
              {scamper.label}
            </span>
          </div>
        )}

        {/* Note content */}
        <p className="text-xs text-gray-800 leading-relaxed pr-6">
          {displayText}
        </p>

        {/* Bot name footer */}
        <div className="mt-2 flex items-center justify-between">
          <span
            className={cn(
              "text-[10px] font-semibold",
              botColor?.text || "text-gray-500",
            )}
          >
            {botColor?.name} ({botColor?.role})
          </span>

          {/* Votes badge */}
          {showVotes && note.votes && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {note.votes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== STICKY BOARD (grid with staggered animation) ==========

function StickyBoard({
  notes,
  stageActive,
  showVotes,
  label,
}: {
  notes: StickyNoteType[];
  stageActive: boolean;
  showVotes?: boolean;
  label?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!stageActive) {
      setVisibleCount(notes.length);
      return;
    }
    setVisibleCount(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= notes.length) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [stageActive, notes.length]);

  return (
    <div className="ml-11">
      {label && (
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-800">{label}</span>
          <span className="text-xs text-gray-400">
            ({notes.length} idees)
          </span>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2.5">
        {notes.map((note, i) => (
          <StickyNote
            key={note.id}
            note={note}
            index={i}
            visible={i < visibleCount}
            showVotes={showVotes}
          />
        ))}
      </div>
    </div>
  );
}

// ========== CLUSTER CARD ==========

function ClusterCard({
  cluster,
  allNotes,
  visible,
  delay,
}: {
  cluster: (typeof BRAINSTORM_DATA.clusters)[number];
  allNotes: StickyNoteType[];
  visible: boolean;
  delay: number;
}) {
  const [show, setShow] = useState(false);
  const Icon = cluster.icon;
  const clusterNotes = allNotes.filter((n) =>
    cluster.noteIds.includes(n.id),
  );

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [visible, delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500",
        show
          ? "translate-x-0 opacity-100"
          : "-translate-x-8 opacity-0",
      )}
    >
      <div
        className={cn(
          "border-2 rounded-xl p-4 shadow-sm",
          cluster.border,
          cluster.bg,
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              cluster.bg,
            )}
          >
            <Icon className={cn("h-5 w-5", cluster.color)} />
          </div>
          <div className="flex-1">
            <span className={cn("text-sm font-bold", cluster.color)}>
              {cluster.label}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              ({clusterNotes.length} idees)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block">Potentiel</span>
            <span className={cn("text-xs font-bold", cluster.color)}>
              {cluster.potential}
            </span>
          </div>
        </div>

        <div className="space-y-1 ml-10">
          {clusterNotes.map((note) => {
            const botColor = BOT_COLORS[note.bot];
            return (
              <div
                key={note.id}
                className="flex items-start gap-2 text-xs text-gray-700 bg-white/60 rounded-lg px-2.5 py-1.5 border border-white"
              >
                {botColor?.avatar ? (
                  <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 mt-0.5">
                    <img
                      src={botColor.avatar}
                      alt={botColor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-[10px] shrink-0 mt-0.5">
                    {botColor?.emoji}
                  </span>
                )}
                <span className="leading-relaxed">{note.text}</span>
                {note.votes && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 shrink-0 ml-auto">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {note.votes}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== SYNTHESE CARD ==========

function SyntheseCard({ animate }: { animate: boolean }) {
  const [visible, setVisible] = useState(!animate);
  const synth = BRAINSTORM_DATA.synthese;

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [animate]);

  if (!visible) return null;

  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white border-2 border-amber-300 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-900">
              {synth.titre}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Strategy */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Strategie
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {synth.strategie}
            </p>
          </div>

          {/* Quarterly projection table */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Projection trimestrielle
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Trimestre
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Nouveaux
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Source
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {synth.projection.map((row) => (
                    <tr
                      key={row.trimestre}
                      className="border-b last:border-0 hover:bg-amber-50/30"
                    >
                      <td className="px-3 py-2 font-bold text-gray-700">
                        {row.trimestre}
                      </td>
                      <td className="px-3 py-2 text-green-700 font-semibold">
                        {row.clients}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {row.source}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-amber-700">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Idee phare highlight */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                Idee phare
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                5 votes
              </span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed">
              {synth.ideePhare}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export function BrainstormDemo({
  onComplete,
}: { onComplete?: () => void } = {}) {
  const [stage, setStage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on stage change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 150);
  }, [stage]);

  // Collect all notes for cluster lookups
  const allNotes = [
    ...BRAINSTORM_DATA.vague1.notes,
    ...BRAINSTORM_DATA.vague2.notes,
  ];

  const handleRestart = () => {
    setStage(0);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Simulation Brainstorm — SCAMPER
          </div>
          <div className="text-xs text-muted-foreground">
            Zero jugement, quantite &gt; qualite, 4 departements mobilises
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
            Temperature 1.0
          </span>
          {stage > 0 && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              Etape {Math.min(Math.floor(stage), 8)} / 8
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
          {/* ===== STAGE 0 — Start button ===== */}
          {stage === 0 && (
            <div className="flex justify-center py-16">
              <button
                onClick={() => setStage(1)}
                className="flex items-center gap-3 bg-amber-500 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-amber-600 transition-all hover:scale-105"
              >
                <Lightbulb className="h-5 w-5" />
                Lancer le Brainstorm
              </button>
            </div>
          )}

          {/* ===== STAGE 1 — User sends tension ===== */}
          {stage >= 1 && (
            <UserBubble
              text={BRAINSTORM_DATA.userTension}
              time="14:41"
            />
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(1.5)}
                className="text-xs bg-amber-100 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-200 flex items-center gap-1 transition-colors"
              >
                <Lightbulb className="h-3 w-3" /> CarlOS cadre le brainstorm...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO thinking (setup) ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={BRAINSTORM_DATA.setupThinking}
              botEmoji="\u{1F454}"
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(2)}
            />
          )}

          {/* ===== STAGE 2 — CEO intro (typewriter) + SCAMPER badge ===== */}
          {stage >= 2 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border-l-[3px] border-l-blue-500 border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 max-w-[80%] shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      BOT_COLORS.BCO.text,
                    )}
                  >
                    CarlOS (CEO)
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                    Brainstorm
                  </span>
                </div>
                {stage === 2 ? (
                  <TypewriterText
                    text={BRAINSTORM_DATA.ceoIntro}
                    speed={12}
                    className="text-sm text-gray-800"
                    onComplete={() =>
                      setTimeout(() => setStage(3), 600)
                    }
                  />
                ) : (
                  <p className="text-sm text-gray-800">
                    {BRAINSTORM_DATA.ceoIntro}
                  </p>
                )}
                {/* SCAMPER method badge */}
                {stage >= 2 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {BRAINSTORM_DATA.scamperLabel}
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-gray-400 mt-1 block">
                  14:41
                </span>
              </div>
            </div>
          )}

          {/* ===== STAGE 3 — VAGUE 1: Sticky board (8 notes appear one by one) ===== */}
          {stage >= 3 && (
            <>
              {/* Section label */}
              <div className="ml-11 flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-amber-200" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider px-2">
                  {BRAINSTORM_DATA.vague1.label}
                </span>
                <div className="h-px flex-1 bg-amber-200" />
              </div>
              <StickyBoard
                notes={BRAINSTORM_DATA.vague1.notes}
                stageActive={stage === 3}
                label=""
              />
            </>
          )}
          {stage === 3 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(4)}
                className="text-xs bg-amber-100 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-200 flex items-center gap-1 transition-colors mt-2"
              >
                <ArrowRight className="h-3 w-3" /> Passer au SCAMPER
                Challenge...
              </button>
            </div>
          )}

          {/* ===== STAGE 4 — VAGUE 2: SCAMPER Challenge (5 notes with votes) ===== */}
          {stage >= 4 && (
            <>
              <div className="ml-11 flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-violet-200" />
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider px-2">
                  {BRAINSTORM_DATA.vague2.label}
                </span>
                <div className="h-px flex-1 bg-violet-200" />
              </div>
              <div className="ml-11 mb-2">
                <span className="text-[10px] bg-violet-50 border border-violet-200 text-violet-700 px-2 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Technique : {BRAINSTORM_DATA.vague2.technique}
                </span>
              </div>
              <StickyBoard
                notes={BRAINSTORM_DATA.vague2.notes}
                stageActive={stage === 4}
                showVotes={true}
                label=""
              />
            </>
          )}
          {stage === 4 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(5)}
                className="text-xs bg-amber-100 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-200 flex items-center gap-1 transition-colors mt-2"
              >
                <Layers className="h-3 w-3" /> Clustering des idees...
              </button>
            </div>
          )}

          {/* ===== STAGE 5 — CLUSTERING: Notes grouped into clusters ===== */}
          {stage >= 5 && (
            <>
              <div className="ml-11 flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-green-200" />
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider px-2">
                  Clustering — 5 axes identifies
                </span>
                <div className="h-px flex-1 bg-green-200" />
              </div>
              <div className="ml-11 space-y-3">
                {BRAINSTORM_DATA.clusters.map((cluster, i) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    allNotes={allNotes}
                    visible={stage >= 5}
                    delay={i * 250}
                  />
                ))}
              </div>
            </>
          )}
          {stage === 5 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(6)}
                className="text-xs bg-amber-100 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-200 flex items-center gap-1 transition-colors mt-2"
              >
                <TrendingUp className="h-3 w-3" /> Synthese et plan d'action...
              </button>
            </div>
          )}

          {/* ===== STAGE 6 — Synthese thinking animation ===== */}
          {stage === 6 && (
            <ThinkingAnimation
              steps={BRAINSTORM_DATA.syntheseThinking}
              botEmoji="\u{1F454}"
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(7)}
            />
          )}

          {/* ===== STAGE 7 — Synthese card (plan + projection + idee phare) ===== */}
          {stage >= 7 && <SyntheseCard animate={stage === 7} />}
          {stage === 7 && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setStage(8);
                  onComplete?.();
                }}
                className="text-xs bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 flex items-center gap-1 transition-colors mt-2"
              >
                <CheckCircle2 className="h-3 w-3" /> Brainstorm termine
              </button>
            </div>
          )}

          {/* ===== STAGE 8 — Done + Restart ===== */}
          {stage >= 8 && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-6 py-4 text-center shadow-sm max-w-md">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-bold text-gray-800">
                    Brainstorm complet
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  13 idees generees par 4 departements
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  5 clusters identifies avec potentiel mesure
                </p>
                <p className="text-xs text-gray-600">
                  Projection : 120 a 250 clients en 12 mois
                </p>

                {/* Stats row */}
                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-amber-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-700">13</div>
                    <div className="text-[10px] text-gray-500">Idees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-violet-700">5</div>
                    <div className="text-[10px] text-gray-500">SCAMPER</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-700">5</div>
                    <div className="text-[10px] text-gray-500">Clusters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700">4</div>
                    <div className="text-[10px] text-gray-500">Bots</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRestart}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Relancer la simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
