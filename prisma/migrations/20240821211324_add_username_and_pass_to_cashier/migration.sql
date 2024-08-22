/*
  Warnings:

  - Added the required column `password` to the `CASHIERS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `CASHIERS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CASHIERS` ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;
