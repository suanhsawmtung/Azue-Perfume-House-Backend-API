import { env } from "../../config/env";
import { StorageProvider } from "./storage.interface";
import { CloudinaryStorageProvider } from "./providers/cloudinary.provider";
import { LocalStorageProvider } from "./providers/local.provider";

export const createStorageProvider = (): StorageProvider => {
  switch (env.storageProvider) {
    case "local":
      return new LocalStorageProvider();

    case "cloudinary":
      return new CloudinaryStorageProvider();

    default:
      throw new Error(
        `Unsupported storage provider: ${env.storageProvider}. Supported providers are local and cloudinary.`,
      );
  }
};
