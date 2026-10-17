-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('NATURAL', 'JURIDICA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('NIT', 'CEDULA', 'PASAPORTE');

-- CreateEnum
CREATE TYPE "PreferenciaSilla" AS ENUM ('VENTANA', 'PASILLO');

-- CreateEnum
CREATE TYPE "TipoViaje" AS ENUM ('NACIONAL', 'INTERNACIONAL');

-- CreateEnum
CREATE TYPE "TipoItinerario" AS ENUM ('SOLO_IDA', 'IDA_VUELTA', 'MULTIDESTINO');

-- CreateEnum
CREATE TYPE "CanalVenta" AS ENUM ('AMADEUS', 'SABRE', 'KONTROL_TRAVEL', 'KIU_TRAVEL', 'NDC', 'OTROS');

-- CreateEnum
CREATE TYPE "CategoriaProveedor" AS ENUM ('HOTEL_CADENA', 'ASISTENCIA_MEDICA', 'TECNOLOGIA_GDS', 'CONSOLIDADOR', 'MAYORISTA', 'AEROLINEA', 'HOTEL_PLATAFORMA', 'TRANSPORTE_TERRESTRE');

-- CreateEnum
CREATE TYPE "RemuneracionProveedor" AS ENUM ('COMISION', 'NETO_MARKUP');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('COP', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "CondicionPago" AS ENUM ('INMEDIATO', 'CREDITO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'ASESOR', 'FACTURADOR');

-- CreateEnum
CREATE TYPE "TYPE_DOCUMENT" AS ENUM ('CC', 'PAS', 'RUC');

-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('TIQUETE', 'HOTEL', 'ALQUILER_AUTO', 'SALON', 'EVENTO', 'SILLA', 'TARJETA_ASISTENCIA', 'TRASLADO', 'VISA', 'WEB_CHECKIN', 'PLAN_VACACIONAL');

-- CreateEnum
CREATE TYPE "TipoPagadoProveedor" AS ENUM ('SI', 'NO', 'NO_APLICA');

-- CreateEnum
CREATE TYPE "EstadoServicio" AS ENUM ('BORRADOR', 'DEVUELTO', 'POR_FACTURAR', 'FACTURADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('CASH', 'TARJETA_CREDITO', 'CREDITO_AGENCIA', 'OTROS');

-- CreateEnum
CREATE TYPE "TipoCash" AS ENUM ('EFECTIVO', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ADMINISTRADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "razonSocial" TEXT,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "documento" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "tipoPersona" "TipoPersona" NOT NULL,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pasajero" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "preferenciaSilla" "PreferenciaSilla" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pasajero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "proveedorId" INTEGER,
    "pasajeroId" INTEGER NOT NULL,
    "tipo" "TipoServicio" NOT NULL,
    "estado" "EstadoServicio" NOT NULL DEFAULT 'BORRADOR',
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL,
    "facturaProveedorUrl" TEXT,
    "facturaGoTravelUrl" TEXT,
    "soporteTiqueteElectronicoUrl" TEXT,
    "observaciones" TEXT,
    "formaPago" "TipoPago" NOT NULL,
    "tipoCash" "TipoCash",
    "numeroTarjeta" TEXT,
    "numeroAprobacion" TEXT,
    "creditoAgencia" INTEGER,
    "comprobantePagoUrl" TEXT,
    "proyectoFCDS" TEXT,
    "ceCos" TEXT,
    "vencimientoFacturaProveedor" TIMESTAMP(3),
    "pagadoProveedor" "TipoPagadoProveedor",
    "fechaPagoProveedor" TIMESTAMP(3),
    "fechaPagoCliente" TIMESTAMP(3),
    "pagadoCliente" BOOLEAN NOT NULL DEFAULT false,
    "creadoPorId" TEXT NOT NULL,
    "facturadoPorId" TEXT,
    "fechaFacturacion" TIMESTAMP(3),
    "motivoDevolucion" TEXT,
    "uuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleServicio" (
    "id" SERIAL NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "descripcionServicio" TEXT NOT NULL,
    "codigoReserva" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3),
    "fechaSalida" TIMESTAMP(3),
    "tarifaNeta" DECIMAL(65,30) NOT NULL,
    "ivaTarifa" DECIMAL(65,30) NOT NULL,
    "feePagoTarjetaCredito" DECIMAL(65,30) NOT NULL,
    "totalVentaAgencia" DECIMAL(65,30) NOT NULL,
    "tarifaNetaProveedor" DECIMAL(65,30) NOT NULL,
    "ivaTarifaProveedor" DECIMAL(65,30) NOT NULL,
    "comisionAgencia" DECIMAL(65,30) NOT NULL,
    "totalPagado" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetalleServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tiquete" (
    "id" SERIAL NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "numeroTiquete" TEXT NOT NULL,
    "codigoReserva" TEXT NOT NULL,
    "canalVenta" "CanalVenta" NOT NULL,
    "tipoViaje" "TipoViaje" NOT NULL,
    "tipoItinerario" "TipoItinerario" NOT NULL,
    "revision" BOOLEAN NOT NULL,
    "numeroTiqueteRevision" TEXT,
    "clase" TEXT NOT NULL,
    "tarifaNeta" DECIMAL(65,30) NOT NULL,
    "ivaTarifa" DECIMAL(65,30) NOT NULL,
    "otrosImpuestos" DECIMAL(65,30) NOT NULL,
    "tarifaAdministrativaNeta" DECIMAL(65,30) NOT NULL,
    "ivaTarifaAdministrativa" DECIMAL(65,30) NOT NULL,
    "feeAgenciaNeta" DECIMAL(65,30) NOT NULL,
    "ivaFeeAgencia" DECIMAL(65,30) NOT NULL,
    "tarifaAPH" DECIMAL(65,30) NOT NULL,
    "ivaTarifaAPH" DECIMAL(65,30),
    "totalPagar" DECIMAL(65,30) NOT NULL,
    "fechaEmisionTiqueteFES" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tiquete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrayectoTiquete" (
    "id" SERIAL NOT NULL,
    "tiqueteId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "origenId" INTEGER NOT NULL,
    "destinoId" INTEGER NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL,
    "fechaRegreso" TIMESTAMP(3),

    CONSTRAINT "TrayectoTiquete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "nit" TEXT NOT NULL,
    "categoria" "CategoriaProveedor" NOT NULL,
    "ciudad" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "correoComercial" TEXT,
    "correoFacturacion" TEXT,
    "contacto" TEXT,
    "remuneracion" "RemuneracionProveedor" NOT NULL,
    "monedaBase" "Moneda" NOT NULL,
    "condicionPago" "CondicionPago" NOT NULL,
    "documentosPdf" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" SERIAL NOT NULL,
    "codigoIATA" TEXT NOT NULL,
    "nombreAeropuerto" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_documento_key" ON "Cliente"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Pasajero_documento_key" ON "Pasajero"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_uuid_key" ON "Servicio"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleServicio_servicioId_key" ON "DetalleServicio"("servicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Tiquete_servicioId_key" ON "Tiquete"("servicioId");

-- CreateIndex
CREATE INDEX "TrayectoTiquete_origenId_idx" ON "TrayectoTiquete"("origenId");

-- CreateIndex
CREATE INDEX "TrayectoTiquete_destinoId_idx" ON "TrayectoTiquete"("destinoId");

-- CreateIndex
CREATE UNIQUE INDEX "TrayectoTiquete_tiqueteId_orden_key" ON "TrayectoTiquete"("tiqueteId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_nit_key" ON "Proveedor"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Ruta_codigoIATA_key" ON "Ruta"("codigoIATA");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_pasajeroId_fkey" FOREIGN KEY ("pasajeroId") REFERENCES "Pasajero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_facturadoPorId_fkey" FOREIGN KEY ("facturadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleServicio" ADD CONSTRAINT "DetalleServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tiquete" ADD CONSTRAINT "Tiquete_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrayectoTiquete" ADD CONSTRAINT "TrayectoTiquete_tiqueteId_fkey" FOREIGN KEY ("tiqueteId") REFERENCES "Tiquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrayectoTiquete" ADD CONSTRAINT "TrayectoTiquete_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrayectoTiquete" ADD CONSTRAINT "TrayectoTiquete_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
