# REN-65 — Proposta de composição web e mobile

**Versão 1 · 04/10/2026 · Em avaliação humana.**

Esta entrega apresenta login e resumo web, início e configurações mobile. É
um protótipo de composição compatível com os componentes existentes. Sua
aprovação orienta REN-59/60 e, depois, REN-66/67. Não altera os fluxos do
produto nem substitui a homologação Flutter/TalkBack em aparelho.

## Ver a proposta

Na raiz do repositório, execute:

```sh
node docs/design-system/review/ren-65/serve.mjs
```

Abra `http://127.0.0.1:4315`. O servidor usa somente Node e escuta no loopback.
A revisão permite
trocar tela, tema, largura, escala de texto e estado, além de comparar a
captura anterior. Use **Abrir tela isolada** para avaliar a interação. O frame
mantém o viewport escolhido; a apresentação pode ser reduzida para caber na
janela da revisão, com percentual informado no cabeçalho.

As quatro propostas principais estão em `captures/`:

| Tela            | Referência anterior                          | Proposta clara                           |
| --------------- | -------------------------------------------- | ---------------------------------------- |
| Login           | [Atual](references/web-login.png)            | [Proposta](captures/login-light.png)     |
| Resumo          | [Atual](references/web-dashboard.png)        | [Proposta](captures/dashboard-light.png) |
| Início mobile   | [Atual](references/mobile-inicio.png)        | [Proposta](captures/home-light.png)      |
| Áudio e alertas | [Atual](references/mobile-configuracoes.png) | [Proposta](captures/settings-light.png)  |

Também existem capturas das quatro telas nos temas escuro e alto contraste
claro/escuro. As capturas propostas são do HTML; as referências mobile são
goldens Windows do Flutter. Diferenças de renderização entre motores não são
tratadas como regressão de pixel nem como evidência física.

## Fontes e validade da comparação

- Base web: `15270355903ca9d072aad3b384a89d3756b2f0f5`, após Front #17.
- Base mobile: `a893cacfe289aefd29ea123a9730910ce2a0ace7`, após Mobile #16.
- Origem do diagnóstico: seções 7.1–7.9 do documento de 04/10/2026.
- Dados do resumo: fixture existente em `e2e/support/api-mocks.ts`, com uma
  solicitação pendente, um usuário ativo e um evento `USER_INVITED` em
  26/09/2026 às 15:30 BRT. Nome de conta administrativo também é sintético.
- Configurações: padrões atuais de `FeedbackPreferences`: voz 50%, volume
  100%, frases curtas, alertas próximos ativados, frequência equilibrada e
  vibração habilitada. Aparência clara é a condição desta comparação.

Login usa viewport 1440 × 900; as telas mobile, 390 × 844. O resumo anterior
foi capturado como página completa em viewport 1440 × 900 e seu PNG mede
1440 × 902. A proposta usa 1440 × 900. Os dois pixels adicionais da referência
não são cortados nem distorcidos para fingir igualdade de imagem.

Não há captura anterior equivalente em todos os temas, escalas e larguras.
O comparador informa quando a seleção diverge da referência. Não usar uma
captura clara/100% como prova visual de um tema ou escala diferente.

## Contrato de composição proposto

### Login web

No desktop, introdução curta e formulário têm alinhamento vertical comum.
O formulário ocupa 416 px e a composição tem largura máxima de 1104 px, com
respiro lateral. A introdução explica a tarefa, sem ilustração promocional.
No compacto, ela é removida; o título, os campos e a ação abrem a tela.

O tema permanece no cabeçalho. Recuperação fica próxima da senha; solicitação
de acesso vem depois da entrada, com separação discreta. Rótulos permanecem
visíveis, independentemente do placeholder. Mostrar/ocultar senha mantém
nome acessível e estado. Loading e erro possuem apresentações próprias.
Expiração de sessão e erros específicos da API precisam continuar tratados
pelo `AuthFacade` real ao aplicar esta composição.

### Resumo web

Uma linha de título e ação de atualizar substitui as introduções repetidas.
A barra superior mede 64 px e a navegação desktop, 224 px. Cada item de
navegação recebe nome direto; detalhes pertencem à página de destino.

