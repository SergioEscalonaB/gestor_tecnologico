
import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/jwt';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Aca validamos las credenciales (usuario: admin, contraseña: 1234)
    // Cambiar estos datos de prueba mas adelante por una consulta a la base de datos
    const isValidAdmin =
      (username === 'admin' && password === '1234');

    if (isValidAdmin) {
      const userPayload = { 
        id: 1, 
        username: 'admin',
        role: 'admin' 
      };
      
      // Aca generamos el token de forma asíncrona (3600 segundos = 1 hora)
      const token = await signJWT(userPayload, JWT_SECRET, 3600);

      // Aca creamos la respuesta y guardamos el token en una cookie HttpOnly
      const response = NextResponse.json({ message: 'Login exitoso' });
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1 hora
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: 'Error del servidor al iniciar sesión' }, { status: 500 });
  }
}
