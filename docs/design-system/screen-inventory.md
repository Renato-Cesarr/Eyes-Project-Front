# Inventário de telas e matriz de migração

**Data da leitura do código:** 2026-09-25  
**Regra:** este inventário descreve rotas e componentes existentes. Itens apenas propostos em documentos acadêmicos não entram como tela implementada.

## Painel Web — Angular

### Fluxos públicos

| Rota                | Tela                         | Estados críticos                                                   | Migração |
| ------------------- | ---------------------------- | ------------------------------------------------------------------ | -------- |
| `/login`            | Login administrativo         | vazio, inválido, carregando, credencial incorreta, sessão expirada | REN-53   |
| `/solicitar-acesso` | Solicitação pública          | formulário, validação, enviando, confirmação segura, falha         | REN-53   |
| `/setup-password`   | Definição inicial de senha   | token ausente, token inválido/expirado, senha inválida, sucesso    | REN-53   |
| `/forgot-password`  | Solicitação de recuperação   | formulário, enviando, confirmação neutra, falha                    | REN-53   |
| `/reset-password`   | Redefinição por token        | token ausente, inválido/expirado, senha inválida, sucesso          | REN-53   |
| `/acesso-negado`    | Acesso administrativo negado | identidade válida sem papel permitido, sair, voltar                | REN-53   |

Componentes compartilhados afetados: `auth-layout`, `form-card`, botão, campos, feedback de formulário e mensagens de recuperação.

### Estrutura autenticada

| Rota/região   | Tela                                           | Estados críticos                                  | Migração |
| ------------- | ---------------------------------------------- | ------------------------------------------------- | -------- |
| shell         | Sidebar, cabeçalho, conta e conteúdo principal | amplo, compacto, drawer, rota ativa, logout       | REN-54   |
| `/dashboard`  | Resumo operacional                             | carregando, dados parciais, vazio, falha, sucesso | REN-54   |
| rota inválida | Redirecionamento seguro                        | destino inexistente, sessão válida ou ausente     | REN-54   |

### Gestão administrativa

| Rota        | Tela/diálogos                                     | Estados críticos                                                  | Migração |
| ----------- | ------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| `/requests` | Solicitações, detalhes, aprovação e rejeição      | loading, vazio, sem resultados, erro, conflito, sucesso           | REN-55   |
| `/users`    | Usuários, detalhes, convite e confirmação de ação | loading, vazio, filtro, convite pendente, ativo/inativo, conflito | REN-55   |
| `/audit`    | Auditoria somente leitura                         | loading, vazio, filtro, paginação, falha, dados disponíveis       | REN-55   |

## Aplicativo Mobile — Flutter

| Rota          | Tela                                        | Estados críticos                                                           | Migração |
| ------------- | ------------------------------------------- | -------------------------------------------------------------------------- | -------- |
| `/`           | Bootstrap/decisão de entrada                | inicializando, primeira execução, preferências lidas, falha local          | REN-56   |
| `/onboarding` | Introdução, privacidade e permissões        | página atual, consentimento, câmera negada, concluído                      | REN-56   |
| `/home`       | Início e ação de varredura                  | offline, conta ausente/presente, prontidão, falha recuperável              | REN-56   |
| `/account`    | Conta opcional                              | desconectado, login, carregando, inválido, conectado, expiração            | REN-56   |
| `/help`       | Ajuda e segurança                           | conteúdo, navegação, orientação de emergência                              | REN-56   |
| `/settings`   | Voz, vibração, sensibilidade e preferências | disponível/indisponível, valor atual, salvando, falha                      | REN-56   |
| `/camera`     | Varredura assistiva                         | initializing, ready, active, paused, recovering, permission-denied, failed | REN-57   |
| erro de rota  | Página não encontrada                       | orientação e retorno seguro                                                | REN-56   |

## Componentes transversais

| Componente/intenção | Web                               | Mobile                                 | Fundação        |
| ------------------- | --------------------------------- | -------------------------------------- | --------------- |
| Tema e tokens       | Angular Material + CSS properties | `ThemeData`, `ColorScheme`, extensions | REN-52 / REN-51 |
| Botões e ações      | shared UI                         | widgets compartilhados                 | REN-52 / REN-51 |
| Feedback de estado  | inline + snackbar                 | inline + snackbar + fala/háptica       | REN-52 / REN-51 |
| Loading/vazio/erro  | componente de estado              | widget de recuperação                  | REN-52 / REN-51 |
| Diálogo             | Material Dialog                   | Dialog/AlertDialog                     | REN-52 / REN-51 |
| Ícones              | Material Symbols/Icons            | Material Icons                         | REN-52 / REN-51 |
| Tipografia offline  | WOFF2 local                       | fonte declarada no bundle              | REN-52 / REN-51 |

## Débitos visuais confirmados no baseline

Esses itens foram encontrados diretamente no código e orientam as migrações; não representam novas funcionalidades.

| Evidência atual                                                                                                                | Impacto                                                              | Tratamento                                                     |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| O Web carrega Inter por `fonts.googleapis.com` e o build emite aviso de orçamento para a folha inline                          | Dependência de rede, identidade divergente e custo de bundle         | REN-52 substitui por fontes locais licenciadas                 |
| Features Web possuem muitos hexadecimais, RGBA, gradientes e sombras definidos em SCSS local                                   | Temas inconsistentes e manutenção difícil                            | REN-52 cria tokens; REN-53 a REN-55 migram as features         |
| Autenticação Web usa blobs radiais, transparência e card com aparência de vidro                                                | Ruído e contraste dependente do fundo                                | REN-53 adota superfícies sólidas e hierarquia tipográfica      |
| Shell Web mistura indigo, slate, gradientes e ícones locais                                                                    | Identidade fragmentada e estados difíceis de tematizar               | REN-54 consolida navegação e tokens                            |
| Mobile já possui quatro `ThemeData`, mas as cores são geradas por seed e não seguem contrato semântico compartilhado           | Aproximação visual sem garantia de equivalência                      | REN-51 implementa `ColorScheme` e `ThemeExtension` canônicos   |
| A varredura Mobile organiza status, ações, preview e telemetria em `ListView`; o preview aparece depois de blocos operacionais | A câmera perde prioridade e a tela parece uma lista de configurações | REN-57 cria composição camera-first com divulgação progressiva |
| Telemetria Mobile já usa `ExcludeSemantics`, mas continua visível na experiência padrão                                        | Informação técnica compete com a tarefa principal                    | REN-57 move telemetria para modo de desenvolvimento            |

## Sequência de migração

1. **REN-50:** contrato, tokens, inventário e governança.
2. **REN-51 e REN-52:** implementação das bibliotecas visuais por plataforma.
3. **REN-53 a REN-57:** migração das telas sem alteração de regra de negócio.
4. **REN-58:** regressão visual e gates automatizados.
5. **REN-32:** validação acessível final em aparelho real.

## Fora deste ciclo

- criação de novas regras de autenticação ou RBAC;
- novos endpoints ou entidades de banco;
- troca do modelo de IA;
- câmera externa USB;
- treinamento de novo detector;
- novos módulos administrativos fora do MVP;
- redesign da documentação acadêmica.

Descobertas dessas categorias viram cards próprios e não ampliam silenciosamente os cards visuais.
