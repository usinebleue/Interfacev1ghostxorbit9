# REFERENTIEL DEV V3 — Frame Amorcer /amorcer
# Document BÉTON ARMÉ — Dernière MAJ: 2026-04-14
# LIRE CE DOCUMENT AVANT CHAQUE EDIT FRONTEND V3
# NE JAMAIS IMPROVISER. CE QUI N'EST PAS ICI = DEMANDER À CARL.

---

## 1. ARCHITECTURE V3 — Vue d'ensemble

```
v3/
├── core/                          ← SOURCE UNIQUE types & constantes
│   ├── types.ts                   ← PhaseKey, SectionProps, HeaderView, ActionMode, GPS types
│   ├── phases.ts                  ← PHASE_CONFIG (8 phases), UB_BLUE, UB_CYAN
│   ├── styles.ts                  ← SF (sidebar DNA), CARD_BASE, UB_PASTEL_HEADER
│   ├── icons.ts                   ← BOT_DEPT_ICONS, SECTION_ICONS, DEFAULT_ICON
│   └── section-registry.ts        ← 53 sections alignées FLOW_CONFIG backend (agents.py)
│
├── sections/                      ← COMPOSANTS CRISTALLISÉS (1 fichier = 1 section)
│   ├── shared/
│   │   ├── LivingHero.tsx         ← Banner animé partagé (127 lignes)
│   │   └── dept-data.ts           ← DEPT_COLORS, DEPT_SHORT_LABEL, DEPT_GRADIENT, DEPT_DASH_ICON, OTHER_BOTS
│   ├── CockpitView.tsx            ← 1,465 lignes
│   ├── BlueprintView.tsx          ← 728 lignes — exporte BLUEPRINT_HEADER_TABS
│   ├── DataRoomView.tsx           ← 1,455 lignes
│   ├── PlaybookStoreView.tsx      ← 2,414 lignes — exporte PLAYBOOK_STORE_DATA, PlaybookCardV2, CONFERENCE_FAMILIES, getPlaybookFamily
│   ├── ConferenceAIView.tsx       ← 918 lignes — importe depuis PlaybookStoreView
│   └── ChantierView.tsx           ← 1,506 lignes
│
├── simulation/                    ← COMPOSANTS DEMO/MOCK (séparés du cristallisé)
│   ├── sim-content-map.ts         ← Re-exports: VueEnsemble, ReflexionMagazine, ChantierDrillDown, 9 Orbit9
│   └── sim-chat-map.ts            ← Re-exports: TEAM, ObservationChat, ReflexionChat, AttentionChat, ModerationChat, PlaceholderChat
│
├── hooks/                         ← HOOKS RÉUTILISABLES
│   ├── use-section.ts             ← Navigation sections + GPS backend
│   ├── use-drilldown.ts           ← Stack poupées russes (push/pop/reset/breadcrumb)
│   └── use-action-mode.ts         ← 5 modes d'action (discussion→rétroaction)
│
├── FrameMasterAmorcer.tsx         ← Root layout 3 zones resizables
├── AmorcerContext.tsx              ← État partagé (activePhase, rightSection, activeBotCode, etc.)
├── ControlTowerPanel.tsx           ← Panneau gauche (nav, bots, cellules)
├── DiscussionWindow.tsx            ← Panneau centre (chat par phase)
├── WorkspacePhasesPanel.tsx        ← Panneau droit (sections + phases)
└── constants.ts                    ← Re-exports: BOT_NAME, BOT_ROLE, BOT_AVATAR, etc.
```

---

## 2. IMPORTS — RÈGLES ABSOLUES

### CE QUI EST INTERDIT (JAMAIS FAIRE)

```typescript
// ❌ INTERDIT — import direct depuis SimAmorcer
import { VueEnsemble } from "../v2/zones/center/atelier/demos/SimAmorcer";

// ❌ INTERDIT — import direct depuis BlueprintDepartement
import { CockpitView } from "../v2/zones/center/blueprint/BlueprintDepartement";

// ❌ INTERDIT — redéfinir une constante qui existe dans core/
const UB_BLUE = "#073E5A"; // EXISTE dans core/phases.ts

// ❌ INTERDIT — style inline
style={{ backgroundColor: '#073E5A' }}

// ❌ INTERDIT — copier-coller des constantes
const SF = { sidebarW: "w-[180px]..." }; // EXISTE dans core/styles.ts
```

