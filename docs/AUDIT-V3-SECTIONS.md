# AUDIT V3 FRAME — Sections, Patterns, Structure
# Date: 2026-04-14 — Session d'analyse complète
# Objectif: Référentiel pour restructuration intelligente du frontend

---

## 1. ARCHITECTURE V3 ACTUELLE (6 fichiers, 1,340 lignes)

```
src/app/v3/
  FrameMasterAmorcer.tsx  [93]   — Root layout, 3 panels ResizablePanel
  AmorcerContext.tsx       [121]  — État partagé (phase, section, bot, orbit9)
  ControlTowerPanel.tsx    [583]  — Sidebar gauche (nav, bots, orbit9)
  DiscussionWindow.tsx     [203]  — Chat central par phase
  WorkspacePhasesPanel.tsx [233]  — Zone droite (sections, contenu dynamique)
  constants.ts             [113]  — Ré-exports depuis V2
```

### Layout 3 Zones
```
┌──────────────────────────────────────────────────────────────┐
│ Header h-14 — Brain Team logo + Icônes button               │
├──────────┬──────────────────┬────────────────────────────────┤
│ Zone 1   │ Zone 2           │ Zone 3                         │
│ 15%      │ 35%              │ 50%                            │
│ Control  │ Discussion       │ Workspace                      │
│ Tower    │ Window           │ Phases Panel                   │
│          │                  │                                │
│ Nav bots │ Chat par phase   │ Header pastel h-12             │
│ Orbit9   │ Input Claude AI  │ Section views                  │
│ Sections │ 3 modes comm     │ Orbit9 sections                │
│          │                  │ VueEnsemble                    │
│          │                  │ ReflexionMagazine              │
│          │                  │ ChantierDrillDown              │
├──────────┴──────────────────┴────────────────────────────────┤
```

### Cross-références V3 → V2 (8 imports)
| V3 Fichier | Import | Source V2 |
|------------|--------|-----------|
| AmorcerContext | PhaseKey type | SimAmorcer |
| WorkspacePhasesPanel | CanvasActionProvider | CanvasActionContext |
| WorkspacePhasesPanel | 12 composants + types | SimAmorcer |
| WorkspacePhasesPanel | 6 section views + constantes | BlueprintDepartement |
| DiscussionWindow | BotAvatar | simulation-components |
| DiscussionWindow | PC, TEAM, chats | SimAmorcer |
| constants.ts | BOT_NAME/ROLE/AVATAR etc | api/types |
| constants.ts | DEPT_SHORT_LABEL, DEPT_DASH_ICON | BlueprintDepartement |

---

## 2. LES 6 SECTION VIEWS (dans BlueprintDepartement.tsx)

### SF Constants — DNA partagé (ligne 183)
```typescript
const SF = {
  sidebarW: "w-[180px] shrink-0 space-y-0.5",
  btnBase: "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2",
  btnActive: "bg-blue-50 border border-blue-200 shadow-sm",
  btnInactive: "hover:bg-gray-50 border border-transparent",
  iconActive: "h-3.5 w-3.5 shrink-0 text-blue-500",
  iconInactive: "h-3.5 w-3.5 shrink-0 text-gray-400",
  labelActive: "text-[10px] font-bold flex-1 leading-tight text-blue-700",
  labelInactive: "text-[10px] font-bold flex-1 leading-tight text-gray-700",
  count: "text-[9px] text-gray-400",
  separator: "h-px bg-gray-100 mx-2 my-1.5",
  sectionLabel: "text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2.5 py-1",
  subBase: "w-full pl-6 pr-2.5 py-1 rounded-lg text-left text-[9px] cursor-pointer",
  subActive: "bg-blue-50 text-blue-700 font-bold",
  subInactive: "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium",
  toolbarWrap: "flex items-center gap-2 flex-wrap",
  searchWrap: "flex-1 min-w-[180px] relative",
  searchIcon: "h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
  searchInput: "w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white",
  select: "text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white",
  itemCount: "text-[9px] font-bold text-gray-500 whitespace-nowrap",
  content: "flex-1 min-w-0 space-y-3",
  gridContent: "grid grid-cols-2 gap-3",
};
```

