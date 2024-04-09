/*
  Warnings:

  - A unique constraint covering the columns `[clave_rastreo]` on the table `ALQ_DEPOSITS` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ALQ_DEPOSITS_clave_rastreo_key` ON `ALQ_DEPOSITS`(`clave_rastreo`);
