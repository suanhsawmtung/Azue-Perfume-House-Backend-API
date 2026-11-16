import { Request } from "express";
import { getFilePath, removeFile } from "./file";
import { StorageService } from "../services/storage/storage.service";

export interface UploadedFileInfo {
  identifier: string;
  category: "post" | "product" | "user" | "order";
  provider: string;
  localPath?: string;
}

// Track uploaded file in request
export const trackUploadedFile = (
  req: Request,
  fileInfo: UploadedFileInfo,
): UploadedFileInfo => {
  if (!(req as any).uploadedFiles) {
    (req as any).uploadedFiles = [];
  }
  (req as any).uploadedFiles.push(fileInfo);
  return fileInfo;
};

// Clean up all tracked uploaded files
export const cleanupUploadedFiles = async (req: Request) => {
  const uploadedFiles = (req as any).uploadedFiles as UploadedFileInfo[];
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return;
  }

  for (const fileInfo of uploadedFiles) {
    if (fileInfo.localPath) {
      await removeFile(fileInfo.localPath);
    }

    if (fileInfo.provider !== "local" && fileInfo.identifier) {
      try {
        await new StorageService().deleteFile(
          fileInfo.identifier,
          fileInfo.category,
        );
      } catch (error) {
        console.warn(error);
      }
    }
  }

  // Clear the tracked files
  (req as any).uploadedFiles = [];
};

// Clean up a specific uploaded file
export const cleanupUploadedFile = async (
  filename: string,
  subDir: string = ""
) => {
  const filePath = getFilePath("uploads", "images", subDir, filename);
  await removeFile(filePath);
};
