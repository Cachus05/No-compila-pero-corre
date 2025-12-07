// app/api/usuario/[id]/pagos/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { consulta } from '@/app/lib/db'

const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion'

export async function GET(req, { params }) {
  try {
    // Verificar autenticación
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    try {
      jwt.verify(token, SECRET_KEY)
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    console.log('Obteniendo pagos del usuario:', userId)

    // Obtener pagos del freelancer
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
        u.first_name as client_first_name,
        u.last_name as client_last_name
       FROM payments p
       INNER JOIN projects pr ON p.project_id = pr.id
       INNER JOIN users u ON pr.client_id = u.id
       WHERE pr.freelancer_id = ?
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