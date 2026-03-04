/**
 * JumelageLivePage.tsx — Flow complet de jumelage live avec vrais appels API
 * Stages 0→5: Accueil → Criteres → Scan → TOP 3 → Questions → Scoring → Selection → Trisociation
 * Reutilise les composants de cahier-components.tsx
 * Sprint C — Flow C Jumelage Live
 */

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  Search, Target, Users, Video, Trophy, Edit3, Plus, X,
  Handshake, BarChart3, Shield, MapPin, Star, Zap,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { api } from "../../../api/client";
import type {
  Orbit9Match, Orbit9Member, JumelageQuestion,
  ScoringCategory, ScoringResult,
} from "../../../api/types";
import {
  ThinkingAnimation,
  NetworkScanAnimation,
  JumelageSessionAnimation,
  ScoringAnimation,
  BotAvatar,
} from "../shared/cahier-components";

// ── Types ──

interface JumelageLivePageProps {
  matchId?: number;
  initialBesoin?: string;
  initialCriteres?: string[];
  demandeurId?: number;
  onNavigate?: (section: string) => void;
  onComplete?: (matchId: number) => void;
}

type Stage =
  | 0    // Accueil — formulaire ou match existant
  | 1    // Analyse criteres (animation)
  | 1.5  // Confirmation criteres
  | 2    // Scan reseau (API call)
  | 2.5  // TOP 3 resultats
  | 3    // Questions jumelage (API call)
  | 3.5  // Scoring detaille (API call)
  | 4    // Selection gagnants
  | 4.5  // Challenge du choix
  | 5;   // Trisociation video

// ── Composant principal ──

