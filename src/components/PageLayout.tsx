import { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import PageTransition from "./PageTransition";
import pageTexture from "@/assets/page-texture.jpg";

interface PageLayoutProps {
  children: ReactNode;
  showTexture?: boolean;
}

const PageLayout = ({ children, showTexture = true }: PageLayoutProps) => {
  return (
    <PageTransition>
      <div className="grain-overlay min-h-screen relative">
        {showTexture && (
          <div
            className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url(${pageTexture})` }}
          />
        )}
        <SiteHeader />
        <main className="relative z-10">{children}</main>
        <SiteFooter />
      </div>
    </PageTransition>
  );
};

export default PageLayout;
