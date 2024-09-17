/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `CASHIERS` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CASHIERS_username_key` ON `CASHIERS`(`username`);
