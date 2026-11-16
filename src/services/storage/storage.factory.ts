import { env } from "../../config/env";
import { StorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./providers/local.provider";
import { R2StorageProvider } from "./providers/r2.provider";

export const createStorageProvider = (): StorageProvider => {
  switch (env.storageProvider) {
    case "local":
      return new LocalStorageProvider();

    case "cloudinary":
      // Load Cloudinary only when explicitly selected so local/R2 startup does
      // not require Cloudinary's optional runtime dependency tree.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { CloudinaryStorageProvider } = require("./providers/cloudinary.provider");
      return new CloudinaryStorageProvider();

    case "r2":
      return new R2StorageProvider();

    default:
      throw new Error(
        `Unsupported storage provider: ${env.storageProvider}. Supported providers are local, cloudinary, and r2.`,
      );
  }
};
