-- CreateTable
CREATE TABLE "ProcessedEvent" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessedEvent_correlationId_idx" ON "ProcessedEvent"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEvent_id_key" ON "ProcessedEvent"("id");
