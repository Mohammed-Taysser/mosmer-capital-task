/*
  Warnings:

  - A unique constraint covering the columns `[orderId,sku]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OrderItem_sku_key";

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_sku_key" ON "OrderItem"("orderId", "sku");
