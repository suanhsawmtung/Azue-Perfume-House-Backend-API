import path from "path";
import { env } from "../../config/env";
import { R2Object, R2ObjectService } from "./r2-object.service";

export const R2_IMAGE_PREFIXES = [
  {
    source: "product-seeder/",
    destination: "product/",
    category: "product",
  },
  {
    source: "post-seeder/",
    destination: "post/",
    category: "post",
  },
] as const;

// Order images are user-uploaded and do not have a seed source. They must be
// cleared whenever the R2 seed process resets the managed image data.
export const R2_SEED_CLEANUP_PREFIXES = ["order/"] as const;

// const manifestName = ".r2-seed-manifest.json";
const r2ManifestPrefix = "._seed-manifests/";
type SeedPair = (typeof R2_IMAGE_PREFIXES)[number];

const relativeKey = (key: string, prefix: string): string => {
  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, "") + "/";
  const relative = key.slice(normalizedPrefix.length);
  const resolved = path.posix.normalize(relative);
  if (
    !relative ||
    resolved === "." ||
    resolved.startsWith("../") ||
    path.posix.isAbsolute(resolved)
  ) {
    throw new Error(`Invalid seeded object key: "${key}".`);
  }
  return resolved;
};

// const readLocalManifest = async (directory: string): Promise<string[]> => {
//   try {
//     const value = JSON.parse(
//       await fs.readFile(path.join(directory, manifestName), "utf8"),
//     );
//     return Array.isArray(value) &&
//       value.every((item) => typeof item === "string")
//       ? value
//       : [];
//   } catch (error: any) {
//     if (error?.code === "ENOENT") return [];
//     throw error;
//   }
// };

// const localSeedPath = (directory: string, relative: string): string => {
//   const root = path.resolve(directory);
//   const target = path.resolve(root, relative);
//   if (!target.startsWith(`${root}${path.sep}`)) {
//     throw new Error(`Invalid seeded destination path: "${relative}".`);
//   }
//   return target;
// };

// const seedLocalPrefix = async (
//   pair: SeedPair,
//   objects: R2Object[],
//   service: R2ObjectService,
// ) => {
//   const directory = getFilePath("uploads", "images", pair.category);
//   const downloads = await Promise.all(
//     objects.map(async (object) => ({
//       relative: relativeKey(object.key, pair.source),
//       body: await service.getObject(object.key),
//     })),
//   );
//   if (downloads.length !== objects.length) {
//     throw new Error(
//       `Local image seeding failed for "${pair.source}": downloaded count mismatch.`,
//     );
//   }
//   for (const file of await readLocalManifest(directory)) {
//     await fs.rm(localSeedPath(directory, file), { force: true });
//   }
//   await ensureDir(directory);
//   for (const download of downloads) {
//     const target = localSeedPath(directory, download.relative);
//     await ensureDir(path.dirname(target));
//     await fs.writeFile(target, download.body);
//   }
//   await fs.writeFile(
//     path.join(directory, manifestName),
//     JSON.stringify(
//       downloads.map(({ relative }) => relative),
//       null,
//       2,
//     ),
//   );
//   return downloads.length;
// };

const getR2Manifest = async (
  pair: SeedPair,
  service: R2ObjectService,
): Promise<string[]> => {
  try {
    const value = JSON.parse(
      (
        await service.getObject(`${r2ManifestPrefix}${pair.category}.json`)
      ).toString("utf8"),
    );
    return Array.isArray(value) &&
      value.every((item) => typeof item === "string")
      ? value
      : [];
  } catch (error: any) {
    if (
      error?.cause?.$metadata?.httpStatusCode !== 404 &&
      error?.cause?.name !== "NoSuchKey"
    )
      throw error;
    return [];
  }
};

const seedR2Prefix = async (
  pair: SeedPair,
  objects: R2Object[],
  service: R2ObjectService,
) => {
  const destinationObjects = await service.listPrefix(pair.destination);
  await service.deleteObjects(destinationObjects.map((object) => object.key));
  await service.deleteObjects(await getR2Manifest(pair, service));
  const copiedCount = await service.copyPrefix(pair.source, pair.destination);
  if (copiedCount !== objects.length) {
    throw new Error(
      `R2 image seeding failed: copied ${copiedCount} object(s) from "${pair.source}" but expected ${objects.length}.`,
    );
  }
  await service.putObject(
    `${r2ManifestPrefix}${pair.category}.json`,
    Buffer.from(
      JSON.stringify(
        objects.map(
          (object) =>
            `${pair.destination}${relativeKey(object.key, pair.source)}`,
        ),
      ),
    ),
  );
  return copiedCount;
};

export const seedImagePrefixes = async (
  objectService = new R2ObjectService(),
) => {
  if (env.storageProvider !== "local" && env.storageProvider !== "r2") {
    throw new Error(
      `Unsupported storage provider for image seeding: ${env.storageProvider}. Supported providers are local and r2.`,
    );
  }

  if (env.storageProvider === "local") return;

  const sourceObjects = await Promise.all(
    R2_IMAGE_PREFIXES.map(({ source }) => objectService.listPrefix(source)),
  );

  const emptySource = R2_IMAGE_PREFIXES.find(
    (_, index) => sourceObjects[index]?.length === 0,
  );

  if (emptySource) {
    throw new Error(
      `R2 image seeding aborted: source prefix "${emptySource.source}" is empty.`,
    );
  }

  const cleanupCounts = await Promise.all(
    R2_SEED_CLEANUP_PREFIXES.map((prefix) =>
      objectService.deletePrefix(prefix),
    ),
  );

  const counts: number[] = [];
  for (let index = 0; index < R2_IMAGE_PREFIXES.length; index += 1) {
    const prefixPair = R2_IMAGE_PREFIXES[index];

    if (!prefixPair) {
      throw new Error(
        `R2 image seeding failed: prefix pair ${index} is missing.`,
      );
    }

    const { source } = prefixPair;
    const expectedCount = sourceObjects[index]?.length || 0;
    // const copiedCount =
    //   env.storageProvider === "local"
    //     ? await seedLocalPrefix(
    //         prefixPair,
    //         sourceObjects[index] || [],
    //         objectService,
    //       )
    //     : await seedR2Prefix(
    //         prefixPair,
    //         sourceObjects[index] || [],
    //         objectService,
    //       );

    const copiedCount = await seedR2Prefix(
      prefixPair,
      sourceObjects[index] || [],
      objectService,
    );

    if (copiedCount !== expectedCount)
      throw new Error(
        `Image seeding failed for "${source}": expected ${expectedCount} object(s).`,
      );
    counts.push(copiedCount);
  }

  return {
    product: counts[0] || 0,
    post: counts[1] || 0,
    order: cleanupCounts[0] || 0,
  };
};

export const resetR2ImagePrefixes = seedImagePrefixes;
