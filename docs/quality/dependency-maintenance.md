# REN-48 · Manutenção das dependências do frontend

Verificação em 05/10/2026 sobre a dev `1749f141a82bc490ac737ba75e3eb63651ef83a0`. Execução com Node.js **22.23.2** e npm **10.9.8**, conforme os arquivos do projeto. Coordenação: [REN-48](https://linear.app/renatocesar/issue/REN-48/devops-tratar-novos-alertas-transitivos-do-toolchain-frontend).

## Resultado e escopo

A auditoria de produção passou de **1 alta para zero**. A auditoria completa passou de **15 entradas (2 críticas, 10 altas, 3 moderadas) para 2 altas**, sem críticas ou moderadas. As duas entradas restantes são o mesmo advisory de `node-forge`: o pacote vulnerável e o consumidor direto `@sonar/scan`. Não são duas falhas independentes. A auditoria completa continua retornando exit code 1; a de produção retorna 0.

Angular permanece na major 21. Atualizados conjuntamente os pacotes de framework, compiler, build e CLI para **21.2.25** e o scanner oficial para **5.0.1**, fixado exatamente. CDK/Material, Playwright, Vitest, TypeScript, fontes, ícones e todas as outras dependências diretas conservaram suas versões instaladas. Não foram usados `--force`, `--legacy-peer-deps`, overrides ou forks.

Esta entrega altera manifesto, lockfile e documentação. Código de aplicação, API, composição, tokens, quatro temas, snapshots, tolerância visual de 1%, workflow e configuração do Quality Gate não foram alterados. Os E2E usam API simulada: não comprovam a integração real da REN-73 nem TalkBack/aparelho físico.

## Correções e consumidores

As contagens são entradas de pacote do npm audit, incluindo propagação para consumidores. Os advisories individuais e suas faixas estão preservados em [audit-before.json](dependency-audit-2026-10-05/audit-before.json).

| Entrada da auditoria | Versão anterior → atual | Consumidor / alcance | Resultado |
| --- | --- | --- | --- |
| @angular/router | 21.2.21 → 21.2.25 | Aplicação | Corrigido |
| @angular/build | 21.2.21 → 21.2.25 | Build/testes | Propagação de piscina/undici removida |
| piscina | 5.2.0 → 5.3.2 | @angular/build | Corrigido |
| undici | 7.29.0 → 7.29.1; 6.28.0 → 6.29.0 | @angular/build/jsdom; node-gyp | Corrigido nas duas instalações |
| @sonar/scan | 5.0.0 → 5.0.1 | Análise na CI | adm-zip/axios corrigidos; node-forge residual |
| adm-zip | 0.6.0 → 0.6.1 | @sonar/scan | Corrigido pela versão oficial do scanner |
| axios | 1.18.1 → 1.20.0 | @sonar/scan | Corrigido pela versão oficial do scanner |
| brace-expansion | 5.0.9 → 5.0.12 | minimatch | Corrigido |
| fast-uri | 3.1.5 → 3.1.8 | ajv | Corrigido |
| hono | 4.13.3 → 4.13.13 | @modelcontextprotocol/sdk do CLI | Corrigido |
| http-cache-semantics | 4.2.0 → 4.3.0 | make-fetch-happen | Corrigido |
| ip-address | 10.5.0 → 10.7.3 | express-rate-limit/socks | Corrigido |
| js-yaml | 3.15.1 → 3.15.2 | @istanbuljs/load-nyc-config | Corrigido |
| qs | 6.15.3 → 6.16.0 | body-parser/express do toolchain | Corrigido |
| node-forge | 1.4.0 → 1.4.0 | @sonar/scan | Sem versão corrigida publicada |

O [advisory oficial do Angular](https://github.com/angular/angular/security/advisories/GHSA-ff3f-86qr-9cv3) corrige o router a partir de 21.2.24 e restringe o ataque ao SSR em Node/V8. `angular.json` configura uma aplicação de navegador, sem server/SSR; portanto essa condição não está presente na configuração versionada. A dependência foi atualizada mesmo assim. A [correção oficial do Piscina](https://github.com/piscinajs/piscina/security/advisories/GHSA-67c8-pqhq-4rmx) está em 5.3.2. A classificação crítica registrada acima é a do npm audit; o texto do advisory do fornecedor usa High. A [release oficial do scanner 5.0.1](https://github.com/SonarSource/sonar-scanner-npm/releases/tag/5.0.1) inclui adm-zip 0.6.1 e axios 1.20.0.

## Risco residual: node-forge

**GHSA-86w9-cpqp-85rv / CVE-2026-85393**, alta: validação incompleta de elementos ASN.1 na verificação RSA PKCS#1 v1.5 pode aceitar assinaturas forjadas com chaves de baixo expoente. Em 05/10, npm publicou somente até 1.4.0; o scanner 5.0.1 ainda fixa essa versão e o audit declara `fixAvailable: false` para ambas as entradas.

Fontes: [relato no repositório do fornecedor](https://github.com/digitalbazaar/forge/issues/1149), [proposta de correção ainda aberta](https://github.com/digitalbazaar/forge/pull/1152) e [advisory revisado](https://github.com/advisories/GHSA-86w9-cpqp-85rv). Uma proposta de código sem release não é tratada como correção instalável.

**Alcance verificado:** `npm ls --all` encontra node-forge somente sob o scanner, que é devDependency. A auditoria `--omit=dev` não o inclui. Na versão oficial instalada, `@sonar/scan/src/request.js` usa forge para decodificar um truststore PKCS#12 local e extrair certificados PEM; a conexão HTTPS usa Axios e agentes de `node:https`/hpagent. Não há chamada direta à verificação RSA vulnerável nesse arquivo. Isso delimita a superfície observada; não demonstra ausência de toda exploração indireta.

**Mitigação temporária e regra de operação:** manter o endpoint oficial HTTPS configurado em `sonar-project.properties`, a validação TLS padrão e os certificados do ambiente confiável; não configurar truststores/PFX fornecidos por usuários ou PRs, não desativar validação de certificados e não executar o scanner com segredos em código não revisado. A configuração versionada não define truststore personalizado nem flag que desabilite TLS. A CI usa runner Ubuntu efêmero e o segredo do scanner permanece no secret store do GitHub. Esse isolamento reduz o alcance operacional e não corrige a biblioteca.

**Responsável e próxima ação:** a manutenção REN-48 registra o residual; antes de outra manutenção de dependências ou do congelamento REN-74, consultar a issue/release do forge, a release oficial do scanner e repetir as duas auditorias. Quando houver correção oficial compatível, atualizar o consumidor e repetir a instalação, os testes e o scanner. Não suprimir o advisory, forçar versão inexistente ou remover o Quality Gate para obter status verde. Uma futura vulnerabilidade de produção bloqueia a integração.

## Resolução e revisão do lockfile

O npm rejeitou a tentativa de resolver separadamente os peers exatos dos patches Angular. O lock anterior foi preservado; a árvore foi regenerada com todos os peers Angular alinhados, mantendo temporariamente as demais dependências diretas nas versões instaladas anteriores. Os ranges originais dessas dependências foram restaurados e o lock reconciliado pelo npm oficial. `npm ci` consumiu o resultado e `npm ls --all` validou a árvore sem erro de peer ou dependência inválida.

A revisão registra **116 entradas com versão alterada, zero alterações de major e zero alterações de versão em dependências diretas fora do conjunto Angular/scanner**. Não há novos caminhos de pacote. Foi deduplicada a entrada opcional `vite/node_modules/fsevents`; a dependência opcional fsevents continua na árvore. Sem atualização major de produto ou de toolchain. O inventário integral, hashes e versões diretas estão em [lock-review.json](dependency-audit-2026-10-05/lock-review.json).

## Validação e limites

Comandos no toolchain fixado:

```powershell
./scripts/check-toolchain.ps1
npm ci
npm ls --all
npm run design-system:validate
npm run build
npm run test:ci
npm run e2e
npm audit --json
npm audit --omit=dev --json
```

- Instalação limpa: exit 0; árvore npm: exit 0.
- Design System: quatro temas e 16 pares de contraste aprovados pelo validador existente.
- Build de produção no Windows: **380.92 kB** iniciais / **103.67 kB** de transferência estimada, dentro do orçamento de aviso de 500 kB. O checkpoint anterior registrou 380.30 / 103.53 kB: +0.62 / +0.14 kB. Essa comparação é de tamanho de bundle, sem alegação de ganho de latência.
- Unitários Chromium com cobertura: **44 arquivos / 170 testes**, zero falhas. Cobertura total: statements 81.45%, branches 84.81%, functions 66.03%, lines 84.85%. Não foi alterada a instrumentação ou a configuração de cobertura do projeto.
- E2E Chromium Windows: **99 testes aprovados**, zero falhas/retries, em 5.7 min; inclui 21 comparações visuais e a matriz de 216 combinações de rotas/temas/larguras/texto dos demais fluxos. API simulada nesta suíte.
- **42 referências PNG** (21 Windows e 21 Linux) conservaram seus hashes; [manifesto](dependency-audit-2026-10-05/visual-baselines.json). A execução visual em cada plataforma é uma evidência distinta do hash das referências.
- Auditorias reais depois da instalação: completa 2 altas/exit 1; produção zero/exit 0. JSONs [completo](dependency-audit-2026-10-05/audit-after.json) e [produção](dependency-audit-2026-10-05/audit-production-after.json).

A CI existente executa instalação, validação do Design System, build, unitários/cobertura, E2E Linux, conversão LCOV e SonarCloud. Seus resultados devem ser confirmados no head do MR antes da integração; recibos de CI e Quality Gate são registrados no Linear e no checkpoint de continuidade. Quality Gate aprovado não equivale a auditoria completa sem alertas.

Não houve coleta assistiva nova nem aceite físico. Os 31 artefatos originais de calibração foram conferidos por tamanho/SHA-256 e preservados. A manutenção não encerra REN-63, REN-70 ou as demais metas obrigatórias do produto.
