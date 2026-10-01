import "dotenv/config";
import { prisma } from "@/libs/prisma";
import { fakerES as faker } from "@faker-js/faker";

const CANTIDAD_CLIENTES = 15;
const CANTIDAD_PROVEEDORES = 10;
const CANTIDAD_RUTAS = 20;
const CANTIDAD_SERVICIOS = 100;

const TIPOS_SERVICIO = [
  "TIQUETE",
  "HOTEL",
  "ALQUILER_AUTO",
  "SALON",
  "EVENTO",
  "SILLA",
  "TARJETA_ASISTENCIA",
  "TRASLADO",
  "VISA",
  "WEB_CHECKIN",
  "PLAN_VACACIONAL",
] as const;

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

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomMoney(min: number, max: number) {
  return faker.number.float({
    min,
    max,
    fractionDigits: 2,
  });
}

function randomDate(start: Date, end: Date) {
  return faker.date.between({
    from: start,
    to: end,
  });
}

function decimal(value: number) {
  return value.toFixed(2);
}

async function main() {
  console.log("🌱 Iniciando seed...");

  // ---------------------------------------------------------
  // LIMPIAR BASE DE DATOS
  // ---------------------------------------------------------

  await prisma.tiquete.deleteMany();
  await prisma.detalleServicio.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.ruta.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.cliente.deleteMany();

  console.log("🧹 Datos anteriores eliminados");

  // ---------------------------------------------------------
  // USUARIO
  // ---------------------------------------------------------

  const usuario = await prisma.user.findFirst({
    select: {
      id: true,
    },
  });

  if (!usuario) {
    throw new Error(
      "No existe ningún usuario. Crea al menos un usuario antes de ejecutar el seed.",
    );
  }

  // ---------------------------------------------------------
  // CLIENTES
  // ---------------------------------------------------------

  const clientes = [];

  for (let i = 0; i < CANTIDAD_CLIENTES; i++) {
    const nombre = faker.person.firstName();
    const apellido = faker.person.lastName();

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        apellido,
        correo: faker.internet.email({
          firstName: nombre,
          lastName: apellido,
        }),
        telefono: faker.phone.number(),
      },
    });

    clientes.push(cliente);
  }

  console.log(`👥 ${clientes.length} clientes creados`);

  // ---------------------------------------------------------
  // PROVEEDORES
  // ---------------------------------------------------------

  const proveedores = [];

  for (let i = 0; i < CANTIDAD_PROVEEDORES; i++) {
    const proveedor = await prisma.proveedor.create({
      data: {
        razonSocial: faker.company.name(),

        // Evitamos posibles duplicados por el @unique de ruc
        ruc: `900${String(i + 1).padStart(7, "0")}`,

        direccionFiscal: faker.location.streetAddress(),

        telefono: faker.phone.number(),

        correo: faker.internet.email(),
      },
    });

    proveedores.push(proveedor);
  }

  console.log(`🏢 ${proveedores.length} proveedores creados`);

  // ---------------------------------------------------------
  // RUTAS
  // ---------------------------------------------------------

  const ciudades = [
    {
      ciudad: "Bogotá",
      codigo: "BOG",
    },
    {
      ciudad: "Medellín",
      codigo: "MDE",
    },
    {
      ciudad: "Cali",
      codigo: "CLO",
    },
    {
      ciudad: "Cartagena",
      codigo: "CTG",
    },
    {
      ciudad: "Barranquilla",
      codigo: "BAQ",
    },
    {
      ciudad: "Miami",
      codigo: "MIA",
    },
    {
      ciudad: "Madrid",
      codigo: "MAD",
    },
    {
      ciudad: "Ciudad de México",
      codigo: "MEX",
    },
    {
      ciudad: "Lima",
      codigo: "LIM",
    },
    {
      ciudad: "Panamá",
      codigo: "PTY",
    },
  ];

  const rutas = [];

  for (let i = 0; i < CANTIDAD_RUTAS; i++) {
    const origen = randomItem(ciudades);

    let destino = randomItem(ciudades);

    while (destino.codigo === origen.codigo) {
      destino = randomItem(ciudades);
    }

    const ruta = await prisma.ruta.create({
      data: {
        origen: origen.ciudad,
        codigoOrigen: origen.codigo,
        destino: destino.ciudad,
        codigoDestino: destino.codigo,
      },
    });

    rutas.push(ruta);
  }

  console.log(`✈️ ${rutas.length} rutas creadas`);

  // ---------------------------------------------------------
  // FECHAS
  // ---------------------------------------------------------

  const ahora = new Date();

  const haceUnAnio = new Date();
  haceUnAnio.setFullYear(ahora.getFullYear() - 1);

  // ---------------------------------------------------------
  // SERVICIOS
  // ---------------------------------------------------------

  let tiquetesCreados = 0;
  let detallesCreados = 0;

  for (let i = 0; i < CANTIDAD_SERVICIOS; i++) {
    const tipo = randomItem(TIPOS_SERVICIO);

    const cliente = randomItem(clientes);

    // 10% de los servicios no tienen proveedor
    const tieneProveedor = Math.random() > 0.05;

    const proveedor = tieneProveedor
      ? randomItem(proveedores)
      : null;

    const estado = randomItem(ESTADOS);

    const fechaEmision = randomDate(haceUnAnio, ahora);

    // -------------------------------------------------------
    // FORMA DE PAGO
    // -------------------------------------------------------

    const formaPago = randomItem(FORMAS_PAGO);

    let tipoCash:
      | "EFECTIVO"
      | "TRANSFERENCIA"
      | null = null;

    let creditoAgencia: number | null = null;

    let numeroTarjeta: string | null = null;

    let numeroAprobacion: string | null = null;

    if (formaPago === "CASH") {
      tipoCash = randomItem([
        "EFECTIVO",
        "TRANSFERENCIA",
      ] as const);
    }

    if (formaPago === "CREDITO_AGENCIA") {
      creditoAgencia = randomItem([3, 8, 15, 30]);
    }

    if (formaPago === "TARJETA_CREDITO") {
      numeroTarjeta = faker.finance.creditCardNumber();
      numeroAprobacion = faker.string.numeric(6);
    }

    // -------------------------------------------------------
    // PAGO AL PROVEEDOR
    // -------------------------------------------------------

    let pagadoProveedor:
      | "SI"
      | "NO"
      | "NO_APLICA";

    let fechaPagoProveedor: Date | null = null;

    if (!proveedor) {
      pagadoProveedor = "NO_APLICA";
    } else {
      pagadoProveedor = randomItem([
        "SI",
        "NO",
      ] as const);

      if (pagadoProveedor === "SI") {
        fechaPagoProveedor = randomDate(
          fechaEmision,
          ahora,
        );
      }
    }

    // -------------------------------------------------------
    // FECHA PAGO CLIENTE
    // -------------------------------------------------------

    // Aproximadamente 70% de los servicios ya fueron pagados
    // por el cliente.
    const clienteYaPago = Math.random() > 0.3;

    const fechaPagoCliente = clienteYaPago
      ? randomDate(fechaEmision, ahora)
      : null;

    // -------------------------------------------------------
    // FECHA FACTURACIÓN
    // -------------------------------------------------------

    const fechaFacturacion =
      estado === "FACTURADO"
        ? randomDate(fechaEmision, ahora)
        : null;

    // -------------------------------------------------------
    // CREAR SERVICIO
    // -------------------------------------------------------

    const servicio = await prisma.servicio.create({
      data: {
        clienteId: cliente.id,

        proveedorId: proveedor?.id ?? null,

        tipo,

        estado,

        fechaEmision,

        // ---------------------------------------------------
        // FORMA DE PAGO
        // ---------------------------------------------------

        formaPago,

        tipoCash,

        numeroTarjeta,

        numeroAprobacion,

        creditoAgencia,

        // ---------------------------------------------------
        // INFORMACIÓN ADMINISTRATIVA
        // ---------------------------------------------------

        proyectoFCDS:
          Math.random() > 0.5
            ? `FCDS-${faker.string.numeric(4)}`
            : null,

        ceCos:
          Math.random() > 0.5
            ? `CC-${faker.string.numeric(4)}`
            : null,

        vencimientoFacturaProveedor:
          proveedor && tipo !== "TIQUETE"
            ? faker.date.soon({
                days: 30,
                refDate: fechaEmision,
              })
            : null,

        pagadoProveedor,

        fechaPagoProveedor,

        fechaPagoCliente,

        observaciones:
          Math.random() > 0.7
            ? faker.lorem.sentence()
            : null,

        // ---------------------------------------------------
        // DOCUMENTOS
        // ---------------------------------------------------

        facturaProveedorUrl:
          estado === "FACTURADO"
            ? "https://example.com/factura-proveedor.pdf"
            : null,

        facturaGoTravelUrl:
          estado === "FACTURADO"
            ? "https://example.com/factura-gotravel.pdf"
            : null,

        soporteTiqueteElectronicoUrl:
          tipo === "TIQUETE"
            ? "https://example.com/soporte-tiquete.pdf"
            : null,

        // ---------------------------------------------------
        // FACTURACIÓN
        // ---------------------------------------------------

        creadoPorId: usuario.id,

        facturadoPorId:
          estado === "FACTURADO"
            ? usuario.id
            : null,

        fechaFacturacion,

        motivoDevolucion:
          estado === "DEVUELTO"
            ? faker.lorem.sentence()
            : null,
      },
    });

    // =======================================================
    // TIQUETE
    // =======================================================

    if (tipo === "TIQUETE") {
      const ruta = randomItem(rutas);

      const tarifaNeta = randomMoney(
        300_000,
        2_500_000,
      );

      const ivaTarifa = tarifaNeta * 0.19;

      const otrosImpuestos = randomMoney(
        20_000,
        300_000,
      );

      const tarifaAdministrativaNeta = randomMoney(
        20_000,
        100_000,
      );

      const ivaTarifaAdministrativa =
        tarifaAdministrativaNeta * 0.19;

      const feeAgenciaNeta = randomMoney(
        20_000,
        150_000,
      );

      const ivaFeeAgencia = feeAgenciaNeta * 0.19;

      const feePagoTarjeta =
        formaPago === "TARJETA_CREDITO"
          ? randomMoney(10_000, 80_000)
          : 0;

      const totalPagar =
        tarifaNeta +
        ivaTarifa +
        otrosImpuestos +
        tarifaAdministrativaNeta +
        ivaTarifaAdministrativa +
        feeAgenciaNeta +
        ivaFeeAgencia +
        feePagoTarjeta;

      // -----------------------------------------------------
      // FECHAS DEL VIAJE
      // -----------------------------------------------------

      const fechaIda = faker.date.soon({
        days: 180,
        refDate: fechaEmision,
      });

      const tieneRegreso = Math.random() > 0.3;

      const fechaRegreso = tieneRegreso
        ? faker.date.soon({
            days: 15,
            refDate: fechaIda,
          })
        : null;

      // -----------------------------------------------------
      // REVISIÓN
      // -----------------------------------------------------

      const revision = Math.random() > 0.85;

      const numeroTiqueteRevision = revision
        ? faker.string.numeric(13)
        : null;

      // -----------------------------------------------------
      // CREAR TIQUETE
      // -----------------------------------------------------

      await prisma.tiquete.create({
        data: {
          servicioId: servicio.id,

          rutaId: ruta.id,

          numeroTiquete: faker.string.numeric(13),

          revision,

          numeroTiqueteRevision,

          clase: randomItem([
            "E",
            "B",
            "M",
            "Y",
            "J",
          ]),

          pasajero: `${faker.person.firstName()} ${faker.person.lastName()}`,

          fechaIda,

          fechaRegreso,

          tarifaNeta: decimal(tarifaNeta),

          tarifaAdministrativaNeta: decimal(
            tarifaAdministrativaNeta,
          ),

          ivaTarifaAdministrativa: decimal(
            ivaTarifaAdministrativa,
          ),

          feeAgenciaNeta: decimal(feeAgenciaNeta),

          ivaFeeAgencia: decimal(ivaFeeAgencia),

          feePagoTarjeta: decimal(feePagoTarjeta),

          totalPagar: decimal(totalPagar),

          aph: randomItem([
            "NACIONAL",
            "INTERNACIONAL",
          ]),

          ivaTarifa: decimal(ivaTarifa),

          otrosImpuestos: decimal(otrosImpuestos),

          fechaEmisionTiqueteFES: fechaEmision,
        },
      });

      tiquetesCreados++;
    }

    // =======================================================
    // DETALLE SERVICIO
    // =======================================================

    else {
      // Primero generamos lo que GoTravel cobra.
      const valorPagadoGoTravel = randomMoney(
        100_000,
        3_500_000,
      );

      // El proveedor nunca puede costar más que lo cobrado
      // al cliente/GoTravel.
      const valorPagadoProveedor = randomMoney(
        100_000,
        valorPagadoGoTravel,
      );

      const trm = randomMoney(
        3_500,
        4_500,
      );

      const feePagoTarjetaCredito =
        formaPago === "TARJETA_CREDITO"
          ? randomMoney(10_000, 100_000)
          : 0;

      const totalIngreso =
        valorPagadoGoTravel -
        valorPagadoProveedor;

      await prisma.detalleServicio.create({
        data: {
          servicioId: servicio.id,

          descripcionServicio:
            faker.lorem.sentence(),

          pasajero: `${faker.person.firstName()} ${faker.person.lastName()}`,

          codigoReserva:
            faker.string
              .alphanumeric(8)
              .toUpperCase(),

          valorPagadoProveedor:
            decimal(valorPagadoProveedor),

          trm: decimal(trm),

          feePagoTarjetaCredito:
            decimal(feePagoTarjetaCredito),

          valorPagadoGoTravel:
            decimal(valorPagadoGoTravel),

          totalIngreso:
            decimal(totalIngreso),
        },
      });

      detallesCreados++;
    }
  }

  // ---------------------------------------------------------
  // RESUMEN
  // ---------------------------------------------------------

  console.log(`👥 ${clientes.length} clientes creados`);
  console.log(`🏢 ${proveedores.length} proveedores creados`);
  console.log(`✈️ ${rutas.length} rutas creadas`);
  console.log(`🎫 ${tiquetesCreados} tiquetes creados`);
  console.log(`📋 ${detallesCreados} servicios generales creados`);
  console.log(
    `📦 ${tiquetesCreados + detallesCreados} servicios totales creados`,
  );

  console.log("✅ Seed completado");
}

main().catch((error) => {
  console.error("❌ Error ejecutando seed:", error);
  process.exit(1);
});