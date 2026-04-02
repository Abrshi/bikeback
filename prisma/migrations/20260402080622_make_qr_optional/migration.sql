/*
  Warnings:

  - You are about to drop the `Stations` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Bikes" ADD COLUMN     "dock_id" INTEGER,
ALTER COLUMN "qr_code_identifier" DROP NOT NULL;

-- DropTable
DROP TABLE "Stations";
