import { expect, test } from '@playwright/test';
import { expectNoSeriousAccessibilityViolations } from './support/accessibility';
import {
  expectNoHorizontalPageOverflow,
  prepareDeterministicPage,
  settleVisualState,
} from './support/quality-gates';

const viewports = [
  { name: 'mobile', width: 320, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`login permanece acessível no viewport ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await prepareDeterministicPage(page);
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Entrar no painel' })).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page);
    await expectNoHorizontalPageOverflow(page);

    await page.getByLabel('E-mail').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Esqueceu a senha?' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'Senha', exact: true })).toBeFocused();
  });
}

test('painel reflui com texto a 200% e preserva navegação por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await prepareDeterministicPage(page, { authenticated: true });
  await page.goto('/dashboard');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });

  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
  await expect(page.getByText('Olá, Administradora Eyes.', { exact: false })).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  await expectNoSeriousAccessibilityViolations(page);

  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo principal' });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('filtros da auditoria abrem sem perder acessibilidade no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareDeterministicPage(page, { authenticated: true });
  await page.goto('/audit');

  const filters = page.getByText('Filtrar histórico');
  await expect(filters).toBeVisible();
  await filters.click();
  await expect(page.getByRole('search')).toBeVisible();
  await expect(page.getByLabel('Ação', { exact: true })).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  await expectNoSeriousAccessibilityViolations(page);
});

test('temas suportados mantêm contraste automatizado no catálogo', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await prepareDeterministicPage(page, { authenticated: true });
  await page.goto('/design-system');

  const theme = page.getByLabel('Tema da interface');
  for (const value of ['light', 'dark', 'high-contrast-light', 'high-contrast-dark']) {
    await theme.selectOption(value);
    await expect(page.locator('html')).toHaveAttribute('data-eyes-theme', value);
    await settleVisualState(page);
    await expectNoSeriousAccessibilityViolations(page);
  }
});
