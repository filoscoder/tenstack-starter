/*
  Warnings:

  - The primary key for the `BANK_ACCOUNTS` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DEPOSITS` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PAYMENTS` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PLAYERS` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ROLES` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TRANSACTIONS` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `USERS_ROOT` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `BANK_ACCOUNTS` DROP FOREIGN KEY `BANK_ACCOUNTS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `DEPOSITS` DROP FOREIGN KEY `DEPOSITS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `PAYMENTS` DROP FOREIGN KEY `PAYMENTS_bank_account_fkey`;

-- DropForeignKey
ALTER TABLE `PAYMENTS` DROP FOREIGN KEY `PAYMENTS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `TOKENS` DROP FOREIGN KEY `TOKENS_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `_PlayerToRole` DROP FOREIGN KEY `_PlayerToRole_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PlayerToRole` DROP FOREIGN KEY `_PlayerToRole_B_fkey`;

-- AlterTable
ALTER TABLE `BANK_ACCOUNTS` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `player_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `DEPOSITS` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `player_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PAYMENTS` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `player_id` VARCHAR(191) NOT NULL,
    MODIFY `bank_account` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PLAYERS` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ROLES` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `TOKENS` MODIFY `player_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `TRANSACTIONS` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `USERS_ROOT` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `_PlayerToRole` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_bank_account_fkey` FOREIGN KEY (`bank_account`) REFERENCES `BANK_ACCOUNTS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BANK_ACCOUNTS` ADD CONSTRAINT `BANK_ACCOUNTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TOKENS` ADD CONSTRAINT `TOKENS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlayerToRole` ADD CONSTRAINT `_PlayerToRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlayerToRole` ADD CONSTRAINT `_PlayerToRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `ROLES`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