### 2.1 CockpitView (L9815)
- **Structure**: LivingHero → Grid-cols-5 VITAA → Vedettes grid-cols-3 → Sidebar w-[180px] + Contenu grid-cols-2
- **State**: selectedDept, selectedBloc
- **Drill-down**: 1 niveau (bloc → CockpitBlocDetail)
- **Props**: embedded, initialDept, onAction

### 2.2 BlueprintView (L9982)
- **Structure**: Header gradient → Sub-tabs (5) → LivingHero → KPIs → Vedettes → Sidebar + Contenu
- **State**: tier, phase, headerView, activeSub, data, selectedDeptCode, expandedBpDepts, sectionGridView
- **Drill-down**: 2 niveaux (section → SubSectionContent, dept → BlueprintView recursive)
- **Props**: botCode, headerGradient, hideHeader, activeHeaderView, onHeaderViewChange, onStats
- **Sub-views**: blueprint, ca, comites, personnel, bot (via headerView)

### 2.3 DataRoomView (L4793)
- **Structure**: LivingHero → Sidebar w-[180px] (depts accordion + sections + transversal + templates) → Contenu (toolbar + list/cards/table)
- **State**: activeDept, expandedDepts, activeFolder, viewMode, searchQuery, sortField, sortDir, statusFilter, formatFilter, typeFilter
- **Drill-down**: 1 niveau (folder → documents)
- **Props**: botCode, headerGradient, showHeader

### 2.4 PlaybookStoreView (L7331)
- **Structure**: LivingHero → Vedettes grid-cols-3 → Sidebar w-[180px] (8 tabs expandables) → Contenu conditionnel
- **State**: activeView, selectedPlaybook, expandCategories, expandTypes, selectedCategorie, selectedType, selectedConferenceFamily, selectedCollection
- **Drill-down**: 1 niveau (playbook → PlaybookFicheDetailInline)
- **Props**: botCode, headerGradient, showHeader
- **Sub-views**: decouvrir, categorie, types, collections, conferenceai, installed, encours, historique, builder

### 2.5 ConferenceAIView (L7641)
- **Structure**: LivingHero → Vedettes grid-cols-3 → Sidebar w-[180px] (tabs expandables) → Contenu conditionnel
- **State**: activeView, selectedPlaybook, expandFamilies, expandDepts, selectedFamily, selectedDept
- **Drill-down**: 1 niveau (conference → ConfAIFicheDetail)
- **Props**: headerGradient, onNavigateToStore, botCode

### 2.6 ChantierView (L11821)
- **Structure**: LivingHero → Vedettes grid-cols-3 → Sidebar w-[180px] (depts + phases + sous-sections) → Contenu cascade
- **State**: selectedDept, level, selectedChantier/Projet/Mission, detailTache, searchTerm, filterPhase, sortKey, subViewMode
- **Drill-down**: 5 niveaux (chantier → projet → mission → tâche → détail)
- **Props**: botCode, showHeader, onAction

---

## 3. COMPOSANTS SIMAMORCER EXPORTÉS (20+)

### Pattern A: Header + Content Grid
- VueEnsemble — 5 VITAA KPIs + 3×3 grid de cards (Chantiers, Projets, Signaux, Missions, Industrie, Décisions, Activité, Réseau, Finances)

### Pattern B: DocForge Sidebar
- Orbit9BlueprintCollaboration — w-[180px] sidebar + 11 sections dynamiques
- ReflexionMagazine — TOC sidebar + sections magazine progressives

### Pattern C: Multi-Stage Chat
- ObservationChat, AttentionChat, ModerationChat, ReflexionChat, PlaceholderChat
- Chaque chat a typed/setTyped/advance/pc props

### Pattern D: Accordion Hierarchies
- ChantierDrillDown — Drill-down accordéon avec progress bars

### Orbit9 Sections (9):
- Orbit9SocialHome — Feed social + KPIs + Signaux + Cellule vedette
- Orbit9BlueprintCollaboration — DocForge 12 sections
- MesCellules — Grid cellules + drill-down détail
- VITAADashboard — Formule + comparaison seul/cellule
- MonProfilOrbit9 — Profil + métriques
- Orbit9Gouvernance — 4 sub-tabs (principes/rôles/timetokens/sortie)
- JumelageOrbit9 — Pipeline 5 étapes + matches
- PionniersOrbit9 — 9x9 grid + packages
- CreerCellulePage — Wizard création cellule

---

