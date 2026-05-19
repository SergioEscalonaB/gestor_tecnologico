
// Esto es para codificar el token
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Aca se convierte el buffer a base64Url para poder firmarlo
function arrayBufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Aca se convierte el buffer de vuelta a base64Url
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Aca se convierte el string a base64Url
function stringToBase64Url(str: string): string {
  const buffer = encoder.encode(str);
  return arrayBufferToBase64Url(buffer);
}

// Aca se convierte el string de vuelta a base64Url
function base64UrlToString(base64url: string): string {
  const buffer = base64UrlToArrayBuffer(base64url);
  return decoder.decode(buffer);
}

// Aca se genera la llave de criptografía simétrica
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyBuffer = encoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"]
  );
}

/**
 * Firmamos la carga útil (payload) y retornamos un token JWT.
 * @param payload Datos del usuario que queremos guardar en el token.
 * @param secret Clave secreta con la que se firmará el token.
 * @param expiresInSeconds Tiempo de expiración en segundos (por defecto 1 hora = 3600s).
 */
export async function signJWT(
  payload: Record<string, any>,
  secret: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  
  // payload completo agregando 'iat' (emitido en) y 'exp' (expiracion)
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  // 1. Codificamos cabecera (Header) y carga útil (Payload) a Base64Url
  const headerB64 = stringToBase64Url(JSON.stringify(header));
  const payloadB64 = stringToBase64Url(JSON.stringify(fullPayload));
  
  // El mensaje a firmar es: header.payload
  const message = `${headerB64}.${payloadB64}`;

  // 2. Generar firma digital
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  const signatureB64 = arrayBufferToBase64Url(signatureBuffer);

  // 3. Unir los 3 fragmentos: Header.Payload.Signature
  return `${message}.${signatureB64}`;
}

// Verificamos que el token sea valido y no este expirado. 
// Retornamos la carga útil si es valido, de lo contrario lanzamos un error descriptivo.
export async function verifyJWT(token: string, secret: string): Promise<Record<string, any>> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("El token no tiene la estructura de un JWT válida (debe tener 3 partes).");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const message = `${headerB64}.${payloadB64}`;

  // 1. Recrear llave y verificar la firma
  const key = await getCryptoKey(secret);
  const signatureBuffer = base64UrlToArrayBuffer(signatureB64);
  const messageBuffer = encoder.encode(message);

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBuffer,
    messageBuffer
  );

  if (!isValid) {
    throw new Error("Firma de token inválida. El token ha sido alterado.");
  }

  // 2. Decodificar la carga útil (payload)
  const payloadStr = base64UrlToString(payloadB64);
  const payload = JSON.parse(payloadStr);

  // 3. Validar si el token ha expirado
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) {
    throw new Error("El token ha expirado.");
  }

  return payload;
}
