-- DropForeignKey
ALTER TABLE `BANK_ACCOUNTS` DROP FOREIGN KEY `BANK_ACCOUNTS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `DEPOSITS` DROP FOREIGN KEY `DEPOSITS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `PAYMENTS` DROP FOREIGN KEY `PAYMENTS_player_id_fkey`;

-- DropIndex
DROP INDEX `BANK_ACCOUNTS_owner_id_fkey` ON `BANK_ACCOUNTS`;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BANK_ACCOUNTS` ADD CONSTRAINT `BANK_ACCOUNTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;