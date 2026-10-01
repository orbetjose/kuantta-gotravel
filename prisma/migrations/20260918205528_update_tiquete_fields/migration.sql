/*
  Warnings:

  - You are about to drop the column `iva` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `tasaAeroportuaria` on the `Tiquete` table. All the data in the column will be lost.
  - The `creditoAgencia` column on the `Tiquete` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `ivaTarifa` to the `Tiquete` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otrosImpuestos` to the `Tiquete` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tiquete" DROP COLUMN "iva",
DROP COLUMN "tasaAeroportuaria",
ADD COLUMN     "ivaTarifa" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "otrosImpuestos" DECIMAL(65,30) NOT NULL,
DROP COLUMN "creditoAgencia",
ADD COLUMN     "creditoAgencia" INTEGER;

-- DropEnum
DROP TYPE "PlazoCredito";
