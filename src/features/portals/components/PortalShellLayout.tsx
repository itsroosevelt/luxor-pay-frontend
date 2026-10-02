'use client';

import type { ReactNode } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import type { NavSection } from '@/features/dashboard/components/Sidebar';
import type { PortalTarget } from '@/features/portals/lib/portal-sso';
import type { PortalNavItem, PortalNavSection } from '@/features/portals/components/PortalNav';

export function PortalShellLayout({
  sections,
  navItems,
  children,
}: {
  current?: PortalTarget['key'];
  portalName?: string;
  navItems?: PortalNavItem[];
  sections?: PortalNavSection[];
  ctaLabel?: string;
  ctaHref?: string;
  children: ReactNode;
}) {
  const customSections: NavSection[] = sections
    ? sections.map((sec) => ({
        title: sec.title,
        items: sec.items.map((item) => {
          if (item.kind === 'group') {
            return {
              kind: 'group',
              id: item.id,
              label: item.label,
              icon: item.icon,
              children: item.children.map((child) => ({
                href: child.href,
                label: child.label,
                icon: child.icon,
                external: child.external,
              })),
            };
          }
          return {
            kind: 'link',
            href: item.href,
            label: item.label,
            icon: item.icon,
            external: item.external,
          };
        }),
      }))
    : navItems
    ? [
        {
          items: navItems.map((item) => {
            if (item.kind === 'group') {
              return {
                kind: 'group',
                id: item.id,
                label: item.label,
                icon: item.icon,
                children: item.children.map((child) => ({
                  href: child.href,
                  label: child.label,
                  icon: child.icon,
                  external: child.external,
                })),
              };
            }
            return {
              kind: 'link',
              href: item.href,
              label: item.label,
              icon: item.icon,
              external: item.external,
            };
          }),
        },
      ]
    : [];

  return (
    <DashboardShell customSections={customSections.length > 0 ? customSections : undefined}>
      {children}
    </DashboardShell>
  );
}
