/*
  Warnings:

  - Added the required column `updatedAt` to the `SaleInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PurchaseInvoiceType" ADD VALUE 'PRODUCT_PURCHASE';
ALTER TYPE "PurchaseInvoiceType" ADD VALUE 'RAW_MATERIAL_PURCHASE';

-- DropForeignKey
ALTER TABLE "PurchaseInvoiceItem" DROP CONSTRAINT "PurchaseInvoiceItem_productId_fkey";

-- AlterTable
ALTER TABLE "PurchaseInvoice" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PurchaseInvoiceItem" ADD COLUMN     "rawMaterialId" INTEGER,
ADD COLUMN     "serviceId" INTEGER,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "receivedQuantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SaleInvoice" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseInvoiceItem" ADD CONSTRAINT "PurchaseInvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInvoiceItem" ADD CONSTRAINT "PurchaseInvoiceItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "raw_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInvoiceItem" ADD CONSTRAINT "PurchaseInvoiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
