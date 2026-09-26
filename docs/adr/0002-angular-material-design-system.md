# ADR 0002 — Implementação do Design System no Angular

- **Status:** Aceito
- **Data:** 2026-09-26
- **Issue:** REN-52

## Contexto

O contrato cross-platform da REN-50 exige quatro temas, tokens semânticos,
tipografia offline e componentes acessíveis. O painel já utiliza Angular
Material, mas também contém estilos locais e uma dependência de fontes remotas.

## Decisão

Implementar o contrato por CSS Custom Properties aplicadas ao elemento raiz e
mapear os tokens semânticos para as variáveis de sistema do Material 3. A
preferência é gerenciada por um serviço Angular, enquanto um script mínimo no
`head` restaura o tema antes do bootstrap. Fontes WOFF2 são empacotadas por
pacotes Fontsource com versão fixada.

As primitivas compartilhadas permanecem standalone e sem dependência de domínio.
O catálogo interno é uma rota protegida e serve como ambiente de revisão manual,
não como página de produção destinada à operação diária.

## Consequências

- temas e componentes Material respondem ao mesmo contrato sem framework visual paralelo;
- a aplicação deixa de depender de CDN para fontes;
- alto contraste usa tokens próprios e não um filtro visual;
- mudanças no JSON canônico são confrontadas com a implementação pelo validador;
- a migração das telas pode ocorrer incrementalmente nos cards REN-53, REN-54 e REN-55.
