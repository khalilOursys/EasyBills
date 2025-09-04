/*
  Warnings:

  - You are about to drop the `BankOperation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BankOperation" DROP CONSTRAINT "BankOperation_bankId_fkey";

-- DropTable
DROP TABLE "public"."BankOperation";

-- DropTable
DROP TABLE "public"."bank";

-- CreateTable
CREATE TABLE "public"."CompanyInformation" (
    "id" SERIAL NOT NULL,
    "taxId" TEXT NOT NULL,
    "tradeRegister" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "manager" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fax" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "rib" TEXT NOT NULL,

    CONSTRAINT "CompanyInformation_pkey" PRIMARY KEY ("id")
);
