# Fluxos administrativos de dados

## Estrutura comum

As páginas de usuários, solicitações e auditoria seguem a mesma sequência cognitiva:

1. título, descrição e contagem total;
2. painel de filtros com rótulos persistentes;
3. resumo removível dos filtros aplicados;
4. retorno da operação ou estado da consulta;
5. tabela em telas amplas ou cartões em telas compactas;
6. paginação fornecida pelo servidor.

## Estados obrigatórios

- **Carregando:** skeleton sem conteúdo fictício anunciado.
- **Vazio:** explica que ainda não existem registros.
- **Sem resultados:** informa que os filtros não encontraram registros e oferece limpeza imediata.
- **Erro:** mensagem segura e botão para tentar novamente.
- **Sucesso de ação:** banner anunciado como `status` e confirmação visual temporária.
- **Erro de ação:** banner anunciado como `alert`, sem expor detalhes internos.

## Ações e diálogos

Toda ação por linha possui um nome acessível com o alvo, como “Desativar conta de Maria”. Diálogos restauram o foco ao elemento que os abriu. Convites, aprovações, rejeições, ativações e desativações descrevem a consequência antes da confirmação; ações destrutivas recebem tratamento de erro, texto explícito e nunca dependem apenas de cor.

## Responsividade e acessibilidade

- breakpoint de troca de tabela para cartões: 52 rem;
- alvo de toque mínimo herdado do Design System: 48 px;
- conteúdo funcional em 320 px e zoom de 200%;
- suporte aos quatro temas, `forced-colors` e redução de movimento;
- cabeçalhos de tabela usam `scope="col"`;
- lista compacta mantém a mesma ordem lógica e as mesmas ações da tabela;
- identificadores técnicos podem ser truncados visualmente, mas permanecem completos no atributo `title` e no DOM;
- os testes E2E executam axe em páginas administrativas desktop e mobile.
