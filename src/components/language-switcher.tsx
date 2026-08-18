"use client";

import { useI18n } from "@/components/i18n-provider";
import { isLocale, supportedLocales } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="relative inline-flex">
      <select
        aria-label={`${t("language.label")}: ${t(`language.${locale}`)}`}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.currentTarget.value;

          if (isLocale(nextLocale)) {
            setLocale(nextLocale);
          }
        }}
        className="h-10 min-w-16 cursor-pointer appearance-none rounded-md border border-[#39454b] bg-[#1e1e26] py-0 pr-8 pl-3 text-sm font-medium text-transparent shadow-[0_8px_24px_rgba(0,0,0,0.18)] outline-none transition hover:border-[#525f66] hover:bg-[#252530] focus:border-[#28e5e5] focus:ring-2 focus:ring-[#28e5e5]/20"
      >
        {supportedLocales.map((optionLocale) => (
          <option
            key={optionLocale}
            value={optionLocale}
            className="bg-[#1e1e26] text-[#eeeeee]"
          >
            {t(`language.${optionLocale}`)}
          </option>
        ))}
      </select>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-[#eeeeee]"
      >
        {t(`language.${locale}.short`)}
      </span>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2"
        fill="none"
        viewBox="0 0 12 12"
      >
        <path
          d="m2.5 4.5 3.5 3 3.5-3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
