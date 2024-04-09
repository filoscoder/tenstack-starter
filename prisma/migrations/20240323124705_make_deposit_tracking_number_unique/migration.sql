/*
  Warnings:

  - A unique constraint covering the columns `[tracking_number]` on the table `DEPOSITS` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DEPOSITS_tracking_number_key` ON `DEPOSITS`(`tracking_number`);
