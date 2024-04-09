/*
  Warnings:

  - You are about to drop the column `confirmed_at` on the `DEPOSITS` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `DEPOSITS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DEPOSITS` DROP COLUMN `confirmed_at`,
    DROP COLUMN `deleted_at`;
