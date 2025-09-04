/*
  Warnings:

  - You are about to drop the column `rib` on the `CompanyInformation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."CompanyInformation" DROP COLUMN "rib",
ALTER COLUMN "fax" DROP NOT NULL;
