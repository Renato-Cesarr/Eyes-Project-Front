# Checklist de acessibilidade e qualidade visual

Use esta lista em toda revisão de tela. Itens não aplicáveis devem ser marcados e justificados no PR.

## Estrutura e linguagem

- [ ] Existe um único título principal claro.
- [ ] A ordem visual corresponde à ordem de leitura e foco.
- [ ] Textos usam linguagem direta, pt-BR e termos do usuário.
- [ ] Nenhum erro expõe stack trace, token, endpoint ou detalhe interno.
- [ ] Instruções não dependem de posição, cor, forma ou gesto sem alternativa.
- [ ] Conteúdo decorativo está oculto de tecnologias assistivas.

## Contraste e cor

- [ ] Texto normal atinge ao menos 4,5:1; texto principal busca 7:1.
- [ ] Texto grande atinge ao menos 3:1.
- [ ] Foco, ícones essenciais, bordas de campo e estados atingem ao menos 3:1.
- [ ] Estado combina cor com texto, ícone ou forma.
- [ ] Light, dark e dois temas de alto contraste foram revisados.
- [ ] Web permanece utilizável com `forced-colors: active`.

## Texto, zoom e refluxo

- [ ] Web funciona com 200% de zoom sem perda ou rolagem horizontal da página.
- [ ] Mobile funciona com escalas de texto representativas sem corte ou sobreposição.
- [ ] Nenhum contêiner de texto depende de altura fixa.
- [ ] Parágrafos longos respeitam largura de leitura.
- [ ] Rótulos e botões aceitam quebra de linha.

## Teclado e foco — Web

- [ ] Toda ação é operável por teclado.
- [ ] Foco é sempre visível.
- [ ] Ordem de Tab é lógica e não usa índices positivos.
- [ ] Skip link alcança o conteúdo principal.
- [ ] Diálogo contém o foco e o devolve ao acionador.
- [ ] Mudança de rota posiciona foco de forma previsível.
- [ ] Componentes customizados seguem o padrão de teclado do papel adotado.

## TalkBack e Semantics — Mobile

- [ ] Cada ação possui nome curto e inequívoco.
- [ ] Papel, estado, valor e toggle são expostos corretamente.
- [ ] A ordem de exploração acompanha a tarefa.
- [ ] Grupos semânticos evitam leitura fragmentada ou duplicada.
- [ ] Mudanças relevantes são anunciadas uma vez.
- [ ] FPS, latência, threshold e mensagens técnicas não são anunciados.
- [ ] Alvos interativos possuem ao menos 48 × 48 dp.
- [ ] Gestos possuem alternativa por controle acessível.

## Estados, erros e recuperação

- [ ] Loading possui nome acessível e não depende apenas de animação.
- [ ] Vazio e sem resultados são estados diferentes.
- [ ] Erro explica a próxima ação possível.
- [ ] Retry não cria loop, duplicidade ou perda de dados.
- [ ] Permissão negada orienta como continuar ou abrir configurações.
- [ ] Foco permanece no contexto após sucesso ou falha.
- [ ] Operações pendentes impedem envio duplicado.

## Movimento e feedback multimodal

- [ ] `prefers-reduced-motion`/preferência do sistema é respeitada.
- [ ] Nenhuma animação é necessária para entender o estado.
- [ ] Voz não é interrompida por atualizações irrelevantes.
- [ ] Vibração possui intensidade/padrão coerente e não excessivo.
- [ ] Ausência de voz ou vibração tem fallback compreensível.
- [ ] Som e háptica não são disparados durante testes automatizados sem fake.

## Responsividade e ambiente

- [ ] Safe areas e barras do sistema não cobrem ações.
- [ ] Orientação e proporção da câmera estão corretas.
- [ ] Layout compacto mantém todas as ações essenciais.
- [ ] Tabelas possuem alternativa ou rolagem interna nomeada.
- [ ] Teclado virtual não cobre o campo ou a ação de envio.
- [ ] Conteúdo offline não sugere dependência de rede.

## Evidência mínima do PR

- [ ] Capturas dos temas e viewports afetados.
- [ ] Resultado dos testes automatizados e do validador de tokens.
- [ ] Resultado de axe no Web quando aplicável.
- [ ] Resultado de testes de Semantics no Flutter quando aplicável.
- [ ] Registro do teste manual com teclado ou TalkBack.
- [ ] Exceções documentadas com card de correção.
