-- CreateTable
CREATE TABLE "Pastor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "nombrePastora" TEXT,
    "iglesiaNombre" TEXT,
    "fotoUrl" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'HABILITADO',
    "password" TEXT NOT NULL DEFAULT '1234',
    "rol" TEXT NOT NULL DEFAULT 'USER',
    "vecesLogin" INTEGER NOT NULL DEFAULT 0,
    "vecesVisto" INTEGER NOT NULL DEFAULT 0,
    "ultimoLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pastor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Iglesia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "dias" TEXT,
    "horarios" TEXT,
    "ficheroCulto" TEXT,
    "personeria" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Iglesia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acta" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "iglesiaNombre" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Acta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pastor_dni_key" ON "Pastor"("dni");
