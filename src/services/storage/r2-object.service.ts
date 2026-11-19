import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createR2Client, getR2Config, R2Config } from "../../config/r2";

export interface R2Object {
  key: string;
}

const normalizePrefix = (prefix: string): string => {
  const normalized = prefix.trim().replace(/^\/+|\/+$/g, "");

  if (!normalized) {
    throw new Error("An R2 object prefix is required.");
  }

  return `${normalized}/`;
};

export class R2ObjectService {
  private readonly client: S3Client;
  private readonly config: R2Config;

  constructor(client?: S3Client, config: R2Config = getR2Config()) {
    this.config = config;
    this.client = client || createR2Client(config);
  }

  async listPrefix(prefix: string): Promise<R2Object[]> {
    const normalizedPrefix = normalizePrefix(prefix);
    const objects: R2Object[] = [];
    let continuationToken: string | undefined;

    try {
      do {
        const response = await this.client.send(
          new ListObjectsV2Command({
            Bucket: this.config.bucketName,
            Prefix: normalizedPrefix,
            ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
          }),
        );

        for (const object of response.Contents || []) {
          if (object.Key) {
            objects.push({ key: object.Key });
          }
        }

        if (!response.IsTruncated) {
          break;
        }

        if (!response.NextContinuationToken) {
          throw new Error("R2 returned a truncated listing without a continuation token.");
        }

        continuationToken = response.NextContinuationToken;
      } while (true);

      return objects;
    } catch (error) {
      throw new Error(`R2 prefix listing failed for "${normalizedPrefix}".`, {
        cause: error,
      });
    }
  }

  async deletePrefix(prefix: string): Promise<number> {
    const objects = await this.listPrefix(prefix);

    try {
      for (let index = 0; index < objects.length; index += 1000) {
        const batch = objects.slice(index, index + 1000);

        await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.config.bucketName,
            Delete: {
              Objects: batch.map((object) => ({ Key: object.key })),
              Quiet: true,
            },
          }),
        );
      }

      return objects.length;
    } catch (error) {
      throw new Error(`R2 prefix deletion failed for "${normalizePrefix(prefix)}".`, {
        cause: error,
      });
    }
  }

  async deleteObjects(keys: string[]): Promise<number> {
    try {
      for (let index = 0; index < keys.length; index += 1000) {
        const batch = keys.slice(index, index + 1000);
        if (batch.length === 0) continue;
        await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.config.bucketName,
            Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
          }),
        );
      }
      return keys.length;
    } catch (error) {
      throw new Error("R2 object deletion failed.", { cause: error });
    }
  }

  async getObject(key: string): Promise<Buffer> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({ Bucket: this.config.bucketName, Key: key }),
      );
      if (!response.Body || !("transformToByteArray" in response.Body)) {
        throw new Error(`R2 object "${key}" has no readable body.`);
      }
      return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
      throw new Error(`R2 object read failed for "${key}".`, { cause: error });
    }
  }

  async putObject(key: string, body: Buffer): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: key,
          Body: body,
          ContentType: "application/json",
        }),
      );
    } catch (error) {
      throw new Error(`R2 object write failed for "${key}".`, { cause: error });
    }
  }

  async copyPrefix(sourcePrefix: string, destinationPrefix: string): Promise<number> {
    const normalizedSourcePrefix = normalizePrefix(sourcePrefix);
    const normalizedDestinationPrefix = normalizePrefix(destinationPrefix);
    const objects = await this.listPrefix(normalizedSourcePrefix);
    let copiedCount = 0;

    try {
      for (const object of objects) {
        const relativeKey = object.key.slice(normalizedSourcePrefix.length);
        const destinationKey = `${normalizedDestinationPrefix}${relativeKey}`;

        await this.client.send(
          new CopyObjectCommand({
            Bucket: this.config.bucketName,
            CopySource: `${this.config.bucketName}/${object.key}`,
            Key: destinationKey,
          }),
        );

        copiedCount += 1;
      }

      return copiedCount;
    } catch (error) {
      throw new Error(
        `R2 prefix copy failed from "${normalizedSourcePrefix}" to "${normalizedDestinationPrefix}" after ${copiedCount} object(s).`,
        { cause: error },
      );
    }
  }
}
