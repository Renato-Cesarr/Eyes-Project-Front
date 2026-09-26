# ADR 0001 — Design System cross-platform do Eyes

- **Status:** Aceito
- **Data:** 2026-09-25
- **Issue:** REN-50

## Contexto

O painel Angular e o aplicativo Flutter evoluíram em repositórios separados. Ambos já possuem funcionalidades e cuidados de acessibilidade, mas usam decisões visuais locais, cores hardcoded e hierarquias inconsistentes. O projeto também recebeu a referência local `ui-ux-pro-max-skill`, versão 2.13.0, commit `dcc40ff`, licenciada sob MIT.

Essa referência contém catálogos de estilos, paletas, tipografia, ícones, movimento, guidelines de UX e recomendações por stack. Ela é um mecanismo de pesquisa e raciocínio, não uma biblioteca de componentes pronta para runtime.

## Decisão

Adotar um contrato visual próprio chamado **Eyes Design System**, com:

- Inclusive Design como princípio dominante;
- Material 3 como base de comportamento nativo;
- minimalismo suíço como disciplina de hierarquia e composição;
- tokens semânticos canônicos em JSON;
- implementações independentes em Angular Material 3 e Flutter Material 3;
- quatro temas de primeira classe;
- Lexend para títulos e Atkinson Hyperlegible para leitura;
- Material Symbols/Icons como família funcional;
- WCAG 2.2 AA como piso e meta de 7:1 para texto principal;
- validação automatizada de estrutura e pares críticos de contraste.

A fonte canônica será versionada no repositório Frontend em `docs/design-system`. As implementações Mobile referenciam a versão do contrato utilizada e mapeiam os mesmos nomes por `ColorScheme` e `ThemeExtension`.

## Uso da referência externa

### Aproveitado

- prioridade de acessibilidade e interação;
- busca por padrões de produto e stack;
- recomendações de contraste, foco, touch target, text scaling e reduced motion;
- alerta contra emoji funcional, cores hardcoded e mistura de ícones;
- checklist de entrega e disciplina de design tokens.

### Rejeitado ou limitado

- copiar exemplos React/Next para Angular ou Flutter;
- adicionar a ferramenta ao bundle de produção;
- introduzir Tailwind, shadcn ou framework visual concorrente;
- aplicar glassmorphism, gradientes ou dashboards densos só porque aparecem no catálogo;
- consumir recomendações Angular 22 sem verificar compatibilidade com Angular 21;
- tratar uma sugestão do catálogo como substituto de teste com usuários.

## Alternativas consideradas

### Manter estilos independentes

Rejeitada por ampliar inconsistência, retrabalho e risco de acessibilidade.

### Compartilhar uma biblioteca de componentes entre Angular e Flutter

Rejeitada porque os runtimes e padrões de interação são diferentes. Compartilhamos contrato e intenção, não widgets.

### Adotar integralmente a referência clonada

Rejeitada porque ela não é uma biblioteca de runtime e contém orientações genéricas que precisam ser filtradas pelo contexto assistivo.

### Criar um novo repositório apenas para o Design System

Adiada para depois do MVP. Um novo pacote, publicação e versionamento distribuído adicionariam custo sem benefício proporcional neste estágio.

## Consequências

### Positivas

- identidade consistente entre produtos;
- decisões acessíveis testáveis;
- migração incremental sem reescrever domínio;
- redução de valores hardcoded;
- rastreabilidade entre decisão, token e implementação.

### Custos e riscos

- o Frontend passa a hospedar o contrato canônico até eventual extração;
- mudanças exigem avaliar duas plataformas;
- fontes aumentam o tamanho dos builds;
- snapshots visuais exigem governança para não congelar decisões ruins.

## Critérios de revisão

Reavaliar este ADR se houver terceiro cliente, publicação externa dos tokens, necessidade de versionamento independente ou conflito recorrente entre os ciclos de release Web e Mobile.
