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

for (const [name, route, width, theme] of [
  ['requests-desktop-light', '/requests', 1440, 'light'],
  ['requests-mobile-dark', '/requests', 390, 'dark'],
  ['users-desktop-light', '/users', 1440, 'light'],
  ['users-desktop-dark', '/users', 1440, 'dark'],
  ['request-access-mobile-light', '/solicitar-acesso', 320, 'light'],
  ['setup-password-desktop-light', '/setup-password?token=e2e-visual-invite', 1440, 'light'],
  ['forgot-password-mobile-light', '/forgot-password', 320, 'light'],
  ['reset-password-mobile-dark', '/reset-password?token=e2e-visual-reset', 390, 'dark'],
  ['reset-password-missing-token', '/reset-password', 320, 'high-contrast-light'],
  ['access-denied-mobile', '/acesso-negado', 320, 'high-contrast-dark'],
] as const) {
  test(`${name}: extensão visual permanece estável`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await prepareDeterministicPage(page, {
      theme,
      authenticated: route === '/users' || route === '/requests',
    });
    await page.goto(route);
    await settleVisualState(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (route === '/users' || route === '/requests') {
      await expect(
        page.locator('.eyes-desktop-table, .eyes-compact-list').filter({ visible: true }),
      ).toBeVisible();
    }
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
