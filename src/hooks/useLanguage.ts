import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from "react";
import { getProjectSlug, getProjectByLocalizedSlug } from "@/data/projects";

export type Lang = "es" | "en";

// Route segment translations per language
const routeMap: Record<Lang, Record<string, string>> = {
  es: {
    advertising: "publicidad",
    documentary: "documental",
    about: "sobre-mi",
    project: "proyecto",
  },
  en: {
    advertising: "advertising",
    documentary: "documentary",
    about: "about-me",
    project: "project",
  },
};

// Build reverse map: segment → canonical key
const reverseMap: Record<string, string> = {};
for (const lang of ["es", "en"] as Lang[]) {
  for (const [key, val] of Object.entries(routeMap[lang])) {
    reverseMap[val] = key;
  }
}

export const getRouteSegment = (lang: Lang, key: string) =>
  routeMap[lang][key] || key;

export const getCanonicalKey = (segment: string) =>
  reverseMap[segment] || segment;

export const useLanguage = () => {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang: Lang = langParam === "en" ? "en" : "es";
  const { i18n, t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang, i18n]);

  /** Generate a localized path: localePath("/advertising") → "/es/publicidad" */
  const localePath = useCallback(
    (canonicalPath: string) => {
      return `/${lang}${canonicalPath}`;
    },
    [lang]
  );

  /** Get route segment for current language */
  const route = useCallback(
    (key: string) => getRouteSegment(lang, key),
    [lang]
  );

  /** Build a project detail path */
  const projectPath = useCallback(
    (project: { slug: string; slugEn?: string; title: string; category: string }) => {
      const segment = getRouteSegment(lang, "project");
      const slug = getProjectSlug(project, lang);
      return `/${lang}/${segment}/${slug}`;
    },
    [lang]
  );

  /** Get the equivalent URL in the other language */
  const switchUrl = useCallback(() => {
    const targetLang: Lang = lang === "es" ? "en" : "es";
    const parts = location.pathname.split("/").filter(Boolean);

    if (parts.length <= 1) {
      return `/${targetLang}`;
    }

    const segment = parts[1];
    const canonicalKey = getCanonicalKey(segment);
    const newSegment = getRouteSegment(targetLang, canonicalKey);

    if (parts.length === 2) {
      return `/${targetLang}/${newSegment}`;
    }

    // Project detail: translate slug
    if (canonicalKey === "project" && parts[2]) {
      const project = getProjectByLocalizedSlug(parts[2], lang);
      const newSlug = project ? getProjectSlug(project, targetLang) : parts[2];
      return `/${targetLang}/${newSegment}/${newSlug}`;
    }

    return `/${targetLang}/${newSegment}/${parts.slice(2).join("/")}`;
  }, [lang, location.pathname]);

  /** Category path helper */
  const categoryPath = useCallback(
    (category: "publicidad" | "documental") => {
      const key = category === "publicidad" ? "advertising" : "documentary";
      return `/${lang}/${getRouteSegment(lang, key)}`;
    },
    [lang]
  );

  return { lang, t, localePath, route, projectPath, switchUrl, categoryPath };
};
