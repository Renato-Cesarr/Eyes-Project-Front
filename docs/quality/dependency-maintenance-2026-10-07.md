# REN-48 — Alertas transitivos e LCOV nativo

Revisão de **07/10/2026**, incremento sobre dev integrada `9a907d2adcf84e91e6a0383de03b41490bc54351`. [Card e critérios de aceite](https://linear.app/renatocesar/issue/REN-48/devops-tratar-novos-alertas-transitivos-do-toolchain-frontend). A manutenção anterior de [05/10](dependency-maintenance.md) permanece como evidência histórica; suas contagens não representam a consulta atual.

## Problema e resultado

Após integrar os MRs anteriores, uma instalação limpa apresentou nove entradas vulneráveis de desenvolvimento: quatro altas e cinco moderadas. Havia novos avisos em MCP SDK e sprintf-js, propagados pela CLI e cadeia de conversão de cobertura, além do residual do scanner. Produção já estava sem alertas.

A CLI foi atualizada de 21.2.25 para **21.2.26**, que fixa MCP SDK **1.31.0**. O conversor nyc18.0.0 foi retirado: o builder unit-test já instalado gera LCOV nativamente com a mesma instrumentação. Isso elimina a cadeia legada de nyc/sprintf-js, sem downgrade sugerido pelo npm, force, override ou atualização major.

| Auditoria da instalação limpa | Antes | Depois | Exit |
| --- | --- | --- | --- |
| Completa | 9 entradas: 4 altas, 5 moderadas | 2 altas: node-forge e @sonar/scan | 1 → 1 |
| Produção, omit=dev | 0 | 0 | 0 → 0 |

São entradas de pacotes com propagação entre consumidores, não nove vulnerabilidades independentes. Os dois resíduos atuais correspondem a um advisory. [JSONs antes/depois](dependency-audit-2026-10-07/). Sonar aprovado não elimina o risco residual.

## Escopo e revisão do lock

- Dependências diretas de produção, Angular framework/build/compiler 21.2.25 e scanner5.0.1 preservados. Apenas CLI (patch) e retirada de nyc mudam diretamente. CLI e builder podem ter patches distintos; npm ls --all passou sem peers inválidos.
- Cinco versões de entradas existentes mudam: CLI, schematics Angular/devkit, SDK e express-rate-limit (8.7.0→8.7.1). Quatro entradas novas são cópias aninhadas de devkit/core e architect para CLI/schematics; 77 entradas sem consumidores foram removidas. Nenhuma versão existente troca major. [Revisão detalhada](dependency-audit-2026-10-07/lock-review.json).
- Todos os resolved URLs do lock continuam no registry oficial. Instalação e lock gerados com Node22.23.2/npm10.9.8; ambientes globais não foram alterados.
- Sem alteração de código da aplicação, UI, fontes, ícones, tolerância visual, baselines, contratos, critérios Sonar ou gates do Design System. Actions já integradas da REN-49 permanecem fixadas pelos mesmos SHAs.

## Cobertura e integração com Sonar

O angular.json declara text, text-summary, html, json e lcovonly. A opção file=../lcov.info do reporter escreve **coverage/lcov.info**, mantendo o caminho do sonar-project.properties. HTML e JSON permanecem em coverage/eyes-project-front. O clover.xml padrão antigo, sem consumidor identificado neste projeto, deixa de ser emitido nessa lista explícita; o JSON e o LCOV anteriores desta comparação permanecem arquivados no recibo local.

O workflow substitui a conversão por nyc por validação obrigatória de arquivo LCOV não vazio e registro SF TypeScript. Não há echo que permita prosseguir silenciosamente sem cobertura. O comando test:ci, provider v8, escopo de teste e configuração de thresholds não mudam. A configuração anterior não declarava limiares numéricos locais; nenhum limiar foi adicionado/removido. Sonar continua com o mesmo escopo/exclusões/gate.

Comparação real Windows, baseline antes e execução depois no mesmo worktree: **81 arquivos JSON**, mesmos mapas e estados coberto/não coberto para statements/functions/branches. Todos os **61 registros TypeScript LCOV** antigos coincidem por linhas, functions, branches e totais. Hits foram normalizados para presença coberta, não para quantidade absoluta de execuções. LCOV nativo tem 81 registros: os vinte extras são templates HTML já presentes no JSON de cobertura, fora de sonar.inclusions=src/**/*.ts. Não houve aumento artificial do denominador TypeScript. [Recibo da comparação](dependency-audit-2026-10-07/coverage-equivalence.json).

| Medida de cobertura local | Antes | Depois |
| --- | --- | --- |
| Statements | 2526/3101 · 81.45% | 2526/3101 · 81.45% |
| Branches | 927/1093 · 84.81% | 927/1093 · 84.81% |
| Functions | 278/421 · 66.03% | 278/421 · 66.03% |
| Lines | 1871/2205 · 84.85% | 1871/2205 · 84.85% |

## Residual sem correção upstream

A consulta de 07/10 ao registry oficial continua apresentando node-forge1.4.0 e @sonar/scan5.0.1 como versões mais recentes. O audit confirma fixAvailable=false para ambos, GHSA-86w9-cpqp-85rv. Não foi suprimido ou ignorado o advisory.

A análise estática reconferiu request.js do scanner: forge interpreta PKCS12/truststore local e extrai certificados, usados como CA do HTTPS. A ausência de chamada direta à operação vulnerável não comprova ausência de exploração indireta. O pacote não é dependência de produção do Angular.

Mitigação operacional: endpoint HTTPS oficial/TLS padrão, certificados e truststores confiáveis, sem PFX/entradas de terceiros não revisados; runner efêmero e segredos fora de código não revisado. A configuração versionada não habilita truststore personalizado ou desativação de TLS. Essas medidas reduzem exposição operacional; não corrigem forge. Reconsultar fornecedor/scanner e as duas auditorias antes da próxima manutenção e do congelamento REN-74.

## Verificação e limites

Instalação limpa/npm ls aprovados; 170 unitários (44 arquivos) antes e depois; cobertura equivalente; Design System com quatro temas/16 pares aprovado. Build candidato: **380.92 kB** iniciais / **103.67 kB** estimados, dentro do orçamento de 500 kB. Não houve medição de ganho de latência/desempenho.

E2E Chromium Windows: **99 aprovados**, zero falhas/retries, 5.2 min, incluindo **21 comparações visuais**. As 42 referências PNG Windows/Linux conservaram seus hashes; nenhum baseline foi atualizado. A suíte usa API simulada, sem substituir integração real. [Manifesto de preservação](dependency-audit-2026-10-07/visual-snapshots-preservation.json).

CI e Sonar do head do MR devem ser conferidos antes da integração. Os recibos reais serão registrados no Linear e checkpoint conjunto; sucesso local não equivale a gate remoto aprovado. Sem alegação de execução local do scanner autenticado.

Os 31 artefatos físicos anteriores foram preservados por bytes/SHA256. Sem nova coleta, TalkBack, aprovação humana de tela, validação em aparelho ou prova web/API/e-mail sem mocks. REN-49/63 e as metas físicas/escopo/TCC continuam distintas.

## Fontes e reprodução

- [Angular: coverageReporters](https://angular.dev/guide/testing/code-coverage); schema/plugins instalados de @angular/build21.2.25 conferidos, sem assumir que a documentação atual exige upgrade do framework.
- [Advisory oficial MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk/security/advisories/GHSA-6qxp-vccf-f47h); fix1.31.0 confirmado também pelo lock/registry.
- [Advisory sprintf-js](https://github.com/advisories/GHSA-hp3w-g68c-fv3c); retirada comprovada da árvore, sem anunciar patch inexistente.
- [Advisory forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv).

Com Node22.23.2/npm10.9.8 no PATH: check-toolchain.ps1; npm ci; npm ls --all; npm run test:ci; verificar coverage/lcov.info; npm run design-system:validate; npm run build; npm run e2e -- --workers=1 --reporter=list; npm audit --json; npm audit --omit=dev --json. Audit completo retorna exit1 enquanto existir o residual; produção deve permanecer exit0.
