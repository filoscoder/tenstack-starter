-- DropIndex
DROP INDEX `USERS_ROOT_username_key` ON `USERS_ROOT`;

-- AlterTable CASHIERS
ALTER TABLE `CASHIERS` DROP COLUMN `balance`,
    DROP COLUMN `commission`,
    ADD COLUMN `access` VARCHAR(800) NOT NULL,
    ADD COLUMN `dirty` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `panel_id` INTEGER NOT NULL,
    ADD COLUMN `refresh` VARCHAR(800) NOT NULL,
    MODIFY `password` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `USERS_ROOT` 
    DROP COLUMN `access`,
    DROP COLUMN `dirty`,
    DROP COLUMN `json_response`,
    DROP COLUMN `panel_id`,
    DROP COLUMN `password`,
    DROP COLUMN `refresh`,
    DROP COLUMN `username`,
    ADD COLUMN `player_id` VARCHAR(191);
    
-- Set player_id for USERS_ROOT table
UPDATE USERS_ROOT SET player_id = (
       SELECT p.id
         FROM PLAYERS AS p
              JOIN _PlayerToRole as ptr
                   JOIN ROLES AS r
       WHERE r.name = "agent" AND ptr.A = p.id AND ptr.b = r.id
       );

-- Set player_id to not nullable    
ALTER TABLE `USERS_ROOT` 
      MODIFY `player_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `USERS_ROOT_player_id_key` ON `USERS_ROOT`(`player_id`);

-- AddForeignKey
ALTER TABLE `USERS_ROOT` ADD CONSTRAINT `USERS_ROOT_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE `USERS_ROOT` RENAME TO `AGENT_CONFIG`;