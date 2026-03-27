/**
 * AtelierSiteWeb.tsx — Simulation "Usine Bleue Site Web"
 * GAUCHE: Visiteur interagit avec Carlos → qualification → diagnostic → aiguillage conference AI
 * DROITE: Site web qui se transforme progressivement en dashboard diagnostic → pipeline client
 * Pattern DocForge — actions inline dans les bulles, panneau droit = document progressif
 * Sprint B — Ateliers Verticaux
 */

"use client";

import { useState } from "react";
import {
  Globe,
  Scan,
  Handshake,
  Video,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Target,
  Building2,
  Sparkles,
  Users,
  Zap,
  BarChart3,
  Calendar,
  Send,
  Phone,
  ShieldQuestion,
  MessageSquare,
  FileText,
  TrendingUp,
  Factory,
  Award,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
  BotAvatar,
} from "../../shared/simulation-components";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES & CONSTANTS ==========

type Stage =
  | "accueil"
  | "qualification-thinking"
  | "qualification"
  | "user-answer"
  | "diagnostic-thinking"
  | "diagnostic"
  | "proposition"
  | "booking"
  | "conference"
  | "next-steps"
  | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  accueil: 0,
  "qualification-thinking": 1,
  qualification: 2,
  "user-answer": 3,
  "diagnostic-thinking": 4,
  diagnostic: 5,
  proposition: 6,
  booking: 7,
  conference: 8,
  "next-steps": 9,
  conclusion: 10,
};

const STAGE_LABELS: Record<Stage, string> = {
  accueil: "Accueil",
  "qualification-thinking": "Analyse...",
  qualification: "Qualification",
  "user-answer": "Reponses",
  "diagnostic-thinking": "Diagnostic...",
  diagnostic: "Resultats",
  proposition: "Proposition",
  booking: "Planification",
  conference: "Conference AI",
  "next-steps": "Pipeline",
  conclusion: "Termine",
};

// ========== VISITOR & DIAGNOSTIC DATA ==========

const VISITOR = {
  name: "Jean-Pierre Gagnon",
  company: "Gagnon Metallurgie Inc.",
  city: "Drummondville",
  employees: 35,
  sector: "Metallurgie / Fabrication sur mesure",
};

const VITAA_SCORES = [
  { label: "Vente", score: 45, color: "bg-red-500" },
  { label: "Idee", score: 60, color: "bg-amber-500" },
  { label: "Temps", score: 30, color: "bg-red-600" },
  { label: "Argent", score: 55, color: "bg-amber-500" },
  { label: "Actif", score: 40, color: "bg-red-500" },
];

const PAIN_POINTS = [
  { title: "Couts d'energie", detail: "+40% en 2 ans, aucun audit energetique", savings: "180K$/an", icon: Zap },
  { title: "Main d'oeuvre", detail: "3 postes non combles depuis 6 mois (soudeurs)", savings: "2 postes automatisables", icon: Users },
  { title: "Processus manuels", detail: "Soudure 100% manuelle, zero robotisation", savings: "ROI 14 mois", icon: Factory },
];

const CONFERENCE_EXCHANGES = [
  { from: "CPOB" as const, text: "Bienvenue Jean-Pierre. J'ai analyse votre diagnostic avec Carl. Votre situation est typique des PME metallurgiques de 25-50 employes — on voit ca souvent dans le reseau. Laissez-moi vous expliquer les options." },
  { from: "CEOB" as const, text: "Jean-Pierre, j'ai accompagne 3 entreprises similaires a la votre dans la derniere annee. Le pattern est clair : energie d'abord, robotisation ensuite. Un integrateur du reseau a sauve 210K$ a une usine de tolerie a Sherbrooke avec exactement la meme approche." },
  { from: "user" as const, text: "C'est interessant. Mais on a un budget serre. Est-ce qu'il y a des subventions possibles?" },
  { from: "CPOB" as const, text: "Absolument. Pour votre profil, vous etes eligible a 3 programmes : EcoPerformance HQ (75K$), STIQ Innovation (50K$), et le programme federal PPATN (100K$). Potentiel total : 225K$. Mon role, c'est de vous jumeler avec un integrateur qui a un taux d'approbation de 90%+ sur ces dossiers." },
  { from: "CEOB" as const, text: "Je recommande de passer au Jumelage SMART. On va scanner le reseau de 130 membres pour trouver les 3 meilleurs integrateurs pour votre projet. Paco va organiser les sessions de rencontre. Ca vous convient?" },
  { from: "user" as const, text: "Oui, allons-y. Quand est-ce qu'on peut commencer?" },
];

