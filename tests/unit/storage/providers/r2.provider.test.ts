/// <reference types="jest" />

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../../../src/config/env";
import { R2StorageProvider } from "../../../../src/services/storage/providers/r2.provider";

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  PutObjectCommand: jest
    .fn()
    .mockImplementation((input: unknown) => ({ input })),
  DeleteObjectCommand: jest
    .fn()
    .mockImplementation((input: unknown) => ({ input })),
}));

const mockedS3Client = S3Client as unknown as jest.Mock;
const mockedPutObjectCommand = PutObjectCommand as unknown as jest.Mock;
const mockedDeleteObjectCommand = DeleteObjectCommand as unknown as jest.Mock;

const validR2Env = {
  R2_ACCOUNT_ID: "account-id",
  R2_ACCESS_KEY_ID: "access-key",
  R2_SECRET_ACCESS_KEY: "secret-key",
  R2_BUCKET_NAME: "azue-perfume-house",
  R2_PUBLIC_URL: "https://cdn.example.com///",
};

const originalR2Config = { ...env.r2 };

const getClient = () =>
  mockedS3Client.mock.results[0]?.value as { send: jest.Mock };

describe("R2 storage provider", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...validR2Env };
    env.r2 = {
      accountId: validR2Env.R2_ACCOUNT_ID,
      accessKeyId: validR2Env.R2_ACCESS_KEY_ID,
      secretAccessKey: validR2Env.R2_SECRET_ACCESS_KEY,
      bucketName: validR2Env.R2_BUCKET_NAME,
      publicUrl: validR2Env.R2_PUBLIC_URL,
    };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
    env.r2 = originalR2Config;
  });

  test("uploads a buffer with the correct bucket, key, and content type", async () => {
    const provider = new R2StorageProvider();
    const client = getClient();
    client.send.mockResolvedValue({});

    const result = await provider.uploadFile(
      {
        buffer: Buffer.from("image"),
        originalName: "bottle.jpg",
        mimeType: "image/jpeg",
      },
      "product",
    );

    const commandInput = mockedPutObjectCommand.mock.calls[0]?.[0] as {
      Bucket: string;
      Key: string;
      Body: Buffer;
      ContentLength: number;
      ContentType: string;
    };

    expect(mockedS3Client).toHaveBeenCalledWith({
      endpoint: "https://account-id.r2.cloudflarestorage.com",
      region: "auto",
      credentials: {
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
      },
      maxAttempts: 4,
    });
    expect(commandInput.Bucket).toBe("azue-perfume-house");
    expect(commandInput.Key).toMatch(/^product\/[0-9]+-[0-9a-f-]+\.jpg$/);
    expect(commandInput.Body).toEqual(Buffer.from("image"));
    expect(commandInput.ContentLength).toBe(Buffer.byteLength("image"));
    expect(commandInput.ContentType).toBe("image/jpeg");
    expect(client.send).toHaveBeenCalledWith({ input: commandInput });
    expect(result).toEqual({
      url: `https://cdn.example.com/${commandInput.Key}`,
      publicId: commandInput.Key,
    });
  });

  test("deletes an object using its R2 key", async () => {
    const provider = new R2StorageProvider();
    const client = getClient();
    client.send.mockResolvedValue({});

    await expect(
      provider.deleteFile("post/example.jpg"),
    ).resolves.toBeUndefined();

    expect(mockedDeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: "azue-perfume-house",
      Key: "post/example.jpg",
    });
    expect(client.send).toHaveBeenCalledWith({
      input: { Bucket: "azue-perfume-house", Key: "post/example.jpg" },
    });
  });

  test("rejects missing R2 configuration", () => {
    env.r2.secretAccessKey = "";

    expect(() => new R2StorageProvider()).toThrow(
      /R2 configuration is missing[\s\S]*R2_SECRET_ACCESS_KEY/,
    );
  });

  test("wraps SDK upload failures", async () => {
    const provider = new R2StorageProvider();
    const client = getClient();
    client.send.mockRejectedValue(new Error("upload unavailable"));

    await expect(
      provider.uploadFile(
        {
          buffer: Buffer.from("image"),
          originalName: "image.png",
          mimeType: "image/png",
        },
        "post",
      ),
    ).rejects.toThrow("R2 file upload failed.");
  });

  test("wraps SDK deletion failures", async () => {
    const provider = new R2StorageProvider();
    const client = getClient();
    client.send.mockRejectedValue(new Error("delete unavailable"));

    await expect(provider.deleteFile("user/example.png")).rejects.toThrow(
      "R2 file deletion failed.",
    );
  });
});
