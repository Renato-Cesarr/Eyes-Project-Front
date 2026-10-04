'use strict';
const params = new URLSearchParams(location.search);
const themes = {
  light: 'Claro',
  dark: 'Escuro',
  highContrastLight: 'Alto contraste claro',
  highContrastDark: 'Alto contraste escuro',
};
const screens = ['login', 'dashboard', 'home', 'settings'];
let screen = screens.includes(params.get('screen')) ? params.get('screen') : 'login';
const state = params.get('state') || 'default';
const theme = Object.hasOwn(themes, params.get('theme')) ? params.get('theme') : 'light';
const scale = [100, 150, 200].includes(Number(params.get('scale')))
  ? Number(params.get('scale'))
  : 100;
document.documentElement.dataset.theme = theme;
document.documentElement.style.fontSize = `${(16 * scale) / 100}px`;
const icon = (name) => `<span class="icon" aria-hidden="true">${reviewIcons[name]}</span>`;
const brand = (caption) =>
  `<div class="brand"><span class="brand-mark">${icon('visibility')}</span><span>Eyes${caption ? `<span class="brand-caption">${caption}</span>` : ''}</span></div>`;
const themeSelect = () =>
  `<label class="sr-only" for="app-theme">Tema da interface</label><select class="theme-select" id="app-theme">${Object.entries(
    themes,
  )
    .map(
      ([key, label]) =>
        `<option value="${key}" ${key === theme ? 'selected' : ''}>${label}</option>`,
    )
    .join('')}</select>`;
const banner = (title, message, tone = 'info') =>
  `<div class="status ${tone}" role="status">${icon(tone === 'error' ? 'error' : 'info')}<div><strong>${title}</strong><p>${message}</p></div></div>`;
const announce = (text) => {
  document.querySelector('#announcement').textContent = text;
};
const reviewNotice = () =>
  announce('Protótipo visual: esta ação não acessa serviços nem recursos do aparelho.');
function go(target) {
  const next = new URLSearchParams(location.search);
  next.set('screen', target);
  next.set('state', 'default');
  location.search = next.toString();
}

function login() {
  return `<header class="login-header">${brand('Painel administrativo')}${themeSelect()}</header><main id="content" class="login-main"><section class="login-intro" aria-label="Sobre o painel"><p class="eyebrow">Administração Eyes</p><h2>Acessos organizados.<br>Decisões claras.</h2><p>Analise solicitações, gerencie usuários e consulte o histórico de decisões.</p></section><section class="login-form" aria-labelledby="login-title"><h1 id="login-title">Entrar no painel</h1><p>Use sua conta administrativa.</p>${state === 'error' ? banner('Não foi possível entrar', 'Revise e-mail e senha e tente novamente.', 'error') : ''}<form id="login-form" novalidate><div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="seu@email.com" required></div><div class="field"><label for="password">Senha</label><div class="password-box"><input id="password" name="password" type="password" autocomplete="current-password" placeholder="Sua senha" minlength="6" required><button type="button" id="password-toggle" aria-label="Mostrar senha" aria-pressed="false">${icon('visibility')}</button></div></div><div class="form-help"><a href="#recuperar" data-review>Esqueceu a senha?</a></div><button class="button primary full" type="submit" ${state === 'loading' ? 'disabled aria-busy="true"' : ''}>${state === 'loading' ? 'Entrando…' : 'Entrar'}</button><div class="form-footer"><p>Precisa de uma conta?</p><a href="#solicitar" data-review>Solicitar acesso</a></div></form></section></main><footer class="login-footer">A assistência visual acontece no aplicativo mobile.</footer>`;
}

