import { expect, Page } from '@playwright/test';
import { mockApi } from './api-mocks';

export type EyesTheme = 'light' | 'dark' | 'high-contrast-light' | 'high-contrast-dark';

export async function prepareDeterministicPage(
  page: Page,
  options: { theme?: EyesTheme; authenticated?: boolean } = {},
): Promise<void> {
  const theme = options.theme ?? 'light';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(
    ({ selectedTheme, authenticated }) => {
      window.localStorage.setItem('eyes-theme-preference', selectedTheme);
      if (authenticated) {
        window.sessionStorage.setItem('auth_token', 'e2e-session-token');
      }
    },
    { selectedTheme: theme, authenticated: Boolean(options.authenticated) },
  );
  await mockApi(page);
}

export async function settleVisualState(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
      * {
        scrollbar-width: none !important;
      }
      *::-webkit-scrollbar {
        display: none !important;
      }
    `,
  });
  await expect(page.locator('body')).toBeVisible();
}

export async function expectNoHorizontalPageOverflow(page: Page): Promise<void> {
  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
}
