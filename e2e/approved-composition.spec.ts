import { expect, test } from '@playwright/test';
import { expectNoSeriousAccessibilityViolations } from './support/accessibility';
import {
  EyesTheme,
  expectNoHorizontalPageOverflow,
  prepareDeterministicPage,
  settleVisualState,
} from './support/quality-gates';

const themes: EyesTheme[] = ['light', 'dark', 'high-contrast-light', 'high-contrast-dark'];
for (const route of ['/login', '/dashboard', '/audit']) {
  for (const theme of themes) {
    test(`${route}: composição aprovada reflui em ${theme}`, async ({ page }) => {
      test.setTimeout(90_000);
      await prepareDeterministicPage(page, { theme, authenticated: route !== '/login' });
      for (const width of [320, 390, 1440]) {
        for (const scale of [100, 200]) {
          await page.setViewportSize({
            width,
            height: width === 320 ? 800 : width === 390 ? 844 : 900,
          });
          await page.goto(route);
          await page.evaluate((value) => {
            document.documentElement.style.fontSize = `${value}%`;
          }, scale);
          await settleVisualState(page);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await expectNoHorizontalPageOverflow(page);
          await expectNoSeriousAccessibilityViolations(page);
          if (scale === 100 && route === '/login') {
            const button = await page
              .getByRole('button', { name: 'Entrar', exact: true })
              .boundingBox();
            expect(button).not.toBeNull();
            expect(button!.y + button!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
          }
        }
      }
    });
  }
}

test('auditoria preserva identificadores em detalhes acessíveis por teclado', async ({ page }) => {
  await prepareDeterministicPage(page, { authenticated: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/audit');
    const summary = page
      .getByRole('button', { name: /^Ver detalhes de/ })
      .filter({ visible: true });
    await expect(summary).toHaveCount(1);
    const region =
      width === 1440 ? page.locator('.eyes-desktop-table') : page.locator('.eyes-compact-list');
    await expect(region.getByText('e2e-correlation-1', { exact: true })).toBeHidden();
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(region.getByText('admin-1', { exact: true })).toBeVisible();
    await expect(region.getByText('user-1', { exact: true })).toBeVisible();
    await expect(region.getByText('e2e-correlation-1', { exact: true })).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
    await expectNoSeriousAccessibilityViolations(page);
    await page.keyboard.press('Enter');
    await expect(region.getByText('e2e-correlation-1', { exact: true })).toBeHidden();
  }
});
