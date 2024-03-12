/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ROLES` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ROLES_name_key` ON `ROLES`(`name`);
