/*
  Warnings:

  - You are about to drop the column `userId` on the `Sessions` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sessions" DROP CONSTRAINT "Sessions_userId_fkey";

-- AlterTable
ALTER TABLE "Bikes" ALTER COLUMN "current_latitude" DROP NOT NULL,
ALTER COLUMN "current_longitude" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Sessions" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BikeStation" (
    "station_id" SERIAL NOT NULL,
    "city" VARCHAR(50),
    "subcity" VARCHAR(50),
    "area_name" VARCHAR(50),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "address_description" TEXT,
    "contact_phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BikeStation_pkey" PRIMARY KEY ("station_id")
);

-- CreateTable
CREATE TABLE "Dock" (
    "dock_id" SERIAL NOT NULL,
    "station_id" INTEGER NOT NULL,
    "dock_number" INTEGER NOT NULL,
    "is_occupied" BOOLEAN NOT NULL DEFAULT false,
    "bike_id" INTEGER,
    "lock_status" VARCHAR(20),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dock_pkey" PRIMARY KEY ("dock_id")
);

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dock" ADD CONSTRAINT "Dock_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "BikeStation"("station_id") ON DELETE CASCADE ON UPDATE CASCADE;
