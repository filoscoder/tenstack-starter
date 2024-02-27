/*
  Warnings:

  - Added the required column `bank_account` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_account` to the `PAYMENTS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DEPOSITS` ADD COLUMN `bank_account` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PAYMENTS` ADD COLUMN `bank_account` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `BANK_ACCOUNTS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` INTEGER NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `bankNumber` VARCHAR(191) NOT NULL,
    `bankAlias` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BANK_ACCOUNTS_bankNumber_key`(`bankNumber`),
    UNIQUE INDEX `BANK_ACCOUNTS_bankAlias_key`(`bankAlias`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_bank_account_fkey` FOREIGN KEY (`bank_account`) REFERENCES `BANK_ACCOUNTS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BANK_ACCOUNTS` ADD CONSTRAINT `BANK_ACCOUNTS_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `PLAYERS`(`panel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_bank_account_fkey` FOREIGN KEY (`bank_account`) REFERENCES `BANK_ACCOUNTS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
