/*
  Warnings:

  - You are about to drop the `BANK_ACCOUNTS` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BANK_ACCOUNTS` DROP FOREIGN KEY `BANK_ACCOUNTS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `DEPOSITS` DROP FOREIGN KEY `DEPOSITS_bank_account_fkey`;

-- DropForeignKey
ALTER TABLE `PAYMENTS` DROP FOREIGN KEY `PAYMENTS_bank_account_fkey`;

-- DropTable
DROP TABLE `BANK_ACCOUNTS`;
