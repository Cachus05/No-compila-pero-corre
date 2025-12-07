import { consulta } from '../../lib/db';
import { generarToken, compararPassword } from '../../lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return Response.json({ 
        error: 'Email y contraseña son obligatorios' 
      }, { status: 400 });
    }
    
    const usuarios = await consulta(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (usuarios.length === 0) {
      return Response.json({ 
        error: 'El correo electrónico no está registrado' 
      }, { status: 401 });
    }
    
    const usuario = usuarios[0];
    
    const passwordValido = await compararPassword(password, usuario.password);
    
    if (!passwordValido) {
      return Response.json({ 
        error: 'La contraseña es incorrecta' 
      }, { status: 401 });
    }
    
    const token = generarToken(usuario);
    
    return Response.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        user_type: usuario.user_type
      },
      token: token
    });
    
  } catch (error) {
    console.error('Error en el login:', error);
    return Response.json({ 
      error: 'Error al iniciar sesión',
      detalles: error.message 
    }, { status: 500 });
  }
}