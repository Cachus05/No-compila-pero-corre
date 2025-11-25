import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { consulta } from './db'; 

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345';

export function generarToken(usuario) {
  const payload = {
    userId: usuario.id,  
    email: usuario.email,
    user_type: usuario.user_type,  
    role: usuario.role || usuario.user_type || 'user'
  };
  
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
  return token;
}


export async function verificarToken(token) {
  try {
    
    const decoded = jwt.verify(token, SECRET_KEY);
    
    
    const usuarios = await consulta(
      `SELECT id, email, first_name, last_name, user_type, avatar, phone 
       FROM users 
       WHERE id = ?`,
      [decoded.userId || decoded.id]  
    );
    
    
    if (!usuarios || usuarios.length === 0) {
      console.error('Usuario no encontrado en la base de datos para ID:', decoded.userId || decoded.id);
      return null;
    }
    
    const usuario = usuarios[0];
    
    
    return {
      id: usuario.id,
      email: usuario.email,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      user_type: usuario.user_type, 
      avatar: usuario.avatar,
      phone: usuario.phone
    };
    
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return null;
  }
}


export async function encriptarPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}


export async function compararPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}