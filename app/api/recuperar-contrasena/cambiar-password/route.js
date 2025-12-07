// app/api/recuperar-contrasena/cambiar-password/route.js
import { consulta } from '@/app/lib/db';
import { encriptarPassword } from '@/app/lib/auth';

export async function POST(request) {
  try {
    const { email, code, newPassword } = await request.json();
    
    if (!email || !code || !newPassword) {
      return Response.json({ 
        error: 'Todos los campos son obligatorios' 
      }, { status: 400 });
    }
    
    if (newPassword.length < 8) {
      return Response.json({ 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      }, { status: 400 });
    }
    
    const usuarios = await consulta(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (usuarios.length === 0) {
      return Response.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }
    
    const usuario = usuarios[0];
    
    const codigos = await consulta(
      `SELECT id FROM password_reset_codes 
       WHERE user_id = ? AND code = ? AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [usuario.id, code]
    );
    
    if (codigos.length === 0) {
      return Response.json({ 
        error: 'Código inválido o expirado' 
      }, { status: 400 });
    }
    
    const codigoRecord = codigos[0];
    
    const passwordHash = await encriptarPassword(newPassword);
    
    await consulta(
      'UPDATE users SET password = ? WHERE id = ?',
      [passwordHash, usuario.id]
    );
    
    await consulta(
      'UPDATE password_reset_codes SET used = true WHERE id = ?',
      [codigoRecord.id]
    );
    
    await consulta(
      'UPDATE password_reset_codes SET used = true WHERE user_id = ? AND id != ?',
      [usuario.id, codigoRecord.id]
    );
    
    return Response.json({ 
      mensaje: 'Contraseña actualizada correctamente' 
    });
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return Response.json({ 
      error: 'Error al cambiar la contraseña',
      detalles: error.message 
    }, { status: 500 });
  }
}