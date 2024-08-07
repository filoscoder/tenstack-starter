/*
  Warnings:

  - Added the required column `player_balance_after` to the `COIN_TRANSFERS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `COIN_TRANSFERS` ADD COLUMN `player_balance_after` DOUBLE NOT NULL;
