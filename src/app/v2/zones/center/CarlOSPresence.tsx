/**
 * CarlOSPresence.tsx — Bulle d'accueil du bot dans chaque section du canevas
 * Le bot ÉCRIT EN PREMIER pour présenter la section — avant que l'utilisateur parle.
 * Sections générales → CarlOS (BCO)
 * Départements (BCT, BCF, etc.) → chaque bot présente sa propre section
 * Sprint B/C — CarlOS Noyau Omnipresent (D-081)
 */

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TypewriterText } from "./shared/simulation-components";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";
import { useFrameMaster } from "../../context/FrameMasterContext";

/** Messages par vue — voix directe du bot */
const VIEW_MESSAGES: Record<string, string> = {
  dashboard:       "Voici votre tableau de bord exécutif. Vos C-Level ont analysé votre situation — cliquez sur un bloc pour qu'on creuse ensemble.",
  cockpit:         "Cockpit GhostX en ligne. Vos indicateurs clés sont consolidés ici. Qu'est-ce qu'on approfondit?",
  health:          "Je surveille la santé de votre organisation en continu. Voici un portrait transversal de vos 5 dimensions stratégiques.",
  scenarios:       "Studio de simulation actif. Choisissez un mode de réflexion et lancez une hypothèse — je m'occupe de la modéliser.",
  "espace-bureau": "Votre espace de travail. Projets actifs, outils et tâches sont centralisés ici.",
  canvas:          "Canevas stratégique ouvert. Demandez-moi d'afficher ce que vous voulez — je gère le contenu en temps réel.",
  "orbit9-detail": "Orbit9 — les 101 éléments fondamentaux de votre écosystème. Chaque point est une décision potentielle.",
  cahier:          "Voici votre cahier stratégique. Vos idées cristallisées, prêtes à passer à l'action.",
  "agent-settings":"Configuration de votre équipe GhostX. Personnalisez mon comportement et celui de vos agents.",
  "blueprint":     "Votre Blue Print — le schéma directeur de l'idée à la réalisation. Vos bots travaillent les sections, je génère les documents.",
  "board-room":    "Board Room en session. Vos 6 C-Level sont réunis pour délibérer. Proposez un sujet ou lancez un débat.",
};

/** Messages d'accueil par bot pour leurs départements */
const DEPT_MESSAGES: Record<string, string> = {
  BCO: "Bienvenue dans la direction générale. Je surveille l'ensemble de l'organisation pour vous.",
  BCT: "Bienvenue dans mon département Technologie. Voici l'état de votre écosystème tech et vos priorités IT.",
  BCF: "Bonjour! Je suis François, votre CFO. Voici un portrait de vos finances. Qu'est-ce qui vous préoccupe?",
  BCM: "Martine ici, votre CMO. Bienvenue dans Marketing & Croissance. On analyse quoi aujourd'hui?",
  BCS: "Sophie à l'appareil, votre CSO. Stratégie & Ventes — voici votre positionnement concurrentiel.",
  BOO: "Olivier ici, votre COO. Opérations & Production — tout ce qui fait tourner la machine.",
  BHR: "Hélène, votre CHRO. Bienvenue dans RH. Capital humain, recrutement et culture — c'est mon domaine.",
  BIO: "Isabelle, votre CIO. Systèmes & Données — je gère l'infrastructure informationnelle de l'organisation.",
  BCC: "Catherine, votre CCO. Communication & Marque — votre image, vos messages, votre impact.",
  BPO: "Philippe, votre CPO. Innovation & Produits — on construit quoi de nouveau aujourd'hui?",
  BRO: "Raphaël, votre CRO. Revenus & Croissance — pipeline, partenariats, expansion.",
  BLE: "Louise, votre CLO. Juridique & Conformité — je m'assure qu'on reste dans les règles.",
  BSE: "Sébastien, votre CISO. Sécurité & Cyber — vos risques numériques, sous surveillance.",
};

/** Nom court par bot */
const BOT_NAMES: Record<string, string> = {
  BCO: "CarlOS", BCT: "Thierry", BCF: "François", BCM: "Martine",
  BCS: "Sophie", BOO: "Olivier", BHR: "Hélène", BIO: "Isabelle",
  BCC: "Catherine", BPO: "Philippe", BRO: "Raphaël", BLE: "Louise", BSE: "Sébastien",
};

export function CarlOSPresence() {
  const { activeView, activeBotCode } = useFrameMaster();
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
  const botCode = isDept ? activeBotCode : "BCO";
  const botName = BOT_NAMES[botCode] || "CarlOS";
  const botAvatar = BOT_AVATAR[botCode] || BOT_AVATAR["BCO"];
  const botRole = BOT_SUBTITLE[botCode] || "Agent AI";
  const msg = isDept
    ? (DEPT_MESSAGES[botCode] || `Bienvenue dans mon département. Je suis ${botName}.`)
    : (VIEW_MESSAGES[activeView] || "Je suis là pour vous accompagner.");

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
