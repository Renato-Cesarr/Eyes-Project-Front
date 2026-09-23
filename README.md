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

## Validação local

```powershell
npm ci
npm test -- --watch=false
npm run build
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

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