Os três indicadores compartilham uma faixa, evitando três cartões em disputa.
Solicitações mantêm prioridade pela ordem e pela ação de analisar. Atividade
recente é apoio e informa somente os registros do resumo. Não há gráficos,
volume histórico inventado, métricas de IA ou promessa de atualização ao vivo.

Falhas parciais preservam informações disponíveis e exibem **Indisponível**,
sem converter ausência em zero. Vazio, erro e loading têm composições próprias.
Em largura estreita, indicadores e painéis se empilham; a navegação pode ser
aberta pelo botão nomeado. A implementação real deve conservar o manejo de
foco, sessão, autorização e retorno existentes no shell Angular.

### Início mobile

Uma identificação curta dá lugar à ação **Abrir câmera**, com alvo de 64 dp.
O título comunica a finalidade: reconhecer objetos. O botão ainda abre a tela
de varredura; não promete que inicia automaticamente a câmera ou que o modelo
já está pronto. Não foram adicionados indicadores falsos de disponibilidade.

A garantia offline é breve. O teste de som/vibração vem antes da navegação
secundária. Ajuda e conta opcional permanecem acessíveis. Detalhes de uso seguro
continuam no onboarding e em Ajuda; a página inicial não substitui esses fluxos.

### Áudio e alertas mobile

Ordem proposta: **Voz → Alertas → Vibração → Aparência → Privacidade**.
Velocidade, volume, detalhe e teste de voz ficam juntos. Vibração também mantém
seu próprio teste. Aparência conserva os quatro temas, após os ajustes
assistivos. Explicações são próximas do controle relevante.

Percentuais aparecem visualmente; o nome acessível dos sliders expressa
“por cento”. Alterar a apresentação não deve mudar preferências, persistência,
regras de prioridade, cadência, detector ou consentimento. A restauração real
continua exigindo o diálogo de confirmação existente. No protótipo, esse botão
somente anuncia que é uma demonstração.

## Grade, tipografia e componentes

| Intenção         | Contrato desta proposta                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Conteúdo desktop | Padding 32 px; blocos em uma linha de alinhamento; largura limitada                                  |
| Conteúdo mobile  | 24 dp laterais em 390; 20 dp em 320; página rolável                                                  |
| Separação        | Espaços de 8/12/16/20/24/32 px conforme grupo e densidade                                            |
| Campos           | Mínimo de 52 px; rótulo acima do valor                                                               |
| Ações            | Mínimo de 48 px; câmera 64 dp; ícones nomeados ou decorativos                                        |
| Cantos           | Família existente de 8/12/16 px; pill somente em controles apropriados                               |
| Tipografia       | Lexend em títulos/ações de destaque; Atkinson Hyperlegible em leitura/controles                      |
| Tamanhos         | Valores da escala canônica: 14/16/18/20/24/32/40; sem fonte menor para forçar texto ampliado a caber |
| Cores            | Quatro conjuntos semânticos copiados do `design-tokens.json` atual, sem nova paleta                  |
| Texto ampliado   | 100/150/200%; reflow e rolagem, sem cortar ou limitar a escala                                       |

O mapeamento mantém Angular Material 3 e Flutter Material 3:

| Composição | Implementação existente a reaproveitar                                                  |
| ---------- | --------------------------------------------------------------------------------------- |
| Login      | `app-auth-layout`, `app-form-card`, formulário/validação, `AuthFacade`                  |
| Resumo     | `main-layout`, `eyes-page-shell`, `eyes-surface-card`, `DashboardSummaryFacade`         |
| Início     | `EyesPageScaffold`, `EyesActionTile`, `EyesButton`, `HomeController`, rotas existentes  |
| Ajustes    | `FeedbackSettingsPage`, sliders/selects/switches nativos, controller/repositório atuais |
| Temas      | Tokens canônicos web e `AppTheme`/extensions Flutter                                    |

HTML/CSS desta pasta serve à avaliação. Não é uma biblioteca paralela a ser
copiada para produção. As implementações seguintes devem usar os componentes
acima e seus tokens. Os tamanhos em px representam a base de 16 px e as medidas
de layout em dp; a escala deste protótipo amplia a tipografia para simular
reflow, mantendo mínimos de toque.

