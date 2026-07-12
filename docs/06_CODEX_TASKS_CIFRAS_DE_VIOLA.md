
# 06 — Codex Tasks

## 1. Identificação

**Produto:** Cifras de Viola — Acordes, Afinações e Batidas  
**Documento:** `docs/06_CODEX_TASKS.md`  
**Versão:** `1.0.0`  
**Status:** plano operacional de implementação para Expo, React Native, TypeScript, Expo Router e SQLite local.

## 2. Objetivo

Este documento transforma o planejamento do produto em missões pequenas e verificáveis para o Codex.

Ele deve impedir:

- implementação do aplicativo inteiro em um único pedido;
- alterações fora do escopo da tarefa atual;
- dependência acidental de internet;
- mistura entre interface, banco, áudio e regra musical;
- criação de componentes duplicados;
- rotas incompatíveis com o Expo Router;
- diagramas e medidores rasterizados;
- conteúdo musical de produção inventado pelo Codex;
- perda de dados pessoais durante migrações;
- permissões, microfone ou áudio iniciados sem ação explícita;
- build realizada antes dos critérios mínimos de qualidade.

## 3. Fontes de verdade

O Codex deve ler, nesta ordem:

```txt
1. PROJECT_GUIDE.md
2. docs/06_CODEX_TASKS.md
3. docs/04_SCREEN_SPECS.md
4. docs/02_DESIGN_SYSTEM.md
5. docs/03_USER_FLOW.md
6. docs/05_DATA_MODEL.md
7. docs/01_APP_BLUEPRINT.md
8. imagem de referência da tela
9. conversa ou pedido isolado
```

Se uma tarefa entrar em conflito com documento superior, o Codex deve interromper a alteração conflitante, registrar o conflito e executar somente a parte segura.

## 4. Regra de execução

Executar **uma tarefa por vez**.

Cada execução deve:

1. ler os arquivos de referência indicados;
2. inspecionar os arquivos-alvo antes de editar;
3. alterar somente os arquivos permitidos;
4. preservar decisões já aprovadas;
5. remover imports e código morto criados pela tarefa;
6. executar os checks exigidos;
7. corrigir os erros causados pela própria tarefa;
8. apresentar um resumo objetivo ao final.

O Codex não deve iniciar automaticamente a próxima tarefa.

## 5. Relatório obrigatório ao final de cada tarefa

```txt
Tarefa executada:
Arquivos criados:
Arquivos alterados:
Decisões tomadas:
Checks executados:
Resultado dos checks:
Pendências reais:
Riscos observados:
```

Não declarar sucesso quando algum check obrigatório não tiver sido executado.

## 6. Comandos de qualidade

O gerenciador de pacotes deve ser identificado pelo lockfile existente.

Comandos conceituais obrigatórios:

```txt
<package-manager> run typecheck
<package-manager> run lint
<package-manager> test
```

Quando existirem scripts específicos:

```txt
<package-manager> run test:unit
<package-manager> run test:integration
<package-manager> run test:migrations
<package-manager> run test:accessibility
<package-manager> run export:check
```

Regras:

- não trocar o gerenciador de pacotes;
- não regenerar lockfile sem necessidade;
- não atualizar o Expo SDK durante uma tarefa de tela;
- não ocultar erros com `any`, `@ts-ignore`, `eslint-disable` amplo ou casts inseguros;
- se o projeto ainda não possuir scripts de qualidade, criá-los somente na tarefa correspondente.

## 7. Decisões fixas do projeto

Estas decisões não podem ser alteradas silenciosamente:

1. funcionamento offline-first;
2. ausência de conta obrigatória;
3. ausência de anúncios na V1;
4. nenhuma integração de assinatura na V1 sem nova decisão comercial;
5. conteúdo oficial e pessoal separados;
6. telas não acessam SQL diretamente;
7. nota interna usa `pitchClass`;
8. acorde lógico é separado da forma na afinação;
9. cada forma oficial possui dez posições físicas;
10. cifra usa acordes estruturados, não texto impossível de transpor;
11. transposição não altera o texto da música;
12. áudio do afinador não é gravado nem persistido;
13. microfone nunca inicia ao abrir uma aba;
14. modo palco não exibe bottom tab, anúncios ou textura;
15. diagramas, medidores e ritmos são componentes vetoriais ou nativos;
16. conteúdo calculado nunca aparece como verificado;
17. conteúdo oficial não é editável pela interface;
18. cifras próprias usam rascunho e exclusão lógica;
19. migrações são transacionais;
20. backup não inclui o catálogo oficial.

## 8. Normalização obrigatória de rotas

As rotas do arquivo 04 representam o endereço conceitual. Para evitar conflito físico no Expo Router, usar:

```txt
app/songs/[songId]/index.tsx
app/songs/[songId]/stage.tsx

app/rhythms/[rhythmId]/index.tsx
app/rhythms/[rhythmId]/practice.tsx
```

Não usar simultaneamente:

```txt
app/songs/[songId].tsx
app/songs/[songId]/stage.tsx
```

nem:

```txt
app/rhythms/[rhythmId].tsx
app/rhythms/[rhythmId]/practice.tsx
```

Os caminhos públicos continuam:

```txt
/songs/:songId
/songs/:songId/stage
/rhythms/:rhythmId
/rhythms/:rhythmId/practice
```

## 9. Estrutura-alvo

```txt
app/
  _layout.tsx
  index.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    songs.tsx
    chords.tsx
    tuner.tsx
    studies.tsx
  onboarding/
  tunings/
  songs/
    [songId]/
      index.tsx
      stage.tsx
      edit.tsx
    create.tsx
    import.tsx
  chords/
  tuner/
  rhythms/
    [rhythmId]/
      index.tsx
      practice.tsx
  metronome/
  library/
  settings/
  error/

src/
  components/
    ui/
    navigation/
    tuning/
    chords/
    songs/
    tuner/
    rhythms/
    metronome/
    settings/
  constants/
  database/
  domain/
  hooks/
  repositories/
  services/
  state/
  types/
  utils/
  validation/

assets/
  fonts/
  icons/
  audio/
  screenshots-reference/

docs/
```

A estrutura pode ser adaptada ao projeto existente, desde que preserve separação de responsabilidades e não crie diretórios duplicados com a mesma função.

## 10. Limites para conteúdo musical

O Codex pode criar **fixtures claramente marcadas para teste**, mas não pode inventar dados de produção sobre:

- notas e oitavas finais das quatro afinações;
- calibres ou alertas de tensão definitivos;
- formas verificadas de acordes;
- letras de músicas comerciais;
- fontes, revisores ou licenças;
- batidas regionais apresentadas como validadas;
- áudios definitivos.

Dados não validados devem usar:

```txt
verificationStatus: calculated | draft
fixtureOnly: true
```

ou permanecer fora do seed de produção.

## 11. Regra global de arquivos proibidos

Em qualquer tarefa, salvo autorização expressa, não alterar:

- documentos `01` a `06`;
- imagens de referência;
- configurações de assinatura e publicação;
- identificadores de bundle ou package;
- arquivos nativos gerados;
- chaves, secrets ou `.env` reais;
- migrações já publicadas;
- conteúdo oficial validado por outra tarefa;
- arquivos fora do módulo em implementação.

## 12. Definition of Ready de uma tarefa

```txt
[ ] tarefa possui ID e objetivo único
[ ] dependências anteriores estão concluídas
[ ] arquivos-alvo existem ou estão explicitamente autorizados
[ ] referências estão disponíveis
[ ] imagem está disponível quando for tarefa de tela
[ ] dados necessários existem ou há fixture autorizada
[ ] critério de aceitação é verificável
[ ] não há bloqueio musical ou jurídico oculto
```

## 13. Definition of Done global

```txt
[ ] apenas o escopo solicitado foi implementado
[ ] TypeScript permanece estrito
[ ] não há import quebrado ou código morto criado
[ ] não há acesso SQL dentro de tela
[ ] não há dependência de internet na função essencial
[ ] tema claro e escuro continuam funcionando
[ ] celular de 320 dp não possui corte horizontal
[ ] alvo de toque essencial possui no mínimo 44 dp
[ ] leitor de tela possui labels úteis
[ ] microfone e áudio só iniciam por ação explícita
[ ] estados de erro não expõem mensagem técnica como principal
[ ] typecheck passa
[ ] lint passa ou a pendência anterior está documentada
[ ] testes relacionados passam
[ ] relatório final foi entregue
```

## 14. Mapa de fases

| Fase | Tarefas | Resultado |
|---|---|---|
| 0 — Auditoria | `T00` | diagnóstico sem alterações |
| 1 — Fundação | `T01–T06` | projeto, tema, UI, navegação e bootstrap |
| 2 — Dados e domínio | `T07–T17` | tipos, SQLite, catálogo, repositórios e backup |
| 3 — Áudio e componentes musicais | `T18–T25` | coordenador de áudio, afinador, metrônomo e UI vetorial |
| 4 — Inicialização e onboarding | `T26–T33` | primeira abertura completa |
| 5 — Uso principal | `T34–T45` | início, afinações, cifras, acordes e afinador |
| 6 — Estudos e biblioteca | `T46–T56` | ritmos, metrônomo, editor, favoritos, configurações e backup |
| 7 — Integração e qualidade | `T57–T60` | lifecycle, acessibilidade, testes e build |

## 15. Checklist mestre

