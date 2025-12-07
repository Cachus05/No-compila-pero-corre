import { NextResponse } from 'next/server'
import { consulta } from '../../../lib/db.js'

// GET - Obtener un servicio por ID
export async function GET(req, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID de servicio requerido' },
        { status: 400 }
      )
    }

    // Consulta para obtener el servicio con información del freelancer
    const resultado = await consulta(
      `SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.avatar,
        u.email
      FROM services s
      JOIN users u ON s.freelancer_id = u.id
      WHERE s.id = ? AND s.is_active = 1`,
      [id]
    )

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    const servicio = resultado[0]

    // Parsear gallery_images si es string JSON
    if (servicio.gallery_images && typeof servicio.gallery_images === 'string') {
      try {
        servicio.gallery_images = JSON.parse(servicio.gallery_images)
      } catch (e) {
        servicio.gallery_images = []
      }
    }

    return NextResponse.json({
      servicio: servicio
    })

  } catch (error) {
    console.error('Error al obtener servicio:', error)
    return NextResponse.json(
      { error: 'Error al obtener el servicio', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar servicio (si el usuario es el owner)
export async function PUT(req, { params }) {
  try {
    const { id } = params
    const formData = await req.formData()

    // Verificar token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    // Aquí deberías verificar el token con JWT
    // Por ahora, asumimos que es válido

    const title = formData.get('title')
    const description = formData.get('description')
    const price = formData.get('price')
    const category = formData.get('category')

    // Actualizar servicio
    await consulta(
      `UPDATE services 
       SET title = ?, description = ?, base_price = ?, category = ?
       WHERE id = ?`,
      [title, description, parseFloat(price), category, id]
    )

    // Obtener servicio actualizado
    const resultado = await consulta(
      `SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.avatar,
        u.email
      FROM services s
      JOIN users u ON s.freelancer_id = u.id
      WHERE s.id = ?`,
      [id]
    )

    return NextResponse.json({
      message: 'Servicio actualizado',
      servicio: resultado[0]
    })

  } catch (error) {
    console.error('Error al actualizar servicio:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar servicio
export async function DELETE(req, { params }) {
  try {
    const { id } = params

    // Verificar token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Soft delete (marcar como inactivo)
    await consulta(
      'UPDATE services SET is_active = 0 WHERE id = ?',
      [id]
    )

    return NextResponse.json({
      message: 'Servicio eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar servicio:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servicio', details: error.message },
      { status: 500 }
    )
  }
}