-- CreateTable
CREATE TABLE `BOT_MESSAGES` (
    `id` VARCHAR(191) NOT NULL,
    `messages` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
