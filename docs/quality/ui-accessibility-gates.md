# Gates de UI e acessibilidade

Este documento define a proteção automatizada e a revisão humana das interfaces
do Eyes. Os snapshots são evidências de regressão, não substitutos para testes de
comportamento, auditoria WCAG ou avaliação com tecnologia assistiva.

## Matriz automatizada mínima

| Superfície | Viewport               | Temas                                 | Proteção                                  |
| ---------- | ---------------------- | ------------------------------------- | ----------------------------------------- |
| Login      | 320 × 800 e 1440 × 900 | claro                                 | axe, teclado, refluxo e snapshot compacto |
| Catálogo   | 1280 × 900             | claro, escuro e dois altos contrastes | axe e snapshots                           |
| Dashboard  | 1440 × 900             | claro                                 | snapshot, teclado e texto a 200%          |
| Usuários   | 320 × 800              | alto contraste escuro                 | snapshot responsivo                       |

O cenário de texto a 200% combina ampliação da raiz com viewport reduzido para
exercitar WCAG 1.4.4 e 1.4.10. Falhas sérias ou críticas do axe, overflow
horizontal, perda de foco ou diferença visual acima da tolerância bloqueiam o CI.

## Comandos

- `npm run e2e:quality`: executa matriz de acessibilidade e regressão visual.
- `npm run e2e:visual`: compara apenas as referências visuais.
- `npm run e2e:visual:update`: atualiza referências após uma mudança aprovada.
- `npm run design-system:validate`: valida contrato, contraste, fontes e proíbe
  cores SCSS fora de `_tokens.scss`.

Referências nunca devem ser atualizadas apenas para fazer a pipeline passar. O PR
deve explicar a alteração visual, incluir revisão das imagens e confirmar que os
testes de comportamento e acessibilidade continuam válidos.

## Checklist manual do PR

- [ ] Navegação completa somente por teclado, incluindo foco após diálogos.
- [ ] Zoom do navegador em 200% sem perda de conteúdo ou rolagem horizontal.
- [ ] Temas claro, escuro e alto contraste revisados.
- [ ] `prefers-reduced-motion` não remove informação ou bloqueia ações.
- [ ] Leitor de tela anuncia títulos, campos, erros e mudanças relevantes.
- [ ] Alterações nas referências visuais foram intencionais e revisadas.

## Relação com a pipeline

A pipeline instala o Chromium fixado pelo Playwright e executa todos os testes
E2E em ambiente limpo. A REN-40 pode ampliar a publicação de relatórios e
artefatos demonstráveis sem enfraquecer estes gates.
