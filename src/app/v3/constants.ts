/**
 * constants.ts — Source unique de constantes V3
 *
 * RÈGLE: JAMAIS redéfinir ces constantes dans un composant.
 * TOUJOURS importer depuis ce fichier.
 *
 * BOT_NAME, BOT_ROLE, BOT_AVATAR, BOT_SUBTITLE, BOT_EMOJI
 * sont re-exportés depuis types.ts (SOURCE UNIQUE historique).
 */

// ═══ Re-exports depuis types.ts (source unique) ═══
export {
  BOT_NAME,
  BOT_ROLE,
  BOT_AVATAR,
  BOT_SUBTITLE,
  BOT_EMOJI,
} from "../v2/api/types";

// ═══ Couleur Usine Bleue — identité visuelle ═══
export const UB_BLUE = "#073E5A";

// ═══ Les 12 codes bot, ordonnés ═══
export const BOT_CODES = [
  "CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB",
  "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB",
] as const;

export type BotCode = (typeof BOT_CODES)[number];

// ═══ Images standby — format V2 original (16:9 complet) ═══
export const BOT_STANDBY: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-standby-v3.png",
  CTOB: "/agents/generated/cto-thierry-standby-v3.png",
  CFOB: "/agents/generated/cfo-francois-standby-v3.png",
  CMOB: "/agents/generated/cmo-martine-standby-v3.png",
  CSOB: "/agents/generated/cso-sophie-standby-v3.png",
  COOB: "/agents/generated/coo-olivier-standby-v3.png",
  CPOB: "/agents/generated/factory-bot-standby-v3.png",
  CHROB: "/agents/generated/chro-helene-standby-v3.png",
  CINOB: "/agents/generated/cino-ines-standby-v3.png",
  CROB: "/agents/generated/cro-raphael-standby-v3.png",
  CLOB: "/agents/generated/clo-louise-standby-v3.png",
  CISOB: "/agents/generated/ciso-secbot-standby-v3.png",
};

// ═══ Département par bot — SOURCE UNIQUE = DEPT_SHORT_LABEL ═══
// Re-export depuis sections/shared/dept-data (V3 source unique)
export { DEPT_SHORT_LABEL, DEPT_DASH_ICON } from "./sections/shared/dept-data";

// ═══ Couleurs d'icône par département ═══
export const DEPT_ICON_COLOR: Record<string, string> = {
  CEOB: "text-blue-600",
  CTOB: "text-violet-600",
  CFOB: "text-emerald-600",
  CMOB: "text-pink-600",
  CSOB: "text-red-600",
  COOB: "text-orange-600",
  CPOB: "text-amber-600",
  CHROB: "text-teal-600",
  CINOB: "text-rose-600",
  CROB: "text-amber-700",
  CLOB: "text-indigo-600",
  CISOB: "text-gray-600",
};

// ═══ 7 états d'un bot — dot / label / tag ═══
export const STATE_DOT: Record<string, string> = {
  attention: "bg-red-500",
  moderation: "bg-pink-500",
  observation: "bg-blue-500",
  reflexion: "bg-orange-500",
  creation: "bg-yellow-500",
  execution: "bg-green-500",
  retroaction: "bg-emerald-500",
};

export const STATE_LABEL: Record<string, string> = {
  attention: "Attention",
  moderation: "Modération",
  observation: "Observation",
  reflexion: "Réflexion",
  creation: "Conception",
  execution: "Exécution",
  retroaction: "Rétroaction",
};

export const STATE_TAG: Record<string, string> = {
  attention: "bg-red-100 text-red-700",
  moderation: "bg-pink-100 text-pink-700",
  observation: "bg-blue-100 text-blue-700",
  reflexion: "bg-orange-100 text-orange-700",
  creation: "bg-yellow-100 text-yellow-700",
  execution: "bg-green-100 text-green-700",
  retroaction: "bg-emerald-100 text-emerald-700",
};

// ═══ Dernière action par bot (mock — sera remplacé par data API) ═══
export const BOT_ACTIONS: Record<string, { lastAction: string; state: string }> = {
  CEOB: { lastAction: "Scan alertes complété", state: "attention" },
  CTOB: { lastAction: "Migration DB phase 2", state: "execution" },
  CFOB: { lastAction: "Rapport Q4 terminé", state: "attention" },
  CMOB: { lastAction: "Campagne email analysée", state: "reflexion" },
  CSOB: { lastAction: "Appel d'offres HQ identifié", state: "creation" },
  COOB: { lastAction: "Audit processus livraison", state: "observation" },
  CPOB: { lastAction: "5S ligne A complété", state: "execution" },
  CHROB: { lastAction: "Entrevues détectées", state: "attention" },
  CINOB: { lastAction: "Veille tech hebdomadaire", state: "observation" },
  CROB: { lastAction: "3 leads qualifiés", state: "moderation" },
  CLOB: { lastAction: "Contrats fournisseurs revus", state: "reflexion" },
  CISOB: { lastAction: "Scan sécurité complété", state: "execution" },
};
