import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Configuración de Prisma con PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Obtener todos los empleados
export async function GET() {
  const empleados = await prisma.employee.findMany({
    orderBy: { nombre: "asc" }
  });
  return Response.json(empleados);
}

// Crear nuevo empleado
export async function POST(req: Request) {
  const body = await req.json();
  const { nombre, cargo, area, correo_electronico } = body;

  // Validación básica
  if (!nombre || !cargo || !area || !correo_electronico) {
    return Response.json(
      { error: "Todos los campos son obligatorios" },
      { status: 400 }
    );
  }
  
   // Crear nuevo empleado en la base de datos
  const empleado = await prisma.employee.create({
    data: { nombre, cargo, area, correo_electronico }
  });

  return Response.json(empleado, { status: 201 });
}