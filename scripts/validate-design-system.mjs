import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const tokensPath = fileURLToPath(
  new URL('../docs/design-system/design-tokens.json', import.meta.url),
);
const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));

const failures = [];
const requiredThemes = ['light', 'dark', 'highContrastLight', 'highContrastDark'];
const requiredColors = [
  'background',
  'onBackground',
  'surface',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'outline',
  'primary',
  'onPrimary',
  'secondary',
  'onSecondary',
  'success',
  'onSuccess',
  'warning',
  'onWarning',
  'error',
  'onError',
  'focus',
];

if (!/^\d+\.\d+\.\d+$/.test(tokens.meta?.version ?? '')) {
  failures.push('meta.version deve seguir versionamento semântico.');
}

for (const themeName of requiredThemes) {
  const theme = tokens.semantic?.[themeName];
  if (!theme) {
    failures.push(`Tema obrigatório ausente: ${themeName}.`);
    continue;
  }

  for (const tokenName of requiredColors) {
    const value = theme[tokenName];
    if (!/^#[0-9A-F]{6}$/.test(value ?? '')) {
      failures.push(`${themeName}.${tokenName} deve usar hexadecimal #RRGGBB.`);
    }
  }
}

if (tokens.size?.touchTargetMinimum !== '48px') {
  failures.push('A área de toque mínima deve permanecer em 48px/48dp.');
}

for (const pair of tokens.contrastPairs ?? []) {
  const foreground = resolvePath(tokens, pair.foreground);
  const background = resolvePath(tokens, pair.background);
  if (!foreground || !background) {
    failures.push(`Par de contraste aponta para token inexistente: ${pair.usage}.`);
    continue;
  }

  const ratio = contrastRatio(foreground, background);
  if (ratio + Number.EPSILON < pair.minimum) {
    failures.push(`${pair.usage}: ${ratio.toFixed(2)}:1, mínimo ${pair.minimum}:1.`);
  }
}

if (failures.length > 0) {
  console.error('Design System inválido:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Design System ${tokens.meta.version} válido: ${requiredThemes.length} temas e ${tokens.contrastPairs.length} pares de contraste.`,
  );
}

function resolvePath(source, path) {
  return path.split('.').reduce((value, key) => value?.[key], source);
}

function contrastRatio(first, second) {
  const lightest = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darkest = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lightest + 0.05) / (darkest + 0.05);
}

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
