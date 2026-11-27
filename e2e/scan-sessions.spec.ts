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
