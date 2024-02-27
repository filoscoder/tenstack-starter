/*
  Warnings:

  - You are about to drop the column `bank_account` on the `DEPOSITS` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account` on the `PAYMENTS` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `DEPOSITS_bank_account_fkey` ON `DEPOSITS`;

-- DropIndex
DROP INDEX `PAYMENTS_bank_account_fkey` ON `PAYMENTS`;

-- AlterTable
ALTER TABLE `DEPOSITS` DROP COLUMN `bank_account`;

-- AlterTable
ALTER TABLE `PAYMENTS` DROP COLUMN `bank_account`;
