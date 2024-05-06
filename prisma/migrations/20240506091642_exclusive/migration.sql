-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "subTitle" TEXT;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "subTitle" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "subTitle" TEXT;

-- CreateTable
CREATE TABLE "Organiser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "imageId" INTEGER,

    CONSTRAINT "Organiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventToOrganiser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organiser_imageId_key" ON "Organiser"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToOrganiser_AB_unique" ON "_EventToOrganiser"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToOrganiser_B_index" ON "_EventToOrganiser"("B");

-- AddForeignKey
ALTER TABLE "Organiser" ADD CONSTRAINT "Organiser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organiser" ADD CONSTRAINT "Organiser_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToOrganiser" ADD CONSTRAINT "_EventToOrganiser_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToOrganiser" ADD CONSTRAINT "_EventToOrganiser_B_fkey" FOREIGN KEY ("B") REFERENCES "Organiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
