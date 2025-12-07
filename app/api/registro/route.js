import { consulta } from '../../lib/db';
import { generarToken, encriptarPassword } from '../../lib/auth';
import { enviarEmail, emailBienvenida } from '../../../lib/email';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    // Obtener FormData en lugar de JSON
    const formData = await request.formData();
    
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const email = formData.get('email');
    const phone = formData.get('phone') || null;
    const password = formData.get('password');
    const user_type = formData.get('user_type');
    const avatarFile = formData.get('avatar');
    
    // Validación de campos obligatorios
    if (!first_name || !last_name || !email || !password || !user_type) {
      return Response.json({ 
        error: 'Todos los campos obligatorios deben ser llenados' 
      }, { status: 400 });
    }
    
    // Validar que user_type sea válido (coincide con tu ENUM en la BD)
    if (user_type !== 'freelancer' && user_type !== 'client') {
      return Response.json({ 
        error: 'Tipo de usuario inválido' 
      }, { status: 400 });
    }
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await consulta(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (usuarioExistente.length > 0) {
      return Response.json({ 
        error: 'El email ya está registrado' 
      }, { status: 400 });
    }
    
    // Procesar avatar si existe
    let avatarPath = null;
    if (avatarFile && avatarFile.size > 0) {
      try {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const extension = avatarFile.name.split('.').pop();
        const filename = `avatar_${timestamp}.${extension}`;
        
        // Guardar en public/uploads/avatars
        const path = join(process.cwd(), 'public', 'uploads', 'avatars', filename);
        await writeFile(path, buffer);
        
        // Guardar ruta relativa para la BD
        avatarPath = `/uploads/avatars/${filename}`;
      } catch (error) {
        console.error('Error al guardar avatar:', error);
        // Continuar sin avatar si falla
      }
    }
    
    // Encriptar contraseña
    const passwordEncriptado = await encriptarPassword(password);
    
    // Insertar nuevo usuario CON phone y avatar
    const resultado = await consulta(
      'INSERT INTO users (first_name, last_name, email, phone, password, user_type, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, passwordEncriptado, user_type, avatarPath]
    );
    
    const nuevoUsuario = {
      id: resultado.insertId,
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone: phone,
      user_type: user_type,
      avatar: avatarPath
    };
    
    // Generar token
    const token = generarToken(nuevoUsuario);
    
  // ENVIAR EMAIL DE BIENVENIDA
    try {
      const mailOptions = emailBienvenida(
        `${first_name} ${last_name}`,
        email,
        user_type
      );
      
      const resultadoEmail = await enviarEmail(mailOptions);
      
      if (resultadoEmail.success) {
        console.log('Email de bienvenida enviado correctamente');
      } else {
        console.warn('No se pudo enviar el email de bienvenida, pero el registro fue exitoso');
      }
    } catch (emailError) {
      // No bloqueamos el registro si falla el email
  console.error('Error al enviar email de bienvenida:', emailError);
    }
    
    return Response.json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        first_name: nuevoUsuario.first_name,
        last_name: nuevoUsuario.last_name,
        email: nuevoUsuario.email,
        phone: nuevoUsuario.phone,
        user_type: nuevoUsuario.user_type,
        avatar: nuevoUsuario.avatar
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