- [ ] `T00` — Auditoria inicial sem alterações
- [ ] `T01` — Normalização do projeto e quality gates
- [ ] `T02` — Tokens, fontes e sistema de tema
- [ ] `T03` — Primitivos globais de interface
- [ ] `T04` — Formulários, feedback e overlays
- [ ] `T05` — Shell de navegação e contratos de rota
- [ ] `T06` — Bootstrap, estado global e limites de erro
- [ ] `T07` — Tipos fundamentais e validação
- [ ] `T08` — Cliente SQLite, transações e migrações
- [ ] `T09` — Schema system_* e catalog_*
- [ ] `T10` — Schema user_* e preferências
- [ ] `T11` — Pipeline de seed e fixtures validadas
- [ ] `T12` — Repositórios de preferências e afinações
- [ ] `T13` — Repositório de acordes e cálculos musicais
- [ ] `T14` — SongDocument, parser e transposição
- [ ] `T15` — Repositórios de cifras, ritmos e busca
- [ ] `T16` — Favoritos, recentes e retomada
- [ ] `T17` — Serviço transacional de backup
- [ ] `T18` — Coordenador de sessão de áudio
- [ ] `T19` — Motor do afinador
- [ ] `T20` — Motor do metrônomo
- [ ] `T21` — Componentes de afinação
- [ ] `T22` — Componentes de acordes
- [ ] `T23` — Componentes de cifras
- [ ] `T24` — Componentes do afinador
- [ ] `T25` — Componentes de ritmo e metrônomo
- [ ] `T26` — Splash, bootstrap visual e erro recuperável
- [ ] `T27` — Tela Boas-vindas
- [ ] `T28` — Tela Nível de experiência
- [ ] `T29` — Tela Afinação inicial
- [ ] `T30` — Tela Visualização dos acordes
- [ ] `T31` — Tela Preferência de execução
- [ ] `T32` — Tela Microfone
- [ ] `T33` — Resumo e integração do onboarding
- [ ] `T34` — Tela Início
- [ ] `T35` — Tela Afinações
- [ ] `T36` — Tela Detalhe da afinação
- [ ] `T37` — Tela Cifras
- [ ] `T38` — Tela Detalhe da cifra
- [ ] `T39` — Modo palco
- [ ] `T40` — Tela Acordes
- [ ] `T41` — Tela Detalhe do acorde
- [ ] `T42` — Tela inicial do Afinador
- [ ] `T43` — Afinador guiado
- [ ] `T44` — Afinador cromático
- [ ] `T45` — Sons de referência
- [ ] `T46` — Tela Estudos
- [ ] `T47` — Tela Ritmos
- [ ] `T48` — Tela Detalhe do ritmo
- [ ] `T49` — Treino de batida
- [ ] `T50` — Tela Metrônomo
- [ ] `T51` — Tela Minhas cifras
- [ ] `T52` — Editor e tela Criar/Editar cifra
- [ ] `T53` — Tela Importar cifra
- [ ] `T54` — Tela Favoritos
- [ ] `T55` — Tela Configurações
- [ ] `T56` — Tela Backup
- [ ] `T57` — Integração de navegação, lifecycle e conflitos de áudio
- [ ] `T58` — Auditoria de acessibilidade e responsividade
- [ ] `T59` — Suíte de testes e integridade
- [ ] `T60` — Auditoria final, export e build de validação

---

# T00 — Auditoria inicial sem alterações

**Fase:** 0 — Auditoria  
**Depende de:** nenhuma  

## Objetivo

Analisar o estado real do repositório e produzir um diagnóstico antes de qualquer edição.

## Arquivos permitidos

- `nenhum arquivo — leitura apenas`

## Arquivos proibidos

