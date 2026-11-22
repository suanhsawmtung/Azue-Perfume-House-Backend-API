import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { ensureDir, getFilePath } from "../../../utils/file";
import {
  StorageCategory,
  StorageFile,
  StorageProvider,
  StorageResult,
} from "../storage.interface";

const uploadsRoot = getFilePath("uploads", "images");

const getSafeExtension = (originalName: string): string => {
  const extension = path.extname(originalName).toLowerCase();
  return /^[.][a-z0-9]{1,10}$/.test(extension) ? extension : ".bin";
};

const getCategoryDirectory = (category: StorageCategory): string => {
  const directory = path.resolve(uploadsRoot, category);
  const root = `${path.resolve(uploadsRoot)}${path.sep}`;

  if (!directory.startsWith(root)) {
    throw new Error("Invalid storage category.");
  }

  return directory;
};

const getSafeFilename = (filename: string, category: StorageCategory) => {
  const directory = getCategoryDirectory(category);
  const resolvedPath = path.resolve(directory, filename);

  if (!resolvedPath.startsWith(`${directory}${path.sep}`)) {
    throw new Error("Invalid local storage filename.");
  }

  return resolvedPath;
};

export class LocalStorageProvider implements StorageProvider {
  async uploadFile(
    file: StorageFile,
    category: StorageCategory,
  ): Promise<StorageResult> {
    if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
      throw new Error("A file buffer is required for local storage upload.");
    }

    const filename = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${getSafeExtension(file.originalName)}`;
    const directory = getCategoryDirectory(category);
    const filePath = getSafeFilename(filename, category);

    try {
      await ensureDir(directory);
      await fs.writeFile(filePath, file.buffer, { flag: "wx" });
      return {
        url: `/${category}/${filename}`,
        publicId: null,
      };
    } catch (error) {
      throw new Error("Local file upload failed.", { cause: error });
    }
  }

  async deleteFile(
    identifier: string,
    category: StorageCategory = "post",
  ): Promise<void> {
    const filename = path.basename(identifier);
    if (filename !== identifier || !filename) {
      throw new Error("Invalid local storage filename.");
    }

    try {
      await fs.unlink(getSafeFilename(filename, category));
    } catch (error) {
      throw new Error("Local file deletion failed.", { cause: error });
    }
  }
}
