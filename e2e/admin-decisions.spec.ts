import { expect, test } from '@playwright/test';
import { expectNoSeriousAccessibilityViolations } from './support/accessibility';
import { expectNoHorizontalPageOverflow, prepareDeterministicPage } from './support/quality-gates';

test('rejeição exige motivo, confirma por teclado e devolve foco ao solicitante', async ({
  page,
}) => {
  await prepareDeterministicPage(page, { authenticated: true });
  await page.setViewportSize({ width: 320, height: 800 });
  let decisions = 0;
  await page.route('**/api/v1/access-requests/request-1/reject', async (r) => {
    expect(r.request().postDataJSON()).toEqual({ reason: 'Informações insuficientes' });
    decisions++;
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/requests');
  const reject = page.getByRole('button', { name: 'Rejeitar solicitação de Ana Estudante' });
  await reject.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Confirmar rejeição' }).click();
  await expect(dialog.getByText('A justificativa é obrigatória.')).toBeVisible();
  expect(decisions).toBe(0);
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(reject).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByLabel('Justificativa').fill('Informações insuficientes');
  await expectNoSeriousAccessibilityViolations(page);
  await expectNoHorizontalPageOverflow(page);
  await dialog.getByRole('button', { name: 'Confirmar rejeição' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content eyes-feedback-banner')).toContainText('rejeitada');
  expect(decisions).toBe(1);
});

test('desativação cancelada não chama a API e confirmação mantém conta e histórico explícitos', async ({
  page,
}) => {
  await prepareDeterministicPage(page, { authenticated: true });
  await page.setViewportSize({ width: 390, height: 844 });
  let updates = 0;
  await page.route('**/api/v1/users/user-1/status', async (r) => {
    expect(r.request().method()).toBe('PATCH');
    expect(r.request().postDataJSON()).toEqual({ active: false });
    updates++;
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/users');
  const deactivate = page.getByRole('button', { name: 'Desativar conta de Bruno Estudante' });
  await deactivate.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('seus dados e histórico serão preservados');
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(deactivate).toBeFocused();
  expect(updates).toBe(0);
  await page.keyboard.press('Enter');
  await expectNoSeriousAccessibilityViolations(page);
  await dialog.getByRole('button', { name: 'Desativar conta', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content eyes-feedback-banner')).toContainText('desativada');
  expect(updates).toBe(1);
});

for (const route of ['/users', '/requests']) {
  test(`${route}: paginação conserva busca após fechar filtros`, async ({ page }) => {
    await prepareDeterministicPage(page, { authenticated: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    const endpoint = route === '/users' ? 'users' : 'access-requests';
    const requests: URL[] = [];
    await page.route(`**/api/v1/${endpoint}?**`, async (r) => {
      const url = new URL(r.request().url());
      requests.push(url);
      const user = {
        id: 'user-pages',
        name: 'Pessoa de Teste',
        email: 'pagina@eyes.test',
        role: 'STUDENT',
        active: true,
        invitationPending: false,
        createdAt: '2026-09-19T12:00:00Z',
        updatedAt: '2026-09-19T12:00:00Z',
      };
      const request = {
        id: 'request-pages',
        name: user.name,
        email: user.email,
        reason: null,
        status: 'PENDING',
        decisionReason: null,
        decidedByUserId: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        decidedAt: null,
      };
      return r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [route === '/users' ? user : request],
          page: Number(url.searchParams.get('page')),
          size: 20,
          totalElements: 40,
          totalPages: 2,
        }),
      });
    });
    await page.goto(route);
    await page.getByRole('button', { name: /^Filtrar/ }).click();
    await page.getByRole('searchbox', { name: 'Buscar por nome ou e-mail' }).fill('Pessoa');
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(page.getByLabel('Filtros ativos')).toContainText('Pessoa');
    await page.getByRole('button', { name: /^Filtrar/ }).click();
    await page.getByRole('button', { name: 'Próxima página' }).click();
    await expect.poll(() => requests.at(-1)?.searchParams.get('page')).toBe('1');
    expect(requests.at(-1)!.searchParams.get('search')).toBe('Pessoa');
    await expect(page.getByLabel('Filtros ativos')).toContainText('Pessoa');
  });
}
