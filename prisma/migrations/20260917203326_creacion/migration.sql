-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('TIQUETE', 'HOTEL', 'ALQUILER_AUTO', 'SALON', 'EVENTO', 'SILLA', 'TARJETA_ASISTENCIA', 'TRASLADO', 'VISA', 'WEB_CHECKIN', 'PLAN_VACACIONAL');

-- CreateEnum
CREATE TYPE "EstadoServicio" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoAPH" AS ENUM ('NACIONAL', 'INTERNACIONAL');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('CASH', 'TARJETA_CREDITO', 'CREDITO_AGENCIA');

-- CreateEnum
CREATE TYPE "PlazoCredito" AS ENUM ('TRES', 'OCHO', 'QUINCE', 'TREINTA');

-- CreateEnum
CREATE TYPE "TipoCash" AS ENUM ('EFECTIVO', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" SERIAL NOT NULL,
    "origen" TEXT NOT NULL,
    "codigoOrigen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "codigoDestino" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "proveedorId" INTEGER,
    "tipo" "TipoServicio" NOT NULL,
    "estado" "EstadoServicio" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tiquete" (
    "id" SERIAL NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "facturaProveedorUrl" TEXT NOT NULL,
    "numeroTiquete" TEXT NOT NULL,
    "soporteTiqueteUrl" TEXT NOT NULL,
    "revision" BOOLEAN NOT NULL,
    "numeroTiqueteRevision" TEXT,
    "clase" TEXT NOT NULL,
    "pasajero" TEXT NOT NULL,
    "fechaIda" TIMESTAMP(3) NOT NULL,
    "fechaRegreso" TIMESTAMP(3),
    "tarifaNeta" DECIMAL(65,30) NOT NULL,
    "iva" DECIMAL(65,30) NOT NULL,
    "tasaAeroportuaria" DECIMAL(65,30) NOT NULL,
    "tarifaAdministrativaNeta" DECIMAL(65,30) NOT NULL,
    "ivaTarifaAdministrativa" DECIMAL(65,30) NOT NULL,
    "feeAgenciaNeta" DECIMAL(65,30) NOT NULL,
    "ivaFeeAgencia" DECIMAL(65,30) NOT NULL,
    "feePagoTarjeta" DECIMAL(65,30) NOT NULL,
    "totalPagar" DECIMAL(65,30) NOT NULL,
    "aph" "TipoAPH" NOT NULL,
    "pago" "TipoPago" NOT NULL,
    "creditoAgencia" "PlazoCredito",
    "numeroTarjeta" TEXT,
    "numeroAprobacion" TEXT,
    "tipoCash" "TipoCash",
    "ceCos" TEXT,
    "proyectoFCDS" TEXT,
    "facturaGoTravelUrl" TEXT,
    "observaciones" TEXT,
    "fechaEmisionTiqueteFES" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tiquete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_correo_key" ON "Cliente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_ruc_key" ON "Proveedor"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "Tiquete_servicioId_key" ON "Tiquete"("servicioId");

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tiquete" ADD CONSTRAINT "Tiquete_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tiquete" ADD CONSTRAINT "Tiquete_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
