export type NavigationIcon = "home" | "calendar" | "activity" | "chart";

export type NavigationItem = Readonly<{
  label: string;
  href: string;
  icon: NavigationIcon;
  secondaryPaths?: readonly string[];
}>;

export const navigationItems: readonly NavigationItem[] = [
  { label: "Accueil", href: "/", icon: "home" },
  {
    label: "Plan",
    href: "/plan",
    icon: "calendar",
    secondaryPaths: ["/workouts"],
  },
  { label: "Activités", href: "/activities", icon: "activity" },
  { label: "Analyses", href: "/insights", icon: "chart" },
];

export function isNavigationItemActive(item: NavigationItem, pathname: string) {
  const paths = [item.href, ...(item.secondaryPaths ?? [])];
  return paths.some(
    (path) =>
      pathname === path ||
      (path !== "/" && pathname.startsWith(`${path}/`)),
  );
}
