/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `IDverification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personalInfoId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressVerificationId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `PersonalInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `IDverification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PersonalInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_userId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_verificationId_fkey";

-- AlterTable
ALTER TABLE "IDverification" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "addressId" INTEGER,
ADD COLUMN     "addressVerificationId" INTEGER,
ADD COLUMN     "personalInfoId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "verificationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PersonalInfo" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiryTime" TIMESTAMP(3),
ADD COLUMN     "passwordReset" BOOLEAN DEFAULT false,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "pin" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AddressVerification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AddressVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AddressVerification_userId_key" ON "AddressVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IDverification_userId_key" ON "IDverification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_addressId_key" ON "Image"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_personalInfoId_key" ON "Image"("personalInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_addressVerificationId_key" ON "Image"("addressVerificationId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalInfo_userId_key" ON "PersonalInfo"("userId");

-- AddForeignKey
ALTER TABLE "PersonalInfo" ADD CONSTRAINT "PersonalInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IDverification" ADD CONSTRAINT "IDverification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressVerification" ADD CONSTRAINT "AddressVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "IDverification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "PersonalInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_addressVerificationId_fkey" FOREIGN KEY ("addressVerificationId") REFERENCES "AddressVerification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
