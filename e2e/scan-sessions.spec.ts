import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { expectNoHorizontalPageOverflow, prepareDeterministicPage } from './support/quality-gates';

function mockHistory(page: Page, records: Array<Record<string, unknown>> = []) {
  return page.route('**/api/v1/scan-history', async (route) => {
    expect(route.request().headers().authorization).toBe('Bearer e2e-session-token');
    if (route.request().method() === 'POST') {
      const record = route.request().postDataJSON();
      records.unshift(record);
      return route.fulfill({ json: record });
    }
    return route.fulfill({
      json: [
        ...records,
        {
          id: 'doc-1',
          date: '2026-11-23',
          camera: 'USB',
          duration: '33 min 45 s',
          frames: 18834,
          alerts: 5,
          source: 'Diagnóstico local',
          summary: 'Relatório USB',
        },
        {
          id: 'doc-2',
          date: '2026-11-05',
          camera: 'USB',
          duration: 'Cerca de 20 min',
          frames: null,
          alerts: null,
          source: 'Observação em sala',
          summary: '',
        },
      ],
    });
  });
}

test('o lançamento salvo pela API aparece em outro navegador', async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareDeterministicPage(page, { authenticated: true });
  const records: Array<Record<string, unknown>> = [];
  await mockHistory(page, records);
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
  await page.getByLabel('Tipo de registro').selectOption('Simulação');
  await page.getByLabel('Observações').fill('Registro técnico do teste automatizado');
  await page.getByRole('button', { name: 'Salvar sessão' }).click();
  await expect(page.getByText('Sessão salva no histórico compartilhado.')).toBeAttached();

  const other = await browser.newPage();
  try {
    await prepareDeterministicPage(other, { authenticated: true });
    await mockHistory(other, records);
    await other.goto('/sessions');
    const saved = other.getByRole('row', { name: /Registro técnico do teste automatizado/ });
    await expect(saved).toContainText('Simulação');
    await expect(saved).toContainText('1.234');
    await expect(other.getByRole('row')).toHaveCount(4);
  } finally {
    await other.close();
  }
});

test('totais usam a API e distinguem ausência de sessões de indisponibilidade', async ({
  page,
}) => {
  await prepareDeterministicPage(page, { authenticated: true });
  await mockHistory(page);
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
