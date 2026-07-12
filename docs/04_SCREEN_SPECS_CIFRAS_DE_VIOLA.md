
# 04 — Screen Specs

## 1. Identificação

**Produto:** Cifras de Viola — Acordes, Afinações e Batidas  
**Documento:** `docs/04_SCREEN_SPECS.md`  
**Versão:** `1.0.0`  
**Status:** referência técnica e visual para implementação.

## 2. Fontes de verdade

Este documento foi consolidado a partir de:

1. `PROJECT_GUIDE.md`;
2. `docs/01_APP_BLUEPRINT.md`;
3. `docs/02_DESIGN_SYSTEM.md`;
4. `docs/03_USER_FLOW.md`;
5. `docs/05_DATA_MODEL.md`.

Em caso de conflito, aplicar a prioridade:

```txt
PROJECT_GUIDE.md
→ SCREEN_SPECS.md
→ DESIGN_SYSTEM.md
→ USER_FLOW.md
→ DATA_MODEL.md
→ imagem de referência
→ conversa solta
```

## 3. Direção visual aprovada

- conceito: **artesanato brasileiro com precisão musical**;
- proporção: `80%` interface limpa e funcional, `20%` identidade artesanal;
- tema claro padrão com fundo `#F7F3EA`;
- verde profundo como cor primária;
- cobre como acento, nunca como cor dominante de leitura;
- madeira apenas em marca, splash ou pequenos detalhes;
- conteúdo musical recebe prioridade sobre decoração;
- uma ação principal por tela;
- afinação ativa visível uma única vez nas telas em que interfere;
- estados verificado, calculado e conteúdo próprio sempre usam ícone, texto e cor;
- imagens são referências de composição. Diagramas, medidores e padrões devem ser componentes vetoriais, não imagens rasterizadas.

## 4. Base de layout

- viewport de referência: `390 × 844 dp`;
- exportação visual: `1170 × 2532 px`;
- margem lateral: `18 dp` nas referências; implementação pode usar token `16–20 dp`;
- área de toque mínima: `44 × 44 dp`;
- raio de card principal: `18 dp`;
- botão principal: `50–56 dp` de altura;
- bottom tab: cinco itens com rótulos sempre visíveis;
- tablet: centralizar conteúdo com largura máxima de leitura de `720 dp` e usar painéis laterais somente onde agregarem valor;
- modo palco: fundo quase preto, alto contraste, sem bottom tab e sem textura.

## 5. Componentes globais obrigatórios

```txt
ScreenContainer
AppHeader
AppButton
AppCard
SectionHeader
SearchField
TextField
SelectField
Chip
SegmentedControl
BottomSheet
Dialog
Toast
EmptyState
ErrorState
LoadingState
ActiveTuningPill
ChordDiagram
ChordStatusBadge
TuningCourseRow
TunerGauge
SignalQuality
ReferenceSoundButton
SongRow
SongHeader
TransposeControl
ChordLine
SongSection
AutoScrollControl
RhythmPattern
RhythmStep
MetronomeDial
DifficultyBadge
```

## 6. Regras funcionais globais

- nenhuma função essencial depende de internet;
- telas não acessam SQLite diretamente; usar `hooks → repositories/services → database`;
- microfone nunca inicia automaticamente ao abrir uma aba;
- áudio, metrônomo e microfone devem respeitar conflitos de sessão;
- troca de afinação não pode alterar conteúdo silenciosamente;
- conteúdo oficial não é editado;
- conteúdo do usuário usa salvamento seguro, rascunho e exclusão lógica quando aplicável;
- cifra oficial transposta não altera o documento original;
- modo palco não exibe anúncios, bottom tab ou decoração;
- erros técnicos não mostram códigos como mensagem principal;
- toda tela deve funcionar com tema claro, escuro, fonte ampliada, leitor de tela e celular pequeno.

## 7. Nomenclatura das imagens

As referências estão em:

```txt
assets/screenshots-reference/
```

As imagens usam numeração fixa para evitar perda de contexto durante implementação.

---

# 1. Screen Spec — Splash

## Imagem de referência

`assets/screenshots-reference/01_splash.png`

