/*
  Warnings:

  - You are about to drop the column `field1` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `field2` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `field3` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `field4` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `friends` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "field1",
DROP COLUMN "field2",
DROP COLUMN "field3",
DROP COLUMN "field4",
DROP COLUMN "friends";
