# Fontes, ícones e ativos

## Política

O produto não depende de CDN para renderizar sua identidade. Fontes e ativos necessários são empacotados nos builds Web e Mobile, com licença e origem preservadas no repositório que contém o arquivo.

## Tipografia aprovada

### Lexend

- uso: marca, títulos, números de destaque e ações curtas;
- licença prevista: SIL Open Font License 1.1;
- pesos necessários para o MVP: 500, 600 e 700;
- não baixar arquivos em tempo de execução.
- distribuição Web: `@fontsource/lexend` 5.3.0, empacotada pelo build Angular;
- origem da distribuição: <https://github.com/fontsource/font-files>;
- data de verificação: 2026-09-26.

### Atkinson Hyperlegible

- uso: corpo, formulários, tabelas, configurações e ajuda;
- licença prevista: SIL Open Font License 1.1;
- pesos necessários para o MVP: 400, 500 e 700;
- não baixar arquivos em tempo de execução.
- distribuição Web: `@fontsource/atkinson-hyperlegible` 5.3.0, empacotada pelo build Angular;
- origem da distribuição: <https://github.com/fontsource/font-files>;
- data de verificação: 2026-09-26.

A família original distribui pesos 400 e 700. O peso semântico 500 usa o arquivo
400 com síntese controlada do navegador; não existe download adicional nem troca
silenciosa de família.

Antes de incorporar os binários, a implementação deve verificar a distribuição escolhida, guardar o arquivo de licença correspondente e registrar URL, versão e data de obtenção. O nome da licença neste documento não substitui a licença que acompanha cada arquivo.

## Estratégia Web

- empacotar WOFF2 no build por dependências Fontsource fixadas no lockfile;
- declarar `@font-face` com `font-display: swap`;
- evitar formatos não usados pelo navegador-alvo;
- manter fallback `Arial, sans-serif`;
- não importar Google Fonts por URL.

Os pacotes Fontsource mantêm os arquivos WOFF2, metadados e a licença OFL no
artefato instalado. A versão é exata para que o conteúdo do bundle permaneça
reproduzível. A aplicação importa somente os pesos utilizados e nunca consulta
o serviço Google Fonts durante a execução.

## Estratégia Flutter

- armazenar arquivos em `assets/fonts`;
- declarar famílias e pesos no `pubspec.yaml`;
- manter fallback da plataforma para ausência excepcional;
- incluir licenças em `assets/licenses` e nos avisos legais do aplicativo.

## Ícones

- família funcional única: Material Symbols/Material Icons;
- licença esperada da distribuição oficial: Apache License 2.0;
- Angular empacota somente subconjunto utilizado quando tecnicamente viável;
- Flutter utiliza a fonte Material já incluída pelo SDK;
- ícone sem texto visível recebe nome acessível;
- ícone junto de texto equivalente é decorativo;
- emoji não substitui ícone funcional.

### Distribuição Web

- pacote: `material-symbols` 0.47.5, variante Rounded;
- licença: Apache License 2.0 incluída na distribuição;
- origem: <https://github.com/marella/material-symbols>;
- data de verificação: 2026-09-26;
- uso: por meio de `eyes-icon`, sem consulta a CDN.

## Marca Eyes

O símbolo de olho é o único ícone próprio da identidade. Devem existir:

- versão colorida sobre fundo claro;
- versão colorida sobre fundo escuro;
- versão monocromática clara;
- versão monocromática escura;
- favicon e ícone do aplicativo derivados do mesmo desenho.

O ativo não deve conter texto rasterizado. Sua alternativa textual é “Eyes” quando a marca precisar ser anunciada; em cabeçalhos que já exibem o nome, o símbolo é decorativo.

## Imagens e ilustrações

- utilizar apenas quando explicam tarefa, segurança ou permissão;
- registrar origem, autoria e licença;
- não usar imagem genérica como substituto de conteúdo;
- nunca colocar texto essencial dentro da imagem;
- não colocar texto diretamente sobre fotografia ou preview da câmera;
- remover metadados desnecessários antes de versionar.
