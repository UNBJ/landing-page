import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno de .env y .env.local si existen
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'unbj-photos';
// URL pública del bucket (debe terminar en /)
let R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
if (R2_PUBLIC_URL && !R2_PUBLIC_URL.endsWith('/')) {
  R2_PUBLIC_URL += '/';
}

const DATA_DIR = path.resolve(__dirname, '../src/data');
const OUTPUT_FILE = path.resolve(DATA_DIR, 'photos.json');

const EMPTY_PHOTOS = {
  lunes: [],
  martes: [],
  miercoles: [],
  jueves: [],
};

async function syncPhotos() {
  console.log('🔄 Sincronizando fotos de Cloudflare R2...');

  // Asegurar que el directorio de datos existe
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Verificar credenciales
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
    console.warn('⚠️  ADVERTENCIA: Falta configurar variables de entorno para Cloudflare R2.');
    console.warn('⚠️  Se generará una galería vacía hasta que haya fotos disponibles.');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(EMPTY_PHOTOS, null, 2), 'utf8');
    console.log(`✅ Archivo JSON de fotos vacío guardado con éxito en: ${OUTPUT_FILE}`);
    return;
  }

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    const days = ['lunes', 'martes', 'miercoles', 'jueves'];
    const result = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
    };

    const publicBaseUrl = R2_PUBLIC_URL || `${R2_ENDPOINT.replace(/\/$/, '')}/${R2_BUCKET_NAME}/`;

    for (const day of days) {
      console.log(`📂 Listando fotos para el día: ${day}...`);
      
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: `${day}/`,
      });

      const response = await s3.send(command);
      
      if (response.Contents) {
        // Filtrar archivos de imagen válidos (jpg, jpeg, png, webp, gif)
        const imageFiles = response.Contents.filter(item => {
          const ext = path.extname(item.Key).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        });

        result[day] = imageFiles.map((item, index) => {
          const id = `${day.substring(0, 2)}_${index + 1}`;
          const url = `${publicBaseUrl}${item.Key}`;
          
          // Por defecto las fotos R2 de móviles/cámaras suelen ser 4:3 o 3:2
          // Asignamos una proporción típica para el grid (ej. 3:2)
          return {
            id,
            url,
            // Guardamos la key del objeto por si se necesita para operaciones directas
            key: item.Key,
            width: 1600,
            height: 1066,
          };
        });

        console.log(`   Found ${result[day].length} photos for ${day}.`);
      } else {
        console.log(`   No photos found for ${day}.`);
      }
    }

    // Escribir a JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
    console.log(`✅ Archivo JSON de fotos actualizado con éxito en: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Error al conectar o leer de Cloudflare R2:', error);
    console.warn('⚠️ Se usará una galería vacía para continuar con el build.');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(EMPTY_PHOTOS, null, 2), 'utf8');
  }
}

syncPhotos();