- `todo o repositório — não alterar, criar, mover ou excluir arquivos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- identificar stack, versão do Expo, gerenciador de pacotes e scripts disponíveis;
- mapear rotas, componentes, banco, assets, testes e configurações atuais;
- localizar arquivos duplicados, imports quebrados, rotas conflitantes e código morto evidente;
- comparar o projeto com a estrutura-alvo sem assumir que tudo deve ser refeito;
- registrar riscos de dependências, banco, permissões, áudio e build;
- propor a primeira alteração segura, que deve corresponder à tarefa `T01`.

## Regras

- não modificar nenhum arquivo;
- não instalar dependências;
- não executar formatter que escreva no projeto;
- pode executar comandos somente de leitura ou checks que não alterem artefatos versionados.

## Critérios de aceitação

- [ ] relatório contém estrutura atual e lacunas por domínio;
- [ ] rotas conflitantes são identificadas;
- [ ] dependências e scripts reais são listados;
- [ ] nenhuma alteração aparece no diff do Git;
- [ ] a recomendação final não ultrapassa o escopo de `T01`.

## Checks obrigatórios

- `git status --short antes e depois`
- `typecheck, somente se já existir e não gerar arquivos`

---

# T01 — Normalização do projeto e quality gates

**Fase:** 1 — Fundação  
**Depende de:** `T00`  

## Objetivo

Preparar a base do repositório para mudanças incrementais, sem implementar telas completas.

## Arquivos permitidos

- `package.json`
- `lockfile existente, somente se uma instalação autorizada o exigir`
- `tsconfig.json`
- `eslint.config.*`
- `.eslintrc*`
- `.prettierrc*`
- `jest.config.*`
- `vitest.config.*`
- `src/test/**`
- `README.md`
- `.gitignore`

## Arquivos proibidos

- `app/**`
- `src/components/**`
- `src/database/migrations/**`
- `assets/screenshots-reference/**`

## Referências

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- preservar o Expo SDK e o gerenciador de pacotes existentes;
- criar ou corrigir scripts `typecheck`, `lint` e `test`;
- garantir TypeScript estrito, aliases consistentes e resolução compatível com Expo;
- configurar ambiente de testes mínimo sem testar telas ainda;
- adicionar configuração para impedir imports não usados e `any` acidental;
- documentar comandos de desenvolvimento e checks no README.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] scripts de qualidade executam de forma previsível;
- [ ] TypeScript não foi relaxado;
- [ ] nenhum arquivo de tela foi alterado;
- [ ] lockfile não foi trocado por outro gerenciador;
- [ ] o projeto mantém a versão atual do Expo.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T02 — Tokens, fontes e sistema de tema

**Fase:** 1 — Fundação  
**Depende de:** `T01`  

## Objetivo

Implementar a linguagem visual global do Design System, incluindo tema claro, escuro e alto contraste.

## Arquivos permitidos

- `src/constants/colors.ts`
- `src/constants/spacing.ts`
- `src/constants/typography.ts`
- `src/constants/radii.ts`
- `src/constants/motion.ts`
- `src/theme/**`
- `src/hooks/useAppTheme.ts`
- `assets/fonts/**`
- `app/_layout.tsx`
- `src/types/theme.ts`

## Arquivos proibidos

- `app/(tabs)/**`
- `app/onboarding/**`
- `src/database/**`
- `src/services/**`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- criar tokens semânticos sem espalhar hexadecimais nas telas;
- carregar Inter e Bitter a partir de assets locais;
- criar provider/hook de tema com modos system, light, dark e highContrast;
- respeitar escala de fonte do sistema e redução de movimento;
- definir tipografia musical com números tabulares;
- não implementar preferências persistentes nesta tarefa; usar contrato tipado e fallback seguro.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] tema claro usa fundo `#F7F3EA`;
- [ ] tema escuro usa base `#111511`;
- [ ] cores semânticas não dependem de nome de tela;
- [ ] fontes carregam sem internet;
- [ ] falha de fonte usa fallback seguro;
- [ ] alto contraste pode ser ativado pelo provider.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T03 — Primitivos globais de interface

**Fase:** 1 — Fundação  
**Depende de:** `T02`  

## Objetivo

Criar os componentes visuais reutilizáveis que sustentam todas as telas.

## Arquivos permitidos

- `src/components/ui/ScreenContainer.tsx`
- `src/components/ui/AppHeader.tsx`
- `src/components/ui/AppButton.tsx`
- `src/components/ui/AppCard.tsx`
- `src/components/ui/SectionHeader.tsx`
- `src/components/ui/Chip.tsx`
- `src/components/ui/SegmentedControl.tsx`
- `src/components/ui/LoadingState.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/ErrorState.tsx`
- `src/components/ui/index.ts`
- `src/types/ui.ts`
- `src/components/ui/__tests__/**`

## Arquivos proibidos

- `app/**, exceto arquivo de demonstração temporário não versionado`
- `src/database/**`
- `src/services/**`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- implementar variantes e tamanhos tipados;
- respeitar safe area, teclado e largura máxima de tablet;
- garantir estados pressed, focused, disabled e loading;
- adicionar accessibilityRole, accessibilityLabel e foco visível;
- evitar sombra pesada e card aninhado;
- criar barrel export sem import circular.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] alvos interativos possuem no mínimo 44 dp;
- [ ] ScreenContainer não duplica safe area;
- [ ] AppButton preserva largura durante loading;
- [ ] cards não clicáveis não parecem botões;
- [ ] componentes funcionam nos três modos de contraste;
- [ ] testes de renderização básica passam.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T04 — Formulários, feedback e overlays

**Fase:** 1 — Fundação  
**Depende de:** `T03`  

## Objetivo

Criar campos, seletores, feedbacks e superfícies temporárias consistentes.

## Arquivos permitidos

- `src/components/ui/SearchField.tsx`
- `src/components/ui/TextField.tsx`
- `src/components/ui/SelectField.tsx`
- `src/components/ui/BottomSheet.tsx`
- `src/components/ui/Dialog.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/OfflineBadge.tsx`
- `src/components/ui/index.ts`
- `src/state/toast/**`
- `src/components/ui/__tests__/**`

## Arquivos proibidos

- `app/**`
- `src/database/**`
- `src/services/audio*`
- `src/services/tuner*`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- manter label visível em campos;
- implementar helper, erro, contador e estado desativado;
- usar bottom sheet em celular e comportamento adaptável em tablet;
- proteger fechamento quando houver edição não salva;
- implementar toast com ação desfazer quando aplicável;
- não usar dialog para confirmação rotineira.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] teclado não cobre ação principal;
- [ ] campos possuem labels acessíveis;
- [ ] bottom sheet respeita safe area;
- [ ] dialog suporta foco e saída previsível;
- [ ] toast não bloqueia navegação;
- [ ] nenhum overlay inicia lógica de domínio.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T05 — Shell de navegação e contratos de rota

**Fase:** 1 — Fundação  
**Depende de:** `T03`, `T04`  

## Objetivo

Configurar Expo Router, cinco abas e pilhas secundárias sem implementar o conteúdo final das telas.

## Arquivos permitidos

- `app/_layout.tsx`
- `app/index.tsx`
- `app/(tabs)/_layout.tsx`
- `app/**/_layout.tsx`
- `src/components/navigation/**`
- `src/constants/routes.ts`
- `src/types/navigation.ts`
- `src/hooks/useSafeNavigation.ts`
- `app/** placeholder mínimo`

## Arquivos proibidos

- `src/database/**`
- `src/services/**`
- `implementação visual completa das 32 telas`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- criar abas Início, Cifras, Acordes, Afinador e Estudos com labels sempre visíveis;
- normalizar as rotas dinâmicas de songs e rhythms usando pastas com `index.tsx`;
- definir grupos em que tabs ficam visíveis e contextos em que são ocultadas;
- garantir fallback de rota e retorno previsível;
- criar placeholders tipados apenas para validar navegação;
- não iniciar áudio ou restaurar ações sonoras ao navegar.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] todas as rotas previstas podem ser resolvidas;
- [ ] não existe conflito arquivo/pasta em parâmetros dinâmicos;
- [ ] modo palco, onboarding, editor, backup crítico e erro podem ocultar tabs;
- [ ] troca de aba preserva estado de navegação suportado;
- [ ] botão voltar fecha overlay antes da rota;
- [ ] deep link inválido cai em fallback seguro.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T06 — Bootstrap, estado global e limites de erro

**Fase:** 1 — Fundação  
**Depende de:** `T05`  

## Objetivo

Criar a máquina de inicialização do app e os limites de erro sem acoplar telas ao banco.

## Arquivos permitidos

- `src/state/appBootstrap/**`
- `src/state/appLifecycle/**`
- `src/components/system/AppBootstrapGate.tsx`
- `src/components/system/AppErrorBoundary.tsx`
- `src/hooks/useAppBootstrap.ts`
- `app/_layout.tsx`
- `app/index.tsx`
- `src/types/bootstrap.ts`
- `src/utils/logger.ts`

## Arquivos proibidos

- `src/database/migrations/**`
- `app/error/recovery.tsx, salvo placeholder mínimo`
- `serviços de áudio finais`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- modelar estados booting, checking_database, migrating_database, restoring_preferences, ready, recoverable_error e fatal_error;
- criar contratos para banco e preferências a serem conectados depois;
- não mostrar código técnico como mensagem principal;
- não restaurar microfone, áudio ou metrônomo automaticamente;
- registrar logs técnicos locais sem conteúdo de cifras ou dados sensíveis;
- redirecionar para onboarding ou tabs somente quando o estado estiver pronto.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] o app não entra em loop de redirects;
- [ ] erro recuperável e fatal são distinguíveis;
- [ ] logs não contêm conteúdo pessoal;
- [ ] estado de bootstrap é testável sem dispositivo;
- [ ] nenhuma função exige internet.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T07 — Tipos fundamentais e validação

**Fase:** 2 — Dados e domínio  
**Depende de:** `T01`  

## Objetivo

Implementar tipos musicais, tipos de domínio e schemas de validação independentes da interface.

## Arquivos permitidos

- `src/types/**`
- `src/domain/music/**`
- `src/validation/**`
- `src/utils/music/**`
- `src/domain/**/__tests__/**`

## Arquivos proibidos

- `app/**`
- `src/components/**`
- `src/database/client.ts`
- `src/database/migrations/**`

## Referências

- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- implementar PitchClass, DifficultyLevel, ContentOrigin, VerificationStatus e EntityRef;
- implementar conversão pitchClass, MIDI, frequência e cents;
- criar schemas para SongDocument, afinação, forma de acorde, preferências e backup;
- validar casas, dedos, oitavas, cordas físicas e pares;
- criar normalização de acidentes sem depender de idioma na representação interna;
- adicionar testes de limites e equivalência enarmônica.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] A4 produz MIDI 69 e frequência calculada correta para calibração 440;
- [ ] pitchClass aceita somente 0–11;
- [ ] formas inválidas são rejeitadas;
- [ ] schemas não importam componentes React;
- [ ] testes cobrem valores de fronteira.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T08 — Cliente SQLite, transações e migrações

**Fase:** 2 — Dados e domínio  
**Depende de:** `T07`  

## Objetivo

Criar a infraestrutura segura do banco local `viola.db`.

## Arquivos permitidos

- `src/database/client.ts`
- `src/database/pragmas.ts`
- `src/database/transaction.ts`
- `src/database/migrations/**`
- `src/database/schema/**`
- `src/database/__tests__/**`
- `src/types/database.ts`

## Arquivos proibidos

- `app/**`
- `src/components/**`
- `dados de seed de produção`

## Referências

- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- habilitar foreign keys e pragmas compatíveis com a plataforma;
- criar runner de migração com checksum e transação;
- impedir aplicação duplicada da mesma versão;
- implementar rollback em falha;
- expor cliente e transação sem permitir SQL em telas;
- criar teste de banco novo, banco atualizado e falha simulada.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] migração é atômica;
- [ ] falha não registra versão concluída;
- [ ] foreign keys estão ativas;
- [ ] cliente pode ser substituído em testes;
- [ ] nenhuma tela importa o cliente.

## Checks obrigatórios

- `typecheck`
- `lint`
- `test:migrations`

---

# T09 — Schema system_* e catalog_*

**Fase:** 2 — Dados e domínio  
**Depende de:** `T08`  

## Objetivo

Criar o schema inicial do sistema e do catálogo oficial sem inserir conteúdo musical definitivo.

## Arquivos permitidos

- `src/database/schema/**`
- `src/database/migrations/001_initial_schema.*`
- `src/types/database.ts`
- `src/database/__tests__/**`

## Arquivos proibidos

- `src/database/seed/data/production/**`
- `app/**`
- `src/components/**`

## Referências

- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- criar tabelas system_meta, system_migrations, releases e integrity events;
- criar fontes, licenças, revisores, assets, afinações, ordens e cordas;
- criar qualidades, acordes, formas, posições e pestanas;
- criar ritmos, padrões, passos, exercícios, músicas e arranjos;
- adicionar constraints, índices e relacionamentos previstos;
- não criar licença unknown em conteúdo publicável.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] schema cria em banco vazio;
- [ ] cada forma oficial exige integridade verificável para dez posições no validador;
- [ ] IDs oficiais são textuais;
- [ ] índices críticos existem;
- [ ] migration `001` não contém conteúdo musical inventado.

## Checks obrigatórios

- `typecheck`
- `lint`
- `test:migrations`
- `testes de constraints`

---

# T10 — Schema user_* e preferências

**Fase:** 2 — Dados e domínio  
**Depende de:** `T09`  

## Objetivo

Criar tabelas pessoais, preferências, sessões e exclusão lógica sem risco de sobrescrita por atualização.

## Arquivos permitidos

- `src/database/schema/**`
- `src/database/migrations/001_initial_schema.* se ainda não publicada; caso contrário nova migração`
- `src/types/database.ts`
- `src/database/__tests__/**`

## Arquivos proibidos

- `app/**`
- `src/components/**`
- `alteração destrutiva de catalog_*`

## Referências

- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- criar user_profile e preferências por domínio;
- criar cifras, versões, índice de acordes, notas e rascunhos;
- criar favoritos, recentes, resume state e sessões;
- criar afinações e formas pessoais preparadas para evolução;
- criar tabelas de backup e entitlement somente se previstas no schema, sem integrar compra;
- adicionar soft delete e constraints de booleanos.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] migração preserva tabelas user_* existentes;
- [ ] preferências possuem valores padrão seguros;
- [ ] cifras próprias usam deleted_at;
- [ ] nenhum dado pessoal exige nome ou e-mail;
- [ ] sessões de afinador não armazenam áudio.

## Checks obrigatórios

- `typecheck`
- `lint`
- `test:migrations`
- `teste de upgrade preservando user_*`

---

# T11 — Pipeline de seed e fixtures validadas

**Fase:** 2 — Dados e domínio  
**Depende de:** `T09`, `T10`  

## Objetivo

Criar importador e validador de catálogo, separando fixtures de teste e seed de produção.

## Arquivos permitidos

- `src/database/seed/**`
- `src/database/mappers/**`
- `src/database/__tests__/seed*`
- `assets/audio/fixtures/**`
- `src/types/seed.ts`

## Arquivos proibidos

- `dados musicais de produção sem validação`
- `letras comerciais`
- `licenças fictícias apresentadas como reais`

## Referências

- `docs/01_APP_BLUEPRINT.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- criar formato versionado de seed;
- validar IDs, FKs, notas, oitavas, frequências, posições, licenças e assets;
- criar conjunto mínimo de fixtures explicitamente não publicáveis;
- separar diretórios `fixtures` e `production`;
- calcular checksum e item count;
- falhar de forma clara quando um ativo ou relação estiver ausente.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] fixtures não são confundidas com catálogo de produção;
- [ ] seed inválido não é parcialmente aplicado;
- [ ] validador detecta forma com menos de dez posições;
- [ ] validador rejeita licença unknown para publicação;
- [ ] checksums são determinísticos.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T12 — Repositórios de preferências e afinações

**Fase:** 2 — Dados e domínio  
**Depende de:** `T10`, `T11`  

## Objetivo

Expor preferências e afinações por contratos tipados, sem SQL nas telas.

## Arquivos permitidos

- `src/repositories/preferencesRepository.ts`
- `src/repositories/tuningRepository.ts`
- `src/repositories/contracts/**`
- `src/hooks/usePreferences.ts`
- `src/hooks/useTunings.ts`
- `src/hooks/useActiveTuning.ts`
- `src/repositories/__tests__/**`

## Arquivos proibidos

- `app/**`
- `src/components/**`
- `src/services/audio*`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- implementar leitura e atualização atômica de preferências;
- buscar, listar, detalhar e ativar afinações;
- validar referência catalog/user antes de salvar;
- retornar view models adequados, não linhas SQL cruas;
- tratar afinação provisória;
- expor estado loading, ready e error aos hooks.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] ativar afinação inexistente falha com erro de domínio;
- [ ] preferências podem ser restauradas;
- [ ] hook não executa SQL;
- [ ] afinação ativa possui fallback seguro;
- [ ] testes usam banco isolado.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T13 — Repositório de acordes e cálculos musicais

**Fase:** 2 — Dados e domínio  
**Depende de:** `T07`, `T11`, `T12`  

## Objetivo

Implementar consultas de acordes, formas e cálculos sem acoplar a diagramas visuais.

## Arquivos permitidos

- `src/repositories/chordRepository.ts`
- `src/domain/music/chords/**`
- `src/domain/music/voicing/**`
- `src/hooks/useChords.ts`
- `src/hooks/useChordShape.ts`
- `src/repositories/__tests__/chord*`
- `src/domain/**/__tests__/**`

## Arquivos proibidos

- `src/components/chords/**`
- `app/**`
- `seed de produção não validado`

## Referências

- `docs/01_APP_BLUEPRINT.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- consultar por afinação, fundamental, qualidade, dificuldade, pestana, região e status;
- formatar símbolos conforme preferência de acidentes;
- calcular notas resultantes e intervalos para validação;
- separar formas verified, calculated e user_created;
- não promover forma calculada para verificada;
- expor alternativas e posição recomendada.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] busca aceita Ré, D, D7 e equivalentes previstos;
- [ ] filtros são combináveis;
- [ ] forma retornada possui dez posições;
- [ ] status é preservado no view model;
- [ ] cálculo não depende de React.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T14 — SongDocument, parser e transposição

**Fase:** 2 — Dados e domínio  
**Depende de:** `T07`, `T13`  

## Objetivo

Implementar o documento estruturado de cifras, parser local e transposição segura.

## Arquivos permitidos

- `src/domain/songs/**`
- `src/validation/songDocument*`
- `src/utils/song*`
- `src/domain/songs/__tests__/**`

## Arquivos proibidos

- `app/**`
- `src/components/songs/**`
- `letras comerciais em fixtures`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- implementar SongDocument versionado e validação de IDs internos;
- transpor somente ChordToken por semitons;
- preservar texto, originalSpelling e estrutura;
- implementar parser dos dois formatos simples previstos;
- classificar acordes reconhecidos, não reconhecidos e seções;
- limitar tamanho e rejeitar HTML/script.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] transposição não altera texto;
- [ ] restaurar tom original produz documento equivalente;
- [ ] parser retorna warnings sem descartar texto;
- [ ] documento inválido não é salvo;
- [ ] testes cobrem sustenidos, bemóis e baixo invertido.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T15 — Repositórios de cifras, ritmos e busca

**Fase:** 2 — Dados e domínio  
**Depende de:** `T11`, `T14`  

## Objetivo

Implementar listagem, detalhe, busca local e persistência dos principais conteúdos.

## Arquivos permitidos

- `src/repositories/songRepository.ts`
- `src/repositories/rhythmRepository.ts`
- `src/repositories/searchRepository.ts`
- `src/hooks/useSongs.ts`
- `src/hooks/useSong.ts`
- `src/hooks/useRhythms.ts`
- `src/hooks/useRhythm.ts`
- `src/repositories/__tests__/**`
- `src/database/queries/**`

## Arquivos proibidos

- `app/**`
- `src/components/**`
- `busca online`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- implementar busca normalizada por título, artista, compositor, tags e ritmo;
- usar FTS5 somente se compatível, com fallback documentado;
- filtrar por origem, dificuldade, afinação, tom e favorito;
- persistir cifras próprias, versões, rascunhos e índices;
- listar ritmos, padrões, passos e exercícios;
- paginar resultados sem carregar o catálogo inteiro.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] busca funciona offline;
- [ ] resultado oficial e pessoal é distinguível;
- [ ] cifra apagada logicamente não aparece por padrão;
- [ ] rascunho não aparece na biblioteca normal;
- [ ] paginação possui ordem determinística.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T16 — Favoritos, recentes e retomada

**Fase:** 2 — Dados e domínio  
**Depende de:** `T12`, `T13`, `T15`  

## Objetivo

Implementar biblioteca pessoal polimórfica e retomada segura.

## Arquivos permitidos

- `src/repositories/favoritesRepository.ts`
- `src/repositories/recentRepository.ts`
- `src/repositories/resumeRepository.ts`
- `src/hooks/useFavorites.ts`
- `src/hooks/useRecents.ts`
- `src/hooks/useResumeState.ts`
- `src/repositories/__tests__/**`

## Arquivos proibidos

- `app/**`
- `src/components/**`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- validar existência antes de favoritar;
- implementar atualização otimista com rollback no hook;
- deduplicar recentes e incrementar openCount;
- aplicar limites por tipo;
- armazenar somente retomada segura;
- não retomar microfone, áudio, rolagem ativa ou compra.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] favorito duplicado não é criado;
- [ ] referência órfã é ignorada ou limpa;
- [ ] recentes respeitam limites;
- [ ] retomada de cifra preserva posição e tom quando válido;
- [ ] ações sonoras nunca retomam automaticamente.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T17 — Serviço transacional de backup

**Fase:** 2 — Dados e domínio  
**Depende de:** `T10`, `T15`, `T16`  

## Objetivo

Implementar exportação e importação local versionada com checksum e rollback.

## Arquivos permitidos

- `src/services/backupService.ts`
- `src/repositories/backupRepository.ts`
- `src/domain/backup/**`
- `src/hooks/useBackup.ts`
- `src/services/__tests__/backup*`
- `src/types/backup.ts`

## Arquivos proibidos

- `app/settings/backup.tsx`
- `catalog_* no payload`
- `secrets`
- `upload para nuvem`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- gerar manifesto e payload versionados;
- calcular e validar SHA-256;
- excluir catálogo, buffers, logs e temporários;
- validar tamanho e schema antes de iniciar transação;
- criar snapshot, importar, validar relações e aplicar rollback em falha;
- suportar prévia de contagem e estratégia mesclar/substituir quando segura.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] backup corrompido é rejeitado antes de escrita;
- [ ] falha de importação preserva banco anterior;
- [ ] catálogo não é exportado;
- [ ] payload não contém áudio;
- [ ] teste round-trip preserva dados pessoais selecionados.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes de backup e rollback`

---

# T18 — Coordenador de sessão de áudio

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T06`  

## Objetivo

Centralizar conflitos entre afinador, metrônomo, sons de referência e áudio de acordes.

## Arquivos permitidos

- `src/services/audioSessionCoordinator.ts`
- `src/services/audioService.ts`
- `src/state/audio/**`
- `src/hooks/useAudioSession.ts`
- `src/types/audio.ts`
- `src/services/__tests__/audio*`

## Arquivos proibidos

- `app/**`
- `src/components/**`
- `gravação ou persistência de áudio`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- modelar owners tuner, metronome, reference, chord e rhythm_demo;
- garantir exclusividade quando as funções forem incompatíveis;
- pausar e liberar recursos em background, interrupção ou saída;
- não retomar automaticamente após chamada ou alarme;
- permitir consulta do estado e solicitação de troca com confirmação;
- manter implementação substituível em testes.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] duas sessões incompatíveis não tocam simultaneamente;
- [ ] saída libera microfone/áudio;
- [ ] background não mantém captura indevida;
- [ ] estado é observável por hooks;
- [ ] nenhum buffer é persistido.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T19 — Motor do afinador

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T07`, `T18`  

## Objetivo

Implementar captura local, detecção, suavização e estados do afinador sem criar a interface final.

## Arquivos permitidos

- `src/services/tunerService.ts`
- `src/domain/tuner/**`
- `src/hooks/useTuner.ts`
- `src/types/tuner.ts`
- `src/services/__tests__/tuner*`
- `src/domain/tuner/__tests__/**`

## Arquivos proibidos

- `app/tuner/**`
- `src/components/tuner/**`
- `armazenamento de áudio bruto`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- solicitar microfone apenas após comando explícito do hook;
- modelar idle, permission, initializing, listening, paused e error;
- calcular nota, oitava, frequência, cents e qualidade do sinal;
- implementar tolerância, estabilidade e avanço guiado;
- detectar nota distante do alvo e evitar instrução perigosa;
- não salvar leituras contínuas ou buffers.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] start é necessário para iniciar captura;
- [ ] stop libera captura;
- [ ] cents usa calibração configurável;
- [ ] sinal fraco não produz confirmação falsa;
- [ ] modo guiado e cromático reutilizam o mesmo núcleo;
- [ ] testes usam fonte sintética de frequência.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T20 — Motor do metrônomo

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T18`  

## Objetivo

Implementar relógio musical estável, tap tempo e lifecycle sem interface final.

## Arquivos permitidos

- `src/services/metronomeService.ts`
- `src/domain/metronome/**`
- `src/hooks/useMetronome.ts`
- `src/types/metronome.ts`
- `src/services/__tests__/metronome*`

## Arquivos proibidos

- `app/metronome/**`
- `src/components/metronome/**`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- modelar stopped, counting_in, playing e paused;
- implementar BPM, compasso, acento do primeiro tempo e count-in;
- implementar tap tempo por intervalo mediano e reset por pausa longa;
- não depender de animação para precisão sonora;
- integrar ownership com coordenador de áudio;
- pausar em interrupção e não retomar automaticamente.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] BPM respeita limites;
- [ ] primeiro tempo é distinguível;
- [ ] tap tempo rejeita amostras insuficientes;
- [ ] navegação permitida preserva estado sem autoplay;
- [ ] testes usam clock controlado.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T21 — Componentes de afinação

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T03`, `T12`  

## Objetivo

Criar componentes visuais reutilizáveis para afinação e pares de cordas.

## Arquivos permitidos

- `src/components/tuning/ActiveTuningPill.tsx`
- `src/components/tuning/TuningCourseRow.tsx`
- `src/components/tuning/StringPairVisual.tsx`
- `src/components/tuning/ReferenceSoundButton.tsx`
- `src/components/tuning/TuningStatusBadge.tsx`
- `src/components/tuning/__tests__/**`

## Arquivos proibidos

- `app/tunings/**`
- `src/repositories/**`
- `src/services/audio*`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- implementar variantes compacta, padrão, somente leitura e incompatibilidade;
- mostrar número da ordem, notas, oitavas, tipo do par e estado;
- não depender apenas de espessura ou cor;
- emitir callbacks sem executar navegação ou áudio diretamente;
- suportar font scale e tablet;
- adicionar labels acessíveis completos.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] afinação ativa aparece em um único componente por tela;
- [ ] notas e oitavas são legíveis;
- [ ] estado afinado/abaixo/acima combina texto, ícone e cor;
- [ ] componentes não acessam banco;
- [ ] snapshot não usa imagem raster.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T22 — Componentes de acordes

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T03`, `T13`  

## Objetivo

Implementar o diagrama vetorial e os componentes de acorde.

## Arquivos permitidos

- `src/components/chords/ChordDiagram.tsx`
- `src/components/chords/ChordCard.tsx`
- `src/components/chords/ChordStatusBadge.tsx`
- `src/components/chords/ChordShapeSelector.tsx`
- `src/components/chords/__tests__/**`
- `src/utils/chordDiagramLayout.ts`

## Arquivos proibidos

- `app/chords/**`
- `assets/images de diagramas`
- `src/repositories/**`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- renderizar cinco ordens e dez cordas por SVG/Canvas compatível;
- renderizar solta, abafada, pressionada, dedo, pestana e casa inicial;
- suportar notas, intervalos, canhoto, compacto e detalhado;
- manter proporção e alvos de toque;
- gerar descrição acessível da forma;
- mostrar status fora do diagrama.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] nenhuma imagem raster é usada;
- [ ] forma com dez posições renderiza sem sobreposição;
- [ ] modo canhoto espelha somente apresentação;
- [ ] tema escuro mantém contraste;
- [ ] label acessível descreve as posições;
- [ ] testes cobrem pestana e cordas abafadas.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T23 — Componentes de cifras

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T03`, `T14`, `T15`  

## Objetivo

Criar renderização de listas, cabeçalho, seções, linhas de acordes e transposição.

## Arquivos permitidos

- `src/components/songs/SongRow.tsx`
- `src/components/songs/SongHeader.tsx`
- `src/components/songs/TransposeControl.tsx`
- `src/components/songs/ChordLine.tsx`
- `src/components/songs/SongSection.tsx`
- `src/components/songs/AutoScrollControl.tsx`
- `src/components/songs/ChordPreviewSheet.tsx`
- `src/components/songs/__tests__/**`

## Arquivos proibidos

- `app/songs/**`
- `src/repositories/**`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- renderizar acordes estruturados sem quebrar alinhamento indevidamente;
- manter título e metadados compactos;
- permitir toque no acorde por callback;
- implementar controle −, tom e + com alvo de 44 dp;
- criar controles de palco sem cobrir a cifra;
- não incluir letra comercial em teste.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] acorde e palavra não se separam de forma inválida nos casos de teste;
- [ ] font scale grande continua legível;
- [ ] controle de transposição mostra tom original;
- [ ] bottom sheet não perde posição da cifra;
- [ ] componentes não alteram documento original.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T24 — Componentes do afinador

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T03`, `T19`, `T21`  

## Objetivo

Criar medidor, qualidade de sinal e visualização de progresso do afinador.

## Arquivos permitidos

- `src/components/tuner/TunerGauge.tsx`
- `src/components/tuner/SignalQuality.tsx`
- `src/components/tuner/TuningProgress.tsx`
- `src/components/tuner/DetectedNote.tsx`
- `src/components/tuner/__tests__/**`

## Arquivos proibidos

- `app/tuner/**`
- `src/services/tunerService.ts`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- renderizar escala −50 a +50 cents e centro em zero;
- suavizar apenas a apresentação, sem alterar a fonte de verdade;
- mostrar nota, alvo, frequência, instrução e qualidade de sinal;
- combinar cor com texto e ícone;
- suportar tema escuro e alto contraste;
- não animar em excesso quando reduce motion estiver ativo.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] zero cents está centralizado;
- [ ] fora da escala é clampado visualmente sem falsificar valor;
- [ ] sinal fraco é textual;
- [ ] Afinada aparece somente dentro da tolerância recebida;
- [ ] medidor não inicia microfone.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T25 — Componentes de ritmo e metrônomo

**Fase:** 3 — Áudio e componentes musicais  
**Depende de:** `T03`, `T15`, `T20`  

## Objetivo

Criar padrão de batida, passos e dial do metrônomo.

## Arquivos permitidos

- `src/components/rhythms/RhythmPattern.tsx`
- `src/components/rhythms/RhythmStep.tsx`
- `src/components/rhythms/RhythmCard.tsx`
- `src/components/metronome/MetronomeDial.tsx`
- `src/components/metronome/BeatIndicator.tsx`
- `src/components/rhythms/__tests__/**`
- `src/components/metronome/__tests__/**`

## Arquivos proibidos

- `app/rhythms/**`
- `app/metronome/**`
- `src/services/metronomeService.ts`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- renderizar direção, ação, intensidade, pausa, acento e contagem;
- disponibilizar legenda e versão para canhoto;
- destacar passo atual sem depender somente de cor;
- renderizar BPM com dígitos tabulares;
- expor callbacks para play, pause, tap e ajuste;
- não amarrar precisão do motor à animação.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] padrão cabe em 320 dp ou oferece rolagem claramente indicada;
- [ ] canhoto espelha visual aplicável;
- [ ] pausa é distinguível;
- [ ] dial aceita fonte ampliada;
- [ ] componentes não controlam áudio diretamente.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T26 — Splash, bootstrap visual e erro recuperável

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T06`, `T03`  

## Objetivo

Conectar a splash nativa/visual ao bootstrap e implementar a tela de recuperação prevista na Screen Spec 32.

## Arquivos permitidos

- `app/_layout.tsx`
- `app/index.tsx`
- `app/error/recovery.tsx`
- `src/components/system/**`
- `src/screens/system/**`
- `assets/icons/**, somente se já aprovados`
- `src/**/__tests__/t26*`

## Arquivos proibidos

- `src/database/migrations/**`
- `rotas de conteúdo`
- `assets/screenshots-reference/**`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `assets/screenshots-reference/01_splash.png`
- `assets/screenshots-reference/32_error_recovery.png`
- `docs/06_CODEX_TASKS.md`

## Implementação

- manter splash simples e sem solicitação de permissão;
- mostrar tela própria quando migração ou recuperação exigir tempo;
- implementar ações tentar novamente, modo limitado quando disponível e detalhes técnicos secundários;
- não recomendar reinstalação antes de informar risco aos dados;
- garantir que o bootstrap escolha onboarding ou app corretamente;
- testar fluxo normal, erro recuperável e erro fatal.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] splash não fica presa;
- [ ] permissões não são solicitadas;
- [ ] erro não mostra stack trace como mensagem principal;
- [ ] modo limitado só aparece quando realmente suportado;
- [ ] redirecionamento final é determinístico.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T27 — Boas-vindas

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T26`  

## Objetivo

Apresentar a proposta do app e iniciar o onboarding.

## Arquivos permitidos

- `app/onboarding/index.tsx`
- `src/components/onboarding/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/onboarding/**`
- `src/**/__tests__/t27*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/02_onboarding_welcome.png`

## Implementação

- implementar somente a tela `Boas-vindas` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader e AppButton;
- não pedir nome, conta, compra ou permissão;
- persistir somente que o onboarding foi iniciado ao tocar em Começar;
- navegar para experiência.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] não existe carrossel longo;
- [ ] CTA Começar é o único CTA principal.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T28 — Nível de experiência

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T27`, `T12`  

