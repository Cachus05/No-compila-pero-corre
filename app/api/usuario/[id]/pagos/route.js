// app/api/usuario/[id]/pagos/route.js
import { consulta } from '@/app/lib/db'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

export async function GET(req, { params }) {
  try {
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

    const userId = parseInt(params.id)

// Obtener pagos donde el usuario es el freelancer
const pagos = await consulta(
  `SELECT 
    p.id,
    p.amount,
    p.payment_method,
    p.status,
    p.payment_date,
    p.created_at,
    pr.title as project_title,
    pr.description as project_description,
    c.first_name as client_first_name,
    c.last_name as client_last_name
   FROM payments p
   LEFT JOIN projects pr ON p.project_id = pr.id
   LEFT JOIN users c ON p.client_id = c.id
   WHERE p.freelancer_id = ?
   ORDER BY p.created_at DESC`,
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