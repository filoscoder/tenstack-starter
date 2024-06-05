/*
  Warnings:

  - You are about to drop the column `owner` on the `ANALYTICS` table. All the data in the column will be lost.
  - Added the required column `source` to the `ANALYTICS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ANALYTICS` DROP COLUMN `owner`,
    ADD COLUMN `source` VARCHAR(191) NOT NULL;
