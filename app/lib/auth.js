import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Clave secreta para firmar los tokens
const SECRET_KEY = 'tu_clave_secreta_super_segura_12345';

// Generar un token JWT
export function generarToken(usuario) {
  const payload = {
    id: usuario.id,
    email: usuario.email,
    role: usuario.role || 'user'
  };
  
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
  return token;
}

// Verificar un token
export function verificarToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Encriptar contraseña
export async function encriptarPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Comparar contraseñas
export async function compararPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}