### CE QUI EST CORRECT (TOUJOURS FAIRE)

```typescript
// ✅ Types depuis core/types
import type { PhaseKey, SectionProps, HeaderView } from "./core/types";

// ✅ Constantes depuis core/
import { PHASE_CONFIG, UB_BLUE, UB_CYAN } from "./core/phases";
import { SF, CARD_BASE, UB_PASTEL_HEADER } from "./core/styles";
import { BOT_DEPT_ICONS, SECTION_ICONS } from "./core/icons";
import { getSection, getSectionsByGroup } from "./core/section-registry";

// ✅ Données département depuis sections/shared/
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON, DEPT_COLORS, DEPT_GRADIENT, OTHER_BOTS } from "./sections/shared/dept-data";

// ✅ Composants section depuis sections/
import { CockpitView } from "./sections/CockpitView";
import { BlueprintView, BLUEPRINT_HEADER_TABS } from "./sections/BlueprintView";
import { PlaybookStoreView, PLAYBOOK_STORE_DATA, PlaybookCardV2 } from "./sections/PlaybookStoreView";

// ✅ Composants simulation depuis simulation/
import { VueEnsemble, ReflexionMagazine } from "./simulation/sim-content-map";
import { TEAM, ObservationChat } from "./simulation/sim-chat-map";

// ✅ Shared UI
import { LivingHero } from "./sections/shared/LivingHero";

// ✅ Composants UI communs
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";

// ✅ V2 legacy (encore nécessaire)
import { BotAvatar } from "../v2/zones/center/shared/simulation-components";
import { useCanvasActions } from "../v2/context/CanvasActionContext";
import { BOT_AVATAR } from "../v2/api/types";
```

---

## 3. RECETTE — Ajouter une nouvelle section

### Étape 1: Entrée dans section-registry.ts
```typescript
// core/section-registry.ts — ajouter 1 ligne
{ id: "diagnostics", label: "Diagnostics", group: "plateforme", order: 10,
  gpsView: "cockpit", gpsSub: "diagnostics", flowType: "data",
  botPrimaire: "CEOB", botSecondaires: ["CFOB", "COOB"] },
```

### Étape 2: Icône dans icons.ts (si nouvelle)
```typescript
// core/icons.ts
import { Stethoscope } from "lucide-react";
// Ajouter dans SECTION_ICONS:
diagnostics: Stethoscope,
```

### Étape 3: Créer sections/DiagnosticsView.tsx
```typescript
/**
 * DiagnosticsView.tsx — [Description]
 * Utilisé par: WorkspacePhasesPanel (section "diagnostics")
 */
import { useState } from "react";
import { Stethoscope, ... } from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { SF } from "../core/styles";
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON } from "./shared/dept-data";
import type { SectionProps } from "../core/types";

export function DiagnosticsView({ botCode, headerGradient, showHeader }: SectionProps) {
  // ... composant
}
```

### Étape 4: Wire dans WorkspacePhasesPanel.tsx
```typescript
// Ajouter import
import { DiagnosticsView } from "./sections/DiagnosticsView";

// Ajouter dans le switch JSX (section "rightSection")
{rightSection === "diagnostics" && <DiagnosticsView botCode={activeBotCode} showHeader />}
```

### Étape 5: Build check
```bash
cd Interfacev1ghostxorbit9 && npx vite build
```

---

## 4. CONSTANTES BÉTON — Source unique

### 4.1 — SF (Section Frame DNA) — `core/styles.ts`
```
SF.sidebarW     = "w-[180px] shrink-0 space-y-0.5"
SF.btnBase      = "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2"
SF.btnActive    = "bg-blue-50 border border-blue-200 shadow-sm"
SF.btnInactive  = "hover:bg-gray-50 border border-transparent"
SF.iconActive   = "h-3.5 w-3.5 shrink-0 text-blue-500"
SF.iconInactive = "h-3.5 w-3.5 shrink-0 text-gray-400"
SF.labelActive  = "text-[10px] font-bold flex-1 leading-tight text-blue-700"
SF.labelInactive= "text-[10px] font-bold flex-1 leading-tight text-gray-700"
SF.count        = "text-[9px] text-gray-400"
SF.separator    = "h-px bg-gray-100 mx-2 my-1.5"
SF.sectionLabel = "text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2.5 py-1"
SF.subBase      = "w-full pl-6 pr-2.5 py-1 rounded-lg text-left text-[9px] cursor-pointer"
SF.subActive    = "bg-blue-50 text-blue-700 font-bold"
SF.subInactive  = "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium"
SF.searchInput  = "w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
SF.content      = "flex-1 min-w-0 space-y-3"
SF.gridContent  = "grid grid-cols-2 gap-3"
```

