/*
  Warnings:

  - Added the required column `date` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sending_bank` to the `DEPOSITS` table without a default value. This is not possible if the table is not empty.
  - Made the column `amount` on table `DEPOSITS` required. This step will fail if there are existing NULL values in that column.

*/
-- Truncate
TRUNCATE TABLE `DEPOSITS`;

-- AlterTable
ALTER TABLE `DEPOSITS` ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `sending_bank` VARCHAR(191) NOT NULL,
    MODIFY `amount` DOUBLE NOT NULL;
