import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

// Llave secreta con fallback por seguridad
const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Middleware que intercepta cada navegación para proteger el sitio.
 * Si el usuario no tiene sesión, lo obliga a pasar por el Login primero.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Definir qué páginas queremos proteger (toda la aplicación principal)
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/activos") ||
    pathname.startsWith("/usuarios") ||
    pathname.startsWith("/mantenimientos") ||
    pathname.startsWith("/asignaciones") ||
    pathname.startsWith("/dashboard");

  // Esta es la ruta de login
  const isAuthRoute = pathname === "/login";

  // 2. Leemos la cookie donde guardamos el JWT
  const token = request.cookies.get("token")?.value;

  // Si intentamos ingresar a una página protegida sin sesión
  if (isProtectedRoute) {
    if (!token) {
      // Si no hay token, redirigimos a /login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Validar que el token sea legítimo (firma correcta y no expirado)
      await verifyJWT(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token alterado, dañado o caducado -> Borramos la cookie y lo enviamos a /login
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  // Si un usuario autenticado intenta acceder a la página de /login
  if (isAuthRoute) {
    if (token) {
      try {
        // Si el token aún es válido, no lo dejamos ir al login, lo mandamos al panel principal '/'
        await verifyJWT(token, JWT_SECRET);
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      } catch (error) {
        // Si el token falló, dejamos que acceda a /login y limpiamos la cookie obsoleta
        const response = NextResponse.next();
        response.cookies.delete("token");
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Configuración para definir qué peticiones filtra el Middleware.
// Excluimos llamadas a la API de autenticación, archivos estáticos y recursos públicos.
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api/auth (endpoints públicos de login/logout que no deben protegerse)
     * - _next/static (archivos estáticos compilados de Next.js)
     * - _next/image (optimización automática de imágenes)
     * - favicon.ico, public (archivos estáticos como SVGs, PNGs, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
