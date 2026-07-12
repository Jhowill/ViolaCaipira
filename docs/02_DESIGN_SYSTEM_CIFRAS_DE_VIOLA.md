# 02 — Design System

## 1. Identificação

### Produto

**Cifras de Viola — Acordes, Afinações e Batidas**

### Documento

`docs/02_DESIGN_SYSTEM.md`

### Versão

`1.0.0`

### Status

Base visual aprovada para criação do fluxo, das imagens de referência e das Screen Specs.

### Dependências documentais

Este Design System deve respeitar:

1. `PROJECT_GUIDE.md`;
2. `docs/01_APP_BLUEPRINT.md`;
3. futuras Screen Specs;
4. imagens de referência aprovadas.

Em caso de conflito:

```txt
PROJECT_GUIDE.md
    ↓
SCREEN_SPECS.md
    ↓
DESIGN_SYSTEM.md
    ↓
imagem de referência
    ↓
conversa solta
```

---

# 2. Objetivo do Design System

Este documento define a linguagem visual, os tokens, os componentes e as regras de interface do aplicativo.

Ele deve garantir:

- coerência entre todas as telas;
- legibilidade durante estudo e apresentações;
- identidade própria;
- boa adaptação a Android, iOS e tablets;
- suporte completo a tema claro e escuro;
- implementação viável em React Native;
- redução de componentes duplicados;
- acessibilidade;
- comportamento consistente em modo offline;
- clareza entre conteúdo oficial, calculado e criado pelo usuário.

O Design System não deve transformar o aplicativo em uma representação caricata do ambiente rural.

A interface deverá comunicar:

> tradição brasileira, conhecimento musical, madeira trabalhada, precisão, confiança e simplicidade.

---

# 3. Conceito visual

## 3.1 Nome da direção

**Artesanato brasileiro com precisão musical**

## 3.2 Ideia central

A aparência deve combinar dois universos:

### Tradição

Representada por:

- madeira escura;
- couro;
- cobre;
- palha;
- recortes discretos inspirados em marchetaria;
- curvas do corpo da viola;
- marcas de entalhe;
- referências à cultura caipira sem estereótipos.

### Precisão

Representada por:

- grades alinhadas;
- diagramas técnicos;
- tipografia clara;
- alto contraste;
- controles objetivos;
- hierarquia visual;
- estados bem definidos;
- indicadores de afinação;
- componentes musicais consistentes.

A proporção recomendada é:

```txt
80% interface limpa e funcional
20% identidade artesanal
```

---

# 4. Personalidade da marca

## 4.1 Palavras principais

- autêntica;
- confiável;
- brasileira;
- técnica;
- acolhedora;
- sóbria;
- musical;
- artesanal;
- organizada;
- acessível.

## 4.2 O que a marca não deve ser

- caricata;
- infantil;
- excessivamente rústica;
- visualmente pesada;
- semelhante a aplicativo de violão genérico;
- baseada em clichês de fazenda;
- saturada de texturas;
- cheia de ornamentos;
- excessivamente luxuosa;
- fria como software industrial.

## 4.3 Tom visual

A marca deve parecer desenvolvida para músicos reais.

Ela não deve parecer:

- um jogo;
- uma apostila digitalizada;
- uma página antiga da internet;
- um aplicativo genérico com ícones de banco;
- um catálogo de letras sem identidade.

---

# 5. Princípios visuais obrigatórios

## 5.1 A afinação é parte da interface

A afinação ativa deve ser identificável nas áreas em que interfere no conteúdo.

Usar um componente consistente:

```txt
Afinação: Cebolão em Ré
```

Não repetir o mesmo componente mais de uma vez na mesma tela.

## 5.2 Conteúdo musical antes de decoração

Diagramas, cifras e controles devem receber mais espaço visual que ilustrações e texturas.

## 5.3 Madeira como detalhe, não como fundo textual

Texturas de madeira podem aparecer:

- na splash;
- em ilustração;
- no cabeçalho de uma tela especial;
- em pequenas faixas decorativas;
- no ícone do app.

Não usar textura de madeira:

- atrás de cifras;
- atrás de textos longos;
- no fundo integral de todas as telas;
- dentro de inputs;
- atrás de diagramas.

## 5.4 Uma ação principal por tela

Cada tela deve possuir:

- um CTA principal;
- no máximo duas ações secundárias relevantes;
- ações de menor prioridade em menu contextual.

## 5.5 Instrumento real, interface moderna

O aplicativo pode utilizar imagens ou ilustrações de viola, mas os controles devem continuar modernos, limpos e previsíveis.

## 5.6 Estados não dependem apenas de cor

Exemplos:

- acorde verificado: selo + texto + cor;
- corda afinada: ícone + texto + cor;
- erro: ícone + mensagem + cor;
- premium: cadeado + texto + cor.

---

# 6. Identidade da marca

## 6.1 Nome exibido

### Forma completa

**Cifras de Viola**

### Assinatura

**Acordes, afinações e batidas**

### Forma curta para elementos compactos

**Viola**

## 6.2 Símbolo recomendado

O símbolo deve unir:

- a silhueta simplificada de uma viola;
- cinco pares de cordas;
- uma forma de palheta ou escudo;
- a letra `V`, opcionalmente;
- uma referência sutil a uma roseta.

### Direção recomendada

Um escudo de cantos suaves contendo:

- braço de viola em diagonal;
- cinco linhas ou pares;
- pequena roseta circular;
- recorte em cobre sobre fundo verde profundo.

### Restrições

Não utilizar:

- fotografia completa no ícone;
- texto pequeno;
- dez cordas excessivamente detalhadas;
- paisagem rural;
- chapéu;
- cavalo;
- notas musicais genéricas como elemento principal;
- degradês neon;
- molduras finas demais.

## 6.3 Logotipo tipográfico

Recomendação:

- nome em serifada de personalidade;
- assinatura em sans-serif;
- peso médio;
- alinhamento horizontal ou empilhado;
- boa leitura em tamanho reduzido.

## 6.4 Uso do símbolo

Pode aparecer em:

- ícone;
- splash;
- onboarding;
- tela Sobre;
- cabeçalho institucional;
- marca d’água muito discreta em estados vazios.

Não repetir o logotipo em todas as telas.

---

# 7. Sistema de cores

## 7.1 Estratégia

A paleta é formada por:

- verde profundo para confiança e identidade;
- cobre para calor e ação secundária;
- tons de papel e palha para fundos claros;
- carvão esverdeado para o modo escuro;
- cores semânticas independentes.

O verde será a cor primária.

O cobre será usado como acento e elemento de identidade, não como cor principal de textos pequenos.

---

## 7.2 Cores de marca

| Token | Hex | Uso |
|---|---:|---|
| `brand.green.900` | `#123B2D` | fundos fortes e marca |
| `brand.green.800` | `#174936` | estados pressionados |
| `brand.green.700` | `#1F5A45` | primária principal |
| `brand.green.600` | `#2B6D55` | hover web/foco visual |
| `brand.green.500` | `#3C8067` | elementos de apoio |
| `brand.green.300` | `#79B99C` | primária no tema escuro |
| `brand.green.100` | `#DCEDE4` | fundos suaves |
| `brand.copper.800` | `#7A3812` | cobre escuro |
| `brand.copper.700` | `#8F4515` | ação com texto branco |
| `brand.copper.600` | `#A9581E` | acento principal |
| `brand.copper.500` | `#B96A2B` | ilustrações e detalhes |
| `brand.copper.300` | `#D39B62` | acento no tema escuro |
| `brand.copper.100` | `#F3E1CE` | fundo suave |
| `brand.straw.500` | `#D8B56A` | detalhe palha |
| `brand.straw.200` | `#EEDFB7` | destaque suave |
| `brand.wood.800` | `#4A2D20` | madeira escura |
| `brand.wood.600` | `#704633` | ilustração |
| `brand.wood.300` | `#B88B70` | madeira clara |

---

## 7.3 Tema claro

