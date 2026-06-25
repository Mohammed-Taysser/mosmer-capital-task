/*
  Warnings:

  - The primary key for the `ProcessedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProcessedEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[eventId]` on the table `ProcessedEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `ProcessedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProcessedEvent_id_key";

-- AlterTable
ALTER TABLE "ProcessedEvent" DROP CONSTRAINT "ProcessedEvent_pkey",
ADD COLUMN     "eventId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEvent_eventId_key" ON "ProcessedEvent"("eventId");

-- CreateIndex
CREATE INDEX "ProcessedEvent_eventId_idx" ON "ProcessedEvent"("eventId");
