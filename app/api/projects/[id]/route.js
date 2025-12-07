import { NextResponse } from 'next/server'
import { consulta } from '../../../lib/db.js'
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

// GET - Obtener detalles de un proyecto específico
export async function GET(req, { params }) {
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
    
    // CAMBIO IMPORTANTE: Await params antes de acceder a .id
    const { id: projectId } = await params

    // Obtener proyecto
    const proyectos = await consulta(
      `SELECT 
        p.*,
        s.title as service_title,
        s.description as service_description,
        s.base_price as service_base_price,
        u_client.first_name as client_first_name,
        u_client.last_name as client_last_name,
        u_client.avatar as client_avatar,
        u_client.email as client_email
      FROM projects p
      JOIN services s ON p.service_id = s.id
      JOIN users u_client ON p.client_id = u_client.id
      WHERE p.id = ? AND (p.freelancer_id = ? OR p.client_id = ?)`,
      [projectId, userId, userId]
    )

    if (proyectos.length === 0) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Formatear el proyecto con la información necesaria
    const proyecto = {
      id: proyectos[0].id,
      service_id: proyectos[0].service_id,
      service_title: proyectos[0].service_title,
      description: proyectos[0].description || proyectos[0].service_description,
      budget: proyectos[0].total_price || proyectos[0].service_base_price,
      deadline: proyectos[0].deadline,
      status: proyectos[0].status,
      client_first_name: proyectos[0].client_first_name,
      client_last_name: proyectos[0].client_last_name,
      client_avatar: proyectos[0].client_avatar,
      client_email: proyectos[0].client_email,
      created_at: proyectos[0].created_at,
      updated_at: proyectos[0].updated_at
    }

    return NextResponse.json({ proyecto })

  } catch (error) {
    console.error('Error al obtener proyecto:', error)
    return NextResponse.json(
      { error: 'Error al obtener proyecto', details: error.message },
      { status: 500 }
    )
  }
}