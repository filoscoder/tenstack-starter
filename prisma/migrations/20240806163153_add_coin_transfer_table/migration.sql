/*
  Warnings:

  - A unique constraint covering the columns `[coin_transfer_id]` on the table `BONUS` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coin_transfer_id]` on the table `DEPOSITS` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coin_transfer_id]` on the table `PAYMENTS` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coin_transfer_id` to the `BONUS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coin_transfer_id` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coin_transfer_id` to the `PAYMENTS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BONUS` ADD COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `DEPOSITS` ADD COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `PAYMENTS` ADD COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `COIN_TRANSFERS` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `transfered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `BONUS_coin_transfer_id_key` ON `BONUS`(`coin_transfer_id`);

-- CreateIndex
CREATE UNIQUE INDEX `DEPOSITS_coin_transfer_id_key` ON `DEPOSITS`(`coin_transfer_id`);

-- CreateIndex
CREATE UNIQUE INDEX `PAYMENTS_coin_transfer_id_key` ON `PAYMENTS`(`coin_transfer_id`);

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_coin_transfer_id_fkey` FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_coin_transfer_id_fkey` FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BONUS` ADD CONSTRAINT `BONUS_coin_transfer_id_fkey` FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
