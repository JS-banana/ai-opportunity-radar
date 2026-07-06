import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "./locales";
import { messagesFor } from "./messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: messagesFor(locale),
  };
});