## Objetivo

Registrar o nível para ajustar padrões sem limitar funcionalidades.

## Arquivos permitidos

- `app/onboarding/experience.tsx`
- `src/components/onboarding/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/onboarding/**`
- `src/**/__tests__/t28*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/03_onboarding_experience.png`

## Implementação

- implementar somente a tela `Nível de experiência` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, AppCard/selection card e AppButton;
- oferecer iniciante, intermediário e experiente;
- habilitar Continuar somente após seleção;
- salvar progresso de onboarding localmente.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] voltar preserva a seleção;
- [ ] nível não bloqueia recursos.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T29 — Afinação inicial

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T28`, `T12`, `T21`  

## Objetivo

Definir a afinação ativa inicial ou um padrão provisório.

## Arquivos permitidos

- `app/onboarding/tuning.tsx`
- `src/components/onboarding/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/onboarding/**`
- `src/**/__tests__/t29*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/04_onboarding_tuning.png`

## Implementação

- implementar somente a tela `Afinação inicial` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill/lista, TuningCourseRow e AppButton;
- listar somente afinações disponíveis no repositório;
- implementar Não sei qual uso sem alegar reconhecimento automático;
- usar Cebolão em Ré apenas como padrão provisório configurável, se existir no catálogo validado.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] afinação não validada não é inventada;
- [ ] pular cria estado provisório claramente marcado.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T30 — Visualização dos acordes

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T29`, `T22`  

