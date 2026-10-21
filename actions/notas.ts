"use server";

import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { NotaFormValues } from "@/libs/schemas/notaSchema";
import { revalidatePath } from "next/cache";

const RUTA_NOTAS = "/dashboard/notas";

type ResultadoNota =
  | {
      success: true;
      nota: {
        id: string;
        fijada: boolean;
        titulo: string;
        contenido: string;
        createdAt: Date;
      };
    }
  | { success: false; error: string };

type ResultadoAccion = {
  success: boolean;
  error?: string;
};

async function obtenerUsuarioId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function crearNota(data: NotaFormValues): Promise<ResultadoNota> {
  const usuarioId = await obtenerUsuarioId();

  if (!usuarioId) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  if (!data.titulo || !data.contenido) {
    return {
      success: false,
      error: "El título y el contenido son obligatorios.",
    };
  }

  if (data.titulo.length > 100) {
    return {
      success: false,
      error: "El título no puede superar los 100 caracteres.",
    };
  }

  if (data.contenido.length > 10000) {
    return {
      success: false,
      error: "El contenido no puede superar los 10.000 caracteres.",
    };
  }

  const nota = await prisma.nota.create({
    data: {
      titulo: data.titulo,
      contenido: data.contenido,
      usuarioId,
    },
    select: {
      id: true,
      titulo: true,
      contenido: true,
      fijada: true,
      createdAt: true,
    },
  });

  revalidatePath(RUTA_NOTAS);

  return { success: true, nota };
}

export async function eliminarNota(notaId: string): Promise<ResultadoAccion> {
  const usuarioId = await obtenerUsuarioId();

  if (!usuarioId) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  if (!notaId || notaId.length > 30) {
    return { success: false, error: "Identificador inválido." };
  }

  const resultado = await prisma.nota.deleteMany({
    where: {
      id: notaId,
      usuarioId,
    },
  });

  if (resultado.count === 0) {
    return {
      success: false,
      error: "La nota no existe o no tienes permiso para eliminarla.",
    };
  }

  revalidatePath(RUTA_NOTAS);

  return { success: true };
}

export async function alternarNotaFijada(
  notaId: string,
): Promise<ResultadoNota> {
  const usuarioId = await obtenerUsuarioId();

  if (!usuarioId) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  if (!notaId || notaId.length > 30) {
    return { success: false, error: "Identificador inválido." };
  }

  const nota = await prisma.nota.findFirst({
    where: {
      id: notaId,
      usuarioId,
    },
    select: {
      id: true,
      fijada: true,
    },
  });

  if (!nota) {
    return {
      success: false,
      error: "La nota no existe o no tienes permiso para modificarla.",
    };
  }

  const notaActualizada = await prisma.nota.update({
    where: {
      id: nota.id,
    },
    data: {
      fijada: !nota.fijada,
    },
    select: {
      id: true,
      titulo: true,
      contenido: true,
      fijada: true,
      createdAt: true,
    },
  });

  revalidatePath(RUTA_NOTAS);

  return { success: true, nota: notaActualizada };
}
