# Eyes Design System

**Versão:** 1.0.0

**Status:** aprovado para implementação

**Fonte da verdade:** `docs/design-system/design-tokens.json`

**Issue:** REN-50

O Eyes Design System define a linguagem visual e os contratos de experiência do painel administrativo Angular e do aplicativo assistivo Flutter. Ele existe para que os dois produtos pareçam parte do mesmo ecossistema sem forçar o compartilhamento de componentes entre tecnologias diferentes.

## 1. Propósito

O Eyes é usado por públicos com necessidades distintas:

- a pessoa cega ou com baixa visão utiliza o aplicativo para perceber objetos e riscos no ambiente;
- a pessoa administradora utiliza o painel para gerenciar contas, solicitações e auditoria.

A marca deve comunicar **segurança, orientação, autonomia e clareza**. Beleza visual é necessária, mas nunca pode competir com entendimento, acessibilidade ou velocidade operacional.

## 2. Princípios obrigatórios

1. **Acessibilidade é arquitetura.** Semantics, foco, contraste, escala de texto e feedback não visual fazem parte do contrato do componente.
2. **O conteúdo vem antes da decoração.** Hierarquia nasce de tipografia, espaço e agrupamento; não de excesso de cards, sombras ou cores.
3. **Uma ação tem um resultado perceptível.** Toda operação informa carregamento, sucesso, erro ou possibilidade de recuperação.
4. **Nenhum significado depende apenas de cor, som, vibração ou animação.** Os canais se complementam e possuem fallback.
5. **Consistência não significa identidade de layout.** Web e Mobile compartilham tokens e intenção, mas respeitam seus padrões nativos.
6. **Privacidade e operação offline permanecem visíveis.** O aplicativo não sugere envio de imagens ou necessidade de conta quando isso não ocorre.
7. **A experiência padrão não expõe detalhes técnicos.** FPS, latência, threshold, stack trace e identificadores internos ficam fora da interface de usuário e da árvore semântica.

## 3. Direção visual

A direção combina:

- **Inclusive Design**, para atender diferenças de visão, movimento, cognição e contexto;
- **Material 3 moderado**, para comportamento previsível e componentes maduros;
- **Minimalismo suíço**, para hierarquia tipográfica, alinhamento e redução de ruído.

### Adotamos

- azul profundo como cor primária de confiança;
- teal como apoio para orientação e estados assistivos;
- superfícies sólidas, bordas claras e elevação discreta;
- tipografia generosa, legível e escalável;
- ícones consistentes acompanhados de rótulo quando a ação não for universal;
- movimento curto e funcional;
- divulgação progressiva para configurações e detalhes avançados.

### Não adotamos

- glassmorphism em superfícies de leitura;
- gradientes atrás de texto;
- animações contínuas ou decorativas essenciais;
- texto com baixo contraste para parecer “sofisticado”;
- emoji como ícone funcional;
- mistura de famílias de ícones;
- tabelas espremidas em telas estreitas;
- interface de varredura estruturada como uma lista extensa de cards.

## 4. Tokens

O arquivo [`design-tokens.json`](./design-tokens.json) é o contrato canônico. Ele contém:

- cores primitivas e semânticas;
- temas claro, escuro, alto contraste claro e alto contraste escuro;
- tipografia, espaçamento, raios, elevação e movimento;
- tamanho mínimo de alvo interativo;
- pares críticos de contraste e limites mensuráveis.

Os produtos devem consumir nomes semânticos como `primary`, `surface` e `onError`. Nomes de cor como `blue600` existem apenas como matéria-prima e não devem aparecer diretamente em features.

Validação local:

```powershell
npm run design-system:validate
```

O comando falha quando um tema obrigatório está incompleto, quando uma cor não segue `#RRGGBB`, quando o alvo mínimo deixa de ser 48 px/dp ou quando um par crítico não atinge o contraste definido.

## 5. Tipografia

| Uso                                  | Família                 | Peso recomendado | Regra                              |
| ------------------------------------ | ----------------------- | ---------------: | ---------------------------------- |
| Marca, títulos e números de destaque | Lexend                  |          500–700 | Não usar em parágrafos longos      |
| Corpo, campos, tabelas e ajuda       | Atkinson Hyperlegible   |          400–700 | Fonte principal de leitura         |
| Identificadores técnicos autorizados | Monoespaçada do sistema |          400–600 | Apenas auditoria e desenvolvimento |

Regras:

- tamanho base de 16 px no Web e escala equivalente no Flutter;
- corpo com altura de linha 1,6;
- comprimento de leitura recomendado de até 68 caracteres;
- não fixar altura em componentes que contêm texto;
- não bloquear zoom do navegador nem limitar o fator de escala do sistema;
- títulos seguem uma hierarquia real, sem pular níveis por aparência.

## 6. Layout responsivo e adaptativo

### Web

- conteúdo operacional limitado a 75 rem;
- margens fluidas entre 16 e 32 px;
- breakpoints orientativos: compacto `< 48rem`, médio `48–74.99rem`, amplo `>= 75rem`;
- o conteúdo define o breakpoint final; nenhum componente pode depender apenas desses valores;
- a 200% de zoom, o fluxo deve refluir sem rolagem horizontal da página;
- tabelas podem rolar dentro de uma região nomeada ou virar lista/cartões quando isso preservar melhor a semântica.