export function JumelageLivePage({
  matchId: initialMatchId,
  initialBesoin = "",
  initialCriteres = [],
  demandeurId = 1,
  onNavigate,
  onComplete,
}: JumelageLivePageProps) {
  const [stage, setStage] = useState<Stage>(initialMatchId ? 2.5 : 0);
  const [matchId, setMatchId] = useState<number | null>(initialMatchId || null);
  const [match, setMatch] = useState<Orbit9Match | null>(null);
  const [besoin, setBesoin] = useState(initialBesoin);
  const [criteres, setCriteres] = useState<string[]>(initialCriteres.length > 0 ? initialCriteres : []);
  const [newCritere, setNewCritere] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Donnees des etapes
  const [questions, setQuestions] = useState<JumelageQuestion[]>([]);
  const [scoringCategories, setScoringCategories] = useState<ScoringCategory[]>([]);
  const [scoringResults, setScoringResults] = useState<ScoringResult[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [members, setMembers] = useState<Orbit9Member[]>([]);

  // Trisociation
  const [trisociationData, setTrisociationData] = useState<{
    roomName: string; token: string; livekitUrl: string;
  } | null>(null);

  // Charger un match existant
  useEffect(() => {
    if (initialMatchId) {
      api.getOrbit9Match(initialMatchId).then((m) => {
        setMatch(m);
        setBesoin(m.besoin);
        setCriteres(m.criteres);
        if (m.gagnant_ids.length > 0) {
          setSelectedWinners(m.gagnant_ids);
          setStage(4.5);
        }
      }).catch(console.error);
    }
  }, [initialMatchId]);

  // Charger les membres pour les noms
  useEffect(() => {
    api.listOrbit9Members().then((res) => setMembers(res.members)).catch(console.error);
  }, []);

  const getMemberName = useCallback((memberId: number) => {
    const m = members.find((x) => x.id === memberId);
    return m?.nom || `Membre #${memberId}`;
  }, [members]);

  // ── Actions par stage ──

  const handleLaunch = async () => {
    if (!besoin.trim()) return;
    setStage(1);
  };

  const handleConfirmCriteres = () => {
    setStage(2);
    launchScan();
  };

  const launchScan = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.launchOrbit9Match(besoin, criteres, demandeurId);
      setMatch(result);
      setMatchId(result.id);
      setStage(2.5);
    } catch (err) {
      setError("Erreur lors du scan reseau. Reessayez.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestions = async () => {
    if (!matchId) return;
    setStage(3);
    setLoading(true);
    try {
      const res = await api.generateJumelageQuestions(matchId);
      const adapted = res.questions.map((q) => ({
        question: q.question,
        reponses: q.reponses.map((r) => ({
          integrateur: r.nom,
          nom: r.nom,
          reponse: r.reponse,
          score: r.score,
        })),
      }));
      setQuestions(adapted as unknown as JumelageQuestion[]);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la generation des questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartScoring = async () => {
    if (!matchId) return;
    setStage(3.5);
    setLoading(true);
    try {
      const res = await api.generateJumelageScoring(matchId);
      setScoringCategories(res.categories);
      setScoringResults(res.results);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du scoring.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinners = async () => {
    if (!matchId || selectedWinners.length === 0) return;
    setLoading(true);
    try {
      await api.selectOrbit9Winners(matchId, selectedWinners);
      setStage(4.5);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrisociation = async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const res = await api.startTrisociation(matchId);
      setTrisociationData({
        roomName: res.room_name,
        token: res.token,
        livekitUrl: res.livekit_url,
      });
      setStage(5);
      onComplete?.(matchId);
    } catch (err) {
      console.error(err);
      setError("Erreur LiveKit — verifiez la configuration.");
    } finally {
      setLoading(false);
    }
  };

  const addCritere = () => {
    if (newCritere.trim() && criteres.length < 8) {
      setCriteres([...criteres, newCritere.trim()]);
      setNewCritere("");
    }
  };

  const removeCritere = (idx: number) => {
    setCriteres(criteres.filter((_, i) => i !== idx));
  };

  const toggleWinner = (memberId: number) => {
    setSelectedWinners((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : prev.length < 3 ? [...prev, memberId] : prev
    );
  };

  // ── Stage Progress Bar ──

  const STAGES_LABELS = [
    { id: 0, label: "Besoin" },
    { id: 2, label: "Scan" },
    { id: 3, label: "Questions" },
    { id: 3.5, label: "Scoring" },
    { id: 4, label: "Selection" },
    { id: 5, label: "Trisociation" },
  ];

  const currentIdx = STAGES_LABELS.findIndex((s) => stage <= s.id);

  // ── Render ──

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate("cellules")}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Jumelage Live
            </h2>
            <p className="text-xs text-gray-500">
              {matchId ? `Match #${matchId}` : "Trouvez le partenaire ideal dans votre reseau"}
            </p>
          </div>
        </div>
        {match && (
          <Badge variant="outline" className="text-[9px]">
            {match.candidats?.length || 0} candidat(s)
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {STAGES_LABELS.map((s, i) => {
          const isPast = stage > s.id;
          const isActive = stage >= s.id && (i === STAGES_LABELS.length - 1 || stage < STAGES_LABELS[i + 1].id);
          return (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all",
                isPast ? "bg-green-500 text-white" :
                isActive ? "bg-amber-500 text-white shadow-md scale-110" :
                "bg-gray-200 text-gray-400"
              )}>
                {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-[9px] hidden sm:inline", isActive ? "text-gray-700 font-medium" : "text-gray-400")}>
                {s.label}
              </span>
              {i < STAGES_LABELS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-1", isPast ? "bg-green-400" : "bg-gray-200")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-500 hover:text-red-700">
            <X className="h-3.5 w-3.5 inline" />
          </button>
        </div>
      )}

      {/* ═══ STAGE 0 — Formulaire besoin ═══ */}
      {stage === 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">Decrivez votre besoin</h3>
          </div>
          <textarea
            value={besoin}
            onChange={(e) => setBesoin(e.target.value)}
            placeholder="Ex: Nous cherchons un expert en soudage robotise pour automatiser notre ligne de production..."
            className="w-full border rounded-lg px-4 py-3 text-sm text-gray-700 min-h-[100px] focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none"
          />
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Criteres (optionnel)</div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {criteres.map((c, i) => (
                <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full flex items-center gap-1">
                  {c}
                  <button onClick={() => removeCritere(i)} className="text-amber-400 hover:text-amber-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newCritere}
                onChange={(e) => setNewCritere(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCritere()}
                placeholder="Ajouter un critere..."
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
              <Button size="sm" variant="outline" onClick={addCritere} disabled={!newCritere.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Button
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
            onClick={handleLaunch}
            disabled={!besoin.trim()}
          >
            <Sparkles className="h-4 w-4" /> Lancer le jumelage
          </Button>
        </Card>
      )}

      {/* ═══ STAGE 1 — Animation analyse ═══ */}
      {stage === 1 && (
        <ThinkingAnimation
          steps={[
            { icon: Search, text: "Analyse du besoin..." },
            { icon: Target, text: "Extraction des criteres cles..." },
            { icon: Users, text: "Preparation du scan reseau..." },
          ]}
          botName="CarlOS"
          botCode="BCO"
          onComplete={() => setStage(1.5)}
        />
      )}

      {/* ═══ STAGE 1.5 — Confirmation criteres ═══ */}
      {stage === 1.5 && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">Confirmez les criteres de recherche</h3>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="text-xs text-blue-600 font-medium mb-1">Besoin identifie</div>
            <p className="text-sm text-blue-800">{besoin}</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Criteres de matching</div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {criteres.map((c, i) => (
                <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full flex items-center gap-1">
                  {c}
                  <button onClick={() => removeCritere(i)} className="text-amber-400 hover:text-amber-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {criteres.length === 0 && (
                <span className="text-xs text-gray-400 italic">Aucun critere specifique — le scan utilisera le besoin directement</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newCritere}
                onChange={(e) => setNewCritere(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCritere()}
                placeholder="Ajouter un critere..."
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-300"
              />
              <Button size="sm" variant="outline" onClick={addCritere} disabled={!newCritere.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700" onClick={handleConfirmCriteres}>
            <Search className="h-4 w-4" /> Scanner le reseau
          </Button>
        </Card>
      )}

      {/* ═══ STAGE 2 — Scan reseau ═══ */}
      {stage === 2 && (
        <NetworkScanAnimation
          steps={[
            { label: "Filtre geographique (Quebec)", count: 85 },
            { label: "Filtre sectoriel", count: 23 },
            { label: "Compatibilite technique", count: 8 },
            { label: "Scoring IA avance", count: 3 },
          ]}
          onComplete={() => {
            if (match) setStage(2.5);
          }}
        />
      )}

      {/* ═══ STAGE 2.5 — TOP 3 resultats ═══ */}
      {stage === 2.5 && match && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">TOP {Math.min(3, match.candidats.length)} — Meilleurs candidats</h3>
          </div>

          <div className="space-y-3">
            {match.candidats.slice(0, 3).map((c, i) => {
              const rankColors = [
                "from-amber-400 to-yellow-500",
                "from-gray-300 to-gray-400",
                "from-orange-300 to-orange-400",
              ];
              return (
                <Card key={c.member_id} className="p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: `${i * 200}ms` }}>
                  <div className="flex items-center gap-4 p-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br shadow-md shrink-0",
                      rankColors[i]
                    )}>
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{c.nom}</div>
                      <div className="text-xs text-gray-500">{c.raison}</div>
                    </div>
                    <div className={cn(
                      "text-xl font-bold tabular-nums",
                      c.score >= 80 ? "text-green-600" : c.score >= 60 ? "text-amber-600" : "text-gray-500"
                    )}>
                      {c.score}%
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100">
                    <div
                      className={cn("h-full rounded-r-full transition-all duration-700",
                        i === 0 ? "bg-green-500" : i === 1 ? "bg-amber-500" : "bg-gray-400"
                      )}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {match.candidats.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-sm text-gray-500">Aucun candidat trouve. Essayez le Bot Scout.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 gap-1.5"
                onClick={() => matchId && api.triggerOrbit9Scout(matchId)}
              >
                <Search className="h-3.5 w-3.5" /> Lancer le Bot Scout
              </Button>
            </Card>
          )}

          {match.candidats.length > 0 && (
            <Button className="w-full gap-2" onClick={handleStartQuestions}>
              <Handshake className="h-4 w-4" /> Demarrer la session de jumelage
            </Button>
          )}
        </div>
      )}

      {/* ═══ STAGE 3 — Questions jumelage ═══ */}
      {stage === 3 && (
        <div className="space-y-4">
          {loading && questions.length === 0 ? (
            <ThinkingAnimation
              steps={[
                { icon: Zap, text: "Generation des questions contextuelles..." },
                { icon: Target, text: "Simulation des reponses candidats..." },
                { icon: BarChart3, text: "Preparation de l'evaluation..." },
              ]}
              botName="CarlOS"
              botCode="BCO"
              onComplete={() => {}}
            />
          ) : questions.length > 0 ? (
            <JumelageSessionAnimation
              questions={questions as any}
              onComplete={handleStartScoring}
            />
          ) : null}
        </div>
      )}

      {/* ═══ STAGE 3.5 — Scoring detaille ═══ */}
      {stage === 3.5 && (
        <div className="space-y-4">
          {loading && scoringCategories.length === 0 ? (
            <ThinkingAnimation
              steps={[
                { icon: BarChart3, text: "Calcul du scoring multicritere..." },
                { icon: Shield, text: "Verification des certifications..." },
                { icon: Star, text: "Ponderation finale..." },
              ]}
              botName="CarlOS"
              botCode="BCO"
              onComplete={() => {}}
            />
          ) : scoringCategories.length > 0 ? (
            <ScoringAnimation
              categories={scoringCategories}
              results={scoringResults}
              onComplete={() => setStage(4)}
            />
          ) : null}
        </div>
      )}

      {/* ═══ STAGE 4 — Selection gagnants ═══ */}
      {stage === 4 && match && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-bold text-gray-800">Selectionnez le(s) gagnant(s)</h3>
            <span className="text-[9px] text-gray-400">(1 a 3 max)</span>
          </div>

          <div className="space-y-2">
            {(scoringResults.length > 0 ? scoringResults : match.candidats.slice(0, 3).map((c) => ({
              nom: c.nom,
              member_id: c.member_id,
              scores: [],
              total: c.score,
            }))).map((r) => {
              const isSelected = selectedWinners.includes(r.member_id);
              return (
                <Card
                  key={r.member_id}
                  className={cn(
                    "p-4 cursor-pointer transition-all",
                    isSelected ? "border-2 border-green-500 bg-green-50 shadow-md" : "hover:border-gray-300"
                  )}
                  onClick={() => toggleWinner(r.member_id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      isSelected ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {isSelected ? <CheckCircle2 className="h-4 w-4" /> : "?"}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{r.nom}</div>
                    </div>
                    <div className={cn(
                      "text-lg font-bold tabular-nums",
                      r.total >= 80 ? "text-green-600" : r.total >= 60 ? "text-amber-600" : "text-gray-500"
                    )}>
                      {r.total}%
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            onClick={handleSelectWinners}
            disabled={selectedWinners.length === 0 || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirmer la selection ({selectedWinners.length} gagnant{selectedWinners.length > 1 ? "s" : ""})
          </Button>
        </div>
      )}

      {/* ═══ STAGE 4.5 — Challenge du choix ═══ */}
      {stage === 4.5 && match && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />
            <div className="px-6 py-5">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="h-8 w-8 text-amber-500" />
                <div>
                  <div className="text-[9px] text-amber-600 font-semibold uppercase">
                    {selectedWinners.length === 1 ? "Partenaire selectionne" : `${selectedWinners.length} partenaires selectionnes`}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedWinners.map((id) => getMemberName(id)).join(", ")}
                  </h3>
                </div>
              </div>

              <div className="bg-white/80 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <BotAvatar code="BCO" size="sm" />
                  <div>
                    <div className="text-[9px] font-semibold text-blue-600 mb-0.5">CarlOS — Challenge du choix</div>
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "Excellent choix! Avant de proceder a la trisociation, voici pourquoi cette selection est strategique:
                      le(s) partenaire(s) selectionne(s) offre(nt) la meilleure combinaison d'expertise technique et de proximite
                      pour votre besoin en {besoin.slice(0, 60)}..."
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                  onClick={handleStartTrisociation}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  Lancer la Trisociation Video
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setStage(4)}
                >
                  <ArrowLeft className="h-4 w-4" /> Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STAGE 5 — Trisociation Video ═══ */}
      {stage === 5 && trisociationData && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Video className="h-6 w-6" />
              <h3 className="text-lg font-bold">Trisociation en cours</h3>
            </div>
            <p className="text-sm text-purple-200 text-center mb-4">
              Match #{matchId} — {besoin.slice(0, 80)}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                  <Users className="h-8 w-8" />
                </div>
                <div className="text-xs font-semibold">Vous</div>
                <div className="text-[9px] text-purple-200">Demandeur</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                  <BotAvatar code="BCO" size="lg" />
                </div>
                <div className="text-xs font-semibold">CarlOS</div>
                <div className="text-[9px] text-purple-200">Facilitateur IA</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                  <Handshake className="h-8 w-8" />
                </div>
                <div className="text-xs font-semibold">
                  {selectedWinners.map((id) => getMemberName(id)).join(", ")}
                </div>
                <div className="text-[9px] text-purple-200">Partenaire(s)</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-[9px] text-purple-200 mb-2">Room LiveKit</div>
              <code className="text-sm font-mono">{trisociationData.roomName}</code>
              <p className="text-xs text-purple-300 mt-2">
                Partagez ce lien avec le partenaire pour qu'il rejoigne la session video.
              </p>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                className="flex-1 bg-white text-purple-700 hover:bg-purple-50"
                onClick={() => {
                  navigator.clipboard.writeText(trisociationData.roomName);
                }}
              >
                Copier le code de la room
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => onNavigate?.("cellules")}
              >
                Retour aux cellules
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
