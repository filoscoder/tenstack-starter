/*
  Warnings:

  - You are about to drop the `CashierPayout` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CashierPayout` DROP FOREIGN KEY `CashierPayout_coin_transfer_id_fkey`;

-- DropForeignKey
ALTER TABLE `CashierPayout` DROP FOREIGN KEY `CashierPayout_player_id_fkey`;

-- DropTable
DROP TABLE `CashierPayout`;
