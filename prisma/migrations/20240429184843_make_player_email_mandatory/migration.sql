/*
  Warnings:

  - You are about to alter the column `token` on the `PASSWORD_RESET_TOKENS` table. The data in that column could be lost. The data in that column will be cast from `VarChar(344)` to `VarChar(342)`.
  - Made the column `email` on table `PLAYERS` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `PASSWORD_RESET_TOKENS` MODIFY `token` VARCHAR(342) NOT NULL;

-- AlterTable
ALTER TABLE `PLAYERS` MODIFY `email` VARCHAR(50) NOT NULL;
