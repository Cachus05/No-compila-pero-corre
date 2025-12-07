// app/api/usuario/[id]/perfil-profesional/route.js
import { consulta } from '@/app/lib/db'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const SECRET_KEY = 'tu_clave_secreta_super_segura_12345'

export async function PUT(req, { params }) {
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

    const {
      title,
      bio,
      hourly_rate,
      skills,
      languages,
      experience_level,
      portfolio_url,
      linkedin_profile,
      github_profile
    } = await req.json()

    // Verificar si ya existe un perfil
    const perfiles = await consulta(
      `SELECT id FROM freelancer_profiles WHERE user_id = ?`,
      [userId]
    )

    if (perfiles.length > 0) {
      // Actualizar perfil existente
      await consulta(
        `UPDATE freelancer_profiles 
         SET title = ?, bio = ?, hourly_rate = ?, skills = ?, 
             languages = ?, experience_level = ?, portfolio_url = ?, 
             linkedin_profile = ?, github_profile = ?
         WHERE user_id = ?`,
        [title, bio, hourly_rate, skills, languages, experience_level, 
         portfolio_url, linkedin_profile, github_profile, userId]
      )
    } else {
      // Crear nuevo perfil
      await consulta(
        `INSERT INTO freelancer_profiles 
         (user_id, title, bio, hourly_rate, skills, languages, 
          experience_level, portfolio_url, linkedin_profile, github_profile)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, bio, hourly_rate, skills, languages, 
         experience_level, portfolio_url, linkedin_profile, github_profile]
      )
    }

    return NextResponse.json({ mensaje: 'Perfil profesional actualizado correctamente' })

  } catch (error) {
    console.error('Error al actualizar perfil profesional:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil profesional', details: error.message },
      { status: 500 }
    )
  }
}