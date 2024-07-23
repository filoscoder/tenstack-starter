/*
  Warnings:

  - You are about to drop the column `bankName` on the `BANK_ACCOUNTS` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bankNumber]` on the table `BANK_ACCOUNTS` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bankId` to the `BANK_ACCOUNTS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sending_bank` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.
  - Made the column `amount` on table `DEPOSITS` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `BANK_ACCOUNTS` DROP COLUMN `bankName`,
    ADD COLUMN `bankId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `DEPOSITS` ADD COLUMN `cep_ok` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `sending_bank` VARCHAR(191) NOT NULL,
    MODIFY `amount` DOUBLE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `BANK_ACCOUNTS_bankNumber_key` ON `BANK_ACCOUNTS`(`bankNumber`);
