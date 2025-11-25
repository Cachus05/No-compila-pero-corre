import { NextResponse } from 'next/server'
import { consulta } from '../../../lib/db'
import { verificarToken } from '../../../lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const usuarioToken = await verificarToken(token)
    if (!usuarioToken) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const { id } = params
    if (String(usuarioToken.id) !== String(id)) {
      return NextResponse.json({ error: 'No tienes permiso para editar este usuario' }, { status: 403 })
    }

    const data = await request.formData()
    const first_name = data.get('first_name')?.toString()?.trim() || null
    const last_name = data.get('last_name')?.toString()?.trim() || null
    const email = data.get('email')?.toString()?.trim() || null
    const phone = data.get('phone')?.toString()?.trim() || null
    const avatarFile = data.get('avatar')
  const bio = data.get('bio')?.toString()?.trim() || null
  const hourly_rate_raw = data.get('hourly_rate')?.toString()?.trim() || null
  const hourly_rate = hourly_rate_raw ? parseFloat(hourly_rate_raw) : null
  const skills = data.get('skills')?.toString()?.trim() || null
  const languages = data.get('languages')?.toString()?.trim() || null
  const experience_level = data.get('experience_level')?.toString()?.trim() || null
  const portfolio_url = data.get('portfolio_url')?.toString()?.trim() || null
  const linkedin_profile = data.get('linkedin_profile')?.toString()?.trim() || null
  const github_profile = data.get('github_profile')?.toString()?.trim() || null
  const availability = data.get('availability')?.toString()?.trim() || null

    // Obtener usuario actual
    const rows = await consulta('SELECT * FROM users WHERE id = ?', [id])
    if (!rows || rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    const usuarioActual = rows[0]

    let avatarPath = usuarioActual.avatar || null

    if (avatarFile && avatarFile.size > 0) {
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
        await mkdir(uploadsDir, { recursive: true })

        const bytes = await avatarFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const timestamp = Date.now()
        let extension = 'jpg'
        if (avatarFile.name) {
          const parts = avatarFile.name.split('.')
          if (parts.length > 1) extension = parts[parts.length - 1].toLowerCase()
        }
        const filename = `avatar_${id}_${timestamp}.${extension}`
        const path = join(uploadsDir, filename)
        await writeFile(path, buffer)
        avatarPath = `/uploads/avatars/${filename}`
      } catch (err) {
        console.error('Error guardando avatar:', err)
      }
    }

    // Construir query de actualización dinámicamente
    const updates = []
    const paramsArr = []
    if (first_name !== null) { updates.push('first_name = ?'); paramsArr.push(first_name) }
    if (last_name !== null) { updates.push('last_name = ?'); paramsArr.push(last_name) }
    if (email !== null) { updates.push('email = ?'); paramsArr.push(email) }
    if (phone !== null) { updates.push('phone = ?'); paramsArr.push(phone) }
    if (avatarPath !== usuarioActual.avatar) { updates.push('avatar = ?'); paramsArr.push(avatarPath) }
  if (bio !== null) { updates.push('bio = ?'); paramsArr.push(bio) }
  if (hourly_rate !== null && !Number.isNaN(hourly_rate)) { updates.push('hourly_rate = ?'); paramsArr.push(hourly_rate) }
  if (skills !== null) { updates.push('skills = ?'); paramsArr.push(skills) }
  if (languages !== null) { updates.push('languages = ?'); paramsArr.push(languages) }
  if (experience_level !== null) { updates.push('experience_level = ?'); paramsArr.push(experience_level) }
  if (portfolio_url !== null) { updates.push('portfolio_url = ?'); paramsArr.push(portfolio_url) }
  if (linkedin_profile !== null) { updates.push('linkedin_profile = ?'); paramsArr.push(linkedin_profile) }
  if (github_profile !== null) { updates.push('github_profile = ?'); paramsArr.push(github_profile) }
  if (availability !== null) { updates.push('availability = ?'); paramsArr.push(availability) }

    if (updates.length > 0) {
      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
      paramsArr.push(id)
      await consulta(sql, paramsArr)
    }

    // Devolver usuario actualizado
  const updatedRows = await consulta('SELECT id, first_name, last_name, email, phone, user_type, avatar, bio, hourly_rate, skills, languages, experience_level, portfolio_url, linkedin_profile, github_profile, availability FROM users WHERE id = ?', [id])
    const updatedUser = updatedRows[0]

    return NextResponse.json({ mensaje: 'Usuario actualizado', usuario: updatedUser })
  } catch (err) {
    console.error('Error PUT /api/usuario/[id]:', err)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}
