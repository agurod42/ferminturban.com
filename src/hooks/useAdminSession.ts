import { useContext } from "react";
import { AdminSessionContext } from "@/lib/admin/session-context";

export const useAdminSession = () => {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error("useAdminSession must be used within AdminSessionProvider.");
  }

  return context;
};