## Verificação executada

O conjunto automatizado desta revisão verificou:

**Resultado: 20 testes aprovados.** Para reproduzir usando as dependências
Playwright/axe já presentes no frontend, após `npm ci` e a instalação do Chromium:

```sh
npx playwright test --config docs/design-system/review/ren-65/qa/playwright.config.ts
```

O comando inicia a prévia se necessário. Relatório e medidas vão para
`qa-results/`, ignorado pelo Git. Ele também regenera as imagens propostas em
`captures/`; revisar eventuais mudanças de fonte/motor antes de versioná-las.
`verification.json` reúne o recibo desta execução, medidas e hashes das capturas.

- 120 combinações padrão: quatro temas, texto 100/150/200%, web em
  320/390/1440 e mobile em 320/390.
- 24 combinações de recuperação em 320 px/200%, claro e alto contraste escuro:
  erro/loading, resumo vazio/parcial, voz indisponível e falha de persistência.
- Contraste e regras WCAG A/AA selecionadas via axe; reflow sem rolagem
  horizontal; controles visíveis dentro da largura.
- Navegação de revisão, exposição honesta de comparações incompatíveis,
  sliders, escolha de tema, mostrar senha e ausência de chamadas externas no
  fluxo demonstrado.

Foram corrigidos os cortes encontrados nos títulos/controles em texto ampliado.
Não houve atualização de golden ou snapshot do produto. Capturas são evidências
de proposta em `captures/`, separadas das referências aprovadas anteriormente.

### Posição comprovada das ações no protótipo

Texto 100%, tema claro; medições do limite de cada botão:

| Tela                 |   Largura |       Topo → fim | Altura |
| -------------------- | --------: | ---------------: | -----: |
| Login, Entrar        | 320 / 390 | 465,2 → 513,2 px |  48 px |
| Início, Abrir câmera | 320 / 390 | 212,2 → 276,2 px |  64 px |
| Ajustes, Testar voz  | 320 / 390 |     479 → 529 px |  50 px |

Na captura anterior mobile em 390 × 844, a câmera inicia aproximadamente em
y=349. A proposta a coloca em y=212. A análise anterior de login registrou
ação em y≈732–780 (390) e y≈796–844 (320). São comparação de composição, não
medidas de desempenho assistivo ou uma promessa de posição no Flutter final.

Os checks automatizados não certificam WCAG integral nem TalkBack. A aplicação
real deverá repetir testes de comportamento/Semantics, teclado, escala, temas,
persistência e ensaio físico após a implementação.

## Ativos e desempenho da prévia

Fontes e ícones são locais; nenhum CDN. Lexend e Atkinson usam os WOFF2 latinos
das dependências Fontsource 5.3.0 já existentes. Os 26 ícones pertencem à
distribuição Material Symbols 0.47.5. O subconjunto da revisão mede 29.328 bytes,
comparado ao arquivo completo de 5.399.668 bytes. Isso reduz o ativo desta
prévia; não demonstra otimização já aplicada ao bundle de produção.

Licenças estão em `assets/*-LICENSE.txt`; versões, aliases e SHA-256 em
`asset-manifest.json`. A geração empregou fontTools 4.66.1/Brotli 1.2.0 em
diretório temporário do workspace, sem alterar dependências do produto.

## Aprovação e continuidade

- [x] Quatro composições e imagens documentadas, com fontes e limites.
- [x] Hierarquia, alinhamento, grade e estados definidos.
- [x] Verificação de viewport, temas, texto ampliado e contraste automatizado.
- [ ] Aprovação humana da direção e ajustes solicitados.
- [ ] Aplicação Angular/Flutter em REN-59/60 e verificação dos fluxos reais.
- [ ] Expansão em REN-66/67; atualização de snapshots após aprovação visual.
- [ ] Homologação assistiva em aparelho conforme REN-32/41/42.

Registrar a decisão e eventuais ajustes no comentário da REN-65. As imagens
não autorizam encerrar os cards de implementação ou os ensaios físicos.
