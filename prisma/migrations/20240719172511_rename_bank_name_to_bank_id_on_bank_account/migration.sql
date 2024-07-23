/*
  Warnings:

  - You are about to drop the column `bankName` on the `BANK_ACCOUNTS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `BANK_ACCOUNTS` DROP COLUMN `bankName`,
    ADD COLUMN `bankId` VARCHAR(191) NOT NULL DEFAULT '000000';
