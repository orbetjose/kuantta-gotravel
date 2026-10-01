/*
  Warnings:

  - The values [PENDIENTE,CONFIRMADO] on the enum `EstadoServicio` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPERVISOR,EDITOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Servicio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creadoPorId` to the `Servicio` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `Servicio` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoServicio_new" AS ENUM ('BORRADOR', 'POR_REVISAR', 'DEVUELTO', 'FACTURADO', 'CANCELADO');
ALTER TABLE "public"."Servicio" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Servicio" ALTER COLUMN "estado" TYPE "EstadoServicio_new" USING ("estado"::text::"EstadoServicio_new");
ALTER TYPE "EstadoServicio" RENAME TO "EstadoServicio_old";
ALTER TYPE "EstadoServicio_new" RENAME TO "EstadoServicio";
DROP TYPE "public"."EstadoServicio_old";
ALTER TABLE "Servicio" ALTER COLUMN "estado" SET DEFAULT 'BORRADOR';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMINISTRADOR', 'ASESOR', 'FACTURADOR');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMINISTRADOR';
COMMIT;

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "creadoPorId" TEXT NOT NULL,
ADD COLUMN     "facturadoPorId" TEXT,
ADD COLUMN     "fechaFacturacion" TIMESTAMP(3),
ADD COLUMN     "motivoDevolucion" TEXT,
ADD COLUMN     "uuid" TEXT NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'BORRADOR';

-- AlterTable
ALTER TABLE "Tiquete" ALTER COLUMN "facturaProveedorUrl" DROP NOT NULL,
ALTER COLUMN "soporteTiqueteUrl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_uuid_key" ON "Servicio"("uuid");

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_facturadoPorId_fkey" FOREIGN KEY ("facturadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
