import { expect, test } from '@playwright/test';
import { expectNoSeriousAccessibilityViolations } from './support/accessibility';
import { authenticateAsAdmin, mockApi } from './support/api-mocks';

test.beforeEach(async ({ page }) => mockApi(page));

test('solicita acesso com feedback acessível', async ({ page }) => {
  await page.goto('/solicitar-acesso');
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByLabel('Nome completo').fill('Ana Estudante');
  await page.getByLabel('E-mail').fill('ana@eyes.test');
  await page
    .getByLabel(/Motivo da solicitação/)
    .fill('Preciso do aplicativo para acompanhar as aulas.');
  await page.getByRole('button', { name: 'Enviar solicitação' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('status')).toContainText('Solicitação enviada com sucesso');
});

test('ativa a conta por teclado', async ({ page }) => {
  await page.goto('/setup-password?token=activation-token');
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByRole('textbox', { name: 'Nova senha', exact: true }).fill('SenhaSegura123!');
  await page.getByRole('textbox', { name: 'Confirmar senha', exact: true }).fill('SenhaSegura123!');
  await page.getByRole('button', { name: 'Ativar conta' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('status')).toContainText('Conta ativada');
});

test('faz login e preserva navegação acessível do painel', async ({ page }) => {
  await page.goto('/login');
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByLabel('E-mail').focus();
  await page.keyboard.type('admin@eyes.test');
  await page.getByRole('textbox', { name: 'Senha', exact: true }).focus();
  await page.keyboard.type('SenhaSegura123!');
  const submitButton = page.getByRole('button', { name: 'Entrar na conta' });
  await expect(submitButton).toBeEnabled();
  await submitButton.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo principal' })).toHaveAttribute(
    'href',
    '#main-content',
  );
  await expect(page.locator('#main-content')).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test('aplica os quatro temas no catálogo acessível sem rolagem horizontal', async ({ page }) => {
  await authenticateAsAdmin(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/design-system');

  await expect(page.getByRole('heading', { name: 'Eyes Design System', level: 1 })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  const theme = page.getByLabel('Tema da interface');
  for (const value of ['light', 'dark', 'high-contrast-light', 'high-contrast-dark']) {
    await theme.selectOption(value);
    await expect(page.locator('html')).toHaveAttribute('data-eyes-theme', value);
  }

  await page.getByRole('button', { name: 'Ação principal' }).focus();
  await expect(page.getByRole('button', { name: 'Ação principal' })).toBeFocused();
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(320);
});

test('aprova solicitação com confirmação explícita', async ({ page }) => {
  await authenticateAsAdmin(page);
  await page.goto('/requests');
  await expect(page.getByRole('heading', { name: 'Solicitações de acesso' })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByRole('button', { name: 'Aprovar solicitação de Ana Estudante' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Aprovar e convidar' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('#main-content .feedback.success')).toContainText('aprovada');
});

test('convida usuário e mantém a tabela responsiva', async ({ page }) => {
  await authenticateAsAdmin(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByRole('button', { name: 'Convidar usuário' }).click();
  await page.getByLabel('Nome completo').fill('Carla Estudante');
  await page.getByRole('dialog').getByRole('textbox', { name: 'E-mail' }).fill('carla@eyes.test');
  await page.getByRole('button', { name: 'Criar e enviar convite' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('#main-content .feedback.success')).toContainText(/convite/i);
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(320);
});
