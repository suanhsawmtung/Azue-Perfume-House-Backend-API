/// <reference types="jest" />

import { v2 as cloudinary } from "cloudinary";
import { cloudinaryFolders } from "../../config/cloudinary";
import { deleteImage, uploadImage } from "./cloudinary.service";

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}), { virtual: true });

const mockedCloudinary = cloudinary as any;

describe("Cloudinary media service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: "test-cloud",
      CLOUDINARY_API_KEY: "test-key",
      CLOUDINARY_API_SECRET: "test-secret",
    };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("uploads an image buffer and returns secure URL and public ID", async () => {
    mockedCloudinary.uploader.upload_stream.mockImplementation(
      (_options: unknown, callback: Function) => {
        const stream = { end: jest.fn() };
        callback(null, {
          secure_url: "https://res.cloudinary.com/test/image/upload/example.jpg",
          public_id: "azue/products/example",
        });
        return stream;
      },
    );

    await expect(
      uploadImage(Buffer.from("image"), cloudinaryFolders.products),
    ).resolves.toEqual({
      secure_url: "https://res.cloudinary.com/test/image/upload/example.jpg",
      public_id: "azue/products/example",
    });
    expect(mockedCloudinary.config).toHaveBeenCalledWith({
      cloud_name: "test-cloud",
      api_key: "test-key",
      api_secret: "test-secret",
      secure: true,
    });
  });

  test("reports failed image uploads", async () => {
    mockedCloudinary.uploader.upload_stream.mockImplementation(
      (_options: unknown, callback: Function) => {
        callback(new Error("upload unavailable"), undefined);
        return { end: jest.fn() };
      },
    );

    await expect(uploadImage(Buffer.from("image"))).rejects.toThrow(
      "Cloudinary image upload failed.",
    );
  });

  test("deletes an image successfully", async () => {
    mockedCloudinary.uploader.destroy.mockResolvedValue({ result: "ok" });

    await expect(deleteImage("azue/products/example")).resolves.toBeUndefined();
    expect(mockedCloudinary.uploader.destroy).toHaveBeenCalledWith(
      "azue/products/example",
      { resource_type: "image", invalidate: true },
    );
  });

  test("reports failed image deletions", async () => {
    mockedCloudinary.uploader.destroy.mockRejectedValue(
      new Error("delete unavailable"),
    );

    await expect(deleteImage("azue/products/example")).rejects.toThrow(
      "Cloudinary image deletion failed.",
    );
  });

  test("reports missing Cloudinary configuration", async () => {
    delete process.env.CLOUDINARY_API_SECRET;

    await expect(deleteImage("azue/products/example")).rejects.toThrow(
      "Cloudinary configuration is missing.",
    );
    expect(mockedCloudinary.uploader.destroy).not.toHaveBeenCalled();
  });
});
