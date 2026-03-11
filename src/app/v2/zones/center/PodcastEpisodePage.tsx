/**
 * PodcastEpisodePage.tsx — Épisode podcast généré depuis un meeting (D-114)
 * 4 tabs: Transcript, Show Notes, Quotes, Distribution
 */

import { useState, useEffect } from "react";
import {
  FileText,
  Quote,
  Share2,
  Scroll,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { api } from "../../api/client";

type Tab = "transcript" | "notes" | "quotes" | "distribution";

interface Props {
  slug: string;
  onBack: () => void;
}

export function PodcastEpisodePage({ slug, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [meeting, setMeeting] = useState<any>(null);
  const [podcast, setPodcast] = useState<any>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState<string>("");

  // Load data
  useEffect(() => {
    Promise.all([
      api.meetingGet(slug),
      api.meetingPodcast(slug),
      api.meetingTranscript(slug),
    ]).then(([m, p, t]) => {
      setMeeting(m);
      setPodcast(p.ai_summary || {});
      setTranscript(t.entries || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await api.meetingPodcastRegenerate(slug);
    // Poll for completion
    setTimeout(async () => {
      const p = await api.meetingPodcast(slug);
      setPodcast(p.ai_summary || {});
      setRegenerating(false);
    }, 10000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "notes", label: "Show Notes", icon: FileText },
    { id: "transcript", label: "Transcript", icon: Scroll },
    { id: "quotes", label: "Quotes", icon: Quote },
    { id: "distribution", label: "Distribution", icon: Share2 },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-10 py-5 pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="p-1 hover:bg-white/20 rounded transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-bold">{meeting?.title || "Épisode Podcast"}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/80">
            {meeting?.started_at && (
              <span>{new Date(meeting.started_at).toLocaleDateString("fr-CA")}</span>
            )}
            <span>{transcript.length} échanges</span>
            {meeting?.recording_url && <span>Enregistrement disponible</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors flex-1 justify-center",
                  activeTab === tab.id
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {/* Show Notes */}
            {podcast.show_notes && (
              <div className="bg-white border rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Show Notes</h2>
                {podcast.show_notes.participants && (
                  <p className="text-xs text-gray-500 mb-3">
                    Participants: {Array.isArray(podcast.show_notes.participants)
                      ? podcast.show_notes.participants.join(", ")
                      : podcast.show_notes.participants}
                  </p>
                )}
                {podcast.show_notes.bullets && (
                  <ul className="space-y-2">
                    {podcast.show_notes.bullets.map((b: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-500 shrink-0">-</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Resume */}
            {podcast.resume && (
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">Résumé</h2>
                  <CopyButton text={podcast.resume} label="resume" copied={copied} onCopy={copyToClipboard} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{podcast.resume}</p>
              </div>
            )}

            {/* Moments clés */}
            {podcast.moments_cles && (
              <div className="bg-white border rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Moments clés</h2>
                <div className="space-y-3">
                  {podcast.moments_cles.map((m: any, i: number) => (
                    <div key={i} className="border-l-2 border-purple-400 pl-3">
                      <p className="text-sm font-medium text-gray-800">{m.description}</p>
                      {m.impact && <p className="text-xs text-gray-500 mt-0.5">{m.impact}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate button */}
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 text-xs text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} />
              {regenerating ? "Régénération..." : "Régénérer le contenu"}
            </button>
          </div>
        )}

        {activeTab === "transcript" && (
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Transcription complète ({transcript.length} échanges)
            </h2>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {transcript.map((entry, i) => (
                <div key={i} className="text-sm">
                  <span className={cn(
                    "font-semibold",
                    entry.speaker === "CEOB" || entry.speaker === "CarlOS"
                      ? "text-blue-600"
                      : "text-gray-700"
                  )}>
                    {entry.speaker === "CEOB" ? "CarlOS" : entry.speaker}:
                  </span>{" "}
                  <span className="text-gray-600">{entry.text}</span>
                </div>
              ))}
              {transcript.length === 0 && (
                <p className="text-sm text-gray-400 italic">Aucune transcription disponible.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "quotes" && (
          <div className="space-y-3">
            {(podcast.top_quotes || []).map((q: any, i: number) => (
              <div key={i} className="bg-white border rounded-xl p-5">
                <div className="flex gap-3">
                  <Quote className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 italic">"{q.quote}"</p>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">— {q.speaker}</p>
                  </div>
                  <CopyButton text={`"${q.quote}" — ${q.speaker}`} label={`q${i}`} copied={copied} onCopy={copyToClipboard} />
                </div>
              </div>
            ))}
            {(!podcast.top_quotes || podcast.top_quotes.length === 0) && (
              <div className="bg-white border rounded-xl p-6 text-center">
                <p className="text-sm text-gray-400">Aucune citation extraite. Régénérez le contenu.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "distribution" && (
          <div className="space-y-4">
            {/* YouTube Description */}
            {podcast.description_youtube && (
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">Description YouTube</h2>
                  <CopyButton text={podcast.description_youtube} label="youtube" copied={copied} onCopy={copyToClipboard} />
                </div>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                  {podcast.description_youtube}
                </pre>
              </div>
            )}

            {/* LinkedIn Post */}
            {podcast.post_linkedin && (
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">Post LinkedIn</h2>
                  <CopyButton text={podcast.post_linkedin} label="linkedin" copied={copied} onCopy={copyToClipboard} />
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{podcast.post_linkedin}</p>
              </div>
            )}

            {(!podcast.description_youtube && !podcast.post_linkedin) && (
              <div className="bg-white border rounded-xl p-6 text-center">
                <p className="text-sm text-gray-400">Contenu de distribution pas encore généré. Régénérez le contenu.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function CopyButton({ text, label, copied, onCopy }: {
  text: string; label: string; copied: string; onCopy: (text: string, label: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(text, label)}
      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
      title="Copier"
    >
      {copied === label ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
