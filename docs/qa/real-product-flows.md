# Demonstração local sem mocks — REN-73

Este roteiro executa o Front em Chromium contra a API Spring real, PostgreSQL
e Mailpit. É opt-in: os gates existentes com fixtures visuais permanecem
determinísticos, e esta demonstração não depende de serviços externos na CI.
Não usa page.route, respostas fabricadas nem sessão ADMIN injetada. O teste
negativo de sessão grava somente uma credencial deliberadamente inválida.

## Pré-requisitos e isolamento

Usar Node 22.23.2/npm 10.9.8, Java 21/Maven declarados no Back, Docker e Chromium
do Playwright instalado (`npx playwright install chromium`, se necessário).
Instalar as dependências com npm ci. Fixar os commits das quatro áreas no
checkpoint. O backend precisa incorporar a correção da REN-19 que retorna
401/INVALID_CREDENTIALS para login recusado.

Reservar portas locais 4330 (web), 8080 (API), 15433 (PostgreSQL), 1026 (SMTP)
e 8026 (Mailpit). Conferir que estão livres. Usar um checkout Back isolado,
com .env ignorado; não sobrescrever o .env de outro ambiente.

Criar uma pasta privada fora do repositório. No Front:

```powershell
node scripts/initialize-real-qa.mjs CAMINHO_PRIVADO_QA_ENV
```

O gerador usa segredos aleatórios e se recusa a sobrescrever um arquivo
existente. Não mostrar nem versionar seu conteúdo. Reutilizar o mesmo arquivo
com os volumes associados: gerar novas credenciais não muda senhas já gravadas.

No Back, usar o compose existente com projeto próprio:

```powershell
docker compose --project-name eyes-ren73-qa --env-file CAMINHO_PRIVADO_QA_ENV -f docker-compose.yml up --wait --wait-timeout 120
```

Isso cria somente eyes-ren73-qa_postgres-data/mailpit-data e sua rede. Não
executar reset/down -v. Dados e volumes eyes-local permanecem independentes.

Copiar o arquivo privado para .env apenas no checkout Back isolado, caso esse
arquivo ainda não exista. Carregar suas chaves no ambiente do processo, sem
executar o arquivo como código. O profile local importa obrigatoriamente .env.
O gerador habilita bootstrap e coleta exclusivamente para este QA local.

```powershell
foreach ($qaLine in [IO.File]::ReadAllLines('CAMINHO_PRIVADO_QA_ENV')) {
  if ($qaLine -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
  }
}
./mvnw.cmd '-Dspring-boot.run.profiles=local' '-Dspring-boot.run.arguments=--server.port=8080 --server.address=127.0.0.1' spring-boot:run
```

Em outro terminal, no Front:

```powershell
npm run start -- --host 127.0.0.1 --port 4330
npm run qa:real -- CAMINHO_PRIVADO_QA_ENV CAMINHO_RELATORIO_JSON
```

Os serviços devem estar prontos antes do comando de prova. Iniciar a API com
rate-limiters limpos e aguardar janelas entre execuções; o roteiro respeita as
capacidades padrão (login 10/300s, solicitações 5/900s, recuperação 5/900s).
Reruns podem alcançar 429. Não elevar os limites para obter aprovação. Para
recomeçar o ciclo de QA, parar/reiniciar somente o processo desta API isolada;
preservar banco, mensagens e configurações.

## O que é comprovado

1. Solicitação pública pela UI, recibo 202 neutro e replay idempotente.
2. Login ADMIN pela UI, perfil real e resumo administrativo.
3. Aprovação na UI, entrega SMTP, conta STUDENT inicialmente inativa e replay
   200 da aprovação sem outro email.
4. Ativação pela UI e recusa de reutilização do token.
5. Login STUDENT, perfil, negação do painel e HTTP 403 nas APIs administrativas.
6. Recuperação e reset pela UI/Mailpit; senha antiga recusada, nova aceita,
   feedback de credenciais inválidas e token de reset de uso único.
7. Detalhes, desativação/reativação pela UI e sessão da conta inativa recusada.
8. Recusa da desativação do último ADMIN e preservação do seu acesso.
9. Convite/reenvio pela UI; link antigo invalidado e novo link funcional.
10. Rejeição com justificativa; eventos de sucesso/falha persistidos e visíveis
    na auditoria administrativa.
11. CORS permitido/recusado, sessão ausente e ProblemDetail 422 de validação.
12. Sessão armazenada inválida removida e redirecionamento ao login.

O relatório registra etapas e método/path/status HTTP, substituindo UUIDs por
:id. Não guarda emails, senhas, JWT, tokens de convite/reset ou bodies. Não
produz trace, vídeo, screenshot automático ou storageState, pois esses arquivos
podem carregar segredos. Falhas brutas do navegador são omitidas; o código e a
etapa sanitizados permitem investigar localmente. Relatório e credenciais
devem usar caminhos distintos. Dados sintéticos permanecem somente no QA.

## Limites de aceite

A demonstração comprova os fluxos administrativos descritos. Não executa o
APK, câmera/TTS/háptico, modo avião ou TalkBack; não substitui aceite humano de
design nem coleta/avaliação científica. Sessões consentidas mobile/API e prova
física continuam na REN-75/73/32. CI verde da PR não comprova gate da dev após
merge. Registrar comandos, versões, resultados, hashes e limites no Linear e
no checkpoint local; não encerrar a REN-73 apenas por estas etapas web.
