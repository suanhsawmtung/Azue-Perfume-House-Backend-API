import { R2Config } from "../../config/r2";
import { R2ObjectService } from "./r2-object.service";

jest.mock("@aws-sdk/client-s3", () => ({
  CopyObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  DeleteObjectsCommand: jest.fn().mockImplementation((input) => ({ input })),
  ListObjectsV2Command: jest.fn().mockImplementation((input) => ({ input })),
}));

const config: R2Config = {
  accountId: "account-id",
  accessKeyId: "access-key-id",
  secretAccessKey: "secret-access-key",
  bucketName: "azue-media",
  publicUrl: "https://images.example.com",
};

const createClient = (responses: unknown[]) => ({
  send: jest.fn().mockImplementation(async () => responses.shift()),
});

describe("R2ObjectService", () => {
  it("copies nested objects while preserving relative paths", async () => {
    const client = createClient([
      {
        Contents: [
          { Key: "product-seeder/bottles/blue/image.png" },
          { Key: "product-seeder/notes.txt" },
        ],
        IsTruncated: false,
      },
      {},
      {},
    ]);
    const service = new R2ObjectService(client as never, config);

    await expect(
      service.copyPrefix("/product-seeder/", "/product/"),
    ).resolves.toBe(2);

    expect(client.send).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          Bucket: "azue-media",
          Prefix: "product-seeder/",
        },
      }),
    );
    expect(client.send).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: {
          Bucket: "azue-media",
          CopySource: "azue-media/product-seeder/bottles/blue/image.png",
          Key: "product/bottles/blue/image.png",
        },
      }),
    );
    expect(client.send).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        input: {
          Bucket: "azue-media",
          CopySource: "azue-media/product-seeder/notes.txt",
          Key: "product/notes.txt",
        },
      }),
    );
  });

  it("handles paginated listings and deletes in batches of 1,000", async () => {
    const keys = Array.from({ length: 1001 }, (_, index) => `product/${index}.png`);
    const client = createClient([
      {
        Contents: keys.slice(0, 1000).map((Key) => ({ Key })),
        IsTruncated: true,
        NextContinuationToken: "next-page",
      },
      {
        Contents: [{ Key: keys[1000] }],
        IsTruncated: false,
      },
      {},
      {},
    ]);
    const service = new R2ObjectService(client as never, config);

    await expect(service.deletePrefix("product")).resolves.toBe(1001);

    expect(client.send).toHaveBeenCalledTimes(4);
    expect(client.send.mock.calls[2][0].input.Delete.Objects).toHaveLength(1000);
    expect(client.send.mock.calls[3][0].input.Delete.Objects).toHaveLength(1);
    expect(client.send.mock.calls[2][0].input.Delete.Objects[0]).toEqual({
      Key: "product/0.png",
    });
    expect(client.send.mock.calls[0][0].input.ContinuationToken).toBeUndefined();
    expect(client.send.mock.calls[1][0].input.ContinuationToken).toBe("next-page");
  });

  it("does not match a similarly named prefix", async () => {
    const client = createClient([{ Contents: [], IsTruncated: false }]);
    const service = new R2ObjectService(client as never, config);

    await service.deletePrefix("product/");

    expect(client.send.mock.calls[0][0].input.Prefix).toBe("product/");
  });

  it("propagates SDK failures", async () => {
    const client = {
      send: jest.fn().mockRejectedValue(new Error("R2 unavailable")),
    };
    const service = new R2ObjectService(client as never, config);

    await expect(service.listPrefix("product")).rejects.toThrow(
      "R2 prefix listing failed",
    );
  });
});
