import path from "path";
import { env } from "../../config/env";
import { LocalStorageProvider } from "./providers/local.provider";
import { StorageCategory } from "./storage.interface";
import { StorageService } from "./storage.service";

export const deleteStoredFile = async (
  value: string | null | undefined,
  publicId: string | null | undefined,
  category: StorageCategory,
) => {
  if (publicId) {
    if (env.storageProvider === "r2") {
      // Deletion is cleanup, not part of the request's durable write. Do not
      // make API responses wait on an unavailable R2 endpoint.
      void new StorageService().deleteFile(publicId, category).catch((error) => {
        console.warn("R2 image cleanup failed:", error);
      });
      return;
    }

    await new StorageService().deleteFile(publicId, category);
    return;
  }

  if (!value || /^https?:\/\//i.test(value)) {
    return;
  }

  await new LocalStorageProvider().deleteFile(path.basename(value), category);
};
