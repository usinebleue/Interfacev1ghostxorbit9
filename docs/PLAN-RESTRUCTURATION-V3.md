# PLAN RESTRUCTURATION V3 — Ultra-détaillé
# Date: 2026-04-14
# Statut: EN ATTENTE APPROBATION CARL
# Références: docs/AUDIT-V3-SECTIONS.md + docs/AUDIT-BACKEND-MAPPING.md

---

## RÉSUMÉ EN 1 PHRASE

Extraire les god files, séparer les simulations, centraliser types/icônes/constantes,
et aligner les noms frontend sur les clés backend (FLOW_CONFIG) — sans rien casser.

---

## CE QUI NE CHANGE PAS

- SimAmorcer.tsx (7,348 lignes) — reste intact, aucune modification
- BlueprintDepartement.tsx — on EXTRAIT des composants, on ne modifie pas le fichier source avant la fin
- Les 51 tables PostgreSQL — aucun changement
- Les 285 endpoints API — aucun changement
- Les 12 bot codes (CEOB, CTOB, etc.) — immutables
- Le visuel à l'écran — IDENTIQUE après chaque étape

---

## ÉTAPE 1 — CRÉER v3/core/ (Types, Constantes, Icônes)

**Objectif**: Source unique pour les types et constantes. Changer à UN endroit.
**Risque**: ZÉRO — on ajoute des fichiers, on ne touche à rien.
**Build check**: `npx vite build` après chaque fichier.

### 1.1 — `v3/core/types.ts` (nouveau)
```
- PhaseKey (copié de SimAmorcer — 7 phases AMORCER)
- SectionProps (contrat standard pour toute section view)
- ChatProps (contrat standard pour tout composant de chat)
- PhaseConfig (label, color, bg, text, icon)
- DrillLevel ("section" | "focus" | "action")
- ActionMode ("discussion" | "reflexion" | "conception" | "execution" | "retroaction")
- GPS types: ActiveView, ActiveSubSection (alignés sur FLOW_CONFIG backend)
```

### 1.2 — `v3/core/icons.ts` (nouveau)
```
- SECTION_ICONS: { cockpit: Gauge, chantiers: Flame, blueprint: Layers, ... }
- PHASE_ICONS: { attention: AlertTriangle, reflexion: Brain, ... }
- BOT_DEPT_ICONS: { CEOB: Building2, CTOB: Cpu, ... }
- ACTION_ICONS: { discussion: MessageSquare, reflexion: Brain, ... }
- Changer une icône ICI = changée PARTOUT dans le frame V3
```

### 1.3 — `v3/core/styles.ts` (nouveau)
```
- SF constants (copie EXACTE de BlueprintDepartement L183)
  - sidebarW, btnBase, btnActive, btnInactive, iconActive, iconInactive
  - labelActive, labelInactive, count, separator, sectionLabel
  - subBase, subActive, subInactive, toolbarWrap, searchWrap
  - searchIcon, searchInput, select, itemCount, content, gridContent
- CARD_BASE, UB_PASTEL_HEADER, GRADIENT helper
- Source unique — BlueprintDepartement pourra importer depuis ici plus tard
```

### 1.4 — `v3/core/phases.ts` (nouveau)
```
- PHASE_CONFIG: Record<PhaseKey, PhaseConfig>
  - Copie EXACTE de PC depuis SimAmorcer
  - 7 phases avec label, color, bg, text, icon
- UB_BLUE = "#073E5A"
- UB_CYAN = "#00B4D8"
```

**Fichiers créés**: 4
**Fichiers modifiés**: 0
**Commit**: "V3 core — types, icons, styles, phases (source unique)"

---

## ÉTAPE 2 — SECTION REGISTRY (Catalogue central aligné backend)

**Objectif**: Déclarer toutes les sections UNE FOIS, alignées sur FLOW_CONFIG backend.
**Risque**: ZÉRO — ajout pur.

### 2.1 — `v3/core/section-registry.ts` (nouveau)

Chaque section déclarée avec:
```typescript
interface SectionDef {
  id: string;                     // Clé EXACTE du FLOW_CONFIG backend ("cockpit", "ventes", etc.)
  label: string;                  // Label affiché (français)
  icon: keyof typeof SECTION_ICONS; // Référence centralisée
  group: "bureau" | "orbit9" | "admin" | "rooms"; // Onglet de nav
  order: number;                  // Ordre dans la nav
  gpsView: string;                // active_view envoyé au backend
  gpsSub?: string;                // active_sub_section envoyé au backend
  flowType: "data" | "action";    // Type de section (backend)
  drillLevels: number;            // Niveaux de drill-down supportés
  botPrimaire?: string;           // Bot par défaut (depuis FLOW_CONFIG)
}
```

