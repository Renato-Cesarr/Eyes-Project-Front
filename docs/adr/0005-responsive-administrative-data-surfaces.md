# ADR 0005 — Superfícies administrativas responsivas

- Status: aceito
- Data: 2026-09-26
- Card: REN-55

## Contexto

Usuários, solicitações de acesso e auditoria possuem grande densidade de informação e ações críticas. A tabela tradicional atende bem telas amplas, mas exige rolagem horizontal no celular, reduz a legibilidade em zoom de 200% e dificulta a execução segura de ações por toque.

## Decisão

Adotar uma composição responsiva comum para as três áreas:

- `MatTable` permanece como representação semântica principal em telas amplas;
- abaixo de 52 rem, os mesmos registros são apresentados como uma lista de cartões;
- ambas as representações preservam identidade, estado e todas as ações permitidas;
- a representação oculta usa `display: none`, evitando duplicidade na árvore de acessibilidade;
- estados, filtros e mensagens usam os componentes compartilhados do Eyes Design System;
- estados nunca dependem apenas de cor: todos possuem texto e o indicador visual compartilhado;
- filtros aplicados ficam visíveis, podem ser removidos e distinguem lista vazia de busca sem resultado;
- confirmações críticas nomeiam o alvo e explicam a consequência antes da execução;
- contratos HTTP, RBAC, paginação e registros de auditoria permanecem inalterados.

## Consequências

O painel fica utilizável em 320 px e com ampliação, sem sacrificar a eficiência da tabela no desktop. Cada página ainda mantém seu template específico porque dados e ações são diferentes, enquanto tokens e padrões estruturais vivem em `_administrative-data.scss` para evitar divergência visual.

O custo é manter duas representações de marcação para cada coleção. Testes unitários verificam a equivalência das informações e ações, e os testes E2E cobrem teclado, axe e ausência de rolagem horizontal.
