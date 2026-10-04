import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 120_000,
  workers: 2,
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: resolve(__dirname, '../qa-results/report.json') }]],
  use: { baseURL: 'http://127.0.0.1:4315', browserName: 'chromium' },
  outputDir: '../qa-results/test-artifacts',
  webServer: {
    command: `"${process.execPath}" "${resolve(__dirname, '../serve.mjs')}"`,
    url: 'http://127.0.0.1:4315',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
