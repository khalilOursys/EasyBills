/*
  Warnings:

  - You are about to drop the `CompanyInformation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."CompanyInformation";

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "taxId" TEXT NOT NULL,
    "tradeRegister" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "manager" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fax" TEXT,
    "email" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
