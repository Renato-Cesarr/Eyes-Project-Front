# REN-66 — Fluxos públicos e gestão administrativa

## Fonte e versão

Extensão da direção v1 aprovada em REN-65 e implementada em REN-59. Base:
`origin/dev` em `f3aab1e0f1c8849e123edd173d574dec221ad9c7`, após integração pelo
responsável dos PRs #18, #19 e #20. Trabalho na branch
`feat/REN-66-complete-admin-composition`.

## Composição aplicada

- Solicitar acesso, recuperar acesso, ativar conta, redefinir senha e acesso
  restrito usam a grade e o formulário da direção aprovada. Introduções curtas,
  controles de visibilidade com ícones, nomes acessíveis e estado pressionado.
- A confirmação de recebimento da solicitação mostra a mensagem da API;
  HTTP 202 não implica aprovação da conta nem envio imediato de e-mail.
- Redefinição oferece um caminho para pedir outro link mesmo quando a API
  rejeita um token. Ativação mantém orientação para solicitar novo convite à
  administração e saída para o login. Token ausente/rejeitado tem uma única
  mensagem de recuperação, sem duplicar banner e painel. Sucesso continua condicionado ao HTTP.
- Usuários e solicitações têm cabeçalho único. Filtros nativos expansíveis
  retiram controles secundários do primeiro viewport. Filtros aplicados
  continuam visíveis quando o painel está fechado.
- Nome e e-mail são apresentados juntos na tabela; o motivo completo da
  solicitação fica nos detalhes e na lista compacta. Nenhum dado é inventado
  nem enriquecido por consultas adicionais por linha.
- Listas compactas usam uma superfície com separadores, sem cartão dentro de
  cartão. Status por texto, paginação, detalhes, convites e confirmações de
  aprovar/rejeitar/ativar/desativar permanecem disponíveis.

## Correções de reflow encontradas na revisão

Em 320 px e texto a 200%, títulos com palavras longas e grades com largura
mínima intrínseca causavam rolagem horizontal em recuperação e acesso restrito.
Títulos agora podem quebrar; grades de formulário e recuperação usam
`minmax(0, 1fr)`. A matriz também encontrou a legenda de “Convidar usuário” fora
do fundo do botão com texto ampliado. Botões das duas listas crescem em altura
e permitem quebra de linha, mantendo os alvos de toque.
Em telas estreitas, mensagens preservam o texto e dispensam o marcador
decorativo, que consumia espaço do conteúdo com escala ampliada.

Não foram alterados os tokens de tema, limiares de contraste, tolerância visual,
contratos da API, dependências ou lógica de autenticação e administração.

## Validação e evidência

Head de implementação `47ddf5303c577f370af96bc9bce6de2b1663eb20`,
[PR draft #21](https://github.com/Renato-Cesarr/Eyes-Project-Front/pull/21).
No Windows, 170 testes unitários e 99 E2E passaram na fonte final. A suíte E2E
inclui 21 verificações visuais. Build: 380,30 kB inicial / 103,53 kB de
transferência estimada, dentro do orçamento de 500 kB. Tokens: quatro temas e
16 pares de contraste aprovados. Não é um benchmark de latência.

As onze referências afetadas/adicionadas de cada plataforma foram inspecionadas
individualmente. Linux foi capturado pelo CI 37242796536 na implementação acima;
a execução passou os 170 unitários com cobertura e 88 E2E, falhando apenas nas
dez referências novas ainda ausentes e na referência de usuários alterada.
`remaining-composition-linux.json` registra origem, bytes e SHA-256 dos onze
PNGs. As três capturas da referência existente alterada têm hashes idênticos.
Resultado da repetição final do CI será registrado no PR e no checkpoint vivo.
Revisão do responsável ainda pendente.

- `e2e/remaining-composition.spec.ts`: nove rotas/estados, quatro temas,
  larguras 320/390/1440 e texto 100/200%: 216 combinações; usuários/solicitações
  também são conferidos com filtros abertos. Teclado, axe, reflow e acesso à ação.
- Estados: loading, vazio, busca sem resultados, falha de listagem e tentativa
  novamente, token ausente/rejeitado, sucesso HTTP 204 e visibilidade de senha.
- `e2e/admin-decisions.spec.ts`: cancelar e confirmar rejeição/desativação,
  justificativa obrigatória, foco restaurado e paginação com busca preservada.
- Dez referências adicionais em `visual-regression.spec.ts`, além das onze
  existentes. Windows e Linux possuem arquivos próprios; nunca copiar a
  renderização Windows para os baselines Linux. A tolerância continua em 1%.
- Fixtures usam domínios `.test`. Capturas não representam dados de produção.

O teste de escala modifica o `font-size` da raiz. Não é medição de zoom nativo,
leitor de tela real ou desempenho em hardware. Revisão visual do responsável
e prova web/API/e-mail real seguem como aceites distintos (REN-66 e REN-73).

## Reprodução

Com a toolchain fixada pelo repositório:

```text
npm run design-system:validate
npm run build
npm run test -- --watch=false --browsers=chromium --coverage=false
npm run e2e -- --workers=2 --reporter=list
```

O CI usa `npm ci` e `npm run test:ci` com cobertura. O ambiente local reutiliza
dependências da mesma versão por uma junction; a prova de cobertura em instalação
limpa é o CI. Aprovação de screenshots exige inspeção e registro da origem.

## Continuidade

Registrar head/PR/CI, hashes dos baselines e resultados finais. Manter REN-66
Em testes até revisão da implementação. A próxima extensão da direção é
REN-67 no mobile; REN-63 continua tratando o New Code da dev mobile. Não declarar
o produto finalizado enquanto os aceites físicos, científicos e de integração
do plano estiverem pendentes.
