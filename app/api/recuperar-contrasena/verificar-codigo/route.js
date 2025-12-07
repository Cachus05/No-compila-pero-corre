// app/api/recuperar-contrasena/verificar-codigo/route.js
import { consulta } from '@/app/lib/db';

export async function POST(request) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return Response.json({ 
        error: 'Email y código son obligatorios' 
      }, { status: 400 });
    }
    
    // Buscar el usuario
    const usuarios = await consulta(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (usuarios.length === 0) {
      return Response.json({ 
        error: 'Código inválido o expirado' 
      }, { status: 400 });
    }
    
    const usuario = usuarios[0];
    
    // Verificar el código
    const codigos = await consulta(
      `SELECT * FROM password_reset_codes 
       WHERE user_id = ? AND code = ? AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [usuario.id, code]
    );
    
    if (codigos.length === 0) {
      return Response.json({ 
        error: 'Código inválido o expirado' 
      }, { status: 400 });
    }
    
    // Código válido
    return Response.json({ 
      mensaje: 'Código verificado correctamente',
      valido: true 
    });
    
  } catch (error) {
    console.error('Error al verificar código:', error);
    return Response.json({ 
      error: 'Error al verificar el código',
      detalles: error.message 
    }, { status: 500 });
  }
}