import { NextResponse } from 'next/server'
import { consulta } from '../../lib/db.js'
import jwt from 'jsonwebtoken'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

// GET - Obtener proyectos del usuario (como freelancer o cliente)
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

    // Obtener proyectos donde el usuario es freelancer
    const proyectosRaw = await consulta(
      `SELECT 
        p.id,
        p.service_id,
        p.client_id,
        p.freelancer_id,
        p.status,
        p.budget,
        p.created_at,
        p.updated_at,
        p.deadline,
        p.title,
        p.description,
        s.title as service_title,
        s.gallery_images,
        u_client.first_name as client_first_name,
        u_client.last_name as client_last_name,
        u_client.avatar as client_avatar,
        u_client.email as client_email
      FROM projects p
      JOIN services s ON p.service_id = s.id
      JOIN users u_client ON p.client_id = u_client.id
      WHERE p.freelancer_id = ?
      ORDER BY p.created_at DESC`,
      [userId]
    )

    // Procesar los proyectos para parsear gallery_images
    const proyectos = proyectosRaw.map(proyecto => {
      let service_images = []
      
      // Parsear gallery_images si existe
      if (proyecto.gallery_images) {
        try {
          // El campo viene como string JSON, parsearlo
          let parsed = proyecto.gallery_images
          
          // Si es string, parsearlo
          if (typeof parsed === 'string') {
            // Remover escapes si existen
            parsed = parsed.replace(/\\/g, '')
            parsed = JSON.parse(parsed)
          }
          
          // Asegurar que sea array
          service_images = Array.isArray(parsed) ? parsed : [parsed]
          
          // Limpiar las rutas (remover comillas extras si existen)
          service_images = service_images.map(img => {
            if (typeof img === 'string') {
              return img.replace(/^["']|["']$/g, '').trim()
            }
            return img
          }).filter(img => img)
          
        } catch (e) {
          console.error('Error parsing gallery_images:', e)
          // Si falla, verificar si es un string con URL directa
          if (typeof proyecto.gallery_images === 'string') {
            // Si contiene comas, separar
            if (proyecto.gallery_images.includes(',')) {
              service_images = proyecto.gallery_images.split(',').map(img => img.trim()).filter(img => img)
            } else if (proyecto.gallery_images.includes('/')) {
              // Si parece una ruta, usarla
              service_images = [proyecto.gallery_images.trim()]
            }
          }
        }
      }

      // Si no hay imágenes válidas, usar placeholder
      if (service_images.length === 0) {
        service_images = ['/placeholder.svg']
      }

      console.log('Proyecto ID:', proyecto.id, 'Imágenes:', service_images)

      return {
        ...proyecto,
        total_price: proyecto.budget,
        service_images: service_images
      }
    })

    // Contar ventas completadas
    const ventasResult = await consulta(
      `SELECT COUNT(*) as count
       FROM projects
       WHERE freelancer_id = ? AND status = 'completed'`,
      [userId]
    )

    const ventas = ventasResult[0]?.count || 0

    return NextResponse.json({ 
      proyectos,
      ventas
    })

  } catch (error) {
    console.error('Error al obtener proyectos:', error)
    return NextResponse.json(
      { error: 'Error al obtener proyectos', details: error.message },
      { status: 500 }
    )
  }
}