## Objetivo

Escolher entre cinco ordens e dez cordas usando a mesma forma de exemplo.

## Arquivos permitidos

- `app/onboarding/diagram.tsx`
- `src/components/onboarding/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/onboarding/**`
- `src/**/__tests__/t30*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/05_onboarding_diagram.png`

## Implementação

- implementar somente a tela `Visualização dos acordes` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ChordDiagram, SegmentedControl e AppButton;
- usar fixture segura ou forma validada do catálogo;
- mostrar prévia equivalente nos dois modos;
- salvar diagramMode.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] nenhuma imagem de diagrama é usada;
- [ ] troca de modo não altera os dados musicais.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T31 — Preferência de execução

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T30`, `T12`  

## Objetivo

Registrar destro ou canhoto sem espelhar a navegação.

## Arquivos permitidos

- `app/onboarding/handedness.tsx`
- `src/components/onboarding/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/onboarding/**`
- `src/**/__tests__/t31*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/06_onboarding_handedness.png`

## Implementação

- implementar somente a tela `Preferência de execução` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, selection cards e AppButton;
- mostrar prévia musical simples;
- salvar handedness separadamente de diagramOrientation;
- espelhar somente conteúdo aplicável.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] texto, voltar e tabs não são espelhados;
- [ ] opção pode ser alterada depois.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T32 — Microfone

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T31`, `T19`  

## Objetivo

Explicar privacidade e solicitar microfone somente após ação explícita.

## Arquivos permitidos

- `app/onboarding/microphone.tsx`
- `src/components/onboarding/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/onboarding/**`
- `src/**/__tests__/t32*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/07_onboarding_microphone.png`

## Implementação

- implementar somente a tela `Microfone` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, AppButton e estado de permissão;
- implementar Testar o afinador e Agora não;
- mostrar texto de processamento local e ausência de gravação;
- solicitar permissão nativa somente após Testar;
- tratar concedida, negada e bloqueada.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] negar não bloqueia o app;
- [ ] Agora não não dispara prompt nativo;
- [ ] configurações do sistema só são oferecidas quando bloqueada.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T33 — Resumo e integração do onboarding

**Fase:** 4 — Inicialização e onboarding  
**Depende de:** `T32`, `T12`, `T05`  

## Objetivo

Revisar escolhas, concluir o onboarding e entrar no app.

## Arquivos permitidos

- `app/onboarding/summary.tsx`
- `src/components/onboarding/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/onboarding/**`
- `src/**/__tests__/t33*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/08_onboarding_summary.png`

## Implementação

- implementar somente a tela `Resumo e integração do onboarding` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, resumo de preferências e AppButton;
- mostrar afinação, diagrama, execução e status do microfone;
- permitir revisar sem perder dados;
- marcar completed somente ao tocar Entrar no app;
- navegar para Início substituindo a pilha do onboarding.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] fechar o app antes do CTA mantém onboarding incompleto;
- [ ] reabrir retoma a etapa correta.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T34 — Início

**Fase:** 5 — Uso principal  
**Depende de:** `T33`, `T16`, `T21`  

## Objetivo

Oferecer a retomada e a ação mais provável sem duplicar informações.

## Arquivos permitidos

- `app/(tabs)/index.tsx`
- `src/components/home/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/home/**`
- `src/**/__tests__/t34*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/09_home.png`

## Implementação

- implementar somente a tela `Início` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill, AppButton, cards de continuação e atalhos;
- mostrar Afinar agora como ação principal;
- mostrar Continuar somente quando houver resume state seguro;
- adaptar estado novo, recorrente, sem recentes e afinação provisória;
- consultar favoritos e recentes por hooks.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] não exibe seções vazias sem explicação;
- [ ] não duplica XP, métricas ou conteúdo inexistente;
- [ ] atalhos navegam para rotas válidas.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T35 — Afinações

**Fase:** 5 — Uso principal  
**Depende de:** `T34`, `T12`, `T21`  

## Objetivo

Listar, buscar e selecionar afinações locais.

## Arquivos permitidos

- `app/tunings/index.tsx`
- `src/components/tuning/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/tuning/**`
- `src/**/__tests__/t35*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/10_tunings_list.png`

