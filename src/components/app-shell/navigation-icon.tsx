import type { NavigationIcon as IconName } from "./navigation-items";

const paths: Record<IconName, string> = {
  home: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2M7 14h2m6 0h2m-10 4h2",
  activity: "M2 12h5l3-8 4 16 3-8h5",
  chart: "M4 3v18h17M8 16l4-5 4 2 5-7",
};

export function NavigationIcon({ name }: { name: IconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
