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

### 5.7 — Toolbar de classement (SF.toolbarWrap — UNE SEULE LIGNE)
**Source: ChantierView.tsx L1383-1407, OperationsView.tsx**
**TOUJOURS sur UNE SEULE LIGNE. JAMAIS space-y-2. JAMAIS séparer recherche et filtres.**
```tsx
import { SF } from "../core/styles";
import { Search, LayoutGrid, LayoutList, Table2 } from "lucide-react";

<div className={SF.toolbarWrap}>
  {/* 1. Recherche — flex-1 prend l'espace */}
  <div className={SF.searchWrap}>
    <Search className={SF.searchIcon} />
    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
      placeholder="Rechercher..." className={SF.searchInput} />
  </div>
  {/* 2. Filtre — adapté à la section (phase, cadence, type...) */}
  <select value={filterX} onChange={e => setFilterX(e.target.value)} className={SF.select}>
    <option value="all">Tous</option>
  </select>
  {/* 3. Tri — adapté à la section */}
  <select value={sortKey} onChange={e => setSortKey(e.target.value)} className={SF.select}>
    <option value="default">Tri par défaut</option>
    <option value="alpha">A → Z</option>
  </select>
  {/* 4. View mode (OPTIONNEL — si cards/list/table) */}
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
    {([
      { key: "cards" as const, icon: LayoutGrid, tip: "Cartes" },
      { key: "list" as const, icon: LayoutList, tip: "Liste" },
      { key: "table" as const, icon: Table2, tip: "Tableau" },
    ]).map(v => (
      <button key={v.key} onClick={() => setSubViewMode(v.key)} title={v.tip}
        className={cn("p-1.5 rounded-md cursor-pointer transition-colors",
          subViewMode === v.key ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>
        <v.icon className="h-3.5 w-3.5" />
      </button>
    ))}
  </div>
  {/* 5. Compteur — toujours à droite */}
  <span className={SF.itemCount}>{count} élément{count > 1 ? "s" : ""}</span>
</div>
```
**Classes SF toolbar (NE JAMAIS réécrire — core/styles.ts L40-45):**
- `SF.toolbarWrap` = `"flex items-center gap-2 flex-wrap"` — container UNE LIGNE
- `SF.searchWrap` = `"flex-1 min-w-[180px] relative"` — wrapper recherche
- `SF.searchIcon` = `"h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"`
- `SF.searchInput` = `"w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"`
- `SF.select` = `"text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white"`
- `SF.itemCount` = `"text-[9px] font-bold text-gray-500 whitespace-nowrap"`

### 5.8 — ChantierCard (card standard dans grid-cols-2)
**Source: ChantierView.tsx L484-514**
```tsx
<div className="group relative rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={onClick}>
  {/* Header bg-[#00B4D8]/10 */}
  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
    <TypeIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">{typeLabel}</span>
    <span className="text-sm font-bold text-gray-900 truncate flex-1">{title}</span>
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}>
      <span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}
    </span>
  </div>
  {/* Corps */}
  <div className="px-4 py-3 space-y-2">
    {description && <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{description}</p>}
    <ProgressMiniPhased value={progression} phase={phase} />
    <div className="flex items-center gap-3 text-[9px] text-gray-400">
      {subCount !== undefined && <span>{subCount} {subLabel}</span>}
      {assignee && <span>{assignee}</span>}
      {echeance && <span>{echeance}</span>}
    </div>
  </div>
  {onAction && <WorkActionsOverlay context={title} onAction={onAction} />}
</div>
```
**Grid:** `<div className={SF.gridContent}>` = `grid grid-cols-2 gap-3`

