-- AlterTable
ALTER TABLE "Audio" ADD COLUMN     "imageId" INTEGER;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "imageId" INTEGER;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "imageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
