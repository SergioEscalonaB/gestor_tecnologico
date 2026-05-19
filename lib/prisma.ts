import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Pattern oficial de Prisma + Next.js para evitar agotar las conexiones a la Base de Datos.
// Guarda la instancia en un objeto global durante el desarrollo para reutilizar la misma conexión.
export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