| Token semântico | Hex | Uso |
|---|---:|---|
| `background` | `#F7F3EA` | fundo geral |
| `backgroundSubtle` | `#F1EBDD` | áreas secundárias |
| `surface` | `#FFFFFF` | cards e modais |
| `surfaceRaised` | `#FFFCF7` | cards elevados |
| `surfaceMuted` | `#EFE7D8` | chips e áreas discretas |
| `surfaceStrong` | `#E4DAC7` | divisões fortes |
| `textPrimary` | `#1F241F` | texto principal |
| `textSecondary` | `#4E5851` | texto secundário |
| `textMuted` | `#68706A` | legendas |
| `textDisabled` | `#929993` | conteúdo desativado |
| `textInverse` | `#FFFFFF` | texto sobre fundo forte |
| `primary` | `#1F5A45` | CTA principal |
| `primaryPressed` | `#174936` | estado pressionado |
| `primarySoft` | `#DCEDE4` | fundo de seleção |
| `onPrimary` | `#FFFFFF` | texto do CTA |
| `accent` | `#A9581E` | detalhes e ações especiais |
| `accentPressed` | `#8F4515` | acento pressionado |
| `accentSoft` | `#F3E1CE` | fundo de acento |
| `border` | `#D7CCB8` | borda padrão |
| `borderStrong` | `#B9AB94` | borda enfatizada |
| `divider` | `#E3DACB` | divisores |
| `overlay` | `rgba(18, 25, 20, 0.52)` | fundo de modal |
| `focusRing` | `#2B6D55` | foco acessível |

---

## 7.4 Tema escuro

| Token semântico | Hex | Uso |
|---|---:|---|
| `background` | `#111511` | fundo geral |
| `backgroundSubtle` | `#151B16` | áreas secundárias |
| `surface` | `#1B221C` | cards e modais |
| `surfaceRaised` | `#222B23` | cards elevados |
| `surfaceMuted` | `#283229` | chips e áreas discretas |
| `surfaceStrong` | `#323D33` | divisões fortes |
| `textPrimary` | `#F2F5F1` | texto principal |
| `textSecondary` | `#CBD3CC` | texto secundário |
| `textMuted` | `#AEB8B0` | legendas |
| `textDisabled` | `#727D74` | conteúdo desativado |
| `textInverse` | `#111511` | texto sobre superfície clara |
| `primary` | `#79B99C` | CTA principal |
| `primaryPressed` | `#5E9E81` | estado pressionado |
| `primarySoft` | `#233B30` | fundo de seleção |
| `onPrimary` | `#111511` | texto do CTA |
| `accent` | `#D39B62` | detalhes e ações especiais |
| `accentPressed` | `#B97E47` | acento pressionado |
| `accentSoft` | `#422C1F` | fundo de acento |
| `border` | `#3B473D` | borda padrão |
| `borderStrong` | `#566359` | borda enfatizada |
| `divider` | `#303A31` | divisores |
| `overlay` | `rgba(0, 0, 0, 0.68)` | fundo de modal |
| `focusRing` | `#9BCFB7` | foco acessível |

---

## 7.5 Cores semânticas

### Tema claro

| Token | Hex | Fundo suave |
|---|---:|---:|
| `success` | `#2F704E` | `#DDEDE4` |
| `warning` | `#9A5A12` | `#F7E8CE` |
| `danger` | `#A43A3A` | `#F5DEDE` |
| `info` | `#356C8C` | `#DDEAF1` |
| `verified` | `#2F704E` | `#DDEDE4` |
| `calculated` | `#8A6417` | `#F5E9C9` |
| `userContent` | `#6B568F` | `#EAE3F3` |
| `premium` | `#865A13` | `#F2E5C8` |

### Tema escuro

| Token | Hex | Fundo suave |
|---|---:|---:|
| `success` | `#7DC69D` | `#1E3829` |
| `warning` | `#E0AE61` | `#3A2D1D` |
| `danger` | `#E58989` | `#3B2222` |
| `info` | `#80B8D3` | `#1C303B` |
| `verified` | `#7DC69D` | `#1E3829` |
| `calculated` | `#E0C06A` | `#38321E` |
| `userContent` | `#BBA2DF` | `#30263E` |
| `premium` | `#E3BC70` | `#3B301E` |

---

## 7.6 Regras de contraste

- textos normais devem atingir contraste mínimo de `4.5:1`;
- textos grandes podem usar mínimo de `3:1`;
- ícones essenciais devem atingir `3:1`;
- placeholders não podem ser mais importantes que labels;
- cobre claro não deve receber texto branco pequeno;
- `primary` claro usa texto branco;
- `primary` escuro usa texto quase preto;
- cor nunca é o único indicador de estado;
- texturas não podem reduzir o contraste;
- cifras no modo palco devem usar contraste máximo.

---

## 7.7 Uso das cores por prioridade

### Verde

Usar para:

- CTA principal;
- item selecionado;
- afinação ativa;
- progresso correto;
- corda afinada;
- navegação ativa;
- confirmação.

### Cobre

Usar para:

- detalhes de marca;
- transposição;
- destaques editoriais;
- elementos especiais;
- ícones decorativos;
- ação de áudio, quando não for CTA principal.

### Palha

Usar para:

- fundos suaves;
- destaque de informação;
- painéis educacionais;
- seções de conteúdo.

### Vermelho

Usar apenas para:

- erro;
- exclusão;
- tensão de corda perigosa;
- nota muito acima do alvo.

Não usar vermelho para item simplesmente desmarcado.

---

# 8. Tipografia

## 8.1 Estratégia tipográfica

O sistema utiliza duas famílias:

### Interface e leitura

**Inter**

Uso:

- botões;
- navegação;
- textos;
- cifras;
- labels;
- formulários;
- números;
- configurações.

### Títulos editoriais e identidade

**Bitter**

Uso:

- onboarding;
- cabeçalhos especiais;
- títulos de módulo;
- nome do app;
- capas de conteúdo;
- chamadas institucionais.

## 8.2 Fallback

Caso as fontes não estejam carregadas:

```txt
Inter → system-ui / San Francisco / Roboto
Bitter → Georgia / serif
```

## 8.3 Regra de performance

As fontes devem ser embarcadas no aplicativo.

Não depender de download durante a execução.

## 8.4 Escala tipográfica

| Token | Fonte | Peso | Tamanho | Linha | Uso |
|---|---|---:|---:|---:|---|
| `displayLarge` | Bitter | 700 | 40 | 48 | onboarding e institucional |
| `displayMedium` | Bitter | 700 | 34 | 42 | títulos principais especiais |
| `headlineLarge` | Bitter | 700 | 30 | 38 | título de módulo |
| `headlineMedium` | Bitter | 600 | 26 | 34 | título de tela |
| `headlineSmall` | Inter | 700 | 22 | 29 | seção forte |
| `titleLarge` | Inter | 700 | 20 | 27 | cards principais |
| `titleMedium` | Inter | 600 | 18 | 25 | cards e listas |
| `titleSmall` | Inter | 600 | 16 | 22 | subtítulos |
| `bodyLarge` | Inter | 400 | 17 | 26 | cifras e leitura |
| `bodyMedium` | Inter | 400 | 15 | 23 | texto padrão |
| `bodySmall` | Inter | 400 | 14 | 20 | apoio |
| `labelLarge` | Inter | 600 | 15 | 20 | botões |
| `labelMedium` | Inter | 600 | 13 | 18 | chips |
| `labelSmall` | Inter | 600 | 12 | 16 | tags |
| `caption` | Inter | 400 | 12 | 17 | metadados |
| `micro` | Inter | 600 | 10 | 14 | uso excepcional |

## 8.5 Tipografia musical

### Símbolo do acorde

- fonte: Inter;
- peso: 700;
- tamanho padrão: 24;
- detalhe do acorde: 32;
- modo palco: 22 a 34, conforme escala;
- alinhamento tabular quando possível.

### Nota do afinador

- peso: 700;
- tamanho: 56 a 72;
- números de frequência: `fontVariant: ['tabular-nums']`;
- cents: `tabular-nums`.

### BPM

- peso: 700;
- tamanho: 44;
- dígitos tabulares.

### Texto da cifra

- padrão: 17/28;
- pequeno: 15/25;
- grande: 20/32;
- extra grande no palco: 24/38.

## 8.6 Regras tipográficas

