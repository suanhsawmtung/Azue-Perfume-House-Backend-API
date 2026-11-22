import fs from "fs/promises";
import path from "path";
import { env } from "../../../src/config/env";
import {
  R2_IMAGE_PREFIXES,
  resetR2ImagePrefixes,
} from "../../../src/services/storage/r2-image-seeder";

describe("resetR2ImagePrefixes", () => {
  const originalStorageProvider = env.storageProvider;

  beforeEach(() => {
    env.storageProvider = "r2";
  });

  afterEach(() => {
    env.storageProvider = originalStorageProvider;
  });

  it("deletes destinations before copying both source prefixes", async () => {
    const events: string[] = [];
    const objectService = {
      listPrefix: jest.fn(async (prefix: string) => {
        events.push(`list:${prefix}`);
        return [{ key: `${prefix}image.png` }];
      }),
      deletePrefix: jest.fn(async (prefix: string) => {
        events.push(`delete:${prefix}`);
        return 1;
      }),
      deleteObjects: jest.fn(async () => 0),
      getObject: jest.fn(async () => Buffer.from("[]")),
      putObject: jest.fn(async () => undefined),
      copyPrefix: jest.fn(async (source: string, destination: string) => {
        events.push(`copy:${source}->${destination}`);
        return 1;
      }),
    };

    await expect(resetR2ImagePrefixes(objectService as any)).resolves.toEqual({
      product: 1,
      post: 1,
      order: 1,
    });

    expect(events.slice(0, 3)).toEqual([
      "list:product-seeder/",
      "list:post-seeder/",
      "delete:order/",
    ]);
    const productListIndex = events.indexOf("list:product/");
    const postListIndex = events.indexOf("list:post/");
    const productCopyIndex = events.indexOf("copy:product-seeder/->product/");
    const postCopyIndex = events.indexOf("copy:post-seeder/->post/");
    expect(productListIndex).toBeLessThan(productCopyIndex);
    expect(postListIndex).toBeLessThan(postCopyIndex);
    expect(events.indexOf("delete:order/")).toBeLessThan(productCopyIndex);
    expect(events.indexOf("delete:order/")).toBeLessThan(postCopyIndex);
    expect(objectService.deletePrefix).not.toHaveBeenCalledWith(
      R2_IMAGE_PREFIXES[0].source,
    );
    expect(objectService.deletePrefix).not.toHaveBeenCalledWith(
      R2_IMAGE_PREFIXES[1].source,
    );
  });

  it("protects destinations when either source prefix is empty", async () => {
    const objectService = {
      listPrefix: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ key: "post-seeder/image.png" }]),
      deletePrefix: jest.fn(),
      deleteObjects: jest.fn(),
      getObject: jest.fn(),
      putObject: jest.fn(),
      copyPrefix: jest.fn(),
    };

    await expect(resetR2ImagePrefixes(objectService)).rejects.toThrow(
      'source prefix "product-seeder/" is empty',
    );
    expect(objectService.deletePrefix).not.toHaveBeenCalled();
    expect(objectService.copyPrefix).not.toHaveBeenCalled();
  });

  it("stops and propagates a copy failure", async () => {
    const objectService = {
      listPrefix: jest.fn().mockResolvedValue([{ key: "source/image.png" }]),
      deletePrefix: jest.fn().mockResolvedValue(1),
      deleteObjects: jest.fn().mockResolvedValue(0),
      getObject: jest.fn().mockResolvedValue(Buffer.from("[]")),
      putObject: jest.fn(),
      copyPrefix: jest.fn().mockRejectedValue(new Error("copy failed")),
    };

    await expect(resetR2ImagePrefixes(objectService)).rejects.toThrow(
      "copy failed",
    );
    expect(objectService.copyPrefix).toHaveBeenCalledTimes(1);
  });

  it("fails when the copied count does not match the source count", async () => {
    const objectService = {
      listPrefix: jest
        .fn()
        .mockResolvedValue([
          { key: "source/one.png" },
          { key: "source/two.png" },
        ]),
      deletePrefix: jest.fn().mockResolvedValue(2),
      deleteObjects: jest.fn().mockResolvedValue(0),
      getObject: jest.fn().mockResolvedValue(Buffer.from("[]")),
      putObject: jest.fn(),
      copyPrefix: jest.fn().mockResolvedValue(1),
    };

    await expect(resetR2ImagePrefixes(objectService)).rejects.toThrow(
      "expected 2",
    );
  });

  it("skips R2 seeding for the local storage provider", async () => {
    env.storageProvider = "local";
    const productDir = path.join(process.cwd(), "uploads/images/product");
    const postDir = path.join(process.cwd(), "uploads/images/post");

    try {
      await fs.mkdir(productDir, { recursive: true });
      await fs.mkdir(postDir, { recursive: true });
      await fs.writeFile(path.join(productDir, "unrelated.txt"), "keep");
      await fs.writeFile(
        path.join(productDir, ".r2-seed-manifest.json"),
        JSON.stringify(["stale.png"]),
      );
      await fs.writeFile(path.join(productDir, "stale.png"), "stale");

      const objectService = {
        listPrefix: jest.fn(),
        getObject: jest.fn(),
      };

      await expect(
        resetR2ImagePrefixes(objectService as never),
      ).resolves.toBeUndefined();
      await expect(
        fs.readFile(path.join(productDir, "stale.png"), "utf8"),
      ).resolves.toBe("stale");
      await expect(
        fs.readFile(path.join(productDir, "unrelated.txt"), "utf8"),
      ).resolves.toBe("keep");
      expect(objectService.listPrefix).not.toHaveBeenCalled();
      expect(objectService.getObject).not.toHaveBeenCalled();
    } finally {
      await fs.rm(productDir, { recursive: true, force: true });
      await fs.rm(postDir, { recursive: true, force: true });
    }
  });
});