## Implementação

- implementar somente a tela `Afinações` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill, SearchField, Tuning cards e AppButton;
- buscar por nome e alias;
- preservar posição e filtros ao voltar;
- mostrar status, dificuldade e acorde aberto somente quando disponíveis;
- abrir detalhe antes de ativação quando necessário.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] busca sem resultado oferece limpar;
- [ ] afinação ativa é distinguível sem usar somente cor.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T36 — Detalhe da afinação

**Fase:** 5 — Uso principal  
**Depende de:** `T35`, `T18`, `T21`  

## Objetivo

Explicar uma afinação, reproduzir referências e permitir ativação consciente.

## Arquivos permitidos

- `app/tunings/[tuningId].tsx`
- `src/components/tuning/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/tuning/**`
- `src/**/__tests__/t36*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/11_tuning_detail.png`

## Implementação

- implementar somente a tela `Detalhe da afinação` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, TuningCourseRow, ReferenceSoundButton e AppButton;
- mostrar cinco ordens, dez cordas, notas, oitavas, par e aviso de tensão quando validado;
- parar áudio anterior ao tocar outro;
- ativar somente após verificar contexto;
- oferecer abrir afinador e acordes compatíveis.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] sair interrompe referência sonora;
- [ ] afinação já ativa não executa escrita redundante;
- [ ] alerta de tensão não é inventado.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T37 — Cifras

**Fase:** 5 — Uso principal  
**Depende de:** `T34`, `T15`, `T16`, `T23`  

## Objetivo

Pesquisar e filtrar cifras oficiais e pessoais disponíveis offline.

## Arquivos permitidos

- `app/(tabs)/songs.tsx`
- `src/components/songs/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/songs/**`
- `src/**/__tests__/t37*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/12_songs_list.png`

## Implementação

- implementar somente a tela `Cifras` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill, SearchField, SongRow, chips e EmptyState;
- implementar seções Todas, Favoritas, Minhas cifras, autorizadas e Recentes;
- buscar por campos previstos;
- distinguir origem e compatibilidade;
- oferecer Criar e Importar em estado sem resultado apropriado.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] não oferece busca online;
- [ ] letra não aparece na lista;
- [ ] filtros ativos ficam visíveis.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T38 — Detalhe da cifra

**Fase:** 5 — Uso principal  
**Depende de:** `T37`, `T14`, `T15`, `T18`, `T23`  

## Objetivo

Exibir cifra, compatibilidade, transposição e ações musicais sem alterar o original.

## Arquivos permitidos

- `app/songs/[songId]/index.tsx`
- `src/components/songs/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/songs/**`
- `src/**/__tests__/t38*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/13_song_detail.png`

## Implementação

- implementar somente a tela `Detalhe da cifra` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, SongHeader, ActiveTuningPill, TransposeControl, SongSection, ChordLine e ChordPreviewSheet;
- verificar existência e compatibilidade antes de renderizar;
- transpor view model, não documento oficial;
- abrir acorde em bottom sheet preservando posição;
- integrar favorito, metrônomo e entrada no palco;
- mostrar aviso para adaptação calculada.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] tom original pode ser restaurado;
- [ ] posição da rolagem não se perde ao abrir acorde;
- [ ] forma ausente mantém símbolo e aviso;
- [ ] conteúdo oficial não recebe edição.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T39 — Modo palco

**Fase:** 5 — Uso principal  
**Depende de:** `T38`, `T20`, `T23`  

## Objetivo

Maximizar legibilidade da cifra durante apresentação.

## Arquivos permitidos

- `app/songs/[songId]/stage.tsx`
- `src/components/songs/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/songs/**`
- `src/**/__tests__/t39*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/14_stage_mode.png`

## Implementação

- implementar somente a tela `Modo palco` na rota indicada;
- usar os componentes previstos: ScreenContainer stage, SongSection, ChordLine e AutoScrollControl;
- ocultar tabs, textura e cabeçalho grande;
- manter tela ativa conforme preferência;
- implementar rolagem, pausa, velocidade, fonte e lock de controles;
- pausar antes de alterar tom;
- restaurar orientação e posição ao sair.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] fundo possui alto contraste;
- [ ] controles não cobrem cifra;
- [ ] interrupção pausa ações sem retomada automática;
- [ ] saída sempre permanece acessível.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T40 — Acordes

**Fase:** 5 — Uso principal  
**Depende de:** `T34`, `T13`, `T22`  

## Objetivo

Consultar formas por afinação, nota, qualidade e filtros.

## Arquivos permitidos

- `app/(tabs)/chords.tsx`
- `src/components/chords/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/chords/**`
- `src/**/__tests__/t40*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/15_chords_list.png`

## Implementação

- implementar somente a tela `Acordes` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill, SearchField, chips e ChordCard;
- iniciar com padrão coerente com afinação quando disponível;
- filtrar verified/calculated, pestana, dificuldade, região e favoritos;
- normalizar busca em português e internacional;
- mostrar ação clara quando não houver forma.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] calculated não aparece como verified;
- [ ] mini diagrama usa componente real;
- [ ] remover filtros recupera resultados.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T41 — Detalhe do acorde

**Fase:** 5 — Uso principal  
**Depende de:** `T40`, `T13`, `T18`, `T22`  

## Objetivo

Exibir forma completa, modos de diagrama, áudio e alternativas.

## Arquivos permitidos

- `app/chords/[shapeId].tsx`
- `src/components/chords/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/chords/**`
- `src/**/__tests__/t41*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/16_chord_detail.png`

## Implementação

- implementar somente a tela `Detalhe do acorde` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill, ChordDiagram, ChordStatusBadge, SegmentedControl e AppButton;
- alternar cinco ordens, dez cordas, notas e intervalos;
- oferecer definir modo como padrão sem repetir pergunta;
- tocar áudio somente se asset válido;
- mostrar aviso calculado;
- listar posições e cifras relacionadas compatíveis.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] forma calculada possui aviso textual;
- [ ] áudio indisponível não é sintetizado de forma incorreta;
- [ ] troca de afinação mostra estado sem forma quando necessário.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T42 — Tela inicial do Afinador

**Fase:** 5 — Uso principal  
**Depende de:** `T34`, `T19`, `T21`  

## Objetivo

Selecionar modo do afinador sem iniciar microfone.

## Arquivos permitidos

- `app/(tabs)/tuner.tsx`
- `src/components/tuner/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/tuner/**`
- `src/**/__tests__/t42*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/17_tuner_home.png`

## Implementação

- implementar somente a tela `Tela inicial do Afinador` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill, cards de modo e AppButton;
- mostrar guiado, cromático e referência;
- restaurar último modo apenas como seleção;
- exibir Pronto para ouvir;
- navegar para o modo escolhido sem iniciar captura.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] abrir a aba não aciona indicador de microfone;
- [ ] modo guiado mostra afinação ativa;
- [ ] permissão não é pedida nesta abertura.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T43 — Afinador guiado

**Fase:** 5 — Uso principal  
**Depende de:** `T42`, `T19`, `T24`  

## Objetivo

Guiar a afinação par por par com segurança.

## Arquivos permitidos

- `app/tuner/guided.tsx`
- `src/components/tuner/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/tuner/**`
- `src/**/__tests__/t43*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/18_tuner_guided.png`

## Implementação

- implementar somente a tela `Afinador guiado` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, TunerGauge, SignalQuality, TuningCourseRow, progresso e AppButton;
- iniciar captura somente ao tocar Iniciar afinação;
- selecionar alvo por afinação e par;
- mostrar apertar, afrouxar, afinada, sinal instável e nota distante;
- implementar avanço automático configurável;
- salvar somente resumo da sessão.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] nota distante não orienta aperto indefinido;
- [ ] estabilidade é necessária para concluir;
- [ ] pausar libera ou suspende captura corretamente;
- [ ] saída com sessão ativa é confirmada.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T44 — Afinador cromático

**Fase:** 5 — Uso principal  
**Depende de:** `T42`, `T19`, `T24`  

## Objetivo

Detectar qualquer nota e permitir alvo opcional.

## Arquivos permitidos

- `app/tuner/chromatic.tsx`
- `src/components/tuner/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/tuner/**`
- `src/**/__tests__/t44*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/19_tuner_chromatic.png`

## Implementação

- implementar somente a tela `Afinador cromático` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, TunerGauge, SignalQuality, DetectedNote, SegmentedControl e AppButton;
- não exigir afinação ativa;
- mostrar nota, oitava, frequência, cents e sinal;
- permitir fixar nota alvo;
- parar captura ao sair.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] sem alvo não mostra orientação específica de afinação;
- [ ] fixar alvo não altera preferência global;
- [ ] tema escuro segue a referência.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T45 — Sons de referência

**Fase:** 5 — Uso principal  
**Depende de:** `T42`, `T18`, `T21`  

## Objetivo

Reproduzir notas locais por corda, par ou sequência.

## Arquivos permitidos

- `app/tuner/reference.tsx`
- `src/components/tuner/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/tuner/**`
- `src/**/__tests__/t45*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/20_reference_sounds.png`

## Implementação

- implementar somente a tela `Sons de referência` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, ActiveTuningPill, TuningCourseRow, ReferenceSoundButton e AppButton;
- usar somente assets locais validados;
- parar o áudio anterior antes do próximo;
- permitir repetição quando prevista;
- parar ao trocar afinação ou sair.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] nenhum áudio inicia automaticamente;
- [ ] asset ausente gera estado indisponível;
- [ ] metrônomo incompatível é tratado pelo coordenador.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T46 — Estudos

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T34`, `T15`, `T16`, `T25`  

## Objetivo

Organizar ritmos, metrônomo, exercícios e continuação de treino.

## Arquivos permitidos

- `app/(tabs)/studies.tsx`
- `src/components/studies/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/studies/**`
- `src/**/__tests__/t46*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/21_studies_home.png`

## Implementação

- implementar somente a tela `Estudos` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, cards de estudo, RhythmPattern compacto e AppButton;
- priorizar primeiro treino para usuário novo;
- priorizar continuação e últimos exercícios para recorrente;
- abrir ritmos e metrônomo por rotas válidas;
- não criar gamificação ou pontuação artificial.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] cards possuem função clara;
- [ ] estado sem histórico continua útil;
- [ ] não duplica o atalho de metrônomo em múltiplos cards.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T47 — Ritmos

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T46`, `T15`, `T25`  

## Objetivo

Listar ritmos locais com filtros e prévia do padrão.

## Arquivos permitidos

- `app/rhythms/index.tsx`
- `src/components/rhythms/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/rhythms/**`
- `src/**/__tests__/t47*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/22_rhythms_list.png`

