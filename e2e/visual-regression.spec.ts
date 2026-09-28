import { expect, test } from '@playwright/test';
import { EyesTheme, prepareDeterministicPage, settleVisualState } from './support/quality-gates';

const themes: ReadonlyArray<EyesTheme> = [
  'light',
  'dark',
  'high-contrast-light',
  'high-contrast-dark',
];

for (const theme of themes) {
  test(`catálogo visual permanece estável no tema ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await prepareDeterministicPage(page, { theme, authenticated: true });
    await page.goto('/design-system');
    await settleVisualState(page);

    await expect(page).toHaveScreenshot(`design-system-${theme}.png`, { fullPage: true });
  });
}

test('login compacto permanece visualmente estável', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await prepareDeterministicPage(page);
  await page.goto('/login');
  await settleVisualState(page);

  await expect(page).toHaveScreenshot('login-mobile-light.png', { fullPage: true });
});

test('login desktop permanece visualmente estável', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepareDeterministicPage(page);
  await page.goto('/login');
  await settleVisualState(page);

  await expect(page).toHaveScreenshot('login-desktop-light.png', { fullPage: true });
});

test('login desktop escuro permanece visualmente estável', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepareDeterministicPage(page, { theme: 'dark' });
  await page.goto('/login');
  await settleVisualState(page);

  await expect(page).toHaveScreenshot('login-desktop-dark.png', { fullPage: true });
});

test('dashboard desktop permanece visualmente estável', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepareDeterministicPage(page, { authenticated: true });
  await page.goto('/dashboard');
  await settleVisualState(page);

  await expect(page).toHaveScreenshot('dashboard-desktop-light.png', { fullPage: true });
});

test('dashboard desktop escuro permanece visualmente estável', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepareDeterministicPage(page, { theme: 'dark', authenticated: true });
  await page.goto('/dashboard');
  await settleVisualState(page);

  await expect(page).toHaveScreenshot('dashboard-desktop-dark.png', { fullPage: true });
});

test('auditoria desktop permanece visualmente estável', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepareDeterministicPage(page, { authenticated: true });
  await page.goto('/audit');
  await settleVisualState(page);

  await expect(page).toHaveScreenshot('audit-desktop-light.png', { fullPage: true });
});

test('gestão responsiva permanece visualmente estável', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await prepareDeterministicPage(page, { theme: 'high-contrast-dark', authenticated: true });
  await page.goto('/users');
  await settleVisualState(page);

  await expect(page).toHaveScreenshot('users-mobile-high-contrast-dark.png', { fullPage: true });
});
