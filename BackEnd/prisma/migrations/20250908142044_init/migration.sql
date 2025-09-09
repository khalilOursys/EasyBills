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
