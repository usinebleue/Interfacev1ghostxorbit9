/**
 * reflexion-tools.tsx — Sprint 2A v2: Outils de réflexion + Techniques interactives
 *
 * Architecture:
 * - ReflexionModeActions: 8 pills mode (Analyse/Débat/Brainstorm/...) — sidebar
 * - TechniqueSidebarList: Compact sidebar list — clic = navigue vers sous-section
 * - TechniquePanel: Vue workspace d'une technique — lancer guidé/solo, session progress
 * - parseContentSections: Détecte items numérotés, split en cards
 *
 * Flux: Sidebar clic → setSelectedTechnique → TechniquePanel dans workspace
 *       TechniquePanel → Lancer → session guidée → résultats cristallisés en blocks
 */

import { useState, useCallback } from "react";
import {
  Eye, Swords, Lightbulb, Target, Sparkles, CheckCircle2, Zap, Brain,
  Search, Crown, ArrowLeftRight, RotateCcw, Leaf, Globe, Shield,
  Play, SkipForward, X as XIcon,
} from "lucide-react";
import { cn } from "../../components/ui/utils";

// ═══ Modes de réflexion — boutons d'ACTION (chaque clic ENVOIE un prompt au bot) ═══

export function ReflexionModeActions({ context, onSend }: {
  context: string;
  onSend: (prompt: string) => void;
}) {
  const MODES = [
    { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-700",
      prompt: `Mode ANALYSE structuree (MECE) sur: ${context}. Faits, forces, contraintes, risques, leviers. Separe faits/hypotheses. Termine par VERDICT.` },
    { id: "debat", label: "Debat", icon: Swords, bg: "bg-red-100", text: "text-red-700",
      prompt: `Mode DEBAT CONTRADICTOIRE sur: ${context}. THESE (pour) → ANTITHESE (tests de falsification, 3+ failles obligatoires) → SYNTHESE. Pas de sycophanterie.` },
    { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-700",
      prompt: `Mode BRAINSTORM DIVERGENT sur: ${context}. 8-12 idees (dont 2+ folles). Analogies inter-industries. Puis TOP 3 (Impact x Faisabilite) avec premier pas 48h.` },
    { id: "strategie", label: "Strategie", icon: Target, bg: "bg-purple-100", text: "text-purple-700",
      prompt: `Mode VISION STRATEGIQUE (12-36 mois) sur: ${context}. Positionnement, moats, sequencage, paris, anti-strategie. Termine par PROCHAINE DECISION CRITIQUE.` },
    { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-700",
      prompt: `Mode INNOVATION RADICALE sur: ${context}. Incremental INTERDIT. Analogies 3 industries, inversion, contrainte extreme, biomimetisme. TOP 2 + prototype 1 semaine.` },
    { id: "decision", label: "Decision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700",
      prompt: `Mode AIDE A LA DECISION sur: ${context}. Reformule en choix, 4-5 criteres ponderes, matrice, trade-offs nommes. UNE recommandation. Tu DOIS trancher.` },
    { id: "crise", label: "Crise", icon: Zap, bg: "bg-orange-100", text: "text-orange-700",
      prompt: `Mode CRISE (72h) sur: ${context}. TRIAGE (0-4h) → CONTAINMENT (4-24h) → RESOLUTION (24-72h) → POST-MORTEM. QUI fait QUOI pour QUAND. Pragmatisme absolu.` },
    { id: "deep", label: "Deep", icon: Brain, bg: "bg-indigo-100", text: "text-indigo-700",
      prompt: `Mode REFLEXION SYSTEMIQUE sur: ${context}. Surface → Structure → Mental → Effets 2e/3e ordre → Points de levier. Boucles de retroaction, paradoxes. Termine par INSIGHT CLE non-evident.` },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {MODES.map(m => (
        <button key={m.id} onClick={() => onSend(m.prompt)}
          className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border cursor-pointer transition-colors hover:shadow-sm",
            m.bg, m.text, "border-current/30"
          )}>
          <m.icon className="h-3 w-3" />
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ═══ Technique Session State ═══

interface TechniqueSession {
  technique: string;
  currentStep: number;
  totalSteps: number;
  accumulatedContext: string;
  mode: "guided" | "solo";
}

export const TECHNIQUE_CONFIGS: Record<string, { label: string; totalSteps: number; stepLabels: string[]; colors: string[]; description: string }> = {
  scamper: {
    label: "SCAMPER",
    totalSteps: 7,
    stepLabels: ["S", "C", "A", "M", "P", "E", "R"],
    colors: ["bg-pink-50 text-pink-700", "bg-blue-50 text-blue-700", "bg-violet-50 text-violet-700", "bg-amber-50 text-amber-700", "bg-emerald-50 text-emerald-700", "bg-red-50 text-red-700", "bg-indigo-50 text-indigo-700"],
    description: "7 leviers créatifs: Substituer, Combiner, Adapter, Modifier, Proposer d'autres usages, Éliminer, Réorganiser. Chaque lettre est une étape guidée.",
  },
  "5pourquoi": {
    label: "5 Pourquoi",
    totalSteps: 5,
    stepLabels: ["P1", "P2", "P3", "P4", "P5"],
    colors: ["bg-orange-50 text-orange-700", "bg-orange-100 text-orange-800", "bg-amber-100 text-amber-800", "bg-red-50 text-red-700", "bg-red-100 text-red-800"],
    description: "Creuser les causes racines en 5 niveaux de profondeur. Chaque Pourquoi est basé sur la réponse précédente.",
  },
  "6chapeaux": {
    label: "6 Chapeaux",
    totalSteps: 6,
    stepLabels: ["⚪", "🔴", "⚫", "🟡", "🟢", "🔵"],
    colors: ["bg-gray-50 text-gray-700", "bg-red-50 text-red-700", "bg-gray-100 text-gray-800", "bg-yellow-50 text-yellow-700", "bg-green-50 text-green-700", "bg-blue-50 text-blue-700"],
    description: "6 perspectives de Bono: Faits, Émotions, Risques, Opportunités, Créativité, Processus. Un chapeau à la fois.",
  },
};

// All techniques (multi-step + one-shot) — anti-sycophancy aligned
export const ALL_TECHNIQUES = [
  { id: "scamper", label: "SCAMPER", icon: Lightbulb,
    color: "bg-amber-50 text-amber-700",
    soloPrompt: (ctx: string) => `Applique SCAMPER complet a: ${ctx}

Pour chaque lettre (Substituer, Combiner, Adapter, Modifier, Proposer d'autres usages, Eliminer, Reorganiser):
- 2-3 idees CONCRETES et SPECIFIQUES (pas de generalites)
- Au moins 1 idee "audacieuse" par lettre

REGLES:
- Interdit les idees evidentes que n'importe qui aurait
- Si une idee est trop generique, pousse plus loin
- Pas de "c'est une bonne idee" — genere directement

Termine par un Top 3 classe par (Impact x Faisabilite) avec 1 premier pas concret pour tester en 48h.` },
  { id: "5pourquoi", label: "5 Pourquoi", icon: Search,
    color: "bg-orange-50 text-orange-700",
    soloPrompt: (ctx: string) => `Analyse les 5 Pourquoi en profondeur pour: ${ctx}

PROTOCOLE:
- Chaque "Pourquoi" creuse SPECIFIQUEMENT la reponse precedente (pas de saut logique)
- Distingue les FAITS des SUPPOSITIONS a chaque niveau
- Niveau 4-5: cherche les causes SYSTEMIQUES (culture, incitations, structure)

REGLES:
- Si tu ne peux pas creuser plus profond avec certitude, DIS-LE au lieu d'inventer
- La cause racine doit etre ACTIONNABLE (pas "c'est la nature humaine")
- Pas de langue de bois

Termine par: CAUSE RACINE (1 phrase) + 3 ACTIONS correctives priorisees.` },
  { id: "6chapeaux", label: "6 Chapeaux", icon: Crown,
    color: "bg-violet-50 text-violet-700",
    soloPrompt: (ctx: string) => `Analyse avec les 6 Chapeaux de Bono pour: ${ctx}

Un chapeau a la fois, dans cet ordre:
- BLANC (Faits): Donnees objectives UNIQUEMENT. Pas d'interpretation.
- ROUGE (Emotions): Reactions instinctives, peurs, enthousiasmes. Sans justification.
- NOIR (Risques): Critique HONNETE. Pourquoi ca peut echouer? Cherche 3+ failles.
- JAUNE (Opportunites): Avantages concrets. Pas de voeux pieux.
- VERT (Creativite): Alternatives non-evidentes. Pousse hors du cadre connu.
- BLEU (Processus): Meta-analyse. Qu'est-ce que les 5 chapeaux revelent ensemble?

REGLES:
- Le chapeau NOIR doit etre AUSSI approfondi que le JAUNE (pas d'asymetrie complaisante)
- Chaque chapeau: 3-4 points max, concis

Termine par SYNTHESE: Top 3 conclusions + 1 decision recommandee.` },
  { id: "analogie", label: "Analogie", icon: ArrowLeftRight,
    color: "bg-blue-50 text-blue-700",
    soloPrompt: (ctx: string) => `Trouve des analogies de 3 industries TOTALEMENT differentes pour: ${ctx}

Pour chaque analogie:
1. L'industrie source et le probleme SIMILAIRE qu'ils ont resolu
2. COMMENT ils l'ont resolu (mecanisme concret)
3. La transposition: comment appliquer CE mecanisme a notre contexte

REGLES:
- Industries qui n'ont RIEN a voir avec le sujet (jeux video, aviation, restauration, sport, nature)
- Pas d'analogies evidentes ou deja connues dans le secteur
- Chaque transposition doit etre ACTIONNABLE, pas juste intellectuellement interessante

Termine par: MEILLEURE ANALOGIE a explorer en premier + pourquoi.` },
  { id: "inversion", label: "Inversion", icon: RotateCcw,
    color: "bg-pink-50 text-pink-700",
    soloPrompt: (ctx: string) => `Inverse completement le probleme pour: ${ctx}

PROTOCOLE D'INVERSION:
1. ANTI-OBJECTIF: "Comment GARANTIR l'echec?" — liste 5-8 facons sures d'echouer
2. MIROIR: Pour chaque facon d'echouer, inverse en strategie de succes
3. REVELATION: Quelles strategies de succes sont CONTRE-INTUITIVES? Lesquelles fait-on deja SANS le savoir?
4. HYPOTHESES CACHEES: En inversant, quelles croyances implicites sont revelees?

REGLES:
- Sois CREATIVE dans les facons d'echouer (pas juste "ne rien faire")
- Les inversions les plus utiles sont celles qui revelent des angles morts
- Pas de platitudes

Termine par: 2-3 ACTIONS concretes revelees par l'inversion.` },
  { id: "biomimetisme", label: "Biomimetisme", icon: Leaf,
    color: "bg-emerald-50 text-emerald-700",
    soloPrompt: (ctx: string) => `Applique le biomimetisme a: ${ctx}

PROTOCOLE:
Identifie 4 systemes naturels qui resolvent un probleme ANALOGUE:
1. Un systeme de CROISSANCE (mycelium, corail, foret)
2. Un systeme de RESILIENCE (systeme immunitaire, regeneration)
3. Un systeme d'ORGANISATION (fourmiliere, banc de poissons, essaim)
4. Un systeme d'EFFICACITE (photosynthese, symbiose, migration)

Pour chaque:
- Le probleme que la nature resout
- Le MECANISME precis (pas de metaphore vague)
- La transposition concrete dans notre contexte
- Faisabilite reelle (pas de science-fiction)

REGLES:
- Mecanismes PRECIS, pas des metaphores ("comme la nature" = trop vague)
- Chaque transposition doit pouvoir etre prototypee

Termine par: TOP 2 biomimetismes + prototype proposee en 1 semaine.` },
  { id: "deepsearch", label: "Deep Search", icon: Globe,
    color: "bg-cyan-50 text-cyan-700",
    soloPrompt: (ctx: string) => `Recherche approfondie sur: ${ctx}

PROTOCOLE:
1. TENDANCES — 3-5 tendances majeures dans ce domaine (avec signaux observables)
2. BENCHMARKS — Qui fait ca BIEN? Resultats chiffres si possible.
3. MEILLEURES PRATIQUES — Ce que les leaders font differemment (pas les evidences)
4. CONTRE-EXEMPLES — Qui a ECHOUE en essayant? Pourquoi? (survivorship bias check)
5. DONNEES CLES — Chiffres, etudes, metriques qui cadrent la reflexion

REGLES:
- Distingue les FAITS verifies des HYPOTHESES populaires
- Si tu n'es pas sur d'un chiffre, DIS-LE. Pas d'invention.
- Cherche les contre-exemples AUTANT que les succes
- Pas de langue de bois ni de "c'est un marche en pleine croissance" sans chiffres

FORMAT: Sections numerotees avec source/fiabilite pour chaque affirmation cle.` },
  { id: "challenge", label: "Challenge", icon: Shield,
    color: "bg-red-50 text-red-700",
    soloPrompt: (ctx: string) => `Challenge cette approche — trouve les failles: ${ctx}

PROTOCOLE DE FALSIFICATION:
1. HYPOTHESES CACHEES — Liste les 3-5 suppositions NON VERIFIEES dans cette approche
2. TESTS DE FALSIFICATION — Pour chaque hypothese: "Que faudrait-il observer pour PROUVER que c'est FAUX?"
3. BIAIS COGNITIFS — Quels biais sont probablement en jeu? (survivorship, confirmation, sunk cost, anchor...)
4. SCENARII D'ECHEC — Les 3 facons les plus PROBABLES que ca echoue (pas les plus dramatiques)
5. CONDITIONS DE SUCCES — Quelles conditions DOIVENT etre vraies pour que ca marche?

REGLES ANTI-SYCOPHANTERIE:
- Tu n'es PAS la pour confirmer. Tu es la pour CASSER l'argument.
- Si l'idee est mauvaise, DIS-LE clairement.
- Force-toi a trouver AU MOINS 3 failles SERIEUSES meme si l'idee semble bonne.
- Pas de "c'est une bonne idee MAIS..." — va droit aux failles.

FORMAT: 5 sections. Termine par VERDICT: Go/No-Go/Conditionnel + les 2 risques a eliminer EN PREMIER.` },
];

// ═══ TechniqueSidebarList — compact sidebar items ═══

export function TechniqueSidebarList({ selectedId, onSelect }: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="space-y-0.5">
      {ALL_TECHNIQUES.map(t => {
        const isSelected = selectedId === t.id;
        const hasSteps = !!TECHNIQUE_CONFIGS[t.id];
        return (
          <button
            key={t.id}
            onClick={() => onSelect(isSelected ? null : t.id)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              isSelected
                ? "bg-orange-50 border border-orange-200 shadow-sm"
                : "hover:bg-gray-50 border border-transparent"
            )}
          >
            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", isSelected ? "bg-orange-100" : "bg-gray-100")}>
              <t.icon className={cn("h-3 w-3", isSelected ? "text-orange-600" : "text-gray-500")} />
            </div>
            <span className={cn("text-[10px] font-bold truncate", isSelected ? "text-orange-700" : "text-gray-700")}>{t.label}</span>
            {hasSteps && (
              <span className="ml-auto text-[8px] text-gray-400 shrink-0">{TECHNIQUE_CONFIGS[t.id].totalSteps}×</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ═══ TechniquePanel — workspace panel for selected technique ═══

export function TechniquePanel({ techniqueId, context, onSend, onSendWithMeta, onClose }: {
  techniqueId: string;
  context: string;
  onSend: (prompt: string) => void;
  onSendWithMeta?: (prompt: string, meta: { techniqueActive: string; techniqueStep: number; techniqueContext: string }) => void;
  onClose: () => void;
}) {
  const [session, setSession] = useState<TechniqueSession | null>(null);
  const tech = ALL_TECHNIQUES.find(t => t.id === techniqueId);
  const config = TECHNIQUE_CONFIGS[techniqueId];

  const startSession = useCallback((mode: "guided" | "solo") => {
    if (mode === "solo" || !config) {
      if (tech) onSend(tech.soloPrompt(context));
      return;
    }
    // Start guided session
    const newSession: TechniqueSession = {
      technique: techniqueId,
      currentStep: 0,
      totalSteps: config.totalSteps,
      accumulatedContext: "",
      mode: "guided",
    };
    setSession(newSession);
    const msg = `Lance l'atelier ${config.label} guidé sur: ${context}`;
    if (onSendWithMeta) {
      onSendWithMeta(msg, { techniqueActive: techniqueId, techniqueStep: 0, techniqueContext: "" });
    } else {
      onSend(msg);
    }
  }, [techniqueId, context, config, tech, onSend, onSendWithMeta]);

  const advanceStep = useCallback(() => {
    if (!session || !config) return;
    const nextStep = session.currentStep + 1;
    if (nextStep >= config.totalSteps) {
      setSession(null);
      return;
    }
    const updated = {
      ...session,
      currentStep: nextStep,
      accumulatedContext: session.accumulatedContext + `\nÉtape ${session.currentStep + 1} complétée.`,
    };
    setSession(updated);
    const msg = `Continue l'atelier ${config.label} — passe à l'étape ${nextStep + 1}/${config.totalSteps}: ${config.stepLabels[nextStep]}`;
    if (onSendWithMeta) {
      onSendWithMeta(msg, { techniqueActive: session.technique, techniqueStep: nextStep, techniqueContext: updated.accumulatedContext });
    } else {
      onSend(msg);
    }
  }, [session, config, onSend, onSendWithMeta]);

  if (!tech) return null;

  // ═══ Active Session View ═══
  if (session && config) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-orange-700">
            Atelier {config.label} en cours
          </h4>
          <button onClick={() => { setSession(null); onClose(); }} className="p-1 rounded-md hover:bg-orange-100 cursor-pointer transition-colors">
            <XIcon className="h-3 w-3 text-orange-500" />
          </button>
        </div>

        {/* Pipeline visual — progress dots */}
        <div className="flex items-center gap-1">
          {config.stepLabels.map((label, i) => {
            const isComplete = i < session.currentStep;
            const isActive = i === session.currentStep;
            return (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                  isComplete ? "bg-emerald-100 text-emerald-700" :
                  isActive ? cn(config.colors[i], "ring-2 ring-orange-300") :
                  "bg-gray-100 text-gray-400"
                )}>
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : label}
                </div>
                {i < config.stepLabels.length - 1 && (
                  <div className={cn("w-3 h-0.5 mx-0.5", isComplete ? "bg-emerald-400" : "bg-gray-200")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Advance / Complete */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-orange-600 font-medium flex-1">
            Étape {session.currentStep + 1}/{config.totalSteps} — {config.stepLabels[session.currentStep]}
          </span>
          {session.currentStep < config.totalSteps - 1 ? (
            <button onClick={advanceStep}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 cursor-pointer transition-colors">
              <SkipForward className="h-3 w-3" /> Suivante: {config.stepLabels[session.currentStep + 1]}
            </button>
          ) : (
            <button onClick={() => { advanceStep(); onClose(); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 cursor-pointer transition-colors">
              <CheckCircle2 className="h-3 w-3" /> Terminer
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══ Technique Detail Panel — launch options ═══
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tech.color)}>
            <tech.icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-gray-900">{tech.label}</h4>
            {config && <span className="text-[9px] text-gray-400">{config.totalSteps} étapes guidées</span>}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
          <XIcon className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      {config && <p className="text-[10px] text-gray-500 leading-relaxed">{config.description}</p>}

      <div className="flex gap-2">
        {config && (
          <button onClick={() => startSession("guided")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 cursor-pointer transition-colors">
            <Play className="h-3 w-3" /> Lancer l'atelier guidé
          </button>
        )}
        <button onClick={() => startSession("solo")}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-colors border",
            config ? "flex-1 border-gray-200 text-gray-700 hover:bg-gray-50" : "flex-1 bg-orange-500 text-white font-bold hover:bg-orange-600 border-orange-500"
          )}>
          <Zap className="h-3 w-3" /> {config ? "L'agent fait seul" : "Lancer"}
        </button>
      </div>
    </div>
  );
}

// ═══ Legacy TechniqueSelector — backward compat wrapper ═══
export function TechniqueSelector({ context, onSend, onSendWithMeta, sidebarMode }: {
  context: string;
  onSend: (prompt: string) => void;
  onSendWithMeta?: (prompt: string, meta: { techniqueActive: string; techniqueStep: number; techniqueContext: string }) => void;
  sidebarMode?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (sidebarMode) {
    return <TechniqueSidebarList selectedId={selectedId} onSelect={setSelectedId} />;
  }

  return selectedId ? (
    <TechniquePanel techniqueId={selectedId} context={context} onSend={onSend} onSendWithMeta={onSendWithMeta} onClose={() => setSelectedId(null)} />
  ) : null;
}

// ═══ Parser le contenu en sections individuelles (concepts numérotés, items à puces) ═══

export function parseContentSections(text: string): { title: string; body: string }[] {
  const lines = text.split('\n');
  const sections: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;

  for (const line of lines) {
    const isSection = /^\s*\d+[\.\)]\s+/.test(line) || /^\s*[🎬🎤🧩💡🔍⚡📊🎯✅❌🟢🔴🧠⚙️🏭📈🔥⭐🚀]\s+/.test(line);
    if (isSection) {
      if (current) sections.push(current);
      current = { title: line.trim(), body: '' };
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    } else {
      if (!sections.length) {
        current = { title: '', body: line };
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

// ═══ IDs des outils réflexion dans la sidebar ═══

export const REFLEXION_TOOL_IDS = [
  { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-600",
    prompt: (ctx: string) => `Tu es en mode DIAGNOSTIC STRUCTURÉ.

SUJET: ${ctx}

CADRE D'ANALYSE (MECE — Mutuellement Exclusif, Collectivement Exhaustif):
1. SITUATION ACTUELLE — Faits observables uniquement. Pas d'interprétation.
2. FORCES EN PRÉSENCE — Qui/quoi pousse dans quelle direction? Cartographie des tensions.
3. CONTRAINTES RÉELLES — Budget, temps, compétences, marché. Chiffres si disponibles.
4. RISQUES CRITIQUES — Le pire scénario réaliste. Probabilité + impact.
5. LEVIERS D'ACTION — Ce qui est sous contrôle direct vs ce qui ne l'est pas.

RÈGLES:
- Sépare les FAITS des HYPOTHÈSES. Étiquette clairement chaque affirmation.
- Identifie AU MINIMUM 1 angle mort que l'utilisateur n'a probablement pas considéré.
- Si une donnée te manque pour conclure, DIS-LE au lieu d'inventer.
- Pas de langue de bois. Sois direct même si le constat est inconfortable.

FORMAT: Réponds en sections numérotées. Maximum 400 mots par section. Termine par "VERDICT" en 2-3 phrases.` },

  { id: "debat", label: "Debat", icon: Swords, bg: "bg-red-100", text: "text-red-600",
    prompt: (ctx: string) => `Tu es en mode DÉBAT CONTRADICTOIRE (Faiseur-Vérificateur).

SUJET: ${ctx}

PROTOCOLE:
Tu dois SIMULTANÉMENT construire ET détruire l'argument. Structure en 2 colonnes mentales:

THÈSE (Pour):
- Construis le meilleur argument possible EN FAVEUR de cette approche/idée.
- Appuie avec des exemples concrets, des précédents, de la logique.

ANTITHÈSE (Contre — Tests de falsification):
- Pour CHAQUE argument de la thèse, applique un test de falsification:
  "Que faudrait-il observer pour PROUVER que cet argument est FAUX?"
- Cherche les hypothèses cachées non vérifiées.
- Identifie les biais cognitifs en jeu (survivorship, confirmation, sunk cost...).

SYNTHÈSE:
- Où se situe la vérité ENTRE les deux positions?
- Quelles conditions rendraient la Thèse vraie? Et l'Antithèse?

RÈGLES ANTI-SYCOPHANTERIE:
- Tu n'es PAS là pour confirmer ce que l'utilisateur pense déjà.
- Si l'idée est mauvaise, DIS-LE clairement avec tes raisons.
- Force-toi à trouver AU MOINS 3 failles sérieuses même si l'idée semble bonne.
- Pas de "c'est une bonne question" ou "excellente idée" — va droit au débat.

FORMAT: THÈSE (3-4 arguments) → ANTITHÈSE (3-4 contre-arguments avec tests de falsification) → SYNTHÈSE (verdict nuancé + conditions de succès/échec).` },

  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-600",
    prompt: (ctx: string) => `Tu es en mode BRAINSTORM DIVERGENT.

SUJET: ${ctx}

PROTOCOLE DE GÉNÉRATION:
Phase 1 — WILD IDEAS (pas de filtre, pas de censure):
- Génère 8-12 idées en vrac. Inclus AU MOINS 2 idées "folles" qui semblent irréalisables.
- Utilise les leviers SCAMPER implicitement: Substituer, Combiner, Adapter, Modifier, Proposer un autre usage, Éliminer, Réorganiser.
- Pioche dans des analogies d'AUTRES industries (restauration, jeux vidéo, aviation, sport, nature...).

Phase 2 — REGROUPEMENT:
- Regroupe tes idées en 3-4 familles thématiques. Nomme chaque famille.

Phase 3 — TOP 3 PRIORISÉ:
- Classe tes 3 meilleures idées par (Impact × Faisabilité).
- Pour chaque Top 3: 1 phrase d'idée + 1 "premier pas concret pour tester en 48h".

RÈGLES:
- QUANTITÉ d'abord, qualité ensuite. Ne te censure pas en Phase 1.
- Interdiction de proposer des idées "évidentes" que n'importe qui aurait.
- Chaque idée doit tenir en 1-2 phrases max. Pas de pavés.
- Si tu te retrouves à écrire des idées génériques (type "améliorer le marketing"), STOP et pousse plus loin.

FORMAT: Liste numérotée Phase 1 → Familles Phase 2 → Top 3 avec premier pas.` },

  { id: "strategie", label: "Strategie", icon: Target, bg: "bg-purple-100", text: "text-purple-600",
    prompt: (ctx: string) => `Tu es en mode VISION STRATÉGIQUE (horizon 12-36 mois).

SUJET: ${ctx}

CADRE STRATÉGIQUE:
1. POSITIONNEMENT CIBLE — Où voulons-nous être dans 18 mois? Description précise de l'état futur désiré.
2. AVANTAGES COMPÉTITIFS — Quels "moats" (fossés défensifs) construire? Qu'est-ce qui sera DIFFICILE à copier?
3. SÉQUENÇAGE — Dans quel ORDRE faire les choses? Qu'est-ce qui débloque quoi?
4. PARIS STRATÉGIQUES — Quelles hypothèses non prouvées sont au coeur du plan? (Les nommer explicitement)
5. ANTI-STRATÉGIE — Que devons-nous REFUSER de faire? Les tentations à éviter.

RÈGLES:
- Pense en SYSTÈMES, pas en actions isolées. Chaque mouvement a des effets de 2e et 3e ordre.
- Distingue les décisions RÉVERSIBLES (test vite) des IRRÉVERSIBLES (réfléchis plus).
- Pas de voeux pieux. Chaque objectif doit avoir un mécanisme concret pour l'atteindre.
- Si la stratégie fonctionne pour N'IMPORTE QUELLE entreprise, elle n'est pas assez spécifique.

FORMAT: 5 sections numérotées. Termine par "PROCHAINE DÉCISION CRITIQUE" — la seule chose à trancher maintenant.` },

  { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-600",
    prompt: (ctx: string) => `Tu es en mode INNOVATION RADICALE (adjacent + transformationnel uniquement).

SUJET: ${ctx}

CONTRAINTE: Les idées INCRÉMENTALES sont INTERDITES. "Faire pareil mais un peu mieux" = rejeté.

PROTOCOLE:
1. ANALOGIES INTER-INDUSTRIES — Prends 3 industries TOTALEMENT différentes (ex: jeux vidéo, santé, aviation). Comment ont-ils résolu un problème SIMILAIRE? Transpose.
2. INVERSION — Et si on faisait EXACTEMENT L'INVERSE de ce qui se fait? Que se passerait-il?
3. CONTRAINTE EXTRÊME — Et si on avait 10× MOINS de budget? Ou 10× PLUS de clients? Qu'est-ce que ça forcerait à inventer?
4. BIOMIMÉTISME — Quel système naturel (fourmilière, mycelium, banc de poissons, système immunitaire) résout un problème analogue? Comment le transposer?
5. PREMIÈRE ÉTAPE — Pour chaque idée retenue: quel prototype en 1 semaine pour VALIDER l'hypothèse?

RÈGLES:
- Si ton idée existe déjà quelque part, elle n'est pas assez innovante. Pousse plus loin.
- Pas de buzzwords (IA, blockchain, Web3) sans mécanisme CONCRET derrière.
- Accepte que 80% des idées ici seront mauvaises. Le but est de trouver les 20% transformationnels.

FORMAT: 4 sections (Analogies, Inversion, Contrainte, Biomimétisme) avec 2-3 pistes chaque. Puis TOP 2 avec prototype proposé.` },

  { id: "decision", label: "Decision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-600",
    prompt: (ctx: string) => `Tu es en mode AIDE À LA DÉCISION (trancher avec méthode).

SUJET: ${ctx}

PROTOCOLE DÉCISIONNEL:
1. REFORMULATION — Reformule la décision en question binaire ou en choix entre 2-3 options explicites.
2. CRITÈRES — Liste les 4-5 critères qui COMPTENT VRAIMENT (pas 15 critères dilués). Pondère-les.
3. MATRICE — Évalue chaque option contre chaque critère (fort/moyen/faible).
4. TRADE-OFFS — Nomme EXPLICITEMENT ce qu'on PERD avec chaque option. Pas de "tout est possible".
5. RECOMMANDATION — Une seule. Claire. Avec la raison principale en 1 phrase.
6. RÉVERSIBILITÉ — Est-ce réversible? Si oui: décide vite, ajuste après. Si non: quel test AVANT de s'engager?

RÈGLES:
- Tu DOIS trancher. "Ça dépend" n'est pas une réponse acceptable.
- Si l'information manque pour décider, identifie QUELLE information il faut aller chercher et COMMENT.
- Pas de recommandation tiède du type "les deux options ont du mérite". Prends position.
- Déclare ton niveau de confiance: Haute (>80%), Moyenne (50-80%), ou Basse (<50%).

FORMAT: 6 sections numérotées. La recommandation finale doit tenir en 1 phrase assertive.` },

  { id: "crise", label: "Crise", icon: Zap, bg: "bg-orange-100", text: "text-orange-600",
    prompt: (ctx: string) => `Tu es en mode GESTION DE CRISE (72h — actions immédiates).

SUJET: ${ctx}

PROTOCOLE D'URGENCE:
1. TRIAGE (0-4h) — Qu'est-ce qui BRÛLE maintenant? Sépare l'urgent de l'important. Identifie les 2-3 actions qui STOPPENT l'hémorragie immédiatement.
2. CONTAINMENT (4-24h) — Que faire pour EMPÊCHER que ça empire? Communication, isolation du problème, plan B activé.
3. RÉSOLUTION (24-72h) — Plan d'action séquencé. Qui fait quoi, dans quel ordre, avec quelles ressources DISPONIBLES (pas idéales, disponibles).
4. POST-MORTEM — Quand la crise sera passée: quelle SEULE chose mettre en place pour que ça ne se reproduise PAS?

RÈGLES:
- Mode PRAGMATISME ABSOLU. Pas de solution parfaite, juste la moins mauvaise option MAINTENANT.
- Chaque action doit avoir un RESPONSABLE et un DÉLAI. Pas de "il faudrait" — "QUI fait QUOI pour QUAND".
- Ignore les considérations long-terme. On survit d'abord, on optimise après.
- Si la crise n'est PAS réelle (juste du stress), dis-le. Pas tout est une crise.

FORMAT: 4 sections avec actions CONCRÈTES. Chaque action = verbe d'action + responsable + deadline.` },

  { id: "deep", label: "Deep", icon: Brain, bg: "bg-indigo-100", text: "text-indigo-600",
    prompt: (ctx: string) => `Tu es en mode RÉFLEXION SYSTÉMIQUE (pensée multi-niveaux).

SUJET: ${ctx}

CADRE DE PENSÉE EN PROFONDEUR:
1. NIVEAU SURFACE — Ce qui est visible et évident. Les symptômes.
2. NIVEAU STRUCTURE — Les systèmes, processus et incitations qui PRODUISENT ces symptômes. Pourquoi le problème existe-t-il structurellement?
3. NIVEAU MENTAL — Les croyances, modèles mentaux et paradigmes qui maintiennent la structure en place. Qu'est-ce qu'on tient pour acquis sans le questionner?
4. EFFETS DE 2e ET 3e ORDRE — Si on agit au niveau surface: quels effets en cascade? Si on agit au niveau structure: quoi d'autre est affecté?
5. POINTS DE LEVIER — Où intervenir pour un maximum d'effet avec un minimum d'effort? (Les points de levier sont souvent contre-intuitifs.)

RÈGLES:
- Ne reste PAS au niveau surface. L'analyse évidente n'a aucune valeur. Creuse.
- Cherche les BOUCLES DE RÉTROACTION: qu'est-ce qui s'auto-renforce? Qu'est-ce qui s'auto-corrige?
- Identifie les PARADOXES: où deux vérités apparemment contradictoires coexistent?
- Si tu écris quelque chose que tout le monde sait déjà, SUPPRIME-LE et va plus profond.

FORMAT: 5 niveaux progressifs. Chaque niveau ajoute une couche de profondeur. Termine par "INSIGHT CLÉ" — la chose non-évidente la plus importante.` },
] as const;
