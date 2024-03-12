/*
  Warnings:

  - Added the required column `user_agent` to the `TOKENS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TOKENS` ADD COLUMN `user_agent` VARCHAR(256) NOT NULL;