- não usar Bitter em textos longos;
- não usar mais de três pesos em uma tela;
- evitar caixa alta em frases;
- caixa alta somente em microtags e siglas;
- cifras devem manter alinhamento e espaçamento;
- não reduzir textos essenciais abaixo de 12 px;
- respeitar o tamanho de fonte do sistema;
- truncar títulos apenas quando houver alternativa de abertura completa;
- não usar texto centralizado em parágrafos longos.

---

# 9. Espaçamento

## 9.1 Grade base

Usar grade de `4 px`.

## 9.2 Tokens

| Token | Valor |
|---|---:|
| `space.0` | 0 |
| `space.1` | 4 |
| `space.2` | 8 |
| `space.3` | 12 |
| `space.4` | 16 |
| `space.5` | 20 |
| `space.6` | 24 |
| `space.7` | 28 |
| `space.8` | 32 |
| `space.10` | 40 |
| `space.12` | 48 |
| `space.16` | 64 |
| `space.20` | 80 |

## 9.3 Uso recomendado

- margem horizontal celular: `16`;
- celular amplo: `20`;
- tablet: `24` a `32`;
- espaço entre título e conteúdo: `16`;
- espaço entre seções: `28` ou `32`;
- padding de card padrão: `16`;
- padding de card grande: `20`;
- distância entre linhas de lista: `12`;
- distância entre ícone e texto: `8`;
- distância mínima entre CTAs: `12`.

## 9.4 Regras

- não usar valores aleatórios;
- evitar margens inferiores no último item quando o container já cria espaço;
- bottom tab deve considerar safe area;
- modo palco deve permitir margem lateral reduzida, mas segura;
- diagramas devem preservar área para labels.

---

# 10. Raios de borda

| Token | Valor | Uso |
|---|---:|---|
| `radius.xs` | 6 | tags compactas |
| `radius.sm` | 10 | inputs e chips |
| `radius.md` | 14 | botões e cards pequenos |
| `radius.lg` | 18 | cards principais |
| `radius.xl` | 24 | modais e painéis |
| `radius.full` | 999 | pills e botões circulares |

## Regras

- card padrão: `18`;
- botão primário: `14`;
- input: `12`;
- bottom sheet: `24` nos cantos superiores;
- não misturar muitos raios na mesma tela;
- diagramas podem usar borda `14`;
- modal central pode usar `20` ou `24`.

---

# 11. Bordas

## 11.1 Espessuras

| Token | Valor |
|---|---:|
| `border.hairline` | `StyleSheet.hairlineWidth` |
| `border.thin` | 1 |
| `border.medium` | 1.5 |
| `border.strong` | 2 |

## 11.2 Uso

- cards comuns: 1 px;
- estado selecionado: 2 px;
- foco acessível: 2 px;
- diagramas: 1.5 px;
- pestana: 3 a 4 px;
- corda no afinador: 2 px;
- divisores: hairline ou 1 px.

---

# 12. Sombras e elevação

## 12.1 Princípio

A interface deve usar sombras discretas.

A separação principal deve vir de:

- contraste de superfície;
- borda;
- espaçamento;
- elevação moderada.

## 12.2 Níveis

### Elevação 0

- sem sombra;
- listas;
- elementos integrados ao fundo.

### Elevação 1

- cards padrão;
- sombra suave;
- Android elevation 1 ou 2.

### Elevação 2

- card interativo destacado;
- barra flutuante;
- Android elevation 3.

### Elevação 3

- modal;
- bottom sheet;
- menu;
- Android elevation 6.

## 12.3 Tema escuro

No modo escuro:

- reduzir dependência de sombra;
- usar bordas e superfícies diferentes;
- não usar sombra clara;
- manter profundidade por contraste.

---

# 13. Ícones

## 13.1 Estilo

- linha arredondada;
- espessura uniforme;
- aparência técnica;
- cantos suaves;
- sem preenchimento excessivo;
- consistência entre plataformas.

## 13.2 Biblioteca recomendada

Uma única biblioteca principal.

Exemplo:

- Lucide React Native;
- Material Symbols, se adotada integralmente.

Não misturar quatro famílias de ícones.

## 13.3 Tamanhos

| Uso | Tamanho |
|---|---:|
| inline | 16 |
| chip | 16 |
| botão pequeno | 18 |
| navegação | 22 a 24 |
| botão padrão | 20 |
| card | 24 |
| ação principal circular | 28 |
| estado vazio | 40 a 56 |

## 13.4 Ícones de domínio

O app precisará de ícones consistentes para:

- viola;
- afinação;
- cordas;
- acorde;
- cifra;
- ritmo;
- batida;
- metrônomo;
- microfone;
- capotraste;
- pestana;
- favoritos;
- verificado;
- calculado;
- conteúdo próprio;
- palco;
- rolagem;
- transposição.

Ícones musicais específicos podem ser criados em SVG próprio.

## 13.5 Regras

- toda ação por ícone deve possuir `accessibilityLabel`;
- ícones sem texto devem ter tooltip em tablet quando apropriado;
- ícone não substitui label em ações complexas;
- excluir sempre deve mostrar texto em confirmação;
- não usar emoji como ícone da interface.

---

# 14. Layout

## 14.1 Mobile first

O design deve ser criado primeiro para:

```txt
360 × 800 dp
```

Também testar:

- 320 × 568 dp;
- 390 × 844 dp;
- 412 × 915 dp;
- tablets;
- orientação paisagem no modo palco.

## 14.2 Largura de conteúdo

### Celular

- largura total;
- margem lateral de 16 ou 20;
- cards em uma coluna.

### Tablet

- largura máxima de leitura: 720;
- listas podem usar duas colunas;
- tela de cifra pode usar painel lateral;
- acordes podem usar grid;
- conteúdo centralizado;
- margens maiores.

## 14.3 Breakpoints conceituais

| Faixa | Tratamento |
|---|---|
| `< 360` | compacto |
| `360–599` | celular padrão |
| `600–839` | tablet pequeno |
| `>= 840` | tablet amplo |

Não depender apenas da largura física.

Considerar:

- orientação;
- font scale;
- safe area;
- teclado;
- modo palco.

## 14.4 Colunas

### Celular

- 4 colunas conceituais;
- gutter 16.

### Tablet

- 8 ou 12 colunas;
- gutter 20 a 24.

---

# 15. Safe area e barras do sistema

- usar `SafeAreaView` ou estratégia equivalente;
- cabeçalhos devem respeitar notch e Dynamic Island;
- bottom tab deve respeitar indicador de gesto;
- evitar botões colados às bordas;
- modo palco pode ocultar barras, mas deve oferecer saída clara;
- Android deve respeitar navigation bar;
- usar edge-to-edge com contraste controlado.

---

# 16. Componentes globais

## 16.1 `ScreenContainer`

### Objetivo

Padronizar fundo, safe area, rolagem e espaçamento.

### Variantes

- `scroll`;
- `fixed`;
- `stage`;
- `form`;
- `centered`.

### Props conceituais

```ts
type ScreenContainerProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  maxWidth?: number;
  keyboardAvoiding?: boolean;
  background?: 'default' | 'subtle' | 'surface';
};
```

### Regras

- não duplicar `SafeAreaView` dentro da mesma árvore;
- respeitar bottom tab;
- permitir conteúdo em tablet;
- não aplicar padding duplo.

---

## 16.2 `AppHeader`

### Variantes

- padrão;
- compacto;
- transparente;
- modo palco;
- com busca.

### Conteúdo possível

- voltar;
- título;
- subtítulo;
- ação principal;
- menu;
- afinação ativa, quando necessária.

### Regras

- título máximo de duas linhas;
- não mostrar logotipo junto do título em telas internas;
- uma ação principal à direita;
- ações adicionais em menu;
- altura mínima de 56.

---

## 16.3 `AppButton`

### Variantes

- `primary`;
- `secondary`;
- `tertiary`;
- `destructive`;
- `icon`;
- `floating`.

### Tamanhos

| Tamanho | Altura |
|---|---:|
| `sm` | 40 |
| `md` | 48 |
| `lg` | 56 |

### Estados

- padrão;
- pressionado;
- focado;
- desativado;
- carregando;
- sucesso temporário.

### Regras