function dashboard() {
  const empty = state === 'empty',
    partial = state === 'partial',
    error = state === 'error',
    loading = state === 'loading';
  return `<div class="admin-shell"><aside class="sidebar" id="sidebar">${brand('Administração')}<div><p class="nav-label">Painel</p><nav aria-label="Navegação administrativa">${[
    ['dashboard', 'Resumo', 'dashboard'],
    ['assignment_ind', 'Solicitações', 'requests'],
    ['group', 'Usuários', 'users'],
    ['fact_check', 'Auditoria', 'audit'],
  ]
    .map(
      ([symbol, label, path]) =>
        `<a class="nav-link" href="#${path}" ${path === 'dashboard' ? 'aria-current="page"' : ''} data-review>${icon(symbol)}${label}</a>`,
    )
    .join(
      '',
    )}</nav></div><div class="sidebar-bottom"><p>Conta administrativa</p></div></aside><div><header class="admin-topbar"><button class="icon-button mobile-menu" id="menu-toggle" aria-label="Abrir navegação" aria-controls="sidebar" aria-expanded="false">${icon('menu')}</button><p>Administração</p><button class="account-button" data-review aria-label="Conta de Administradora Eyes"><span class="avatar" aria-hidden="true">A</span><span class="account-name"><strong>Administradora Eyes</strong><small>Administrador</small></span>${icon('expand_more')}</button></header><main id="content" class="admin-content"><div class="page-title"><div><h1>Resumo</h1><p>Acessos e decisões administrativas.</p></div><button class="button outlined" id="refresh" aria-label="Atualizar resumo">${icon('refresh')}<span class="refresh-label">Atualizar</span></button></div>${loading ? '<section class="loading-panel" role="status"><h2>Carregando resumo</h2><p>Aguarde enquanto os dados são consultados.</p></section>' : error ? `${banner('Resumo indisponível', 'Tente novamente para recuperar as informações.', 'error')}<button class="button outlined" id="retry">Tentar novamente</button>` : `${partial ? banner('Parte do resumo está indisponível', 'Os dados disponíveis continuam abaixo. Atualize para tentar novamente.', 'warning') : ''}<section class="metric-strip" aria-label="Indicadores administrativos"><a class="metric metric-priority" href="#requests" data-review><span class="metric-label">Solicitações pendentes</span><strong class="metric-value">${empty ? '0' : '1'}</strong><span class="metric-note">Aguardando análise</span></a><a class="metric" href="#users" data-review><span class="metric-label">Usuários ativos</span><strong class="metric-value">${empty ? '0' : '1'}</strong><span class="metric-note">Contas com acesso</span></a><a class="metric" href="#audit" data-review><span class="metric-label">Ações recentes</span><strong class="metric-value ${partial ? 'unavailable' : ''}">${partial ? 'Indisponível' : empty ? '0' : '1'}</strong><span class="metric-note">${partial ? 'Atualize para tentar novamente' : 'Registros deste resumo'}</span></a></section><div class="dashboard-grid"><section class="panel" aria-labelledby="pending-title"><div class="panel-heading"><h2 id="pending-title">Solicitações</h2>${icon('assignment_ind')}</div>${empty ? '<div class="inline-empty"><strong>Nenhuma solicitação pendente</strong><p>A fila de análise está em dia.</p></div>' : `<div class="pending-line"><span class="pending-symbol">${icon('pending_actions')}</span><div class="pending-copy"><strong>1 solicitação aguarda análise</strong><p>Revise o pedido antes de aprovar ou rejeitar.</p><a class="button primary" href="#requests" data-review>Analisar solicitações ${icon('arrow_forward')}</a></div></div>`}<div class="panel-links"><a href="#users" data-review>Gerenciar usuários</a><a href="#audit" data-review>Consultar auditoria</a></div></section><section class="panel" aria-labelledby="activity-title"><div class="panel-heading"><h2 id="activity-title">Atividade recente</h2>${icon('history')}</div>${partial ? '<div class="inline-empty"><strong>Atividade indisponível</strong><p>A auditoria completa pode ser consultada.</p></div>' : empty ? '<div class="inline-empty"><strong>Nenhuma atividade recente</strong><p>Novas ações aparecerão neste resumo.</p></div>' : `<ol class="activity"><li><span class="activity-symbol">${icon('person_add')}</span><div><strong>Usuário convidado</strong><time datetime="2026-09-26T18:30:00Z">26/09/2026, 15:30</time></div></li></ol>`}<a class="button text-button" href="#audit" data-review>Ver auditoria ${icon('arrow_forward')}</a></section></div>`}</main></div></div>`;
}

