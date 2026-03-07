/**
 * BibleGHMLPage.tsx — Bible GHML (Ghost Modeling Language)
 * Framework proprietaire — resume complet pour detection d'incoherences
 * Single scrollable page, no tabs — summary for Carl to scan at a glance
 */

import {
  Atom, ArrowRight, Zap, BarChart3,
  Flame, Combine, Users, Brain,
  Grid3X3, Sparkles, AlertTriangle, CheckCircle2,
  MessageSquare, Target, Lightbulb, Shield,
  Swords, BookOpen, Compass, Search,
  Eye, Trophy, Rocket, X,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const CREDO_PHASES = [
  { letter: "C", name: "Connecter", color: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-700", desc: "Etablir le lien, comprendre le besoin", bouche: "Connecter", cerveau: "Clarifier", coeur: "Comprendre" },
  { letter: "R", name: "Rechercher", color: "bg-violet-500", lightBg: "bg-violet-50", textColor: "text-violet-700", desc: "Analyser, diagnostiquer, explorer", bouche: "Rechercher", cerveau: "Reflechir", coeur: "Resonner" },
  { letter: "E", name: "Exposer", color: "bg-amber-500", lightBg: "bg-amber-50", textColor: "text-amber-700", desc: "Reveler les insights, montrer les options", bouche: "Exposer", cerveau: "Elaborer", coeur: "Elever" },
  { letter: "D", name: "Demontrer", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700", desc: "Prouver la valeur, valider", bouche: "Demontrer", cerveau: "Decider", coeur: "Debloquer" },
  { letter: "O", name: "Obtenir", color: "bg-green-600", lightBg: "bg-green-50", textColor: "text-green-700", desc: "Conclure, livrer, next steps", bouche: "Obtenir", cerveau: "Operer", coeur: "Ouvrir" },
];

const VITAA_PILLARS = [
  { letter: "V", name: "Vente", desc: "Capacite commerciale", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { letter: "I", name: "Idee", desc: "Innovation et vision", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { letter: "T", name: "Temps", desc: "Gestion du temps et priorites", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { letter: "A", name: "Argent", desc: "Sante financiere", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { letter: "A", name: "Actif", desc: "Actifs et ressources", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
];

const GHOSTS = [
  { id: "G1", name: "Bezos", archetype: "Le Systemiste", specialty: "Strategie client", color: "bg-blue-500" },
  { id: "G2", name: "Jobs", archetype: "Le Designer", specialty: "Design thinking", color: "bg-gray-800" },
  { id: "G3", name: "Musk", archetype: "L'Executeur", specialty: "Innovation audacieuse", color: "bg-red-500" },
  { id: "G4", name: "Sun Tzu", archetype: "Le Stratege", specialty: "Strategie militaire", color: "bg-emerald-600" },
  { id: "G5", name: "Munger", archetype: "L'Inverseur", specialty: "Modeles mentaux", color: "bg-amber-600" },
  { id: "G6", name: "Marc Aurele", archetype: "Le Stoicien", specialty: "Stoicisme", color: "bg-slate-600" },
  { id: "G7", name: "Churchill", archetype: "Le Mobilisateur", specialty: "Leadership de crise", color: "bg-indigo-600" },
  { id: "G8", name: "Disney", archetype: "Le Reveur", specialty: "Storytelling", color: "bg-pink-500" },
  { id: "G9", name: "Tesla", archetype: "Le Resonateur", specialty: "Catalyseur constant 3-6-9", color: "bg-violet-600" },
  { id: "G10", name: "Buffett", archetype: "Le Composeur", specialty: "Investissement valeur", color: "bg-green-600" },
  { id: "G11", name: "Curie", archetype: "La Pionniere", specialty: "Recherche scientifique", color: "bg-teal-600" },
  { id: "G12", name: "Oprah", archetype: "L'Amplificatrice", specialty: "Communication empathique", color: "bg-orange-500" },
];

const TRISOCIATION_EXAMPLES = [
  { code: "BCO", role: "CEO", formula: "Gh(Bz·Mg·Ch)STX", primaire: "Bezos", calibrateur: "Munger", amplificateur: "Churchill", resultat: "L'Empire Resilient" },
  { code: "BCT", role: "CTO", formula: "Gh(Mk·Cu·Vi)STX", primaire: "Musk", calibrateur: "Curie", amplificateur: "Vinci", resultat: "La Science Creative" },
  { code: "BCF", role: "CFO", formula: "Gh(Bu·Mg·Fr)STX", primaire: "Buffett", calibrateur: "Munger", amplificateur: "Franklin", resultat: "Le Coffre-Fort Intelligent" },
  { code: "BCM", role: "CMO", formula: "Gh(Di·Jb·Op)STX", primaire: "Disney", calibrateur: "Jobs/Blakely", amplificateur: "Oprah", resultat: "La Machine a Reves" },
  { code: "BCS", role: "CSO", formula: "Gh(Tz·Th·Cn)STX", primaire: "Sun Tzu", calibrateur: "Thiel", amplificateur: "Chanel", resultat: "L'Echiquier Elegant" },
  { code: "BOO", role: "COO", formula: "Gh(MA·De·Ni)STX", primaire: "Marc Aurele", calibrateur: "Deming", amplificateur: "Nightingale", resultat: "La Forge Stoique" },
];

const REFLECTION_MODES = [
  { num: 1, name: "Debat", desc: "Dialectique + 6 Chapeaux", icon: MessageSquare, color: "text-blue-500" },
  { num: 2, name: "Brainstorm", desc: "Walt Disney + 18 techniques", icon: Lightbulb, color: "text-amber-500" },
  { num: 3, name: "Crise", desc: "OODA Loop", icon: AlertTriangle, color: "text-red-500" },
  { num: 4, name: "Analyse", desc: "5 Pourquoi + Ishikawa", icon: Search, color: "text-violet-500" },
  { num: 5, name: "Decision", desc: "6 Chapeaux + Regret Bezos", icon: Target, color: "text-emerald-500" },
  { num: 6, name: "Strategie", desc: "SWOT vers 3 horizons", icon: Compass, color: "text-indigo-500" },
  { num: 7, name: "Innovation", desc: "Bisociation Koestler", icon: Sparkles, color: "text-pink-500" },
  { num: 8, name: "Deep Resonance", desc: "Spirale Socratique", icon: Eye, color: "text-teal-500" },
];

const RENAMED_TERMS = [
  { old: "BTML", new_term: "GHML", note: "Renommage marque, pas code — sprint dedie en attente (~100 remplacements, 8 fichiers)" },
  { old: "AIAVT", new_term: "VITAA", note: "Meme acronyme, ordre different pour la marque (Vente, Idee, Temps, Argent, Actif)" },
  { old: "BCC (Catherine/CCO)", new_term: "SUPPRIME", note: "Intrus, jamais dans la plateforme — glisse via consolidations" },
  { old: "BPO (Philippe/CPO)", new_term: "SUPPRIME", note: "Intrus, jamais dans la plateforme — glisse via consolidations" },
  { old: "CIO (Isabelle)", new_term: "CINO (Ines)", note: "Renomme Session 42 — cino-ines-standby-v3.png" },
  { old: "6 bots", new_term: "12 bots", note: "Expansion S25: +BFA, BHR, BIO, BRO, BLE, BSE" },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function BibleGHMLPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Atom}
          iconColor="text-violet-600"
          title="Bible GHML"
          subtitle="Ghost Modeling Language — Framework proprietaire"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — GHML en Bref */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">GHML en Bref</h3>

        <Card className="p-5 bg-gradient-to-br from-violet-50 to-white border border-violet-100 shadow-sm mb-3">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-violet-800 italic">"La chimie modelise la matiere. GHML modelise l'intelligence d'affaires."</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">4</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Groupes</div>
              <div className="text-[9px] text-gray-400 mt-0.5">S · P · T · H</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">7</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Periodes</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Fondamental a emergent</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">232</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Elements</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Proprietaires</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">3</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Etats matiere</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Solide · Liquide · Gaz</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Solide (Fondamental)</div>
            <p className="text-[9px] text-gray-500">Elements valides, stables, testes. Le socle sur lequel tout repose.</p>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Liquide (Adaptable)</div>
            <p className="text-[9px] text-gray-500">Elements en transition, hypotheses en validation. Flexibles mais structures.</p>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Gazeux (Emergent)</div>
            <p className="text-[9px] text-gray-500">Intuitions, insights non valides. Le terrain d'exploration et d'innovation.</p>
          </Card>
        </div>

        <Card className="p-3 bg-gray-50 border border-gray-100 mt-3">
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-600">
              <span className="font-bold">Jargon INVISIBLE:</span> L'utilisateur ne voit JAMAIS les termes CREDO, AIAVT, pilier, Tableau Periodique, GHML, phase C/R/E/D/O, Gaz/Liquide/Solide. Ces concepts guident la reflexion INTERNE des Bots.
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — CREDO — Protocole Maitre */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">CREDO — Protocole Maitre</h3>

        {/* 5-phase visual flow */}
        <Card className="p-5 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {CREDO_PHASES.map((phase, i) => (
              <div key={phase.letter} className="flex items-center gap-2">
                <div className="text-center">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg", phase.color)}>
                    {phase.letter}
                  </div>
                  <div className="text-[9px] font-bold text-gray-700 mt-1">{phase.name}</div>
                </div>
                {i < CREDO_PHASES.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Phase details */}
          <div className="space-y-2">
            {CREDO_PHASES.map((phase) => (
              <div key={phase.letter} className={cn("flex items-center gap-3 py-2 px-3 rounded-lg", phase.lightBg)}>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0", phase.color)}>
                  {phase.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("text-xs font-bold", phase.textColor)}>{phase.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{phase.desc}</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-[9px] text-gray-500">
                  <span>Bouche: {phase.bouche}</span>
                  <span>Cerveau: {phase.cerveau}</span>
                  <span>Coeur: {phase.coeur}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-blue-800">3 Couches simultanees</div>
                <div className="text-[9px] text-blue-600 mt-0.5">Bouche (Vente) + Cerveau (Idees) + Coeur (Coaching). Les 3 tournent en parallele a chaque message.</div>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-violet-50 border border-violet-100">
            <div className="flex items-start gap-2">
              <Brain className="h-3.5 w-3.5 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-violet-800">CREDO = protocole MAITRE</div>
                <div className="text-[9px] text-violet-600 mt-0.5">Les modes de reflexion sont des outils DANS CREDO, pas l'inverse. CREDO gouverne tout.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — VITAA / AIAVT — 5 Piliers de Scoring */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">VITAA / AIAVT — 5 Piliers de Scoring</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {VITAA_PILLARS.map((pillar) => (
            <Card key={pillar.name} className={cn("p-3 text-center border", pillar.bg, pillar.border)}>
              <div className={cn("text-2xl font-bold", pillar.color)}>{pillar.letter}</div>
              <div className={cn("text-xs font-bold mt-0.5", pillar.color)}>{pillar.name}</div>
              <div className="text-[9px] text-gray-500 mt-1">{pillar.desc}</div>
              <div className="text-[9px] text-gray-400 mt-0.5 font-mono">0-100</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — Triangle du Feu */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Triangle du Feu</h3>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <Flame className="h-4 w-4 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-red-700">BRULE</div>
              <div className="text-xs font-medium text-red-600 mt-1">3+ piliers actifs</div>
              <p className="text-[9px] text-gray-500 mt-2">L'entreprise est en mouvement. Energie, dynamisme, les fondations supportent la croissance.</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-4 h-4 rounded-full bg-amber-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-amber-700">COUVE</div>
              <div className="text-xs font-medium text-amber-600 mt-1">2 piliers actifs</div>
              <p className="text-[9px] text-gray-500 mt-2">Potentiel present mais stagnation. Le feu existe mais ne prend pas. Intervention ciblee necessaire.</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-4 h-4 rounded-full bg-gray-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-600">MEURT</div>
              <div className="text-xs font-medium text-gray-500 mt-1">0-1 pilier actif</div>
              <p className="text-[9px] text-gray-500 mt-2">Intervention urgente requise. Sans piliers actifs, l'entreprise s'eteint. Plan de relance immediat.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500">Le diagnostic croise les 5 piliers VITAA pour determiner l'etat du feu. Double Diagnostic: Timbre Savoir (competences) + Timbre Valeur (creation de valeur). Calibration Herrmann 4 couleurs integree.</p>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — Trisociation */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Trisociation</h3>

        <Card className="p-4 bg-violet-50 border border-violet-100 mb-3">
          <div className="text-center mb-3">
            <code className="text-sm font-mono font-bold text-violet-800 bg-white px-3 py-1 rounded-lg border border-violet-200">Gh(X·Y·Z)STX</code>
            <p className="text-[9px] text-violet-600 mt-2">3 Ghosts combines par bot: Primaire (OS dominant) + Calibrateur (stabilisateur) + Amplificateur (boost)</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-violet-200">
              <div className="text-xs font-bold text-violet-700">Primaire</div>
              <div className="text-[9px] text-gray-500">OS dominant</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-violet-200">
              <div className="text-xs font-bold text-violet-700">Calibrateur</div>
              <div className="text-[9px] text-gray-500">Stabilisateur</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-violet-200">
              <div className="text-xs font-bold text-violet-700">Amplificateur</div>
              <div className="text-[9px] text-gray-500">Boost contextuel</div>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          {TRISOCIATION_EXAMPLES.map((t) => (
            <div key={t.code} className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg border border-gray-100">
              <Badge variant="outline" className="text-[9px] font-bold min-w-[36px] text-center">{t.code}</Badge>
              <span className="text-xs font-medium text-gray-700 min-w-[30px]">{t.role}</span>
              <code className="text-[9px] font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded">{t.formula}</code>
              <span className="text-[9px] text-gray-500 hidden md:inline">
                {t.primaire} + {t.calibrateur} + {t.amplificateur}
              </span>
              <span className="text-[9px] font-medium text-gray-400 ml-auto italic">{t.resultat}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — Les 12 Ghosts Definitifs (V1.1) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Les 12 Ghosts Definitifs (V1.1)</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {GHOSTS.map((ghost) => (
            <Card key={ghost.id} className="p-3 bg-white border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0", ghost.color)}>
                  {ghost.id}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{ghost.name}</div>
                  <div className="text-[9px] text-gray-400">{ghost.archetype}</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500">{ghost.specialty}</div>
              {ghost.id === "G9" && (
                <Badge variant="outline" className="text-[9px] font-bold text-violet-600 border-violet-300 mt-1.5">CATALYSEUR CONSTANT</Badge>
              )}
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — 8+1 Modes de Reflexion */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">8+1 Modes de Reflexion</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          {REFLECTION_MODES.map((mode) => {
            const MIcon = mode.icon;
            return (
              <div key={mode.num} className="flex items-center gap-3 py-2.5 px-3 bg-white rounded-lg border border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <MIcon className={cn("h-3.5 w-3.5", mode.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-gray-400">{mode.num}.</span>
                    <span className="text-xs font-bold text-gray-700">{mode.name}</span>
                  </div>
                  <div className="text-[9px] text-gray-500">{mode.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <Card className="p-3 bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-800">+1: CREDO (mode integre permanent)</span>
              <span className="text-[9px] text-emerald-600 ml-2">Toujours actif en arriere-plan. Les 8 modes sont des outils utilises a l'interieur du cycle CREDO.</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 8 — Tableau Periodique — Structure */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Tableau Periodique — Structure</h3>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { group: "S", name: "Sectoriel", count: 28, color: "bg-blue-500", desc: "Savoir industriel, secteurs, niches" },
              { group: "P", name: "Patterns", count: 67, color: "bg-emerald-500", desc: "Modeles recurrents, frameworks, pratiques" },
              { group: "T", name: "Technologie", count: 72, color: "bg-violet-500", desc: "Outils, stack, infrastructure, IA" },
              { group: "H", name: "Humain", count: 65, color: "bg-amber-500", desc: "Competences, leadership, culture, RH" },
            ].map((g) => (
              <Card key={g.group} className="p-3 text-center bg-white border border-gray-100">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto", g.color)}>
                  {g.group}
                </div>
                <div className="text-xs font-bold text-gray-700 mt-2">{g.name}</div>
                <div className="text-lg font-bold text-gray-800 mt-0.5">{g.count}</div>
                <div className="text-[9px] text-gray-400">{g.desc}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-bold text-gray-700">7 Periodes</div>
              <p className="text-[9px] text-gray-500 mt-0.5">De fondamental (periode 1) a emergent/breakthrough (periode 7). Comme le tableau periodique de la chimie.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-bold text-gray-700">Total: 232 elements</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Chaque element a: symbole, valence, coefficient, etat de matiere, et interactions avec d'autres elements.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-bold text-gray-700">Usage</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Scoring, matching cognitif bidirectionnel, diagnostic automatique, vecteurs de compatibilite Orbit9.</p>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 9 — Tesla G9 — Catalyseur Constant */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Tesla G9 — Catalyseur Constant</h3>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-amber-800 italic">"Si vous connaissiez la magnificence du 3, 6, 9, vous auriez la cle de l'univers."</p>
            <p className="text-[9px] text-gray-400 mt-1">— Nikola Tesla (G9, Catalyseur Constant)</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">3</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">Energie</div>
              <div className="text-[9px] text-gray-500">3 OS par Trisociation</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">6</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">Frequence</div>
              <div className="text-[9px] text-gray-500">6 Bots C-Level (noyau)</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">9</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">Vibration</div>
              <div className="text-[9px] text-gray-500">G9 Tesla, catalyseur constant</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-600">Amplificateur universel dans toutes les formules Trisociatives: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">Gh(X·Y·Z)STX</code> — le T = Tesla, toujours present</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-600">Nombre d'or (phi = 1.618) sert de seuil de bifurcation: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">TT_Valeur = TT_Input x (1+C_cat) x phi^(n x eta)</code></span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-600">3 modes de depart: STARTUP (3, Energie, 80/20 explore) | SCALEUP (6, Frequence, 38/62) | EXITUP (9, Vibration, 20/80 exploit)</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 10 — Termes qui ont CHANGE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Termes qui ont change (Historique)
          </span>
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left py-2 pr-3 font-medium">Ancien</th>
                  <th className="text-center py-2 px-2 font-medium w-8"></th>
                  <th className="text-left py-2 px-3 font-medium">Nouveau</th>
                  <th className="text-left py-2 pl-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {RENAMED_TERMS.map((term, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-3">
                      <code className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-mono line-through">{term.old}</code>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 inline-block" />
                    </td>
                    <td className="py-2.5 px-3">
                      {term.new_term === "SUPPRIME" ? (
                        <span className="flex items-center gap-1">
                          <X className="h-3.5 w-3.5 text-red-500" />
                          <code className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">SUPPRIME</code>
                        </span>
                      ) : (
                        <code className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">{term.new_term}</code>
                      )}
                    </td>
                    <td className="py-2.5 pl-3 text-[9px] text-gray-500">{term.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-3 bg-amber-50 border border-amber-200 mt-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <span className="font-bold">DETTE TECHNIQUE:</span> Le renommage BTML vers GHML dans le code Python (~100 remplacements, 8 fichiers) est en attente d'un sprint dedie. Les noms de fichiers (btml_primitives.py, bridge_btml_connector.py) NE changent PAS. C'est un changement de MARQUE, pas de CODE.
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </PageLayout>
  );
}