- CTA principal usa largura total em formulários;
- texto objetivo;
- não usar mais de um botão primário lado a lado em celular;
- loading preserva a largura;
- alvo de toque mínimo 44 × 44;
- ícone à esquerda, salvo ações direcionais.

---

## 16.4 `AppCard`

### Variantes

- padrão;
- interativo;
- selecionado;
- informativo;
- alerta;
- premium;
- música;
- acorde;
- ritmo.

### Estrutura

```txt
ícone ou mídia opcional
título
subtítulo
conteúdo
metadados
ação
```

### Regras

- card deve possuir função clara;
- não aninhar cards completos;
- usar borda em vez de sombra forte;
- selecionado recebe borda primária;
- toque deve ter feedback;
- cards sem ação não devem parecer clicáveis.

---

## 16.5 `SectionHeader`

### Conteúdo

- título;
- descrição opcional;
- ação “Ver todos”.

### Regras

- título alinhado à esquerda;
- ação curta;
- não repetir o título da tela;
- usar em blocos com pelo menos dois itens.

---

## 16.6 `SearchField`

### Conteúdo

- ícone;
- placeholder;
- texto;
- limpar;
- filtros opcionais.

### Estados

- vazio;
- preenchido;
- focado;
- sem resultado;
- desativado.

### Regras

- busca local;
- não exigir botão “Pesquisar”;
- debounce leve;
- manter histórico opcional;
- filtro separado da busca.

---

## 16.7 `TextField`

### Estrutura

- label;
- campo;
- helper;
- erro;
- contador opcional.

### Regras

- label sempre visível;
- placeholder não substitui label;
- erro abaixo do campo;
- altura mínima 48;
- conteúdo longo usa multiline;
- não bloquear colar;
- teclado apropriado.

---

## 16.8 `SelectField`

Usar para:

- afinação;
- tom;
- ritmo;
- compasso;
- dificuldade.

Abrir:

- bottom sheet no celular;
- popover ou modal no tablet.

---

## 16.9 `Chip`

### Variantes

- filtro;
- seleção;
- status;
- tag;
- acorde;
- nota.

### Estados

- padrão;
- selecionado;
- desativado;
- com ícone;
- removível.

### Regras

- altura mínima de 32;
- texto curto;
- chips de acorde podem usar peso 700;
- não criar linhas horizontais intermináveis sem rolagem clara.

---

## 16.10 `SegmentedControl`

Usos:

- 5 ordens / 10 cordas;
- simplificado / detalhado;
- afinador guiado / cromático;
- sustenidos / bemóis;
- lista / grade.

Máximo recomendado:

- 3 opções no celular;
- 4 em tablet.

---

## 16.11 `BottomSheet`

Usos:

- seleção;
- detalhes rápidos;
- filtros;
- ações contextuais;
- escolha de acorde.

### Regras

- handle visível;
- título;
- botão fechar acessível;
- rolagem interna;
- respeitar teclado;
- altura não deve ocultar ação de confirmação;
- swipe não pode causar perda silenciosa de edição.

---

## 16.12 `Dialog`

Usar apenas para:

- confirmação destrutiva;
- erro crítico;
- permissão;
- sobrescrita de backup;
- saída com alteração não salva.

Não usar para informações rotineiras.

---

## 16.13 `Toast`

Usos:

- salvo;
- favoritado;
- copiado;
- backup criado;
- tom alterado.

Duração:

- 2 a 4 segundos;
- permitir ação “Desfazer” quando relevante.

---

## 16.14 `EmptyState`

Estrutura:

- ícone ou ilustração discreta;
- título;
- explicação;
- CTA;
- ação secundária opcional.

Exemplo:

```txt
Nenhuma cifra própria
Crie sua primeira cifra para estudar e usar no modo palco.
[ Criar cifra ]
```

---

## 16.15 `ErrorState`

Deve informar:

- o que aconteceu;
- o impacto;
- como corrigir;
- opção de tentar novamente;
- alternativa offline quando existir.

Não mostrar códigos técnicos ao usuário final.

---

## 16.16 `LoadingState`

Preferir:

- skeleton para listas e cards;
- indicador circular para ação curta;
- tela de migração com progresso indeterminado;
- sem spinner central em toda navegação para consultas locais simples.

---

## 16.17 `OfflineBadge`

Como o app já é offline-first, não mostrar badge permanentemente.

Usar apenas para:

- confirmar que o conteúdo está disponível offline;
- informar que um recurso futuro online está indisponível;
- mostrar durante onboarding ou backup.

---

# 17. Navegação inferior

## 17.1 Abas

1. Início
2. Cifras
3. Acordes
4. Afinador
5. Estudos

## 17.2 Ícones recomendados

| Aba | Ícone conceitual |
|---|---|
| Início | casa |
| Cifras | folha com acorde |
| Acordes | braço/diagrama |
| Afinador | diapasão ou medidor |
| Estudos | metrônomo |

## 17.3 Aparência

- fundo sólido;
- borda superior;
- ícone 22–24;
- label 11–12;
- item ativo em `primary`;
- item inativo em `textMuted`;
- área de toque ampla;
- sem botão central exagerado.

## 17.4 Regras

- afinador não deve parecer premium ou especial demais;
- não usar mais de cinco abas;
- não ocultar labels;
- manter estado ao alternar;
- modo palco oculta a barra;
- teclado pode ocultar a barra em formulários.

---

# 18. Componentes musicais

# 18.1 `ActiveTuningPill`

### Objetivo

Mostrar e alterar a afinação ativa.

### Conteúdo

```txt
ícone de cordas
Cebolão em Ré
seta
```

### Variantes

- compacta;
- padrão;
- somente leitura;
- alerta de incompatibilidade.

### Regras

- usar uma vez por tela;
- toque abre seletor;
- não alterar silenciosamente a cifra;
- se a mudança afetar conteúdo, pedir confirmação;
- mostrar nome curto, com nome completo acessível.

---

# 18.2 `TuningCourseRow`

Representa uma ordem ou par de cordas.

### Estrutura

```txt
5º par
A2 · A3
oitavado
[ouvir]
```

### Elementos

- número da ordem;
- notas;
- oitavas;
- tipo do par;
- botão de áudio;
- estado atual no afinador;
- frequência opcional.

### Estados

- inativo;
- atual;
- afinado;
- abaixo;
- acima;
- sinal insuficiente;
- concluído.

---

# 18.3 `StringPairVisual`

### Objetivo

Representar graficamente duas cordas do par.

### Regras

- espessura da linha pode indicar calibre de forma sutil;
- não depender da espessura para transmitir nota;
- mostrar notas textualmente;
- suportar uníssono e oitava;
- permitir espelhamento no modo canhoto apenas quando necessário.

---

# 18.4 `ChordDiagram`

Este é um dos componentes mais importantes do app.

## Modos

- cinco ordens;
- dez cordas;
- notas;
- intervalos;
- canhoto;
- compacto;
- detalhado;
- impressão futura.

## Estrutura visual

- pestana superior;
- casas horizontais;
- ordens ou cordas verticais;
- marcadores de dedo;
- corda solta;
- corda abafada;
- número da casa inicial;
- indicação de pestana;
- nome do acorde;
- afinação;
- status de revisão.

## Convenções

### Corda solta

Círculo vazio acima do braço.

### Corda abafada

`×` acima da corda.

### Casa pressionada

Círculo preenchido.

### Dedo

Número dentro do círculo:

```txt
1 indicador
2 médio
3 anelar
4 mínimo
T polegar, somente quando tecnicamente permitido
```

### Pestana

Barra arredondada cruzando as cordas.

### Casa inicial

Número ao lado da primeira casa visível quando não começar na pestana.

## Dimensões mínimas

### Compacto

- largura: 128;
- altura: 150.

### Padrão

- largura: 220;
- altura: 250.

### Detalhado

- largura adaptativa;
- altura mínima: 300.

## Cores

- braço: `surface`;
- linhas: `textSecondary`;
- pestana: `textPrimary`;
- marcação: `primary`;
- destaque da tônica: `accent`;
- abafada: `danger` apenas quando necessário;
- solta: `success` ou `textSecondary`.

## Regras

- gerar por SVG ou Canvas, não por imagem;
- adaptar a tema claro/escuro;
- permitir acessibilidade textual;
- não usar marcador pequeno demais;
- manter proporção;
- exibir status fora do diagrama;
- não incluir excesso de informação no modo compacto.

