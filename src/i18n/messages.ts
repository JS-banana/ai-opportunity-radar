import type { Locale } from "./locales";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

export function messagesFor(locale: Locale) {
  return locale === "zh" ? zh : en;
}
