import { cookies } from "next/headers";

// Endpoint para cerrar sesión. Elimina la cookie 'token' del navegador.
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Eliminamos la cookie 'token'
    cookieStore.delete("token");

    return Response.json({
      success: true,
      message: "Sesión cerrada correctamente. Cookie eliminada."
    });
  } catch (error) {
    console.error("Error en logout API:", error);
    return Response.json(
      { error: "Error interno al intentar cerrar sesión." },
      { status: 500 }
    );
  }
}
