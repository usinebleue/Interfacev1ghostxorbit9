/**
 * sim-chat-map.ts — Re-exports simulation chat components
 *
 * Ces composants sont des chats SIMULÉS par phase AMORCER.
 * Quand le backend sera connecté, ce fichier pointera vers le vrai LiveChat.
 *
 * RÈGLE: TOUTE import de composant chat simulation passe par ce fichier.
 * JAMAIS importer directement depuis SimAmorcer dans les fichiers V3.
 */

// TEAM = source V3 (sim-data.ts) — ZERO import V2 pour les données
export { TEAM } from "./sim-data";

// Chat components par phase — encore dans SimAmorcer (V2) temporairement.
// Quand le backend sera branché, ces composants seront remplacés par de vrais chats.
export {
  ObservationChat,
  ReflexionChat,
  ConceptionChat,
  AttentionChat,
  ModerationChat,
  PlaceholderChat,
  DeliverableConceptionChat,
  ExecutionChat,
} from "../../v2/zones/center/atelier/demos/SimAmorcer";
