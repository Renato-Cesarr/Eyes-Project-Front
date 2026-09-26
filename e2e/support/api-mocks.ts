import { Page, Route } from '@playwright/test';

const admin = {
  id: 'admin-1',
  name: 'Administradora Eyes',
  email: 'admin@eyes.test',
  role: 'ADMIN',
};

const pendingRequest = {
  id: 'request-1',
  name: 'Ana Estudante',
  email: 'ana@eyes.test',
  reason: 'Preciso do aplicativo para acompanhar as aulas.',
  status: 'PENDING',
  decisionReason: null,
  decidedByUserId: null,
  createdAt: '2026-09-20T12:00:00Z',
  updatedAt: '2026-09-20T12:00:00Z',
  decidedAt: null,
};

const managedUser = {
  id: 'user-1',
  name: 'Bruno Estudante',
  email: 'bruno@eyes.test',
  role: 'STUDENT',
  active: true,
  invitationPending: false,
  createdAt: '2026-09-19T12:00:00Z',
  updatedAt: '2026-09-19T12:00:00Z',
};

export async function mockApi(page: Page): Promise<void> {
  await page.route('http://localhost:8080/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();

    if (path.endsWith('/v1/auth/login') && method === 'POST') {
      return json(route, { token: 'e2e-session-token', user: admin });
    }
    if (path.endsWith('/v1/auth/me') && method === 'GET') {
      return json(route, admin);
    }
    if (path.endsWith('/v1/auth/forgot-password') && method === 'POST') {
      return route.fulfill({ status: 204 });
    }
    if (path.endsWith('/v1/auth/reset-password') && method === 'POST') {
      return route.fulfill({ status: 204 });
    }
    if (path.endsWith('/v1/users/setup-password') && method === 'POST') {
      return route.fulfill({ status: 204 });
    }
    if (path.endsWith('/v1/access-requests') && method === 'POST') {
      return json(route, { message: 'Solicitação enviada com sucesso.' }, 201);
    }
    if (path.includes('/v1/access-requests/') && path.endsWith('/approve') && method === 'POST') {
      return json(route, { ...pendingRequest, status: 'APPROVED' });
    }
    if (path.endsWith('/v1/access-requests') && method === 'GET') {
      return json(route, pageResult([pendingRequest]));
    }
    if (path.endsWith('/v1/users') && method === 'POST') {
      return json(
        route,
        { ...managedUser, id: 'invited-user', active: false, invitationPending: true },
        201,
      );
    }
    if (path.endsWith('/v1/users') && method === 'GET') {
      return json(route, pageResult([managedUser]));
    }
    if (path.endsWith('/v1/audit') && method === 'GET') {
      return json(route, pageResult([]));
    }

    return json(route, { message: `Rota E2E não simulada: ${method} ${path}` }, 501);
  });
}

export async function authenticateAsAdmin(page: Page): Promise<void> {
  await page.addInitScript(() => sessionStorage.setItem('auth_token', 'e2e-session-token'));
}

function pageResult(content: ReadonlyArray<unknown>) {
  return {
    content,
    page: 0,
    size: 20,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
  };
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}
