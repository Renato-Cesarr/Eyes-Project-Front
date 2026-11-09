import { writeFileSync } from 'node:fs';

const configuredOrigin = process.env.API_ORIGIN;
const api = URL.parse(configuredOrigin ?? '');
if (!api || api.protocol !== 'https:' || configuredOrigin !== api.origin) {
  throw new Error('API_ORIGIN deve ser uma origem HTTPS sem caminho, barra final ou credenciais.');
}

const config = { production: true, apiUrl: `${api.origin}/api` };
const destination = new URL('../src/environments/environment.cloud.ts', import.meta.url);
writeFileSync(destination, `export const environment = ${JSON.stringify(config)};\n`, 'utf8');
