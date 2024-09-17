-- CreateTable
CREATE TABLE `BOT_HISTORY` (
    `id` VARCHAR(191) NOT NULL,
    `ref` VARCHAR(191) NOT NULL,
    `keyword` VARCHAR(191) NULL,
    `answer` TEXT NOT NULL,
    `refSerialize` VARCHAR(191) NOT NULL,
    `from` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
