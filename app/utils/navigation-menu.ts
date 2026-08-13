import type { SidebarNavigationItemUi } from "~/common/types";

export const sidebarNavigationMenuUi = {
  root: "gap-1",
  link: "h-11 gap-2.5 rounded-lg px-3 text-sm transition-colors",
  linkLeadingIcon: "size-4.5 transition-colors",
} as const;

export const activeSidebarNavigationItemUi = {
  link: "bg-surface-purple-subtle text-primary hover:bg-surface-purple-subtle hover:text-primary",
  linkLeadingIcon: "text-primary group-hover:text-primary",
} satisfies SidebarNavigationItemUi;

export const inactiveSidebarNavigationItemUi = {
  link: "text-text-secondary hover:bg-surface-purple-subtle/70 hover:text-foreground",
  linkLeadingIcon: "text-text-muted group-hover:text-text-secondary",
} satisfies SidebarNavigationItemUi;

export function getSidebarNavigationItemUi(
  isActive: boolean,
): SidebarNavigationItemUi {
  return isActive
    ? activeSidebarNavigationItemUi
    : inactiveSidebarNavigationItemUi;
}
