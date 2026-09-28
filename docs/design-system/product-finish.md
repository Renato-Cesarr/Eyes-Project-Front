# Acabamento de produto do painel (REN-59)

Esta revisão responde ao diagnóstico visual das telas de login, resumo e
auditoria. O sistema de tokens e os fluxos funcionais já existiam; o problema
era a composição: decoração genérica, cartões demais e pouco destaque para a
decisão administrativa. A referência `ui-ux-pro-max-skill` foi usada como guia
de hierarquia, responsividade e inspeção visual, não como biblioteca de
componentes nem dependência de runtime.

## Contrato de composição

- **Login:** linguagem editorial curta à esquerda, formulário claro à direita.
  O texto descreve o trabalho do painel, sem competir com o botão de acesso.
  Não há círculos decorativos ou promessas técnicas sem relação com a ação.
- **Resumo:** solicitações pendentes recebem a primeira ênfase; pessoas e
  auditoria permanecem indicadores secundários. A área “Para resolver” mostra
  uma ação concreta quando há pendências e um estado honesto quando não há.
- **Auditoria:** o histórico aparece imediatamente. Os filtros detalhados
  ficam em divulgação progressiva nativa (`details/summary`), com os filtros
  aplicados apresentados fora do painel recolhido.

As mudanças não alteram contratos de API, autorização, contagem, estados de
erro ou mecanismos de busca. Não foram adicionados dados fictícios.

## Evidências e manutenção

As capturas versionadas em `e2e/snapshots/visual-regression.spec.ts/win32/`
cobrem login compacto e desktop, resumo e auditoria. O conjunto Playwright
também verifica teclado, contraste automatizado, reflow a 200% e ausência de
rolagem horizontal na auditoria mobile com filtros abertos. Revise a imagem
real antes de aprovar qualquer atualização de snapshot; não basta executar
`--update-snapshots`.
