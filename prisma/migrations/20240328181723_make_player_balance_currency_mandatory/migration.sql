/*
  Warnings:

  - Made the column `balance_currency` on table `PLAYERS` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `PLAYERS` MODIFY `balance_currency` VARCHAR(10) NOT NULL DEFAULT 'MXN';
