import { NextResponse } from 'next/server'
import { consulta } from '../../../lib/db'
import { verificarToken } from '../../../lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request, { params }) {
	try {
		const { id } = params
		const servicios = await consulta(
			`SELECT s.*, u.first_name, u.last_name, u.avatar, u.email
			 FROM services s JOIN users u ON s.freelancer_id = u.id WHERE s.id = ? AND s.is_active = 1`,
			[id]
		)

		if (!servicios || servicios.length === 0) {
			return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
		}

		const servicio = servicios[0]
		servicio.gallery_images = servicio.gallery_images ? JSON.parse(servicio.gallery_images) : []

		return NextResponse.json({ servicio })
	} catch (err) {
		console.error('Error GET /api/services/[id]:', err)
		return NextResponse.json({ error: 'Error al obtener servicio' }, { status: 500 })
	}
}

export async function PUT(request, { params }) {
	try {
		const authHeader = request.headers.get('authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}
		const token = authHeader.substring(7)
		const usuario = await verificarToken(token)
		if (!usuario) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

		const { id } = params

		// Verificar que el servicio exista y pertenezca al usuario
		const rows = await consulta('SELECT * FROM services WHERE id = ?', [id])
		if (!rows || rows.length === 0) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
		const servicio = rows[0]
		if (servicio.freelancer_id !== usuario.id) return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 })

		const data = await request.formData()
		const title = data.get('title')?.toString()?.trim() || servicio.title
		const description = data.get('description')?.toString()?.trim() || servicio.description
		const category = data.get('category')?.toString()?.trim() || servicio.category
		const base_price = parseFloat(data.get('price')?.toString() || servicio.base_price)

		// Procesar imágenes nuevas
		const uploadsDir = join(process.cwd(), 'public', 'uploads', 'services')
		let galleryImages = servicio.gallery_images ? JSON.parse(servicio.gallery_images) : []

		// Obtener las imágenes actuales del cliente (las que se mantienen)
		const currentImagesStr = data.get('currentImages')
		if (currentImagesStr) {
			galleryImages = JSON.parse(currentImagesStr)
		}

		// Procesar nuevas imágenes
		try {
			await mkdir(uploadsDir, { recursive: true })
		} catch (mkdirError) {
			console.error('Error creando directorio:', mkdirError)
		}

		const imageFiles = data.getAll('images')
		const newImageUrls = []

		for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
			const file = imageFiles[i]

			if (file && file instanceof Blob && file.size > 0) {
				try {
					const bytes = await file.arrayBuffer()
					const buffer = Buffer.from(bytes)
					const timestamp = Date.now()

					let extension = 'jpg'
					if (file.name) {
						const parts = file.name.split('.')
						if (parts.length > 1) {
							extension = parts[parts.length - 1].toLowerCase()
						}
					}

					const filename = `service_${usuario.id}_${timestamp}_${i}.${extension}`
					const path = join(uploadsDir, filename)

					await writeFile(path, buffer)
					newImageUrls.push(`/uploads/services/${filename}`)
				} catch (imgError) {
					console.error(`Error al guardar imagen ${i + 1}:`, imgError.message)
				}
			}
		}

		// Combinar imágenes actuales con nuevas
		const allImages = [...galleryImages, ...newImageUrls]
		const finalImages = allImages.slice(0, 5)

		await consulta(
			`UPDATE services SET title = ?, description = ?, category = ?, base_price = ?, gallery_images = ? WHERE id = ?`,
			[title, description, category, base_price, JSON.stringify(finalImages), id]
		)

		return NextResponse.json({ mensaje: 'Servicio actualizado' })
	} catch (err) {
		console.error('Error PUT /api/services/[id]:', err)
		return NextResponse.json({ error: 'Error al actualizar servicio' }, { status: 500 })
	}
}

export async function DELETE(request, { params }) {
	try {
		const authHeader = request.headers.get('authorization')
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}
		const token = authHeader.substring(7)
		const usuario = await verificarToken(token)
		if (!usuario) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

		const { id } = params

		const rows = await consulta('SELECT * FROM services WHERE id = ?', [id])
		if (!rows || rows.length === 0) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
		const servicio = rows[0]
		if (servicio.freelancer_id !== usuario.id) return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 })

		// Soft delete: mark inactive
		await consulta('UPDATE services SET is_active = 0 WHERE id = ?', [id])

		return NextResponse.json({ mensaje: 'Servicio eliminado' })
	} catch (err) {
		console.error('Error DELETE /api/services/[id]:', err)
		return NextResponse.json({ error: 'Error al eliminar servicio' }, { status: 500 })
	}
}
