import { expect, test } from '@playwright/test';
import { expectNoHorizontalPageOverflow, prepareDeterministicPage } from './support/quality-gates';

test('sessões exibem o acervo e guardam o lançamento manual após recarregar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareDeterministicPage(page, { authenticated: true });
  await page.goto('/sessions');
  await expect(page.getByRole('heading', { name: 'Sessões de varredura' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Diagnóstico local' })).toContainText(
    '18.834',
  );
  await expect(page.getByRole('row').filter({ hasText: 'Observação em sala' })).toContainText(
    'Cerca de 20 min',
  );
  await expectNoHorizontalPageOverflow(page);

  await page.getByRole('button', { name: 'Registrar sessão' }).click();
  await expect(page.getByRole('button', { name: 'Salvar sessão' })).toBeDisabled();
  await page.getByLabel('Data do ensaio').fill('2026-11-27');
  await page.getByLabel('Câmera').selectOption('USB');
  await page.getByLabel('Quadros processados').fill('1234');
  await page.getByLabel('Observações').fill('Registro técnico do teste automatizado');
  await page.getByRole('button', { name: 'Salvar sessão' }).click();
  await expect(page.getByRole('status')).toHaveText('Sessão salva neste navegador.');

  await page.reload();
  const saved = page.getByRole('row', { name: /Registro técnico do teste automatizado/ });
  await expect(saved).toContainText('Registro manual');
  await expect(saved).toContainText('1.234');
  await expect(page.getByRole('row')).toHaveCount(6);
});

test('totais usam a API e distinguem ausência de sessões de indisponibilidade', async ({
  page,
}) => {
  await prepareDeterministicPage(page, { authenticated: true });
  const empty = { sessions: 0, completedSessions: 0, processedFrames: 0, announcedEvents: 0 };
  const populated = {
    sessions: 3,
    completedSessions: 2,
    processedFrames: 3456,
    announcedEvents: 7,
  };
  let response = 0;
  await page.route('**/api/v1/scan-sessions/aggregate', (route) => {
    expect(route.request().headers().authorization).toBe('Bearer e2e-session-token');
    response += 1;
    if (response === 3) return route.fulfill({ status: 503, json: {} });
    return route.fulfill({ json: response === 1 ? empty : populated });
  });
  await page.goto('/sessions');
  await expect(page.getByText('Nenhuma sessão sincronizada neste período.')).toBeVisible();
  await expect(page.locator('.totals-grid dd')).toHaveText(['0', '0', '0']);

  await page.getByRole('button', { name: 'Atualizar totais' }).click();
  await expect(page.locator('.totals-grid dd')).toHaveText(['2', '3.456', '7']);

  await page.getByRole('button', { name: 'Atualizar totais' }).click();
  await expect(page.getByText(/Não foi possível consultar os totais agora/)).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Diagnóstico local' })).toBeVisible();
});