Sections du groupe "bureau" (alignées FLOW_CONFIG):
```
cockpit      → gps("cockpit", null)
chantiers    → gps("department", null) — drill-down 5 niveaux
blueprint    → gps("blueprint", null)
dataroom     → gps("espace-bureau", "documents") — ALIGNÉ sur bureau-documents
playbooks    → gps("playbooks", null) — Backend: 46 JSON + prospect_playbooks table + 7 endpoints
conferenceai → gps("conferenceai", null) — Backend: meetings table + 30+ types + 11 endpoints LIVE
```

Sections du groupe "orbit9":
```
dashboard    → gps("orbit9", "dashboard")
blueprint-o9 → gps("orbit9", "blueprint")
cellules     → gps("orbit9", "cellules")
jumelage     → gps("orbit9", "jumelage") — ACTION flow dans FLOW_CONFIG
gouvernance  → gps("orbit9", "gouvernance")
pionniers    → gps("orbit9", "pionniers")
vitaa        → gps("orbit9", "vitaa")
profil       → gps("orbit9", "profil")
```

Sections du groupe "rooms" (ACTION flows):
```
board-room   → gps("board-room", null) — 5 steps
war-room     → gps("war-room", null) — 6 steps
think-room   → gps("think-room", null) — 6 steps
```

Helpers:
```
getSection(id) → SectionDef | undefined
getSectionsByGroup(group) → SectionDef[]
getSectionGPS(id) → { view, sub } — pour ChatRequest
```

**Fichiers créés**: 1
**Fichiers modifiés**: 0
**Commit**: "V3 section-registry — catalogue aligné FLOW_CONFIG backend"

---

## ÉTAPE 3 — EXTRAIRE LES 6 SECTION VIEWS (God file split)

**Objectif**: Sortir CockpitView, BlueprintView, DataRoomView, PlaybookStoreView, ConferenceAIView, ChantierView de BlueprintDepartement.tsx (12,127 lignes) dans des fichiers séparés.
**Risque**: MODÉRÉ — il faut garder les exports intacts.
**Stratégie**: Extraire UN PAR UN, vérifier le build à chaque fois.

### 3.1 — Créer dossier `v3/sections/`

### 3.2 — Extraire chaque section view

Pour CHAQUE section (dans cet ordre — du plus simple au plus complexe):

**a) `v3/sections/ConferenceAIView.tsx`** (~600 lignes)
- Copier le composant depuis BlueprintDepartement
- Copier les types/constantes locales nécessaires
- Importer SF depuis `../core/styles`
- Exporter le composant
- Dans BlueprintDepartement: re-exporter `export { ConferenceAIView } from "../../../v3/sections/ConferenceAIView"`
- Build check

**b) `v3/sections/DataRoomView.tsx`** (~800 lignes)
- Même procédure

**c) `v3/sections/PlaybookStoreView.tsx`** (~1,200 lignes)
- Même procédure

**d) `v3/sections/CockpitView.tsx`** (~800 lignes)
- Même procédure

**e) `v3/sections/ChantierView.tsx`** (~1,500 lignes)
- Plus complexe (5 niveaux drill-down)
- Même procédure mais plus de dépendances locales à extraire

**f) `v3/sections/BlueprintView.tsx`** (~2,000 lignes)
- Le plus complexe (recursive, sub-views, cross-department)
- Extraire en dernier

### 3.3 — Extraire les composants partagés

**`v3/sections/shared/LivingHero.tsx`** (~150 lignes)
- Utilisé par les 6 sections
- Source unique

**`v3/sections/shared/SectionSidebar.tsx`** (~100 lignes)
- Pattern w-[180px] + boutons SF
- Réutilisable par toutes les sections

### 3.4 — Re-exports de compatibilité

BlueprintDepartement.tsx garde ses exports existants via re-export:
```typescript
// Compatibilité — les imports existants continuent de fonctionner
export { CockpitView } from "../../../v3/sections/CockpitView";
export { BlueprintView } from "../../../v3/sections/BlueprintView";
// etc.
```

Comme ça, AUCUN fichier qui importe depuis BlueprintDepartement ne casse.

**Fichiers créés**: 8 (6 sections + 2 shared)
**Fichiers modifiés**: 1 (BlueprintDepartement — re-exports seulement)
**Commits**: 1 par section extraite (6 commits) + 1 pour shared
**Build check**: Après CHAQUE extraction

---

## ÉTAPE 4 — CRÉER v3/simulation/ (Séparation simulation)

**Objectif**: Regrouper tout ce qui est mock/demo dans un dossier dédié.
**Risque**: MODÉRÉ — changement d'imports.

### 4.1 — `v3/simulation/sim-content-map.ts` (nouveau)

