import { NextResponse } from 'next/server'
import { consulta } from '../../lib/db.js'
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

// POST - Crear un nuevo contrato (contratar servicio)
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

    const clienteId = decoded.userId
    const { serviceId, freelancerId, requirements, paymentMethod, amount } = await req.json()

    // Validaciones
    if (!serviceId || !freelancerId || !requirements || !amount) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Verificar que el servicio existe
    const servicio = await consulta(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    )

    if (servicio.length === 0) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el cliente no sea el mismo freelancer
    if (clienteId === freelancerId) {
      return NextResponse.json(
        { error: 'No puedes contratar tu propio servicio' },
        { status: 400 }
      )
    }

    // Crear el contrato/proyecto
    const resultContrato = await consulta(
      `INSERT INTO projects 
        (client_id, freelancer_id, service_id, description, budget, status, start_date, deadline, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), NOW())`,
      [
        clienteId,
        freelancerId,
        serviceId,
        requirements,
        amount,
        servicio[0].delivery_time
      ]
    )

    const projectId = resultContrato.insertId

    // Crear registro de pago
    await consulta(
      `INSERT INTO payments 
        (project_id, client_id, freelancer_id, amount, payment_method, status, payment_date) 
       VALUES (?, ?, ?, ?, ?, 'completed', NOW())`,
      [projectId, clienteId, freelancerId, amount, paymentMethod]
    )

    // NUEVO: Crear el chat en la tabla chats primero
    let chatId = null
    
    // Verificar si ya existe un chat para este proyecto
    const existingChat = await consulta(
      'SELECT id FROM chats WHERE project_id = ? LIMIT 1',
      [projectId]
    )

    if (existingChat.length > 0) {
      chatId = existingChat[0].id
    } else {
      // Crear nuevo chat
      const resultChat = await consulta(
        'INSERT INTO chats (project_id, created_at) VALUES (?, NOW())',
        [projectId]
      )
      chatId = resultChat.insertId
    }

    // Ahora crear el mensaje inicial
    const mensajeInicial = `¡Hola! He contratado tu servicio "${servicio[0].title}".\n\nDetalles del proyecto:\n${requirements}\n\nPresupuesto: $${amount}\nTiempo de entrega: ${servicio[0].delivery_time} días`

    await consulta(
      `INSERT INTO messages (chat_id, project_id, sender_id, receiver_id, message, is_read, sent_at) 
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [
        chatId,
        projectId,
        clienteId,
        freelancerId,
        mensajeInicial
      ]
    )

    // Obtener el contrato creado con todos los detalles
    const contratoCompleto = await consulta(
      `SELECT 
        p.*,
        s.title as service_title,
        u_client.first_name as client_first_name,
        u_client.last_name as client_last_name,
        u_freelancer.first_name as freelancer_first_name,
        u_freelancer.last_name as freelancer_last_name
      FROM projects p
      JOIN services s ON p.service_id = s.id
      JOIN users u_client ON p.client_id = u_client.id
      JOIN users u_freelancer ON p.freelancer_id = u_freelancer.id
      WHERE p.id = ?`,
      [projectId]
    )

    return NextResponse.json({
      message: 'Contrato creado exitosamente',
      contrato: contratoCompleto[0],
      chatId: chatId,
      projectId: projectId
    })

  } catch (error) {
    console.error('Error al crear contrato:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Obtener contratos del usuario
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

    // Obtener contratos donde el usuario es cliente o freelancer
    const contratos = await consulta(
      `SELECT 
        p.*,
        s.title as service_title,
        s.category,
        u_client.first_name as client_first_name,
        u_client.last_name as client_last_name,
        u_client.email as client_email,
        u_freelancer.first_name as freelancer_first_name,
        u_freelancer.last_name as freelancer_last_name,
        u_freelancer.email as freelancer_email
      FROM projects p
      JOIN services s ON p.service_id = s.id
      JOIN users u_client ON p.client_id = u_client.id
      JOIN users u_freelancer ON p.freelancer_id = u_freelancer.id
      WHERE p.client_id = ? OR p.freelancer_id = ?
      ORDER BY p.created_at DESC`,
      [userId, userId]
    )

    return NextResponse.json({ contratos })

  } catch (error) {
    console.error('Error al obtener contratos:', error)
    return NextResponse.json(
      { error: 'Error al obtener contratos', details: error.message },
      { status: 500 }
    )
  }
}