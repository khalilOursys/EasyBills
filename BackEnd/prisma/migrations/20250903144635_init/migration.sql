-- CreateTable
CREATE TABLE "public"."bank" (
    "Idbank" SERIAL NOT NULL,
    "NameBank" TEXT NOT NULL,
    "Agence" TEXT NOT NULL,
    "Adress" TEXT NOT NULL,
    "RIB" TEXT NOT NULL,

    CONSTRAINT "bank_pkey" PRIMARY KEY ("Idbank")
);

-- CreateTable
CREATE TABLE "public"."BankOperation" (
    "IdOperation" SERIAL NOT NULL,
    "bank" TEXT NOT NULL,
    "DateOperation" TIMESTAMP(3) NOT NULL,
    "Description" TEXT NOT NULL,
    "PaymentReference" TEXT NOT NULL,
    "Note" TEXT NOT NULL,
    "TypeOperation" TEXT NOT NULL,
    "OperationReference" TEXT NOT NULL,
    "Amount" DOUBLE PRECISION NOT NULL,
    "bankId" INTEGER NOT NULL,

    CONSTRAINT "BankOperation_pkey" PRIMARY KEY ("IdOperation")
);

-- AddForeignKey
ALTER TABLE "public"."BankOperation" ADD CONSTRAINT "BankOperation_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."bank"("Idbank") ON DELETE RESTRICT ON UPDATE CASCADE;