## Leitura acessível

Exemplo de label:

```txt
Acorde Ré maior, Cebolão em Ré.
Primeira ordem solta.
Segunda ordem na segunda casa com o dedo um.
Terceira ordem na terceira casa com o dedo dois.
```

---

# 18.5 `ChordStatusBadge`

### Estados

- verificado;
- calculado;
- criado pelo usuário;
- descontinuado.

### Aparência

```txt
✓ Verificado
∑ Calculado
✎ Meu acorde
! Antigo
```

Usar ícone equivalente, sem depender desses caracteres literalmente.

### Regras

- badge sempre possui texto;
- explicação acessível;
- calculado exibe aviso antes de uso em cifra;
- descontinuado não aparece por padrão.

---

# 18.6 `ChordCard`

### Conteúdo

- símbolo grande;
- nome;
- mini diagrama;
- afinação;
- dificuldade;
- status;
- favorito.

### Interação

Toque abre detalhe.

### Regras

- mini diagrama simplificado;
- não mostrar todas as notas;
- altura consistente na grade;
- símbolo não pode truncar;
- evitar ação de áudio competindo com abertura.

---

# 18.7 `TunerGauge`

## Objetivo

Exibir a diferença entre a frequência detectada e a nota alvo.

## Estrutura

- escala de cents;
- centro em zero;
- faixa negativa;
- faixa positiva;
- marcador;
- nota detectada;
- nota alvo;
- instrução;
- qualidade do sinal.

## Escala padrão

```txt
-50  -25  0  +25  +50 cents
```

## Faixas

- muito abaixo;
- abaixo;
- tolerância;
- acima;
- muito acima.

## Tolerância inicial

```txt
±5 cents
```

Configurável.

## Regras visuais

- centro claramente identificado;
- texto “Afinada” quando dentro da tolerância;
- instrução “Aperte a corda” ou “Afrouxe a corda”;
- evitar movimento excessivo;
- suavização visual;
- cor acompanhada de texto;
- frequência em área secundária;
- medidor deve funcionar em tema escuro.

---

# 18.8 `SignalQuality`

### Estados

- sem sinal;
- fraco;
- adequado;
- ruído excessivo.

### Representação

- barras;
- texto;
- ícone.

Não usar somente barras coloridas.

---

# 18.9 `ReferenceSoundButton`

### Conteúdo

- tocar;
- parar;
- nota;
- oitava;
- par.

### Estados

- parado;
- reproduzindo;
- indisponível;
- carregando.

### Regras

- não iniciar automaticamente;
- não tocar vários sons simultaneamente;
- permitir repetição;
- respeitar volume do app;
- feedback visual claro.

---

# 18.10 `SongRow`

### Conteúdo

- título;
- artista;
- tom;
- afinação;
- ritmo;
- dificuldade;
- favorito;
- origem do conteúdo.

### Regras

- título em até duas linhas;
- artista em uma linha;
- chips limitados;
- não mostrar letra na lista;
- separar conteúdo próprio e oficial por badge.

---

# 18.11 `SongHeader`

### Conteúdo

- título;
- artista;
- compositor;
- tom;
- afinação;
- ritmo;
- BPM;
- favorito;
- menu.

### Regras

- metadados agrupados;
- não ocupar metade da tela;
- tom e afinação devem ser acessíveis;
- modo palco usa versão compacta.

---

# 18.12 `TransposeControl`

### Estrutura

```txt
[−]  Tom: D  [+]
```

### Ações

- descer semitom;
- subir semitom;
- abrir seletor;
- restaurar original.

### Regras

- botões com alvo de toque de 44;
- mostrar tom original;
- usar dígitos/símbolos consistentes;
- confirmar quando adaptações não revisadas forem necessárias;
- manter histórico apenas durante sessão;
- acessibilidade: “Subir meio tom”.

---

# 18.13 `CapoSuggestion`

### Conteúdo

- casa do capotraste;
- formas sugeridas;
- explicação;
- aviso quando não revisado.

### Aparência

Card informativo compacto.

---

# 18.14 `ChordLine`

Representa acordes posicionados sobre letra ou estrutura.

### Regras

- acordes em cor primária;
- letra em `textPrimary`;
- espaço vertical suficiente;
- não quebrar acorde e palavra incorretamente;
- permitir tocar no acorde;
- tocar abre mini diagrama;
- manter alinhamento ao redimensionar;
- modo palco amplia proporcionalmente.

---

# 18.15 `SongSection`

### Tipos

- introdução;
- verso;
- pré-refrão;
- refrão;
- ponte;
- solo;
- final;
- observação.

### Aparência

- label discreto;
- separação clara;
- sem card obrigatório em cada seção;
- refrão pode receber fundo suave;
- evitar excesso de bordas.

---

# 18.16 `AutoScrollControl`

### Funções

- iniciar;
- pausar;
- velocidade;
- retornar;
- avançar seção.

### Aparência

Barra flutuante no modo palco.

### Regras

- não cobrir cifra;
- ocultar parcialmente após inatividade;
- reaparecer ao toque;
- botões grandes;
- velocidade acessível;
- impedir alteração acidental de tom.

---

# 18.17 `RhythmPattern`

## Estrutura

- contagem;
- direção;
- ação;
- intensidade;
- cursor de reprodução;
- agrupamento por compasso.

## Símbolos

- seta para baixo;
- seta para cima;
- abafamento;
- pausa;
- toque leve;
- toque forte;
- percussão;
- polegar;
- indicador.

## Regras

- legenda sempre disponível;
- cursor animado;
- etapa ativa em destaque;
- espelhamento para canhoto;
- não depender de vídeos;
- permitir velocidade reduzida;
- permitir rolagem horizontal apenas quando inevitável.

---

# 18.18 `RhythmStep`

### Estados

- futuro;
- atual;
- concluído;
- acentuado;
- pausa.

### Conteúdo

- seta;
- letra ou símbolo;
- tempo;
- subdivisão.

---

# 18.19 `MetronomeDial`

### Funções

- BPM;
- aumentar;
- diminuir;
- arrastar;
- tap tempo;
- iniciar;
- compasso.

### Aparência

- número central;
- controles claros;
- sem skeuomorfismo excessivo;
- animação de pulso;
- primeiro tempo diferenciado.

### Regras

- número em tabular;
- passos de 1 BPM;
- pressão prolongada acelera;
- limite configurado;
- não depender do frame visual para precisão sonora.

---

# 18.20 `DifficultyBadge`

### Níveis

- iniciante;
- fácil;
- intermediário;
- avançado.

### Regras

- texto sempre presente;
- cores discretas;
- não usar “difícil” como alerta vermelho;
- nível deve ser filtrável.

---

# 19. Modo palco

## 19.1 Objetivo visual

Eliminar distrações e maximizar legibilidade.

## 19.2 Aparência

- fundo preto ou quase preto;
- texto branco;
- acordes em verde claro ou âmbar claro;
- controles reduzidos;
- alto contraste;
- sem textura;
- sem cards decorativos;
- sem bottom tab;
- sem anúncios;
- sem cabeçalho grande.

## 19.3 Controles

- sair;
- rolagem;
- velocidade;
- tamanho;
- tom;
- bloquear controles;
- avançar seção.

## 19.4 Bloqueio de controles

Após ativado:

- gestos acidentais não alteram tom;
- controles principais podem ser ocultados;
- toque simples pausa ou mostra controles;
- saída exige gesto ou botão claro.

## 19.5 Tablet

Em tablet, permitir:

- cifra em coluna principal;
- acordes usados em painel lateral;
- ocultar painel;
- modo paisagem prioritário.

---

# 20. Tema claro

## 20.1 Sensação

- papel limpo;
- luz natural;
- calor moderado;
- boa leitura;
- superfícies claras;
- detalhes artesanais discretos.

## 20.2 Fundo

`#F7F3EA`

Não usar branco puro como fundo de tela inteira.

## 20.3 Cards

Branco ou marfim claro, com borda.

## 20.4 Conteúdo musical

Diagramas em fundo branco para precisão.

## 20.5 Cuidados

