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
