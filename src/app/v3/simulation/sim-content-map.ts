/**
 * sim-content-map.ts — Re-exports simulation content components
 *
 * Ces composants sont des SIMULATIONS/DEMOS provenant de SimAmorcer.
 * Quand le backend sera connecté, ce fichier pointera vers les vrais composants.
 *
 * RÈGLE: TOUTE import de composant simulation passe par ce fichier.
 * JAMAIS importer directement depuis SimAmorcer dans les fichiers V3.
 */

export {
  // Dashboard phases (Observation, Attention, Modération)
  VueEnsemble,

  // Réflexion magazine
  ReflexionMagazine,

  // Création / Exécution / Rétroaction drill-down
  ChantierDrillDown,

  // Catalogue d'icônes
  IconCatalog,

  // ═══ Orbit9 simulation components ═══
  Orbit9SocialHome,
  Orbit9BlueprintCollaboration,
  MesCellules,
  VITAADashboard,
  MonProfilOrbit9,
  Orbit9Gouvernance,
  JumelageOrbit9,
  PionniersOrbit9,
  CreerCellulePage,

  // Orbit9 mock data
  ORBIT9_CELLULES,
} from "../../v2/zones/center/atelier/demos/SimAmorcer";
