import { Outlet, useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LangLayout = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const valid = lang === "en" || lang === "es";

  useEffect(() => {
    if (valid && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    if (valid) {
      document.documentElement.lang = lang!;
      localStorage.setItem("lang", lang!);
    }
  }, [lang, i18n, valid]);

  if (!valid) {
    return <Navigate to="/es" replace />;
  }

  return <Outlet />;
};

export default LangLayout;
