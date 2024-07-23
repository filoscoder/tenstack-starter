/*
  Warnings:

  - A unique constraint covering the columns `[bankNumber]` on the table `BANK_ACCOUNTS` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `BANK_ACCOUNTS_bankNumber_key` ON `BANK_ACCOUNTS`(`bankNumber`);
