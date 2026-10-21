-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "contenido" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Nota_usuarioId_createdAt_idx" ON "Nota"("usuarioId", "createdAt");

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
