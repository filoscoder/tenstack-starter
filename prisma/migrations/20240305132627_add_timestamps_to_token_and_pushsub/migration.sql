/*
  Warnings:

  - Added the required column `updated_at` to the `TOKENS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `WEB_PUSH_SUBSCRIPTIONS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TOKENS` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `WEB_PUSH_SUBSCRIPTIONS` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
