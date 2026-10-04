import { expect, test } from '@playwright/test';
import { expectNoSeriousAccessibilityViolations } from './support/accessibility';
import {
  EyesTheme,
  expectNoHorizontalPageOverflow,
  prepareDeterministicPage,
  settleVisualState,
} from './support/quality-gates';

const themes: EyesTheme[] = ['light', 'dark', 'high-contrast-light', 'high-contrast-dark'];
const routes = [
  '/solicitar-acesso',
  '/forgot-password',
  '/setup-password?token=e2e-invitation',
  '/reset-password?token=e2e-reset',
  '/setup-password',
  '/reset-password',
  '/acesso-negado',
  '/users',
  '/requests',
];

for (const route of routes) {
  for (const theme of themes) {
    test(`${route}: demais fluxos refluem em ${theme}`, async ({ page }) => {
      test.setTimeout(120_000);
      const administrative = route === '/users' || route === '/requests';
      await prepareDeterministicPage(page, { theme, authenticated: administrative });
      for (const width of [320, 390, 1440]) {
        for (const scale of [100, 200]) {
          await page.setViewportSize({ width, height: width === 320 ? 800 : 900 });
          await page.goto(route);
          await page.evaluate((value) => {
            document.documentElement.style.fontSize = `${value}%`;
          }, scale);
          await settleVisualState(page);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await expectNoHorizontalPageOverflow(page);
          await expectNoSeriousAccessibilityViolations(page);
          if (scale === 100) {
            const primary = administrative
              ? page.locator('.eyes-desktop-table, .eyes-compact-list').filter({ visible: true })
              : page
                  .locator('.form-actions button, .auth-link-button')
                  .filter({ visible: true })
                  .first();
            const bounds = await primary.boundingBox();
            expect(bounds).not.toBeNull();
            // Lists start immediately after the filter disclosure; forms expose their action.
            expect(bounds!.y).toBeLessThan(page.viewportSize()!.height);
            if (!administrative) {
              expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
            }
          }
          if (administrative) {
            const disclosure = page.getByRole('button', { name: /^Filtrar/ });
            await disclosure.focus();
            await page.keyboard.press('Enter');
            await expect(page.getByRole('search')).toBeVisible();
            await expectNoHorizontalPageOverflow(page);
            await expectNoSeriousAccessibilityViolations(page);
            await disclosure.focus();
            await page.keyboard.press('Enter');
            await expect(page.getByRole('search')).toBeHidden();
          }
        }
      }
    });
  }
}

for (const route of ['/users', '/requests']) {
  const endpoint = route === '/users' ? 'users' : 'access-requests';
  const subject = route === '/users' ? 'os usuários' : 'as solicitações';
  test(`${route}: falha mantém ação de tentar novamente`, async ({ page }) => {
    await prepareDeterministicPage(page, { authenticated: true });
    await page.setViewportSize({ width: 320, height: 800 });
    let fail = true;
    await page.route(`**/api/v1/${endpoint}?**`, async (r) => {
      if (fail) return r.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      return r.fallback();
    });
    await page.goto(route);
    await expect(
      page.getByRole('heading', { name: `Não foi possível carregar ${subject}` }),
    ).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page);
    fail = false;
    await page.getByRole('button', { name: 'Tentar novamente' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.eyes-compact-list')).toBeVisible();
  });

  test(`${route}: carregamento e busca vazia mantêm recuperação e filtros visíveis`, async ({
    page,
  }) => {
    await prepareDeterministicPage(page, { authenticated: true });
    await page.setViewportSize({ width: 390, height: 844 });
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**/api/v1/${endpoint}?**`, async (r) => {
      await ready;
      return r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        }),
      });
    });
    await page.goto(route);
    await expect(page.locator('eyes-skeleton')).toBeVisible();
    release();
    await expect(
      page.getByRole('heading', {
        name: route === '/users' ? 'Ainda não há usuários' : 'Ainda não há solicitações',
      }),
    ).toBeVisible();
    const disclosure = page.getByRole('button', { name: /^Filtrar/ });
    await disclosure.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('searchbox', { name: 'Buscar por nome ou e-mail' }).fill('Sem resultado');
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(
      page.getByRole('heading', { name: /^Nenhum (usuário|pedido) corresponde aos filtros$/ }),
    ).toBeVisible();
    await disclosure.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Filtros ativos')).toContainText('Sem resultado');
    await page.getByRole('button', { name: 'Remover todos' }).click();
    await expect(page.getByLabel('Filtros ativos')).toHaveCount(0);
    await expectNoSeriousAccessibilityViolations(page);
    await expectNoHorizontalPageOverflow(page);
  });
}

for (const [route, action, endpoint, success] of [
  ['/setup-password', 'Ativar conta', '/users/setup-password', 'Conta ativada'],
  ['/reset-password', 'Redefinir senha', '/auth/reset-password', 'Senha atualizada'],
] as const) {
  test(`${route}: controles de senha por teclado, rejeição do token e recuperação`, async ({
    page,
  }) => {
    await prepareDeterministicPage(page);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.route(`**/api/v1${endpoint}`, (r) =>
      r.fulfill({ status: 400, contentType: 'application/json', body: '{}' }),
    );
    await page.goto(`${route}?token=e2e-expired-token`);
    const password = page.getByLabel('Nova senha', { exact: true });
    await password.fill('SenhaTeste123!');
    await page.getByLabel(/^Confirmar (nova )?senha$/).fill('SenhaTeste123!');
    const visibility = page.getByRole('button', { name: 'Mostrar nova senha', exact: true });
    await visibility.focus();
    await page.keyboard.press('Enter');
    await expect(password).toHaveAttribute('type', 'text');
    await expect(page.getByRole('button', { name: 'Ocultar nova senha' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: action, exact: true }).click();
    await expect(page.getByRole('alert')).toContainText(/inválido, expirou ou já foi utilizado/);
    await expect(page.getByRole('heading', { name: success, exact: true })).toHaveCount(0);
    // Material moves snackbar content into its live region after opening.
    await expect(page.getByRole('button', { name: 'Fechar', exact: true })).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page);
    const recovery = page.getByRole('link', {
      name: route === '/reset-password' ? 'Solicitar novo link' : 'Voltar para o login',
    });
    await recovery.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(route === '/reset-password' ? /\/forgot-password$/ : /\/login$/);
  });

  test(`${route}: HTTP 204 conclui sem perder saída acessível`, async ({ page }) => {
    await prepareDeterministicPage(page);
    await page.goto(`${route}?token=e2e-valid-token`);
    await page.getByLabel('Nova senha', { exact: true }).fill('SenhaTeste123!');
    await page.getByLabel(/^Confirmar (nova )?senha$/).fill('SenhaTeste123!');
    await page.getByRole('button', { name: action, exact: true }).click();
    await expect(
      page.getByRole('status').filter({
        has: page.getByRole('heading', { name: success, exact: true }),
      }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ir para o login', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fechar', exact: true })).toBeVisible();
    await expectNoSeriousAccessibilityViolations(page);
  });
}
