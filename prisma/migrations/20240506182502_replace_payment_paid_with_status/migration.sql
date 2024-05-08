/*
  Warnings:

  - You are about to drop the column `paid` on the `PAYMENTS` table. All the data in the column will be lost.
  - Added the required column `status` to the `PAYMENTS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PAYMENTS` DROP COLUMN `paid`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL;