## 4. STRUCTURE FICHIERS COMPLÈTE

### Totaux
- **282 fichiers actifs** / 184,920 lignes
- **73 fichiers archivés** / 32,936 lignes
- **3 fichiers morts** (3,461 lignes à supprimer)

### God Files (RED ZONE — > 2,000 lignes)
| Fichier | Lignes | Problème |
|---------|--------|----------|
| BlueprintDepartement.tsx | 12,127 | Contient 6 sections + SF constants + LivingHero |
| SimAmorcer.tsx | 7,348 | 20+ composants + PhaseKey + mock data |
| MasterBibleVisuelleLivePage.tsx | 6,459 | 17 tabs bible visuelle |
| CenterZone.tsx | 625 | 77 imports — mega router |

### Fichiers morts (DEAD)
- blueprint-playbooks.ts (2,338 lignes) — jamais importé
- SimBrainTeamV3.tsx (1,082 lignes) — jamais importé
- atelier-types.ts (41 lignes) — jamais importé

### Duplications
- cahier-components.tsx ET simulation-components.tsx exportent: TypewriterText, BotAvatar, ThinkingAnimation, MultiConsultAnimation, SourcesList

---

## 5. PALETTE VISUELLE (design-system.md = 95% accurate)

### Grilles
- **grid-cols-3 gap-3** = défaut (52 occurrences)
- **grid-cols-2 gap-3** = paires (59 occurrences)
- **grid-cols-4 gap-3** = KPIs (23 occurrences)
- **grid-cols-5** = VITAA uniquement (6 occurrences)

### Icônes (lucide-react)
- **Taille standard**: h-3.5 w-3.5 (348 occurrences)
- **Header icons**: h-4 w-4 (155)
- **Feature icons**: h-5 w-5 (55)

### Couleurs
- UB_BLUE = #073E5A (header principal)
- UB_CYAN = #00B4D8 (accents, /10 pour pastel)
- 12 bots = chacun un gradient from-{color}-600 to-{color}-500
- 7 phases AMORCER = rouge/pink/bleu/orange/jaune/vert/emerald

### Cards
```
rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white
  Header: bg-[#00B4D8]/10 + icon + label + count badge
  Content: p-3 space-y-2
```

### Badges
```
Status: bg-{color}-100 text-{color}-700 px-1.5 py-0.5 rounded border text-[9px] font-bold
Bot:    bg-gradient-to-r from-{color}-600 to-{color}-500 text-white px-1.5 py-0.5 rounded text-[9px]
Type:   bg-{color}-50 text-{color}-700 border border-{color}-200 px-1.5 py-0.5 rounded text-[8px]
```

### Typographie
- Page title: text-lg font-bold
- Section title: text-sm font-bold text-gray-800
- Body: text-xs text-gray-600
- Secondary: text-[10px] text-gray-400
- KPI value: text-2xl font-bold
- Badges: text-[9px] font-bold

---

## 6. PROBLÈME SIMULATION (à résoudre)

### État actuel: V3 = wrapper mince autour de V2
- V3 importe directement les composants de SimAmorcer (simulation)
- V3 importe directement les section views de BlueprintDepartement
- Les mock data, les types PhaseKey, les constantes = tout dans V2
- **Résultat**: La simulation pollue le frame — impossible de distinguer structure réelle vs démo

### Imports simulation dans V3:
```
WorkspacePhasesPanel.tsx importe:
  - VueEnsemble (simulation — mock data)
  - ReflexionMagazine (simulation — mock data)
  - ChantierDrillDown (simulation — mock data)
  - 9 composants Orbit9 (simulation — mock data)
  - PC, UB_BLUE, ORBIT9_CELLULES (constantes mélangées)

DiscussionWindow.tsx importe:
  - ObservationChat, AttentionChat, etc. (simulation — mock conversations)
  - TEAM (mock team data)
```

### Ce qu'il faut séparer:
1. **Types/Constantes** (PhaseKey, PC, UB_BLUE, SF) → fichiers dédiés V3
2. **Mock Data** (KPIS, CHANTIERS, TEAM, ORBIT9_CELLULES) → dossier simulation/
3. **Composants réutilisables** (LivingHero, SF sidebar pattern) → shared/
4. **Section Views** (CockpitView, BlueprintView, etc.) → fichiers séparés hors BlueprintDepartement
