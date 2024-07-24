/*
  Warnings:

  - A unique constraint covering the columns `[bonus_id]` on the table `PLAYERS` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `PLAYERS` ADD COLUMN `bonus_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `BONUS` (
    `id` VARCHAR(191) NOT NULL,
    `player_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `percentage` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BONUS_player_id_key`(`player_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `PLAYERS_bonus_id_key` ON `PLAYERS`(`bonus_id`);

-- AddForeignKey
ALTER TABLE `BONUS` ADD CONSTRAINT `BONUS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
