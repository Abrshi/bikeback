-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BikeStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DISABLED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE');

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('DAMAGE', 'BILLING', 'APP_ERROR');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "father_name" TEXT NOT NULL,
    "grandfather_name" TEXT,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "session_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "User_Locations" (
    "location_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "User_Locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "Bikes" (
    "bike_id" SERIAL NOT NULL,
    "qr_code_identifier" TEXT NOT NULL,
    "status" "BikeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "battery_level" DOUBLE PRECISION NOT NULL,
    "current_latitude" DOUBLE PRECISION NOT NULL,
    "current_longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Bikes_pkey" PRIMARY KEY ("bike_id")
);

-- CreateTable
CREATE TABLE "Maintenance_Logs" (
    "log_id" SERIAL NOT NULL,
    "bike_id" INTEGER NOT NULL,
    "issue_description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "technician_notes" TEXT,

    CONSTRAINT "Maintenance_Logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "Rides" (
    "ride_id" SERIAL NOT NULL,
    "promo_code_id" INTEGER,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "start_lat" DOUBLE PRECISION NOT NULL,
    "start_lng" DOUBLE PRECISION NOT NULL,
    "end_lat" DOUBLE PRECISION,
    "end_lng" DOUBLE PRECISION,
    "total_distance" DOUBLE PRECISION,
    "status" "RideStatus" NOT NULL DEFAULT 'ONGOING',
    "user_id" INTEGER NOT NULL,
    "bike_id" INTEGER NOT NULL,

    CONSTRAINT "Rides_pkey" PRIMARY KEY ("ride_id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "payment_id" SERIAL NOT NULL,
    "base_cost" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION DEFAULT 0,
    "final_amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "ride_id" INTEGER NOT NULL,
    "promo_id" INTEGER,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "Promo_Codes" (
    "promo_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expiry_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promo_Codes_pkey" PRIMARY KEY ("promo_id")
);

-- CreateTable
CREATE TABLE "Stations" (
    "station_id" SERIAL NOT NULL,
    "station_name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "total_slots" INTEGER NOT NULL,
    "available_slots" INTEGER NOT NULL,
    "station_status" TEXT NOT NULL,
    "zone_area" TEXT NOT NULL,

    CONSTRAINT "Stations_pkey" PRIMARY KEY ("station_id")
);

-- CreateTable
CREATE TABLE "Support_Tickets" (
    "ticket_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ride_id" INTEGER,
    "issue_category" "IssueCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "admin_response" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Support_Tickets_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "Ratings_Feedback" (
    "feedback_id" SERIAL NOT NULL,
    "ride_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Ratings_Feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "Fida_ID_Verifications" (
    "verification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "id_type" TEXT NOT NULL,
    "id_number_hash" TEXT NOT NULL,
    "id_document_front_url" TEXT NOT NULL,
    "id_document_back_url" TEXT,
    "selfie_verification_url" TEXT NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by_admin_id" INTEGER,

    CONSTRAINT "Fida_ID_Verifications_pkey" PRIMARY KEY ("verification_id")
);

-- CreateTable
CREATE TABLE "Pricing_Rules" (
    "price_id" SERIAL NOT NULL,
    "base_fare" DOUBLE PRECISION NOT NULL,
    "rate_per_minute" DOUBLE PRECISION NOT NULL,
    "rate_per_km" DOUBLE PRECISION NOT NULL,
    "minimum_fare" DOUBLE PRECISION NOT NULL,
    "pause_rate" DOUBLE PRECISION,
    "penalty_fee" DOUBLE PRECISION,
    "currency" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pricing_Rules_pkey" PRIMARY KEY ("price_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_number_key" ON "Users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_key" ON "Role"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Bikes_qr_code_identifier_key" ON "Bikes"("qr_code_identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_ride_id_key" ON "Payments"("ride_id");

-- CreateIndex
CREATE UNIQUE INDEX "Promo_Codes_code_key" ON "Promo_Codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_Feedback_ride_id_key" ON "Ratings_Feedback"("ride_id");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Locations" ADD CONSTRAINT "User_Locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Logs" ADD CONSTRAINT "Maintenance_Logs_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "Bikes"("bike_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rides" ADD CONSTRAINT "Rides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rides" ADD CONSTRAINT "Rides_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "Bikes"("bike_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rides" ADD CONSTRAINT "Rides_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "Promo_Codes"("promo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "Rides"("ride_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "Promo_Codes"("promo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support_Tickets" ADD CONSTRAINT "Support_Tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support_Tickets" ADD CONSTRAINT "Support_Tickets_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "Rides"("ride_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings_Feedback" ADD CONSTRAINT "Ratings_Feedback_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "Rides"("ride_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings_Feedback" ADD CONSTRAINT "Ratings_Feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fida_ID_Verifications" ADD CONSTRAINT "Fida_ID_Verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
