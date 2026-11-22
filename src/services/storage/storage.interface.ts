export const storageCategories = ["post", "product", "user", "order"] as const;

export type StorageCategory = (typeof storageCategories)[number];

export interface StorageFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StorageResult {
  url: string;
  publicId: string | null;
}

export interface StorageProvider {
  uploadFile(file: StorageFile, category: StorageCategory): Promise<StorageResult>;
  deleteFile(identifier: string, category?: StorageCategory): Promise<void>;
}
