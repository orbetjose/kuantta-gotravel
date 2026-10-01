/*
  Warnings:

  - Added the required column `feePagoTarjeta` to the `Tiquete` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tiquete" ADD COLUMN     "feePagoTarjeta" DECIMAL(65,30) NOT NULL;