## Rota

`app/_layout.tsx`

## Objetivo

Apresentar a marca enquanto o aplicativo prepara preferências e banco local.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;

## Dados e dependências

- estado global de inicialização e preferências mínimas;

## Ação principal

Transição automática para onboarding ou Início.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `normal`;
- `migração longa encaminha para tela própria`;
- `erro fatal encaminha para recuperação`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 2. Screen Spec — Boas-vindas

## Imagem de referência

`assets/screenshots-reference/02_onboarding_welcome.png`

## Rota

`app/onboarding/index.tsx`

## Objetivo

Explicar a proposta em uma frase e iniciar a configuração.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;

## Dados e dependências

- `user_profile` e preferências salvas progressivamente;

## Ação principal

Começar → nível de experiência.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `padrão`;
- `fonte ampliada`;
- `leitor de tela`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 3. Screen Spec — Nível de experiência

## Imagem de referência

`assets/screenshots-reference/03_onboarding_experience.png`

## Rota

`app/onboarding/experience.tsx`

## Objetivo

Definir padrões de linguagem e conteúdo sugerido.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;

## Dados e dependências

- `user_profile` e preferências salvas progressivamente;

## Ação principal

Selecionar nível e continuar.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `nenhuma opção`;
- `opção selecionada`;
- `preferência restaurada`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 4. Screen Spec — Afinação inicial

## Imagem de referência

`assets/screenshots-reference/04_onboarding_tuning.png`

## Rota

`app/onboarding/tuning.tsx`

## Objetivo

Definir a afinação ativa inicial.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- `user_profile` e preferências salvas progressivamente;

## Ação principal

Confirmar afinação.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `lista carregada`;
- `não sei qual uso`;
- `afinação provisória`;
- `erro de catálogo`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 5. Screen Spec — Visualização dos acordes

## Imagem de referência

`assets/screenshots-reference/05_onboarding_diagram.png`

## Rota

`app/onboarding/diagram.tsx`

## Objetivo

