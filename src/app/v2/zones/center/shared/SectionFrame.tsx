/**
 * SectionFrame.tsx — Frame unifie pour Strategique / Mon Bureau / Mon Reseau
 * Squelette reutilisable: PageHeader + Tabs + Breadcrumb (optionnel) + KPI bar (optionnel) + Content
 */

import { cn } from "../../../../components/ui/utils";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import type { TabDef, KPIConfig, BreadcrumbItem } from "./section-types";
import { KPICard, Breadcrumb } from "./SectionComponents";

interface SectionFrameProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack?: () => void;
  breadcrumb?: BreadcrumbItem[];
  kpis?: KPIConfig[];
  children: React.ReactNode;
  maxWidth?: "2xl" | "4xl" | "5xl";
}

export function SectionFrame({
  title,
  subtitle,
  icon,
  iconColor = "text-blue-600",
  tabs,
  activeTab,
  onTabChange,
  onBack,
  breadcrumb,
  kpis,
  children,
  maxWidth = "4xl",
}: SectionFrameProps) {
  return (
    <PageLayout
      maxWidth={maxWidth}
      showPresence={false}
      header={
        <PageHeader
          icon={icon}
          iconColor={iconColor}
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          rightSlot={
            <div className="flex items-center gap-1 flex-wrap">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-colors",
                      activeTab === tab.id
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          }
        />
      }
    >
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} />
      )}

      {/* KPI Bar */}
      {kpis && kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Content */}
      {children}
    </PageLayout>
  );
}
