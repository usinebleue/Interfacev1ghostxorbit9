/**
 * CarlOSPresence.tsx — Bulle d'accueil du bot dans chaque section du canevas
 * Le bot ÉCRIT EN PREMIER pour présenter la section — avant que l'utilisateur parle.
 * Sections générales → CarlOS (CEOB)
 * Départements (CTOB, CFOB, etc.) → chaque bot présente sa propre section
 * Sprint B/C — CarlOS Noyau Omnipresent (D-081)
 */

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TypewriterText } from "./shared/simulation-components";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";
import { useFrameMaster } from "../../context/FrameMasterContext";

/** Messages par vue — voix directe du bot */
const VIEW_MESSAGES: Record<string, string> = {
  dashboard:       "Voici votre tableau de bord. Chaque bloc est un point d'intérêt — cliquez sur n'importe lequel et on l'explore ensemble.",
  cockpit:         "Cockpit CarlOS en ligne. Vos indicateurs clés sont consolidés ici. Cliquez sur un KPI pour qu'on creuse ensemble.",
  health:          "Je surveille la santé de votre organisation en continu. Voici un portrait transversal de vos 5 dimensions stratégiques.",
  "diagnostic-hub": "Le Diagnostic Hub est votre GPS d'entreprise. Vue d'ensemble de votre santé, diagnostics détaillés et plans d'action — tout est ici.",
  scenarios:       "Studio de simulation actif. Décrivez-moi votre hypothèse — je m'occupe de la modéliser avec l'équipe.",
  canvas:          "Canevas stratégique ouvert. Demandez-moi d'afficher ce que vous voulez — je gère le contenu en temps réel.",
  cahier:          "Voici votre cahier stratégique. Vos idées cristallisées, prêtes à passer à l'action.",
  "agent-settings":"Configuration de votre Bot Team. Personnalisez le comportement de vos agents.",
  "board-room":    "Board Room en session. Vos C-Level sont réunis. Proposez un sujet — je lance le débat et je coordonne les interventions.",
  "war-room":      "War Room activée. Cellule de crise prête. Décrivez la situation — je mobilise l'équipe d'urgence et on passe en mode COMMAND.",
  "think-room":    "Think Room ouverte. De la vision au Go/No-Go en 6 étapes. Partagez votre idée — je mobilise les spécialistes pour la structurer.",
  "mes-chantiers": "Voici votre pipeline complet: Discussions, Missions, Projets, Chantiers. Je garde un oeil sur tout — rien ne traine sans verdict.",
  blueprint:       "Blueprint unifie — votre vue complete: chantiers, projets, missions, taches, documents, playbooks et diagnostics. Cliquez sur un element pour qu'on travaille dessus ensemble.",
  "meeting-room":  "Conférence AI — choisissez votre type de rencontre. Podcast, board meeting, brainstorm, diagnostic — je m'adapte automatiquement au contexte avec le bon playbook.",
};

/** Messages sous-sections Orbit9 (Mon Réseau + Mon Industrie) */
const ORBIT9_MESSAGES: Record<string, string> = {
  marketplace:     "Bienvenue dans le Marketplace. Explorez les membres du réseau — cliquez sur un profil pour qu'on analyse la compatibilité ensemble.",
  cellules:        "Cellules Orbit9 — vos groupes de collaboration. Dites-moi quel type de cellule vous voulez créer et je m'occupe de qualifier les critères.",
  jumelage:        "Jumelage Orbit9 — on va trouver vos meilleurs partenaires. Décrivez-moi ce que vous cherchez et je lance le processus de matching. Je m'occupe de tout.",
  gouvernance:     "Protocoles de gouvernance du réseau. Consultez les règles de collaboration — je clarifie ce que vous voulez.",
  pionniers:       "Les pionniers du réseau Orbit9. Voici les membres fondateurs qui bâtissent l'écosystème.",
  nouvelles:       "Nouvelles de votre industrie. Je surveille les signaux pour vous — cliquez sur une nouvelle pour qu'on analyse l'impact ensemble.",
  evenements:      "Événements à venir dans votre secteur. Dites-moi lesquels vous intéressent — je peux les ajouter à votre agenda.",
  "trg-industrie": "Dashboard industrie — vos benchmarks sectoriels. Cliquez sur un indicateur pour qu'on compare votre performance.",
  "page-type":     "Profil d'un membre du réseau. Voici ses données — on analyse la compatibilité?",
};

/** Messages sous-sections Ressources */
const BUREAU_MESSAGES: Record<string, string> = {
  idees:     "Vos idées capturées. Vous avez une nouvelle idée? Dites-la moi — je la cristallise et je la classe. Chaque idée peut être rattachée à un projet ou un chantier.",
  documents: "Vos documents. Cliquez sur un document pour qu'on le révise ensemble.",
  outils:    "Vos outils connectés. Tout est centralisé ici.",
  taches:    "Vos tâches actives. Cliquez sur une tâche pour qu'on avance dessus ensemble.",
  agenda:    "Votre agenda. Dites-moi si vous voulez planifier quelque chose — je coordonne.",
  templates: "Vos templates de documents. Générez un document en un clic — je remplis les champs avec les données de votre entreprise.",
};

/** Messages sous-sections Strategique */
const STRATEGIQUE_MESSAGES: Record<string, string> = {
  live:     "Plan Strategique — construisons votre plan d'affaires ensemble. Dites-moi par quelle section commencer et je guide le processus avec les bots spécialistes.",
  hub:      "Hub de contenu — vos templates et documents générés. Cliquez sur un élément pour qu'on l'explore.",
  pipeline: "Pipeline d'exécution — vos étapes de réalisation. Dites-moi quelle étape vous voulez lancer.",
};

