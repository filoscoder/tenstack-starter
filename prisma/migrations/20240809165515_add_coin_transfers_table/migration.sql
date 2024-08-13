-- 1. Agregar las columnas coin_transfer_id sin restricciones
ALTER TABLE `BONUS` ADD COLUMN `coin_transfer_id` VARCHAR(191);
ALTER TABLE `DEPOSITS` ADD COLUMN `coin_transfer_id` VARCHAR(191);
ALTER TABLE `PAYMENTS` ADD COLUMN `coin_transfer_id` VARCHAR(191);

-- 2. Generar valores únicos para coin_transfer_id donde sea NULL y asignarlos
UPDATE `BONUS` SET `coin_transfer_id` = UUID() WHERE `coin_transfer_id` IS NULL;
UPDATE `DEPOSITS` SET `coin_transfer_id` = UUID() WHERE `coin_transfer_id` IS NULL;
UPDATE `PAYMENTS` SET `coin_transfer_id` = UUID() WHERE `coin_transfer_id` IS NULL;

-- 3. Insertar registros en la tabla COIN_TRANSFERS
INSERT INTO `COIN_TRANSFERS` (`id`, `status`, `created_at`, `updated_at`)
SELECT `coin_transfer_id`, 'completed', NOW(), NOW() FROM `BONUS` WHERE `coin_transfer_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `status` = 'completed';

INSERT INTO `COIN_TRANSFERS` (`id`, `status`, `created_at`, `updated_at`)
SELECT `coin_transfer_id`, 'completed', NOW(), NOW() FROM `DEPOSITS` WHERE `coin_transfer_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `status` = 'completed';

INSERT INTO `COIN_TRANSFERS` (`id`, `status`, `created_at`, `updated_at`)
SELECT `coin_transfer_id`, 'completed', NOW(), NOW() FROM `PAYMENTS` WHERE `coin_transfer_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `status` = 'completed';

-- 4. Modificar las columnas coin_transfer_id para que sean NOT NULL
ALTER TABLE `BONUS` MODIFY COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;
ALTER TABLE `DEPOSITS` MODIFY COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;
ALTER TABLE `PAYMENTS` MODIFY COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;

-- 5. Crear índices únicos y claves foráneas
CREATE UNIQUE INDEX `BONUS_coin_transfer_id_key` ON `BONUS`(`coin_transfer_id`);
CREATE UNIQUE INDEX `DEPOSITS_coin_transfer_id_key` ON `DEPOSITS`(`coin_transfer_id`);
CREATE UNIQUE INDEX `PAYMENTS_coin_transfer_id_key` ON `PAYMENTS`(`coin_transfer_id`);

ALTER TABLE `PAYMENTS` ADD CONSTRAINT `PAYMENTS_coin_transfer_id_fkey` FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `DEPOSITS` ADD CONSTRAINT `DEPOSITS_coin_transfer_id_fkey` FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BONUS` ADD CONSTRAINT `BONUS_coin_transfer_id_fkey` FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
