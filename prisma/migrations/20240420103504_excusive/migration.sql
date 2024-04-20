/*
  Warnings:

  - Added the required column `field3` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field4` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "field3" TEXT NOT NULL,
ADD COLUMN     "field4" TEXT NOT NULL;
