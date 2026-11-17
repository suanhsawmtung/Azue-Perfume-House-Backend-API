import { seedImagePrefixes } from "../src/services/storage/r2-image-seeder";
import { getFilePath, removeFolder } from "../src/utils/file";

const seedImages = async () => {
  await removeFolder(getFilePath("uploads", "images"));

  return seedImagePrefixes();
};

seedImages()
  .then((result) => {
    console.log(
      `Image seeding completed: ${result ? `${result.product} product object(s), ${result.post} post object(s), ${result.order} order object(s) deleted.` : "No objects seeded."}`,
    );
  })
  .catch((error) => {
    console.error("Image seeding failed.", error);
    process.exitCode = 1;
  });