function home() {
  return `<div class="mobile-app"><header class="mobile-bar">${brand('')}<button class="icon-button" id="home-settings" aria-label="Abrir configurações">${icon('settings')}</button></header><main id="content" class="mobile-content">${state === 'error' ? `${banner('Não foi possível carregar o início', 'Tente novamente.', 'error')}<button class="button outlined" id="retry">Tentar novamente</button>` : state === 'loading' ? '<section class="loading-panel" role="status"><h1>Carregando início</h1></section>' : `<h1 class="home-title">Reconhecer objetos</h1><p class="home-description">Avisos por voz e vibração usando a câmera do aparelho.</p><button class="button primary full scan-button" id="open-camera" aria-describedby="scan-hint">${icon('center_focus_strong')}Abrir câmera</button><p id="scan-hint" class="sr-only">Abre a tela de varredura. A câmera será iniciada nessa tela.</p><p class="capability">${icon('offline_bolt')}Uso sem internet e sem conta</p><button class="test-row" id="test-feedback">${icon('vibration')}Testar som e vibração</button><nav class="support-nav" aria-label="Ajustes e suporte"><a href="#settings" id="home-audio">${icon('volume_up')}<span><strong>Áudio e alertas</strong></span>${icon('chevron_right')}</a><a href="#help" data-review>${icon('help')}<span><strong>Ajuda e segurança</strong></span>${icon('chevron_right')}</a><a href="#account" data-review>${icon('account_circle')}<span><strong>Conta e sincronização</strong><small>Conta opcional</small></span>${icon('chevron_right')}</a></nav><p class="home-note">As imagens são processadas no aparelho e não são salvas.</p>`}</main></div>`;
}

function settings() {
  return `<div class="mobile-app"><header class="mobile-bar"><button class="icon-button" id="back-home" aria-label="Voltar ao início">${icon('arrow_back')}</button><h1>Áudio e alertas</h1></header><main id="content" class="mobile-content settings-content">${state === 'loading' ? '<section class="loading-panel" role="status"><h2>Carregando configurações</h2></section>' : state === 'error' ? `${banner('Não foi possível carregar os ajustes', 'Tente novamente.', 'error')}<button class="button outlined" id="retry">Tentar novamente</button>` : `<p class="settings-intro">Ajustes salvos somente neste aparelho.</p><section class="settings-group" aria-labelledby="voice-title"><div class="settings-heading">${icon('record_voice_over')}<h2 id="voice-title">Voz</h2></div><div class="control"><div class="slider-label"><label for="rate">Velocidade da voz</label><output for="rate" id="rate-value">50%</output></div><input class="slider" id="rate" type="range" min="30" max="70" step="5" value="50" aria-valuetext="50 por cento"></div><div class="control"><div class="slider-label"><label for="volume">Volume da voz</label><output for="volume" id="volume-value">100%</output></div><input class="slider" id="volume" type="range" min="0" max="100" step="5" value="100" aria-valuetext="100 por cento"></div><div class="control select-control"><label for="detail">Nível de detalhe</label><select id="detail"><option>Frases curtas</option><option>Frases com orientação</option></select></div><button class="button outlined full" id="test-voice">${icon('volume_up')}Testar voz</button></section><section class="settings-group" aria-labelledby="alerts-title"><div class="settings-heading">${icon('notifications_active')}<h2 id="alerts-title">Alertas</h2></div><div class="control switch-row"><div class="switch-copy"><label for="attention">Avisar objetos próximos</label><p id="attention-help">Além dos objetos muito próximos.</p></div><label class="switch-label" for="attention"><input id="attention" type="checkbox" role="switch" checked aria-describedby="attention-help"></label></div><div class="control select-control"><label for="frequency">Frequência dos alertas</label><select id="frequency"><option>Conservador</option><option selected>Equilibrado</option><option>Menos alertas</option></select><p class="small" id="frequency-description">Equilibra a quantidade de avisos e a persistência do alerta.</p></div></section><section class="settings-group" aria-labelledby="haptics-title"><div class="settings-heading">${icon('vibration')}<h2 id="haptics-title">Vibração</h2></div><div class="control switch-row"><div class="switch-copy"><label for="haptics">Usar vibração</label><p id="haptics-help">Reforço ao áudio em alertas muito próximos.</p></div><label class="switch-label" for="haptics"><input id="haptics" type="checkbox" role="switch" checked aria-describedby="haptics-help"></label></div><button class="button outlined full" id="test-haptics">Testar vibração</button></section><section class="settings-group" aria-labelledby="appearance-title"><div class="settings-heading">${icon('contrast')}<h2 id="appearance-title">Aparência</h2></div><div class="select-control"><label for="app-theme">Tema do aplicativo</label>${themeSelect().replace('<label class="sr-only" for="app-theme">Tema da interface</label>', '')}</div></section><section class="settings-group" aria-labelledby="privacy-title"><h2 id="privacy-title">Privacidade</h2><p class="group-description">O reconhecimento é local. As imagens não são enviadas nem salvas.</p><button class="restore-button" id="restore">Restaurar ajustes padrão</button></section>${state === 'channelUnavailable' ? banner('Voz indisponível', 'Verifique o mecanismo de síntese do aparelho. A vibração não substitui a voz.', 'warning') : ''}${state === 'saveError' ? banner('Não foi possível salvar', 'A configuração anterior foi mantida. Tente novamente.', 'error') : ''}`}</main></div>`;
}

