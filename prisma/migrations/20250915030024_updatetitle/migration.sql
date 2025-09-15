/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryname]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categorydescription` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryname` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "categorydescription" TEXT NOT NULL,
ADD COLUMN     "categoryname" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_categoryname_key" ON "public"."Category"("categoryname");
