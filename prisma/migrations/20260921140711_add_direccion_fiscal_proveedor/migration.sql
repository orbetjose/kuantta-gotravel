/*
  Warnings:

  - Added the required column `direccionFiscal` to the `Proveedor` table without a default value.
*/

ALTER TABLE "Proveedor"
ADD COLUMN "direccionFiscal" TEXT NOT NULL;