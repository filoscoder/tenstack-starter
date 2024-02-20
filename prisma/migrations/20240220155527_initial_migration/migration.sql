-- CreateTable
CREATE TABLE `USERS_ROOT` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` TEXT NOT NULL,
    `panel_id` INTEGER NOT NULL,
    `access` VARCHAR(800) NOT NULL,
    `refresh` VARCHAR(800) NOT NULL,
    `json_response` TEXT NOT NULL,
    `dirty` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `USERS_ROOT_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TRANSACTIONS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender_id` INTEGER NOT NULL,
    `recipient_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PLAYERS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `panel_id` INTEGER NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` TEXT NOT NULL,
    `email` VARCHAR(50) NULL,
    `first_name` VARCHAR(50) NULL,
    `last_name` VARCHAR(50) NULL,
    `date_of_birth` DATETIME(3) NULL,
    `movile_number` VARCHAR(50) NULL,
    `country` VARCHAR(50) NULL,
    `balance_currency` VARCHAR(10) NULL DEFAULT 'MXN',
    `status` VARCHAR(20) NULL DEFAULT 'ACTIVO',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PLAYERS_panel_id_key`(`panel_id`),
    UNIQUE INDEX `PLAYERS_username_key`(`username`),
    UNIQUE INDEX `PLAYERS_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PAYMENTS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paid` DATETIME(3) NULL,
    `bank_account` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BANK_ACCOUNTS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BANK_ACCOUNTS_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DEPOSITS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `confirmed` DATETIME(3) NULL,
    `bank_account` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`panel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_bank_account_fkey` FOREIGN KEY (`bank_account`) REFERENCES `BANK_ACCOUNTS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BANK_ACCOUNTS` ADD CONSTRAINT `BANK_ACCOUNTS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`panel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`panel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_bank_account_fkey` FOREIGN KEY (`bank_account`) REFERENCES `BANK_ACCOUNTS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
