import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { createR2Client, getR2Config } from "../../../config/r2";
import {
  StorageCategory,
  StorageFile,
  StorageProvider,
  StorageResult,
} from "../storage.interface";

const getSafeExtension = (originalName: string): string => {
  const extension = path.extname(originalName).toLowerCase();
  return /^[.][a-z0-9]{1,10}$/.test(extension) ? extension : ".bin";
};

export class R2StorageProvider implements StorageProvider {
  private readonly config = getR2Config();
  private readonly client = createR2Client(this.config);

  async uploadFile(
    file: StorageFile,
    category: StorageCategory,
  ): Promise<StorageResult> {
    if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
      throw new Error("A file buffer is required for R2 upload.");
    }

    const filename = `${Date.now()}-${crypto.randomUUID()}${getSafeExtension(file.originalName)}`;
    const key = `${category}/${filename}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimeType,
        }),
      );

      return {
        url: `${this.config.publicUrl}/${key}`,
        publicId: key,
      };
    } catch (error) {
      throw new Error("R2 file upload failed.", { cause: error });
    }
  }

  async deleteFile(
    identifier: string,
    _category?: StorageCategory,
  ): Promise<void> {
    if (typeof identifier !== "string" || !identifier.trim()) {
      throw new Error("An R2 object key is required for deletion.");
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucketName,
          Key: identifier,
        }),
      );
    } catch (error) {
      throw new Error("R2 file deletion failed.", { cause: error });
    }
  }
}
