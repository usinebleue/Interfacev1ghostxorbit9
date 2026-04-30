/**
 * styles.ts — Constantes de style partagées V3 Frame Amorcer
 *
 * COPIE EXACTE de SF depuis BlueprintDepartement.tsx L183-208
 * RÈGLE: JAMAIS écrire ces classes de mémoire.
 * TOUJOURS importer SF depuis ce fichier.
 */

// ═══ SF — Section Frame DNA (source: BlueprintDepartement L183-208) ═══
export const SF = {
  // Sidebar
  sidebarW: "w-[180px] shrink-0 space-y-0.5",

  // Boutons sidebar
  btnBase: "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2",
  btnActive: "bg-blue-50 border border-blue-200 shadow-sm",
  btnInactive: "hover:bg-gray-50 border border-transparent",

  // Icônes sidebar
  iconActive: "h-3.5 w-3.5 shrink-0 text-blue-500",
  iconInactive: "h-3.5 w-3.5 shrink-0 text-gray-400",

  // Labels sidebar
  labelActive: "text-[10px] font-bold flex-1 leading-tight text-blue-700",
  labelInactive: "text-[10px] font-bold flex-1 leading-tight text-gray-700",
  count: "text-[9px] text-gray-400",

  // Séparateurs et sections
  separator: "h-px bg-gray-100 mx-2 my-1.5",
  sectionLabel: "text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2.5 py-1",

  // Sous-items sidebar
  subBase: "w-full pl-6 pr-2.5 py-1 rounded-lg text-left text-[9px] cursor-pointer",
  subActive: "bg-blue-50 text-blue-700 font-bold",
  subInactive: "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium",
  subIcon: "h-3.5 w-3.5 shrink-0",
  chevron: "h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform",

  // Toolbar
  toolbarWrap: "flex items-center gap-2 flex-wrap",
  searchWrap: "flex-1 min-w-[180px] relative",
  searchIcon: "h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
  searchInput: "w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white",
  select: "text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white",
  itemCount: "text-[9px] font-bold text-gray-500 whitespace-nowrap",

  // View-mode toggle (cards/list/table)
  viewToggleWrap: "flex items-center gap-2 mb-2",
  viewToggleGroup: "flex items-center gap-1 bg-gray-100 rounded-lg p-0.5",
  viewToggleBtnActive: "p-1.5 rounded-md cursor-pointer transition-colors bg-white shadow-sm text-gray-900",
  viewToggleBtnInactive: "p-1.5 rounded-md cursor-pointer transition-colors text-gray-400 hover:text-gray-600",
  viewToggleIcon: "h-3.5 w-3.5",

  // List-mode row
  listRow: "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer group",

  // Table-mode
  tableWrap: "rounded-xl border border-gray-200 overflow-hidden bg-white",
  tableFull: "w-full text-xs",
  tableHead: "bg-gray-50 border-b border-gray-200",
  tableTh: "text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase",
  tableTr: "border-b border-gray-100 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors",
  tableTd: "px-3 py-2",

  // Contenu
  content: "flex-1 min-w-0 space-y-3",
  gridContent: "grid grid-cols-2 gap-3",
} as const;

// ═══ Card standard (source: design-system.md) ═══
export const CARD_BASE = "rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white";
export const CARD_HEADER = "bg-[#00B4D8]/10";

// ═══ Header pastel workspace ═══
export const UB_PASTEL_HEADER = "bg-[#00B4D8]/[0.12]";
