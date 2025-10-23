import { consulta } from '../../lib/db';
import { generarToken, encriptarPassword } from '../../lib/auth';

export async function POST(request) {
  try {
    const datos = await request.json();
    const { first_name, last_name, email, password } = datos;
    
    if (!first_name || !last_name || !email || !password) {
      return Response.json({ 
        error: 'Todos los campos son obligatorios' 
      }, { status: 400 });
    }
    
    const usuarioExistente = await consulta(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (usuarioExistente.length > 0) {
      return Response.json({ 
        error: 'El email ya está registrado' 
      }, { status: 400 });
    }
    
    const passwordEncriptado = await encriptarPassword(password);
    
    const resultado = await consulta(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, passwordEncriptado]
    );
    
    const nuevoUsuario = {
      id: resultado.insertId,
      first_name: first_name,
      last_name: last_name,
      email: email
    };
    
    const token = generarToken(nuevoUsuario);
    
    return Response.json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        first_name: nuevoUsuario.first_name,
        last_name: nuevoUsuario.last_name,
        email: nuevoUsuario.email
      },
      token: token
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error en el registro:', error);
    return Response.json({ 
      error: 'Error al registrar usuario',
      detalles: error.message 
    }, { status: 500 });
  }
}