/*
  Warnings:

  - Made the column `end_work_hour` on table `business` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start_work_hour` on table `business` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "business" ALTER COLUMN "end_work_hour" SET NOT NULL,
ALTER COLUMN "start_work_hour" SET NOT NULL;
