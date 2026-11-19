import { createStorageProvider } from "./storage.factory";
import {
  StorageCategory,
  StorageFile,
  StorageResult,
} from "./storage.interface";

export class StorageService {
  private provider = createStorageProvider();

  async uploadFile(
    file: StorageFile,
    category: StorageCategory,
  ): Promise<StorageResult> {
    return this.provider.uploadFile(file, category);
  }

  async deleteFile(
    identifier: string,
    category?: StorageCategory,
  ): Promise<void> {
    await this.provider.deleteFile(identifier, category);
  }
}