const PIPELINE_STEPS = [
  { label: "Diagnostic IA", status: "done" as const },
  { label: "Conference d'aiguillage", status: "done" as const },
  { label: "Jumelage SMART (3 sessions)", status: "next" as const },
  { label: "Cahier de projet", status: "pending" as const },
  { label: "Lancement du projet", status: "pending" as const },
];

// ========== MAIN COMPONENT ==========

export function AtelierSiteWeb({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("accueil");
  const [accueilTyped, setAccueilTyped] = useState(false);
  const [qualTyped, setQualTyped] = useState(false);
  const [diagTyped, setDiagTyped] = useState(false);
  const [propTyped, setPropTyped] = useState(false);

  // Document fill state
  const [profilFilled, setProfilFilled] = useState(false);
  const [diagFilled, setDiagFilled] = useState(false);
  const [prioritesFilled, setPrioritesFilled] = useState(false);
  const [conferenceFilled, setConferenceFilled] = useState(false);
  const [pipelineFilled, setPipelineFilled] = useState(false);
  const [extractedNotes, setExtractedNotes] = useState<string[]>([]);

  const handleExtract = (key: string) => {
    if (!extractedNotes.includes(key)) setExtractedNotes((prev) => [...prev, key]);
  };

  const handleReset = () => {
    setStage("accueil");
    setAccueilTyped(false);
    setQualTyped(false);
    setDiagTyped(false);
    setPropTyped(false);
    setProfilFilled(false);
    setDiagFilled(false);
    setPrioritesFilled(false);
    setConferenceFilled(false);
    setPipelineFilled(false);
    setExtractedNotes([]);
  };

  // ═══════════════════════════════════════
  // CHAT CONTENT (Left Panel)
  // ═══════════════════════════════════════
  const chatContent = (
    <>
      {/* Accueil — Carlos greets visitor on the site */}
      {stage === "accueil" && (
        <BotBubble code="CEOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text="Bienvenue sur Usine Bleue! Je suis Carlos, votre assistant IA. Je peux vous aider a evaluer rapidement le potentiel d'amelioration de votre entreprise manufacturiere. Un diagnostic gratuit en 5 minutes — ca vous interesse?"
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setAccueilTyped(true)}
          />
          {accueilTyped && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button
                onClick={() => setStage("qualification-thinking")}
                className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Oui, commencer le diagnostic
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "accueil" && (
        <BotBubble
          code="CEOB"
          text="Bienvenue sur Usine Bleue! Diagnostic gratuit en 5 minutes pour evaluer votre potentiel d'amelioration."
          phaseLabel="Connecter"
          time="10:02"
        />
      )}

      {/* Qualification thinking */}
      {stage === "qualification-thinking" && (
        <ThinkingAnimation
          steps={[
            { icon: Scan, text: "Preparation du questionnaire de qualification..." },
            { icon: Factory, text: "Chargement des benchmarks sectoriels..." },
            { icon: BarChart3, text: "Calibration du moteur VITAA..." },
          ]}
          botEmoji=""
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("qualification")}
        />
      )}

      {/* Qualification marker */}
      {STAGE_INDEX[stage] > STAGE_INDEX["qualification-thinking"] && (
        <div className="flex items-center gap-2 ml-10 py-1.5">
          <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <span className="text-[11px] text-teal-700 font-medium">Moteur de diagnostic pret</span>
        </div>
      )}

      {/* Qualification — Carlos asks 3 questions */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["qualification"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Rechercher" time="10:03">
          {stage === "qualification" ? (
            <>
              <TypewriterText
                text="Parfait! Pour bien cibler votre diagnostic, j'ai besoin de 3 informations rapides : 1) Votre secteur d'activite et nombre d'employes? 2) Votre plus grand defi operationnel en ce moment? 3) Avez-vous deja fait un audit energetique ou de productivite?"
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => setQualTyped(true)}
              />
              {qualTyped && (
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <button
                    onClick={() => {
                      setProfilFilled(true);
                      setStage("user-answer");
                    }}
                    className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Repondre
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-800">3 questions de qualification posees pour calibrer le diagnostic.</p>
          )}
        </BotBubble>
      )}

      {/* User answers */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["user-answer"] && (
        <>
          <UserBubble text="On est dans la metallurgie, fabrication sur mesure, 35 employes a Drummondville. Notre plus gros probleme c'est les couts d'energie qui ont monte de 40% en 2 ans, puis on trouve plus de soudeurs — 3 postes non combles depuis 6 mois. On n'a jamais fait d'audit." time="10:04" />
          <BotBubble
            code="CEOB"
            text="Merci Jean-Pierre. Metallurgie, 35 employes, Drummondville — profil tres clair. Couts d'energie +40% et penurie de main d'oeuvre — ce sont les 2 signaux les plus courants dans votre secteur. Je lance le diagnostic maintenant."
            phaseLabel="Rechercher"
            time="10:05"
          />
          {stage === "user-answer" && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage("diagnostic-thinking")}
                className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
              >
                <Scan className="h-3.5 w-3.5" /> Lancer le diagnostic VITAA
              </button>
            </div>
          )}
        </>
      )}

      {/* Diagnostic thinking */}
      {stage === "diagnostic-thinking" && (
        <ThinkingAnimation
          steps={[
            { icon: BarChart3, text: "Analyse du profil VITAA (5 piliers)..." },
            { icon: Zap, text: "Comparaison avec 130+ entreprises du reseau..." },
            { icon: Target, text: "Identification des 3 priorites d'action..." },
            { icon: TrendingUp, text: "Calcul du potentiel d'economies..." },
          ]}
          botEmoji=""
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => {
            setDiagFilled(true);
            setPrioritesFilled(true);
            setStage("diagnostic");
          }}
        />
      )}

      {/* Diagnostic marker */}
      {STAGE_INDEX[stage] > STAGE_INDEX["diagnostic-thinking"] && STAGE_INDEX[stage] <= STAGE_INDEX["diagnostic"] && (
        <div className="flex items-center gap-2 ml-10 py-1.5">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          </div>
          <span className="text-[11px] text-green-700 font-medium">Diagnostic VITAA complete — Triangle du Feu : COUVE</span>
        </div>
      )}

      {/* Diagnostic results */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["diagnostic"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Exposer" time="10:06">
          {stage === "diagnostic" ? (
            <>
              <TypewriterText
                text="Votre diagnostic est pret. Score global : 46% — Triangle du Feu en mode COUVE (2 piliers sur 5 au-dessus de 50%). Ca veut dire que votre entreprise a du potentiel mais qu'il y a des gaps critiques. 3 priorites identifiees avec un potentiel de 180K$/an en economies. Je vous recommande fortement une conference d'aiguillage avec notre expert Paco pour valider les options."
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => setDiagTyped(true)}
              />
              {diagTyped && (
                <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleExtract("diagnostic")}
                    className={cn(
                      "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                      extractedNotes.includes("diagnostic")
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("diagnostic") ? "Extrait ✓" : "Extraire le diagnostic"}
                  </button>
                  <button
                    onClick={() => setStage("proposition")}
                    className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
                  >
                    <Video className="h-3.5 w-3.5" /> Planifier une conference d'aiguillage
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-800">Diagnostic VITAA : score 46%, Triangle du Feu COUVE, 3 priorites, potentiel 180K$/an.</p>
          )}
        </BotBubble>
      )}

      {/* Proposition — Carlos introduces Paco */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["proposition"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Demontrer" time="10:07">
          {stage === "proposition" ? (
            <>
              <TypewriterText
                text="Je transfere votre dossier a Paco, notre expert en integration industrielle. Il va vous proposer un creneau pour une conference d'aiguillage de 30 minutes — lui, moi, et vous. On va valider les priorites et planifier le jumelage avec les bons integrateurs du reseau."
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => setPropTyped(true)}
              />
              {propTyped && (
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <button
                    onClick={() => setStage("booking")}
                    className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Voir les disponibilites
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-800">Transfert a Paco pour la conference d'aiguillage.</p>
          )}
        </BotBubble>
      )}

      {/* Booking — schedule simulation */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["booking"] && (
        <>
          <BotBubble code="CPOB" text="" phaseLabel="Organiser" time="10:08">
            <p className="text-sm text-gray-800">Bonjour Jean-Pierre! C'est Paco. J'ai reserve un creneau pour notre conference d'aiguillage. Voici les options :</p>
            <div className="mt-2 space-y-1.5">
              {[
                { day: "Mardi 15h", available: true },
                { day: "Mercredi 10h", available: true },
                { day: "Jeudi 14h", available: false },
              ].map((slot, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs",
                  slot.available ? "bg-green-50 border border-green-200 text-green-800" : "bg-gray-50 border border-gray-200 text-gray-400"
                )}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-medium">{slot.day}</span>
                  {slot.available ? (
                    <span className="text-[9px] ml-auto text-green-600">Disponible</span>
                  ) : (
                    <span className="text-[9px] ml-auto">Complet</span>
                  )}
                </div>
              ))}
            </div>
          </BotBubble>
          {stage === "booking" && (
            <>
              <UserBubble text="Mardi 15h, ca me va!" time="10:09" />
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setConferenceFilled(true);
                    setStage("conference");
                  }}
                  className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5" /> Rejoindre la conference AI
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Conference marker */}
      {STAGE_INDEX[stage] > STAGE_INDEX["booking"] && (
        <div className="flex items-center gap-2 ml-10 py-1.5">
          <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <Calendar className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <span className="text-[11px] text-teal-700 font-medium">Mardi 15h — conference confirmee</span>
        </div>
      )}

      {/* Conference AI — Paco + Carl + Jean-Pierre */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["conference"] && (
        <>
          {/* Conference bar */}
          {stage === "conference" && (
            <div className="bg-gray-900 rounded-xl px-4 py-2.5 flex items-center gap-3 mx-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] text-gray-300 font-medium">Conference AI — Aiguillage</span>
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1">
                  <BotAvatar code="CPOB" size="sm" />
                  <span className="text-[9px] text-gray-400">Paco</span>
                </div>
                <div className="flex items-center gap-1">
                  <BotAvatar code="CEOB" size="sm" />
                  <span className="text-[9px] text-gray-400">Carl</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">JP</div>
                  <span className="text-[9px] text-gray-400">Jean-Pierre</span>
                </div>
              </div>
            </div>
          )}

          {/* Conference exchanges */}
          {stage === "conference" ? (
            <div className="space-y-3">
              {CONFERENCE_EXCHANGES.map((ex, i) => {
                if (ex.from === "CPOB" || ex.from === "CEOB") {
                  return <BotBubble key={i} code={ex.from} text={ex.text} phaseLabel="Aiguillage" />;
                }
                return <UserBubble key={i} text={ex.text} />;
              })}

              {/* Actions after conference */}
              <div className="ml-2 space-y-2">
                <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/50">
                  <p className="text-[9px] font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Decisions prises
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-amber-900">Strategie : energie d'abord, robotisation ensuite</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-amber-900">Subventions : 225K$ potentiel (3 programmes eligibles)</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-amber-900">Prochain : Jumelage SMART avec 3 integrateurs du reseau</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleExtract("conference")}
                    className={cn(
                      "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                      extractedNotes.includes("conference")
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("conference") ? "Extrait ✓" : "Extraire les decisions"}
                  </button>
                  <button
                    onClick={() => {
                      setPipelineFilled(true);
                      setStage("next-steps");
                    }}
                    className="text-[11px] bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Activer le pipeline
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-10 py-1.5">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              </div>
              <span className="text-[11px] text-green-700 font-medium">Conference d'aiguillage terminee — 3 decisions prises</span>
            </div>
          )}
        </>
      )}

      {/* Next steps */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["next-steps"] && (
        <>
          <BotBubble
            code="CEOB"
            text="Le pipeline est active pour Gagnon Metallurgie. Paco va organiser les 3 sessions de jumelage avec des integrateurs specialises en energie et robotique dans votre region. Vous allez recevoir une confirmation par courriel. Bienvenue dans le reseau Usine Bleue!"
            phaseLabel="Obtenir"
            time="10:15"
          />
          {stage === "next-steps" && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage("conclusion")}
                className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-teal-700 font-medium cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Voir le recapitulatif
              </button>
            </div>
          )}
        </>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <>
          <BotBubble
            code="CEOB"
            text="Recapitulatif : diagnostic complete, conference d'aiguillage faite, pipeline active. Prochaine etape — jumelage avec 3 integrateurs certifies. Tout le processus, du diagnostic au lancement du projet, est gere par notre equipe IA. Merci Jean-Pierre!"
            phaseLabel="Conclusion"
            time="10:16"
          />
          <div className="space-y-3 ml-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleReset}
                className="text-xs bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer border border-gray-200"
              >
                Recommencer
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ATELIER CONTENT (Right Panel)
  // ═══════════════════════════════════════
  const filledCount =
    (profilFilled ? 1 : 0) +
    (diagFilled ? 1 : 0) +
    (prioritesFilled ? 1 : 0) +
    (conferenceFilled ? 1 : 0) +
    (pipelineFilled ? 1 : 0);

  const atelierContent = (
    <div className="space-y-3">
      {/* Website preview header */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 flex items-center gap-2">
          <Globe className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white">usinebleue.ai</span>
          <div className="ml-auto flex items-center gap-4 text-[9px] text-teal-100">
            <span>Diagnostic</span>
            <span>Jumelage</span>
            <span>Reseau</span>
            <span>Contact</span>
          </div>
        </div>
        <div className="px-4 py-3 bg-gradient-to-b from-teal-50 to-white">
          <h3 className="text-sm font-bold text-gray-800">L'IA au service de la croissance manufacturiere</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Diagnostic gratuit en 5 minutes — 130+ entreprises accompagnees</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { icon: Scan, title: "Diagnostic IA", desc: "Evaluez vos forces et gaps en 5 min" },
              { icon: Handshake, title: "Jumelage SMART", desc: "Trouvez LE bon integrateur" },
              { icon: FileText, title: "Cahier de Projet", desc: "Structurez la collaboration" },
            ].map((svc, i) => (
              <div key={i} className="bg-white border border-teal-100 rounded-lg p-2 text-center">
                <svc.icon className="h-4 w-4 text-teal-600 mx-auto" />
                <p className="text-[9px] font-bold text-gray-800 mt-1">{svc.title}</p>
                <p className="text-[9px] text-gray-500 leading-tight">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="px-4 py-2 border-t border-teal-100 flex items-center gap-2">
          <div className="flex-1 bg-teal-100 rounded-full h-1.5">
            <div
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${filledCount * 20}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-teal-800">{filledCount}/5</span>
        </div>
      </div>

      {/* Section 1 — Profil Visiteur */}
      <DocSectionCard title="1. Profil Visiteur" icon={Users} filled={profilFilled}>
        {profilFilled && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Entreprise", value: VISITOR.company },
                { label: "Contact", value: VISITOR.name },
                { label: "Secteur", value: VISITOR.sector },
                { label: "Taille", value: `${VISITOR.employees} employes` },
                { label: "Localisation", value: VISITOR.city },
                { label: "Audit precedent", value: "Aucun" },
              ].map((field, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-gray-500 font-medium">{field.label}</p>
                  <p className="text-[11px] text-gray-800 font-medium">{field.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-[11px] text-amber-800">
                <span className="font-bold">Defis declares :</span> Couts energie +40%, 3 postes soudeurs non combles, zero automatisation
              </p>
            </div>
          </div>
        )}
      </DocSectionCard>

      {/* Section 2 — Diagnostic VITAA */}
      <DocSectionCard title="2. Diagnostic VITAA" icon={BarChart3} filled={diagFilled}>
        {diagFilled && (
          <div className="space-y-2.5">
            {VITAA_SCORES.map((v, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-gray-700 font-medium">{v.label}</span>
                  <span className={cn("text-[11px] font-bold", v.score >= 50 ? "text-amber-600" : "text-red-600")}>{v.score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", v.color)} style={{ width: `${v.score}%` }} />
                </div>
              </div>
            ))}
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2 flex items-center gap-2">
              <div className="text-lg">🔥</div>
              <div>
                <p className="text-[11px] font-bold text-red-800">Triangle du Feu : COUVE</p>
                <p className="text-[9px] text-red-700">2 piliers sur 5 au-dessus de 50% — potentiel de croissance significatif</p>
              </div>
            </div>
          </div>
        )}
      </DocSectionCard>

      {/* Section 3 — Priorités d'action */}
      <DocSectionCard title="3. Priorites d'Action" icon={Target} filled={prioritesFilled}>
        {prioritesFilled && (
          <div className="space-y-2">
            {PAIN_POINTS.map((pp, i) => (
              <div key={i} className="border rounded-lg p-2.5 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0",
                    i === 0 ? "bg-red-500" : i === 1 ? "bg-amber-500" : "bg-orange-500"
                  )}>
                    {i + 1}
                  </div>
                  <span className="text-xs font-bold text-gray-800">{pp.title}</span>
                  <pp.icon className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                </div>
                <p className="text-[11px] text-gray-600 mb-1">{pp.detail}</p>
                <div className="bg-green-50 rounded px-2 py-1 inline-flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-[9px] font-bold text-green-700">{pp.savings}</span>
                </div>
              </div>
            ))}
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
              <p className="text-xs font-bold text-green-800">Potentiel total : 180K$/an</p>
              <p className="text-[9px] text-green-700">ROI estime : 14 mois</p>
            </div>
          </div>
        )}
      </DocSectionCard>

      {/* Section 4 — Conférence d'aiguillage */}
      <DocSectionCard title="4. Conference d'Aiguillage" icon={Video} filled={conferenceFilled}>
        {conferenceFilled && (
          <div className="space-y-2">
            {/* Mini cockpit */}
            <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
              <div className="px-3 py-1.5 flex items-center gap-2 border-b border-gray-800">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] text-gray-400 font-medium">COCKPIT — Participants</span>
              </div>
              <div className="p-2 grid grid-cols-3 gap-1.5">
                <div className="bg-gray-800 rounded-lg p-2 text-center">
                  <BotAvatar code="CPOB" size="sm" />
                  <p className="text-[9px] text-gray-300 mt-1">Paco</p>
                  <p className="text-[9px] text-gray-500">Expert</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2 text-center">
                  <BotAvatar code="CEOB" size="sm" />
                  <p className="text-[9px] text-gray-300 mt-1">Carl</p>
                  <p className="text-[9px] text-gray-500">Fondateur</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2 text-center">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold mx-auto">JP</div>
                  <p className="text-[9px] text-gray-300 mt-1">Jean-Pierre</p>
                  <p className="text-[9px] text-gray-500">Client</p>
                </div>
              </div>
            </div>

            {/* Decisions */}
            <div className="space-y-1">
              {[
                "Strategie validee : energie → robotisation",
                "3 programmes de subventions identifies (225K$)",
                "Jumelage SMART approuve — 3 sessions a planifier",
              ].map((d, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-gray-700">{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DocSectionCard>

      {/* Section 5 — Pipeline Client */}
      <DocSectionCard title="5. Pipeline Client" icon={TrendingUp} filled={pipelineFilled}>
        {pipelineFilled && (
          <div className="space-y-2">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  step.status === "done" ? "bg-green-100" :
                  step.status === "next" ? "bg-teal-100" : "bg-gray-100"
                )}>
                  {step.status === "done" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : step.status === "next" ? (
                    <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-gray-300" />
                  )}
                </div>
                <span className={cn(
                  "text-[11px] font-medium",
                  step.status === "done" ? "text-green-700" :
                  step.status === "next" ? "text-teal-700 font-bold" : "text-gray-400"
                )}>
                  {step.label}
                </span>
                {step.status === "next" && (
                  <span className="text-[9px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold ml-auto">PROCHAIN</span>
                )}
              </div>
            ))}

            <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 mt-2">
              <p className="text-[11px] text-teal-800 font-medium">
                Temps ecoule : visiteur → pipeline active en 15 minutes
              </p>
              <p className="text-[9px] text-teal-700">
                Ancien processus humain : 6 semaines minimum
              </p>
            </div>
          </div>
        )}
      </DocSectionCard>
    </div>
  );

  return (
    <AtelierLayout
      title="Usine Bleue — Site Web"
      icon={Globe}
      iconColor="text-teal-600"
      stage={STAGE_INDEX[stage]}
      stageCount={11}
      stageLabel={STAGE_LABELS[stage]}
      onBack={onBack}
      onReset={handleReset}
      chatContent={chatContent}
      atelierContent={atelierContent}
      actions={[]}
    />
  );
}

// ========== DOCUMENT SECTION CARD ==========

function DocSectionCard({
  title,
  icon: Icon,
  filled,
  children,
}: {
  title: string;
  icon: React.ElementType;
  filled: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-500",
        filled ? "border-gray-200" : "border-dashed border-gray-300 opacity-60"
      )}
    >
      <div
        className={cn(
          "px-4 py-2 flex items-center gap-2 border-b",
          filled ? "bg-gray-50 border-gray-200" : "bg-gray-50/50 border-gray-200/50"
        )}
      >
        {filled ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-gray-300" />
        )}
        <Icon className={cn("h-3.5 w-3.5", filled ? "text-gray-600" : "text-gray-300")} />
        <span className={cn("text-xs font-medium", filled ? "text-gray-700" : "text-gray-400")}>{title}</span>
        {!filled && <span className="text-[9px] text-gray-400 ml-auto italic">En attente...</span>}
      </div>
      {filled && children && <div className="p-3">{children}</div>}
    </div>
  );
}
