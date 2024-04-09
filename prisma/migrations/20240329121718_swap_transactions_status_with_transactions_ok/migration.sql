/*
  Warnings:

  - You are about to drop the column `status` on the `TRANSACTIONS` table. All the data in the column will be lost.
  - Added the required column `ok` to the `TRANSACTIONS` table without a default value. This is not possible if the table is not empty.

*/
-- DeleteFrom
DELETE FROM `TRANSACTIONS`;
-- AlterTable
ALTER TABLE `TRANSACTIONS` DROP COLUMN `status`,
    ADD COLUMN `ok` BOOLEAN NOT NULL;
