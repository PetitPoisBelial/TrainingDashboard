"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  locales,
  localeCookie,
  switchLocaleHref,
  type Locale,
} from "@/i18n/locales";
import styles from "./language-switcher.module.css";

function rememberLanguage(locale: Locale) {
  document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function changeLanguage(next: Locale) {
    if (next === locale) return;
    rememberLanguage(next);
    startTransition(() =>
      router.replace(switchLocaleHref(location.href, next), { scroll: false }),
    );
  }
  return (
    <div
      className={styles.switcher}
      role="group"
      aria-label={label}
      aria-busy={pending}
    >
      {locales.map((value) => (
        <button
          key={value}
          type="button"
          lang={value}
          aria-label={value === "fr" ? "Français" : "English"}
          aria-pressed={locale === value}
          disabled={pending}
          onClick={() => changeLanguage(value)}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
