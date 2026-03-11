import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";
import { PublicContentProvider } from "./lib/public-content";

createRoot(document.getElementById("root")!).render(
  <PublicContentProvider>
    <App />
  </PublicContentProvider>,
);
