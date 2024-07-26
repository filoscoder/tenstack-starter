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

-- AddForeignKey
ALTER TABLE `BONUS` ADD CONSTRAINT `BONUS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
