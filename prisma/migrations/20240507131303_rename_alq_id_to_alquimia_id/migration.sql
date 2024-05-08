/*
  Warnings:

  - You are about to drop the column `alq_id` on the `PAYMENTS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PAYMENTS` DROP COLUMN `alq_id`,
    ADD COLUMN `alquimia_id` INTEGER NULL;
