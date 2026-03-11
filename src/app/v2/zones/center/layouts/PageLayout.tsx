/**
 * PageLayout.tsx — Wrapper unique pour TOUTES les vues canvas
 * Changer le padding ICI = change partout automatiquement
 *
 * 5 types de pages canvas:
 * 1. GRILLE (5xl)  — Dashboard, TRG, Cockpit, Santé, Réglages
 * 2. CONTENU (4xl) — Bureau, Blueprint, Scénarios, Orbit9, Rooms, Chantiers
 * 3. CHAT (2xl)    — Discussions
 * 4. ROOM (4xl)    — ThinkRoom, WarRoom, BoardRoom
 * 5. FOCUS         — FocusModeLayout (son propre composant)
 *
 * Sprint — Protocol Carl / Layout Standardisation
 */

import { CarlOSPresence } from "../CarlOSPresence";

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: "2xl" | "4xl" | "5xl";
  showPresence?: boolean;
  header?: React.ReactNode;
  spacing?: string;
}

export function PageLayout({
  children,
  maxWidth = "4xl",
  showPresence = false,
  header,
  spacing = "space-y-4",
}: PageLayoutProps) {
  const maxWidthClass = {
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[maxWidth];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {header && (
        <div className="bg-white border-b px-4 py-3 shrink-0">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {showPresence && <CarlOSPresence />}
        <div className={`${maxWidthClass} mx-auto px-10 py-5 ${spacing} pb-12`}>
          {children}
        </div>
      </div>
    </div>
  );
}
