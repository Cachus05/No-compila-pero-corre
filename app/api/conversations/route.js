import { NextResponse } from 'next/server'
import { consulta } from '../../lib/db.js'
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

// GET - Obtener todas las conversaciones del usuario actual
export async function GET(req) {
  try {
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

    // Obtener conversaciones desde la tabla chats
    const conversaciones = await consulta(
      `SELECT 
        c.id as chat_id,
        c.project_id,
        c.created_at,
        p.client_id,
        p.freelancer_id,
        CASE 
          WHEN p.client_id = ? THEN p.freelancer_id
          ELSE p.client_id
        END as other_user_id,
        CASE 
          WHEN p.client_id = ? THEN u_freelancer.first_name
          ELSE u_client.first_name
        END as other_user_first_name,
        CASE 
          WHEN p.client_id = ? THEN u_freelancer.last_name
          ELSE u_client.last_name
        END as other_user_last_name,
        CASE 
          WHEN p.client_id = ? THEN u_freelancer.avatar
          ELSE u_client.avatar
        END as other_user_avatar,
        (SELECT message FROM messages WHERE chat_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT sent_at FROM messages WHERE chat_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM chats c
      JOIN projects p ON c.project_id = p.id
      LEFT JOIN users u_client ON p.client_id = u_client.id
      LEFT JOIN users u_freelancer ON p.freelancer_id = u_freelancer.id
      WHERE p.client_id = ? OR p.freelancer_id = ?
      ORDER BY last_message_at DESC`,
      [userId, userId, userId, userId, userId, userId, userId]
    )

    return NextResponse.json({ conversaciones })

  } catch (error) {
    console.error('Error al obtener conversaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener conversaciones', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva conversación
export async function POST(req) {
  try {
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
    const { receiverId, projectId, initialMessage } = await req.json()

    if (!receiverId) {
      return NextResponse.json(
        { error: 'ID del receptor es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el receptor existe
    const receiver = await consulta(
      'SELECT id, first_name, last_name, avatar FROM users WHERE id = ?',
      [receiverId]
    )

    if (receiver.length === 0) {
      return NextResponse.json(
        { error: 'Usuario receptor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya existe un chat para este proyecto
    let chatId = null
    let isNew = false

    if (projectId) {
      const existingChat = await consulta(
        'SELECT id FROM chats WHERE project_id = ? LIMIT 1',
        [projectId]
      )

      if (existingChat.length > 0) {
        chatId = existingChat[0].id
      }
    }

    // Si no existe, crear nuevo chat
    if (!chatId) {
      const resultChat = await consulta(
        'INSERT INTO chats (project_id, created_at) VALUES (?, NOW())',
        [projectId || null]
      )
      chatId = resultChat.insertId
      isNew = true

      // Si hay mensaje inicial, insertarlo
      if (initialMessage && initialMessage.trim()) {
        await consulta(
          `INSERT INTO messages (chat_id, project_id, sender_id, receiver_id, message, is_read, sent_at) 
           VALUES (?, ?, ?, ?, ?, 0, NOW())`,
          [chatId, projectId || null, userId, receiverId, initialMessage.trim()]
        )
      }
    }

    return NextResponse.json({ 
      chatId, 
      projectId: projectId || null,
      isNew,
      receiver: receiver[0]
    })

  } catch (error) {
    console.error('Error al crear conversación:', error)
    return NextResponse.json(
      { error: 'Error al crear conversación', details: error.message },
      { status: 500 }
    )
  }
}