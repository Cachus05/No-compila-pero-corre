import { NextResponse } from 'next/server'
import { consulta } from '../../lib/db.js'
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

// GET - Obtener pagos del usuario
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

    // Obtener pagos donde el usuario es cliente
    const pagos = await consulta(
      `SELECT 
        pay.*,
        p.id as project_id,
        s.title as service_title,
        u_freelancer.first_name as freelancer_first_name,
        u_freelancer.last_name as freelancer_last_name
      FROM payments pay
      JOIN projects p ON pay.project_id = p.id
      JOIN services s ON p.service_id = s.id
      JOIN users u_freelancer ON pay.freelancer_id = u_freelancer.id
      WHERE pay.client_id = ?
      ORDER BY pay.created_at DESC`,
      [userId]
    )

    return NextResponse.json({ pagos })

  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json(
      { error: 'Error al obtener pagos', details: error.message },
      { status: 500 }
    )
  }
}