### Mobile

- 16 dp de margem em largura compacta e 24 dp quando houver espaço;
- áreas de toque mínimas de 48 × 48 dp;
- safe areas obrigatórias;
- portrait é a orientação principal da varredura, sem assumir proporção fixa do aparelho;
- texto ampliado pode aumentar a altura, reorganizar ações e produzir rolagem;
- a câmera ocupa a superfície principal da varredura, enquanto controles e estado usam overlays sólidos e seguros.

## 7. Temas e contraste

Há quatro temas de primeira classe: light, dark, high-contrast light e high-contrast dark. Alto contraste não é um filtro aplicado ao final; ele possui tokens próprios e remove elevações ambíguas em favor de bordas explícitas.

- WCAG 2.2 AA é o piso de conformidade;
- texto principal busca contraste de pelo menos 7:1;
- componentes, ícones essenciais e indicadores de foco devem atingir pelo menos 3:1 contra superfícies adjacentes;
- estados sempre combinam cor com texto, forma ou ícone;
- `forced-colors` no Web e os temas de alto contraste do Flutter devem preservar controles nativos.

Os contrastes aprovados estão documentados e executados pelo validador. Novas combinações devem entrar em `contrastPairs` antes de serem usadas.

## 8. Movimento e feedback

- transições comuns: 120–200 ms;
- transições enfatizadas: até 300 ms;
- nenhuma animação decorativa ultrapassa 300 ms ou se repete indefinidamente;
- `prefers-reduced-motion` e a preferência equivalente do Flutter reduzem a duração a zero;
- loading nunca depende apenas de movimento: inclui texto ou nome acessível;
- voz e vibração no Mobile passam por fila, cooldown e prioridade para não se sobreporem.

## 9. Estados obrigatórios

Todo componente interativo define, quando aplicável:

- default;
- hover no Web;
- pressed;
- focused;
- selected/toggled;
- disabled;
- loading;
- success;
- warning;
- error.

Toda página que depende de dados define:

- carregando;
- conteúdo disponível;
- vazio;
- sem resultados após filtro;
- falha recuperável;
- falha sem recuperação local;
- sucesso de uma ação.

Os contratos detalhados estão em [`component-contracts.md`](./component-contracts.md).

## 10. Implementação por plataforma

O mapeamento oficial está em [`platform-mapping.md`](./platform-mapping.md).

- **Angular:** Angular Material 3 + CSS Custom Properties; nenhum framework CSS ou kit visual paralelo.
- **Flutter:** Material 3 + `ColorScheme` + `ThemeExtension`; nenhum pacote de componentes paralelo.
- **Estado e domínio:** tokens visuais não alteram regras de negócio, contratos HTTP, Riverpod, gateways ou entidades.

## 11. Fontes, ícones e ativos

A política completa está em [`assets-and-licenses.md`](./assets-and-licenses.md). Em resumo:

- fontes são empacotadas localmente para não criar dependência de rede;
- cada arquivo é acompanhado por sua licença e origem;
- Material Symbols/Icons é a família funcional única;
- o símbolo de olho da marca é um ativo próprio, com versões monocromáticas;
- SVGs e imagens decorativas são ocultados de tecnologias assistivas.

## 12. Inventário e migração

[`screen-inventory.md`](./screen-inventory.md) registra as rotas reais encontradas no código, os estados críticos e o card responsável por cada migração. Esse inventário prevalece sobre listas antigas da documentação acadêmica quando houver divergência de estado implementado.

## 13. Checklist de entrega

Nenhuma tela é considerada pronta somente por parecer correta. A revisão obrigatória está em [`accessibility-checklist.md`](./accessibility-checklist.md) e cobre:

- teclado e foco;
- TalkBack e Semantics;
- contraste e alto contraste;
- escala de texto e zoom;
- movimento reduzido;
- estados e recuperação;
- privacidade e linguagem;
- voz e vibração;
- responsividade e safe areas.

## 14. Governança

1. Mudanças de token começam no JSON canônico.
2. O versionamento segue SemVer: correção compatível, adição compatível e quebra de contrato.
3. Toda mudança explica impacto no Angular e no Flutter.
4. Alterações visuais incluem evidência nos temas e escalas afetados.
5. Mudança de snapshot nunca é aceita automaticamente.
6. Exceções temporárias têm card, responsável e condição de remoção.
7. O validador do Design System e os testes das aplicações devem passar antes do merge.

## 15. Documentos relacionados

- [`platform-mapping.md`](./platform-mapping.md)
- [`component-contracts.md`](./component-contracts.md)
- [`accessibility-checklist.md`](./accessibility-checklist.md)
- [`screen-inventory.md`](./screen-inventory.md)
- [`assets-and-licenses.md`](./assets-and-licenses.md)
- [`../adr/0001-cross-platform-design-system.md`](../adr/0001-cross-platform-design-system.md)
