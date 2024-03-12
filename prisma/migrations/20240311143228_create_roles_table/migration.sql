-- CreateTable
CREATE TABLE `ROLES` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlayerToRole` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PlayerToRole_AB_unique`(`A`, `B`),
    INDEX `_PlayerToRole_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PlayerToRole` ADD CONSTRAINT `_PlayerToRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlayerToRole` ADD CONSTRAINT `_PlayerToRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `ROLES`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
