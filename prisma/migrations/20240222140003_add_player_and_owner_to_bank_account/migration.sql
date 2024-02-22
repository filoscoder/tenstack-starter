/*
  Warnings:

  - Added the required column `owner` to the `BANK_ACCOUNTS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player_id` to the `BANK_ACCOUNTS` table without a default value. This is not possible if the table is not empty.

*/
-- Delete all rows
DELETE FROM `BANK_ACCOUNTS`;

DELETE FROM `DEPOSITS`;

DELETE FROM `PAYMENTS`;

-- AlterTable
ALTER TABLE `BANK_ACCOUNTS` ADD COLUMN `owner` VARCHAR(191) NOT NULL,
    ADD COLUMN `player_id` INTEGER NOT NULL;
