import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

// Opt-in local QA. No route interception, fabricated session or external email.
const [envFile, reportFile] = process.argv.slice(2);
const report = {
  startedAt: new Date().toISOString(),
  success: false,
  transport: 'Chromium UI -> actual Spring API -> isolated PostgreSQL / Mailpit',
  mockedResponses: 0,
  physicalMobileExecuted: false,
  sensitiveValuesIncluded: false,
  steps: [],
  http: [],
};
let browser;
let reportTarget;
let activeStep = 'local-environment';
const verify = (condition, code) => {
  if (!condition) throw new Error(code);
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function step(name, work) {
  activeStep = name;
  await work();
  report.steps.push({ name, result: 'passed' });
  console.log(`PASS ${name}`);
}

try {
  verify(envFile && reportFile, 'arguments-required');
  verify(resolve(envFile) !== resolve(reportFile), 'report-must-not-overwrite-credentials');
  reportTarget = reportFile;
  const env = {};
  for (const line of (await readFile(envFile, 'utf8')).split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (match) {
      verify(!Object.hasOwn(env, match[1]), 'duplicate-environment-key');
      env[match[1]] = match[2];
    }
  }
  verify(
    env['QA_ENVIRONMENT'] === 'eyes-ren73-qa' &&
      env['DB_HOST'] === '127.0.0.1' &&
      env['DB_PORT'] === '15433' &&
      env['PORT'] === '8080' &&
      env['SMTP_PORT'] === '1026' &&
      env['MAILPIT_HTTP_PORT'] === '8026' &&
      env['FRONTEND_URL'] === 'http://127.0.0.1:4330' &&
      env['BOOTSTRAP_ADMIN_EMAIL'] === 'qa-admin@eyes.test',
    'isolated-local-configuration-required',
  );
  const web = env['FRONTEND_URL'];
  const api = 'http://127.0.0.1:8080/api/v1';
  const mail = 'http://127.0.0.1:8026';
  const run = randomUUID();
  const name = `QA Solicitante ${run.slice(0, 8)}`;
  const email = `qa-${run}@eyes.test`;
  const password = randomBytes(24).toString('hex');
  const newPassword = randomBytes(24).toString('hex');
  let adminToken;
  let studentToken;
  let studentId;
  let setupToken;
  let requestId;
  const call = async (path, { method = 'GET', body, token, headers = {} } = {}) => {
    const response = await fetch(`${api}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    return {
      status: response.status,
      headers: response.headers,
      body: await response.json().catch(() => null),
    };
  };
  const deliveredToken = async (recipient, kind, excluded = '') => {
    for (let attempt = 0; attempt < 40; attempt++) {
      const response = await fetch(`${mail}/api/v1/messages`, {
        signal: AbortSignal.timeout(5000),
      });
      const messages = (await response.json()).messages;
      for (const entry of messages) {
        if (!entry.To.some((to) => to.Address === recipient)) continue;
        const detail = await (await fetch(`${mail}/api/v1/message/${entry.ID}`)).json();
        const token = new RegExp(`${kind}\\?token=([A-Za-z0-9-]+)`).exec(
          `${detail.Text} ${detail.HTML}`,
        )?.[1];
        if (token && token !== excluded) return token;
      }
      await pause(250);
    }
    throw new Error('mail-delivery-not-confirmed');
  };
  browser = await chromium.launch();
  // No traces, videos or storageState files: these contain passwords/JWT/link tokens.
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const publicContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const admin = await adminContext.newPage();
  const user = await publicContext.newPage();
  for (const page of [admin, user]) {
    page.setDefaultTimeout(15000);
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (!url.pathname.startsWith('/api/')) return;
      report.http.push({
        method: response.request().method(),
        path: url.pathname.replace(/[a-f0-9]{8}-[a-f0-9-]{27,}/gi, ':id'),
        status: response.status(),
      });
    });
  }
  const login = async (page, loginEmail, loginPassword) => {
    await page.goto(`${web}/login`);
    await page.getByLabel('E-mail').fill(loginEmail);
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(loginPassword);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  };
  await step('public-request-and-neutral-idempotent-receipt', async () => {
    await user.goto(`${web}/solicitar-acesso`);
    await user.getByLabel('Nome completo').fill(name);
    await user.getByLabel('E-mail').fill(email);
    await user
      .getByLabel(/Motivo da solicitação/)
      .fill('Conta sintética para comprovar integração local.');
    await user.getByRole('button', { name: 'Enviar solicitação' }).click();
    await expect(user.getByRole('status')).toContainText('Solicitação recebida para análise');
    const replay = await call('/access-requests', {
      method: 'POST',
      body: { name, email, reason: 'QA' },
    });
    verify(
      replay.status === 202 && Object.keys(replay.body).join() === 'message',
      'public-receipt',
    );
  });
  await step('admin-ui-login-profile-and-dashboard', async () => {
    await login(admin, env['BOOTSTRAP_ADMIN_EMAIL'], env['BOOTSTRAP_ADMIN_PASSWORD']);
    await expect(admin).toHaveURL(`${web}/dashboard`);
    await expect(admin.getByRole('heading', { name: 'Resumo', level: 1 })).toBeVisible();
    adminToken = await admin.evaluate(() => sessionStorage.getItem('auth_token'));
    const profile = await call('/auth/me', { token: adminToken });
    verify(profile.status === 200 && profile.body.role === 'ADMIN', 'admin-profile');
  });
  await step('admin-approval-smtp-and-inactive-invitation', async () => {
    const pending = await call(`/access-requests?search=${encodeURIComponent(email)}`, {
      token: adminToken,
    });
    verify(pending.status === 200 && pending.body.content.length === 1, 'unique-pending-request');
    requestId = pending.body.content[0].id;
    await admin.goto(`${web}/requests`);
    await admin
      .getByRole('button', { name: `Aprovar solicitação de ${name}`, exact: true })
      .click();
    await admin.getByRole('dialog').getByRole('button', { name: 'Aprovar e convidar' }).click();
    await expect(admin.locator('#main-content eyes-feedback-banner')).toContainText('aprovada');
    setupToken = await deliveredToken(email, 'setup-password');
    const users = await call(`/users?search=${encodeURIComponent(email)}`, { token: adminToken });
    verify(users.status === 200 && users.body.content.length === 1, 'one-invited-user');
    const invited = users.body.content[0];
    studentId = invited.id;
    verify(
      !invited.active && invited.invitationPending && invited.role === 'STUDENT',
      'invitation-state',
    );
    const mailCount = async () =>
      (await (await fetch(`${mail}/api/v1/messages`)).json()).messages.filter((message) =>
        message.To.some((to) => to.Address === email),
      ).length;
    const beforeReplay = await mailCount();
    const again = await call(`/access-requests/${requestId}/approve`, {
      method: 'POST',
      token: adminToken,
    });
    verify(again.status === 200 && again.body.id === requestId, 'decision-replay-idempotent');
    verify((await mailCount()) === beforeReplay, 'decision-replay-no-extra-email');
  });
  await step('activation-ui-and-single-use-setup-token', async () => {
    await user.goto(`${web}/setup-password?token=${setupToken}`);
    await user.getByRole('textbox', { name: 'Nova senha', exact: true }).fill(password);
    await user.getByRole('textbox', { name: 'Confirmar senha', exact: true }).fill(password);
    await user.getByRole('button', { name: 'Ativar conta', exact: true }).click();
    await expect(user.getByRole('status')).toContainText('Conta ativada');
    const replay = await call('/users/setup-password', {
      method: 'POST',
      body: { token: setupToken, password },
    });
    verify(replay.status === 400, 'setup-token-single-use');
  });
  await step('student-authentication-admin-denial-and-profile', async () => {
    await login(user, email, password);
    await expect(user).toHaveURL(`${web}/acesso-negado`);
    studentToken = await user.evaluate(() => sessionStorage.getItem('auth_token'));
    const profile = await call('/auth/me', { token: studentToken });
    verify(profile.status === 200 && profile.body.role === 'STUDENT', 'student-profile');
    for (const path of ['/users', '/access-requests', '/audit']) {
      verify((await call(path, { token: studentToken })).status === 403, 'student-rbac');
    }
    await user.goto(`${web}/users`);
    await expect(user).toHaveURL(`${web}/acesso-negado`);
  });
  await step('forgot-password-neutral-ui-smtp-reset-and-single-use', async () => {
    await user.goto(`${web}/forgot-password`);
    await user.getByLabel('E-mail').fill(email);
    await user.getByRole('button', { name: 'Enviar instruções' }).click();
    await expect(user.getByRole('status')).toContainText('Se existir uma conta ativa');
    const resetToken = await deliveredToken(email, 'reset-password');
    await user.goto(`${web}/reset-password?token=${resetToken}`);
    await user.getByRole('textbox', { name: 'Nova senha', exact: true }).fill(newPassword);
    await user
      .getByRole('textbox', { name: 'Confirmar nova senha', exact: true })
      .fill(newPassword);
    await user.getByRole('button', { name: 'Redefinir senha' }).click();
    await expect(user.getByRole('status')).toContainText('Senha atualizada');
    verify(
      (
        await call('/auth/reset-password', {
          method: 'POST',
          body: { token: resetToken, password },
        })
      ).status === 400,
      'reset-token-single-use',
    );
    verify(
      (await call('/auth/login', { method: 'POST', body: { email, password } })).status === 401,
      'old-password-refused',
    );
    await login(user, email, password);
    await expect(user.getByRole('alert')).toContainText('Credenciais inválidas');
    const changed = await call('/auth/login', {
      method: 'POST',
      body: { email, password: newPassword },
    });
    verify(changed.status === 200, 'new-password-accepted');
    studentToken = changed.body.token;
    const missing = await call('/auth/forgot-password', {
      method: 'POST',
      body: { email: `missing-${run}@eyes.test` },
    });
    verify(missing.status === 200 && missing.body === null, 'unknown-email-neutral');
  });
  await step('user-details-deactivation-session-rejection-and-reactivation-ui', async () => {
    await admin.goto(`${web}/users`);
    await admin.getByRole('button', { name: `Ver detalhes de ${name}`, exact: true }).click();
    await expect(admin.getByRole('dialog')).toContainText('Estudante');
    await admin.getByRole('dialog').getByRole('button', { name: 'Fechar' }).click();
    await admin.getByRole('button', { name: `Desativar conta de ${name}`, exact: true }).click();
    await admin
      .getByRole('dialog')
      .getByRole('button', { name: 'Desativar conta', exact: true })
      .click();
    await expect(admin.locator('#main-content eyes-feedback-banner')).toContainText('desativada');
    verify(
      (await call('/auth/me', { token: studentToken })).status === 401,
      'inactive-session-refused',
    );
    const inactiveLogin = await call('/auth/login', {
      method: 'POST',
      body: { email, password: newPassword },
    });
    verify(
      inactiveLogin.status === 401 && inactiveLogin.body.code === 'INVALID_CREDENTIALS',
      'inactive-credentials-neutral',
    );
    await admin.getByRole('button', { name: `Ativar conta de ${name}`, exact: true }).click();
    await admin
      .getByRole('dialog')
      .getByRole('button', { name: 'Ativar conta', exact: true })
      .click();
    await expect(admin.locator('#main-content eyes-feedback-banner')).toContainText('ativada');
  });
  await step('last-admin-guard-ui-and-postgresql-backed-api', async () => {
    await admin
      .getByRole('button', { name: 'Desativar conta de Administrador QA', exact: true })
      .click();
    await admin
      .getByRole('dialog')
      .getByRole('button', { name: 'Desativar conta', exact: true })
      .click();
    await expect(admin.locator('#main-content eyes-feedback-banner')).toContainText(
      'último administrador',
    );
    const profile = await call('/auth/me', { token: adminToken });
    verify(profile.status === 200 && profile.body.role === 'ADMIN', 'last-admin-preserved');
  });
  await step('admin-invitation-resend-invalidates-old-link', async () => {
    const invitedName = `QA Convite ${run.slice(0, 8)}`;
    const invitedEmail = `invite-${run}@eyes.test`;
    await admin.getByRole('button', { name: 'Convidar usuário', exact: true }).click();
    const dialog = admin.getByRole('dialog');
    await dialog.getByLabel('Nome completo').fill(invitedName);
    await dialog.getByLabel('E-mail').fill(invitedEmail);
    await dialog.getByRole('button', { name: 'Criar e enviar convite' }).click();
    await expect(admin.locator('#main-content eyes-feedback-banner')).toContainText(
      'Convite enviado',
    );
    const old = await deliveredToken(invitedEmail, 'setup-password');
    await admin
      .getByRole('button', { name: `Reenviar convite para ${invitedName}`, exact: true })
      .click();
    await admin
      .getByRole('dialog')
      .getByRole('button', { name: 'Reenviar convite', exact: true })
      .click();
    await expect(admin.locator('#main-content eyes-feedback-banner')).toContainText('reenviado');
    const replacement = await deliveredToken(invitedEmail, 'setup-password', old);
    verify(
      (await call('/users/setup-password', { method: 'POST', body: { token: old, password } }))
        .status === 400,
      'old-invitation-refused',
    );
    verify(
      (
        await call('/users/setup-password', {
          method: 'POST',
          body: { token: replacement, password },
        })
      ).status === 200,
      'new-invitation-accepted',
    );
  });
  await step('rejection-ui-and-audit-persistence', async () => {
    const rejectedName = `QA Rejeitado ${run.slice(0, 8)}`;
    verify(
      (
        await call('/access-requests', {
          method: 'POST',
          body: { name: rejectedName, email: `reject-${run}@eyes.test`, reason: 'QA' },
        })
      ).status === 202,
      'rejection-fixture',
    );
    await admin.goto(`${web}/requests`);
    await admin
      .getByRole('button', { name: `Rejeitar solicitação de ${rejectedName}`, exact: true })
      .click();
    await admin
      .getByLabel('Justificativa')
      .fill('Solicitação sintética sem necessidade de acesso.');
    await admin.getByRole('dialog').getByRole('button', { name: 'Confirmar rejeição' }).click();
    await expect(admin.locator('#main-content eyes-feedback-banner')).toContainText('rejeitada');
    const events = await call('/audit?size=100', { token: adminToken });
    verify(events.status === 200, 'audit-http');
    for (const action of [
      'ACCESS_REQUEST_APPROVED',
      'ACCESS_REQUEST_REJECTED',
      'USER_INVITED',
      'INVITATION_RESENT',
      'USER_ACTIVATED',
      'USER_DEACTIVATED',
    ]) {
      verify(
        events.body.content.some((item) => item.action === action && item.result === 'SUCCESS'),
        'audit-action-persisted',
      );
    }
    verify(
      events.body.content.some(
        (item) => item.action === 'USER_DEACTIVATED' && item.result === 'FAILURE',
      ),
      'audit-guard-failure-persisted',
    );
    await admin.goto(`${web}/audit`);
    await expect(admin.getByRole('heading', { name: 'Auditoria', level: 1 })).toBeVisible();
    await expect(admin.locator('#main-content')).toContainText('Solicitação aprovada');
  });
  await step('cors-errors-and-unauthenticated-endpoints', async () => {
    const allowed = await call('/auth/login', {
      method: 'OPTIONS',
      headers: {
        Origin: web,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    verify(
      allowed.status === 200 && allowed.headers.get('access-control-allow-origin') === web,
      'cors-allowed',
    );
    const denied = await call('/auth/login', {
      method: 'OPTIONS',
      headers: { Origin: 'https://untrusted.example', 'Access-Control-Request-Method': 'POST' },
    });
    verify(
      denied.status === 403 && !denied.headers.has('access-control-allow-origin'),
      'cors-denied',
    );
    verify((await call('/users')).status === 401, 'missing-session');
    const invalid = await call('/access-requests', {
      method: 'POST',
      body: { name: '', email: 'invalid', reason: '' },
    });
    verify(invalid.status === 422 && invalid.body.status === 422, 'validation-problem-detail');
  });
  await step('invalid-stored-session-ui-clears-token-and-redirects', async () => {
    // Deliberately invalid credential is a negative input, never an authenticated fixture.
    await admin.evaluate(() => sessionStorage.setItem('auth_token', 'invalid.qa.credential'));
    await admin.goto(`${web}/dashboard`);
    await expect(admin).toHaveURL(/\/login(?:\?|$)/);
    verify(
      (await admin.evaluate(() => sessionStorage.getItem('auth_token'))) === null,
      'invalid-token-cleared',
    );
  });
  report.success = true;
  report.syntheticAccountsActivated = 2;
  report.syntheticAccessRequests = 2;
  report.cleanup = 'Isolated QA data retained; no reset or deletion of prior environments.';
} catch (error) {
  // Raw browser/assertion exceptions may include password fields or tokenized URLs.
  const code = /^[a-z][a-z0-9-]*$/.test(error?.message ?? '') ? error.message : 'automation-check';
  report.steps.push({ name: activeStep, result: 'failed', code });
  console.error(`FAIL ${activeStep}: ${code}; sensitive diagnostics omitted.`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  report.completedAt = new Date().toISOString();
  if (reportTarget) await writeFile(reportTarget, `${JSON.stringify(report, null, 2)}\n`);
}
