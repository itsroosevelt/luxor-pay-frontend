'use client';

import { cn } from '@/lib/cn';

export interface SettingsTabItem {
  id: string;
  label: string;
}

interface SettingsTabBarProps {
  tabs: readonly SettingsTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function SettingsTabBar({ tabs, activeTab, onTabChange, className }: SettingsTabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Preference sections"
      className={cn('flex flex-wrap gap-1 border-b border-[var(--dash-border)]', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`comm-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`comm-panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-3 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2',
              isActive
                ? 'border-[var(--dash-accent)] text-[var(--dash-text)]'
                : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-[var(--dash-border)]'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
