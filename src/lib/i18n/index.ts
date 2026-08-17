import { en, type MessageKey } from "./en";
import { zh } from "./zh";

export const supportedLocales = ["en", "zh"] as const;

export type Locale = (typeof supportedLocales)[number];
export type TranslationValues = Record<string, number | string>;
export type Translate = (
  key: MessageKey,
  values?: TranslationValues,
) => string;

export class TranslatedError extends Error {
  constructor(readonly messageKey: MessageKey) {
    super(en[messageKey]);
    this.name = "TranslatedError";
  }
}

const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, zh };

export function isLocale(value: string | null): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getTranslator(locale: Locale): Translate {
  return (key, values) => {
    const message = dictionaries[locale][key];

    if (!values) {
      return message;
    }

    return message.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
      name in values ? String(values[name]) : placeholder,
    );
  };
}

export function getHtmlLang(locale: Locale) {
  return locale === "zh" ? "zh-CN" : "en";
}
