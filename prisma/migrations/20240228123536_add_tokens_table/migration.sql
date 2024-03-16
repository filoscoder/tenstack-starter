-- CreateTable
CREATE TABLE `TOKENS` (
    `id` VARCHAR(191) NOT NULL,
    `invalid` BOOLEAN NOT NULL DEFAULT false,
    `next` VARCHAR(191) NULL,
    `player_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TOKENS` ADD CONSTRAINT `TOKENS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;