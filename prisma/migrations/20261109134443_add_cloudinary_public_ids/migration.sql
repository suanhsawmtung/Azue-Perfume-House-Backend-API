-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "publicId" TEXT,
ALTER COLUMN "path" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imagePublicId" TEXT;
