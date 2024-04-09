/*
  Warnings:

  - You are about to alter the column `owner_id` on the `BANK_ACCOUNTS` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.

*/
-- DropForeignKey
ALTER TABLE `BANK_ACCOUNTS` DROP FOREIGN KEY `BANK_ACCOUNTS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `DEPOSITS` DROP FOREIGN KEY `DEPOSITS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `PAYMENTS` DROP FOREIGN KEY `PAYMENTS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `TOKENS` DROP FOREIGN KEY `TOKENS_player_id_fkey`;

-- AlterTable
ALTER TABLE `BANK_ACCOUNTS` MODIFY `owner_id` INTEGER UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BANK_ACCOUNTS` ADD CONSTRAINT `BANK_ACCOUNTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TOKENS` ADD CONSTRAINT `TOKENS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
