/*
  Warnings:

  - You are about to drop the `BOT_MESSAGES` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `BOT_MESSAGES`;

-- CreateTable
CREATE TABLE `BOT_FLOWS` (
    `id` VARCHAR(191) NOT NULL,
    `menus` JSON NOT NULL,
    `messages` JSON NOT NULL,
    `on_call` BOOLEAN NOT NULL,
    `active` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