### 4.2 — PHASE_CONFIG — `core/phases.ts`
| Phase | Couleur | dot | badge | bg | text |
|-------|---------|-----|-------|----|----|
| discussion | sky | bg-sky-500 | bg-sky-100 text-sky-700 | bg-sky-50 | text-sky-700 |
| attention | red | bg-red-500 | bg-red-100 text-red-700 | bg-red-50 | text-red-700 |
| moderation | pink | bg-pink-500 | bg-pink-100 text-pink-700 | bg-pink-50 | text-pink-700 |
| observation | blue | bg-blue-500 | bg-blue-100 text-blue-700 | bg-blue-50 | text-blue-700 |
| reflexion | orange | bg-orange-500 | bg-orange-100 text-orange-700 | bg-orange-50 | text-orange-700 |
| creation | yellow | bg-yellow-500 | bg-yellow-100 text-yellow-700 | bg-yellow-50 | text-yellow-700 |
| execution | green | bg-green-500 | bg-green-100 text-green-700 | bg-green-50 | text-green-700 |
| retroaction | emerald | bg-emerald-500 | bg-emerald-100 text-emerald-700 | bg-emerald-50 | text-emerald-700 |

**Couleurs identitaires:**
- `UB_BLUE = "#073E5A"` — headers, barres, fond discussion
- `UB_CYAN = "#00B4D8"` — accents, pastel `bg-[#00B4D8]/10`, cards
- `UB_PASTEL_HEADER = "bg-[#00B4D8]/[0.12]"` — header workspace

### 4.3 — Département data — `sections/shared/dept-data.ts`
| Code | Label | Gradient | Couleur icône |
|------|-------|----------|---------------|
| CEOB | Direction | from-blue-700 to-blue-500 | text-blue-600 |
| CTOB | Technologie | from-violet-600 to-violet-500 | text-violet-600 |
| CFOB | Finance | from-emerald-600 to-emerald-500 | text-emerald-600 |
| CMOB | Marketing | from-pink-600 to-pink-500 | text-pink-600 |
| CSOB | Stratégie | from-red-600 to-red-500 | text-red-600 |
| COOB | Opérations | from-orange-600 to-orange-500 | text-orange-600 |
| CPOB | Production | from-amber-600 to-amber-500 | text-amber-600 |
| CHROB | RH | from-teal-600 to-teal-500 | text-teal-600 |
| CINOB | Innovation | from-rose-600 to-rose-500 | text-rose-600 |
| CROB | Ventes | from-amber-600 to-amber-500 | text-amber-700 |
| CLOB | Juridique | from-indigo-600 to-indigo-500 | text-indigo-600 |
| CISOB | Sécurité | from-gray-600 to-gray-500 | text-gray-600 |
| ORBIT9 | Collaboration | from-cyan-600 to-blue-500 | text-cyan-600 |

### 4.4 — Icônes section — `core/icons.ts`
| Section | Icône |
|---------|-------|
| cockpit | Gauge |
| chantiers | Flame |
| blueprint | Layers |
| dataroom | Database |
| playbooks | BookOpen |
| conferenceai | Video |
| orbit9 | Atom |
| home | Home |

---

## 5. PATTERNS UI — Copier-coller, jamais inventer

### 5.1 — Sub-tabs (PARTOUT pareil)
```
Active:  "bg-gray-900 text-white shadow-sm"
Inactif: "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
Taille:  "px-3 py-1.5 text-xs font-medium gap-1.5"
Icône:   "h-3.5 w-3.5"
```

### 5.2 — Header pastel workspace
```tsx
<div className="h-12 px-3 shrink-0 flex items-center gap-2 border-b border-gray-200 bg-[#00B4D8]/[0.12]">
  <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
  <span className="text-sm font-bold text-gray-900">{title}</span>
</div>
```

