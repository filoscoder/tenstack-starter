/*
  Warnings:

  - You are about to drop the column `earnings` on the `CASHIERS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CASHIERS` DROP COLUMN `earnings`,
    ADD COLUMN `balance` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `CashierPayout` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `player_id` VARCHAR(191) NOT NULL,
    `coin_transfer_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CashierPayout_coin_transfer_id_key`(`coin_transfer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CashierPayout` ADD CONSTRAINT `CashierPayout_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CashierPayout` ADD CONSTRAINT `CashierPayout_coin_transfer_id_fkey` FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