### 5.9 — EntityDetail Hero (grid-cols-5: 3+2)
**Source: ChantierView.tsx L541-616**
Quand on drill-down dans un élément (chantier/projet/mission/tâche/opération/processus/routine/étape):
```tsx
<div className="space-y-3">
  {/* Bouton retour */}
  <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
    <ChevronRight className="h-3.5 w-3.5 rotate-180" /> {backLabel}
  </button>

  {/* Hero grid-cols-5 */}
  <div className="grid grid-cols-5 gap-3">
    {/* Colonne 3/5 — gradient hero */}
    <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", gradient)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="relative p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5 text-white" />
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">{typeLabel}</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-white/15 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{phaseLabel}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
        {description && <p className="text-xs text-white/80 leading-relaxed line-clamp-3">{description}</p>}
        <div className="flex items-center gap-3 text-[10px] text-white/70">
          <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{progression}%</span>
          {echeance && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{echeance}</span>}
          {subCount && <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{subCount} {subTitle}</span>}
        </div>
        {/* WORK_ACTIONS boutons */}
        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
          {WORK_ACTIONS.map(wa => (
            <button key={wa.key} onClick={(e) => { e.stopPropagation(); onAction(wa.key, title); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
              <wa.icon className="h-3.5 w-3.5" /> {wa.label}
            </button>
          ))}
        </div>
      </div>
    </div>
    {/* Colonne 2/5 — détails card */}
    <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
        <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900">Détails</span>
      </div>
      <div className="px-4 py-3 space-y-1.5 flex-1">
        {/* Lignes: Phase, Progression, Responsable, Échéance, Mise à jour */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
          <span className="text-xs font-bold text-gray-700">{value}</span>
        </div>
      </div>
    </div>
  </div>
</div>
```
**Gradients par type:** chantier=`from-orange-500 to-amber-500`, projet=`from-blue-500 to-cyan-500`, mission=`from-green-500 to-emerald-500`, tâche=`from-violet-500 to-purple-500`
**Opérations:** opération=`from-slate-600 to-gray-500`, processus=`from-cyan-600 to-blue-500`, routine=`from-teal-600 to-emerald-500`, étape=`from-indigo-500 to-violet-500`

### 5.10 — SubElements list (sous-éléments dans EntityDetail)
**Source: ChantierView.tsx L618-646**
Après le hero, liste compacte des sous-éléments cliquables:
```tsx
<div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
    <SubIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
    <span className="text-sm font-bold text-gray-900">{subTypeLabel}</span>
    <span className="text-[9px] text-gray-400 ml-auto">{count}</span>
  </div>
  <div className="divide-y divide-gray-100">
    {items.map(item => (
      <div onClick={() => onSubItemClick(item.id)}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
        <SubIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.titre}</span>
        <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ips.badge)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", ips.dot)} />{ips.label}
        </span>
        <div className="w-20 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
        {item.subCount && <span className="text-[9px] text-gray-400 shrink-0">{item.subCount} {item.subLabel}</span>}
        <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
      </div>
    ))}
  </div>
</div>
```

### 5.11 — dBlocks (packing intelligent de blocs d'info)
**Source: ChantierView.tsx L648-1128**
Système de blocs d'information avec poids (w=1 petit, w=2 large) regroupés par zones sémantiques:

