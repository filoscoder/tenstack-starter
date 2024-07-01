/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `CHAT_DATA` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CHAT_DATA_number_key` ON `CHAT_DATA`(`number`);
