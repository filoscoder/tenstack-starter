/*
  Warnings:

  - Added the required column `status` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DEPOSITS` ADD COLUMN `status` VARCHAR(191) NOT NULL;
