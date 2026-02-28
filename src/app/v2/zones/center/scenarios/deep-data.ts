/**
 * deep-data.ts — Donnees de simulation Mode Deep Resonance
 * Sujet : "Vendre l'entreprise ou doubler la mise avec un partenaire financier?"
 * CEO seul (CarlOS) — Dialogue socratique en spirale 3-6-9
 * Sprint A — Frame Master V2
 */

import {
  Ear,
  Brain,
  Heart,
  Compass,
  Eye,
  Flame,
} from "lucide-react";

export const DEEP_DATA = {
  titre: "Vendre ou doubler la mise?",
  contexte:
    "Fondateur, 52 ans, 18 ans a la barre de son entreprise de 110 employes, 28M$ CA. Offre d'achat a 3.2x EBITDA (12M$). Ou option : fonds d'investissement propose 5M$ pour 35% et plan de croissance vers 50M$ en 5 ans.",

  userTension:
    "Je suis a la croisee des chemins — vendre l'entreprise a un acheteur strategique ou doubler la mise avec un partenaire financier? J'ai mis 18 ans de ma vie la-dedans. 110 employes qui comptent sur moi. L'offre d'achat est a 12M$ — c'est un bon prix. Mais le fonds qui propose 5M$ pour 35% croit qu'on peut aller a 50M$ en 5 ans. J'ai 52 ans. Je suis fatigue, mais je suis pas fini. Je sais plus ou j'en suis.",

  ceoThinking: [
    { icon: Ear, text: "Ecoute profonde..." },
    { icon: Heart, text: "Identification des tensions sous-jacentes..." },
    { icon: Brain, text: "Formulation de la question socratique..." },
  ],

  // === SPIRALE 1 — Surface ===
  spirale1: {
    niveau: "Surface",
    numero: 1,
    ceoQuestion:
      "Avant de parler de chiffres... Qu'est-ce qui serait vrai si tu vendais demain matin? Pas ce qui arriverait — ce qui serait vrai. Sur toi.",
    userResponse:
      "Si je vendais... je serais libre. Pour la premiere fois en 18 ans, personne me reveille la nuit. Pas de paie a faire, pas de client qui menace de partir, pas de machine qui brise un vendredi soir. Mais en meme temps... libre de quoi? J'ai pas de plan B. Mon identite, c'est cette entreprise-la. J'ai peur du vide.",
    ceoReflection:
      "Tu viens de nommer quelque chose d'important. Tu veux la liberte — mais tu as peur du vide. C'est pas une contradiction. C'est la tension fondamentale de tout fondateur qui a construit quelque chose de plus grand que lui. La question n'est pas 'vendre ou pas'. La question, c'est : qui es-tu sans le titre de president?",
    reflectionCard: {
      titre: "Le paradoxe du fondateur",
      insight:
        "Tu veux la liberte, mais tu as peur du vide. Ce n'est pas une contradiction — c'est le signal que ta decision n'est pas financiere. Elle est identitaire.",
    },
  },

  // === SPIRALE 2 — Profond ===
  spirale2: {
    niveau: "Profond",
    numero: 2,
    thinkingSteps: [
      { icon: Eye, text: "Analyse des patterns decisionnels..." },
      { icon: Compass, text: "Recherche du modele mental adapte..." },
      { icon: Brain, text: "Connexion avec le cadre de Bezos..." },
    ],
    ceoQuestion:
      "Je vais te poser une question que Jeff Bezos se pose avant chaque grande decision. Oublie le meilleur scenario. Pense a l'echec. Quel scenario echoue le plus gracieusement? Si tu vends et que tu le regrettes — qu'est-ce que ca a l'air? Et si tu prends le fonds et que ca marche pas — qu'est-ce que ca a l'air?",
    userResponse:
      "Si je vends et que je le regrette... dans 2 ans je suis sur un terrain de golf, je m'ennuie a mourir, et je regarde mon ancienne entreprise se faire demanteler par l'acheteur. Ca, ca me tue. Mais si je prends le fonds et que ca marche pas... je perds le controle de ma propre compagnie. Je deviens un employe dans ma propre shop. Et la, c'est pire que vendre. Au moins quand tu vends, c'est toi qui decides.",
    ceoReflection:
      "Ecoute ce que tu viens de dire. L'echec de la vente, c'est 'regarder quelqu'un d'autre detruire ce que j'ai bati'. L'echec du fonds, c'est 'perdre le controle'. Dans les deux cas, ta peur, c'est pas l'argent. Ta peur, c'est de perdre le volant. Ca change toute l'equation.",
    mentalModel: {
      nom: "Regret Minimization Framework (Bezos)",
      explication:
        "Jeff Bezos se projette a 80 ans et se demande : 'De quoi vais-je le moins regretter?' Le regret le plus durable est rarement lie a l'argent — il est lie au sentiment d'avoir abandonne ou d'avoir perdu le controle de sa propre histoire.",
    },
    reflectionCard: {
      titre: "Le vrai enjeu",
      insight:
        "Ta peur n'est pas financiere. Dans les deux scenarios d'echec, ce que tu crains, c'est de perdre le volant. Le controle de ta propre histoire.",
    },
  },

  // === SPIRALE 3 — Resonance ===
  spirale3: {
    niveau: "Resonance",
    numero: 3,
    thinkingSteps: [
      { icon: Heart, text: "Descente vers la couche profonde..." },
      { icon: Flame, text: "Cristallisation de l'insight central..." },
    ],
    ceoQuestion:
      "Derniere question. Ferme les yeux une seconde. Dans 10 ans, tu as 62 ans. Tu es assis sur ton balcon, tu regardes en arriere. Qu'est-ce que tu veux pouvoir te dire? Pas ce que tu veux avoir — ce que tu veux pouvoir te dire.",
    userResponse:
      "Dans 10 ans... je veux pouvoir me dire que j'ai pas lache. Que j'ai pas pris le chemin facile parce que j'etais fatigue. Mais aussi... que j'ai ete assez intelligent pour pas m'accrocher par orgueil. Ce que je veux me dire, c'est que j'ai pris la decision pour les bonnes raisons. Pas par peur. Pas par ego. Par clarte.",
    ceoReflection:
      "Et voila. Tu viens de te repondre. Tu veux ni fuir, ni t'accrocher. Tu veux agir par clarte. C'est exactement ca, la resonance. Quand la reponse sort pas de l'analyse mais de l'alignement entre ce que tu sais, ce que tu ressens, et ce que tu es.",
    crystallizationCard: {
      titre: "L'insight cristallise",
      insight:
        "Ce n'est ni 'vendre' ni 'rester' la vraie question. La vraie question, c'est : est-ce que tu decides par clarte ou par reaction? La clarte, c'est ta boussole. Ni la peur du vide, ni l'orgueil de rester.",
    },
  },

  // === SYNTHESE MIROIR ===
  mirrorSynthesis: {
    intro:
      "Je ne vais pas te dire quoi faire. Mais voici ce que je t'ai entendu dire, dans l'ordre de ce qui compte le plus pour toi :",
    priorities: [
      "Garder le controle de ta propre histoire — pas etre un spectateur de ce que tu as construit.",
      "Decider par clarte, pas par fatigue ni par ego — tu veux que la decision vienne de la bonne place.",
      "Proteger ce que tu as bati pour tes 110 employes — la continuite de l'oeuvre compte.",
      "Retrouver de l'espace sans perdre ton sens — la liberte oui, le vide non.",
      "Avoir un prochain chapitre qui t'appartient — pas le golf par defaut.",
    ],
  },

  // === CLOSING ===
  closing:
    "La reponse est deja en toi. Mon role etait de t'aider a l'entendre. Prends le temps qu'il faut — la clarte ne se force pas.",

  // === MENTAL MODELS references globales ===
  mentalModels: [
    {
      nom: "Regret Minimization Framework",
      auteur: "Jeff Bezos",
      description: "Se projeter a 80 ans : de quoi vais-je le moins regretter?",
    },
    {
      nom: "Dichotomie du Controle",
      auteur: "Epictete / Stoicisme",
      description:
        "Distinguer ce qui depend de nous (notre decision) de ce qui n'en depend pas (le resultat).",
    },
    {
      nom: "Identite du Fondateur vs Identite de l'Entreprise",
      auteur: "Noam Wasserman (The Founder's Dilemma)",
      description:
        "Le fondateur doit separer qui il est de ce qu'il a bati pour prendre une decision lucide.",
    },
  ],
};
