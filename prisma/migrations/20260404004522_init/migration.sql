/*
  Warnings:

  - You are about to drop the column `dock_id` on the `Bikes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bike_id]` on the table `Dock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bikes" DROP COLUMN "dock_id";

-- CreateIndex
CREATE UNIQUE INDEX "Dock_bike_id_key" ON "Dock"("bike_id");

-- AddForeignKey
ALTER TABLE "Dock" ADD CONSTRAINT "Dock_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "Bikes"("bike_id") ON DELETE SET NULL ON UPDATE CASCADE;