### 5.3 — Card playbook (header bg-[#00B4D8]/10)
```tsx
<div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
    <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{title}</span>
  </div>
  <div className="px-4 py-3 space-y-2.5">...</div>
</div>
```

### 5.4 — KPI cards (standard Cockpit)
```tsx
<Card className="p-0 overflow-hidden">
  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-{color}-600 to-{color}-500">
    <Icon className="h-4 w-4 text-white" />
    <span className="text-sm font-bold text-white">{label}</span>
  </div>
  <div className="px-3 py-2">
    <div className="text-2xl font-bold text-{color}-600">{value}</div>
    <div className="text-[10px] text-gray-500">{sublabel}</div>
  </div>
</Card>
```

### 5.5 — Hero gradient (quand showHeader=true)
```tsx
<LivingHero icon={Icon} title="Titre" subtitle="Description" gradient={headerGradient} count={42} />
```

### 5.6 — Layout DocForge (sidebar + contenu)
```tsx
<div className="flex gap-3">
  <div className={SF.sidebarW}>
    {items.map(item => (
      <button className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
        <item.icon className={isActive ? SF.iconActive : SF.iconInactive} />
        <span className={isActive ? SF.labelActive : SF.labelInactive}>{item.label}</span>
      </button>
    ))}
  </div>
  <div className={SF.content}>...</div>
</div>
```

---

## 6. TYPOGRAPHIE — Palette fixe

| Usage | Classe | Exemple |
|-------|--------|---------|
| Titre page | `text-lg font-bold` | "Playbook Store" |
| Titre section | `text-sm font-bold text-gray-800` | "Recommandés" |
| Titre card | `text-sm font-bold text-gray-900` | Nom playbook |
| Body | `text-xs text-gray-600` | Description |
| Sidebar nav | `text-[10px] font-bold` | "Catégories" |
| Badge | `text-[9px] font-bold` | "12 playbooks" |
| Meta | `text-[11px] text-gray-400` | "Dernière MAJ" |
| KPI value | `text-2xl font-bold` | "42" |
| KPI label | `text-[10px] text-gray-400 uppercase` | "CHANTIERS" |

**Tailles icônes:**
- `h-3.5 w-3.5` — sidebar, boutons, badges
- `h-4 w-4` — headers, cards
- `h-5 w-5` — headers importants
- `h-6 w-6` — hero icons

---

## 7. INTERDITS ABSOLUS

| Interdit | Raison | Alternative |
|----------|--------|-------------|
| `style={{}}` inline | Carl déteste | Classes Tailwind |
| Scroll horizontal | Carl déteste | `grid-cols-2/3` |
| Modales/popups | Carl déteste | Drill-down inline |
| Gradient header coloré sur section | Réservé aux états AMORCER | `from-gray-700 to-gray-600` |
| Tabs qui dédoublent des sections existantes | Carl a explosé S80 | Vérifier avant d'ajouter |
| Import direct SimAmorcer dans V3 | Architecture cassée | Via simulation/ maps |
| Import direct BlueprintDepartement dans V3 | Architecture cassée | Via sections/ individuels |
| Redéfinir SF, PHASE_CONFIG, DEPT_* | Duplication | Importer depuis core/ |
| Créer des fichiers en doublon | Carl perd confiance | Archiver l'ancien d'abord |
| `bg-slate-700` pour sub-tabs | Mauvais pattern | `bg-gray-900 text-white` |

---

## 8. COULEURS D'ÉTAT AMORCER — Réservées

**Les 7 couleurs AMORCER sont des INDICATEURS D'ÉTAT, JAMAIS décoratives.**

- Headers de sections = NEUTRES (`from-gray-700 to-gray-600` ou pastel `bg-[#00B4D8]/10`)
- Couleur d'état = dot, bordure gauche, ou badge — PAS gradient header
- Bots gardent leurs couleurs en secondaire (avatar ring, texte subtil)

---

## 9. GPS BACKEND — Alignement frontend↔backend

Chaque section a un GPS dans `section-registry.ts` aligné sur `FLOW_CONFIG` dans `agents.py`.

```typescript
// Frontend envoie:
{ active_view: "department", active_sub_section: "ventes" }

// Backend resolve:
resolve_flow_type("department", "ventes") → { flow_type: "data", bot_primaire: "CROB" }
```