- não deixar a interface amarelada demais;
- não usar bege em todos os componentes;
- manter verde como guia;
- cobre apenas em detalhes.

---

# 21. Tema escuro

## 21.1 Sensação

- palco;
- estúdio;
- madeira escura;
- concentração;
- conforto noturno.

## 21.2 Fundo

`#111511`

## 21.3 Cards

`#1B221C` e `#222B23`.

## 21.4 Conteúdo musical

- diagramas com linhas claras;
- acordes em verde claro;
- cobre claro em destaques;
- texto principal quase branco.

## 21.5 Cuidados

- não usar preto absoluto em todas as superfícies;
- não usar textos cinza escuro;
- não usar sombras pesadas;
- evitar saturação excessiva.

---

# 22. Tema de alto contraste

## 22.1 Objetivo

Atender usuários com baixa visão e melhorar uso no palco.

## 22.2 Regras

- fundo preto ou branco;
- texto com contraste máximo;
- bordas de 2 px;
- foco mais evidente;
- estados com ícone e texto;
- sem texturas;
- sem transparência baixa;
- acordes destacados;
- opção independente do tema.

---

# 23. Modo destro e canhoto

## 23.1 O que deve ser espelhado

- direção das batidas;
- animação da mão;
- diagramas quando o usuário escolher;
- instruções direcionais.

## 23.2 O que não deve ser espelhado automaticamente

- navegação;
- texto;
- ícones universais;
- controles de voltar;
- ordem cronológica;
- medidor de cents.

## 23.3 Configuração

```txt
Preferência de execução:
( ) Destro
( ) Canhoto
```

Separar de:

```txt
Orientação do diagrama:
( ) Padrão
( ) Espelhado
```

---

# 24. Feedback tátil e sonoro

## 24.1 Haptics

Usar com moderação:

- corda afinada;
- início do metrônomo;
- primeiro tempo opcional;
- confirmação importante;
- limite de ajuste.

Não usar em:

- cada oscilação do afinador;
- rolagem;
- toda seleção;
- áudio contínuo.

## 24.2 Sons de interface

Evitar sons artificiais de clique.

Sons devem estar relacionados à função musical.

## 24.3 Configuração

Usuário pode desligar:

- vibração;
- sons de confirmação;
- contagem;
- acento do metrônomo.

---

# 25. Movimento e animação

## 25.1 Princípios

- funcional;
- curto;
- suave;
- previsível;
- respeitar redução de movimento.

## 25.2 Durações

| Token | Duração |
|---|---:|
| `motion.fast` | 120 ms |
| `motion.standard` | 200 ms |
| `motion.slow` | 320 ms |
| `motion.educational` | variável pelo BPM |

## 25.3 Curvas

- entrada: ease-out;
- saída: ease-in;
- mudanças: ease-in-out;
- não usar bounce em conteúdo técnico.

## 25.4 Animações permitidas

- seleção de tab;
- abertura de sheet;
- favorito;
- marcador do afinador;
- cursor de ritmo;
- pulso do metrônomo;
- expansão de detalhes;
- transição para palco.

## 25.5 Redução de movimento

Com `reduce motion`:

- remover deslocamentos;
- manter mudança de opacidade;
- eliminar pulsos fortes;
- cursor rítmico pode usar destaque estático;
- afinador continua funcional.

---

# 26. Texturas, imagens e ilustrações

## 26.1 Texturas

Permitidas:

- madeira muito sutil;
- papel de fibra discreta;
- couro em detalhes;
- gravação ou entalhe.

Opacidade máxima sugerida:

```txt
3% a 8%
```

## 26.2 Fotografias

Podem aparecer:

- onboarding;
- telas editoriais;
- materiais de divulgação;
- capa de conteúdo autorizado.

Não usar fotografia como fundo de cifra.

## 26.3 Ilustrações

Estilo recomendado:

- vetorial;
- formas orgânicas;
- paleta da marca;
- detalhes de madeira e cobre;
- perspectiva simples;
- sem personagens infantis.

## 26.4 Estado vazio

Usar ilustração pequena:

- viola apoiada;
- estante;
- braço da viola;
- palheta;
- caderno de cifras.

## 26.5 Direitos

Toda imagem deve possuir:

- autoria;
- licença;
- registro de origem;
- permissão de uso.

---

# 27. App icon

## 27.1 Conceito principal

Símbolo central de viola estilizada dentro de forma robusta.

### Composição

- fundo verde profundo;
- viola em cobre ou palha;
- roseta simples;
- cinco linhas representando pares;
- borda interna opcional;
- alto contraste.

## 27.2 Regras técnicas visuais

- elemento central grande;
- boa leitura em 48 px;
- sem texto;
- sem detalhes finos;
- sem transparência no ícone principal iOS;
- preservar margem de segurança;
- adaptar para ícone Android;
- criar foreground separado para adaptive icon;
- evitar cantos desenhados no próprio arquivo.

## 27.3 Variações futuras

- versão principal;
- monocromática;
- dark;
- adaptive foreground;
- notification icon Android.

---

# 28. Splash screen

## 28.1 Aparência

- fundo verde profundo ou carvão esverdeado;
- símbolo central;
- nome abaixo;
- assinatura opcional;
- sem loading bar longo;
- sem fotografia.

## 28.2 Regras

- composição central;
- respeitar recortes;
- não inserir informação funcional;
- transição direta para onboarding ou início;
- símbolo deve funcionar em telas pequenas.

---

# 29. Onboarding

## 29.1 Direção visual

- ilustração ampla;
- título em Bitter;
- texto curto;
- uma decisão por tela;
- CTA fixo inferior;
- progresso discreto;
- possibilidade de pular apenas quando não comprometer configuração.

## 29.2 Layout

```txt
safe area
progresso
ilustração
título
descrição
controle
CTA
```

## 29.3 Regras

- não pedir microfone na primeira tela;
- explicar antes da permissão;
- não usar mais de 60 palavras por tela;
- escolhas com cards ou radios;
- permitir alterar depois;
- não pedir dados pessoais.

---

# 30. Tela inicial

## 30.1 Hierarquia

1. saudação contextual ou título;
2. afinação ativa;
3. CTA “Afinar agora”;
4. continuar estudo;
5. atalhos;
6. favoritos ou recentes.

## 30.2 Regras

- não mostrar mais de quatro cards principais;
- não duplicar recentes e continuar;
- afinação ativa deve ser evidente;
- uma ação principal;
- conteúdo secundário abaixo;
- primeira tela sem dados usa onboarding contextual.

---

# 31. Tela de cifras

## 31.1 Hierarquia

1. título;
2. busca;
3. filtros;
4. categorias;
5. lista;
6. botão criar cifra.

## 31.2 Regras

- botão criar pode ser FAB discreto;
- filtro ativo visível;
- resultados locais;
- lista preserva posição;
- sem banner;
- sem capas grandes para cada música;
- distinguir conteúdo próprio.

---

# 32. Tela de acordes

## 32.1 Hierarquia

1. afinação ativa;
2. seletor de nota;
3. seletor de qualidade;
4. filtros;
5. grid ou lista;
6. detalhe.

## 32.2 Regras

- nota e qualidade não devem ocupar dois cards gigantes;
- usar chips ou seletores;
- diagrama precisa ser legível;
- grid de duas colunas somente quando largura permitir;
- mostrar status de revisão;
- evitar carregar centenas de diagramas de uma vez.

---

# 33. Tela do afinador

## 33.1 Hierarquia

1. modo;
2. afinação;
3. par atual;
4. nota grande;
5. medidor;
6. instrução;
7. qualidade do sinal;
8. controle de som de referência;
9. progresso.

## 33.2 Regras

- pouca decoração;
- contraste alto;
- sem cards concorrentes;
- sem rolagem na função principal;
- estado do microfone visível;
- não mostrar leitura quando sinal for inválido;
- botão de voltar seguro.

---

# 34. Tela de estudos

## 34.1 Hierarquia

1. continuar estudo;
2. ritmos;
3. metrônomo;
4. exercícios;
5. conteúdo recente.

## 34.2 Regras

- não virar dashboard de métricas;
- foco em agir;
- um card por domínio;
- ritmos com prévia visual;
- metrônomo acessível em um toque.

---

