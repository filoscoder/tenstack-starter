-- 1. Verificar si las columnas existen antes de crearlas
-- BONUS
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'BONUS' AND COLUMN_NAME = 'coin_transfer_id') THEN
  ALTER TABLE `BONUS` ADD COLUMN `coin_transfer_id` VARCHAR(191);
END IF;

-- DEPOSITS
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'DEPOSITS' AND COLUMN_NAME = 'coin_transfer_id') THEN
  ALTER TABLE `DEPOSITS` ADD COLUMN `coin_transfer_id` VARCHAR(191);
END IF;

-- PAYMENTS
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'PAYMENTS' AND COLUMN_NAME = 'coin_transfer_id') THEN
  ALTER TABLE `PAYMENTS` ADD COLUMN `coin_transfer_id` VARCHAR(191);
END IF;

-- 2. Generar valores únicos para coin_transfer_id donde sea NULL y asignarlos
UPDATE `BONUS` SET `coin_transfer_id` = UUID() WHERE `coin_transfer_id` IS NULL;
UPDATE `DEPOSITS` SET `coin_transfer_id` = UUID() WHERE `coin_transfer_id` IS NULL;
UPDATE `PAYMENTS` SET `coin_transfer_id` = UUID() WHERE `coin_transfer_id` IS NULL;

-- 3. Insertar registros en la tabla COIN_TRANSFERS si no existen
INSERT INTO `COIN_TRANSFERS` (`id`, `status`, `created_at`, `updated_at`)
SELECT `coin_transfer_id`, 'completed', NOW(), NOW() 
FROM `BONUS` 
WHERE `coin_transfer_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `status` = 'completed';

INSERT INTO `COIN_TRANSFERS` (`id`, `status`, `created_at`, `updated_at`)
SELECT `coin_transfer_id`, 'completed', NOW(), NOW() 
FROM `DEPOSITS` 
WHERE `coin_transfer_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `status` = 'completed';

INSERT INTO `COIN_TRANSFERS` (`id`, `status`, `created_at`, `updated_at`)
SELECT `coin_transfer_id`, 'completed', NOW(), NOW() 
FROM `PAYMENTS` 
WHERE `coin_transfer_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `status` = 'completed';

-- 4. Modificar las columnas coin_transfer_id para que sean NOT NULL si no lo son ya
ALTER TABLE `BONUS` MODIFY COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;
ALTER TABLE `DEPOSITS` MODIFY COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;
ALTER TABLE `PAYMENTS` MODIFY COLUMN `coin_transfer_id` VARCHAR(191) NOT NULL;

-- 5. Crear índices únicos y claves foráneas si no existen
CREATE UNIQUE INDEX IF NOT EXISTS `BONUS_coin_transfer_id_key` ON `BONUS`(`coin_transfer_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `DEPOSITS_coin_transfer_id_key` ON `DEPOSITS`(`coin_transfer_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `PAYMENTS_coin_transfer_id_key` ON `PAYMENTS`(`coin_transfer_id`);

ALTER TABLE `PAYMENTS` ADD CONSTRAINT IF NOT EXISTS `PAYMENTS_coin_transfer_id_fkey` 
FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `DEPOSITS` ADD CONSTRAINT IF NOT EXISTS `DEPOSITS_coin_transfer_id_fkey` 
FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BONUS` ADD CONSTRAINT IF NOT EXISTS `BONUS_coin_transfer_id_fkey` 
FOREIGN KEY (`coin_transfer_id`) REFERENCES `COIN_TRANSFERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
