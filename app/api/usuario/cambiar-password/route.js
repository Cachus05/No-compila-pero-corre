import { consulta } from '@/app/lib/db';
import { encriptarPassword, compararPassword } from '@/app/lib/auth';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { currentPassword, newPassword } = await request.json();

    // Verificar que se enviaron los datos
    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // Obtener usuario actual
    const usuarios = await consulta(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (usuarios.length === 0) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar contraseña actual
    const passwordValido = await compararPassword(currentPassword, usuarios[0].password);
    if (!passwordValido) {
      return Response.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
    }

    // Encriptar nueva contraseña
    const passwordHash = await encriptarPassword(newPassword);

    // Actualizar contraseña
    await consulta(
      'UPDATE users SET password = ? WHERE id = ?',
      [passwordHash, userId]
    );

    return Response.json({ mensaje: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return Response.json({ 
      error: 'Error al cambiar contraseña',
      detalles: error.message 
    }, { status: 500 });
  }
}