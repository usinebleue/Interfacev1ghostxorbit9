/**
 * playbook-meeting-type-map.ts — Mapping playbook ID/categorie → backend meeting_type
 *
 * Le frontend utilise pb.type ("conference", "cognitif", "formation") pour le filtrage UI,
 * mais le backend MEETING_PLAYBOOKS attend des cles specifiques ("brainstorm", "board", etc.).
 * Ce module resout le bon meeting_type a envoyer au backend.
 */

// ═══════════════════════════════════════════════════════════════
// A) Map statique ID → meeting_type (priorite maximale)
// ═══════════════════════════════════════════════════════════════

const ID_TO_MEETING_TYPE: Record<string, string> = {
  // Cognitifs (pb-GHO-COG-*)
  "pb-GHO-COG-001": "analyse",
  "pb-GHO-COG-002": "debat",
  "pb-GHO-COG-003": "brainstorm",
  "pb-GHO-COG-004": "strategie",
  "pb-GHO-COG-005": "innovation",
  "pb-GHO-COG-006": "decision",
  "pb-GHO-COG-007": "crise",
  "pb-GHO-COG-008": "resonance",
  "pb-GHO-COG-009": "credo",
  // Heritage
  "pb-GHO-HER-001": "travail",
  "pb-GHO-HER-002": "travail",
  "pb-GHO-HER-003": "travail",
  // Tech
  "pb-GHO-TEC-004": "trisociation",
  // Use cases
  "pb-GHO-USE-005": "travail",
  "pb-GHO-USE-006": "trisociation",
  // Media
  "pb-GHO-MED-007": "podcast",
  // Mentorat
  "pb-GHO-MNT-008": "travail",
  // Legacy numbered IDs
  "pb-200": "board",
  "pb-201": "brainstorm",
  "pb-202": "one_on_one",
  "pb-203": "crise",
  "pb-204": "podcast",
  // Orbit9
  "pb-O9-004": "trisociation",
  // Express
  "pb-080": "brainstorm",
};

// ═══════════════════════════════════════════════════════════════
// B) Map categorie → meeting_type (fallback pour conference entries)
// ═══════════════════════════════════════════════════════════════

const CATEGORY_TO_MEETING_TYPE: Record<string, string> = {
  "Podcast": "podcast",
  "Vente": "client",
  "Pre-entrevue": "pre_entrevue",
  "Jumelage": "jumelage",
  "Gestion crise": "crise",
  "Creativite": "brainstorm",
  "Ideation": "brainstorm",
  "Mediation": "travail",
  "Conference AI": "travail",
  "Express": "standup",
  "Reunion": "travail",
  "Collaboration": "jumelage",
  "Gouvernance": "board",
  "Ressources humaines": "travail",
  "Personnel": "travail",
  "Operations": "travail",
  "Formation": "onboarding",
  "Negociation": "closing",
  "Ghost Cognitif": "travail",
  "Marque employeur": "travail",
  "Contenu": "travail",
  "Recurrent": "travail",
};

// ═══════════════════════════════════════════════════════════════
// C) Keywords dans nom (priorite > categorie)
// ═══════════════════════════════════════════════════════════════

const KEYWORD_RULES: { pattern: RegExp; type: string }[] = [
  { pattern: /board|c\.a\.|conseil.*admin/i, type: "board" },
  { pattern: /brainstorm|ideation/i, type: "brainstorm" },
  { pattern: /podcast|audio|culture talk/i, type: "podcast" },
  { pattern: /1-on-1|one.on.one|1:1|coaching/i, type: "one_on_one" },
  { pattern: /war.room|crise/i, type: "crise" },
  { pattern: /trisociation/i, type: "trisociation" },
  { pattern: /standup|stand-up|daily/i, type: "standup" },
  { pattern: /retrospective|sprint.review/i, type: "sprint_review" },
  { pattern: /kickoff|kick-off|demarrage/i, type: "kickoff" },
  { pattern: /postmortem|post-mortem/i, type: "postmortem" },
  { pattern: /demo|demonstration/i, type: "demo_produit" },
  { pattern: /prospection|cold.call/i, type: "prospection" },
  { pattern: /closing|negociation.finale/i, type: "closing" },
  { pattern: /entrevue.*technique/i, type: "entrevue_technique" },
  { pattern: /entrevue.*culture/i, type: "entrevue_culture" },
  { pattern: /entrevue|candidat/i, type: "pre_entrevue" },
  { pattern: /diagnostic|audit/i, type: "diagnostic" },
  { pattern: /onboarding/i, type: "onboarding" },
  { pattern: /comex|codir/i, type: "comex" },
  { pattern: /qbr|revue.trimestrielle/i, type: "qbr" },
  { pattern: /capsule/i, type: "capsule" },
  { pattern: /jumelage|matching/i, type: "jumelage" },
  { pattern: /debat/i, type: "debat" },
  { pattern: /analyse/i, type: "analyse" },
  { pattern: /decision/i, type: "decision" },
  { pattern: /strategi/i, type: "strategie" },
  { pattern: /innovation/i, type: "innovation" },
  { pattern: /resonance/i, type: "resonance" },
  { pattern: /aiguillage/i, type: "aiguillage" },
];

// ═══════════════════════════════════════════════════════════════
// D) Fonction exportee — resolution prioritaire
// ═══════════════════════════════════════════════════════════════

interface PlaybookLike {
  id: string;
  nom: string;
  type: string;
  categorie?: string;
}

const VALID_BACKEND_TYPES = new Set([
  "podcast", "board", "client", "aiguillage", "travail", "onboarding",
  "diagnostic", "crise", "brainstorm", "debat", "analyse", "decision",
  "strategie", "innovation", "resonance", "credo", "comex", "qbr",
  "standup", "mbr", "one_on_one", "kickoff", "sprint_review", "postmortem",
  "pre_entrevue", "entrevue_technique", "entrevue_culture", "jumelage",
  "trisociation", "closing", "demo_produit", "prospection", "capsule",
]);

/**
 * Resout le meeting_type backend a partir d'un playbook frontend.
 * Priorite: ID exact → keyword nom → categorie → type fallback → "travail"
 */
export function resolveBackendMeetingType(pb: PlaybookLike): string {
  // 1. ID exact
  if (ID_TO_MEETING_TYPE[pb.id]) {
    return ID_TO_MEETING_TYPE[pb.id];
  }

  // 2. Keyword dans le nom
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(pb.nom)) {
      return rule.type;
    }
  }

  // 3. Categorie
  if (pb.categorie && CATEGORY_TO_MEETING_TYPE[pb.categorie]) {
    return CATEGORY_TO_MEETING_TYPE[pb.categorie];
  }

  // 4. Type fallback — si le type est deja une cle backend valide, le garder
  if (VALID_BACKEND_TYPES.has(pb.type)) {
    return pb.type;
  }

  // 5. Fallback ultime
  return "travail";
}
