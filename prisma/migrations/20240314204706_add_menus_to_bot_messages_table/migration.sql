/*
  Warnings:

  - Added the required column `menus` to the `BOT_MESSAGES` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BOT_MESSAGES` ADD COLUMN `menus` JSON NOT NULL;
