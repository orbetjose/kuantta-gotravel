/*
  Warnings:

  - You are about to drop the column `pasajero` on the `DetalleServicio` table. All the data in the column will be lost.
  - You are about to drop the column `pasajero` on the `Tiquete` table. All the data in the column will be lost.
  - Added the required column `pasajeroId` to the `Servicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetalleServicio" DROP COLUMN "pasajero";

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "pasajeroId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tiquete" DROP COLUMN "pasajero";

-- CreateTable
CREATE TABLE "Pasajero" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pasajero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pasajero_correo_key" ON "Pasajero"("correo");

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_pasajeroId_fkey" FOREIGN KEY ("pasajeroId") REFERENCES "Pasajero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
