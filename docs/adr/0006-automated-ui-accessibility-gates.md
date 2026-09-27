# ADR 0006 — Gates automatizados de UI e acessibilidade

## Status

Aceito.

## Decisão

Usar Playwright como único runner E2E para comportamento, axe e regressão
visual. Capturas cobrem somente estados determinísticos com API simulada, fontes
locais, movimento reduzido e animações neutralizadas. O validador do Design
System impede cores SCSS fora dos tokens canônicos.

## Consequências

O CI bloqueia regressões críticas de contraste, foco, refluxo e aparência. Uma
mudança visual legítima exige atualização explícita e revisão das imagens. Testes
manuais com teclado e leitor de tela continuam obrigatórios antes da homologação.
