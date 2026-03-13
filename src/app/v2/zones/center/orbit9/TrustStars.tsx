/**
 * TrustStars.tsx — Composant reutilisable affichage etoiles trust (F7)
 * Affiche le score trust (1-5 etoiles) + badge + count
 */

import { Star } from "lucide-react";
import { cn } from "../../../../components/ui/utils";

interface TrustStarsProps {
  score: number | null;
  count?: number;
  badge?: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  showCount?: boolean;
  className?: string;
}

const BADGE_COLORS: Record<string, string> = {
  nouveau: "bg-gray-100 text-gray-600",
  bronze: "bg-amber-100 text-amber-700",
  argent: "bg-gray-200 text-gray-700",
  or: "bg-yellow-100 text-yellow-700",
  platine: "bg-blue-100 text-blue-700",
};

const BADGE_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  platine: "Platine",
};

const SIZES = {
  sm: { star: "h-3.5 w-3.5", text: "text-[9px]", gap: "gap-0.5" },
  md: { star: "h-4 w-4", text: "text-xs", gap: "gap-0.5" },
  lg: { star: "h-5 w-5", text: "text-sm", gap: "gap-1" },
};

export function TrustStars({
  score,
  count = 0,
  badge = "nouveau",
  size = "md",
  showBadge = true,
  showCount = true,
  className,
}: TrustStarsProps) {
  const s = SIZES[size];
  const displayScore = score ?? 0;

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      {/* 5 etoiles */}
      <div className={cn("flex items-center", s.gap)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              s.star,
              i <= Math.round(displayScore)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>

      {/* Score numerique */}
      {displayScore > 0 && (
        <span className={cn("font-medium text-gray-700", s.text)}>
          {displayScore.toFixed(1)}
        </span>
      )}

      {/* Count */}
      {showCount && count > 0 && (
        <span className={cn("text-gray-400", s.text)}>
          ({count})
        </span>
      )}

      {/* Badge */}
      {showBadge && badge && badge !== "nouveau" && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-full font-medium",
          s.text,
          BADGE_COLORS[badge] || BADGE_COLORS.nouveau,
        )}>
          {BADGE_LABELS[badge] || badge}
        </span>
      )}
    </div>
  );
}

/**
 * TrustStarsInput — Version interactive pour saisir un score (1-5)
 */
interface TrustStarsInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function TrustStarsInput({
  value,
  onChange,
  size = "md",
  label,
}: TrustStarsInputProps) {
  const s = SIZES[size];

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className={cn("text-gray-600 min-w-[120px]", s.text)}>{label}</span>
      )}
      <div className={cn("flex items-center", s.gap)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                s.star,
                "cursor-pointer transition-colors",
                i <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