document.querySelector('#app').innerHTML = { login, dashboard, home, settings }[screen]();
document.querySelectorAll('[data-review]').forEach((el) =>
  el.addEventListener('click', (event) => {
    event.preventDefault();
    reviewNotice();
  }),
);
document.querySelector('#app-theme')?.addEventListener('change', (event) => {
  document.documentElement.dataset.theme = event.target.value;
  announce('Tema da proposta atualizado.');
});
document.querySelector('#password-toggle')?.addEventListener('click', (event) => {
  const input = document.querySelector('#password');
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  event.currentTarget.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
  event.currentTarget.setAttribute('aria-pressed', String(visible));
});
document.querySelector('#login-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (form.checkValidity()) {
    reviewNotice();
  } else {
    form.reportValidity();
  }
});
document.querySelector('#menu-toggle')?.addEventListener('click', (event) => {
  const sidebar = document.querySelector('#sidebar');
  const open = sidebar.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
  event.currentTarget.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
});
document.querySelector('#refresh')?.addEventListener('click', reviewNotice);
document.querySelector('#retry')?.addEventListener('click', () => go(screen));
document.querySelector('#home-settings')?.addEventListener('click', () => go('settings'));
document.querySelector('#home-audio')?.addEventListener('click', (event) => {
  event.preventDefault();
  go('settings');
});
document.querySelector('#back-home')?.addEventListener('click', () => go('home'));
for (const id of ['open-camera', 'test-feedback', 'test-voice', 'test-haptics', 'restore'])
  document.querySelector(`#${id}`)?.addEventListener('click', reviewNotice);
for (const id of ['rate', 'volume'])
  document.querySelector(`#${id}`)?.addEventListener('input', (event) => {
    document.querySelector(`#${id}-value`).textContent = `${event.target.value}%`;
    event.target.setAttribute('aria-valuetext', `${event.target.value} por cento`);
  });
document.querySelector('#frequency')?.addEventListener('change', (event) => {
  document.querySelector('#frequency-description').textContent = {
    Conservador: 'Avisa mais cedo e repete com maior frequência.',
    Equilibrado: 'Equilibra a quantidade de avisos e a persistência do alerta.',
    'Menos alertas': 'Exige mais persistência e aumenta o intervalo entre avisos.',
  }[event.target.value];
});
