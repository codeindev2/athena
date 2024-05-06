-- CreateEnum
CREATE TYPE "AppoinymentStatus" AS ENUM ('CONFIRMED', 'CANCELED', 'PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "AppoinymentStatus" NOT NULL DEFAULT 'PENDING';
