# REN-49 · Runtime das actions da CI

Revisão em **07/10/2026**. [Card e critérios de aceite](https://linear.app/renatocesar/issue/REN-49/devops-atualizar-actionscheckout-e-setup-node-para-runtime-node-24).

O runtime JavaScript interno das actions passou para Node 24. As referências estão fixadas em SHAs de releases oficiais estáveis, com a versão no comentário do YAML. Os parâmetros, triggers, caches, comandos, toolchains do produto, testes e Quality Gate foram preservados.

## Referências deste repositório

| Action | Release | SHA imutável | Runtime |
| --- | --- | --- | --- |
| [actions/checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | node24 |
| [actions/setup-node](https://github.com/actions/setup-node/releases/tag/v7.0.0) | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` | node24 |
| [actions/upload-artifact](https://github.com/actions/upload-artifact/releases/tag/v7.0.1) | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | node24 |

## Compatibilidade revisada

- Checkout 7 preserva o uso em push/pull_request deste projeto. A proteção nova de forks em pull_request_target/workflow_run não requer opt-in nestes triggers; não foi ativado allow-unsafe-pr-checkout. O fornecedor passou a guardar credenciais em arquivo sob RUNNER_TEMP, mantido o comportamento padrão. [Documentação oficial](https://github.com/actions/checkout/blob/v7.0.1/README.md).
- Actions Node 24 requerem runner compatível; as releases indicam runner mínimo 2.327.1. A pipeline usa ubuntu-latest hospedado pelo GitHub. [Migração oficial](https://github.com/actions/checkout/blob/v7.0.1/README.md).
- setup-node 7 lê a mesma .nvmrc e mantém cache npm explícito pelo package-lock. Node do produto continua 22.23.2/npm 10.9.8. A mudança remove a variável de autenticação fictícia da action; este workflow não depende dela nem publica pacote. O cache continua explícito, sem mudança de fonte do lock. [Release](https://github.com/actions/setup-node/releases/tag/v7.0.0).
- upload-artifact 7 mantém nome playwright-failures, diretório test-results, retenção de sete dias e ignore quando não houver arquivos. O novo upload direto não foi habilitado: archive mantém default true, preservando o envio do diretório. A etapa continua condicionada a falha e pode ser pulada em uma execução verde. [Parâmetros oficiais](https://github.com/actions/upload-artifact/blob/v7.0.1/README.md).

## Conferência conjunta e aceite

Front, Back e IA recebem MRs próprios da REN-49. Mobile já fixa checkout 7.0.1, setup-java 5.7.0, flutter-action 2.23.0 e Sonar action 8.2.1. A action Flutter é composta e chama actions/cache@v5, cuja definição oficial consultada também declara node24. A definição composta não foi confundida com um runtime Node próprio.

A verificação estrutural compara os YAMLs antes/depois e exige que somente referências uses mudem; também confere SHAs/releases/runtimes e se os inputs declarados continuam existindo no fornecedor. A prova funcional final é a CI no head do MR, incluindo os mesmos gates. Resultados e recibos remotos ficam no Linear e no checkpoint conjunto, evitando confundir a migração implementada com aprovação do pipeline.

**Limite já existente:** dev mobile b91a3a4 falha no Sonar/New Code da REN-63. A API consultada em 07/10 devolve NONE, conditions=[], periods=[]; isso não é aprovação. A REN-49 não reduz gates ou muda configuração do Sonar para conseguir verde. O requisito de quatro pipelines aprovadas permanece pendente enquanto esse impedimento persistir.

A auditoria npm completa do Front em 07/10 encontrou 9 entradas de desenvolvimento (4 altas, 5 moderadas), produção zero. A REN-48 foi reaberta para a manutenção desse novo conjunto, separada das actions. Nenhum package/lockfile é alterado nesta entrega.

## Rollback

Reverter apenas o commit deste MR restaura as referências anteriores. Os runtimes e os locks do produto não dependem da reversão. Após integrar ou reverter, conferir a CI da dev resultante; sucesso no MR não substitui aprovação da branch de destino.
