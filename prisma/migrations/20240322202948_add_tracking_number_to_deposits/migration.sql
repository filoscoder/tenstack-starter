/*
  Warnings:

  - Added the required column `tracking_number` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DEPOSITS` ADD COLUMN `tracking_number` VARCHAR(191) NOT NULL;
