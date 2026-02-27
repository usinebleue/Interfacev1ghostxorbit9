/**
 * DashboardTile.tsx — Pastille dashboard Tour de Controle
 * Layout horizontal : avatar a gauche, titre + sommaire a droite
 * Concu pour grille 3 colonnes — cartes substantielles
 * Sprint A — Frame Master V2
 */

import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";

interface Props {
  title: string;
  emoji: string;
  summary: string;
  onClick?: () => void;
  badge?: string;
  className?: string;
  avatar?: string;
  bandColor?: string;
  titleColor?: string;
}

export function DashboardTile({
  title,
  emoji,
  summary,
  onClick,
  badge,
  className,
  avatar,
  bandColor,
  titleColor,
}: Props) {
  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {/* Bande couleur identitaire */}
      {bandColor && <div className={cn("h-1.5", bandColor)} />}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar ou emoji */}
          {avatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 shrink-0">
              <img src={avatar} alt={title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="text-2xl shrink-0 mt-0.5">{emoji}</span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn("text-sm font-semibold", titleColor)}>
                {title}
              </h3>
              {badge && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
