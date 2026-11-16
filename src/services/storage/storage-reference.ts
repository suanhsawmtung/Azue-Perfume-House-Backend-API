import path from "path";
import { LocalStorageProvider } from "./providers/local.provider";
import { StorageCategory } from "./storage.interface";
import { StorageService } from "./storage.service";

export const deleteStoredFile = async (
  value: string | null | undefined,
  publicId: string | null | undefined,
  category: StorageCategory,
) => {
  if (publicId) {
    await new StorageService().deleteFile(publicId, category);
    return;
  }

  if (!value || /^https?:\/\//i.test(value)) {
    return;
  }

  await new LocalStorageProvider().deleteFile(path.basename(value), category);
};
