# Mapeamento do contrato por plataforma

Este documento traduz os mesmos tokens e comportamentos para Angular e Flutter. O objetivo é equivalência de intenção, não código idêntico.

## Cores

| Token canônico                | Angular                                                | Flutter                                     |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| `background`                  | `--eyes-color-background`                              | `ColorScheme.surface` no fundo da aplicação |
| `onBackground`                | `--eyes-color-on-background`                           | `ColorScheme.onSurface`                     |
| `surface`                     | `--eyes-color-surface`                                 | `ColorScheme.surfaceContainerLowest`        |
| `onSurface`                   | `--eyes-color-on-surface`                              | `ColorScheme.onSurface`                     |
| `surfaceVariant`              | `--eyes-color-surface-variant`                         | `ColorScheme.surfaceContainer`              |
| `onSurfaceVariant`            | `--eyes-color-on-surface-variant`                      | `ColorScheme.onSurfaceVariant`              |
| `primary` / `onPrimary`       | `--eyes-color-primary` / `--eyes-color-on-primary`     | `ColorScheme.primary` / `onPrimary`         |
| `secondary` / `onSecondary`   | `--eyes-color-secondary` / `--eyes-color-on-secondary` | `ColorScheme.secondary` / `onSecondary`     |
| `error` / `onError`           | `--eyes-color-error` / `--eyes-color-on-error`         | `ColorScheme.error` / `onError`             |
| `success`, `warning`, `focus` | propriedades customizadas                              | `EyesSemanticColors` via `ThemeExtension`   |

No Flutter, `background` não deve usar APIs obsoletas do `ColorScheme`; a intenção é mapeada para a superfície base. Tokens de sucesso, atenção e foco não são forçados em slots semânticos incorretos do Material.

## Tipografia

| Intenção | Angular Material 3                            | Flutter Material 3                           |
| -------- | --------------------------------------------- | -------------------------------------------- |
| Display  | `--mat-sys-display-*` com Lexend              | `TextTheme.display*` com Lexend              |
| Headline | `--mat-sys-headline-*` com Lexend             | `TextTheme.headline*` com Lexend             |
| Title    | `--mat-sys-title-*` com Lexend                | `TextTheme.title*` com Lexend                |
| Body     | `--mat-sys-body-*` com Atkinson Hyperlegible  | `TextTheme.body*` com Atkinson Hyperlegible  |
| Label    | `--mat-sys-label-*` com Atkinson Hyperlegible | `TextTheme.label*` com Atkinson Hyperlegible |
| Código   | classe utilitária explícita                   | `EyesTextStyles.code`                        |

## Espaçamento e forma

- Angular expõe `--eyes-space-*`, `--eyes-radius-*`, `--eyes-elevation-*` e `--eyes-size-*` no escopo do tema.
- Flutter usa uma `ThemeExtension<EyesLayoutTokens>` imutável.
- Valores em `rem` são convertidos para o equivalente numérico em dp no Flutter assumindo a escala base; o conteúdo continua respondendo ao `textScaler`.
- `pill` é reservado para badges, chips e controles cuja forma faça parte da affordance; cards comuns usam raio médio ou grande.

## Tema e preferência

### Angular

1. Tema do sistema é o padrão.
2. Preferência explícita do usuário pode sobrescrever o sistema.
3. O tema é aplicado por atributo `data-eyes-theme` no elemento raiz.
4. `forced-colors: active` preserva cores do sistema operacional.
5. A aplicação não produz flash de tema incorreto durante bootstrap.

### Flutter

1. `ThemeMode.system` é o padrão.
2. `ThemeData.light`, `dark`, `highContrastLight` e `highContrastDark` são fornecidos ao `MaterialApp.router`.
3. Tokens extras são lidos por extensions, nunca por constantes locais de feature.
4. A escolha de tema permanece no repositório de preferências existente.

## Componentes equivalentes

| Intenção             | Angular                                 | Flutter                                    |
| -------------------- | --------------------------------------- | ------------------------------------------ |
| Ação primária        | Material button + wrapper Eyes          | `FilledButton` temático                    |
| Ação secundária      | outlined/text button                    | `OutlinedButton` / `TextButton`            |
| Campo                | Material form field                     | `TextFormField`                            |
| Feedback transitório | `MatSnackBar`, sem informação exclusiva | `SnackBar`, sem informação exclusiva       |
| Diálogo              | `MatDialog` com controle de foco        | `Dialog`/`AlertDialog` com Semantics       |
| Navegação principal  | sidenav/drawer adaptativo               | rotas e barras nativas conforme tela       |
| Dados tabulares      | `MatTable`/CDK                          | lista/cartões; tabela apenas se necessária |
| Estado de página     | componente Eyes reutilizável            | widget Eyes reutilizável                   |

## Ícones

- Angular usa Material Symbols/Icons empacotados e o componente de ícone do Material.
- Flutter usa `Icons`/Material Icons incluídos no build.
- Ícone isolado possui nome acessível; ícone ao lado de texto visível é decorativo.
- O mesmo conceito usa o mesmo símbolo nas duas plataformas sempre que a convenção nativa não indicar alternativa melhor.

## Restrições arquiteturais

- Nenhum token entra em `domain` ou `application`.
- Nenhum componente visual conhece DTO, endpoint, tensor ou `Interpreter`.
- Features podem compor componentes, mas não redefinir paleta ou tipografia global.
- Uma exceção local deve usar um token semântico novo aprovado, não um valor hexadecimal improvisado.
