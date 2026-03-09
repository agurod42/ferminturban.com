import { Navigate } from "react-router-dom";

const getPreferredLang = (): "es" | "en" => {
  const stored = localStorage.getItem("lang");
  if (stored === "en" || stored === "es") return stored;

  const browserLang = navigator.language || "es";
  if (browserLang.startsWith("en")) return "en";

  return "es";
};

const LanguageRedirect = () => {
  return <Navigate to={`/${getPreferredLang()}`} replace />;
};

export default LanguageRedirect;
