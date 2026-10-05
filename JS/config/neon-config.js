// Configuración de conexión directa a Neon DB para Crocanti Chicken
import { neon } from 'https://cdn.jsdelivr.net/npm/@neondatabase/serverless@0.9.0/+esm';

// Cadena de conexión obtenida de tu panel de Neon
const CONNECTION_STRING = 'postgresql://neondb_owner:npg_ODcoN70JFlhS@ep-calm-mountain-b46b69il-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(CONNECTION_STRING);

export async function consultarNeon(sqlQuery, params = []) {
  try {
    if (params && params.length > 0) {
      const resultado = await sql(sqlQuery, params);
      return resultado;
    }
    const resultado = await sql(sqlQuery);
    return resultado;
  } catch (error) {
    console.error('[Crocanti DB Error]:', error.message);
    throw error;
  }
}