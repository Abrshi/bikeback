/*
  Warnings:

  - A unique constraint covering the columns `[qr_code_identifier]` on the table `Dock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Dock" ADD COLUMN     "qr_code_identifier" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Dock_qr_code_identifier_key" ON "Dock"("qr_code_identifier");