Definir o modo padrão de diagrama.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ChordDiagram`;
- `AppButton`;

## Dados e dependências

- `user_profile` e preferências salvas progressivamente;

## Ação principal

Escolher cinco ordens ou dez cordas.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `cinco ordens`;
- `dez cordas`;
- `prévia indisponível`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 6. Screen Spec — Preferência de execução

## Imagem de referência

`assets/screenshots-reference/06_onboarding_handedness.png`

## Rota

`app/onboarding/handedness.tsx`

## Objetivo

Configurar orientação de execução sem espelhar a navegação.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;

## Dados e dependências

- `user_profile` e preferências salvas progressivamente;

## Ação principal

Selecionar destro ou canhoto.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `destro`;
- `canhoto`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 7. Screen Spec — Microfone

## Imagem de referência

`assets/screenshots-reference/07_onboarding_microphone.png`

## Rota

`app/onboarding/microphone.tsx`

## Objetivo

Explicar a permissão antes da solicitação nativa.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;

## Dados e dependências

- `user_profile` e preferências salvas progressivamente;

## Ação principal

Testar o afinador.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `permissão desconhecida`;
- `concedida`;
- `negada`;
- `bloqueada`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 8. Screen Spec — Resumo do onboarding

## Imagem de referência

`assets/screenshots-reference/08_onboarding_summary.png`

## Rota

`app/onboarding/summary.tsx`

## Objetivo

Confirmar escolhas e concluir o onboarding somente após ação explícita.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;

## Dados e dependências

- `user_profile` e preferências salvas progressivamente;

## Ação principal

Entrar no app.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `resumo completo`;
- `microfone não permitido`;
- `afinação provisória`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 9. Screen Spec — Início

## Imagem de referência

`assets/screenshots-reference/09_home.png`

## Rota

`app/(tabs)/index.tsx`

## Objetivo

Retomar rapidamente estudo, afinação ou conteúdo recente.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `BottomTabBar`;
- `AppButton`;

## Dados e dependências

- estado global de inicialização e preferências mínimas;

## Ação principal

Afinar agora.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `novo usuário`;
- `usuário recorrente`;
- `sem recentes`;
- `afinação provisória`;
- `erro local`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 10. Screen Spec — Afinações

## Imagem de referência

`assets/screenshots-reference/10_tunings_list.png`

## Rota

`app/tunings/index.tsx`

## Objetivo

Listar e pesquisar afinações oficiais e futuras afinações próprias.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `SearchField`;
- `BottomTabBar`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;

## Ação principal

Abrir detalhe da afinação.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `lista`;
- `busca`;
- `sem resultado`;
- `erro de catálogo`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 11. Screen Spec — Detalhe da afinação

## Imagem de referência

`assets/screenshots-reference/11_tuning_detail.png`

## Rota

`app/tunings/[tuningId].tsx`

## Objetivo

Apresentar notas, oitavas, pares, áudio e segurança da afinação.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `BottomTabBar`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;

## Ação principal

Usar esta afinação.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `ativa`;
- `inativa`;
- `áudio tocando`;
- `alerta de tensão`;
- `erro de áudio`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 12. Screen Spec — Cifras

## Imagem de referência

`assets/screenshots-reference/12_songs_list.png`

## Rota

`app/(tabs)/songs.tsx`

## Objetivo

Pesquisar, filtrar e abrir cifras locais.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `SearchField`;
- `BottomTabBar`;
- `SongRow/AppCard`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- repositórios de cifras oficiais/próprias, favoritos e recentes;

## Ação principal

Abrir uma cifra; criar cifra pelo botão de adição.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `lista`;
- `busca`;
- `filtros ativos`;
- `sem resultado`;
- `conteúdo próprio`;
- `erro local`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 13. Screen Spec — Detalhe da cifra

## Imagem de referência

`assets/screenshots-reference/13_song_detail.png`

## Rota

`app/songs/[songId].tsx`

## Objetivo

Ler, transpor e tocar uma cifra compatível com a afinação ativa.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `TransposeControl`;
- `BottomTabBar`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- repositórios de cifras oficiais/próprias, favoritos e recentes;

## Ação principal

Entrar no modo palco.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `compatível revisada`;
- `compatível calculada`;
- `incompatível`;
- `forma ausente`;
- `metrônomo ativo`;
- `erro de conteúdo`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 14. Screen Spec — Modo palco

## Imagem de referência

`assets/screenshots-reference/14_stage_mode.png`

## Rota

`app/songs/[songId]/stage.tsx`

## Objetivo

Maximizar legibilidade e reduzir distrações durante execução.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- repositórios de cifras oficiais/próprias, favoritos e recentes;

## Ação principal

Iniciar ou pausar rolagem automática.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `controles visíveis`;
- `controles ocultos`;
- `rolagem ativa`;
- `bloqueado`;
- `interrompido`;
- `paisagem tablet`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 15. Screen Spec — Acordes

## Imagem de referência

`assets/screenshots-reference/15_chords_list.png`

## Rota

`app/(tabs)/chords.tsx`

## Objetivo

Escolher nota e qualidade, filtrar e abrir posições de acorde.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `SearchField`;
- `BottomTabBar`;
- `SongRow/AppCard`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- acorde lógico, forma, posições, pestanas e status de verificação;

## Ação principal

Abrir a posição selecionada.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `resultado verificado`;
- `resultado calculado`;
- `sem resultado`;
- `filtros ativos`;
- `erro local`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 16. Screen Spec — Detalhe do acorde

## Imagem de referência

`assets/screenshots-reference/16_chord_detail.png`

## Rota

`app/chords/[shapeId].tsx`

## Objetivo

Exibir diagrama, áudio, status, notas e variações do acorde.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `ChordDiagram`;
- `BottomTabBar`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- acorde lógico, forma, posições, pestanas e status de verificação;

## Ação principal

Ouvir acorde.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `verificado`;
- `calculado com aviso`;
- `áudio indisponível`;
- `outra afinação sem forma`;
- `favorito`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 17. Screen Spec — Afinador

## Imagem de referência

`assets/screenshots-reference/17_tuner_home.png`

## Rota

`app/(tabs)/tuner.tsx`

## Objetivo

Selecionar modo e iniciar captura apenas por ação explícita.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `BottomTabBar`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- preferências do afinador, permissão, sessão de áudio e calibração A4;

## Ação principal

Iniciar afinação guiada.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `pronto`;
- `permissão negada`;
- `permissão bloqueada`;
- `microfone indisponível`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 18. Screen Spec — Afinador guiado

## Imagem de referência

`assets/screenshots-reference/18_tuner_guided.png`

## Rota

`app/tuner/guided.tsx`

## Objetivo

Comparar cada par com a nota alvo e orientar com segurança.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `TunerGauge`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- preferências do afinador, permissão, sessão de áudio e calibração A4;

## Ação principal

Confirmar ou avançar ao próximo par.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `pronto`;
- `ouvindo`;
- `abaixo`;
- `afinado`;
- `acima`;
- `sinal fraco`;
- `nota distante`;
- `pausado`;
- `concluído`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 19. Screen Spec — Afinador cromático

## Imagem de referência

`assets/screenshots-reference/19_tuner_chromatic.png`

## Rota

`app/tuner/chromatic.tsx`

## Objetivo

Detectar qualquer nota sem exigir uma afinação ou sequência.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `TunerGauge`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- preferências do afinador, permissão, sessão de áudio e calibração A4;

## Ação principal

Parar microfone; opcionalmente fixar alvo.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `livre`;
- `alvo fixado`;
- `sem sinal`;
- `sinal fraco`;
- `erro de áudio`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 20. Screen Spec — Sons de referência

## Imagem de referência

`assets/screenshots-reference/20_reference_sounds.png`

## Rota

`app/tuner/reference.tsx`

## Objetivo

Reproduzir notas locais de cada par sem permissão de microfone.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `ActiveTuningPill`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- preferências do afinador, permissão, sessão de áudio e calibração A4;

## Ação principal

Tocar um par ou sequência completa.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `parado`;
- `reproduzindo`;
- `áudio indisponível`;
- `mudança de afinação`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 21. Screen Spec — Estudos

## Imagem de referência

`assets/screenshots-reference/21_studies_home.png`

## Rota

`app/(tabs)/studies.tsx`

## Objetivo

Acessar ritmos, metrônomo e exercícios de prática.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `BottomTabBar`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- ritmos, padrões, passos, áudio e preferências de mão;

## Ação principal

Continuar treino recente.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `novo usuário`;
- `retorno`;
- `sem atividade`;
- `erro de catálogo`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 22. Screen Spec — Ritmos

## Imagem de referência

`assets/screenshots-reference/22_rhythms_list.png`

## Rota

`app/rhythms/index.tsx`

## Objetivo

Listar, buscar e filtrar ritmos locais.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `RhythmPattern`;
- `SearchField`;
- `BottomTabBar`;
- `SongRow/AppCard`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- ritmos, padrões, passos, áudio e preferências de mão;

## Ação principal

Abrir detalhe do ritmo.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `lista`;
- `filtro`;
- `sem resultado`;
- `favorito`;
- `erro local`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 23. Screen Spec — Detalhe do ritmo

## Imagem de referência

`assets/screenshots-reference/23_rhythm_detail.png`

## Rota

`app/rhythms/[rhythmId].tsx`

## Objetivo

Explicar o ritmo, reproduzir exemplos e iniciar treino.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `RhythmPattern`;
- `AppButton`;

## Dados e dependências

- ritmos, padrões, passos, áudio e preferências de mão;

## Ação principal

Iniciar treino.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `padrão`;
- `áudio lento`;
- `áudio normal`;
- `destro`;
- `canhoto`;
- `erro de áudio`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 24. Screen Spec — Treino de batida

## Imagem de referência

`assets/screenshots-reference/24_rhythm_practice.png`

## Rota

`app/rhythms/[rhythmId]/practice.tsx`

## Objetivo

Acompanhar padrão animado com BPM e progressão.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `RhythmPattern`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- ritmos, padrões, passos, áudio e preferências de mão;

## Ação principal

Iniciar ou pausar treino.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `configuração`;
- `contagem`;
- `ativo`;
- `pausado`;
- `concluído`;
- `interrupção de áudio`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 25. Screen Spec — Metrônomo

## Imagem de referência

`assets/screenshots-reference/25_metronome.png`

## Rota

`app/metronome/index.tsx`

## Objetivo

Definir BPM e compasso e reproduzir pulsação estável.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- preferências do metrônomo e serviço de tempo/áudio;

## Ação principal

Iniciar ou pausar metrônomo.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `parado`;
- `contagem`;
- `ativo`;
- `pausado`;
- `interrompido`;
- `tap tempo`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 26. Screen Spec — Minhas cifras

## Imagem de referência

`assets/screenshots-reference/26_my_songs.png`

## Rota

`app/library/my-songs.tsx`

## Objetivo

Exibir cifras próprias ou um estado vazio acionável.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `EmptyState`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- repositórios de cifras oficiais/próprias, favoritos e recentes;

## Ação principal

Criar cifra.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `vazio`;
- `lista`;
- `busca`;
- `item excluído com desfazer`;
- `erro local`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 27. Screen Spec — Criar cifra

## Imagem de referência

`assets/screenshots-reference/27_create_song.png`

## Rota

`app/songs/create.tsx`

## Objetivo

Criar cifra própria com rascunho automático e etapas claras.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `TextField/SelectField`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- repositórios de cifras oficiais/próprias, favoritos e recentes;

## Ação principal

Continuar para revisão e salvar.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `novo`;
- `salvando`;
- `salvo`;
- `erro de salvamento`;
- `validação`;
- `alterações não salvas`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 28. Screen Spec — Importar cifra

## Imagem de referência

`assets/screenshots-reference/28_import_song.png`

## Rota

`app/songs/import.tsx`

## Objetivo

Analisar texto localmente e gerar prévia antes de salvar.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `TextField/SelectField`;
- `AppButton`;

## Dados e dependências

- afinação ativa por `user_app_preferences`;
- repositórios de cifras oficiais/próprias, favoritos e recentes;

## Ação principal

Analisar e revisar.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `vazio`;
- `texto válido`;
- `formato não reconhecido`;
- `arquivo grande`;
- `revisão necessária`;
- `erro de parser`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 29. Screen Spec — Favoritos

## Imagem de referência

`assets/screenshots-reference/29_favorites.png`

## Rota

`app/library/favorites.tsx`

## Objetivo

Agrupar itens favoritos por categoria.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `SongRow/AppCard`;
- `AppButton`;
- `Chip/SegmentedControl`;

## Dados e dependências

- repositórios de cifras oficiais/próprias, favoritos e recentes;

## Ação principal

Abrir item favorito.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `categoria com itens`;
- `categoria vazia`;
- `remoção com desfazer`;
- `referência inválida`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 30. Screen Spec — Configurações

## Imagem de referência

`assets/screenshots-reference/30_settings.png`

## Rota

`app/settings/index.tsx`

## Objetivo

Organizar preferências por domínio e permitir alterações previsíveis.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `SettingsRow`;
- `AppButton`;

## Dados e dependências

- preferências locais divididas por domínio;

## Ação principal

Abrir categoria de configuração.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `padrão`;
- `preferência alterada`;
- `restauração`;
- `erro de persistência`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 31. Screen Spec — Backup

## Imagem de referência

`assets/screenshots-reference/31_backup.png`

## Rota

`app/settings/backup.tsx`

## Objetivo

Exportar ou importar dados pessoais com validação e confirmação.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `BackupActionCard`;
- `AppButton`;

## Dados e dependências

- preferências locais divididas por domínio;
- manifesto, payload, checksum e serviço transacional de backup;

## Ação principal

Exportar ou importar conforme escolha.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `ocioso`;
- `exportando`;
- `compartilhando`;
- `validando`;
- `prévia`;
- `importando`;
- `rollback`;
- `sucesso`;
- `erro`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.

---

# 32. Screen Spec — Erro recuperável

## Imagem de referência

`assets/screenshots-reference/32_error_recovery.png`

## Rota

`app/error/recovery.tsx`

## Objetivo

Explicar falha local sem culpar o usuário e oferecer recuperação.

## Entrada e saída

- entrada: conforme o fluxo definido em `03_USER_FLOW.md`;
- voltar: retorna ao ponto de origem preservando filtros, rolagem e estado seguro;
- saída crítica: interrompe áudio, microfone ou sessão quando aplicável;
- não restaurar automaticamente ações sonoras após retorno do background.

## Componentes necessários

- `ScreenContainer`;
- `AppHeader`;
- `EmptyState`;
- `AppButton`;

## Dados e dependências

- estado global de inicialização e preferências mínimas;

## Ação principal

Tentar novamente.

## Ações secundárias

- abrir detalhes ou configurações relacionadas;
- voltar sem perder estado seguro;
- usar menu contextual para ações de menor prioridade;
- fornecer feedback por toast, badge ou mudança de estado, sem dialog rotineiro.

## Estados obrigatórios

- `erro recuperável`;
- `modo limitado disponível`;
- `erro fatal sem recuperação`;

## Regras visuais

- seguir a hierarquia e proporção da imagem de referência;
- conteúdo principal deve aparecer antes de informações auxiliares;
- não usar madeira ou textura atrás de texto, cifra, diagrama ou input;
- manter um único CTA visualmente dominante;
- usar verde para seleção/ação principal e cobre apenas como acento;
- estados semânticos devem combinar texto, ícone e cor.

## Celular pequeno

- empilhar ações lado a lado quando não houver largura segura;
- permitir rolagem vertical;
- reduzir apenas espaçamentos decorativos, nunca alvos de toque ou texto essencial;
- preservar título, estado atual e CTA principal acima da dobra sempre que possível.

## Tablet

- centralizar a coluna principal;
- usar duas colunas apenas para listas, grids e painéis que continuem legíveis;
- não esticar diagramas, letras ou formulários até toda a largura;
- manter retorno e ações no mesmo eixo visual.

## Critérios de aceitação

- [ ] abre sem crash e sem depender de rede;
- [ ] respeita safe area, tema e escala de fonte;
- [ ] usa componentes globais e tokens do Design System;
- [ ] não duplica afinação, CTA ou metadados;
- [ ] possui estados vazio, carregando e erro quando aplicáveis;
- [ ] funciona em 320 dp de largura sem corte horizontal;
- [ ] adapta-se a tablet sem ampliar excessivamente a coluna de leitura;
- [ ] possui labels de acessibilidade e alvos mínimos de 44 dp;
- [ ] não deixa imports, rotas ou tipos quebrados;
- [ ] typecheck passa ao final da implementação;

## O Codex não deve

- alterar rotas de outros módulos;
- criar função fora do escopo da tela;
- rasterizar diagrama, medidor ou padrão musical;
- acessar banco diretamente dentro do componente visual;
- iniciar microfone ou áudio sem ação explícita;
- hardcodar conteúdo como fonte definitiva;
- misturar conteúdo oficial e pessoal;
- adicionar dependência sem justificar.


---

# 40. Matriz de cobertura visual

As 32 imagens cobrem:

- marca e inicialização;
- onboarding completo;
- navegação principal;
- afinações;
- cifras e modo palco;
- acordes;
- afinador guiado, cromático e referência;
- estudos, ritmos, treino e metrônomo;
- biblioteca pessoal;
- editor e importação;
- favoritos;
- configurações;
- backup;
- erro recuperável.

Telas administrativas secundárias, dialogs, bottom sheets e estados específicos devem reutilizar os mesmos tokens e componentes definidos aqui, sem introduzir uma nova linguagem visual.

# 41. Definition of Done do arquivo 04

```txt
[ ] todas as imagens possuem rota e objetivo correspondentes
[ ] CTA principal está definido
[ ] estados de áudio e permissão estão definidos
[ ] conteúdo verificado/calculado/próprio está distinguível
[ ] layout funciona em 320 dp, 390 dp e tablet
[ ] tema claro, escuro e alto contraste são possíveis
[ ] diagramas e medidores serão vetoriais
[ ] armazenamento continua offline-first
[ ] não há dependência de conta ou servidor
[ ] Codex pode implementar uma tela por tarefa
```
