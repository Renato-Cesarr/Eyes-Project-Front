# Implementação Angular do Eyes Design System

**Contrato:** Eyes Design System 1.0.0

**Issue:** REN-52

**Stack:** Angular 21, Angular Material 3 e CSS Custom Properties

## Estrutura

- `src/styles/_tokens.scss`: mapeamento executável do contrato canônico;
- `src/styles.scss`: tema Material, fontes offline, reset e utilitários globais;
- `src/app/core/theme/theme.service.ts`: preferência e resolução de tema;
- `src/app/shared/ui`: primitivas sem regra de negócio;
- `/design-system`: catálogo interno, protegido pelo mesmo guard do painel;
- `public/theme-init.js`: aplica o tema antes do bootstrap para evitar flash incorreto.

## Temas

O atributo `data-eyes-theme` no elemento `html` aceita:

- `light`;
- `dark`;
- `high-contrast-light`;
- `high-contrast-dark`.

A preferência `system` é persistida como escolha, mas resolvida para `light` ou
`dark` conforme `prefers-color-scheme`. A preferência explícita fica em
`localStorage` com a chave `eyes-theme-preference`. Se armazenamento estiver
indisponível, a sessão continua funcional com o tema do sistema.

## Primitivas disponíveis

| Componente             | Responsabilidade                                                 |
| ---------------------- | ---------------------------------------------------------------- |
| `eyes-page-shell`      | título único, descrição, ações e largura operacional             |
| `eyes-surface-card`    | agrupamento semântico de conteúdo relacionado                    |
| `eyes-status-badge`    | estado textual com cor e forma redundantes                       |
| `eyes-feedback-banner` | feedback persistente e região viva apropriada                    |
| `eyes-icon`            | Material Symbol offline, decorativo ou nomeado conforme contexto |
| `eyes-state-view`      | loading, vazio, sem resultados e falha recuperável               |
| `eyes-skeleton`        | placeholder visual oculto da árvore acessível                    |
| `eyes-theme-switcher`  | seleção explícita dos quatro temas e modo sistema                |

## Regras de consumo

1. Features usam apenas `--eyes-*` ou variáveis `--mat-sys-*` mapeadas.
2. Cor hexadecimal não entra em SCSS de feature.
3. Componentes compartilhados não conhecem DTOs, endpoints ou regras de domínio.
4. Conteúdo projetado deve aceitar quebra, zoom de 200% e tradução.
5. Novos tokens começam em `design-tokens.json` e passam pelo validador antes do uso.

## Verificação

```powershell
npm run design-system:validate
npm test -- --watch=false
npm run build
```

O validador compara as cores implementadas no SCSS com o JSON canônico, verifica
os quatro temas, contrastes críticos, alvo mínimo, fontes offline e ausência de
Google Fonts no documento HTML.

Com o servidor local em execução, o catálogo fica disponível em
`/design-system` após autenticação administrativa.

## Fluxos públicos

A migração da REN-53 está detalhada em `public-authentication.md`. Login,
solicitação de acesso, ativação, recuperação, redefinição e acesso negado usam a
mesma composição acessível, mantendo regras de negócio e contratos HTTP fora dos
componentes compartilhados.