# 35. Formulários

## 35.1 Estrutura

- título;
- instrução;
- campos;
- ação principal fixa ou ao final;
- cancelar secundário;
- aviso de alterações.

## 35.2 Teclado

- ajustar scroll;
- não cobrir campos;
- CTA pode ficar acima do teclado;
- `returnKeyType` adequado;
- permitir salvar rascunho.

## 35.3 Validação

- durante saída ou submissão;
- mensagens específicas;
- preservar conteúdo;
- focar primeiro erro;
- não usar toast como única mensagem de erro.

---

# 36. Estados de conteúdo

## 36.1 Conteúdo oficial verificado

Aparência:

- selo verde;
- fonte ou revisor disponível;
- prioridade em buscas.

## 36.2 Conteúdo calculado

Aparência:

- selo âmbar;
- explicação;
- ação para visualizar notas;
- aviso antes de aplicação em cifra.

## 36.3 Conteúdo do usuário

Aparência:

- selo roxo;
- ação editar;
- opção de backup;
- não misturar silenciosamente ao oficial.

## 36.4 Conteúdo descontinuado

- oculto por padrão;
- disponível apenas em detalhes ou migração;
- selo de alerta;
- sugestão de substituição.

---

# 37. Premium

## 37.1 Direção visual

O premium deve parecer uma ampliação do app, não um bloqueio agressivo.

## 37.2 Componente `PremiumLock`

Conteúdo:

- ícone de cadeado;
- recurso;
- benefício;
- botão desbloquear;
- alternativa gratuita, quando existir.

## 37.3 Cores

- dourado terroso;
- cobre;
- verde;
- sem roxo neon;
- sem efeito cassino.

## 37.4 Regras

- não bloquear a navegação principal;
- não mostrar modal repetidamente;
- não interromper afinação;
- permitir restaurar compra;
- explicar compra única;
- não usar contagem regressiva falsa;
- não criar urgência enganosa.

---

# 38. Acessibilidade

## 38.1 Alvos de toque

Mínimo:

```txt
44 × 44 dp
```

Preferência:

```txt
48 × 48 dp
```

## 38.2 Leitor de tela

Todos os componentes musicais precisam de descrição textual.

Exemplo:

```txt
Botão ouvir primeiro par, notas Ré três e Ré quatro.
```

## 38.3 Ordem de foco

Deve seguir:

1. título;
2. contexto;
3. conteúdo;
4. ação principal;
5. ações secundárias.

## 38.4 Font scale

Testar:

- 100%;
- 130%;
- 160%;
- 200%.

Em escalas altas:

- quebrar linhas;
- evitar altura fixa;
- mover ações para coluna;
- permitir scroll;
- preservar diagramas.

## 38.5 Contraste

- respeitar WCAG AA;
- modo palco deve exceder AA;
- bordas de inputs visíveis;
- foco evidente;
- não usar texto sobre imagem sem overlay.

## 38.6 Deficiências de cor

Afinador deve mostrar:

- abaixo;
- afinada;
- acima;

além das cores.

## 38.7 Controle de movimento

Respeitar configuração do sistema.

## 38.8 Conteúdo auditivo

Áudio deve possuir representação visual.

---

# 39. Internacionalização

Embora a V1 possa ser em português, o design deve suportar textos maiores.

## Regras

- não fixar largura de labels;
- evitar texto dentro de imagens;
- permitir expansão de até 35%;
- símbolos musicais separados de traduções;
- nomes de afinações podem permanecer culturais;
- descrições devem ser localizáveis;
- acordes podem usar notação configurável.

---

# 40. Escrita de interface

## 40.1 Tom

- direto;
- respeitoso;
- claro;
- musical;
- sem excesso de informalidade;
- sem diminutivos desnecessários.

## 40.2 Exemplos

### Correto

```txt
Toque o 1º par.
A nota está abaixo do alvo.
Aperte a corda lentamente.
```

### Evitar

```txt
Vamos lá, campeão! Dê uma apertadinha nessa cordinha!
```

## 40.3 Botões

Usar verbo de ação:

- Afinar agora;
- Abrir cifra;
- Iniciar treino;
- Salvar cifra;
- Restaurar tom;
- Exportar backup.

Evitar:

- OK;
- Continuar, quando a ação específica puder ser descrita;
- Clique aqui;
- Saiba mais como CTA principal.

---

# 41. Responsividade por componente

## 41.1 Cards

Celular:

- uma coluna;
- largura total.

Tablet:

- duas ou três colunas;
- altura consistente.

## 41.2 ChordDiagram

Celular:

- centralizado;
- largura adaptada.

Tablet:

- painel lateral ou detalhe amplo;
- múltiplas posições.

## 41.3 Cifra

Celular:

- uma coluna;
- controles compactos.

Tablet:

- cifra principal;
- painel de acordes;
- navegação por seções.

## 41.4 Afinador

Celular:

- medidor verticalmente central.

Tablet:

- medidor maior;
- lista de pares lateral;
- sem espaços vazios excessivos.

## 41.5 Ritmo

Celular:

- padrão rolável;
- legenda recolhível.

Tablet:

- padrão completo;
- explicação lateral.

---

# 42. Componentes e arquivos recomendados

```txt
src/
  components/
    ui/
      AppButton.tsx
      AppCard.tsx
      AppHeader.tsx
      BottomSheet.tsx
      Chip.tsx
      Dialog.tsx
      EmptyState.tsx
      ErrorState.tsx
      LoadingState.tsx
      ScreenContainer.tsx
      SearchField.tsx
      SectionHeader.tsx
      SegmentedControl.tsx
      SelectField.tsx
      TextField.tsx
      Toast.tsx

    music/
      ActiveTuningPill.tsx
      ChordCard.tsx
      ChordDiagram.tsx
      ChordLine.tsx
      ChordStatusBadge.tsx
      ReferenceSoundButton.tsx
      RhythmPattern.tsx
      RhythmStep.tsx
      SongHeader.tsx
      SongRow.tsx
      SongSection.tsx
      StringPairVisual.tsx
      TransposeControl.tsx
      TunerGauge.tsx
      TuningCourseRow.tsx

    metronome/
      MetronomeDial.tsx
      MetronomeControls.tsx
      BeatIndicator.tsx

    stage/
      AutoScrollControl.tsx
      StageHeader.tsx
      StageSettingsSheet.tsx

    premium/
      PremiumLock.tsx
      PremiumBadge.tsx
```

---

# 43. Tokens recomendados

```txt
src/theme/
  colors.ts
  typography.ts
  spacing.ts
  radii.ts
  shadows.ts
  motion.ts
  theme.ts
  types.ts
```

## 43.1 Exemplo conceitual de cores

```ts
export const brandColors = {
  green: {
    900: '#123B2D',
    800: '#174936',
    700: '#1F5A45',
    600: '#2B6D55',
    500: '#3C8067',
    300: '#79B99C',
    100: '#DCEDE4',
  },
  copper: {
    800: '#7A3812',
    700: '#8F4515',
    600: '#A9581E',
    500: '#B96A2B',
    300: '#D39B62',
    100: '#F3E1CE',
  },
} as const;
```

## 43.2 Exemplo conceitual de tema

```ts
export const lightTheme = {
  colors: {
    background: '#F7F3EA',
    backgroundSubtle: '#F1EBDD',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFCF7',
    surfaceMuted: '#EFE7D8',
    textPrimary: '#1F241F',
    textSecondary: '#4E5851',
    textMuted: '#68706A',
    primary: '#1F5A45',
    primaryPressed: '#174936',
    primarySoft: '#DCEDE4',
    onPrimary: '#FFFFFF',
    accent: '#A9581E',
    accentPressed: '#8F4515',
    accentSoft: '#F3E1CE',
    border: '#D7CCB8',
    divider: '#E3DACB',
  },
} as const;
```

## 43.3 Espaçamento

```ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;
```

## 43.4 Raios

```ts
export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;
```

---

# 44. Regras de implementação

## 44.1 Não hardcodar cores

Cor deve vir do tema.

Errado:

```ts
color: '#1F5A45'
```

Correto:

```ts
color: theme.colors.primary
```

Exceção:

- recursos exportados;
- SVG institucional;
- ícone;
- splash.

