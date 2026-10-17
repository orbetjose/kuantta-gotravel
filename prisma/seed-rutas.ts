import "dotenv/config";
import { prisma } from "@/libs/prisma";
import { AEROPUERTOS } from "./aeropuertos";


async function main() {
  for (const aeropuerto of AEROPUERTOS) {
    await prisma.ruta.upsert({
      where: {
        codigoIATA: aeropuerto.codigoIATA,
      },
      update: {
        nombreAeropuerto: aeropuerto.nombreAeropuerto,
        ciudad: aeropuerto.ciudad,
        pais: aeropuerto.pais,
        region: aeropuerto.region,
      },
      create: {
        ...aeropuerto,
      },
    });
  }

  console.log(`Aeropuertos procesados: ${AEROPUERTOS.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });