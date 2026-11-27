import { readFileSync, writeFileSync } from 'node:fs';

const configuredOrigin = process.env.API_ORIGIN;
const api = URL.parse(configuredOrigin ?? '');
if (!api || api.protocol !== 'https:' || configuredOrigin !== api.origin) {
  throw new Error('API_ORIGIN deve ser uma origem HTTPS sem caminho, barra final ou credenciais.');
}

const config = { production: true, apiUrl: `${api.origin}/api` };
const destination = new URL('../src/environments/environment.cloud.ts', import.meta.url);
const indexPath = new URL('../src/index.html', import.meta.url);
const index = readFileSync(indexPath, 'utf8');
const connectSources = /\bconnect-src [^;]+(?=;)/g;
if (Array.from(index.matchAll(connectSources)).length !== 1) {
  throw new Error('A página inicial deve definir uma diretiva connect-src.');
}
writeFileSync(destination, `export const environment = ${JSON.stringify(config)};\n`, 'utf8');
writeFileSync(indexPath, index.replace(connectSources, `connect-src 'self' ${api.origin}`), 'utf8');
