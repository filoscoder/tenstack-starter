/*
  Warnings:

  - You are about to drop the column `amount` on the `DEPOSITS` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account` on the `DEPOSITS` table. All the data in the column will be lost.
  - You are about to drop the column `confirmed` on the `DEPOSITS` table. All the data in the column will be lost.
  - Added the required column `paid_at` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DEPOSITS` DROP FOREIGN KEY `DEPOSITS_bank_account_fkey`;

-- AlterTable
ALTER TABLE `DEPOSITS` DROP COLUMN `amount`,
    DROP COLUMN `bank_account`,
    DROP COLUMN `confirmed`,
    ADD COLUMN `confirmed_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `paid_at` DATETIME(3) NOT NULL;
