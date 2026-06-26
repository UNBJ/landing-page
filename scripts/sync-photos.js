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

// Unsplash photos for mock data when R2 is not configured
const MOCK_PHOTOS = {
  lunes: [
    { id: 'l1', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'l2', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'l3', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1600', width: 1600, height: 1200 },
    { id: 'l4', url: 'https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'l5', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'l6', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'l7', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'l8', url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'l9', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'l10', url: 'https://images.unsplash.com/photo-1469571486040-afb75914904a?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'l11', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'l12', url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1600', width: 1600, height: 1066 },
  ],
  martes: [
    { id: 'm1', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'm2', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'm3', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'm4', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'm5', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'm6', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'm7', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'm8', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'm9', url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'm10', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'm11', url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'm12', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1600', width: 1600, height: 1066 },
  ],
  miercoles: [
    { id: 'mi1', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'mi2', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'mi3', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'mi4', url: 'https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'mi5', url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'mi6', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'mi7', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'mi8', url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'mi9', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'mi10', url: 'https://images.unsplash.com/photo-1469571486040-afb75914904a?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'mi11', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'mi12', url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1600', width: 1600, height: 1066 },
  ],
  jueves: [
    { id: 'j1', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'j2', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'j3', url: 'https://images.unsplash.com/photo-1469571486040-afb75914904a?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'j4', url: 'https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'j5', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'j6', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'j7', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'j8', url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'j9', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'j10', url: 'https://images.unsplash.com/photo-1469571486040-afb75914904a?q=80&w=1600', width: 1600, height: 1066 },
    { id: 'j11', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&h=1500&fit=crop', width: 1000, height: 1500 },
    { id: 'j12', url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1600', width: 1600, height: 1066 },
  ],
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
    console.warn('⚠️  Se generarán datos mockeados de demostración basados en Unsplash.');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(MOCK_PHOTOS, null, 2), 'utf8');
    console.log(`✅ Archivo JSON de fotos mock guardado con éxito en: ${OUTPUT_FILE}`);
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
    console.warn('⚠️ Se usará el JSON de respaldo/mock para continuar con el build.');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(MOCK_PHOTOS, null, 2), 'utf8');
  }
}

syncPhotos();
