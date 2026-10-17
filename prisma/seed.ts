
import "dotenv/config";
import { prisma } from "@/libs/prisma";
import { fakerES as faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

// -------------------------------------------------------
// CONFIGURACIÓN
// -------------------------------------------------------

const CANTIDAD_CLIENTES = 15;
const CANTIDAD_PROVEEDORES = 10;
const CANTIDAD_SERVICIOS = 20;
const CANTIDAD_PASAJEROS = 30;

// Límites de caracteres para los nombres.
const MAX_NOMBRE_CLIENTE = 40;
const MAX_RAZON_SOCIAL = 45;
const MAX_NOMBRE_COMERCIAL = 45;
const MAX_NOMBRE_PASAJERO = 25;
const MAX_CONTACTO = 40;
const MAX_DESCRIPCION_SERVICIO = 60;

const TIPOS_SERVICIO = ["TIQUETE", "HOTEL"] as const;

const ESTADOS = [
  "BORRADOR",
  "DEVUELTO",
  "POR_FACTURAR",
  "FACTURADO",
  "ANULADO",
] as const;

const FORMAS_PAGO = [
  "CASH",
  "TARJETA_CREDITO",
  "CREDITO_AGENCIA",
] as const;

const TIPOS_ITINERARIO = [
  "SOLO_IDA",
  "IDA_VUELTA",
  "MULTIDESTINO",
] as const;

const CANALES_VENTA = [
  "AMADEUS",
  "SABRE",
  "KONTROL_TRAVEL",
  "KIU_TRAVEL",
  "NDC",
  "OTROS",
] as const;

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------

function randomItem<T>(array: readonly T[]): T {
  if (array.length === 0) {
    throw new Error("No hay elementos disponibles para seleccionar.");
  }

  return array[Math.floor(Math.random() * array.length)];
}

function limitarTexto(texto: string, maximo: number): string {
  return texto.trim().slice(0, maximo);
}

function randomMoney(min: number, max: number): number {
  return faker.number.float({
    min,
    max,
    fractionDigits: 2,
  });
}

function decimal(value: number): string {
  return value.toFixed(2);
}

function randomDate(start: Date, end: Date): Date {
  return faker.date.between({
    from: start,
    to: end,
  });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

type RutaSeed = {
  id: number;
  codigoIATA: string;
  ciudad: string;
  pais: string;
};

let rutasCargadas: RutaSeed[] = [];

function randomRuta(excludeId?: number): RutaSeed {
  const disponibles =
    excludeId === undefined
      ? rutasCargadas
      : rutasCargadas.filter((ruta) => ruta.id !== excludeId);

  if (disponibles.length === 0) {
    throw new Error(
      "No hay rutas disponibles. Verifica que existan al menos dos rutas en la base de datos.",
    );
  }

  return randomItem(disponibles);
}

// -------------------------------------------------------
// MAIN
// -------------------------------------------------------

async function main() {
  console.log("🌱 Iniciando seed de Kuantta...");

  // -----------------------------------------------------
  // LIMPIEZA DE DATOS OPERATIVOS
  //
  // IMPORTANTE:
  // No se eliminan las rutas existentes.
  // Tampoco se eliminan los usuarios ni las cuentas.
  // -----------------------------------------------------

  await prisma.trayectoTiquete.deleteMany();
  await prisma.tiquete.deleteMany();
  await prisma.detalleServicio.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.pasajero.deleteMany();

  console.log("🧹 Datos operativos anteriores eliminados.");
  console.log("🛡️ Las rutas existentes se conservarán.");

  // -----------------------------------------------------
  // RUTAS EXISTENTES
  // -----------------------------------------------------

  rutasCargadas = await prisma.ruta.findMany({
    select: {
      id: true,
      codigoIATA: true,
      ciudad: true,
      pais: true,
    },
  });

  if (rutasCargadas.length < 2) {
    throw new Error(
      "Se necesitan al menos dos rutas existentes en la base de datos para generar los trayectos. Ejecuta primero el seed de rutas.",
    );
  }

  console.log(
    `✈️ ${rutasCargadas.length} rutas existentes disponibles. No se crearán ni eliminarán rutas.`,
  );

  // -----------------------------------------------------
  // USUARIOS
  // -----------------------------------------------------

  const password = await bcrypt.hash("Octubre$$2026", 10);

  const usuarios = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@kuantta.com" },
      update: {},
      create: {
        name: "Administrador",
        email: "admin@kuantta.com",
        password,
        role: "ADMINISTRADOR",
      },
    }),
    prisma.user.upsert({
      where: { email: "asesor@kuantta.com" },
      update: {},
      create: {
        name: "Asesor",
        email: "asesor@kuantta.com",
        password,
        role: "ASESOR",
      },
    }),
    prisma.user.upsert({
      where: { email: "facturador@kuantta.com" },
      update: {},
      create: {
        name: "Facturador",
        email: "facturador@kuantta.com",
        password,
        role: "FACTURADOR",
      },
    }),
  ]);

  const [admin, asesor, facturador] = usuarios;

  // -----------------------------------------------------
  // CLIENTES
  // -----------------------------------------------------

  const clientes = [];

  for (let i = 0; i < CANTIDAD_CLIENTES; i++) {
    const tipoPersona = randomItem(["NATURAL", "JURIDICA"] as const);

    const nombreNatural = limitarTexto(
      `${faker.person.firstName()} ${faker.person.lastName()}`,
      MAX_NOMBRE_CLIENTE,
    );

    const nombre =
      tipoPersona === "NATURAL"
        ? nombreNatural
        : limitarTexto(faker.company.name(), MAX_RAZON_SOCIAL);

    const tipoDocumento =
      tipoPersona === "JURIDICA"
        ? "NIT"
        : randomItem(["CEDULA", "PASAPORTE"] as const);

    const cliente = await prisma.cliente.create({
      data: {
        nombre,

        razonSocial:
          tipoPersona === "JURIDICA"
            ? limitarTexto(faker.company.name(), MAX_RAZON_SOCIAL)
            : null,

        tipoDocumento,

        documento:
          tipoDocumento === "NIT"
            ? `900${String(i + 1).padStart(7, "0")}`
            : `${tipoDocumento === "CEDULA" ? "CC" : "PA"}${String(i + 1).padStart(10, "0")}`,

        direccion: limitarTexto(faker.location.streetAddress(), 80),
        ciudad: limitarTexto(faker.location.city(), 40),
        telefono: faker.phone.number(),
        correo: `cliente${i + 1}@example.com`,

        tipoPersona,
        observaciones: null,
        activo: true,
      },
    });

    clientes.push(cliente);
  }

  console.log(`👥 ${clientes.length} clientes creados.`);

  // -----------------------------------------------------
  // PASAJEROS
  // -----------------------------------------------------

  const pasajeros = [];

  for (let i = 0; i < CANTIDAD_PASAJEROS; i++) {
    const pasajero = await prisma.pasajero.create({
      data: {
        nombre: limitarTexto(
          faker.person.firstName(),
          MAX_NOMBRE_PASAJERO,
        ),

        apellido: limitarTexto(
          faker.person.lastName(),
          MAX_NOMBRE_PASAJERO,
        ),

        documento: `PAS${String(i + 1).padStart(10, "0")}`,

        fechaNacimiento: faker.date.birthdate({
          min: 18,
          max: 75,
          mode: "age",
        }),

        correo: `pasajero${i + 1}@example.com`,
        telefono: faker.phone.number(),

        preferenciaSilla: randomItem(["VENTANA", "PASILLO"] as const),
        activo: true,
      },
    });

    pasajeros.push(pasajero);
  }

  console.log(`🧳 ${pasajeros.length} pasajeros creados.`);

  // -----------------------------------------------------
  // PROVEEDORES
  // -----------------------------------------------------

  const proveedores = [];

  for (let i = 0; i < CANTIDAD_PROVEEDORES; i++) {
    const proveedor = await prisma.proveedor.create({
      data: {
        razonSocial: limitarTexto(
          faker.company.name(),
          MAX_RAZON_SOCIAL,
        ),

        nombreComercial: limitarTexto(
          faker.company.name(),
          MAX_NOMBRE_COMERCIAL,
        ),

        nit: `900${String(i + 1).padStart(7, "0")}`,

        categoria: randomItem([
          "HOTEL_CADENA",
          "ASISTENCIA_MEDICA",
          "TECNOLOGIA_GDS",
          "CONSOLIDADOR",
          "MAYORISTA",
          "AEROLINEA",
          "HOTEL_PLATAFORMA",
          "TRANSPORTE_TERRESTRE",
        ] as const),

        ciudad: limitarTexto(faker.location.city(), 40),
        direccion: limitarTexto(faker.location.streetAddress(), 80),
        telefono: faker.phone.number(),

        correoComercial: `comercial${i + 1}@example.com`,
        correoFacturacion: `facturacion${i + 1}@example.com`,

        contacto: limitarTexto(
          `${faker.person.firstName()} ${faker.person.lastName()}`,
          MAX_CONTACTO,
        ),

        remuneracion: randomItem(["COMISION", "NETO_MARKUP"] as const),
        monedaBase: randomItem(["COP", "USD", "EUR"] as const),
        condicionPago: randomItem(["INMEDIATO", "CREDITO"] as const),

        documentosPdf: [],
        activo: true,
      },
    });

    proveedores.push(proveedor);
  }

  console.log(`🏢 ${proveedores.length} proveedores creados.`);

  // -----------------------------------------------------
  // FECHAS
  // -----------------------------------------------------

  const ahora = new Date();
  const haceUnAnio = new Date();

  haceUnAnio.setFullYear(ahora.getFullYear() - 1);

  // -----------------------------------------------------
  // SERVICIOS
  // -----------------------------------------------------

  let tiquetesCreados = 0;
  let trayectosCreados = 0;
  let detallesCreados = 0;

  for (let i = 0; i < CANTIDAD_SERVICIOS; i++) {
    const tipo = TIPOS_SERVICIO[i % TIPOS_SERVICIO.length];

    const cliente = randomItem(clientes);
    const pasajero = randomItem(pasajeros);

    const proveedor =
      Math.random() > 0.05
        ? randomItem(proveedores)
        : null;

    const estado = randomItem(ESTADOS);

    const fechaEmision = randomDate(haceUnAnio, ahora);
    const fechaSolicitud = randomDate(haceUnAnio, fechaEmision);

    // ---------------------------------------------------
    // FORMA DE PAGO
    // ---------------------------------------------------

    const formaPago = randomItem(FORMAS_PAGO);

    const tipoCash =
      formaPago === "CASH"
        ? randomItem(["EFECTIVO", "TRANSFERENCIA"] as const)
        : null;

    const creditoAgencia =
      formaPago === "CREDITO_AGENCIA"
        ? randomItem([3, 8, 15, 30])
        : null;

    const numeroTarjeta =
      formaPago === "TARJETA_CREDITO"
        ? faker.finance.creditCardNumber()
        : null;

    const numeroAprobacion =
      formaPago === "TARJETA_CREDITO"
        ? faker.string.numeric(6)
        : null;

    // ---------------------------------------------------
    // PAGOS
    // ---------------------------------------------------

    const pagadoProveedor = !proveedor
      ? "NO_APLICA"
      : randomItem(["SI", "NO"] as const);

    const fechaPagoProveedor =
      pagadoProveedor === "SI"
        ? randomDate(fechaEmision, ahora)
        : null;

    const pagadoCliente = Math.random() > 0.3;

    const fechaPagoCliente = pagadoCliente
      ? randomDate(fechaEmision, ahora)
      : null;

    // ---------------------------------------------------
    // FACTURACIÓN
    // ---------------------------------------------------

    const facturado = estado === "FACTURADO";

    const fechaFacturacion = facturado
      ? randomDate(fechaEmision, ahora)
      : null;

    const creadoPor = randomItem([admin, asesor]);
    const facturadoPor = facturado ? facturador : null;

    // ---------------------------------------------------
    // CREAR SERVICIO
    // ---------------------------------------------------

    const servicio = await prisma.servicio.create({
      data: {
        clienteId: cliente.id,
        pasajeroId: pasajero.id,
        proveedorId: proveedor?.id ?? null,

        tipo,
        estado,
        fechaEmision,
        fechaSolicitud,

        formaPago,
        tipoCash,
        numeroTarjeta,
        numeroAprobacion,
        creditoAgencia,

        proyectoFCDS:
          Math.random() > 0.5
            ? `FCDS-${faker.string.numeric(4)}`
            : null,

        ceCos:
          Math.random() > 0.5
            ? `CC-${faker.string.numeric(4)}`
            : null,

        vencimientoFacturaProveedor: proveedor
          ? addDays(fechaEmision, 30)
          : null,

        pagadoProveedor,
        fechaPagoProveedor,
        fechaPagoCliente,
        pagadoCliente,

        observaciones:
          Math.random() > 0.7
            ? limitarTexto(faker.lorem.sentence(), 160)
            : null,

        facturaProveedorUrl: facturado
          ? "https://example.com/factura-proveedor.pdf"
          : null,

        facturaGoTravelUrl: facturado
          ? "https://example.com/factura-gotravel.pdf"
          : null,

        soporteTiqueteElectronicoUrl:
          tipo === "TIQUETE"
            ? "https://example.com/soporte-tiquete.pdf"
            : null,

        creadoPorId: creadoPor.id,
        facturadoPorId: facturadoPor?.id ?? null,
        fechaFacturacion,

        motivoDevolucion:
          estado === "DEVUELTO"
            ? limitarTexto(faker.lorem.sentence(), 160)
            : null,
      },
    });

    // ---------------------------------------------------
    // TIQUETES Y TRAYECTOS
    // ---------------------------------------------------

    if (tipo === "TIQUETE") {
      const tipoItinerario = randomItem(TIPOS_ITINERARIO);

      const tarifaNeta = randomMoney(300_000, 2_500_000);
      const ivaTarifa = tarifaNeta * 0.19;
      const otrosImpuestos = randomMoney(20_000, 300_000);

      const tarifaAdministrativaNeta = randomMoney(20_000, 100_000);
      const ivaTarifaAdministrativa = tarifaAdministrativaNeta * 0.19;

      const feeAgenciaNeta = randomMoney(20_000, 150_000);
      const ivaFeeAgencia = feeAgenciaNeta * 0.19;

      const tarifaAPH = randomMoney(10_000, 80_000);
      const ivaTarifaAPH = tarifaAPH * 0.19;

      const totalPagar =
        tarifaNeta +
        ivaTarifa +
        otrosImpuestos +
        tarifaAdministrativaNeta +
        ivaTarifaAdministrativa +
        feeAgenciaNeta +
        ivaFeeAgencia +
        tarifaAPH +
        ivaTarifaAPH;

      const fechaIda = faker.date.soon({
        days: 180,
        refDate: fechaEmision,
      });

      const revision = Math.random() > 0.85;

      const cantidadTrayectos =
        tipoItinerario === "SOLO_IDA"
          ? 1
          : tipoItinerario === "IDA_VUELTA"
            ? 2
            : faker.number.int({ min: 3, max: 4 });

      const trayectosData: {
        orden: number;
        origenId: number;
        destinoId: number;
        fechaSalida: Date;
        fechaRegreso: Date | null;
      }[] = [];

      let aeropuertoActual = randomRuta();

      for (let j = 0; j < cantidadTrayectos; j++) {
        let origen = aeropuertoActual;
        let destino: RutaSeed;

        if (tipoItinerario === "IDA_VUELTA" && j === 1) {
          // El regreso invierte el origen y destino de la ida.
          origen = rutasCargadas.find(
            (ruta) => ruta.id === trayectosData[0].destinoId,
          )!;

          destino = rutasCargadas.find(
            (ruta) => ruta.id === trayectosData[0].origenId,
          )!;
        } else {
          destino = randomRuta(origen.id);
        }

        const fechaSalida =
          j === 0
            ? fechaIda
            : addDays(
                trayectosData[j - 1].fechaSalida,
                tipoItinerario === "IDA_VUELTA" ? 5 : 2,
              );

        trayectosData.push({
          orden: j + 1,
          origenId: origen.id,
          destinoId: destino.id,
          fechaSalida,
          fechaRegreso: new Date(
            fechaSalida.getTime() + 3 * 60 * 60 * 1000,
          ),
        });

        aeropuertoActual = destino;
      }

      await prisma.tiquete.create({
        data: {
          servicioId: servicio.id,

          numeroTiquete: faker.string.numeric(13),
          codigoReserva: faker.string
            .alphanumeric(6)
            .toUpperCase(),

          canalVenta: randomItem(CANALES_VENTA),
          tipoViaje: randomItem(["NACIONAL", "INTERNACIONAL"] as const),
          tipoItinerario,

          revision,
          numeroTiqueteRevision: revision
            ? faker.string.numeric(13)
            : null,

          clase: randomItem(["E", "B", "M", "Y", "J"] as const),

          tarifaNeta: decimal(tarifaNeta),
          ivaTarifa: decimal(ivaTarifa),
          otrosImpuestos: decimal(otrosImpuestos),

          tarifaAdministrativaNeta: decimal(tarifaAdministrativaNeta),
          ivaTarifaAdministrativa: decimal(ivaTarifaAdministrativa),

          feeAgenciaNeta: decimal(feeAgenciaNeta),
          ivaFeeAgencia: decimal(ivaFeeAgencia),

          tarifaAPH: decimal(tarifaAPH),
          ivaTarifaAPH: decimal(ivaTarifaAPH),

          totalPagar: decimal(totalPagar),
          fechaEmisionTiqueteFES: fechaEmision,

          trayectos: {
            create: trayectosData.map((trayecto) => ({
              orden: trayecto.orden,
              fechaSalida: trayecto.fechaSalida,
              fechaRegreso: trayecto.fechaRegreso,

              origen: {
                connect: { id: trayecto.origenId },
              },

              destino: {
                connect: { id: trayecto.destinoId },
              },
            })),
          },
        },
      });

      tiquetesCreados++;
      trayectosCreados += cantidadTrayectos;
    } else {
      // -------------------------------------------------
      // DETALLE DE HOTEL
      // -------------------------------------------------

      const tarifaNeta = randomMoney(250_000, 1_500_000);
      const ivaTarifa = tarifaNeta * 0.19;

      const tarifaNetaProveedor = tarifaNeta * faker.number.float({
        min: 0.65,
        max: 0.9,
        fractionDigits: 2,
      });

      const ivaTarifaProveedor = tarifaNetaProveedor * 0.19;

      const feePagoTarjetaCredito =
        formaPago === "TARJETA_CREDITO"
          ? randomMoney(10_000, 100_000)
          : 0;

      const totalVentaAgencia =
        tarifaNeta + ivaTarifa + feePagoTarjetaCredito;

      const totalPagado =
        tarifaNetaProveedor + ivaTarifaProveedor;

      const comisionAgencia = tarifaNeta - tarifaNetaProveedor;

      const fechaIngreso = faker.date.soon({
        days: 180,
        refDate: fechaEmision,
      });

      const fechaSalida = addDays(
        fechaIngreso,
        faker.number.int({ min: 1, max: 14 }),
      );

      // La ubicación se obtiene de una ruta existente.
      const ubicacion = randomRuta();

      await prisma.detalleServicio.create({
        data: {
          servicioId: servicio.id,

          descripcionServicio: limitarTexto(
            `Alojamiento en ${faker.company.name()}`,
            MAX_DESCRIPCION_SERVICIO,
          ),

          codigoReserva: faker.string
            .alphanumeric(8)
            .toUpperCase(),

          ciudad: ubicacion.ciudad,
          pais: ubicacion.pais,

          fechaIngreso,
          fechaSalida,

          tarifaNeta: decimal(tarifaNeta),
          ivaTarifa: decimal(ivaTarifa),
          feePagoTarjetaCredito: decimal(feePagoTarjetaCredito),
          totalVentaAgencia: decimal(totalVentaAgencia),

          tarifaNetaProveedor: decimal(tarifaNetaProveedor),
          ivaTarifaProveedor: decimal(ivaTarifaProveedor),
          comisionAgencia: decimal(comisionAgencia),
          totalPagado: decimal(totalPagado),
        },
      });

      detallesCreados++;
    }
  }

  // -----------------------------------------------------
  // RESUMEN
  // -----------------------------------------------------

  console.log("\n📊 RESUMEN DEL SEED");
  console.log(`👥 Clientes: ${clientes.length}`);
  console.log(`🧳 Pasajeros: ${pasajeros.length}`);
  console.log(`🏢 Proveedores: ${proveedores.length}`);
  console.log(`✈️ Rutas conservadas y utilizadas: ${rutasCargadas.length}`);
  console.log(`📦 Servicios: ${CANTIDAD_SERVICIOS}`);
  console.log(`🎫 Tiquetes: ${tiquetesCreados}`);
  console.log(`🛫 Trayectos: ${trayectosCreados}`);
  console.log(`🏨 Detalles de hotel: ${detallesCreados}`);
  console.log("✅ Seed completado.");
}

main()
  .catch((error) => {
    console.error("❌ Error ejecutando seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