## Implementação

- implementar somente a tela `Ritmos` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, SearchField, RhythmCard/RhythmPattern, chips e EmptyState;
- filtrar dificuldade, compasso e favorito;
- mostrar nome, BPM, dificuldade e prévia;
- preservar filtros ao voltar;
- não apresentar origem regional sem dado validado.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] sem resultado oferece limpar filtros;
- [ ] prévia não anima automaticamente;
- [ ] lista é paginada ou virtualizada.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T48 — Detalhe do ritmo

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T47`, `T18`, `T25`  

## Objetivo

Ensinar um ritmo com padrão, legenda, áudio e entrada no treino.

## Arquivos permitidos

- `app/rhythms/[rhythmId]/index.tsx`
- `src/components/rhythms/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/rhythms/**`
- `src/**/__tests__/t48*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/23_rhythm_detail.png`

## Implementação

- implementar somente a tela `Detalhe do ritmo` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, RhythmPattern, ReferenceSoundButton, SegmentedControl e AppButton;
- mostrar descrição, compasso, BPM, dificuldade e legenda;
- permitir áudio lento e normal quando válidos;
- espelhar visual aplicável para canhoto;
- abrir treino com parâmetros do ritmo.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] trocar mão não altera navegação;
- [ ] um áudio por vez;
- [ ] sair interrompe demonstração.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T49 — Treino de batida

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T48`, `T20`, `T25`  

## Objetivo

Executar treino visual com velocidade, contagem e progressão opcional.

## Arquivos permitidos

- `app/rhythms/[rhythmId]/practice.tsx`
- `src/components/rhythms/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/rhythms/**`
- `src/**/__tests__/t49*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/24_rhythm_practice.png`

## Implementação

- implementar somente a tela `Treino de batida` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, RhythmPattern, controles de velocidade, progresso e AppButton;
- oferecer 50%, 75%, 100% e BPM personalizado;
- permitir padrão, metrônomo ou progressão;
- implementar count-in;
- mover cursor a partir do clock musical;
- registrar sessão somente quando duração mínima for atingida.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] não avalia automaticamente a performance;
- [ ] concluir mostra resumo simples;
- [ ] cursor visual não é fonte do tempo;
- [ ] interrupção pausa treino.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T50 — Metrônomo

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T46`, `T20`, `T25`  

## Objetivo

Controlar BPM, compasso, tap tempo, count-in e reprodução.

## Arquivos permitidos

- `app/metronome/index.tsx`
- `src/components/metronome/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/metronome/**`
- `src/**/__tests__/t50*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/25_metronome.png`

## Implementação

- implementar somente a tela `Metrônomo` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, MetronomeDial, BeatIndicator, SegmentedControl e AppButton;
- carregar último estado sem iniciar;
- ajustar por toque, pressão prolongada e tap tempo;
- mostrar acento e contagem;
- persistir somente preferências;
- tratar conflito com afinador e áudios.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] nunca inicia automaticamente;
- [ ] BPM exibido usa tabular nums;
- [ ] interrupção pausa sem autorestart;
- [ ] pressão prolongada respeita limites.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T51 — Minhas cifras

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T37`, `T15`  

## Objetivo

Listar cifras próprias e oferecer criação ou importação.

## Arquivos permitidos

- `app/library/my-songs.tsx`
- `src/components/songs/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/songs/**`
- `src/**/__tests__/t51*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/26_my_songs.png`

## Implementação

- implementar somente a tela `Minhas cifras` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, SongRow, EmptyState e AppButton;
- mostrar somente itens pessoais não excluídos;
- implementar abrir, editar, duplicar e excluir em menu;
- usar exclusão lógica e desfazer quando seguro;
- mostrar estado vazio com Criar cifra e Importar texto.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] cifra oficial nunca aparece nesta lista;
- [ ] exclusão não remove imediatamente versões necessárias;
- [ ] duplicação gera novo ID.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T52 — Editor e tela Criar/Editar cifra

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T14`, `T15`, `T23`, `T51`  

## Objetivo

Implementar um editor reutilizável para criação e edição de cifras próprias, sem criar dois formulários divergentes.

## Arquivos permitidos

- `app/songs/create.tsx`
- `app/songs/[songId]/edit.tsx`
- `src/components/songs/editor/**`
- `src/hooks/useSongEditor.ts`
- `src/state/songEditor/**`
- `src/screens/songs/SongEditorScreen.tsx`
- `src/**/__tests__/t52*`

## Arquivos proibidos

- `src/database/migrations/**`
- `edição de catalog_*`
- `assets/screenshots-reference/**`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `assets/screenshots-reference/27_create_song.png`
- `docs/06_CODEX_TASKS.md`

## Implementação

- usar um único SongEditorScreen com modos create e edit;
- implementar identificação, configuração musical, conteúdo e revisão;
- criar rascunho e autosave com debounce;
- implementar inserir, substituir, mover e remover acorde estruturado;
- suportar undo/redo limitado;
- criar versão antes de salvar edição relevante;
- confirmar saída somente quando houver alteração não persistida.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] título e conteúdo mínimo são validados;
- [ ] rascunho é recuperável;
- [ ] editor não salva HTML/script;
- [ ] acorde sem forma pode manter símbolo com aviso;
- [ ] create e edit reutilizam lógica;
- [ ] cifra oficial não pode entrar no modo edit.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T53 — Importar cifra

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T14`, `T15`, `T52`  

## Objetivo

Importar texto localmente, revisar reconhecimento e salvar como cifra própria.

## Arquivos permitidos

- `app/songs/import.tsx`
- `src/components/songs/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/songs/**`
- `src/**/__tests__/t53*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/28_import_song.png`

## Implementação

- implementar somente a tela `Importar cifra` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, TextField, prévia de importação e AppButton;
- aceitar colar texto e arquivo de texto quando suportado;
- classificar acordes, seções e warnings;
- permitir importar somente como texto quando formato não for reconhecido;
- solicitar confirmação de direito de uso;
- apagar conteúdo temporário após conclusão.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] texto vazio não avança;
- [ ] arquivo grande é bloqueado com limite claro;
- [ ] nenhuma informação é enviada;
- [ ] resultado salva como user_song.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T54 — Favoritos

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T16`, `T23`, `T22`, `T25`  

## Objetivo

Navegar por cifras, acordes, afinações, ritmos e exercícios favoritos.

## Arquivos permitidos

- `app/library/favorites.tsx`
- `src/components/library/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/library/**`
- `src/**/__tests__/t54*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/29_favorites.png`

## Implementação

