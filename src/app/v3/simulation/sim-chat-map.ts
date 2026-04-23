/**
 * sim-chat-map.ts — Re-exports simulation chat components
 *
 * Ces composants sont des chats SIMULÉS par phase AMORCER.
 * Quand le backend sera connecté, ce fichier pointera vers le vrai LiveChat.
 *
 * RÈGLE: TOUTE import de composant chat simulation passe par ce fichier.
 * JAMAIS importer directement depuis SimAmorcer dans les fichiers V3.
 */

export {
  // Mock team data (avatars dans le header Discussion)
  TEAM,

  // Chat components par phase
  ObservationChat,
  ReflexionChat,
  ConceptionChat,
  AttentionChat,
  ModerationChat,
  PlaceholderChat,

  // Level 2 — Deliverable conception chat
  DeliverableConceptionChat,
} from "../../v2/zones/center/atelier/demos/SimAmorcer";