Mapping simple: quelle section → quel composant simulation
```typescript
// Quand rightSection === "cockpit" → afficher CockpitView (vraie section extraite)
// Quand phase === "observation" → afficher VueEnsemble (simulation)
// Quand phase === "reflexion" → afficher ReflexionMagazine (simulation)

export const SIM_SECTION_MAP = {
  cockpit: () => import("../sections/CockpitView"),      // VRAIE section (cristallisée)
  blueprint: () => import("../sections/BlueprintView"),   // VRAIE section
  dataroom: () => import("../sections/DataRoomView"),     // VRAIE section
  playbooks: () => import("../sections/PlaybookStoreView"), // VRAIE section
  conferenceai: () => import("../sections/ConferenceAIView"), // VRAIE section
  chantiers: () => import("../sections/ChantierView"),    // VRAIE section
};

export const SIM_DASHBOARD_MAP = {
  observation: () => import("../../v2/.../SimAmorcer").then(m => m.VueEnsemble), // SIMULATION
  attention: () => import("../../v2/.../SimAmorcer").then(m => m.VueEnsemble),   // SIMULATION
  moderation: () => import("../../v2/.../SimAmorcer").then(m => m.VueEnsemble),  // SIMULATION
};

export const SIM_PHASE_MAP = {
  reflexion: () => import("../../v2/.../SimAmorcer").then(m => m.ReflexionMagazine), // SIMULATION
  creation: () => import("../../v2/.../SimAmorcer").then(m => m.ChantierDrillDown),  // SIMULATION
  execution: () => import("../../v2/.../SimAmorcer").then(m => m.ChantierDrillDown), // SIMULATION
  retroaction: () => import("../../v2/.../SimAmorcer").then(m => m.ChantierDrillDown), // SIMULATION
};

export const SIM_ORBIT9_MAP = {
  dashboard: () => import("../../v2/.../SimAmorcer").then(m => m.Orbit9SocialHome), // SIMULATION
  // ... etc.
};
```

### 4.2 — `v3/simulation/sim-chat-map.ts` (nouveau)

Même pattern pour les chats mock:
```typescript
export const SIM_CHAT_MAP = {
  observation: ObservationChat,  // SIMULATION
  attention: AttentionChat,      // SIMULATION
  moderation: ModerationChat,    // SIMULATION
  reflexion: ReflexionChat,      // SIMULATION
};
```

### 4.3 — Modifier WorkspacePhasesPanel.tsx

Remplacer les imports directs de SimAmorcer par les maps:
```
AVANT: import { VueEnsemble, ReflexionMagazine, ... } from "../v2/.../SimAmorcer"
APRÈS: import { SIM_DASHBOARD_MAP, SIM_PHASE_MAP, SIM_ORBIT9_MAP } from "./simulation/sim-content-map"
```

Le composant utilise les maps au lieu des imports directs.
**Visuellement RIEN ne change** — ce sont les mêmes composants.

### 4.4 — Modifier DiscussionWindow.tsx

Remplacer les imports directs de SimAmorcer par sim-chat-map.
**Visuellement RIEN ne change.**

**Fichiers créés**: 2
**Fichiers modifiés**: 2 (WorkspacePhasesPanel, DiscussionWindow — imports seulement)
**Commit**: "V3 simulation separation — imports via maps, zero visual change"

---

## ÉTAPE 5 — HOOKS INTELLIGENTS

**Objectif**: Hooks réutilisables pour les sections.
**Risque**: ZÉRO — ajout pur.

### 5.1 — `v3/hooks/use-section.ts`
```
- Accès à la SectionDef de la section active
- Helpers: navigate(sectionId), goBack()
- Fournit: icône, label, group, GPS params
```

### 5.2 — `v3/hooks/use-drilldown.ts`
```
- Gère la navigation poupées russes
- pushLevel(id, label), popLevel(), reset()
- breadcrumb, level, isRoot, isDeepest
- Utilisable par ChantierView (5 niveaux) et BlueprintView (2 niveaux)
```

### 5.3 — `v3/hooks/use-action-mode.ts`
```
- Gère les 5 modes d'action
- startAction(mode), exitAction()
- isInAction, activeAction, supportedActions
- Respect de la section registry (supportedActions)
```

**Fichiers créés**: 3
**Fichiers modifiés**: 0
**Commit**: "V3 hooks — useSection, useDrillDown, useActionMode"

---

## ÉTAPE 6 — MIGRATION DES IMPORTS V3

**Objectif**: Les fichiers V3 importent depuis core/ au lieu de V2.
**Risque**: BAS — remplacements d'imports, même fonctionnalité.

### 6.1 — AmorcerContext.tsx
```
AVANT: import type { PhaseKey } from "../v2/.../SimAmorcer"
APRÈS: import type { PhaseKey } from "./core/types"
```

