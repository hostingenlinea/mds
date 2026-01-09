const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const dniAdmin = "11111111"; // USUARIO
  const passAdmin = "admin123"; // CONTRASEÑA

  console.log("Creando administrador...");
  const hashedPassword = await bcrypt.hash(passAdmin, 10);

  const admin = await prisma.pastor.upsert({
    where: { dni: dniAdmin },
    update: {},
    create: {
      nombre: "Administrador",
      apellido: "Principal",
      dni: dniAdmin,
      password: hashedPassword,
      rol: "ADMIN",
      estado: "HABILITADO",
      iglesiaNombre: "Casa Central"
    },
  });
  console.log(`✅ Admin creado: Usuario ${dniAdmin} / Clave ${passAdmin}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());