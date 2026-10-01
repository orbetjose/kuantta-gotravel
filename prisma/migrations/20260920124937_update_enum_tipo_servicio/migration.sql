/*
  Warnings:

  - The values [CANCELADO] on the enum `EstadoServicio` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoServicio_new" AS ENUM ('BORRADOR', 'POR_REVISAR', 'DEVUELTO', 'POR_FACTURAR', 'FACTURADO', 'ANULADO', 'CERRADO');
ALTER TABLE "public"."Servicio" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Servicio" ALTER COLUMN "estado" TYPE "EstadoServicio_new" USING ("estado"::text::"EstadoServicio_new");
ALTER TYPE "EstadoServicio" RENAME TO "EstadoServicio_old";
ALTER TYPE "EstadoServicio_new" RENAME TO "EstadoServicio";
DROP TYPE "public"."EstadoServicio_old";
ALTER TABLE "Servicio" ALTER COLUMN "estado" SET DEFAULT 'BORRADOR';
COMMIT;
