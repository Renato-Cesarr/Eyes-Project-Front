import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const target = process.argv[2];
if (!target) throw new Error('Informe o caminho privado do arquivo de QA.');
const secret = () => randomBytes(32).toString('hex');
const content = `QA_ENVIRONMENT=eyes-ren73-qa
PORT=8080
DB_HOST=127.0.0.1
DB_PORT=15433
DB_NAME=eyes_local
DB_USER=eyes_local
DB_PASSWORD=${secret()}
JWT_SECRET=${secret()}
JWT_EXPIRATION_HOURS=24
FRONTEND_URL=http://127.0.0.1:4330
CORS_ALLOWED_ORIGINS=http://127.0.0.1:4330
SMTP_HOST=127.0.0.1
SMTP_PORT=1026
SMTP_USER=
SMTP_PASSWORD=
SMTP_AUTH=false
SMTP_STARTTLS=false
MAILPIT_HTTP_PORT=8026
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_NAME=Administrador QA
BOOTSTRAP_ADMIN_EMAIL=qa-admin@eyes.test
BOOTSTRAP_ADMIN_PASSWORD=${secret()}
SCAN_COLLECTION_ENABLED=true
`;
// Existing credentials must survive reruns: never overwrite or print them.
await writeFile(target, content, { flag: 'wx', mode: 0o600 });
console.log('Configuração exclusiva de QA criada; segredos omitidos.');
