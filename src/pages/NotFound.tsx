import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "es";

  return (
    <PageLayout>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-8xl text-foreground mb-4">404</h1>
          <p className="font-body text-lg text-muted-foreground mb-8">
            {t("notFound.message")}
          </p>
          <Link
            to={`/${lang}`}
            className="font-body text-sm uppercase tracking-[0.2em] border border-foreground/30 px-8 py-3 text-foreground hover:bg-foreground/10 transition-colors"
          >
            {t("notFound.backToHome")}
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