- implementar somente a tela `Favoritos` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, SegmentedControl/chips, cards por domínio e EmptyState;
- separar categorias;
- abrir o item preservando a origem;
- implementar remoção com desfazer;
- mostrar CTA específico no vazio.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] referência quebrada não causa crash;
- [ ] cada categoria usa card apropriado;
- [ ] remover favorito não exclui o conteúdo.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T55 — Configurações

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T12`, `T18`, `T19`, `T20`  

## Objetivo

Expor preferências por domínio com aplicação imediata e segura.

## Arquivos permitidos

- `app/settings/index.tsx`
- `src/components/settings/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/settings/**`
- `src/**/__tests__/t55*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/30_settings.png`

## Implementação

- implementar somente a tela `Configurações` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, SettingsRow, SelectField, toggles, BottomSheet e AppButton;
- agrupar Aparência, Música e diagramas, Afinador, Áudio, Palco, Armazenamento, Privacidade e Sobre;
- salvar automaticamente mudanças não destrutivas;
- mostrar explicação ao ativar posições calculadas;
- não criar conta, analytics ou anúncios;
- oferecer restaurar padrões por grupo.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] tema muda sem reiniciar;
- [ ] notação altera somente exibição;
- [ ] calibração e tolerância respeitam limites;
- [ ] controles possuem labels e valores atuais.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T56 — Backup

**Fase:** 6 — Estudos e biblioteca  
**Depende de:** `T17`, `T55`  

## Objetivo

Permitir exportar e importar backup com prévia e rollback.

## Arquivos permitidos

- `app/settings/backup.tsx`
- `src/components/settings/**`
- `src/hooks/**, somente hooks específicos desta tela`
- `src/screens/settings/**`
- `src/**/__tests__/t56*`

## Arquivos proibidos

- `src/database/migrations/**`
- `docs/**`
- `assets/screenshots-reference/**`
- `rotas de outros módulos`

## Referências

- `PROJECT_GUIDE.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`
- `assets/screenshots-reference/31_backup.png`

## Implementação

- implementar somente a tela `Backup` na rota indicada;
- usar os componentes previstos: ScreenContainer, AppHeader, BackupActionCard, progress state, Dialog e AppButton;
- implementar exportar, compartilhar, escolher arquivo, validar, pré-visualizar e importar;
- mostrar contagens e versão;
- exigir confirmação antes de substituir;
- bloquear saída somente durante trecho transacional crítico;
- mostrar sucesso e erro recuperável.
- seguir a imagem para composição e a Screen Spec para comportamento;
- tratar loading, vazio, erro e estados específicos aplicáveis;
- manter responsividade em 320 dp, 390 dp e tablet.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] a rota abre sem crash e sem internet;
- [ ] existe um único CTA visualmente dominante;
- [ ] afinação ativa não é duplicada;
- [ ] tema claro, escuro e alto contraste não quebram o layout;
- [ ] ações possuem feedback e labels de acessibilidade;
- [ ] typecheck e testes relacionados passam.
- [ ] arquivo inválido não escreve no banco;
- [ ] falha executa rollback;
- [ ] catálogo não é exportado;
- [ ] ações de sistema indisponíveis possuem fallback claro.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes relacionados à tarefa`

---

# T57 — Integração de navegação, lifecycle e conflitos de áudio

**Fase:** 7 — Integração e qualidade  
**Depende de:** `T34`, `T36`, `T38`, `T39`, `T41`, `T43`, `T44`, `T45`, `T48`, `T49`, `T50`, `T52`, `T56`  

## Objetivo

Conectar fluxos completos e eliminar comportamentos inconsistentes entre módulos.

## Arquivos permitidos

- `app/**/_layout.tsx`
- `src/components/navigation/**`
- `src/state/appLifecycle/**`
- `src/services/audioSessionCoordinator.ts`
- `src/hooks/useSafeNavigation.ts`
- `src/**/__tests__/integration*`

## Arquivos proibidos

- `redesign das telas`
- `migrações de banco`
- `novas funções comerciais`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- testar ida e volta preservando busca, filtros e rolagem;
- garantir confirmação de saída em editor, afinador e backup crítico;
- parar ou pausar recursos ao trocar para contexto incompatível;
- tratar background, chamada, alarme e retorno;
- garantir que tabs sejam ocultadas somente nos contextos previstos;
- testar deep links e itens removidos.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] nenhum áudio continua após saída indevida;
- [ ] microfone é liberado ao deixar afinador;
- [ ] modo palco restaura orientação;
- [ ] editor não perde alterações silenciosamente;
- [ ] voltar retorna ao ponto de origem;
- [ ] deep link inválido não causa crash.

## Checks obrigatórios

- `typecheck`
- `lint`
- `testes de integração de fluxo`

---

# T58 — Auditoria de acessibilidade e responsividade

**Fase:** 7 — Integração e qualidade  
**Depende de:** `T57`  

## Objetivo

Corrigir barreiras de leitura, toque, contraste e adaptação de layout sem alterar a identidade aprovada.

## Arquivos permitidos

- `app/**`
- `src/components/**`
- `src/theme/**`
- `src/**/__tests__/accessibility*`

## Arquivos proibidos

- `src/database/**`
- `src/repositories/**`
- `mudança de escopo funcional`

## Referências

- `docs/02_DESIGN_SYSTEM.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- testar 320×568, 360×800, 390×844, 412×915 e tablet;
- testar font scale padrão, grande e extra grande;
- verificar ordem de foco, labels, roles, states e hints;
- validar contraste nos três temas;
- corrigir corte horizontal, botão coberto e conteúdo atrás de tabs/teclado;
- respeitar reduce motion.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] nenhuma tela essencial possui corte horizontal em 320 dp;
- [ ] CTAs permanecem acessíveis com fonte grande;
- [ ] ações por ícone possuem label;
- [ ] estado não depende somente de cor;
- [ ] modo palco mantém contraste máximo;
- [ ] tablet não estica coluna de leitura além do limite.

## Checks obrigatórios

- `typecheck`
- `lint`
- `test:accessibility`
- `testes manuais documentados por viewport`

---

# T59 — Suíte de testes e integridade

**Fase:** 7 — Integração e qualidade  
**Depende de:** `T58`  

## Objetivo

Consolidar testes de domínio, banco, repositórios, serviços e fluxos críticos.

## Arquivos permitidos

- `src/**/__tests__/**`
- `tests/**`
- `jest.config.*`
- `vitest.config.*`
- `package.json`
- `scripts/verify-*`
- `src/database/seed/validators*`

## Arquivos proibidos

- `alteração de comportamento de produção apenas para facilitar teste`
- `remoção de validações`

## Referências

- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- cobrir migração nova e upgrade;
- cobrir pitch, MIDI, frequência, cents, transposição e parser;
- cobrir backup round-trip e rollback;
- cobrir conflitos de áudio e lifecycle;
- cobrir filtros, favoritos, recentes e soft delete;
- criar auditor de seed, FKs, assets, licenças e formas.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] checks críticos executam em ambiente limpo;
- [ ] teste detecta FK quebrada;
- [ ] teste rejeita forma com menos de dez posições;
- [ ] teste confirma que transposição preserva texto;
- [ ] teste confirma que backup exclui catálogo;
- [ ] não há testes dependentes de internet.

## Checks obrigatórios

- `typecheck`
- `lint`
- `test`
- `test:migrations`
- `auditoria de seed`

---

# T60 — Auditoria final, export e build de validação

**Fase:** 7 — Integração e qualidade  
**Depende de:** `T59`  

## Objetivo

Validar o projeto completo antes de qualquer publicação, sem corrigir problemas por mudanças amplas não auditadas.

## Arquivos permitidos

- `arquivos estritamente necessários para corrigir falhas encontradas`
- `app.json/app.config.* somente para configuração já aprovada`
- `eas.json somente se a validação exigir`
- `README.md`
- `docs/07_RELEASE_CHECKLIST.md se já existir`

## Arquivos proibidos

- `novos recursos`
- `alteração comercial`
- `upgrade de SDK`
- `mudança de identidade visual`
- `secrets reais`

## Referências

- `PROJECT_GUIDE.md`
- `docs/01_APP_BLUEPRINT.md`
- `docs/02_DESIGN_SYSTEM.md`
- `docs/03_USER_FLOW.md`
- `docs/04_SCREEN_SPECS.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_CODEX_TASKS.md`

## Implementação

- executar typecheck, lint e toda a suíte;
- executar export/check compatível com Expo;
- validar Android e iOS sem rede nas funções essenciais;
- validar permissões e textos de privacidade do microfone;
- validar assets, fontes, ícone e splash existentes;
- registrar pendências reais sem declarar publicação pronta indevidamente;
- produzir relatório final por severidade.

## Regras

- não implementar funções fora do objetivo da tarefa;
- não duplicar componentes ou serviços existentes;
- não alterar rotas sem atualizar o contrato de navegação;
- não acessar SQLite diretamente a partir de componentes visuais;
- não adicionar dependência sem explicar necessidade e compatibilidade;
- não iniciar microfone, áudio ou metrônomo automaticamente;
- não usar imagem de referência como fundo da tela;
- não mascarar erro de TypeScript;
- limpar imports e executar os checks obrigatórios.

## Critérios de aceitação

- [ ] typecheck passa;
- [ ] lint passa;
- [ ] testes passam;
- [ ] export/check conclui;
- [ ] não há rota quebrada;
- [ ] não há asset ausente;
- [ ] nenhuma função essencial exige rede;
- [ ] relatório final separa bloqueadores, importantes e melhorias.

## Checks obrigatórios

- `typecheck`
- `lint`
- `test`
- `test:migrations`
- `export:check`
- `build de validação permitido pelo ambiente`


---

# 16. Prompt padrão para executar uma tarefa

Copiar somente a tarefa desejada junto deste bloco:

```md
Você é um desenvolvedor sênior de Expo, React Native e TypeScript.

Execute somente a tarefa [ID] do arquivo `docs/06_CODEX_TASKS.md`.

Antes de alterar arquivos:
1. leia a tarefa completa;
2. leia todas as referências listadas nela;
3. inspecione os arquivos permitidos;
4. confirme internamente que as dependências anteriores estão concluídas.

Regras obrigatórias:
- não iniciar a próxima tarefa;
- não alterar arquivos proibidos;
- não implementar função fora do escopo;
- não mascarar erros de TypeScript;
- não inventar conteúdo musical de produção;
- não usar imagens das telas como fundo;
- não iniciar áudio ou microfone sem ação explícita;
- rodar os checks da tarefa;
- corrigir erros causados pela própria alteração.

Ao final, entregue:
- resumo do que foi feito;
- arquivos criados e alterados;
- checks executados e resultados;
- pendências e riscos reais.
```

# 17. Prompt para continuar após uma falha

```md
Retome somente a tarefa [ID].

Leia o diff atual e o erro abaixo antes de editar:
[cole o erro]

Corrija apenas a causa da falha dentro dos arquivos permitidos pela tarefa.
Não refatore módulos não relacionados.
Não avance para outra tarefa.
Execute novamente os checks obrigatórios e informe o resultado real.
```

# 18. Prompt para revisão de uma tarefa concluída

```md
Revise a implementação da tarefa [ID] sem alterar arquivos inicialmente.

Compare:
- objetivo;
- arquivos permitidos e proibidos;
- referências;
- critérios de aceitação;
- checks obrigatórios.

Entregue:
1. itens atendidos;
2. itens não atendidos;
3. alterações fora do escopo;
4. riscos;
5. correção mínima recomendada.

Somente altere arquivos se eu pedir em seguida.
```

# 19. Gates entre fases

## Gate da Fase 1

```txt
[ ] projeto abre
[ ] scripts de qualidade existem
[ ] tema e fontes carregam offline
[ ] componentes globais estão tipados
[ ] rotas não possuem conflito físico
[ ] bootstrap não entra em loop
```

## Gate da Fase 2

```txt
[ ] banco novo é criado
[ ] migração é transacional
[ ] user_* é preservado em upgrade
[ ] seed inválido é rejeitado
[ ] telas não importam cliente SQLite
[ ] transposição preserva texto
[ ] backup executa rollback
```

## Gate da Fase 3

```txt
[ ] apenas um owner de áudio incompatível fica ativo
[ ] microfone exige ação explícita
[ ] metrônomo usa clock independente da animação
[ ] diagramas são vetoriais
[ ] medidor não falsifica leitura
[ ] ritmos possuem legenda acessível
```

## Gate da Fase 4

```txt
[ ] onboarding persiste etapa
[ ] usuário pode negar microfone
[ ] conclusão só ocorre no CTA final
[ ] reabertura retoma corretamente
[ ] escolhas podem ser revisadas
```

## Gate da Fase 5

```txt
[ ] afinação ativa é coerente
[ ] listas preservam filtros
[ ] cifra oficial não é modificada
[ ] modo palco oculta tabs
[ ] forma calculada tem aviso
[ ] afinador libera microfone ao sair
```

## Gate da Fase 6

```txt
[ ] treino não avalia execução automaticamente
[ ] editor possui rascunho
[ ] importação é local
[ ] favoritos não excluem conteúdo
[ ] configurações aplicam sem reinício quando possível
[ ] backup não inclui catálogo
```

## Gate da Fase 7

```txt
[ ] typecheck passa
[ ] lint passa
[ ] testes passam
[ ] 320 dp funciona
[ ] tablet funciona
[ ] leitor de tela possui labels úteis
[ ] export/build de validação conclui
```

# 20. Itens que exigem validação humana antes do catálogo de produção

```txt
[ ] notas e oitavas das quatro afinações iniciais
[ ] convenção final de numeração física das dez cordas
[ ] alertas de tensão e encordoamento
[ ] formas verificadas dos acordes
[ ] fontes e revisores musicais
[ ] ritmos e padrões regionais
[ ] áudios locais definitivos
[ ] direitos, licenças e atribuições das cifras
[ ] conteúdo comercial gratuito e Pro, caso o modelo seja adotado
```

O Codex deve deixar o sistema preparado para receber esses dados, mas não deve substituí-los por suposições.

# 21. Definition of Done do arquivo 06

```txt
[ ] auditoria é a primeira tarefa
[ ] base visual vem antes das telas
[ ] dados e domínio não dependem da UI
[ ] áudio está centralizado
[ ] cada uma das 32 Screen Specs possui tarefa correspondente
[ ] rotas dinâmicas conflitantes foram normalizadas
[ ] tarefas possuem arquivos permitidos e proibidos
[ ] tarefas possuem referências e critérios verificáveis
[ ] checks são obrigatórios
[ ] conteúdo musical não validado está protegido
[ ] integração ocorre somente após módulos isolados
[ ] build ocorre somente após auditoria e testes
```
