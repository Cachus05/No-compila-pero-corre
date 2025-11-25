import { consulta } from '../../lib/db';

export async function GET() {
  try {
    // Prueba simple de conexión
    const resultado = await consulta('SELECT 1 + 1 AS resultado');
    
    return Response.json({ 
      mensaje: '¡Conexión exitosa a MySQL!',
      datos: resultado 
    });
  } catch (error) {
    return Response.json({ 
      error: 'Error al conectar con MySQL',
      detalles: error.message 
    }, { status: 500 });
  }
}