**Groupes de sections:**
| Groupe | Nombre | GPS view |
|--------|--------|----------|
| departement | 12 | "department" |
| bureau | 6 | "espace-bureau" |
| plateforme | 9 | "cockpit" |
| orbit9 | 8 | "orbit9" |
| rooms | 3 | "board-room" / "war-room" / "think-room" |
| flows | 6 | Mixte |

---

## 10. CROSS-DÉPENDANCES entre sections

```
PlaybookStoreView.tsx
  ├── exporte: PLAYBOOK_STORE_DATA, PlaybookCardV2, CONFERENCE_FAMILIES, getPlaybookFamily
  └── importé par: ConferenceAIView.tsx

BlueprintView.tsx
  ├── exporte: BLUEPRINT_HEADER_TABS
  └── importé par: WorkspacePhasesPanel.tsx

sections/shared/dept-data.ts
  ├── exporte: DEPT_COLORS, DEPT_SHORT_LABEL, DEPT_FULL_LABEL, DEPT_GRADIENT, DEPT_DASH_ICON, DEPT_LABELS, OTHER_BOTS, PHASE_COLORS
  └── importé par: TOUTES les sections + constants.ts

sections/shared/LivingHero.tsx
  └── importé par: CockpitView, ChantierView, DataRoomView, PlaybookStoreView, ConferenceAIView
```

---

## 11. CHEMINS RELATIFS — Depuis v3/sections/

```
Vers core/         → "../core/styles"
Vers shared/       → "./shared/LivingHero"
Vers UI commun     → "../../components/ui/card"
Vers V2 API        → "../../v2/api/types"
Vers V2 context    → "../../v2/context/CanvasActionContext"
Vers V2 blueprint  → "../../v2/zones/center/blueprint/blueprint-config"
Vers V2 templates  → "../../v2/zones/center/blueprint/blueprint-templates"
```

---

## 12. BUILD & DEPLOY

```bash
# Build frontend (après CHAQUE modification)
cd ~/brain-dev/Interfacev1ghostxorbit9 && npx vite build

# Restart backend (après modif Python)
pkill -f "uvicorn api_rest"; cd ~/brain-dev && nohup python3 -m uvicorn api_rest:app --host 127.0.0.1 --port 8000 > /tmp/api_rest.log 2>&1 &

# Test backend
curl -s -H "X-API-Key: $GHOSTX_API_KEY" http://localhost:8000/api/v1/health

# Commit
cd ~/brain-dev/Interfacev1ghostxorbit9 && git add ... && git commit -m "..."

# DEV = dev.usinebleue.ai (VPS1) — TOUJOURS
# PROD = app.usinebleue.ai (VPS2) — JAMAIS sans GO de Carl
```

---

## 13. CHECKLIST AVANT CHAQUE EDIT V3

- [ ] J'ai lu ce document
- [ ] J'ai lu le fichier cible AVANT de le modifier
- [ ] J'ai lu le parent (si modification d'un enfant)
- [ ] J'importe depuis core/ et sections/ (pas SimAmorcer/BlueprintDepartement)
- [ ] J'utilise SF.* pour les styles sidebar (pas de valeurs inventées)
- [ ] J'utilise PHASE_CONFIG pour les couleurs de phase (pas PC)
- [ ] Sub-tabs = `bg-gray-900 text-white` actif / `text-gray-500` inactif
- [ ] Pas de style inline, pas de scroll horizontal, pas de modale
- [ ] Pas de section/tab qui dédouble ce qui existe
- [ ] `npx vite build` OK après modification

---

## 14. FICHIERS DE RÉFÉRENCE (à jour 2026-04-14)

| Fichier | Contenu |
|---------|---------|
| `docs/REFERENTIEL-DEV-V3.md` | **CE DOCUMENT** — référence unique V3 |
| `docs/PLAN-RESTRUCTURATION-V3.md` | Plan 7 étapes (historique) |
| `memory/design-system.md` | Patterns UI globaux (V2+V3) |
| `memory/code-propre-v3.md` | Règles code propre permanent |
| `docs/REGLES-DEV-REFERENTIEL.md` | Règles backend + hiérarchie chantiers |
| `docs/AUDIT-BACKEND-MAPPING.md` | Alignement sections↔FLOW_CONFIG |
| `docs/AUDIT-V3-SECTIONS.md` | Inventaire sections extraites |
