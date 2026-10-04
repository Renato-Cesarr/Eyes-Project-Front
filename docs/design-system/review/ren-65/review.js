'use strict';
function fitPreview() {
  const frame = document.getElementById('preview');
  const viewport = document.getElementById('proposal-scroll');
  const available = viewport.clientWidth - 32;
  const ratio = Math.min(1, Math.max(0.1, available / Number(frame.width)));
  frame.style.transform = `scale(${ratio})`;
  frame.parentElement.style.width = `${Number(frame.width) * ratio}px`;
  frame.parentElement.style.height = `${Number(frame.height) * ratio}px`;
  document.getElementById('preview-size').textContent =
    `· ${frame.width} × ${frame.height} · prévia ${Math.round(ratio * 100)}%`;
}
const controls = Object.fromEntries(
  ['screen', 'theme', 'viewport', 'scale', 'state', 'compare'].map((id) => [
    id,
    document.getElementById(id),
  ]),
);
const choices = {
  login: ['default', 'error', 'loading'],
  dashboard: ['default', 'empty', 'partial', 'error', 'loading'],
  home: ['default', 'error', 'loading'],
  settings: ['default', 'error', 'loading', 'channelUnavailable', 'saveError'],
};
const labels = {
  default: 'Padrão',
  error: 'Erro',
  loading: 'Carregando',
  empty: 'Vazio',
  partial: 'Falha parcial',
  channelUnavailable: 'Voz indisponível',
  saveError: 'Falha ao salvar',
};
const references = {
  login: ['web-login.png', 1440, 900],
  dashboard: ['web-dashboard.png', 1440, 902],
  home: ['mobile-inicio.png', 390, 844],
  settings: ['mobile-configuracoes.png', 390, 844],
};
const decisions = {
  login: [
    'Formulário prioritário no compacto, sem introdução antes dos campos.',
    'Introdução curta no desktop, com duas colunas alinhadas pelo centro.',
    'Recuperação e solicitação de acesso continuam visíveis; tema tem presença discreta.',
  ],
  dashboard: [
    'Título único, barra superior de 64 px e navegação de 224 px.',
    'Indicadores em faixa única; análise de solicitações continua sendo a ação prioritária.',
    'Mesmos dados sintéticos: 1 pendência, 1 usuário ativo e 1 evento. Auditoria representa somente os registros do resumo.',
  ],
  home: [
    'Identificação curta, ação da câmera em 64 dp e teste de feedback logo abaixo.',
    'Sem bloco azul de apresentação; informação offline em uma linha de apoio.',
    'Conta opcional e ajuda permanecem acessíveis, sem afirmar prontidão da câmera ou do modelo.',
  ],
  settings: [
    'Voz abre a página; velocidade, volume e teste ficam no mesmo grupo.',
    'Alertas e vibração aparecem antes da aparência, com valores e rótulos visíveis.',
    'Rolagem preservada em texto ampliado, sem reduzir o tamanho dos alvos para caber.',
  ],
};
function updateStates() {
  const previous = controls.state.value;
  controls.state.innerHTML = choices[controls.screen.value]
    .map((key) => `<option value="${key}">${labels[key]}</option>`)
    .join('');
  if (choices[controls.screen.value].includes(previous)) controls.state.value = previous;
}
function update() {
  const name = controls.screen.value;
  const width = Number(controls.viewport.value);
  const height = width === 320 ? 800 : width === 390 ? 844 : 900;
  const query = new URLSearchParams({
    screen: name,
    theme: controls.theme.value,
    scale: controls.scale.value,
    state: controls.state.value,
  });
  const frame = document.getElementById('preview');
  frame.width = width;
  frame.height = height;
  frame.src = `screen.html?${query}`;
  document.getElementById('open-screen').href = frame.src;
  const ref = references[name];
  const compatible =
    width === ref[1] &&
    controls.theme.value === 'light' &&
    controls.scale.value === '100' &&
    controls.state.value === 'default';
  const before = document.getElementById('before');
  before.src = `references/${ref[0]}`;
  before.width = ref[1];
  before.height = ref[2];
  document.getElementById('reference-note').textContent = compatible
    ? 'Mesmo viewport, tema e estado da captura original.'
    : 'A captura original existe somente em ' +
      ref[1] +
      ' × ' +
      ref[2] +
      ', claro/100%/padrão. Não é uma comparação equivalente para a seleção atual.';
  document.getElementById('before-panel').hidden = !controls.compare.checked;
  document.querySelector('.comparison').classList.toggle('comparing', controls.compare.checked);
  document.getElementById('decisions').innerHTML = decisions[name]
    .map((text) => `<li>${text}</li>`)
    .join('');
  requestAnimationFrame(fitPreview);
  history.replaceState(
    null,
    '',
    `?${query}&viewport=${width}${controls.compare.checked ? '&compare=1' : ''}`,
  );
}
const initial = new URLSearchParams(location.search);
for (const id of ['screen', 'theme', 'viewport', 'scale'])
  if ([...controls[id].options].some((item) => item.value === initial.get(id)))
    controls[id].value = initial.get(id);
updateStates();
if (choices[controls.screen.value].includes(initial.get('state')))
  controls.state.value = initial.get('state');
controls.compare.checked = initial.get('compare') === '1';
controls.screen.addEventListener('change', () => {
  controls.viewport.value = ['home', 'settings'].includes(controls.screen.value) ? '390' : '1440';
  updateStates();
  update();
});
for (const id of ['theme', 'viewport', 'scale', 'state', 'compare'])
  controls[id].addEventListener('change', update);
update();
window.addEventListener('resize', fitPreview);
