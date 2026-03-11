import { apiJson } from "@/lib/api";
import type { UploadResponse } from "@/types/project";

export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read file."));
    };
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.readAsDataURL(file);
  });

export const uploadAdminImage = async (
  file: File,
  folder: string,
) => {
  const dataUrl = await fileToDataUrl(file);
  return apiJson<UploadResponse>("/api/blob/upload", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      dataUrl,
      folder,
    }),
  });
};
