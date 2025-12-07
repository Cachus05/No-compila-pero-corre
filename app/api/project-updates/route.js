import { NextResponse } from 'next/server'
import { consulta } from '../../lib/db.js'
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_12345'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB por archivo

// POST - Crear un avance del proyecto
export async function POST(req) {
  console.log('=== Iniciando POST /api/project-updates ===')
  
  try {
    // Verificar token
    const authHeader = req.headers.get('authorization')
    console.log('Auth header:', authHeader ? 'Presente' : 'Ausente')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token no autorizado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, SECRET_KEY)
      console.log('Token verificado, userId:', decoded.userId)
    } catch (err) {
      console.error('Error verificando token:', err)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userId = decoded.userId
    
    // Parsear FormData
    let formData
    try {
      formData = await req.formData()
      console.log('FormData parseado correctamente')
    } catch (err) {
      console.error('Error al parsear FormData:', err)
      return NextResponse.json({ 
        error: 'Error al procesar el formulario',
        details: err.message
      }, { status: 400 })
    }
    
    const projectId = formData.get('projectId')
    const titulo = formData.get('titulo')
    const descripcion = formData.get('descripcion')
    const archivos = formData.getAll('archivos')

    console.log('Datos recibidos:', {
      projectId,
      titulo: titulo?.substring(0, 50),
      descripcion: descripcion?.substring(0, 50),
      numArchivos: archivos.length
    })

    // Validaciones
    if (!projectId || !titulo || !descripcion) {
      console.log('Datos incompletos')
      return NextResponse.json(
        { error: 'Datos incompletos. Título y descripción son requeridos.' },
        { status: 400 }
      )
    }

    // Verificar que el usuario es el freelancer del proyecto
    console.log('Verificando acceso al proyecto...')
    let proyecto
    try {
      proyecto = await consulta(
        'SELECT * FROM projects WHERE id = ? AND freelancer_id = ?',
        [projectId, userId]
      )
      console.log('Proyecto encontrado:', proyecto.length > 0)
    } catch (dbErr) {
      console.error('Error consultando proyecto:', dbErr)
      return NextResponse.json(
        { error: 'Error al verificar el proyecto', details: dbErr.message },
        { status: 500 }
      )
    }

    if (proyecto.length === 0) {
      console.log('Proyecto no encontrado o sin permiso')
      return NextResponse.json(
        { error: 'Proyecto no encontrado o no tienes permiso' },
        { status: 403 }
      )
    }

    // Procesar archivos subidos
    const archivosGuardados = []
    
    if (archivos && archivos.length > 0) {
      console.log('Procesando archivos...')
      
      // Crear directorio si no existe
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'project-updates')
      try {
        await mkdir(uploadDir, { recursive: true })
        console.log('Directorio de uploads verificado')
      } catch (err) {
        console.log('Error creando directorio:', err.message)
      }

      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i]
        
        if (archivo instanceof File && archivo.size > 0) {
          console.log(`Procesando archivo ${i + 1}: ${archivo.name}, tamaño: ${(archivo.size / 1024 / 1024).toFixed(2)}MB`)
          
          // Verificar tamaño
          if (archivo.size > MAX_FILE_SIZE) {
            const sizeMB = (archivo.size / 1024 / 1024).toFixed(2)
            const maxMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0)
            console.log(`Archivo ${archivo.name} excede el tamaño máximo`)
            return NextResponse.json({
              error: `El archivo "${archivo.name}" (${sizeMB}MB) excede el tamaño máximo de ${maxMB}MB`
            }, { status: 413 })
          }

          try {
            const bytes = await archivo.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Generar nombre único y seguro
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(2, 8)
            const extension = path.extname(archivo.name)
            const baseName = path.basename(archivo.name, extension)
              .replace(/[^a-zA-Z0-9.-]/g, '_')
              .substring(0, 50)
            
            const fileName = `update_${projectId}_${timestamp}_${randomStr}_${baseName}${extension}`
            const filePath = path.join(uploadDir, fileName)

            // Guardar archivo
            await writeFile(filePath, buffer)
            
            // Guardar ruta relativa
            archivosGuardados.push(`/uploads/project-updates/${fileName}`)
            
            console.log(`Archivo guardado: ${fileName}`)
          } catch (fileError) {
            console.error('Error al guardar archivo:', fileError)
            return NextResponse.json({
              error: `Error al guardar el archivo "${archivo.name}"`,
              details: fileError.message
            }, { status: 500 })
          }
        }
      }
    }

    // Insertar avance en la base de datos
    console.log('Guardando en base de datos...')
    try {
      const result = await consulta(
        `INSERT INTO project_updates 
          (project_id, freelancer_id, titulo, descripcion, archivos, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          projectId,
          userId,
          titulo,
          descripcion,
          JSON.stringify(archivosGuardados)
        ]
      )

  console.log('Avance creado exitosamente, ID:', result.insertId)

      return NextResponse.json({
        success: true,
        message: 'Avance agregado exitosamente',
        updateId: result.insertId,
        archivosSubidos: archivosGuardados.length
      }, { status: 200 })
      
    } catch (dbError) {
      console.error('Error en base de datos:', dbError)
      return NextResponse.json({
        error: 'Error al guardar en la base de datos',
        details: dbError.message
      }, { status: 500 })
    }

  } catch (error) {
  console.error('Error general al crear avance:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Error al crear avance', 
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

// GET - Obtener avances de un proyecto
export async function GET(req) {
  console.log('=== GET /api/project-updates ===')
  
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

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    console.log('Obteniendo avances para proyecto:', projectId)

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID requerido' }, { status: 400 })
    }

    // Verificar que el usuario tiene acceso al proyecto
    const userId = decoded.userId
    const proyecto = await consulta(
      'SELECT * FROM projects WHERE id = ? AND (client_id = ? OR freelancer_id = ?)',
      [projectId, userId, userId]
    )

    if (proyecto.length === 0) {
      return NextResponse.json(
        { error: 'No tienes acceso a este proyecto' },
        { status: 403 }
      )
    }

    // Obtener avances con información del freelancer
    const avances = await consulta(
      `SELECT 
        pu.id,
        pu.project_id,
        pu.titulo,
        pu.descripcion,
        pu.archivos,
        pu.created_at,
        u.first_name as freelancer_first_name,
        u.last_name as freelancer_last_name,
        u.avatar as freelancer_avatar
      FROM project_updates pu
      JOIN users u ON pu.freelancer_id = u.id
      WHERE pu.project_id = ?
      ORDER BY pu.created_at DESC`,
      [projectId]
    )

    console.log('Avances encontrados:', avances.length)

    // Parsear archivos JSON
    const avancesFormateados = avances.map(avance => ({
      id: avance.id,
      titulo: avance.titulo,
      descripcion: avance.descripcion,
      archivos: avance.archivos ? JSON.parse(avance.archivos) : [],
      created_at: avance.created_at,
      freelancer_first_name: avance.freelancer_first_name,
      freelancer_last_name: avance.freelancer_last_name,
      freelancer_avatar: avance.freelancer_avatar
    }))

    return NextResponse.json({ avances: avancesFormateados })

  } catch (error) {
    console.error('Error al obtener avances:', error)
    return NextResponse.json(
      { error: 'Error al obtener avances', details: error.message },
      { status: 500 }
    )
  }
}