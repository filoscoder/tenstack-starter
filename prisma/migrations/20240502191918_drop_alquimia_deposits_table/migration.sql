/*
  Warnings:

  - You are about to drop the `ALQ_DEPOSITS` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PAYMENTS` DROP FOREIGN KEY `PAYMENTS_bank_account_fkey`;

-- DropTable
DROP TABLE `ALQ_DEPOSITS`;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_bank_account_fkey` FOREIGN KEY (`bank_account`) REFERENCES `BANK_ACCOUNTS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
