/*
  Warnings:

  - You are about to drop the column `ceCos` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `creditoAgencia` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `facturaGoTravelUrl` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `facturaProveedorUrl` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `fechaEmision` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `feePagoTarjeta` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `numeroAprobacion` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `numeroTarjeta` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `pago` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `proyectoFCDS` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `soporteTiqueteUrl` on the `Tiquete` table. All the data in the column will be lost.
  - You are about to drop the column `tipoCash` on the `Tiquete` table. All the data in the column will be lost.
  - Added the required column `fechaEmision` to the `Servicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formaPago` to the `Servicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pagadoProveedor` to the `Servicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vencimientoFacturaProveedor` to the `Servicio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPagadoProveedor" AS ENUM ('SI', 'NO', 'NO_APLICA');

-- DropForeignKey
ALTER TABLE "Tiquete" DROP CONSTRAINT "Tiquete_servicioId_fkey";

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "ceCos" TEXT,
ADD COLUMN     "creditoAgencia" INTEGER,
ADD COLUMN     "facturaGoTravelUrl" TEXT,
ADD COLUMN     "facturaProveedorUrl" TEXT,
ADD COLUMN     "fechaEmision" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "formaPago" "TipoPago" NOT NULL,
ADD COLUMN     "numeroAprobacion" TEXT,
ADD COLUMN     "numeroTarjeta" TEXT,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "pagadoProveedor" "TipoPagadoProveedor" NOT NULL,
ADD COLUMN     "proyectoFCDS" TEXT,
ADD COLUMN     "soporteTiqueteElectronicoUrl" TEXT,
ADD COLUMN     "tipoCash" "TipoCash",
ADD COLUMN     "vencimientoFacturaProveedor" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tiquete" DROP COLUMN "ceCos",
DROP COLUMN "creditoAgencia",
DROP COLUMN "facturaGoTravelUrl",
DROP COLUMN "facturaProveedorUrl",
DROP COLUMN "fechaEmision",
DROP COLUMN "feePagoTarjeta",
DROP COLUMN "numeroAprobacion",
DROP COLUMN "numeroTarjeta",
DROP COLUMN "observaciones",
DROP COLUMN "pago",
DROP COLUMN "proyectoFCDS",
DROP COLUMN "soporteTiqueteUrl",
DROP COLUMN "tipoCash";

-- CreateTable
CREATE TABLE "DetalleServicio" (
    "id" SERIAL NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "descripcionServicio" TEXT NOT NULL,
    "pasajero" TEXT NOT NULL,
    "codigoReserva" TEXT NOT NULL,
    "valorPagadoProveedor" DECIMAL(65,30) NOT NULL,
    "trm" DECIMAL(65,30) NOT NULL,
    "feePagoTarjetaCredito" DECIMAL(65,30) NOT NULL,
    "valorPagadoGoTravel" DECIMAL(65,30) NOT NULL,
    "totalIngreso" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetalleServicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DetalleServicio_servicioId_key" ON "DetalleServicio"("servicioId");

-- AddForeignKey
ALTER TABLE "DetalleServicio" ADD CONSTRAINT "DetalleServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tiquete" ADD CONSTRAINT "Tiquete_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
