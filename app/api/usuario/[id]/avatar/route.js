// app/api/usuario/[id]/avatar/route.js
import { consulta } from '@/app/lib/db'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

export async function POST(req, { params }) {
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
    const tokenUserId = decoded.userId || decoded.id

    if (tokenUserId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('avatar')

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Crear el directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `avatar_${userId}_${timestamp}.${extension}`

    // Guardar el archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Actualizar en la base de datos
    await consulta(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [filename, userId]
    )

    return NextResponse.json({ 
      mensaje: 'Avatar actualizado correctamente',
      avatar: filename
    })

  } catch (error) {
    console.error('Error al subir avatar:', error)
    return NextResponse.json(
      { error: 'Error al subir avatar', details: error.message },
      { status: 500 }
    )
  }
}