/** Message première visite — accueil enrichi */
const FIRST_VISIT_MSG = "Bienvenue dans CarlOS! Chaque bloc que vous voyez est un point d'intérêt. "
  + "Cliquez sur n'importe lequel — je vais inviter le bot spécialiste pour qu'on l'explore ensemble. "
  + "Vous n'êtes jamais seul, je reste avec vous tout au long.";

/** Messages d'accueil par bot pour leurs départements */
const DEPT_MESSAGES: Record<string, string> = {
  CEOB: "Bienvenue dans la vue Tactique. Je surveille l'ensemble de l'organisation pour vous.",
  CTOB: "Bienvenue dans mon département Technologie. Voici l'état de votre écosystème tech. Cliquez sur un élément pour qu'on en discute.",
  CFOB: "Bonjour! Je suis François, votre CFO. Voici un portrait de vos finances. Cliquez sur un bloc pour qu'on creuse ensemble.",
  CMOB: "Martine ici, votre CMO. Bienvenue dans Marketing & Croissance. Cliquez sur un élément pour qu'on l'analyse.",
  CSOB: "Sophie à l'appareil, votre CSO. Stratégie & Ventes — cliquez sur un bloc pour qu'on en discute.",
  COOB: "Olivier ici, votre COO. Opérations & Production — cliquez sur un élément pour qu'on approfondisse.",
  CHROB: "Hélène, votre CHRO. Capital humain, recrutement et culture. Cliquez sur un bloc pour qu'on en parle.",
  CINOB: "Inès, votre CINO. Innovation & Données — cliquez sur un élément pour qu'on en discute.",
  CROB: "Raphaël, votre CRO. Revenus & Croissance — cliquez sur un bloc pour qu'on creuse ensemble.",
  CLOB: "Louise, votre CLO. Juridique & Conformité — cliquez sur un élément pour qu'on en discute.",
  CISOB: "Sébastien, votre CISO. Sécurité & Cyber — cliquez sur un bloc pour qu'on analyse ensemble.",
};

/** Nom court par bot */
const BOT_NAMES: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "Thierry", CFOB: "François", CMOB: "Martine",
  CSOB: "Sophie", COOB: "Olivier", CHROB: "Hélène", CINOB: "Inès",
  CPOB: "Fabien", CROB: "Raphaël", CLOB: "Louise", CISOB: "Sébastien",
};

export function CarlOSPresence() {
  const { activeView, activeBotCode, activeOrbit9Section, activeEspaceSection, activeStrategiqueSection } = useFrameMaster();
  const [phase, setPhase] = useState<"thinking" | "typing" | "done">("thinking");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPhase("thinking");
    setDismissed(false);
    const t = setTimeout(() => setPhase("typing"), 600);
    return () => clearTimeout(t);
  }, []);

  if (dismissed) return null;

  // Pour les vues département, chaque bot présente sa propre section
  const isDept = activeView === "department";
  const botCode = isDept ? activeBotCode : "CEOB";
  const botName = BOT_NAMES[botCode] || "CarlOS";
  const botAvatar = BOT_AVATAR[botCode] || BOT_AVATAR["CEOB"];
  const botRole = BOT_SUBTITLE[botCode] || "Agent AI";

  // Première visite → message enrichi sur le dashboard
  const isFirstVisit = activeView === "dashboard" && !sessionStorage.getItem("carlos_visited");
  if (isFirstVisit) sessionStorage.setItem("carlos_visited", "1");

  // Résolution du message selon la vue + sous-section
  const resolveMessage = (): string => {
    if (isFirstVisit) return FIRST_VISIT_MSG;
    if (isDept) return DEPT_MESSAGES[botCode] || `Bienvenue dans mon département. Je suis ${botName}. Cliquez sur un bloc pour qu'on en discute.`;
    if (activeView === "orbit9-detail" && activeOrbit9Section) return ORBIT9_MESSAGES[activeOrbit9Section] || VIEW_MESSAGES["orbit9-detail"] || "";
    if (activeView === "espace-bureau") return BUREAU_MESSAGES[activeEspaceSection] || VIEW_MESSAGES["espace-bureau"] || "";
    if (activeView === "strategique") return STRATEGIQUE_MESSAGES[activeStrategiqueSection] || VIEW_MESSAGES["strategique"] || "";
    return VIEW_MESSAGES[activeView] || "Je suis là pour vous accompagner.";
  };
  const msg = resolveMessage();

  return (
    <div className="shrink-0 px-4 pt-4 pb-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-start gap-3 max-w-2xl">

        {/* Avatar bot */}
        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-sm shrink-0 mt-0.5">
          <img src={botAvatar} alt={botName} className="w-full h-full object-cover" />
        </div>

        {/* Bulle de chat */}
        <div className="flex-1 min-w-0">
          {/* Nom + rôle */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-800">{botName}</span>
            <span className="text-[10px] text-gray-400">{botRole}</span>
          </div>

          {/* Bulle */}
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm relative">
            {phase === "thinking" ? (
              /* Thinking dots */
              <span className="flex items-center gap-1.5 h-5">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            ) : (
              <TypewriterText
                text={msg}
                speed={14}
                onComplete={() => setPhase("done")}
                className="text-sm text-gray-700 leading-relaxed"
              />
            )}

            {/* Dismiss — apparaît après la fin du texte */}
            {phase === "done" && (
              <button
                onClick={() => setDismissed(true)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