## 44.2 Não hardcodar espaçamento arbitrário

Usar tokens.

## 44.3 Componentes musicais separados de telas

A tela não deve desenhar o acorde diretamente.

Preferir:

```txt
screen
  → feature component
    → ChordDiagram
```

## 44.4 Lógica musical fora da UI

- transposição em utilitário;
- cálculo de nota em serviço;
- afinador em hook ou módulo;
- desenho recebe dados prontos;
- metrônomo não depende da renderização.

## 44.5 Tema centralizado

Usar um único hook:

```ts
const theme = useAppTheme();
```

## 44.6 Variantes tipadas

Evitar props booleanas em excesso.

Preferir:

```ts
variant="selected"
```

em vez de:

```ts
selected
highlighted
green
withBorder
```

## 44.7 Acessibilidade obrigatória

Todo componente global deve expor:

- role;
- label;
- hint;
- state;
- disabled;
- selected.

---

# 45. Regras contra redundância visual

## 45.1 Afinação ativa

Mostrar em um ponto principal.

Não repetir:

- no header;
- em card;
- em banner;
- em chip;
- na descrição;

todos ao mesmo tempo.

## 45.2 Favorito

Uma ação por item.

Não usar coração no card e outro botão “Favoritar” abaixo.

## 45.3 Tom

Na cifra, o tom atual deve aparecer no controle de transposição.

Não repetir como card grande.

## 45.4 Verificação

Badge junto ao conteúdo.

Não criar card explicativo em todas as telas.

## 45.5 Premium

Não inserir vários cadeados na mesma área.

Bloquear o recurso no ponto de entrada.

---

# 46. Padrões proibidos

- fundos de madeira atrás de textos;
- elementos dourados brilhantes;
- neon;
- glassmorphism intenso;
- cards excessivos;
- sombras pesadas;
- degradê em todos os botões;
- botões com texto em duas linhas;
- ícones de famílias diferentes;
- tipografia manuscrita para cifras;
- imagens rasterizadas de acordes;
- accordions dentro de accordions;
- modais para cada ação;
- menus escondendo ações essenciais;
- cor vermelha para dificuldade;
- animações com bounce;
- textos em inglês no app em português;
- símbolos sem legenda;
- scroll horizontal obrigatório em telas principais;
- botão principal flutuando sobre letra;
- alteração silenciosa da afinação;
- efeitos visuais que reduzam precisão do afinador.

---

# 47. Exemplos de composição

## 47.1 Card de acorde

```txt
┌──────────────────────────────┐
│ D                            │
│ Ré maior                     │
│ [mini diagrama]              │
│ Cebolão em Ré · Fácil        │
│ ✓ Verificado           ♡     │
└──────────────────────────────┘
```

## 47.2 Card de cifra

```txt
┌──────────────────────────────┐
│ Chico Mineiro                │
│ Tonico & Tinoco              │
│ D · Cururu · Cebolão em Ré   │
│ Fácil                  ♡     │
└──────────────────────────────┘
```

Usar apenas quando o conteúdo estiver licenciado ou autorizado.

## 47.3 Afinador

```txt
Cebolão em Ré

2º par de 5
Alvo: Lá

             A
          440.0 Hz

-50  -25   0   +25  +50
          ▲

Afinada
```

## 47.4 Ritmo

```txt
Cururu · 2/4 · 84 BPM

1   e   2   e
↓       ↓   ↑
F       A   L

F = forte
A = abafado
L = leve
```

---

# 48. Checklist de cada tela

```txt
[ ] objetivo único
[ ] CTA principal claro
[ ] afinação mostrada apenas quando relevante
[ ] tema claro
[ ] tema escuro
[ ] celular pequeno
[ ] tablet
[ ] safe area
[ ] texto escalável
[ ] leitor de tela
[ ] estado vazio
[ ] estado de erro
[ ] estado carregando
[ ] conteúdo longo
[ ] ação destrutiva confirmada
[ ] sem informação duplicada
[ ] componentes globais reutilizados
[ ] tokens usados
[ ] sem cor hardcoded
[ ] sem imagem como substituta de diagrama
```

---

# 49. Definition of Ready para imagens

Uma tela pode receber imagem de referência quando houver:

```txt
[ ] nome da tela
[ ] objetivo
[ ] hierarquia
[ ] componentes
[ ] dados principais
[ ] CTA
[ ] estado representado
[ ] tema escolhido
[ ] tamanho 9:16
[ ] elementos proibidos
```

---

# 50. Prompt visual-base para futuras imagens

```md
Crie uma imagem de tela mobile em proporção 9:16 para o aplicativo
“Cifras de Viola — Acordes, Afinações e Batidas”.

Direção visual:
artesanato brasileiro com precisão musical.

Personalidade:
autêntica, técnica, sóbria, acolhedora e moderna.

Paleta:
- fundo claro em papel quente #F7F3EA;
- superfícies brancas;
- verde profundo #1F5A45 como cor principal;
- cobre #A9581E como acento;
- textos em carvão #1F241F;
- bordas suaves #D7CCB8.

Tipografia:
- títulos editoriais com serifada robusta;
- interface e cifras com sans-serif limpa.

Componentes:
- cards com borda discreta;
- cantos de 18 px;
- botões com 14 px;
- ícones lineares arredondados;
- espaçamento confortável;
- diagramas técnicos limpos.

Regras:
- não usar fundo de madeira atrás de textos;
- não usar aparência de pergaminho antigo;
- não usar chapéu, cavalo ou paisagem rural como tema principal;
- não usar neon;
- não poluir a tela;
- não duplicar informações;
- manter viável em React Native;
- preservar área segura;
- priorizar legibilidade;
- usar português;
- mostrar apenas uma ação principal.

Tela:
[DESCREVER]

Objetivo:
[DESCREVER]

Elementos obrigatórios:
[LISTAR]

Estado:
[DESCREVER]
```

---

# 51. Critérios de aceitação do Design System

O documento está concluído quando:

```txt
[ ] direção visual definida
[ ] marca definida
[ ] paleta clara definida
[ ] paleta escura definida
[ ] cores semânticas definidas
[ ] tipografia definida
[ ] espaçamento definido
[ ] raios definidos
[ ] sombras definidas
[ ] ícones definidos
[ ] layout mobile definido
[ ] tablet definido
[ ] navegação inferior definida
[ ] componentes globais definidos
[ ] componentes musicais definidos
[ ] diagrama de acorde definido
[ ] afinador definido
[ ] ritmo definido
[ ] metrônomo definido
[ ] modo palco definido
[ ] acessibilidade definida
[ ] movimento definido
[ ] app icon orientado
[ ] splash orientada
[ ] regras de implementação definidas
[ ] padrões proibidos registrados
[ ] checklist de tela criado
```

---

# 52. Decisões consolidadas

1. O visual será tradicional e moderno, sem caricatura rural.
2. O verde profundo será a cor primária.
3. O cobre será cor de acento.
4. O fundo claro será papel quente, não branco puro.
5. O modo escuro será carvão esverdeado.
6. A tipografia da interface será Inter.
7. A tipografia editorial será Bitter.
8. Diagramas serão gerados por código.
9. O modo padrão mostrará cinco ordens.
10. O modo avançado mostrará dez cordas.
11. A afinação ativa terá um componente único.
12. O modo palco não usará textura.
13. O app não usará emojis como ícones.
14. Animações serão funcionais.
15. O conteúdo verificado, calculado e próprio terá identidade distinta.
16. O sistema nascerá preparado para destros e canhotos.
17. O sistema suportará tema claro, escuro e alto contraste.
18. O app icon usará viola estilizada, verde e cobre.
19. O Design System será implementado antes das telas.
20. A próxima etapa oficial será o `03_USER_FLOW.md`.

---

# 53. Próxima etapa

Criar:

```txt
docs/03_USER_FLOW.md
```

O fluxo deverá especificar:

- primeira abertura;
- escolha de afinação;
- entrada no app;
- afinação guiada;
- consulta de acordes;
- consulta de cifras;
- transposição;
- modo palco;
- estudo de ritmos;
- metrônomo;
- criação de cifra;
- favoritos;
- backup;
- estados de erro;
- estados de permissão;
- premium, caso mantido.
