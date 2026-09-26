# Contratos de componentes

## Regras universais

Todo componente:

- usa tokens semânticos;
- suporta teclado ou tecnologia assistiva equivalente;
- possui nome, papel, estado e valor coerentes;
- mantém alvo de interação de pelo menos 48 × 48 px/dp;
- aceita texto ampliado, tradução e quebra de linha;
- não usa tooltip como única fonte de informação;
- não comunica estado apenas por cor;
- respeita loading e disabled como estados diferentes;
- não dispara duas vezes durante uma operação pendente.

## Botões

### Hierarquia

- **Primário:** uma ação dominante por região ou etapa.
- **Secundário:** alternativa segura ou complementar.
- **Texto:** ação de baixa ênfase.
- **Destrutivo:** somente para consequência irreversível ou de alto impacto; exige linguagem explícita.

### Estados

- `default`: rótulo com verbo de ação;
- `hover`: mudança discreta sem deslocar layout;
- `pressed`: resposta visual e, quando útil no Mobile, háptica;
- `focus`: anel de 3 px com offset de 3 px;
- `loading`: preserva largura, mantém rótulo acessível e bloqueia reenvio;
- `disabled`: só quando a ação é realmente indisponível; a interface explica o motivo perto do controle.

## Campos e formulários

- label visível e persistente;
- instrução antes do erro, quando necessária;
- erro textual associado ao campo;
- formato, obrigatoriedade e restrição não dependem de placeholder;
- validação no momento adequado, sem anunciar erro a cada tecla;
- resumo de erros ou foco no primeiro campo inválido em submissões longas;
- senhas permitem revelar/ocultar sem perder foco;
- autocomplete e tipo de teclado corretos.

## Cards e superfícies

- cards agrupam conteúdo relacionado; não são decoração padrão para toda linha;
- card clicável possui uma única ação principal ou expõe ações internas claramente separadas;
- borda e superfície definem o agrupamento antes de sombra;
- elevação média e overlay ficam restritos a menus, popovers e diálogos;
- conteúdo de leitura nunca usa transparência sobre imagem ou vídeo.

## Navegação

- rota atual é indicada por texto/estado, não só cor;
- mudança de página posiciona foco no título ou contêiner principal;
- Web oferece skip link e landmarks;
- drawer devolve foco ao acionador após fechar;
- botão “voltar” mantém comportamento nativo no Mobile;
- ícones de navegação incluem rótulo visível ou nome acessível inequívoco.

## Diálogos

- título descreve decisão, não apenas “Atenção”;
- consequência e alvo aparecem no corpo;
- foco inicial vai para o título ou ação segura conforme contexto;
- Tab permanece no diálogo no Web;
- fechar restaura foco ao acionador;
- ação destrutiva não recebe foco inicial por padrão;
- falha da operação aparece dentro do diálogo sem fechá-lo.

## Status, badges e feedback

- combinar texto, ícone e cor quando houver espaço;
- nomes preferidos: Pendente, Ativo, Inativo, Aprovado, Rejeitado, Concluído, Falhou;
- sucesso transitório não substitui estado persistente;
- mensagens de erro explicam o que aconteceu e a próxima ação;
- detalhes internos são registrados com segurança, não mostrados ao usuário.

## Loading, vazio e falha

| Estado                | Conteúdo obrigatório                                   |
| --------------------- | ------------------------------------------------------ |
| Loading               | descrição curta do que está sendo preparado            |
| Vazio                 | o que ainda não existe e, se aplicável, como criar     |
| Sem resultados        | filtros ativos e ação para limpar/refinar              |
| Falha recuperável     | mensagem segura + ação “Tentar novamente”              |
| Falha não recuperável | orientação alternativa sem loop de tentativa           |
| Parcial               | conteúdo disponível + indicação discreta do que falhou |

Skeleton é ocultado da árvore semântica; tecnologias assistivas recebem uma única mensagem de carregamento.

## Tabelas e listas administrativas

- tabela é usada quando comparar colunas é essencial;
- cabeçalhos possuem associação correta;
- ordenação anuncia coluna e direção;
- paginação informa página, quantidade e total quando conhecido;
- ações por linha incluem o nome do registro no nome acessível;
- em viewport compacto, usar rolagem interna nomeada ou representação em lista/cartão sem remover dados e ações essenciais;
- seleção em massa só entra no MVP se houver caso de uso real e confirmação apropriada.

## Varredura assistiva

- preview da câmera é a superfície dominante;
- status essencial e controles ficam em overlays sólidos de alto contraste;
- iniciar/pausar, ajuda e configurações permanecem alcançáveis;
- objeto, direção e proximidade formam uma mensagem curta e estabilizada;
- dados técnicos são excluídos da experiência padrão e de `Semantics`;
- voz, vibração e visual compartilham a mesma decisão de prioridade;
- anúncio possui debounce/cooldown e pode ser interrompido por alerta mais urgente;
- permissão negada, modelo indisponível e falha de voz possuem recuperação específica.
