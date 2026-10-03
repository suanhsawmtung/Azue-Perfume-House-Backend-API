/*
  Warnings:

  - You are about to drop the column `previousRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rotateTokenAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "previousRefreshToken",
DROP COLUMN "refreshToken",
DROP COLUMN "rotateTokenAt";
