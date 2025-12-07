import { NextResponse } from 'next/server'
import { consulta } from '../../../../lib/db.js'
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

// GET - Obtener todos los mensajes de un chat
export async function GET(req, { params }) {
  try {
    const { chatId } = params

    // Verificar token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, SECRET_KEY)
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userId = decoded.userId

    // Verificar que el usuario pertenece a este chat
    const verification = await consulta(
      'SELECT * FROM messages WHERE chat_id = ? AND (sender_id = ? OR receiver_id = ?) LIMIT 1',
      [chatId, userId, userId]
    )

    if (verification.length === 0) {
      return NextResponse.json(
        { error: 'Chat no encontrado o no autorizado' },
        { status: 404 }
      )
    }

    // Obtener mensajes
    const mensajes = await consulta(
      `SELECT 
        m.*,
        u.first_name,
        u.last_name,
        u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = ?
      ORDER BY m.sent_at ASC`,
      [chatId]
    )

    // Marcar mensajes como leídos
    await consulta(
      'UPDATE messages SET is_read = 1 WHERE chat_id = ? AND receiver_id = ? AND is_read = 0',
      [chatId, userId]
    )

    return NextResponse.json({ mensajes })

  } catch (error) {
    console.error('Error al obtener mensajes:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Enviar un nuevo mensaje
export async function POST(req, { params }) {
  try {
    const { chatId } = params

    // Verificar token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, SECRET_KEY)
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userId = decoded.userId
    const { message, receiverId, projectId } = await req.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      )
    }

    if (!receiverId) {
      return NextResponse.json(
        { error: 'ID del receptor es requerido' },
        { status: 400 }
      )
    }

    // Insertar mensaje
    const result = await consulta(
      `INSERT INTO messages (chat_id, project_id, sender_id, receiver_id, message, is_read, sent_at) 
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [chatId, projectId || null, userId, receiverId, message.trim()]
    )

    // Obtener el mensaje recién creado
    const nuevoMensaje = await consulta(
      `SELECT 
        m.*,
        u.first_name,
        u.last_name,
        u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?`,
      [result.insertId]
    )

    return NextResponse.json({ mensaje: nuevoMensaje[0] })

  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje', details: error.message },
      { status: 500 }
    )
  }
}