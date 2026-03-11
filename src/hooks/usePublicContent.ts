import { useContext } from "react";
import { PublicContentContext } from "@/lib/public-content";

export const usePublicContent = () => {
  const context = useContext(PublicContentContext);

  if (!context) {
    throw new Error("usePublicContent must be used within PublicContentProvider");
  }

  return context;
};