### 6.2 — WorkspacePhasesPanel.tsx
```
AVANT: import { PC, UB_BLUE, ... } from "../v2/.../SimAmorcer"
       import { SF, ... } from "../v2/.../BlueprintDepartement"
APRÈS: import { PHASE_CONFIG } from "./core/phases"
       import { UB_BLUE } from "./core/phases"
       import { SECTION_ICONS } from "./core/icons"
       import { SF } from "./core/styles"
```

### 6.3 — ControlTowerPanel.tsx
```
AVANT: icônes inline, constantes inline
APRÈS: import { SECTION_ICONS, BOT_DEPT_ICONS } from "./core/icons"
       import { getSectionsByGroup } from "./core/section-registry"
       Nav générée depuis le registre (plus de boutons hardcodés)
```

### 6.4 — DiscussionWindow.tsx
```
AVANT: import { PC, UB_BLUE, TEAM } from "../v2/.../SimAmorcer"
APRÈS: import { PHASE_CONFIG } from "./core/phases"
       import { UB_BLUE } from "./core/phases"
       import { TEAM } from "./simulation/sim-chat-map"  // TEAM = mock data
```

### 6.5 — constants.ts
```
Peut être simplifié ou supprimé — tout est dans core/
```

**Fichiers créés**: 0
**Fichiers modifiés**: 5
**Commit**: "V3 import migration — core/ as source of truth"

---

## ÉTAPE 7 — NETTOYAGE

### 7.1 — Supprimer les 3 fichiers morts
```
v2/zones/center/blueprint/blueprint-playbooks.ts  (2,338 lignes — jamais importé)
v2/zones/center/atelier/demos/SimBrainTeamV3.tsx   (1,082 lignes — jamais importé)
v2/zones/center/atelier/atelier-types.ts           (41 lignes — jamais importé)
```

### 7.2 — Vérifier la cohérence
- `npx vite build` final
- Vérifier que /amorcer affiche exactement la même chose qu'avant
- Vérifier que la V2 (/app) fonctionne toujours

**Fichiers supprimés**: 3
**Commit**: "V3 cleanup — remove dead files (3,461 lignes)"

---

## STRUCTURE FINALE

```
v3/
  FrameMasterAmorcer.tsx       — Root layout (inchangé structurellement)
  AmorcerContext.tsx            — État partagé (imports depuis core/)
  ControlTowerPanel.tsx         — Nav (générée depuis section-registry)
  DiscussionWindow.tsx          — Chat (imports depuis core/ + simulation/)
  WorkspacePhasesPanel.tsx      — Workspace (imports depuis core/ + simulation/)

  core/                         — Source unique types/constantes
    types.ts                    — PhaseKey, SectionProps, ChatProps, ActionMode, GPS types
    icons.ts                    — SECTION_ICONS, PHASE_ICONS, BOT_DEPT_ICONS
    styles.ts                   — SF constants, CARD_BASE, UB_PASTEL
    phases.ts                   — PHASE_CONFIG, UB_BLUE, UB_CYAN
    section-registry.ts         — SECTIONS catalogue aligné FLOW_CONFIG backend

  sections/                     — Section views extraites (1 fichier = 1 section)
    CockpitView.tsx
    BlueprintView.tsx
    DataRoomView.tsx
    PlaybookStoreView.tsx
    ConferenceAIView.tsx
    ChantierView.tsx
    shared/
      LivingHero.tsx
      SectionSidebar.tsx

  hooks/                        — Hooks réutilisables
    use-section.ts
    use-drilldown.ts
    use-action-mode.ts

  simulation/                   — Mock/demo (clairement séparé)
    sim-content-map.ts
    sim-chat-map.ts
```

---

## RÉSUMÉ DES OPÉRATIONS

| Étape | Fichiers créés | Fichiers modifiés | Risque | Build check |
|-------|---------------|-------------------|--------|-------------|
| 1. core/ | 4 | 0 | Zéro | Oui |
| 2. Registry | 1 | 0 | Zéro | Oui |
| 3. Extraction sections | 8 | 1 (re-exports) | Modéré | Après chaque extraction |
| 4. Simulation séparation | 2 | 2 | Modéré | Oui |
| 5. Hooks | 3 | 0 | Zéro | Oui |
| 6. Migration imports | 0 | 5 | Bas | Oui |
| 7. Nettoyage | -3 | 0 | Zéro | Oui |
| **TOTAL** | **18 créés** | **8 modifiés** | | **12+ builds** |

---

## APRÈS CE PLAN — CE QU'ON PEUT FAIRE

1. **Ajouter une section** = 1 entrée dans section-registry + 1 fichier dans sections/
2. **Changer une icône** = 1 ligne dans icons.ts
3. **Brancher le backend** = remplacer simulation/ par des vrais appels API
4. **Construire les 5 phases d'état** = hooks use-action-mode + composants dans sections/
5. **Section Orbit9** = entrées dans registry + composants dans sections/
6. **Section Opérations/Admin/Réglages** = même pattern
7. **Help/Tutoriel** = même pattern