**Principe:**
1. Chaque bloc = `{ key: string; w: 1 | 2; node: ReactNode }`
2. Les blocs sont groupés par **zones sémantiques** (priorité d'affichage)
3. `packToRows()` remplit des rangées (capacité max 3), fusionne les solos w=2
4. `renderRow()` choisit le grid: `grid-cols-2` (2 blocs w=1 ou 2 blocs w=2), `grid-cols-3` (3 blocs w=1 ou w=1+w=2)

**Zone mapping (ordre d'affichage):**
```typescript
const zoneMap: Record<string, number> = {
  sante: 2, budget: 2, temps: 2,                    // Zone 2: KPIs & finances
  obj: 3, team: 3, raci: 3, risques: 3, livrables: 3, criteres: 3, // Zone 3: Équipe & objectifs
  jalons: 4, deps: 4, docs: 4,                      // Zone 4: Timeline & docs
  decisions: 5, conferences: 5, activites: 5,        // Zone 5: Historique
  retro: 6, instructions: 6,                         // Zone 6: Bilan
};
```

**Algorithme packToRows:**
```typescript
const packToRows = (blocks) => {
  const rows = []; let curRow = []; let curW = 0;
  for (const b of blocks) {
    if (curW + b.w > 3) {
      if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
      curRow = [b]; curW = b.w;
    } else { curRow.push(b); curW += b.w; }
  }
  if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
  // Merge consecutive solo w=2 rows into pairs
  const merged = [];
  let mi = 0;
  while (mi < rows.length) {
    const cur = rows[mi];
    if (cur.blocks.length === 1 && cur.blocks[0].w === 2
        && mi + 1 < rows.length && rows[mi+1].blocks.length === 1 && rows[mi+1].blocks[0].w === 2) {
      merged.push({ blocks: [cur.blocks[0], rows[mi+1].blocks[0]], totalW: 4 });
      mi += 2;
    } else { merged.push(cur); mi++; }
  }
  return merged;
};
```

**Algorithme renderRow:**
```typescript
const renderRow = (row, ri) => {
  const n = row.blocks.length;
  if (n === 2 && row.totalW === 4) return <div className="grid grid-cols-2 gap-3">...</div>;  // 2 blocs w=2 côte à côte
  if (n === 1) return <div>...</div>;                                                          // 1 bloc pleine largeur
  if (n === 2 && row.totalW === 2) return <div className="grid grid-cols-2 gap-3">...</div>;  // 2 blocs w=1
  if (n === 3) return <div className="grid grid-cols-3 gap-3">...</div>;                       // 3 blocs w=1
  if (n === 2 && row.totalW === 3) return <div className="grid grid-cols-3 gap-3">            // 1 bloc w=2 + 1 bloc w=1
    {row.blocks.map(b => <div className={b.w === 2 ? "col-span-2" : ""}>...</div>)}</div>;
  return <div className="grid grid-cols-2 gap-3">...</div>;                                    // fallback
};
```

**Bloc d'info standard (TOUS les blocs suivent ce pattern):**
```tsx
dBlocks.push({ key: "nomDuBloc", w: items.length > 3 ? 2 : 1, node: (
  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
      <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
      <span className="text-sm font-bold text-gray-900">{titre}</span>
      <span className="text-[9px] text-gray-400 ml-auto">{count}</span>
    </div>
    <div className="px-4 py-3 space-y-2">
      {/* contenu spécifique au bloc */}
    </div>
  </div>
)});
```
**RÈGLE w:** `w: items.length > X ? 2 : 1` — le bloc devient large quand il a beaucoup d'items

**Types de blocs disponibles (ChantierView):**
| key | w | Icône | Contenu |
|-----|---|-------|---------|
| obj | 1/2 | Target | Objectifs (list avec CheckCircle2) |
| team | 1/2 | Users | Équipe (avatars + rôles) |
| budget | 1 | DollarSign | Budget + progression |
| risques | 1/2 | AlertTriangle | Risques (list amber) |
| jalons | 2 | Calendar | Timeline jalons (dots + dates) |
| livrables | 1/2 | Package | Livrables attendus (CheckSquare) |
| docs | 1/2 | FileText | Documents liés (format badges colorés) |
| sante | 1 | Stethoscope | Score santé + tendance + KPIs |
| raci | 1/2 | Users | Matrice RACI (badges R/A/C/I colorés) |
| criteres | 1 | ClipboardCheck | Critères d'acceptation (checkboxes) |
| decisions | 2 | Gavel | Journal des décisions |
| deps | 1 | GitBranch | Dépendances (Lock/Route icons) |
| conferences | 1/2 | Video | Conférences AI (participants + résumé) |
| activites | 2 | ClipboardList | Logs d'activité (icônes par type) |
| retro | 2 | RotateCcw | Rétrospective (3 colonnes: positifs/négatifs/actions) |
| instructions | 2 | BookOpen | Instructions & contexte (tâche) |
| temps | 1 | Clock | Temps estimé vs réel (tâche) |

**Types de blocs supplémentaires (OperationsView):**
| key | w | Icône | Contenu |
|-----|---|-------|---------|
| optimisation | 1 | TrendingUp | Score optimisation + dernière revue |
| kpis | 1/2 | BarChart3 | KPIs/SLA cibles vs actuel |
| coutRecurrent | 1 | DollarSign | Coûts récurrents (mensuel/annuel) |
| sourceCapex | 1 | Briefcase | Source CAPEX (chantier d'origine) |
| bilanOptimisation | 2 | TrendingUp | Bilan d'optimisation (résumé) |
| checklist | 1 | ClipboardCheck | Checklist opérationnelle |
| historique | 1/2 | RefreshCw | Historique d'exécution (dernières 5) |

### 5.12 — SubElementsToolbar/List/Table (3 vues)
**Source: ChantierView.tsx L1130-1205**

**SubElementsToolbar** (sélecteur de vue):
```tsx
<div className="flex items-center gap-2 mb-2">
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
    {[
      { key: "cards", icon: LayoutGrid, tip: "Cartes" },
      { key: "list", icon: LayoutList, tip: "Liste" },
      { key: "table", icon: Table2, tip: "Tableau" },
    ].map(v => (
      <button key={v.key} onClick={() => onViewMode(v.key)} title={v.tip}
        className={cn("p-1.5 rounded-md cursor-pointer transition-colors",
          viewMode === v.key ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>
        <v.icon className="h-3.5 w-3.5" />
      </button>
    ))}
  </div>
  <div className="flex-1" />
  <span className={SF.itemCount}>{count} {label}</span>
</div>
```

**SubElementsList** (vue liste):
```tsx
<div className="space-y-1">
  {items.map(item => (
    <div onClick={item.onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
      <item.typeIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.title}</span>
      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", ps.badge)}>{ps.label}</span>
      <div className="w-16 shrink-0"><ProgressMiniPhased value={item.progression} /></div>
      {item.echeance && <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>}
    </div>
  ))}
</div>
```

**SubElementsTable** (vue tableau):
```tsx
<div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
  <table className="w-full text-xs">
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Nom</th>
        <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Phase</th>
        <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase w-24">Progression</th>
        <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Échéance</th>
        <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Assigné</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr onClick={item.onClick} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors">
          <td className="px-3 py-2 font-medium text-gray-900">{item.title}</td>
          <td className="px-3 py-2"><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", ps.badge)}>{ps.label}</span></td>
          <td className="px-3 py-2"><ProgressMiniPhased value={item.progression} /></td>
          <td className="px-3 py-2 text-gray-500">{item.echeance || "—"}</td>
          <td className="px-3 py-2 text-gray-500">{item.assignee || "—"}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### 5.13 — ProgressMiniPhased (barre de progression colorée par phase)
**Source: ChantierView.tsx L41-53**
```tsx
function ProgressMiniPhased({ value, phase }: { value: number; phase?: PhaseKey }) {
  const pct = Math.min(100, Math.max(0, value));
  const phaseColor = phase ? PHASE_COLORS[phase]?.dot : null;
  const fallback = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", phaseColor || fallback)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-bold text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
}
```

### 5.14 — WorkActionsOverlay (boutons d'action sur hover)
**Source: CockpitView.tsx — importé via `{ WorkActionsOverlay, WORK_ACTIONS }`**
```tsx
import { WorkActionsOverlay, WORK_ACTIONS } from "./CockpitView";

{/* Sur cards (apparaît au hover du parent .group) */}
<div className="group relative ...">
  {/* contenu card */}
  {onAction && <WorkActionsOverlay context={title} onAction={onAction} />}
</div>

{/* Sur hero (boutons inline, pas overlay) */}
<div className="flex items-center gap-1.5 pt-1 flex-wrap">
  {WORK_ACTIONS.map(wa => (
    <button key={wa.key} onClick={(e) => { e.stopPropagation(); onAction(wa.key, title); }}
      className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
      <wa.icon className="h-3.5 w-3.5" /> {wa.label}
    </button>
  ))}
</div>
```
**WORK_ACTIONS:** Réflexion (Brain), Conception (Hammer), Exécution (Rocket), Rétroaction (RotateCcw)

### 5.15 — Cockpit patterns (CockpitView.tsx)

**CockpitSectionHeader** — Titre de section curated (exporté, réutilisable)
```tsx
export function CockpitSectionHeader({ icon: Icon, title, count, color = "text-amber-500" }: {
  icon: React.ElementType; title: string; count?: number; color?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", color)} /> {title}
      </h3>
      {count !== undefined && <span className="text-[9px] text-gray-400">{count}</span>}
    </div>
  );
}
```

**CockpitCard** — Card box dans grid-cols-2 (même header bg-[#00B4D8]/10 que ChantierCard)
```tsx
<div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
  <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl",
    onHeaderClick && "cursor-pointer hover:bg-[#00B4D8]/20 transition-colors")} onClick={onHeaderClick}>
    <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{config.title}</span>
    {config.count !== undefined && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{config.count}</span>}
    {onHeaderClick && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
  </div>
  <ul className="py-1">
    {config.items.map((item, i) => <CockpitItemRow key={i} item={item} index={i} onAction={onAction} />)}
  </ul>
</div>
```

**CockpitItemRow** — Ligne d'item avec progression OU valeur OU texte simple
```tsx
<li className="group relative px-4 py-2 hover:bg-gray-50 transition-colors">
  <div className="flex items-center gap-2.5 text-xs text-gray-800">
    {showNumber && <span className="text-[10px] font-bold text-white bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{index + 1}</span>}
    {item.urgent && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
    <div className="flex-1 min-w-0">
      {/* 3 variantes: pct (progress bar), value (nombre), ou texte seul */}
      {item.pct !== undefined ? (
        /* Barre de progression + valeur % */
        <><div className="flex justify-between mb-0.5">
          <span className="font-medium">{item.primary}</span>
          <span className="font-bold">{item.pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", item.pctColor || "bg-blue-500")} style={{ width: `${item.pct}%` }} />
        </div></>
      ) : item.value ? (
        /* Valeur à droite */
        <><div className="flex justify-between">
          <span className="font-medium">{item.primary}</span>
          <span className={cn("font-bold", item.valueColor || "text-gray-700")}>{item.value}</span>
        </div>
        <p className="text-[11px] text-gray-400">{item.secondary}</p></>
      ) : (
        /* Texte simple */
        <><span className="font-medium">{item.primary}</span>
        {item.secondary && <p className="text-[11px] text-gray-400">{item.secondary}</p>}</>
      )}
    </div>
    {/* Phase badge */}
    {ps && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}>
      <span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}
    </span>}
  </div>
  {onAction && <WorkActionsOverlay context={item.primary} onAction={onAction} />}
</li>
```

**CockpitSignalCard** — Card vedette gradient (signaux "À porter attention")
```tsx
<div className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r", getSignalGradient(item))}>
  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
    {item.urgent && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", tag.classes)}>{tag.label}</span>
    {ps && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{ps.label}
    </span>}
  </div>
  <h4 className="text-sm font-bold text-white leading-tight">{item.primary}</h4>
  <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed">{item.secondary}</p>
  {onAction && <WorkActionsOverlay context={item.primary} onAction={onAction} position="top" />}
</div>
```
**Gradients signal (getSignalGradient):**
| Condition | Gradient |
|-----------|----------|
| urgent / "Alerte" | `from-red-600 to-red-500` |
| "Nouveau" | `from-emerald-600 to-emerald-500` |
| "Tendance"/"Info"/"Stable"/"Suivi" | `from-blue-600 to-blue-500` |
| "Étude"/"Requis" | `from-amber-600 to-amber-500` |
| fallback | `from-slate-600 to-slate-500` |

**Tags signal (getSignalTag):**
| Condition | Label | Classes |
|-----------|-------|---------|
| urgent / "Alerte" | "Alerte" | `bg-red-400/30 text-white` |
| "Nouveau" | "Opportunité" | `bg-emerald-400/30 text-white` |
| "Tendance" | "Tendance" | `bg-sky-400/30 text-white` |
| "Info"/"Stable"/"Suivi" | "Veille" | `bg-sky-400/30 text-white` |
| "Étude"/"Requis" | "À suivre" | `bg-amber-400/30 text-white` |
| fallback | "Veille" | `bg-white/15 text-white` |

**CockpitBlocDetail** — Drill-down détail d'un bloc (hero gradient + liste numérotée)
```tsx
<div className="space-y-3">
  <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
    <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour à la vue d'ensemble
  </button>
  {/* Hero compact gradient */}
  <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", deptGradient)}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
    <div className="relative p-4 space-y-2">
      <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
        <Icon className="h-5 w-5 text-white shrink-0" />{config.title}
      </h3>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] text-white/80"><ListChecks className="h-3.5 w-3.5" />{config.items.length} éléments</span>
        {/* + count, urgents, avgPct, phase badges */}
      </div>
    </div>
  </div>
  {/* Liste détaillée avec CockpitItemRow + showNumber */}
  <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
      <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
      <span className="text-sm font-bold text-gray-900 flex-1 truncate">Éléments — {config.title}</span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{config.items.length} items</span>
    </div>
    <ul className="divide-y divide-gray-100">
      {config.items.map((item, i) => <CockpitItemRow key={i} item={item} index={i} onAction={onAction} showNumber />)}
    </ul>
  </div>
</div>
```

### 5.16 — ControlTowerPanel patterns (ControlTowerPanel.tsx)

**TopBarCockpit** — Header bleu UB `bg-[#073E5A]` h-12
```tsx
<div className="h-12 flex items-center gap-2 px-3 shrink-0 bg-[#073E5A]">
  <img src="/logo-usine-bleue.png" alt="Usine Bleue" className="h-7 object-contain" />
  <div className="flex-1" />
  <div className="flex items-center gap-1.5">
    <div className="relative">
      <img src="/agents/carl-fugere.jpg" alt="Carl" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
    </div>
    <span className="text-[11px] text-white/80 max-w-28 truncate">Carl Fugère</span>
  </div>
</div>
```

**SectionBand** — Bandeau de section dans le sidebar (même bg-[#00B4D8]/10)
```tsx
<div className="mx-3 mt-2 px-3 py-1.5 flex items-center gap-2 rounded-t-xl bg-[#00B4D8]/10">
  <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
  <span className="text-sm font-bold text-gray-900">{label}</span>
</div>
```

**StateBadge** — Badge d'état (dot + label), même pattern que les phase badges
```tsx
<span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", STATE_TAG[state])}>
  <span className={cn("w-2 h-2 rounded-full", STATE_DOT[state])} />
  {STATE_LABEL[state]}
</span>
```

**MemberCard** — Carte membre avec avatar, rôle, action
```tsx
<div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
  <div className="flex items-center gap-2 px-2.5 py-2">
    <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
      <img src={member.photo} className="w-full h-full object-cover" />
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-[11px] font-semibold text-gray-800">{member.name}</span>
      <span className="text-[9px] text-gray-400 block truncate">{member.role} · {celluleName}</span>
    </div>
  </div>
  <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
    <span className="text-[11px] font-bold text-gray-600 truncate flex-1">Actif dans la cellule</span>
    <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer shrink-0">
      <MessageSquare className="h-3.5 w-3.5" />
    </button>
  </div>
</div>
```

**CelluleCard** — Carte cellule avec membres, type, état
```tsx
<div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
  <button onClick={onClick}
    className="flex items-center gap-2 w-full px-2.5 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors">
    <Network className="h-3.5 w-3.5 text-teal-500 shrink-0" />
    <span className="text-[11px] font-semibold text-gray-800 truncate flex-1">{cellule.name}</span>
    <StateBadge state={cellule.status} />
    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
  </button>
  <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
    <Users className="h-3.5 w-3.5 text-gray-400" />
    <span className="text-[9px] text-gray-500">{cellule.members}/{cellule.maxMembers}</span>
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
      cellule.type === "interne" ? "bg-teal-50 text-teal-600" : "bg-cyan-50 text-cyan-600")}>
      {cellule.type === "interne" ? "Interne" : "Externe"}
    </span>
    <div className="flex-1" />
    {/* Avatar stack (w-5 h-5, ring-1 ring-white) */}
  </div>
</div>
```

### 5.17 — LivingHero (LivingHero.tsx)

**Banner animé partagé par TOUTES les section views** (CockpitView, ChantierView, DataRoomView, PlaybookStoreView, ConferenceAIView)
```tsx
<div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm py-5 px-8 overflow-hidden min-h-[110px] flex items-center">
  {/* Blur backgrounds — 2 cercles flous pastel */}
  <div className={cn("absolute rounded-full blur-[100px] opacity-60", blur1)} style={{ top: '-50%', left: '-10%', width: '50%', height: '200%' }} />
  <div className={cn("absolute rounded-full blur-[120px] opacity-50", blur2)} style={{ bottom: '-50%', right: '10%', width: '60%', height: '200%' }} />
  {/* Grid pattern overlay */}
  <div className="absolute inset-0 bg-pattern-grid opacity-[0.35]" />
  {/* Illustration (children) — absolute right, scaled */}
  <div className={cn("absolute top-0 bottom-0 flex items-center transform origin-right pointer-events-none",
    scaleClass === "scale-[0.80]" ? "right-0 scale-[0.80]" : "right-[1rem] scale-[0.70]")}>
    {children}
  </div>
  {/* Text — left side, z-20, pr-[250px] to avoid illustration overlap */}
  <div className="relative z-20 w-full pr-[250px]">
    <p className={cn("uppercase tracking-widest text-[9px] font-bold mb-1", subtitleColor)}>{subtitle}</p>
    <h2 className="text-xl font-extrabold text-gray-900 mb-1">{title}</h2>
    <p className="text-slate-500 text-[12.5px] font-medium leading-snug">{description}</p>
  </div>
</div>
```
**Props:**
| Prop | Type | Exemple |
|------|------|---------|
| `blur1` | string | `"bg-sky-100/60"` (Cockpit), `"bg-fuchsia-100/60"` (ConferenceAI) |
| `blur2` | string | `"bg-blue-100/50"` (Cockpit), `"bg-violet-100/50"` (ConferenceAI) |
| `subtitleColor` | string | `"text-sky-600"`, `"text-fuchsia-600"` |
| `subtitle` | string | `"Centre de commande"`, `"Réunions intelligentes"` |
| `title` | string | Titre principal |
| `description` | string | Description sous le titre |
| `children` | ReactNode | Illustration SVG animée (optionnel) |

**CSS animations (injectées 1x via `injectHeroStyles()`):**
- Cockpit: `radar-scan`, `bar-grow`, `draw-curve`
- ConferenceAI: `packet-travel`, `wave-pulse`
- Blueprint: `org-pulse-root`, `org-pulse-child`, `flow-down`, `flow-across`
- DataRoom: `laser-scan`, `binary-fade`, `vault-lock-outer/inner`
- PlaybookStore: `trigger-node`, `trigger-pulse`, `flow-line`
- Chantiers: `block-rise`, `progress-slide`
- Orbit9: `celestial-spin`, `dot-alive`

### 5.18 — FrameMasterAmorcer (FrameMasterAmorcer.tsx)

**Root layout 3 zones redimensionnables** — accessible via `/amorcer`
```tsx
<AmorcerProvider>
  <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
    {/* Header h-14 — Brain Team logo + bouton Icônes */}
    <header className="shrink-0 h-14 border-b border-gray-200 flex items-center px-4 z-10 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
          <span className="text-white font-bold text-xs">BT</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">Brain Team</h1>
          <p className="text-[10px] text-gray-400">V3 — Amorcer</p>
        </div>
      </div>
    </header>
    {/* 3 Zones ResizablePanel */}
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>  {/* Zone 1: ControlTowerPanel */}
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>  {/* Zone 2: DiscussionWindow */}
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30} maxSize={65}>  {/* Zone 3: WorkspacePhasesPanel */}
    </ResizablePanelGroup>
  </div>
</AmorcerProvider>
```
**Tailles zones:** 15% sidebar + 35% chat + 50% workspace (redimensionnables)
**Composant:** `ui/resizable` (ResizablePanelGroup, ResizablePanel, ResizableHandle)

### 5.19 — PlaybookStore patterns (PlaybookStoreView.tsx)

**PlaybookCardV2** (exporté — card standard playbook dans grid-cols-2)
```tsx
<div className="relative rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail?.(pb)}>
  {/* Absolute corner badges (Bestseller/Trending/New) */}
  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
    <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
    {badgeEl}
  </div>
  <div className="px-4 py-3 space-y-2.5">
    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{pb.description}</p>
    <div className="flex items-center justify-between">
      {/* Bot pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {pb.bots.slice(0, 3).map(bot => <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{bot}</span>)}
      </div>
      {/* 5-star rating */}
      <div className="flex items-center gap-0.5">
        {stars} <span className="text-[10px] font-bold text-gray-700 ml-1">{pb.rating}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{prix}</span>
      <span className="text-[10px] text-gray-500">{pb.duree}</span>
      <span className="text-[10px] text-gray-500">{pb.etapes} etapes</span>
    </div>
  </div>
</div>
```
**Badges niveau:**
| Niveau | bg | text |
|--------|-----|------|
| Quick Win | `bg-emerald-50` | `text-emerald-700` |
| Standard | `bg-blue-50` | `text-blue-700` |
| Avancé | `bg-purple-50` | `text-purple-700` |
| Enterprise | `bg-amber-50` | `text-amber-700` |

**PlaybookFicheDetailInline** — Drill-down détail (PAS de modal)
- Bouton retour `text-xs text-blue-600` avec `ChevronRight rotate-180`
- Hero `grid-cols-5` (3+2) — **MÊME PATTERN que EntityDetail Hero 5.9**
- Section 2: Workflow étapes (numérotées, divide-y)
- Section 3: Bots (avatars + rôles)
- Section 4: Pilier VITAA (badge coloré)
- Section 5: Livrables (FileText icon + type badge)
- Section 6: Avis (rating distribution + reviews)
- Section 7: Playbooks similaires (grid-cols-3, bg-gray-50)

**PlaybookDecouvrir** — Homepage du Store
- Toolbar 2 lignes: ligne 1 = recherche pleine largeur (`SF.searchWrap`), ligne 2 = filtres + tri + view mode + count
- **NOTE: PlaybookStore utilise 2 lignes de toolbar (exception au pattern SF.toolbarWrap 1 ligne) car il a 4+ filtres**
- Sections curated: Bestsellers, Nouveautés, Gratuits populaires, Collections vedettes, Départements, Types
- Section helper `SectionRow` = titre `text-xs font-bold` + `PlaybookMultiView`
- Collections vedettes: `grid-cols-2`, Card avec `bg-gradient-to-r` header
- Départements: `grid-cols-3`, card avec avatar + count + rating
- Types: `grid-cols-3`, card avec header gradient coloré

**Bandeau info (PATTERN COMMUN — PlaybookStore, ConferenceAI, DataRoom):**
```tsx
<div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
  <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
  <span className="text-[9px] text-blue-700">{texte info}</span>
</div>
```

### 5.20 — ConferenceAI patterns (ConferenceAIView.tsx)

**Layout** = LivingHero + Top 3 gradient cards + sidebar DocForge + contenu dynamique

**Top 3 Conferences** — `grid-cols-3`, cartes gradient (même pattern que PlaybookStore Top 3)
```tsx
<div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow", gradient)} onClick={() => handleOpenDetail(pb)}>
  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
  <div className="relative p-4">
    {/* Rank badge, niveau badge, prix badge */}
    <h4 className="text-sm font-bold text-white leading-tight">{pb.nom}</h4>
    {/* Description, rating stars, stats, 2 boutons (Découvrir + Prévisualiser) */}
  </div>
</div>
```

**Sidebar + Contenu** — Layout DocForge `SF.sidebarW` + `flex-1 min-w-0 space-y-2`
- Sidebar items: Accueil, Récentes, Planifiées, Catégories (expandable), Départements (expandable), Playbook Store (external link)
- Expandable sub-items: même pattern `SF.subBase`/`SF.subActive`/`SF.subInactive`

**ConfAIAccueil** — 4 sections curated
1. Les plus utilisées: `grid-cols-2`, cards `bg-[#00B4D8]/10` header + bouton "Lancer" `bg-emerald-50 text-emerald-700`
2. Lancement rapide: `grid-cols-3`, cards compactes avec bouton Lancer
3. Explorer par catégorie: `grid-cols-3`, cards avec description + badge count coloré
4. Explorer par département (CEOB only): `grid-cols-3`, cards avec avatar

**ConfAIRecentes** — Liste sessions passées
```tsx
<div className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
  <div className="flex-1 min-w-0">
    <span className="text-xs font-bold text-gray-800 block truncate">{name}</span>
    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">{date} {duree} {participants} {livrables}</div>
  </div>
  <button className="... bg-gray-50 ..."><Eye /> Voir</button>
  <button className="... bg-emerald-50 text-emerald-700 ..."><RotateCcw /> Relancer</button>
</div>
```

**ConfAIPlanifiees** — Sessions futures (état vide avec icône `Calendar h-8 w-8 text-gray-300`)

**ConfAIFicheDetail** — Drill-down inline (même hero grid-cols-5 que 5.9 avec boutons Lancer/Planifier)

### 5.21 — DataRoom patterns (DataRoomView.tsx)

**AssetTypeBadge** — Badge type d'actif coloré
```tsx
<span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium", config.bg, config.color)}>
  <Icon className="h-3.5 w-3.5" />{config.label}
</span>
```
| Type | bg | color | icon |
|------|-----|-------|------|
| Document | `bg-blue-50` | `text-blue-700` | FileText |
| Dashboard | `bg-violet-50` | `text-violet-700` | BarChart3 |
| Flow | `bg-orange-50` | `text-orange-700` | Zap |
| Dataset | `bg-emerald-50` | `text-emerald-700` | Database |
| Media | `bg-pink-50` | `text-pink-700` | Palette |
| Procédure | `bg-teal-50` | `text-teal-700` | ListChecks |

**DataRoom 3 view modes** (cards/list/table) — même sélecteur que 5.12 SubElementsToolbar
- **Table view**: sortable column headers avec `SortTh` (ArrowUp/ArrowDown/ArrowUpDown), hover action button `opacity-0 group-hover:opacity-100`
- **Cards view**: `grid-cols-2`, header coloré par type d'actif, badges format+statut, hover action
- **List view**: `space-y-0.5`, rows avec dot status + icon + badges + hover action + ChevronRight

**Badges statut document:**
| Statut | bg | text | label |
|--------|-----|------|-------|
| actif | `bg-emerald-50` | `text-emerald-700` | "Actif" |
| brouillon | `bg-amber-50` | `text-amber-700` | "Brouillon" |
| a_creer | `bg-gray-100` | `text-gray-600` | "À créer" |

**DataRoomTemplatesList** — Navigateur de templates
- KPI row: `grid-cols-4` (Total, DocForge, Catégories, Nouveaux) — rounded-lg border bg-white
- Filtres catégorie: pills `rounded-full` toggle active `bg-gray-900 text-white` / inactive `bg-white text-gray-500`
- Template cards: `grid-cols-2`, header `bg-[#00B4D8]/10`, badges catégorie + phases
- Template detail drill-down: header `bg-[#00B4D8]/10` h-5, grid-cols-3 détails, boutons "Ouvrir dans DocForge" + "Télécharger"

**DataRoomView** — Section complète
- Layout DocForge: sidebar départements (expandable `ChevronDown`) + folders par département
- Vue consolidée: KPIs + DataRoomDocsList flat (tous docs du département)
- Vue dossier: Documents du folder sélectionné
- Transversal sections: Clients, Employés, Fournisseurs
- REAI folders: Admin (0), Intrants (10), Design (20), Fournisseurs (30), Livrables (40)

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
