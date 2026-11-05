# Orbit — identidade de produto

Direção aprovada pelo responsável em 04/11/2026 na REN-65. Implementação web na
REN-59, em paralelo à REN-60 Flutter. É uma evolução de apresentação sobre o
Angular Material existente; não muda contratos REST, autenticação, perfis ou regras.

## Temas e contraste

O contrato canônico `design-tokens.json`, versão 1.1.0, e `_tokens.scss` definem
as cores por função. Claro e escuro acompanham a preferência existente; os dois
temas de alto contraste continuam disponíveis. Fontes e ícones permanecem locais.
O azul claro foi ajustado da proposta para `#0052A8`, e o texto secundário para
`#44566E`, para manter os requisitos existentes de contraste, sem reduzir o gate.
`border` é exclusivamente a borda estrutural; campos e foco continuam usando
`outline`/`focus` com contraste próprio. Nenhuma cor de feature é literal.

## Componentes e responsabilidades

| Componente | Uso e responsabilidade |
| --- | --- |
| `BrandComponent` | Uma única marca no layout de autenticação e no shell administrativo. A navegação pertence ao link hospedeiro. |
| `OrbitEmblemComponent` | Assinatura gráfica estática e decorativa nos fluxos públicos. Oculta de tecnologia assistiva; não indica processamento ou disponibilidade. |
| `MetricLinkComponent` | Um template para os três indicadores, incluindo indisponibilidade e destino. Recebe valores da fachada; não consulta APIs nem inventa métricas. |
| `PageShellComponent` | Hierarquia e alinhamento de todas as páginas administrativas. |
| `SurfaceCardComponent` e `StateViewComponent` | Superfícies e estados comuns, com as mesmas ações de recuperação. |
| Layout e estilos de dados | Navegação, filtros, tabelas, cartões responsivos e diálogos mantêm as implementações existentes. |

Não foram introduzidos Tailwind, uma segunda biblioteca de componentes, imagens
remotas, animação de marca ou fontes de rede. O emblema e as bordas são CSS;
dados e decisões continuam nas fachadas e serviços originais.

## Verificação e manutenção

Executar com Node 22.23.2/npm 10.9.8: `npm run design-system:validate`,
`npm run build`, `npm run test:ci` e `npm run e2e`. A suíte existente cobre login,
ativação/reset, papéis, solicitações, usuários, decisões, filtros, paginação,
erros, teclado, quatro temas e zoom. Atualizações de screenshots são mudanças
revisáveis; gerar e inspecionar referências próprias de Windows e Linux, sem
copiar uma plataforma para a outra ou relaxar tolerâncias.

Capturas com fixtures são evidência da UI Angular, não de dados de produção ou
de integração real Java. A aprovação da direção não substitui a revisão visual
da implementação. O relatório conjunto de entrega registra comandos, versões,
capturas, resultados e pendências de validação humana.
