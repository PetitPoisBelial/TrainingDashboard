export type NavigationIcon = "home" | "calendar" | "activity" | "chart";

export type NavigationItem = Readonly<{
  id: "home" | "plan" | "activities" | "insights";
  href: string;
  icon: NavigationIcon;
  secondaryPaths?: readonly string[];
}>;

export const navigationItems: readonly NavigationItem[] = [
  { id: "home", href: "/", icon: "home" },
  {
    id: "plan",
    href: "/plan",
    icon: "calendar",
    secondaryPaths: ["/workouts"],
  },
  { id: "activities", href: "/activities", icon: "activity" },
  { id: "insights", href: "/insights", icon: "chart" },
];

export function isNavigationItemActive(item: NavigationItem, pathname: string) {
  const paths = [item.href, ...(item.secondaryPaths ?? [])];
  return paths.some(
    (path) =>
      pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)),
  );
}
