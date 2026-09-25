# Eyes-Project-Front

Aplicação front-end do Eyes Project, desenvolvida em Angular, responsável pelo painel administrativo do sistema. Permite gerenciamento de usuários, solicitação e aprovação de acessos, além de visualização de informações e integração com serviços de back-end e IA.

## Toolchain fixado

- Node.js `22.23.2` LTS, declarado em `.nvmrc` e `engines`;
- npm `10.9.8`, declarado em `packageManager` e `engines`;
- dependências instaladas exclusivamente com `npm ci` a partir do
  `package-lock.json`.

No Windows, instale uma versão compatível do NVM, selecione o Node declarado e
valide o ambiente:

```powershell
nvm install 22.23.2
nvm use 22.23.2
npm install --global npm@10.9.8
./scripts/check-toolchain.ps1
npm ci
```

Não regenere o `package-lock.json` usando outra versão de Node ou npm sem uma
revisão explícita. A CI lê a versão diretamente de `.nvmrc` e executa o mesmo
script de diagnóstico antes do build.

## Sessão e autorização do painel

O painel web é exclusivo para usuários com papel `ADMIN`. A aplicação não
confia apenas na existência de um token: ao abrir ou recarregar uma rota
protegida, valida a identidade em `GET /api/v1/auth/me` e usa o papel devolvido
pelo backend como fonte de verdade.

- o JWT fica em `sessionStorage` e deixa de existir quando a aba é encerrada;
- versões antigas armazenadas em `localStorage` são removidas, não migradas;
- `401 Unauthorized` encerra a sessão e direciona ao login;
- `403 Forbidden` preserva a identidade e apresenta uma tela de acesso negado;
- o interceptor só envia o JWT para a origem configurada em `environment.apiUrl`;
- nome e papel exibidos no layout vêm da sessão validada pela API.

O armazenamento no navegador reduz persistência indevida, mas não elimina o
risco de roubo do token por XSS. Por isso, o projeto aplica uma Content Security
Policy inicial em `src/index.html`, evita HTML não sanitizado e exige revisão da
CSP e do `apiUrl` em cada ambiente implantado. Em produção, a mesma política
deve ser enviada também como cabeçalho HTTP pelo servidor que hospeda o Angular.

## Fluxos públicos de acesso

Solicitação de acesso e ativação por convite são fluxos distintos e não exigem
uma sessão autenticada:

- `POST /api/v1/access-requests` recebe nome, e-mail e motivo opcional. A resposta
  confirma somente o recebimento para análise; ela não cria conta nem garante
  aprovação imediata;
- após a aprovação administrativa, o convidado define a senha por meio de
  `POST /api/v1/users/setup-password`, enviando o token recebido e a nova senha;
- erros públicos são convertidos em mensagens seguras. A interface não revela
  se um e-mail pertence a uma conta nem exibe detalhes internos de tokens;
- os formulários apresentam sucesso e falha no próprio conteúdo, além do aviso
  temporário, para preservar contexto e acessibilidade durante a navegação.

## Gestão administrativa de solicitações

A rota protegida `/requests` permite que administradores consultem e decidam
as solicitações recebidas. A tela usa paginação e filtros processados pelo
backend, evitando carregar a base inteira no navegador.

- a aprovação exige confirmação explícita, cria a conta de estudante e dispara
  o convite por meio de `POST /api/v1/access-requests/{id}/approve`;
- a rejeição exige uma justificativa de até 500 caracteres e usa
  `POST /api/v1/access-requests/{id}/reject`;
- a interface atualiza a decisão somente depois da confirmação da API e
  reconcilia a listagem quando encontra conflitos ou solicitações já decididas;
- carregamento, lista vazia, falha, sucesso e paginação possuem mensagens
  acessíveis e operáveis por teclado.

## Gestão administrativa de usuários

A rota protegida `/users` oferece a visão operacional das contas sem permitir
exclusão física de dados. Busca, perfil, estado, ordenação e paginação são
processados pelo backend por meio de `GET /api/v1/users`.

- um novo usuário é criado como `STUDENT`, inativo e com convite pendente; a
  ativação ocorre exclusivamente pelo link seguro enviado ao e-mail informado;
- convites pendentes podem ser reenviados, o que invalida o link anterior;
- contas já ativadas podem ser desativadas e reativadas mediante confirmação;
- a interface não oferece ativação manual para convites pendentes, e o backend
  impede a desativação do último administrador ativo;
- detalhes são consultados novamente na API antes de serem exibidos, evitando
  apresentar uma versão desatualizada do cadastro;
- conflitos, sessão expirada e falhas de rede são convertidos em mensagens
  seguras, sem expor respostas internas do servidor.

## Dashboard e auditoria administrativa

O dashboard apresenta apenas dados reais obtidos da API: total de solicitações
pendentes, usuários ativos e as cinco ações administrativas mais recentes. Para
preservar desempenho, as contagens reutilizam o `totalElements` das consultas
paginadas com apenas um item; nenhuma coleção completa é carregada para contar
registros no navegador.

A rota protegida `/audit` consulta `GET /api/v1/audit` e oferece paginação e
filtros por administrador, ação, resultado e período. A visualização é somente
leitura e traduz os eventos técnicos para rótulos compreensíveis, sem exibir os
metadados internos do registro. Estados de carregamento, falha e lista vazia são
anunciados por tecnologias assistivas. Links de relatórios e configurações foram
removidos porque esses módulos não pertencem ao MVP atual.

## Validação local

```powershell
npm ci
npx playwright install chromium
npm test -- --watch=false
npm run e2e
npm run build
```

## Acessibilidade e testes de jornada

O painel segue WCAG 2.2 nível AA como referência. A interface oferece foco
visível, landmarks, mensagens de erro anunciadas, suporte a zoom de 200%,
refluxo em telas estreitas e respeito a `prefers-reduced-motion`. Tabelas largas
mantêm a rolagem dentro de uma região nomeada, sem provocar rolagem horizontal
na página inteira.

Os testes em `e2e/` executam no Chromium as jornadas críticas de solicitação de
acesso, ativação de conta, login, aprovação administrativa e convite de usuário.
Cada tela relevante também passa por auditoria automatizada com axe-core; a CI
falha quando encontra violações de impacto crítico ou sério. As respostas da API
são simuladas somente nessa suíte, de forma determinística e sem acesso a dados
reais ou segredos.

Para investigar uma falha visual localmente, abra o relatório gerado por:

```powershell
npm run e2e:report
```

# EyesProjectFront

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
