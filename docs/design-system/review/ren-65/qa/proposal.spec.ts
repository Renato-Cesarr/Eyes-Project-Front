import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const output = resolve(__dirname, '../qa-results');
const captures = resolve(__dirname, '../captures');
mkdirSync(output, { recursive: true });
mkdirSync(captures, { recursive: true });
const themes = ['light', 'dark', 'highContrastLight', 'highContrastDark'];
for (const screen of ['login', 'dashboard', 'home', 'settings'])
  for (const theme of themes) {
    test(`${screen}: tema ${theme}, reflow e contraste`, async ({ page }) => {
      const records = [];
      for (const width of screen === 'login' || screen === 'dashboard'
        ? [320, 390, 1440]
        : [320, 390])
        for (const scale of [100, 150, 200]) {
          const height = width === 320 ? 800 : width === 390 ? 844 : 900;
          await page.setViewportSize({ width, height });
          await page.goto(`/screen.html?screen=${screen}&theme=${theme}&scale=${scale}`);
          await page.evaluate(() => document.fonts.ready);
          await expect(page.locator('h1')).toBeVisible();
          const layout = await page.evaluate(() => ({
            width: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
            controls: [
              ...document.querySelectorAll('button,input:not([type="checkbox"]),select'),
            ].map((el) => {
              const r = el.getBoundingClientRect();
              return {
                name: el.getAttribute('aria-label') || el.textContent?.trim() || el.id,
                x: r.x,
                right: r.right,
                height: r.height,
                width: r.width,
              };
            }),
          }));
          if (layout.scrollWidth > layout.width)
            console.log(
              await page.evaluate(() =>
                [...document.querySelectorAll('body *')]
                  .map((el) => {
                    const r = el.getBoundingClientRect();
                    return {
                      tag: el.tagName,
                      class: el.className,
                      text: el.textContent?.slice(0, 65),
                      right: r.right,
                      width: r.width,
                      scrollWidth: el.scrollWidth,
                    };
                  })
                  .filter((el) => el.right > innerWidth)
                  .slice(-20),
              ),
            );
          expect(
            layout.scrollWidth,
            `${screen}/${theme}/${width}/${scale} overflow`,
          ).toBeLessThanOrEqual(layout.width);
          for (const control of layout.controls.filter(
            (item) => item.width > 0 && item.height > 0,
          )) {
            expect(control.x, control.name).toBeGreaterThanOrEqual(0);
            expect(control.right, control.name).toBeLessThanOrEqual(width);
            expect(control.height, control.name).toBeGreaterThanOrEqual(44);
          }
          const a11y = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(
            a11y.violations,
            JSON.stringify(
              a11y.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
            ),
          ).toEqual([]);
          if (scale === 100 && width === (['home', 'settings'].includes(screen) ? 390 : 1440)) {
            await page.screenshot({
              path: resolve(captures, `${screen}-${theme}.png`),
              fullPage: false,
            });
          }
          if (theme === 'light' && scale === 100) {
            await page.screenshot({
              path: resolve(output, `${screen}-${width}-light.png`),
              fullPage: false,
            });
          }
          records.push({
            screen,
            theme,
            width,
            height,
            scale,
            documentHeight: layout.height,
            overflow: false,
            axeViolations: 0,
          });
        }
      writeFileSync(
        resolve(output, `${screen}-${theme}-layout.json`),
        JSON.stringify(records, null, 2),
      );
    });
  }
test('ações principais próximas do topo e estados sem dados fabricados', async ({ page }) => {
  const landmarks = [];
  for (const [screen, label] of [
    ['login', 'Entrar'],
    ['home', 'Abrir câmera'],
    ['settings', 'Testar voz'],
  ])
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: width === 320 ? 800 : 844 });
      await page.goto(`/screen.html?screen=${screen}`);
      await page.evaluate(() => document.fonts.ready);
      const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
      expect(box!.y + box!.height).toBeLessThan(width === 320 ? 800 : 844);
      landmarks.push({ screen, viewportWidth: width, label, ...box });
    }
  for (const state of ['empty', 'partial', 'error', 'loading']) {
    await page.goto(`/screen.html?screen=dashboard&state=${state}`);
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations,
    ).toEqual([]);
    if (state === 'partial') {
      await expect(page.getByText('Atividade indisponível')).toBeVisible();
      await expect(page.getByText('1 solicitação aguarda análise')).toBeVisible();
    }
    if (state === 'empty') {
      await expect(page.getByText('Nenhuma solicitação pendente')).toBeVisible();
    }
    if (state === 'error') {
      await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    }
  }
  writeFileSync(resolve(output, 'action-landmarks.json'), JSON.stringify(landmarks, null, 2));
});
test('controles e navegação de revisão sem chamar API/câmera/voz', async ({ page }) => {
  const remote: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:4315')) remote.push(r.url());
  });
  await page.goto('/screen.html?screen=home');
  await page.getByRole('button', { name: 'Abrir câmera', exact: true }).click();
  await expect(page.locator('#announcement')).toContainText('Protótipo visual');
  await page.getByRole('link', { name: 'Áudio e alertas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Áudio e alertas' })).toBeVisible();
  await page.getByLabel('Velocidade da voz', { exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#rate-value')).toHaveText('55%');
  await page.getByRole('button', { name: 'Testar voz', exact: true }).click();
  await expect(page.locator('#announcement')).toContainText('Protótipo visual');
  await page.getByLabel('Tema do aplicativo', { exact: true }).selectOption('highContrastDark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'highContrastDark');
  await page.getByRole('button', { name: 'Voltar ao início' }).click();
  await expect(page.getByRole('heading', { name: 'Reconhecer objetos' })).toBeVisible();
  await page.goto('/screen.html?screen=login');
  await page.getByLabel('Senha', { exact: true }).fill('fixture-only');
  await page.getByRole('button', { name: 'Mostrar senha' }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar senha' }).click();
  expect(remote).toEqual([]);
});
test('estados de recuperação permanecem acessíveis em 320px com texto ampliado', async ({
  page,
}) => {
  const states = {
    login: ['error', 'loading'],
    dashboard: ['empty', 'partial', 'error', 'loading'],
    home: ['error', 'loading'],
    settings: ['error', 'loading', 'channelUnavailable', 'saveError'],
  };
  await page.setViewportSize({ width: 320, height: 800 });
  for (const [screen, values] of Object.entries(states))
    for (const state of values)
      for (const theme of ['light', 'highContrastDark']) {
        await page.goto(`/screen.html?screen=${screen}&state=${state}&theme=${theme}&scale=200`);
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
          `${screen}/${state}/${theme}`,
        ).toBeLessThanOrEqual(320);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
});
test('revisão identifica comparações incompatíveis e preserva viewport da proposta', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.getByLabel('Comparar com atual').check();
  await expect(page.locator('#before-panel')).toBeVisible();
  await page.getByLabel('Tela', { exact: true }).selectOption('home');
  await expect(page.locator('#preview')).toHaveAttribute('width', '390');
  await page.getByLabel('Texto', { exact: true }).selectOption('200');
  await expect(page.locator('#reference-note')).toContainText('Não é uma comparação equivalente');
  await page.getByLabel('Tela', { exact: true }).selectOption('dashboard');
  await page.getByLabel('Texto', { exact: true }).selectOption('100');
  await expect(page.locator('#preview')).toHaveAttribute('width', '1440');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
