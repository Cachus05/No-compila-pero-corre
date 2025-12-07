import mysql from 'mysql2/promise';

export async function conectarDB() {
  const conexion = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'freelance_platform'
  });
  
  return conexion;
}

export async function consulta(sql, parametros = []) {
  const conexion = await conectarDB();
  
  try {
    const [resultados] = await conexion.execute(sql, parametros);
    return resultados;
  } catch (error) {
    console.error('Error en la consulta:', error);
    throw error;
  } finally {
    await conexion.end();
  }
}

// Alias para compatibilidad con otros archivos
export const query = consulta;