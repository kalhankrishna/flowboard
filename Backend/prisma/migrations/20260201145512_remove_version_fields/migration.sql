/*
  Warnings:

  - You are about to drop the column `version` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Column` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "version";

-- AlterTable
ALTER TABLE "Column" DROP COLUMN "version";
