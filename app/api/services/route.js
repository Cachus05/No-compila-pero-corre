import { NextResponse } from 'next/server';
import { consulta } from '../../lib/db';
import { verificarToken } from '../../lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    // 1. Verificar autorización
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Sin header de autorización');
      return NextResponse.json({ error: 'No autorizado - falta token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token recibido, longitud:', token.length);
    
    // 2. Verificar token (AHORA CON AWAIT porque verificarToken es async)
    const usuario = await verificarToken(token);
    
    if (!usuario) {
      console.error('Token inválido o usuario no encontrado');
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }

    // 3. DEBUG: Verificar tipo de usuario
    console.log('Usuario verificado:', { 
      id: usuario.id, 
      user_type: usuario.user_type,
      email: usuario.email 
    });

    // 4. Verificar que sea freelancer
    const userType = usuario.user_type?.toLowerCase()?.trim();
    
    if (userType !== 'freelancer') {
      console.error('Tipo de usuario inválido:', {
        recibido: usuario.user_type,
        tipo: typeof usuario.user_type,
        esperado: 'freelancer'
      });
      
      return NextResponse.json(
        { 
          error: 'Solo los freelancers pueden publicar servicios',
          detalles: `Tu tipo de usuario es: ${usuario.user_type || 'undefined'}`
        }, 
        { status: 403 }
      );
    }

    console.log('✓ Verificación de freelancer exitosa');

    // 5. Obtener datos del formulario
    const formData = await request.formData();
    
    const title = formData.get('title')?.toString()?.trim() || '';
    const description = formData.get('description')?.toString()?.trim() || '';
    const category = formData.get('category')?.toString()?.trim() || '';
    const subcategory = formData.get('subcategory')?.toString()?.trim() || null;
    const price_type = formData.get('price_type')?.toString()?.trim() || 'fixed';
    const base_price = formData.get('price')?.toString()?.trim() || '0';
    const delivery_time = formData.get('delivery_time')?.toString()?.trim() || '3';
    const requirements = formData.get('requirements')?.toString()?.trim() || null;
    const tags = formData.get('tags')?.toString()?.trim() || null;

    console.log('Datos del formulario:', { title, category, base_price, delivery_time });

    // 6. Validar campos obligatorios
    if (!title || !description || !category) {
      console.error('Faltan campos obligatorios');
      return NextResponse.json(
        { 
          error: 'Faltan campos obligatorios',
          detalles: {
            title: !title ? 'requerido' : 'ok',
            description: !description ? 'requerido' : 'ok',
            category: !category ? 'requerido' : 'ok'
          }
        }, 
        { status: 400 }
      );
    }

    // 7. Validar precio
    const priceValue = parseFloat(base_price);
    if (isNaN(priceValue) || priceValue < 5) {
      console.error('Precio inválido:', base_price);
      return NextResponse.json(
        { error: 'El precio debe ser un número mayor o igual a $5' }, 
        { status: 400 }
      );
    }

    console.log('✓ Validaciones pasadas');

    // 8. Procesar imágenes
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'services');
    
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('✓ Directorio de uploads creado/verificado');
    } catch (mkdirError) {
      console.error('Error creando directorio:', mkdirError);
      // Continuar de todos modos
    }

    const imageUrls = [];
    const imageFiles = formData.getAll('images');

    console.log(`Procesando ${imageFiles.length} imagen(es)...`);

    for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
      const file = imageFiles[i];
      
      // Verificar que sea un archivo válido
      if (file && file instanceof Blob && file.size > 0) {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const timestamp = Date.now();
          
          // Obtener extensión del archivo de forma segura
          let extension = 'jpg';
          if (file.name) {
            const parts = file.name.split('.');
            if (parts.length > 1) {
              extension = parts[parts.length - 1].toLowerCase();
            }
          }
          
          const filename = `service_${usuario.id}_${timestamp}_${i}.${extension}`;
          const path = join(uploadsDir, filename);
          
          await writeFile(path, buffer);
          imageUrls.push(`/uploads/services/${filename}`);
          
          console.log(`✓ Imagen ${i + 1} guardada: ${filename}`);
        } catch (imgError) {
          console.error(`Error al guardar imagen ${i + 1}:`, imgError.message);
          // Continuar con las demás imágenes
        }
      }
    }

    console.log(`✓ Total de imágenes procesadas: ${imageUrls.length}`);

    // 9. Insertar en base de datos
    console.log('Insertando servicio en base de datos...');
    
    try {
      const resultado = await consulta(
        `INSERT INTO services 
        (freelancer_id, title, description, category, subcategory, price_type, 
         base_price, delivery_time, requirements, tags, gallery_images, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          usuario.id,
          title,
          description,
          category,
          subcategory,
          price_type,
          priceValue,
          parseInt(delivery_time) || 3,
          requirements,
          tags,
          imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
          1 // is_active
        ]
      );

      console.log('✓ Servicio insertado exitosamente con ID:', resultado.insertId);

      // 10. Respuesta exitosa
      return NextResponse.json({
        mensaje: 'Servicio publicado exitosamente',
        servicio: {
          id: resultado.insertId,
          title,
          category,
          base_price: priceValue,
          images: imageUrls,
          freelancer_id: usuario.id
        }
      }, { status: 201 });

    } catch (dbError) {
      console.error('Error en la base de datos:', {
        mensaje: dbError.message,
        code: dbError.code,
        sqlMessage: dbError.sqlMessage
      });
      
      return NextResponse.json(
        { 
          error: 'Error al guardar en la base de datos',
          detalles: dbError.message
        }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('ERROR GENERAL al crear servicio:', {
      mensaje: error.message,
      stack: error.stack,
      nombre: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'Error al publicar servicio', 
        detalles: error.message,
        tipo: error.name
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    let query = `
      SELECT s.*, u.first_name, u.last_name, u.avatar, u.email
      FROM services s 
      JOIN users u ON s.freelancer_id = u.id 
      WHERE s.is_active = 1
    `;
    const params = [];

    if (userId) {
      query += ' AND s.freelancer_id = ?';
      params.push(userId);
    }

    if (category) {
      query += ' AND s.category = ?';
      params.push(category);
    }

    query += ' ORDER BY s.created_at DESC';

    console.log('Ejecutando query GET:', query);
    console.log('Parámetros:', params);

    const servicios = await consulta(query, params);

    const serviciosFormateados = servicios.map(servicio => ({
      ...servicio,
      gallery_images: servicio.gallery_images 
        ? JSON.parse(servicio.gallery_images) 
        : [],
      freelancer: {
        id: servicio.freelancer_id,
        first_name: servicio.first_name,
        last_name: servicio.last_name,
        avatar: servicio.avatar,
        email: servicio.email
      }
    }));

    console.log(`Servicios encontrados: ${serviciosFormateados.length}`);

    return NextResponse.json({ servicios: serviciosFormateados });

  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener servicios', 
        detalles: error.message 
      }, 
      { status: 500 }
    );
  }
}