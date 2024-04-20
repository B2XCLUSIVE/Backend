/*
  Warnings:

  - You are about to drop the column `field` on the `User` table. All the data in the column will be lost.
  - Added the required column `field1` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field2` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "field",
ADD COLUMN     "field1" TEXT NOT NULL,
ADD COLUMN     "field2" TEXT NOT NULL;
