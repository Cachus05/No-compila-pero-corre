// app/api/usuario/[id]/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { consulta } from '@/app/lib/db'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

export async function GET(req, { params }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, SECRET_KEY)

    const { id } = await params
    const userId = parseInt(id)

    const usuarios = await consulta(
      `SELECT id, email, first_name, last_name, phone, avatar, user_type 
       FROM users WHERE id = ?`,
      [userId]
    )

    if (usuarios.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const usuario = usuarios[0]
    let perfilProfesional = null

    if (usuario.user_type === 'freelancer') {
      try {
        const perfiles = await consulta(
          `SELECT * FROM freelancer_profiles WHERE user_id = ?`,
          [userId]
        )
        if (perfiles.length > 0) {
          perfilProfesional = perfiles[0]
        }
      } catch (err) {
        console.log('Info: No hay perfil profesional')
      }
    }

    return NextResponse.json({ usuario, perfilProfesional })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, SECRET_KEY)

    const { id } = await params
    const userId = parseInt(id)
    const body = await req.json()

    await consulta(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?`,
      [body.first_name, body.last_name, body.phone, userId]
    )

    return NextResponse.json({ mensaje: 'Usuario actualizado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    console.log('=== INICIO DELETE /api/usuario/[id] ===')
    
    // Verificar autenticación
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'No autorizado',
        mensaje: 'Token de autorización no proporcionado'
      }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    let decoded
    try {
      decoded = jwt.verify(token, SECRET_KEY)
      console.log('Token verificado, usuario:', decoded.userId)
    } catch (err) {
      return NextResponse.json({ 
        error: 'Token inválido',
        mensaje: 'El token proporcionado no es válido o ha expirado'
      }, { status: 401 })
    }

    // Obtener el ID del usuario desde los parámetros
    const { id } = await params
    const userId = parseInt(id)
    
    // Verificar que el usuario solo pueda eliminar su propia cuenta
    if (decoded.userId !== userId) {
      return NextResponse.json({ 
        error: 'No autorizado',
        mensaje: 'No puedes eliminar la cuenta de otro usuario'
      }, { status: 403 })
    }

    console.log('Iniciando eliminación de cuenta, usuario ID:', userId)

    // Verificar que el usuario existe
    const usuarios = await consulta(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    )

    if (usuarios.length === 0) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado',
        mensaje: 'El usuario que intentas eliminar no existe'
      }, { status: 404 })
    }

    // PASO 1: Eliminar perfil freelancer si existe
    console.log('Eliminando perfil freelancer...')
    await consulta(
      'DELETE FROM freelancer_profiles WHERE user_id = ?',
      [userId]
    )

    // PASO 2: Eliminar pagos relacionados (si la tabla existe)
// PASO 2: Anonimizar pagos en lugar de eliminarlos
console.log('Anonimizando pagos del cliente...')
try {
  // Si el usuario es cliente, solo quitamos su ID pero mantenemos el pago
  await consulta(
    `UPDATE payments 
     SET client_id = NULL 
     WHERE client_id = ?`,
    [userId]
  )
  
  // Si el usuario es freelancer, eliminamos sus pagos recibidos
  await consulta(
    'DELETE FROM payments WHERE freelancer_id = ?',
    [userId]
  )
} catch (err) {
  console.log('Info: No hay tabla payments')
}
    // PASO 3: Eliminar proyectos relacionados
    console.log('Eliminando proyectos...')
    try {
      // Primero eliminar hitos de proyectos
      await consulta(
        `DELETE FROM project_milestones 
         WHERE project_id IN (
           SELECT id FROM projects 
           WHERE freelancer_id = ? OR client_id = ?
         )`,
        [userId, userId]
      )
    } catch (err) {
      console.log('Info: No hay tabla project_milestones')
    }

    try {
      // Eliminar actualizaciones de proyectos
      await consulta(
        `DELETE FROM project_updates 
         WHERE project_id IN (
           SELECT id FROM projects 
           WHERE freelancer_id = ? OR client_id = ?
         )`,
        [userId, userId]
      )
    } catch (err) {
      console.log('Info: No hay tabla project_updates')
    }

    try {
      // Eliminar proyectos
      await consulta(
        'DELETE FROM projects WHERE freelancer_id = ? OR client_id = ?',
        [userId, userId]
      )
    } catch (err) {
      console.log('Info: No hay tabla projects o está vacía')
    }

    // PASO 6: Eliminar conversaciones (esto eliminará mensajes automáticamente si hay CASCADE)
    console.log('Eliminando conversaciones...')
    try {
      await consulta(
        'DELETE FROM conversations WHERE user1_id = ? OR user2_id = ?',
        [userId, userId]
      )
    } catch (err) {
      console.log('Info: No hay conversaciones o tabla no existe')
    }

    // PASO 7: Eliminar mensajes (intentar por si hay tabla separada)
    console.log('Eliminando mensajes...')
    try {
      await consulta(
        'DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?',
        [userId, userId]
      )
    } catch (err) {
      console.log('Info: No hay mensajes o tabla no existe')
    }

    // PASO 8: Eliminar sesiones de usuario (si existe la tabla)
    console.log('Eliminando sesiones...')
    try {
      await consulta(
        'DELETE FROM user_sessions WHERE user_id = ?',
        [userId]
      )
    } catch (err) {
      console.log('Info: No hay tabla user_sessions')
    }

    // PASO 9: Eliminar códigos de reset de contraseña (si existe la tabla)
    console.log('Eliminando códigos de reset...')
    try {
      await consulta(
        'DELETE FROM password_reset_codes WHERE user_id = ?',
        [userId]
      )
    } catch (err) {
      console.log('Info: No hay tabla password_reset_codes')
    }

    // PASO 10: Eliminar chats (si existe la tabla)
    console.log('Eliminando chats...')
    try {
      await consulta(
        'DELETE FROM chats WHERE user1_id = ? OR user2_id = ?',
        [userId, userId]
      )
    } catch (err) {
      console.log('Info: No hay tabla chats')
    }

    // PASO 10: Finalmente, eliminar el usuario
    console.log('Eliminando usuario...')
    const resultado = await consulta(
      'DELETE FROM users WHERE id = ?',
      [userId]
    )

    console.log('=== CUENTA ELIMINADA EXITOSAMENTE ===')

    return NextResponse.json({ 
      mensaje: 'Cuenta eliminada exitosamente',
      success: true
    }, { status: 200 })

  } catch (error) {
    console.error('=== ERROR al eliminar cuenta ===')
    console.error('Error completo:', error)
    
    return NextResponse.json({ 
      error: 'Error al eliminar cuenta',
      mensaje: 'Ocurrió un error al intentar eliminar tu cuenta',
      details: error.message 
    }, { status: 500 })
  }
}