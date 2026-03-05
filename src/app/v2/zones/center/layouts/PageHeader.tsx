/**
 * PageHeader.tsx — Header standard pour les vues canvas
 * Back button + icône + titre + sous-titre + slot droite (tabs/actions)
 *
 * Usage:
 *   <PageLayout header={<PageHeader icon={LayoutGrid} title="Mon Blue Print" onBack={...} tabs={...} />}>
 *
 * Sprint — Protocol Carl / Layout Standardisation
 */

import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export function PageHeader({
  icon: Icon,
  iconColor = "text-blue-600",
  title,
  subtitle,
  onBack,
  rightSlot,
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <div>
          <div className="text-sm font-bold text-gray-800">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </div>
      {rightSlot && <div className="flex gap-1 ml-auto">{rightSlot}</div>}
    </div>
  );
}
