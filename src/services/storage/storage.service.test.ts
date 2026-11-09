/// <reference types="jest" />

import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env";
import { CloudinaryStorageProvider } from "./providers/cloudinary.provider";
import { LocalStorageProvider } from "./providers/local.provider";
import { createStorageProvider } from "./storage.factory";
import { StorageService } from "./storage.service";

jest.mock("./cloudinary.service", () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
}));

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
  },
}), { virtual: true });

import { deleteImage, uploadImage } from "./cloudinary.service";

describe("storage providers", () => {
  const originalEnv = process.env;
  const originalStorageProvider = env.storageProvider;

  afterEach(() => {
    process.env = originalEnv;
    env.storageProvider = originalStorageProvider;
    jest.clearAllMocks();
  });

  test("uploads and deletes a local file with a static-compatible result", async () => {
    const provider = new LocalStorageProvider();
    const result = await provider.uploadFile(
      {
        buffer: Buffer.from("file contents"),
        originalName: "../../unsafe.png",
        mimeType: "image/png",
      },
      "user",
    );
    const filename = path.basename(result.url);

    expect(result).toEqual({ url: `/user/${filename}`, publicId: null });
    expect(await fs.readFile(path.join(process.cwd(), "uploads/images/user", filename))).toEqual(
      Buffer.from("file contents"),
    );

    await provider.deleteFile(filename, "user");
    await expect(
      fs.access(path.join(process.cwd(), "uploads/images/user", filename)),
    ).rejects.toThrow();
  });

  test("rejects unsafe local deletion paths", async () => {
    await expect(
      new LocalStorageProvider().deleteFile("../secret", "user"),
    ).rejects.toThrow("Invalid local storage filename.");
  });

  test("delegates Cloudinary upload and deletion and returns the common result", async () => {
    (uploadImage as jest.Mock).mockResolvedValue({
      secure_url: "https://res.cloudinary.com/test/image/upload/file.jpg",
      public_id: "azue/products/file",
    });
    (deleteImage as jest.Mock).mockResolvedValue(undefined);
    const provider = new CloudinaryStorageProvider();

    await expect(
      provider.uploadFile(
        { buffer: Buffer.from("file"), originalName: "file.jpg", mimeType: "image/jpeg" },
        "product",
      ),
    ).resolves.toEqual({
      url: "https://res.cloudinary.com/test/image/upload/file.jpg",
      publicId: "azue/products/file",
    });
    await expect(provider.deleteFile("azue/products/file")).resolves.toBeUndefined();
    expect(uploadImage).toHaveBeenCalledWith(
      Buffer.from("file"),
      "azue/products",
    );
    expect(deleteImage).toHaveBeenCalledWith("azue/products/file");
  });

  test("surfaces provider upload and deletion failures", async () => {
    (uploadImage as jest.Mock).mockRejectedValue(new Error("upload failed"));
    (deleteImage as jest.Mock).mockRejectedValue(new Error("delete failed"));
    const provider = new CloudinaryStorageProvider();

    await expect(
      provider.uploadFile(
        { buffer: Buffer.from("file"), originalName: "file.jpg", mimeType: "image/jpeg" },
        "post",
      ),
    ).rejects.toThrow("upload failed");
    await expect(provider.deleteFile("azue/blogs/file")).rejects.toThrow(
      "delete failed",
    );
  });

  test("selects the configured provider and rejects unsupported values", async () => {
    env.storageProvider = "local";
    expect(createStorageProvider()).toBeInstanceOf(LocalStorageProvider);

    env.storageProvider = "unsupported";
    expect(() => createStorageProvider()).toThrow(
      "Unsupported storage provider: unsupported.",
    );
  });

  test("uses the selected provider through StorageService", async () => {
    env.storageProvider = "local";
    const service = new StorageService();
    expect(service).toBeInstanceOf(StorageService);
  });
});
