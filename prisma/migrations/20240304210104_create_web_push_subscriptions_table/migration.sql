-- CreateTable
CREATE TABLE `WEB_PUSH_SUBSCRIPTIONS` (
    `id` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `keys` JSON NOT NULL,

    UNIQUE INDEX `WEB_PUSH_SUBSCRIPTIONS_endpoint_key`(`endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
