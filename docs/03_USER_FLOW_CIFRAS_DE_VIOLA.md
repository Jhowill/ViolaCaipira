# 03 — User Flow

## 1. Identificação

### Produto

**Cifras de Viola — Acordes, Afinações e Batidas**

### Documento

`docs/03_USER_FLOW.md`

### Versão

`1.0.0`

### Status

Fluxo funcional base para criação das imagens de referência, Screen Specs, modelo de dados e tarefas do Codex.

### Documentos relacionados

Este documento deve respeitar:

1. `PROJECT_GUIDE.md`;
2. `docs/01_APP_BLUEPRINT.md`;
3. `docs/02_DESIGN_SYSTEM.md`;
4. futuras Screen Specs;
5. futuro modelo de dados.

Em caso de conflito:

```txt
PROJECT_GUIDE.md
    ↓
SCREEN_SPECS.md
    ↓
DESIGN_SYSTEM.md
    ↓
USER_FLOW.md
    ↓
imagem de referência
    ↓
conversa solta
```

---

# 2. Objetivo do fluxo

Este documento define:

- como o usuário entra no aplicativo;
- como escolhe e altera a afinação;
- como usa o afinador;
- como consulta acordes;
- como pesquisa e toca cifras;
- como transpõe músicas;
- como utiliza o modo palco;
- como aprende ritmos;
- como utiliza o metrônomo;
- como cria e importa cifras;
- como gerencia favoritos e recentes;
- como altera configurações;
- como exporta e importa backup;
- como o sistema reage a erros;
- como permissões são solicitadas;
- como os estados offline são tratados;
- como o fluxo se adapta a celular e tablet.

O objetivo é impedir:

- telas sem função;
- caminhos sem retorno;
- navegação redundante;
- alterações silenciosas;
- perda de conteúdo;
- permissões fora de contexto;
- dependência de internet;
- implementação de comportamentos diferentes para a mesma ação.

---

# 3. Princípios gerais de navegação

## 3.1 Navegação principal

O aplicativo utilizará cinco abas:

1. **Início**
2. **Cifras**
3. **Acordes**
4. **Afinador**
5. **Estudos**

A navegação principal deve permanecer disponível durante o uso comum.

Ela será ocultada em:

- onboarding;
- modo palco;
- edição em tela cheia;
- modais;
- bottom sheets;
- fluxos críticos de backup;
- telas de permissão;
- apresentação de compra, caso utilizada.

## 3.2 Persistência de estado por aba

Ao alternar entre abas, o aplicativo deve preservar temporariamente:

- posição da lista;
- termo pesquisado;
- filtros;
- item selecionado;
- tom atual da cifra;
- andamento do metrônomo, quando ativo;
- etapa do afinador, quando tecnicamente seguro.

O estado não deve ser preservado quando:

- o usuário encerra explicitamente a ação;
- a base de dados foi migrada;
- a afinação ativa mudou e tornou o conteúdo incompatível;
- o usuário limpou histórico ou restaurou configurações;
- a tela depende de item removido.

## 3.3 Botão voltar

### Android

- respeitar botão físico ou gesto do sistema;
- fechar modal ou bottom sheet antes de sair da tela;
- pausar ações críticas antes de sair;
- confirmar saída quando houver alterações não salvas;
- na raiz de uma aba, voltar não deve trocar silenciosamente de aba;
- na tela inicial, o sistema pode encerrar o app.

### iOS

- usar gesto de voltar quando seguro;
- desativar gesto durante edição com alterações não salvas;
- manter botão de retorno visível em fluxos empilhados.

## 3.4 Retorno previsível

Toda tela secundária deve retornar ao ponto de origem.

Exemplos:

```txt
Cifras → Detalhe → Voltar → mesma posição da lista
Acordes → Detalhe → Voltar → mesmos filtros
Afinações → Detalhe → Voltar → mesma posição
Estudos → Ritmo → Voltar → lista de ritmos
```

## 3.5 Ação principal

Cada tela deve possuir:

- uma ação principal;
- até duas ações secundárias visíveis;
- ações extras em menu contextual.

## 3.6 Alterações com impacto

Ações que afetam música, afinação, backup ou conteúdo devem apresentar consequência antes da confirmação.

Exemplo:

```txt
Alterar a afinação ativa pode mudar os acordes exibidos nesta cifra.
```

---

# 4. Mapa geral de navegação

```txt
App
│
├── Inicialização
│   ├── Splash nativa
│   ├── Verificação do banco
│   ├── Migração local
│   ├── Restauração do estado
│   └── Destino inicial
│
├── Onboarding
│   ├── Boas-vindas
│   ├── Nível de experiência
│   ├── Afinação inicial
│   ├── Visualização de acordes
│   ├── Preferência de execução
│   ├── Explicação do microfone
│   └── Resumo
│
├── Tabs
│   ├── Início
│   ├── Cifras
│   ├── Acordes
│   ├── Afinador
│   └── Estudos
│
├── Afinações
│   ├── Lista
│   ├── Busca
│   ├── Detalhe
│   ├── Ativar afinação
│   └── Sons de referência
│
├── Cifras
│   ├── Lista
│   ├── Busca
│   ├── Filtros
│   ├── Detalhe
│   ├── Transposição
│   ├── Acordes utilizados
│   ├── Modo palco
│   ├── Criar
│   ├── Editar
│   └── Importar
│
├── Acordes
│   ├── Lista
│   ├── Seleção da nota
│   ├── Seleção da qualidade
│   ├── Filtros
│   ├── Detalhe
│   ├── Outras posições
│   └── Áudio
│
├── Afinador
│   ├── Seletor de modo
│   ├── Guiado
│   ├── Cromático
│   ├── Som de referência
│   ├── Permissão
│   └── Resumo da sessão
│
├── Estudos
│   ├── Lista de ritmos
│   ├── Detalhe do ritmo
│   ├── Treino de batida
│   ├── Exercício
│   └── Metrônomo
│
├── Biblioteca pessoal
│   ├── Favoritos
│   ├── Recentes
│   ├── Minhas cifras
│   └── Repertórios futuros
│
└── Sistema
    ├── Configurações
    ├── Aparência
    ├── Notação
    ├── Áudio
    ├── Afinador
    ├── Backup
    ├── Privacidade
    ├── Créditos
    └── Sobre
```

---

# 5. Estados globais do aplicativo

## 5.1 Inicialização

Possíveis estados:

```txt
booting
checking_database
migrating_database
restoring_preferences
ready
recoverable_error
fatal_error
```

## 5.2 Perfil local

```txt
new_user
onboarding_incomplete
returning_user
settings_restored
```

## 5.3 Banco local

```txt
not_initialized
initializing
ready
migrating
read_only
recoverable_error
corrupted
```

## 5.4 Áudio

```txt
idle
requesting_permission
permission_granted
permission_denied
permission_blocked
initializing
listening
playing_reference
paused
audio_error
```

## 5.5 Conteúdo

```txt
official_verified
official_calculated
user_created
imported
deprecated
unavailable
```

## 5.6 Compra, caso adotada

```txt
free
pro
checking_entitlement
purchase_pending
purchase_success
purchase_failed
restore_success
restore_failed
offline_cached_pro
```

---

# 6. Fluxo de inicialização

## 6.1 Abertura normal

```txt
Usuário abre o app
    ↓
Splash nativa
    ↓
Carregar preferências mínimas
    ↓
Verificar versão do banco
    ↓
Banco compatível?
    ├── Sim → Restaurar estado seguro
    └── Não → Executar migração
                    ↓
              Migração concluída?
                ├── Sim → Continuar
                └── Não → Recuperação
    ↓
Onboarding concluído?
    ├── Não → Onboarding
    └── Sim → Início
```

## 6.2 Regras de splash

- não realizar ações longas com tela vazia;
- mostrar marca;
- transição automática;
- não solicitar permissões;
- não carregar todos os áudios;
- não depender de rede;
- duração visual mínima apenas se necessária para evitar piscar;
- migração longa deve usar tela própria.

## 6.3 Migração do banco

```txt
Versão antiga detectada
    ↓
Criar ponto de recuperação local
    ↓
Executar migração em transação
    ↓
Validar integridade
    ↓
Sucesso?
    ├── Sim → Remover ponto temporário → Abrir app
    └── Não → Restaurar ponto anterior → Mostrar erro
```

## 6.4 Erro recuperável

Mensagem:

```txt
Não foi possível preparar o conteúdo local.
Seus dados pessoais não foram apagados.
```

Ações:

- Tentar novamente;
- Abrir em modo limitado, quando possível;
- Exportar dados pessoais, quando possível;
- Consultar ajuda.

## 6.5 Erro fatal

Somente quando:

- o banco oficial não pode ser aberto;
- a migração falhou e não pode ser restaurada;
- arquivos essenciais estão ausentes.

A tela deve:

- explicar o problema;
- não apresentar código técnico como mensagem principal;
- permitir copiar informações técnicas;
- orientar reinstalação somente como último recurso;
- alertar sobre backup antes de reinstalar.

---

# 7. Fluxo de primeira abertura

## 7.1 Objetivo

Configurar apenas as preferências necessárias para entregar valor imediato.

O onboarding não deve pedir:

- nome;
- e-mail;
- telefone;
- localização;
- cadastro;
- conta;
- notificações;
- acesso a arquivos;
- compra.

## 7.2 Fluxo geral

```txt
Boas-vindas
    ↓
Nível de experiência
    ↓
Afinação inicial
    ↓
Visualização dos acordes
    ↓
Destro ou canhoto
    ↓
Explicação do afinador
    ↓
Resumo
    ↓
Início
```

## 7.3 Persistência progressiva

Cada etapa deve ser salva localmente.

Caso o app seja fechado:

```txt
Abrir novamente
    ↓
Onboarding incompleto detectado
    ↓
Retomar última etapa concluída
```

O usuário deve poder voltar e revisar escolhas.

---

# 8. Onboarding — Boas-vindas

## 8.1 Objetivo

Explicar a proposta em uma frase.

### Conteúdo

```txt
Sua viola, sua afinação, seu repertório.

Acordes, cifras, batidas e afinador para viola de 10 cordas, disponíveis mesmo sem internet.
```

### Ação principal

`Começar`

### Ação secundária

Nenhuma.

## 8.2 Fluxo

```txt
Boas-vindas
    ↓ tocar Começar
Nível de experiência
```

## 8.3 Regras

- não exibir carrossel longo;
- não mostrar compra;
- não pedir microfone;
- não usar mais de uma ilustração;
- permitir leitor de tela;
- respeitar tamanho de fonte.

---

# 9. Onboarding — Nível de experiência

## 9.1 Objetivo

Adaptar linguagem e sugestões iniciais.

### Opções

- Estou começando;
- Já toco algumas músicas;
- Tenho experiência com viola.

## 9.2 Impactos

### Iniciante

- diagrama simplificado sugerido;
- explicações expandidas;
- acordes básicos em destaque;
- afinador guiado priorizado;
- ritmos lentos sugeridos.

### Intermediário

- diagrama simplificado inicialmente;
- acordes alternativos disponíveis;
- transposição em destaque;
- ritmos completos.

### Experiente

- opção de dez cordas sugerida;
- detalhes musicais visíveis;
- acesso rápido a criação;
- filtros avançados disponíveis.

## 9.3 Fluxo

```txt
Selecionar nível
    ↓
Botão Continuar habilitado
    ↓
Afinação inicial
```

## 9.4 Regras

- escolha pode ser alterada depois;
- não bloquear funcionalidades;
- a seleção ajusta padrões, não limita o app.

---

# 10. Onboarding — Afinação inicial

## 10.1 Objetivo

Definir a afinação ativa inicial.

### Conteúdo

Lista inicial:

- Cebolão em Ré;
- Cebolão em Mi;
- Rio Abaixo;
- Boiadeira;
- Não sei qual uso.

## 10.2 Fluxo — usuário conhece a afinação

```txt
Selecionar afinação
    ↓
Visualizar resumo das cordas
    ↓
Confirmar
    ↓
Preferência de diagrama
```

## 10.3 Fluxo — usuário não sabe

```txt
Selecionar “Não sei qual uso”
    ↓
Tela explicativa
    ↓
Opções:
    ├── Ouvir exemplos
    ├── Comparar notas
    ├── Escolher Cebolão em Ré como padrão
    └── Pular por enquanto
```

## 10.4 Regra da V1

A V1 não reconhecerá automaticamente uma afinação desconhecida.

O aplicativo deve explicar:

```txt
O afinador verifica notas, mas ainda não identifica sozinho qual afinação está montada na sua viola.
```

## 10.5 Pular

Caso o usuário pule:

- Cebolão em Ré é definido como padrão provisório;
- um badge “Afinação provisória” aparece na Início;
- o usuário recebe atalho para revisar;
- acordes deixam claro qual afinação está sendo usada.

---

# 11. Onboarding — Visualização dos acordes

## 11.1 Objetivo

Definir o modo inicial de diagrama.

### Opções

- Cinco ordens;
- Dez cordas.

### Explicação

```txt
Cinco ordens
Mostra cada par como uma unidade. É mais simples para começar.

Dez cordas
Mostra as cordas individualmente e suas oitavas.
```

## 11.2 Fluxo

```txt
Selecionar modo
    ↓
Prévia do mesmo acorde
    ↓
Continuar
    ↓
Preferência de execução
```

## 11.3 Regras

- a opção pode ser alterada em qualquer detalhe de acorde;
- mudar no detalhe pode oferecer “Usar sempre”;
- o app deve respeitar a preferência global.

---

# 12. Onboarding — Destro ou canhoto

## 12.1 Objetivo

Ajustar diagramas e batidas.

### Opções

- Destro;
- Canhoto.

## 12.2 Fluxo

```txt
Selecionar preferência
    ↓
Mostrar pequena prévia
    ↓
Continuar
    ↓
Explicação do afinador
```

## 12.3 Regras

- navegação não é espelhada;
- somente conteúdo musical aplicável é espelhado;
- orientação de diagrama pode ser alterada separadamente nas configurações.

---

# 13. Onboarding — Explicação do microfone

## 13.1 Objetivo

Explicar o uso antes de solicitar a permissão.

### Conteúdo

```txt
O afinador usa o microfone apenas enquanto você afina.

O som é analisado no aparelho. O app não grava nem envia o áudio.
```

### Ação principal

`Testar o afinador`

### Ação secundária

`Agora não`

## 13.2 Fluxo — testar

```txt
Tocar “Testar o afinador”
    ↓
Solicitação nativa de permissão
    ↓
Concedida?
    ├── Sim → Teste rápido opcional
    └── Não → Explicação sem bloqueio
    ↓
Resumo
```

## 13.3 Fluxo — agora não

```txt
Tocar “Agora não”
    ↓
Não solicitar permissão
    ↓
Resumo
```

## 13.4 Regras

- negar não impede acesso ao app;
- sons de referência continuam disponíveis;
- nova solicitação só ocorre ao abrir função que precisa do microfone;
- se a permissão estiver bloqueada, oferecer abrir configurações do sistema.

---

# 14. Onboarding — Resumo

## 14.1 Conteúdo

Exemplo:

```txt
Tudo pronto

Afinação: Cebolão em Ré
Diagramas: Cinco ordens
Execução: Destro
Afinador: Microfone permitido
```

### Ação principal

`Entrar no app`

### Ações secundárias

- Revisar;
- Alterar afinação.

## 14.2 Conclusão

```txt
Tocar “Entrar no app”
    ↓
Marcar onboarding como concluído
    ↓
Criar preferências padrão
    ↓
Abrir Início
```

## 14.3 Regra

Somente marcar como concluído após o usuário tocar no CTA final.

---

# 15. Fluxo de usuário recorrente

```txt
Abrir app
    ↓
Verificar banco e preferências
    ↓
Havia atividade interrompida?
    ├── Não → Início
    └── Sim → A atividade pode ser retomada com segurança?
              ├── Sim → Início com card “Continuar”
              └── Não → Descartar estado temporário e abrir Início
```

Atividades que podem ser retomadas:

- cifra aberta;
- ritmo em estudo;
- filtros de lista;
- rascunho salvo;
- andamento do metrônomo, sem reprodução automática.

Atividades que não devem retomar automaticamente:

- microfone ativo;
- áudio tocando;
- metrônomo tocando;
- modo palco em rolagem;
- compra pendente;
- importação em processo.

---

# 16. Fluxo da tela Início

## 16.1 Objetivo

Permitir acesso rápido ao uso mais provável.

## 16.2 Hierarquia

```txt
Início
    ├── Afinação ativa
    ├── Afinar agora
    ├── Continuar
    ├── Atalhos
    ├── Favoritos
    └── Recentes
```

## 16.3 Ações

### Tocar afinação ativa

```txt
Início
    ↓
Seletor de afinação
```

### Tocar Afinar agora

```txt
Início
    ↓
Afinador guiado com afinação ativa
```

### Tocar Continuar cifra

```txt
Início
    ↓
Detalhe da última cifra
```

### Tocar Continuar ritmo

```txt
Início
    ↓
Treino do ritmo
```

### Tocar acorde recente

```txt
Início
    ↓
Detalhe do acorde
```

### Tocar Ver favoritos

```txt
Início
    ↓
Favoritos
```

## 16.4 Estado de usuário novo

Após onboarding:

- mostrar “Afinar agora”;
- mostrar “Conhecer primeiros acordes”;
- mostrar “Aprender uma batida”;
- não mostrar seções vazias sem explicação.

## 16.5 Estado sem recentes

```txt
Ainda não há atividade recente.
Escolha um acorde, uma cifra ou um ritmo para começar.
```

## 16.6 Estado com afinação provisória

Mostrar aviso compacto:

```txt
Você está usando Cebolão em Ré como padrão provisório.
[Revisar afinação]
```

---

# 17. Fluxo de seleção de afinação

## 17.1 Entradas possíveis

- pill da afinação;
- configurações;
- detalhe de acorde;
- detalhe de cifra;
- afinador;
- onboarding;
- início.

## 17.2 Fluxo padrão

```txt
Abrir seletor
    ↓
Mostrar afinação ativa
    ↓
Pesquisar ou escolher
    ↓
Tocar afinação
    ↓
Mostrar prévia:
    - cinco ordens;
    - acorde aberto;
    - compatibilidade;
    ↓
Ativar
```

## 17.3 Mudança sem impacto crítico

Exemplo: mudança na tela Início.

```txt
Ativar afinação
    ↓
Salvar preferência
    ↓
Atualizar cards e sugestões
    ↓
Toast “Afinação alterada”
```

## 17.4 Mudança durante uma cifra

```txt
Solicitar mudança
    ↓
Verificar compatibilidade da cifra
    ↓
Compatível e revisada?
    ├── Sim → Mostrar consequência → Confirmar → Atualizar
    └── Não → Mostrar opções:
              ├── Manter afinação atual
              ├── Ver adaptação calculada
              └── Sair da cifra e alterar globalmente
```

## 17.5 Mudança durante um acorde

```txt
Solicitar mudança
    ↓
Existe forma equivalente?
    ├── Sim → Atualizar forma
    └── Não → Estado sem forma:
              “Ainda não há posição revisada para esta combinação.”
```

## 17.6 Mudança durante afinador ativo

Não alterar silenciosamente.

```txt
Selecionar outra afinação
    ↓
Pausar escuta
    ↓
Confirmar reinício
    ↓
Reiniciar no primeiro par
```

## 17.7 Favoritar afinação

```txt
Detalhe da afinação
    ↓
Tocar favorito
    ↓
Salvar
    ↓
Feedback
```

A afinação favorita não substitui automaticamente a ativa.

---

# 18. Fluxo de detalhe da afinação

## 18.1 Entrada

- lista;
- seletor;
- busca;
- link de contexto.

## 18.2 Conteúdo

- nome;
- nomes alternativos;
- descrição;
- acorde aberto;
- cinco ordens;
- dez cordas;
- notas;
- oitavas;
- tipo de par;
- áudio;
- aviso de tensão;
- conteúdo relacionado;
- status de revisão.

## 18.3 Ações

- ativar;
- abrir afinador;
- ouvir par;
- ver acordes;
- favoritar;
- abrir fonte ou créditos locais.

## 18.4 Fluxo de ativação

```txt
Detalhe
    ↓
Tocar “Usar esta afinação”
    ↓
Já está ativa?
    ├── Sim → Sem ação
    └── Não → Verificar contexto → Confirmar → Salvar
```

## 18.5 Áudio

```txt
Tocar um par
    ↓
Parar áudio anterior
    ↓
Carregar arquivo local
    ↓
Reproduzir
    ↓
Atualizar estado visual
```

Ao sair:

- parar áudio;
- liberar recurso;
- não continuar em background.

---

# 19. Fluxo do Afinador

## 19.1 Entrada principal

Ao abrir a aba Afinador:

```txt
Afinador
    ↓
Preferência anterior existe?
    ├── Sim → Abrir último modo, sem ativar microfone automaticamente
    └── Não → Abrir modo guiado
```

## 19.2 Regra de privacidade

O microfone não deve iniciar automaticamente apenas porque a aba foi aberta.

A tela mostra:

```txt
Pronto para ouvir
[Iniciar afinação]
```

---

# 20. Permissão do microfone

## 20.1 Estado desconhecido

```txt
Tocar “Iniciar afinação”
    ↓
Mostrar explicação contextual
    ↓
Tocar Continuar
    ↓
Solicitação nativa
```

## 20.2 Permissão concedida

```txt
Inicializar áudio
    ↓
Calibrar entrada
    ↓
Começar escuta
```

## 20.3 Permissão negada, mas solicitável

```txt
Mostrar:
“O afinador precisa do microfone para ouvir a corda.”

Ações:
- Tentar novamente;
- Usar som de referência;
- Voltar.
```

## 20.4 Permissão bloqueada

```txt
Mostrar:
“A permissão foi bloqueada nas configurações do aparelho.”

Ações:
- Abrir configurações;
- Usar som de referência;
- Voltar.
```

## 20.5 Sem microfone disponível

```txt
Mostrar erro técnico amigável
    ↓
Oferecer sons de referência
```

---

# 21. Afinador guiado

## 21.1 Fluxo principal

```txt
Abrir modo guiado
    ↓
Confirmar afinação ativa
    ↓
Tocar “Iniciar afinação”
    ↓
Permissão válida?
    ├── Não → Fluxo de permissão
    └── Sim → Inicializar
    ↓
Selecionar primeiro par
    ↓
Usuário toca
    ↓
Sinal suficiente?
    ├── Não → “Toque novamente”
    └── Sim → Detectar frequência
    ↓
Comparar com nota alvo
    ↓
Resultado:
    ├── Abaixo → “Aperte lentamente”
    ├── Dentro → “Afinada”
    └── Acima → “Afrouxe lentamente”
    ↓
Estável dentro da tolerância?
    ├── Não → Continuar ouvindo
    └── Sim → Confirmar par
    ↓
Avançar automaticamente ou manualmente
    ↓
Último par?
    ├── Não → Próximo par
    └── Sim → Resumo
```

## 21.2 Seleção manual de par

O usuário pode tocar em outro par.

Ao fazer isso:

- pausar validação atual;
- alterar alvo;
- limpar leitura anterior;
- continuar escutando;
- não marcar o par anterior como concluído sem estabilidade.

## 21.3 Avanço automático

Padrão recomendado:

- confirmar após estabilidade contínua;
- vibrar uma vez;
- mostrar “Afinada”;
- aguardar breve intervalo;
- avançar.

Configuração:

```txt
Avançar automaticamente: ligado/desligado
```

## 21.4 Sinal instável

```txt
Frequência oscila excessivamente
    ↓
Mostrar “Sinal instável”
    ↓
Orientar:
- toque uma corda por vez;
- aproxime o aparelho;
- reduza ruídos;
- espere a nota sustentar.
```

## 21.5 Nota fora do intervalo esperado

Exemplo:

```txt
Alvo: D4
Detectado: G3
```

Mostrar:

```txt
A nota detectada está distante do alvo.
Confira se você tocou o par correto.
```

Não orientar a apertar indefinidamente.

## 21.6 Risco de tensão

Quando a leitura está muito abaixo e o alvo exigiria grande aumento:

- mostrar aviso;
- pedir conferência da ordem;
- oferecer ouvir referência;
- não emitir orientação agressiva;
- sugerir verificar encordoamento.

## 21.7 Pausa

```txt
Tocar Pausar
    ↓
Interromper captura
    ↓
Manter progresso
    ↓
Mostrar Retomar
```

## 21.8 Saída

```txt
Tocar Voltar
    ↓
Sessão em andamento?
    ├── Não → Sair
    └── Sim → Mostrar:
              - Encerrar;
              - Continuar afinando.
```

Não é necessário confirmar se nenhum par foi iniciado.

---

# 22. Resumo da afinação

## 22.1 Conteúdo

- afinação;
- pares concluídos;
- pares ignorados;
- calibração;
- duração opcional;
- alerta caso algum par não tenha sido confirmado.

## 22.2 Ações

- Concluir;
- Afinar novamente;
- Revisar um par;
- Abrir acordes da afinação.

## 22.3 Persistência

Salvar localmente apenas:

- data da última afinação;
- afinação usada;
- conclusão geral;
- pares concluídos, se útil.

Não salvar:

- áudio;
- frequência contínua;
- gravações.

---

# 23. Afinador cromático

## 23.1 Fluxo

```txt
Abrir cromático
    ↓
Tocar Iniciar
    ↓
Permissão
    ↓
Ouvir sinal
    ↓
Detectar nota mais próxima
    ↓
Mostrar:
- nota;
- oitava;
- frequência;
- cents;
- qualidade do sinal.
```

## 23.2 Diferença do guiado

O modo cromático:

- não exige afinação;
- não avança por pares;
- não marca conclusão;
- não orienta para uma nota alvo, salvo quando o usuário fixa uma nota;
- pode permitir “Fixar alvo”.

## 23.3 Fixar alvo

```txt
Tocar nota atual ou seletor
    ↓
Escolher nota e oitava
    ↓
Medidor passa a comparar com alvo
```

## 23.4 Saída

Parar microfone automaticamente.

---

# 24. Sons de referência

## 24.1 Entradas

- afinador;
- detalhe da afinação;
- onboarding;
- erro de permissão.

## 24.2 Fluxo

```txt
Escolher afinação
    ↓
Escolher par
    ↓
Tocar
    ↓
Reproduzir áudio local
```

## 24.3 Regras

- somente um áudio por vez;
- botão muda para Parar;
- repetir opcional;
- ao mudar afinação, parar;
- ao sair, parar;
- não iniciar automaticamente.

---

# 25. Fluxo da aba Acordes

## 25.1 Entrada

```txt
Abrir aba Acordes
    ↓
Carregar afinação ativa
    ↓
Restaurar filtros seguros
    ↓
Mostrar nota e qualidade
```

## 25.2 Estado inicial

Para novo usuário:

- nota `D` ou acorde aberto relacionado à afinação;
- qualidade maior;
- posições verificadas;
- dificuldade fácil.

## 25.3 Estrutura de interação

```txt
Selecionar nota
    ↓
Selecionar qualidade
    ↓
Aplicar filtros opcionais
    ↓
Listar formas
    ↓
Abrir detalhe
```

## 25.4 Busca

A busca deve aceitar:

- `Ré`;
- `D`;
- `D7`;
- `Ré maior`;
- `Ré com sétima`.

O sistema normaliza localmente.

## 25.5 Sem resultado

```txt
Nenhuma posição revisada encontrada.
```

Ações:

- remover filtros;
- mostrar posições calculadas;
- alterar afinação;
- criar posição futuramente.

## 25.6 Filtros

- verificados;
- calculados;
- sem pestana;
- com pestana;
- dificuldade;
- região do braço;
- favoritos.

Filtros ativos devem ser visíveis.

---

# 26. Detalhe do acorde

## 26.1 Fluxo

```txt
Abrir acorde
    ↓
Mostrar forma principal
    ↓
Usuário pode:
    ├── alternar 5 ordens / 10 cordas
    ├── ouvir
    ├── favoritar
    ├── ver notas
    ├── ver intervalos
    ├── ver outras posições
    ├── abrir cifras relacionadas
    └── alterar afinação
```

## 26.2 Alternar visualização

```txt
Tocar “10 cordas”
    ↓
Atualizar diagrama
    ↓
Deseja usar sempre?
    ├── Não → Somente nesta tela
    └── Sim → Atualizar preferência
```

A pergunta “usar sempre” não deve aparecer repetidamente.

Pode existir ação em menu:

`Definir como padrão`.

## 26.3 Ouvir acorde

```txt
Tocar ouvir
    ↓
Áudio disponível?
    ├── Sim → Reproduzir
    └── Não → Mostrar indisponível
```

Não sintetizar áudio incorreto apenas para preencher o recurso.

## 26.4 Favoritar

- atualização otimista;
- salvar no banco;
- reverter se falhar;
- mostrar toast.

## 26.5 Forma calculada

Ao abrir:

```txt
Aviso compacto:
“Esta posição foi calculada e ainda não passou por revisão manual.”
```

Ações:

- entender cálculo;
- ver notas;
- continuar;
- ocultar posições calculadas.

## 26.6 Troca de afinação

```txt
Alterar afinação
    ↓
Buscar acorde equivalente
    ↓
Existe forma?
    ├── Sim → Atualizar
    └── Não → Estado indisponível
```

## 26.7 Cifras relacionadas

Mostrar apenas cifras:

- compatíveis;
- autorizadas;
- com aquele acorde;
- disponíveis localmente.

---

# 27. Fluxo da aba Cifras

## 27.1 Entrada

```txt
Abrir aba Cifras
    ↓
Carregar categorias
    ↓
Restaurar busca segura
    ↓
Mostrar conteúdo local
```

## 27.2 Seções

- Todas;
- Favoritas;
- Minhas cifras;
- Domínio público ou autorizadas;
- Recentes.

## 27.3 Busca

Campos pesquisáveis:

- título;
- artista;
- compositor;
- tag;
- ritmo.

## 27.4 Filtros

- tom;
- afinação;
- ritmo;
- dificuldade;
- conteúdo oficial;
- conteúdo próprio;
- favoritos.

## 27.5 Fluxo de pesquisa

```txt
Digitar termo
    ↓
Busca local com debounce
    ↓
Resultados
    ↓
Abrir cifra
```

## 27.6 Sem resultado

Ações:

- limpar filtros;
- criar cifra;
- importar cifra;
- revisar grafia.

Não oferecer busca online na V1.

---

# 28. Detalhe da cifra

## 28.1 Entrada

- lista;
- favoritos;
- recentes;
- início;
- cifras relacionadas;
- após salvar uma cifra própria.

## 28.2 Carregamento

```txt
Abrir item
    ↓
Existe?
    ├── Não → Item indisponível
    └── Sim → Carregar seções, acordes e metadados
    ↓
Verificar afinação ativa
    ↓
Compatibilidade
```

## 28.3 Compatibilidade

### Compatível e revisada

Abrir normalmente.

### Compatível por cálculo

Mostrar aviso:

```txt
A adaptação para esta afinação foi calculada e ainda não foi revisada.
```

### Incompatível

Mostrar opções:

- usar afinação recomendada;
- manter afinação e ver somente símbolos;
- alterar globalmente;
- voltar.

## 28.4 Hierarquia

- título;
- artista;
- afinação;
- tom;
- ritmo;
- controles;
- cifra;
- acordes usados;
- observações.

## 28.5 Ações

- transpor;
- modo palco;
- favoritar;
- abrir acorde;
- iniciar metrônomo;
- editar, se própria;
- duplicar;
- compartilhar ou exportar, se implementado;
- menu.

---

# 29. Transposição da cifra

## 29.1 Fluxo básico

```txt
Tocar +
    ↓
Subir um semitom
    ↓
Atualizar todos os símbolos
    ↓
Validar formas na afinação
    ↓
Atualizar diagramas
```

Equivalente para `−`.

## 29.2 Seleção direta

```txt
Tocar tom atual
    ↓
Abrir seletor cromático
    ↓
Escolher tom
    ↓
Aplicar
```

## 29.3 Restaurar

```txt
Tom atual diferente do original
    ↓
Ação “Restaurar tom original”
```

## 29.4 Formas indisponíveis

```txt
Transposição gera acorde sem forma revisada
    ↓
Mostrar indicador no acorde
    ↓
Ações:
    ├── ver posição calculada;
    ├── usar outra inversão;
    ├── sugerir capotraste;
    └── manter símbolo sem diagrama.
```

## 29.5 Persistência

### Cifra oficial

Não alterar o arquivo original.

Salvar preferência por música localmente, se o usuário escolher:

`Lembrar este tom`.

### Cifra própria

Pode atualizar o tom no documento somente após ação explícita:

`Salvar como novo tom`.

## 29.6 Undo

Após transposição múltipla, o botão restaurar deve estar disponível.

Não é necessário toast a cada semitom.

---

# 30. Abrir acorde a partir da cifra

## 30.1 Fluxo

```txt
Tocar símbolo do acorde
    ↓
Abrir bottom sheet
    ↓
Mostrar forma principal
    ↓
Ações:
    ├── ouvir;
    ├── ver detalhe;
    ├── escolher outra posição;
    └── fechar.
```

## 30.2 Regra

O bottom sheet não deve perder:

- posição da cifra;
- tom;
- rolagem;
- estado do modo comum.

## 30.3 Forma ausente

Mostrar:

```txt
Ainda não há uma posição revisada para este acorde nesta afinação.
```

Ações:

- ver forma calculada;
- alterar afinação;
- fechar.

---

# 31. Metrônomo a partir da cifra

## 31.1 Fluxo

```txt
Tocar metrônomo
    ↓
Abrir painel compacto
    ↓
Usar BPM da cifra
    ↓
Usuário inicia
```

## 31.2 Navegação

O metrônomo pode continuar enquanto:

- a cifra permanece aberta;
- o usuário abre um acorde em bottom sheet;
- entra no modo palco, se configurado.

Deve parar ao:

- sair da cifra;
- iniciar áudio incompatível;
- abrir afinador;
- atender interrupção de áudio do sistema, conforme regras da plataforma.

## 31.3 Conflito de áudio

Se som de acorde ou referência for iniciado:

```txt
Metrônomo ativo
    ↓
Solicitar ação:
    ├── Pausar metrônomo e tocar áudio
    └── Cancelar áudio
```

---

# 32. Modo palco

## 32.1 Entrada

```txt
Detalhe da cifra
    ↓
Tocar “Modo palco”
    ↓
Verificar orientação e tela ativa
    ↓
Abrir palco
```

## 32.2 Primeira utilização

Mostrar instrução curta:

```txt
Toque na tela para mostrar ou ocultar os controles.
```

Não repetir após confirmação.

## 32.3 Estado inicial

- cifra no topo;
- rolagem parada;
- controles visíveis;
- tom e afinação compactos;
- tela ativa;
- bottom tab oculta.

## 32.4 Iniciar rolagem

```txt
Tocar Play
    ↓
Rolagem automática
    ↓
Controles reduzem opacidade
    ↓
Toque na tela
    ↓
Pausar ou exibir controles, conforme configuração
```

## 32.5 Alterar velocidade

```txt
Abrir controle
    ↓
Ajustar velocidade
    ↓
Prévia imediata
    ↓
Salvar preferência opcional
```

## 32.6 Alterar tamanho do texto

- preservar posição aproximada;
- recalcular layout;
- não pular para o início sem aviso.

## 32.7 Alterar tom no palco

Padrão:

- controles bloqueados durante rolagem;
- pausar antes de alterar;
- exigir confirmação quando acordes não revisados surgirem.

## 32.8 Bloquear controles

```txt
Tocar cadeado
    ↓
Ocultar ações de edição
    ↓
Manter:
    - pausa;
    - mostrar controles;
    - sair com gesto definido.
```

## 32.9 Sair

```txt
Tocar sair
    ↓
Parar rolagem
    ↓
Parar metrônomo
    ↓
Restaurar orientação do sistema
    ↓
Voltar ao detalhe na posição aproximada
```

## 32.10 Interrupções

### Chamada, alarme ou áudio externo

- pausar metrônomo;
- pausar rolagem opcionalmente;
- mostrar estado ao retornar;
- não reiniciar automaticamente áudio.

### Tela bloqueada

O modo palco deve tentar impedir bloqueio enquanto ativo, conforme permissão e configuração.

---

# 33. Favoritar uma cifra

```txt
Detalhe ou lista
    ↓
Tocar favorito
    ↓
Salvar localmente
    ↓
Atualizar UI
    ↓
Toast com Desfazer
```

## Erro de banco

- reverter estado;
- mostrar erro;
- não perder posição.

---

# 34. Cifra própria — lista

## 34.1 Entrada

```txt
Cifras
    ↓
Minhas cifras
```

## 34.2 Estado vazio

```txt
Você ainda não criou cifras.

[ Criar cifra ]
[ Importar texto ]
```

## 34.3 Ações por item

- abrir;
- editar;
- duplicar;
- favoritar;
- exportar;
- excluir.

Ações secundárias em menu.

---

# 35. Criar cifra

## 35.1 Fluxo geral

```txt
Tocar “Criar cifra”
    ↓
Novo rascunho local
    ↓
Informações básicas
    ↓
Conteúdo
    ↓
Acordes
    ↓
Metadados musicais
    ↓
Prévia
    ↓
Salvar
    ↓
Detalhe da cifra
```

## 35.2 Etapas recomendadas

### Etapa 1 — Identificação

- título obrigatório;
- artista opcional;
- compositor opcional.

### Etapa 2 — Configuração musical

- tom;
- afinação;
- ritmo;
- compasso;
- BPM;
- capotraste.

### Etapa 3 — Conteúdo

- letra;
- estrutura;
- seções;
- acordes.

### Etapa 4 — Revisão

- prévia;
- alertas;
- salvar.

## 35.3 Salvamento automático

Salvar rascunho local após alterações relevantes.

Estado:

```txt
saving
saved
save_error
```

Mostrar discretamente:

```txt
Rascunho salvo
```

## 35.4 Validação

Obrigatório:

- título;
- algum conteúdo musical ou textual;
- tom válido, quando acordes forem inseridos;
- afinação válida;
- símbolos reconhecíveis.

## 35.5 Saída com alterações

```txt
Tocar voltar
    ↓
Rascunho salvo?
    ├── Sim → Sair
    └── Não → Opções:
              ├── Salvar rascunho;
              ├── Descartar;
              └── Continuar editando.
```

---

# 36. Inserir acorde no editor

## 36.1 Fluxo

```txt
Posicionar cursor ou selecionar trecho
    ↓
Tocar “Inserir acorde”
    ↓
Abrir seletor
    ↓
Escolher nota
    ↓
Escolher qualidade
    ↓
Mostrar símbolo e forma
    ↓
Inserir
```

## 36.2 Acorde sem forma revisada

Permitir inserir o símbolo, mas mostrar:

```txt
O símbolo será inserido, porém não há uma posição revisada para a afinação atual.
```

## 36.3 Editar acorde

```txt
Tocar acorde existente
    ↓
Opções:
    ├── substituir;
    ├── mover;
    ├── remover;
    └── ver diagrama.
```

## 36.4 Desfazer

Editor deve suportar:

- desfazer última ação;
- refazer;
- sem histórico ilimitado.

---

# 37. Importar cifra em texto

## 37.1 Entrada

- Minhas cifras;
- botão criar;
- menu do editor.

## 37.2 Fluxo

```txt
Abrir Importar
    ↓
Colar ou escolher arquivo de texto
    ↓
Analisar localmente
    ↓
Reconhecer padrões
    ↓
Mostrar prévia
    ↓
Usuário corrige
    ↓
Salvar como cifra própria
```

## 37.3 Padrões suportados na V1

```txt
[D] Trecho com [A] acordes
```

e formato simples com acordes em linha superior.

## 37.4 Resultado da análise

Classificar:

- acordes reconhecidos;
- acordes não reconhecidos;
- possíveis seções;
- texto;
- metadados ausentes.

## 37.5 Erros

### Texto vazio

Não permitir avançar.

### Formato não reconhecido

Oferecer:

- importar somente como texto;
- editar manualmente;
- cancelar.

### Arquivo grande

- mostrar limite;
- não travar;
- permitir importar parcialmente somente com consentimento.

## 37.6 Direitos autorais

Antes de concluir, mostrar confirmação:

```txt
Confirme que você possui autorização para armazenar e utilizar este conteúdo.
```

Isso não substitui política jurídica, mas registra orientação.

---

# 38. Editar cifra própria

## 38.1 Fluxo

```txt
Detalhe da minha cifra
    ↓
Editar
    ↓
Criar versão de trabalho
    ↓
Alterar
    ↓
Prévia
    ↓
Salvar
```

## 38.2 Conflito

Como a V1 é local, não há conflito remoto.

Pode haver conflito se:

- item foi removido em outra tela;
- importação substituiu o banco;
- restauração ocorreu.

Nesse caso:

- impedir sobrescrita silenciosa;
- oferecer salvar como cópia.

## 38.3 Excluir

```txt
Menu
    ↓
Excluir cifra
    ↓
Dialog com título
    ↓
Confirmar
    ↓
Remover
    ↓
Toast “Cifra excluída” com Desfazer temporário
```

Se o desfazer for tecnicamente seguro, manter item em lixeira temporária.

---

# 39. Fluxo da aba Estudos

## 39.1 Entrada

```txt
Abrir Estudos
    ↓
Mostrar:
    - continuar treino;
    - ritmos;
    - metrônomo;
    - exercícios.
```

## 39.2 Novo usuário

Priorizar:

- primeira batida;
- metrônomo;
- exercício com dois acordes.

## 39.3 Usuário recorrente

Priorizar:

- continuar ritmo;
- andamento anterior;
- últimos exercícios.

---

# 40. Lista de ritmos

## 40.1 Fluxo

```txt
Estudos
    ↓
Ritmos
    ↓
Lista local
    ↓
Filtro por:
    - dificuldade;
    - compasso;
    - favorito.
    ↓
Abrir ritmo
```

## 40.2 Card

Mostrar:

- nome;
- compasso;
- BPM sugerido;
- dificuldade;
- prévia do padrão;
- favorito.

## 40.3 Sem resultado

- limpar filtros;
- ver todos;
- abrir metrônomo.

---

# 41. Detalhe do ritmo

## 41.1 Conteúdo

- nome;
- descrição;
- compasso;
- BPM;
- padrão;
- legenda;
- áudio lento;
- áudio normal;
- exercício;
- músicas relacionadas;
- modo destro ou canhoto.

## 41.2 Fluxo

```txt
Abrir ritmo
    ↓
Visualizar padrão
    ↓
Ouvir exemplo
    ↓
Iniciar treino
```

## 41.3 Áudio de exemplo

- tocar localmente;
- parar outro áudio;
- mostrar progresso simples;
- não tocar metrônomo simultaneamente sem opção explícita.

## 41.4 Alterar mão

```txt
Tocar Destro/Canhoto
    ↓
Espelhar padrão aplicável
    ↓
Opção “Definir como padrão”
```

---

# 42. Treino de batida

## 42.1 Fluxo

```txt
Tocar “Iniciar treino”
    ↓
Escolher velocidade
    ↓
Escolher:
    - somente padrão;
    - com metrônomo;
    - com progressão.
    ↓
Contagem inicial
    ↓
Cursor acompanha padrão
    ↓
Usuário pratica
    ↓
Pausar ou concluir
```

## 42.2 Velocidade

Opções rápidas:

- 50%;
- 75%;
- 100%;
- BPM personalizado.

## 42.3 Contagem inicial

Padrão:

- um compasso antes de iniciar;
- pode ser desativada.

## 42.4 Progressão

Para V1:

- progressões predefinidas;
- acordes compatíveis com afinação;
- sem avaliação automática da execução.

## 42.5 Concluir

Mostrar resumo simples:

- ritmo;
- BPM;
- duração;
- opção repetir;
- aumentar BPM;
- abrir cifra relacionada.

Não usar pontuação artificial.

---

# 43. Metrônomo

## 43.1 Entrada

- aba Estudos;
- detalhe de ritmo;
- cifra;
- atalho da Início.

## 43.2 Estado inicial

```txt
BPM anterior ou padrão
Compasso anterior ou contexto
Parado
```

Nunca iniciar automaticamente.

## 43.3 Fluxo

```txt
Ajustar BPM
    ↓
Selecionar compasso
    ↓
Tocar Iniciar
    ↓
Contagem opcional
    ↓
Reprodução
    ↓
Pausar ou parar
```

## 43.4 Tap tempo

```txt
Tocar repetidamente
    ↓
Calcular intervalo mediano
    ↓
Atualizar BPM
```

Reiniciar cálculo após pausa longa.

## 43.5 Ajuste contínuo

- toque aumenta ou diminui 1 BPM;
- pressão prolongada acelera;
- arraste opcional;
- limites definidos.

## 43.6 Navegação com metrônomo ativo

### Permitido

- abrir cifra relacionada;
- abrir padrão do ritmo;
- alternar entre telas do mesmo contexto.

### Não permitido sem confirmação

- abrir afinador;
- reproduzir som de referência;
- tocar áudio de acorde;
- iniciar outro exercício sonoro.

## 43.7 Interrupção

Ao receber chamada ou outra interrupção:

- pausar;
- não retomar automaticamente;
- mostrar `Retomar metrônomo`.

---

# 44. Favoritos

## 44.1 Entrada

- Início;
- menu;
- filtro de cada módulo.

## 44.2 Categorias

- cifras;
- acordes;
- afinações;
- ritmos;
- exercícios.

## 44.3 Fluxo

```txt
Abrir Favoritos
    ↓
Selecionar categoria
    ↓
Abrir item
```

## 44.4 Estado vazio por categoria

Mostrar CTA específico.

Exemplo:

```txt
Nenhum acorde favorito.
Explore o dicionário e salve as posições que mais usa.
[ Explorar acordes ]
```

## 44.5 Remover

- permitir pelo detalhe;
- swipe opcional apenas com confirmação visual;
- desfazer.

---

# 45. Recentes

## 45.1 Itens

- cifras abertas;
- acordes consultados;
- afinações vistas;
- ritmos estudados.

## 45.2 Fluxo

```txt
Abrir Recentes
    ↓
Filtrar por categoria
    ↓
Abrir item
```

## 45.3 Limpeza

```txt
Menu
    ↓
Limpar histórico
    ↓
Confirmar
```

Não apaga:

- favoritos;
- cifras próprias;
- preferências;
- histórico de compra.

---

# 46. Configurações

## 46.1 Estrutura

```txt
Configurações
├── Aparência
├── Música e diagramas
├── Afinador
├── Áudio e vibração
├── Modo palco
├── Armazenamento e backup
├── Privacidade
├── Compras, caso adotadas
└── Sobre
```

## 46.2 Abertura

```txt
Início ou menu
    ↓
Configurações
```

---

# 47. Aparência

## 47.1 Tema

Opções:

- seguir sistema;
- claro;
- escuro.

## 47.2 Alto contraste

Toggle independente.

## 47.3 Tamanho do texto interno

Somente se necessário além do sistema:

- padrão;
- grande;
- extra grande.

Não reduzir abaixo da configuração do sistema.

## 47.4 Fluxo

```txt
Alterar opção
    ↓
Prévia imediata
    ↓
Salvar automaticamente
```

## 47.5 Restaurar

`Restaurar aparência padrão`.

---

# 48. Música e diagramas

## 48.1 Opções

- cinco ordens;
- dez cordas;
- orientação padrão;
- espelhada;
- destro;
- canhoto;
- sustenidos;
- bemóis;
- detalhes teóricos expandidos;
- posições calculadas visíveis.

## 48.2 Alteração da notação

```txt
Selecionar bemóis
    ↓
Atualizar exibição
```

Não mudar representação interna.

## 48.3 Posições calculadas

Ao ativar:

```txt
Mostrar explicação:
“As posições calculadas ainda podem não ter revisão manual.”
```

---

# 49. Configurações do afinador

## 49.1 Opções

- calibração A4;
- tolerância em cents;
- avanço automático;
- vibração ao afinar;
- manter tela ativa;
- filtro de ruído;
- mostrar frequência.

## 49.2 Calibração

Padrão:

```txt
A4 = 440 Hz
```

Faixa segura definida tecnicamente.

## 49.3 Restaurar

`Restaurar padrões do afinador`.

## 49.4 Testar microfone

```txt
Configurações
    ↓
Testar microfone
    ↓
Fluxo de permissão
    ↓
Medidor de sinal
```

---

# 50. Áudio e vibração

## 50.1 Opções

- volume de referência;
- volume do metrônomo;
- acento do primeiro tempo;
- contagem falada;
- vibração;
- sons de confirmação.

## 50.2 Regra

Mudanças devem ter prévia controlada, sem tocar som inesperadamente.

---

# 51. Configurações do modo palco

## 51.1 Opções

- manter tela ativa;
- ocultar controles;
- pausar ao tocar;
- velocidade padrão;
- tamanho padrão;
- orientação preferida;
- alto contraste automático.

## 51.2 Aplicação

Novas configurações valem para a próxima entrada.

Alterações feitas dentro do palco podem ser salvas como padrão por ação explícita.

---

# 52. Backup

## 52.1 Entrada

```txt
Configurações
    ↓
Armazenamento e backup
```

## 52.2 Tela

Mostrar:

- data do último backup;
- conteúdo incluído;
- tamanho estimado;
- exportar;
- importar;
- validar arquivo;
- informações de privacidade.

---

# 53. Exportar backup

## 53.1 Fluxo

```txt
Tocar “Exportar backup”
    ↓
Selecionar conteúdo
    ↓
Gerar arquivo temporário
    ↓
Validar
    ↓
Abrir compartilhamento do sistema
    ↓
Usuário salva ou compartilha
    ↓
Sucesso?
    ├── Sim → Registrar data
    └── Não → Excluir temporário
```

## 53.2 Conteúdo selecionável

- cifras próprias;
- favoritos;
- configurações;
- histórico;
- afinações personalizadas futuras;
- anotações futuras.

## 53.3 Permissões

Preferir seletor ou compartilhamento do sistema.

Não pedir acesso amplo ao armazenamento quando não for necessário.

## 53.4 Cancelamento

Cancelar o compartilhamento não é erro crítico.

Mensagem opcional:

`Backup não exportado`.

## 53.5 Segurança

- arquivo versionado;
- checksum;
- formato conhecido;
- sem código executável;
- sem áudio capturado;
- sem dados pessoais inexistentes.

---

# 54. Importar backup

## 54.1 Fluxo

```txt
Tocar “Importar backup”
    ↓
Abrir seletor de arquivo
    ↓
Usuário escolhe
    ↓
Ler somente metadados
    ↓
Validar assinatura, versão e tamanho
    ↓
Arquivo válido?
    ├── Não → Explicar erro
    └── Sim → Mostrar prévia
    ↓
Escolher:
    ├── Mesclar
    └── Substituir
    ↓
Criar backup de segurança atual
    ↓
Importar em transação
    ↓
Validar integridade
    ↓
Sucesso?
    ├── Sim → Reiniciar estado necessário
    └── Não → Restaurar backup anterior
```

## 54.2 Prévia

Mostrar quantidades:

- cifras;
- favoritos;
- configurações;
- histórico;
- versão;
- data.

## 54.3 Mesclar

Regras:

- IDs oficiais não podem ser sobrescritos;
- itens próprios com conflito devem ser duplicados ou resolvidos;
- preferências podem ser escolhidas;
- favoritos são unidos;
- histórico pode ser opcional.

## 54.4 Substituir

Mostrar aviso forte:

```txt
Os dados pessoais atuais serão substituídos pelos dados deste arquivo.
```

Exigir confirmação deliberada.

## 54.5 Arquivo incompatível

Ações:

- cancelar;
- tentar versão compatível futura;
- importar somente itens suportados, se seguro;
- nunca tentar adivinhar estrutura.

---

# 55. Restaurar configurações

## 55.1 Fluxo

```txt
Configurações
    ↓
Restaurar padrões
    ↓
Selecionar escopo:
    - somente aparência;
    - afinador;
    - todas as configurações.
    ↓
Confirmar
```

Não apagar:

- cifras;
- favoritos;
- backup;
- compra.

---

# 56. Privacidade

## 56.1 Conteúdo

- uso do microfone;
- armazenamento local;
- ausência de conta;
- ausência de rastreamento na V1;
- backup manual;
- dados de compra, caso adotados;
- versão da política.

## 56.2 Ações

- abrir política completa;
- ver permissões;
- abrir configurações do sistema;
- excluir dados locais.

## 56.3 Excluir dados locais

```txt
Privacidade
    ↓
Excluir meus dados locais
    ↓
Mostrar escopo
    ↓
Recomendar backup
    ↓
Confirmação reforçada
    ↓
Excluir dados pessoais
    ↓
Recriar banco de usuário vazio
```

Não apagar conteúdo oficial do app.

---

# 57. Fluxo Pro, caso adotado

## 57.1 Princípio

O fluxo Pro é opcional até decisão comercial final.

O aplicativo deve permanecer funcional sem compra.

## 57.2 Entrada por recurso

```txt
Usuário toca recurso Pro
    ↓
PremiumLock
    ↓
Mostrar benefício específico
    ↓
Ações:
    ├── Conhecer Pro
    └── Continuar com alternativa gratuita
```

## 57.3 Tela Pro

Conteúdo:

- compra única;
- recursos;
- preço carregado da loja;
- restaurar compra;
- termos;
- privacidade.

## 57.4 Compra

```txt
Tocar comprar
    ↓
Verificar disponibilidade da loja
    ↓
Iniciar compra nativa
    ↓
Resultado:
    ├── Sucesso → Validar → Cache local → Desbloquear
    ├── Cancelada → Voltar sem erro
    ├── Pendente → Mostrar pendente
    └── Falha → Explicar e tentar novamente
```

## 57.5 Offline

Se a compra já foi validada:

- usar entitlement em cache;
- não bloquear recursos por falta momentânea de internet;
- revalidar quando possível.

## 57.6 Restaurar

```txt
Tocar restaurar
    ↓
Consultar loja
    ↓
Encontrou compra?
    ├── Sim → Validar → Desbloquear
    └── Não → Mostrar nenhuma compra encontrada
```

---

# 58. Fluxos offline

## 58.1 Regra central

O app deve funcionar normalmente sem internet.

Não mostrar banner “Você está offline” em toda tela.

## 58.2 Quando indicar offline

Somente quando:

- compra precisa ser iniciada;
- conteúdo futuro online foi solicitado;
- link externo foi aberto;
- restauração de compra é necessária;
- atualização remota futura é solicitada.

## 58.3 Funções que continuam

- afinador;
- acordes;
- cifras locais;
- ritmos;
- metrônomo;
- editor;
- favoritos;
- configurações;
- backup local.

## 58.4 Links externos

```txt
Tocar link
    ↓
Internet disponível?
    ├── Sim → Abrir navegador
    └── Não → Informar e manter contexto
```

---

# 59. Erros gerais

## 59.1 Tipos

- banco;
- áudio;
- permissão;
- arquivo;
- conteúdo;
- compra;
- memória;
- item removido;
- migração;
- exportação.

## 59.2 Estrutura da mensagem

Toda mensagem deve responder:

1. o que aconteceu;
2. o que foi afetado;
3. o que não foi perdido;
4. o que o usuário pode fazer.

## 59.3 Exemplo

```txt
Não foi possível salvar a cifra.

O rascunho continua aberto e seu texto não foi perdido.

[ Tentar novamente ]
[ Exportar texto ]
```

## 59.4 Logs

Erros técnicos podem ser registrados localmente de forma limitada.

Não incluir:

- conteúdo completo das cifras;
- áudio;
- dados sensíveis;
- caminhos privados desnecessários.

---

# 60. Item não encontrado

## 60.1 Causas

- item removido;
- backup substituiu conteúdo;
- versão atual não contém item;
- link interno antigo.

## 60.2 Fluxo

```txt
Abrir item
    ↓
Não encontrado
    ↓
Mostrar:
    - Voltar;
    - Buscar item semelhante;
    - Ir à categoria.
```

Remover referência quebrada de recentes.

---

# 61. Banco em modo somente leitura

Caso o banco do usuário não possa ser alterado, mas o conteúdo oficial possa ser aberto:

```txt
Abrir app em modo leitura
    ↓
Mostrar aviso
    ↓
Permitir:
    - consultar;
    - afinar;
    - tocar;
    - exportar dados existentes.
    ↓
Bloquear:
    - editar;
    - favoritar;
    - importar;
    - salvar configurações.
```

Oferecer tentativa de reparo.

---

# 62. Falta de espaço

## 62.1 Durante salvamento

```txt
Falha por espaço
    ↓
Manter rascunho na memória, quando possível
    ↓
Mostrar:
“Não há espaço suficiente para salvar.”
```

Ações:

- liberar espaço;
- exportar como texto;
- tentar novamente.

## 62.2 Durante backup

- cancelar geração;
- remover temporários;
- não alterar dados atuais.

---

# 63. Interrupções do aplicativo

## 63.1 App vai para background

### Afinador

- parar microfone;
- manter progresso da sessão;
- exigir retomar.

### Metrônomo

Comportamento configurável e limitado pelas plataformas.

Padrão seguro:

- pausar ao sair do app;
- mostrar retomar.

### Áudio de referência

- parar.

### Editor

- salvar rascunho.

### Modo palco

- pausar rolagem;
- manter posição.

## 63.2 App encerrado pelo sistema

Ao retornar:

- restaurar rascunhos;
- não reativar áudio;
- mostrar card continuar;
- limpar estados transitórios inválidos.

---

# 64. Fluxo em tablet

## 64.1 Princípio

O tablet não deve apenas ampliar o celular.

## 64.2 Cifras

```txt
Lista à esquerda
Detalhe à direita
```

ou:

```txt
Cifra principal
Painel de acordes
```

## 64.3 Acordes

- grade de formas;
- detalhe em painel;
- filtros persistentes laterais.

## 64.4 Afinador

- lista de pares lateral;
- medidor central;
- som de referência em painel.

## 64.5 Estudos

- padrão e explicação lado a lado;
- metrônomo junto do exercício.

## 64.6 Navegação

Pode manter bottom tabs ou adaptar para rail em telas largas, desde que:

- rotas permaneçam iguais;
- comportamento não mude;
- labels sejam visíveis.

---

# 65. Orientação de tela

## 65.1 Retrato

Padrão para:

- onboarding;
- início;
- listas;
- acordes;
- afinador;
- configurações;
- edição.

## 65.2 Paisagem

Permitida ou priorizada em:

- modo palco;
- cifras em tablet;
- treino de ritmo;
- metrônomo com exercício.

## 65.3 Alteração durante uso

- preservar contexto;
- recalcular layout;
- não reiniciar áudio;
- não perder rolagem;
- não alterar afinação.

---

# 66. Acessibilidade no fluxo

## 66.1 Leitor de tela

Ao entrar em uma tela:

- anunciar título;
- anunciar estado crítico;
- focar no primeiro conteúdo relevante.

## 66.2 Afinador

Como o medidor muda continuamente:

- não anunciar cada mudança;
- anunciar somente estados estáveis;
- exemplo: `Nota abaixo`, `Afinada`, `Nota acima`.

## 66.3 Ritmo

- fornecer descrição textual completa;
- permitir avançar etapa manualmente;
- não depender só de animação.

## 66.4 Modo palco

- controles acessíveis;
- tamanho alto;
- contraste;
- não ocultar saída do leitor de tela.

## 66.5 Dialogs

Ao abrir:

- mover foco;
- prender foco;
- restaurar foco ao fechar.

---

# 67. Fluxos por persona

## 67.1 Iniciante

```txt
Onboarding
    ↓
Cebolão em Ré
    ↓
Afinador guiado
    ↓
Primeiros acordes
    ↓
Ritmo fácil
    ↓
Cifra simples
```

## 67.2 Intermediário

```txt
Início
    ↓
Cifra
    ↓
Transpor
    ↓
Revisar acordes
    ↓
Metrônomo
    ↓
Modo palco
```

## 67.3 Experiente

```txt
Minhas cifras
    ↓
Criar/importar
    ↓
Definir afinação
    ↓
Editar acordes
    ↓
Salvar
    ↓
Modo palco
    ↓
Backup
```

---

# 68. Fluxos de retenção local

A V1 não depende de notificações.

A retenção deve ocorrer por:

- continuar última cifra;
- últimos acordes;
- ritmos recentes;
- favoritos;
- afinação ativa;
- rascunhos;
- modo palco;
- biblioteca pessoal.

Não utilizar:

- streak obrigatório;
- perda de progresso;
- mensagens de culpa;
- notificações invasivas.

---

# 69. Regras de histórico

## 69.1 Registrar

- abertura de item;
- conclusão de afinação;
- início de treino;
- edição de cifra;
- último BPM.

## 69.2 Não registrar

- cada toque;
- áudio captado;
- frequência contínua;
- texto digitado em logs;
- navegação irrelevante.

## 69.3 Limites

- recentes por categoria;
- histórico de treino agregado;
- limpeza automática configurável;
- limpeza manual.

---

# 70. Máquina de estados resumida — Afinador guiado

```txt
idle
  ↓ start
permission_check
  ├── denied → permission_denied
  ├── blocked → permission_blocked
  └── granted → initializing
                     ↓
                  listening
                     ↓
                signal_check
                  ├── weak → listening
                  ├── wrong_note → listening
                  └── valid → comparing
                                  ├── low → listening
                                  ├── high → listening
                                  └── in_tune → stabilizing
                                                    ├── unstable → listening
                                                    └── stable → course_complete
                                                                      ↓
                                                               more_courses?
                                                                  ├── yes → listening
                                                                  └── no → session_complete
```

---

# 71. Máquina de estados resumida — Cifra

```txt
loading
  ├── not_found → unavailable
  └── loaded → compatibility_check
                   ├── verified → ready
                   ├── calculated → warning → ready
                   └── incompatible → decision
                                         ├── use_recommended_tuning → ready
                                         ├── symbols_only → ready_limited
                                         └── cancel → exit
```

---

# 72. Máquina de estados resumida — Editor

```txt
new_or_existing
    ↓
loading
    ↓
editing
  ├── change → dirty → autosaving
  │                         ├── success → editing_saved
  │                         └── fail → save_error
  ├── preview → previewing → editing
  ├── submit → validating
  │               ├── invalid → editing_with_errors
  │               └── valid → saving_final
  │                                ├── success → detail
  │                                └── fail → save_error
  └── exit
          ├── clean → close
          └── dirty → decision
```

---

# 73. Máquina de estados resumida — Backup

```txt
idle
  ↓ select_action
exporting
  ├── generate_fail → error
  └── generated → share_sheet
                    ├── cancelled → idle
                    └── completed → success

idle
  ↓ import
file_picker
  ├── cancelled → idle
  └── selected → validating
                   ├── invalid → error
                   └── valid → preview
                                ↓ choose_strategy
                              importing
                                ├── fail → rollback → error
                                └── success → reload → success
```

---

# 74. Sugestão de rotas com Expo Router

```txt
app/
  _layout.tsx

  onboarding/
    index.tsx
    experience.tsx
    tuning.tsx
    diagram.tsx
    handedness.tsx
    microphone.tsx
    summary.tsx

  (tabs)/
    _layout.tsx
    index.tsx
    songs.tsx
    chords.tsx
    tuner.tsx
    studies.tsx

  tunings/
    index.tsx
    [tuningId].tsx
    select.tsx

  songs/
    [songId].tsx
    [songId]/
      stage.tsx
      chords.tsx
    create.tsx
    import.tsx
    edit/
      [songId].tsx

  chords/
    [shapeId].tsx
    select.tsx

  tuner/
    guided.tsx
    chromatic.tsx
    reference.tsx
    summary.tsx

  rhythms/
    index.tsx
    [rhythmId].tsx
    [rhythmId]/
      practice.tsx

  metronome/
    index.tsx

  library/
    favorites.tsx
    recent.tsx
    my-songs.tsx

  settings/
    index.tsx
    appearance.tsx
    music.tsx
    tuner.tsx
    audio.tsx
    stage.tsx
    backup.tsx
    privacy.tsx
    about.tsx

  premium.tsx
  privacy.tsx
  credits.tsx
```

## 74.1 Regras de rota

- IDs estáveis;
- rotas não dependem de título;
- item ausente usa estado próprio;
- parâmetros musicais não devem conter dados grandes;
- dados são buscados no banco;
- modo palco recebe `songId` e estado local;
- filtros ficam em store local da feature;
- deep links externos ficam fora da V1, salvo links institucionais.

---

# 75. Fluxo de dados entre telas

## 75.1 Afinação ativa

Fonte:

```txt
settings/preferences store
```

Consumidores:

- Início;
- Acordes;
- Afinador;
- Cifras;
- Estudos relacionados.

## 75.2 Cifra

Fonte:

```txt
songs repository
```

Estado temporário:

- tom atual;
- rolagem;
- tamanho;
- modo palco;
- metrônomo.

## 75.3 Acordes

Fonte:

```txt
chords repository
```

Filtros:

```txt
chords feature store
```

## 75.4 Áudio

Fonte:

```txt
audio service
```

Regra:

Somente um contexto de áudio exclusivo por vez, salvo metrônomo compatível.

---

# 76. Regras de transição entre módulos

## 76.1 Afinador → Acordes

Após concluir:

```txt
Resumo
    ↓
Ver acordes desta afinação
```

## 76.2 Acorde → Cifra

```txt
Detalhe
    ↓
Cifras com este acorde
```

## 76.3 Cifra → Ritmo

```txt
Detalhe
    ↓
Abrir ritmo recomendado
```

## 76.4 Ritmo → Cifra

```txt
Detalhe
    ↓
Músicas para praticar
```

## 76.5 Cifra → Afinador

Permitido por menu:

```txt
Afinar antes de tocar
```

Ao abrir:

- guardar contexto da cifra;
- após concluir ou cancelar, retornar à cifra;
- tom e posição permanecem;
- microfone é encerrado ao retornar.

---

# 77. Fluxo “Afinar antes de tocar”

```txt
Detalhe da cifra
    ↓
Tocar “Afinar antes de tocar”
    ↓
Afinador guiado com afinação da cifra
    ↓
Concluir
    ↓
Retornar à cifra
    ↓
Opcional: iniciar modo palco
```

Se a afinação da cifra difere da ativa:

- explicar;
- não alterar globalmente sem confirmação;
- permitir sessão temporária;
- oferecer definir como ativa ao concluir.

---

# 78. Fluxo “Aprender acordes desta música”

```txt
Detalhe da cifra
    ↓
Acordes usados
    ↓
Lista ordenada por primeira aparição
    ↓
Selecionar acorde
    ↓
Mini diagrama ou detalhe
    ↓
Marcar como estudado, futuro opcional
```

Na V1, não criar sistema complexo de progresso obrigatório.

---

# 79. Fluxo de compatibilidade de conteúdo

## 79.1 Conteúdo oficial

```txt
Item oficial
    ↓
Possui revisão na afinação ativa?
    ├── Sim → Mostrar verificado
    └── Não → Possui cálculo?
              ├── Sim → Mostrar calculado
              └── Não → Mostrar indisponível
```

## 79.2 Conteúdo próprio

O usuário pode armazenar símbolo mesmo sem forma.

O app deve:

- preservar o conteúdo;
- não substituir símbolos;
- indicar ausência de diagrama;
- permitir editar depois.

---

# 80. Fluxo de exclusão de dados

## 80.1 Item individual

- confirmar;
- permitir desfazer;
- atualizar favoritos e recentes;
- não afetar conteúdo oficial.

## 80.2 Todos os dados pessoais

- recomendar backup;
- confirmação reforçada;
- excluir em transação;
- restaurar padrões;
- reiniciar onboarding opcionalmente.

## 80.3 Desinstalação

Fora do controle direto do app.

A política deve informar que dados locais podem ser removidos com a desinstalação, salvo backup externo.

---

# 81. Regras para notificações e prompts

## 81.1 Permissões

Solicitar no contexto.

## 81.2 Avaliação da loja

Não solicitar:

- no primeiro uso;
- após erro;
- durante afinação;
- durante palco.

Momento futuro aceitável:

- após uso concluído repetido;
- sem interromper;
- uma frequência limitada.

Não faz parte do fluxo essencial da V1.

## 81.3 Compra

Não mostrar automaticamente ao abrir.

---

# 82. Regras de segurança

## 82.1 Afinação

- não orientar aumento extremo;
- detectar nota distante;
- alertar sobre ordem errada;
- permitir ouvir referência;
- linguagem cuidadosa.

## 82.2 Importação

- validar tamanho;
- validar estrutura;
- impedir execução;
- tratar texto como dados;
- não abrir URLs automaticamente.

## 82.3 Backup

- transação;
- rollback;
- versão;
- checksum;
- prévia.

## 82.4 Conteúdo

- diferenciar origem;
- não afirmar revisão inexistente;
- manter créditos;
- evitar letras comerciais sem autorização.

---

# 83. Critérios de aceitação por jornada

## 83.1 Onboarding

```txt
[ ] pode ser concluído sem conta
[ ] pode ser concluído sem microfone
[ ] escolhas são salvas
[ ] pode ser retomado
[ ] afinação inicial fica clara
[ ] usuário chega à Início
```

## 83.2 Afinador

```txt
[ ] microfone não inicia sozinho
[ ] permissão é contextual
[ ] negar não bloqueia o app
[ ] nota alvo fica clara
[ ] sinal fraco não gera orientação falsa
[ ] sessão pode ser pausada
[ ] áudio para ao sair
```

## 83.3 Acordes

```txt
[ ] afinação ativa está clara
[ ] busca aceita notação brasileira e internacional
[ ] formas verificadas são priorizadas
[ ] conteúdo calculado é identificado
[ ] diagrama alterna 5/10 cordas
[ ] filtros são preservados
```

## 83.4 Cifras

```txt
[ ] busca funciona offline
[ ] compatibilidade é validada
[ ] transposição não altera original
[ ] acorde abre sem perder posição
[ ] modo palco funciona
[ ] cifra própria pode ser criada
[ ] direitos autorais são considerados
```

## 83.5 Ritmos

```txt
[ ] padrão possui legenda
[ ] destro/canhoto funciona
[ ] áudio lento e normal não conflitam
[ ] treino pode ser pausado
[ ] metrônomo mantém precisão
```

## 83.6 Backup

```txt
[ ] exportação não altera dados
[ ] importação mostra prévia
[ ] substituição exige confirmação
[ ] falha executa rollback
[ ] arquivo inválido não é importado
```

---

# 84. Definition of Ready para Screen Specs

Uma tela está pronta para receber Screen Spec quando o fluxo define:

```txt
[ ] origem
[ ] objetivo
[ ] ação principal
[ ] ações secundárias
[ ] destino
[ ] retorno
[ ] estado vazio
[ ] carregamento
[ ] erro
[ ] permissão, se aplicável
[ ] persistência
[ ] impacto da afinação
[ ] comportamento offline
[ ] comportamento em tablet
```

---

# 85. Definition of Done do User Flow

```txt
[ ] inicialização definida
[ ] onboarding definido
[ ] retorno do usuário definido
[ ] Início definida
[ ] afinações definidas
[ ] afinador guiado definido
[ ] afinador cromático definido
[ ] sons de referência definidos
[ ] acordes definidos
[ ] cifras definidas
[ ] transposição definida
[ ] modo palco definido
[ ] editor definido
[ ] importação definida
[ ] ritmos definidos
[ ] metrônomo definido
[ ] favoritos definidos
[ ] recentes definidos
[ ] configurações definidas
[ ] backup definido
[ ] privacidade definida
[ ] premium opcional definido
[ ] erros definidos
[ ] offline definido
[ ] tablet definido
[ ] acessibilidade definida
[ ] rotas sugeridas
[ ] critérios de aceitação definidos
```

---

# 86. Decisões consolidadas

1. O aplicativo abre sem exigir conexão.
2. O onboarding não coleta dados pessoais.
3. A afinação inicial é definida antes do uso principal.
4. O usuário pode continuar sem conceder microfone.
5. O microfone só inicia após ação explícita.
6. A afinação ativa é compartilhada entre módulos.
7. Mudanças com impacto exigem confirmação.
8. Conteúdo calculado nunca é exibido como revisado.
9. A transposição não altera o conteúdo oficial.
10. O modo palco remove distrações.
11. O metrônomo não inicia automaticamente.
12. Áudios incompatíveis não tocam simultaneamente.
13. Cifras próprias possuem rascunho local.
14. Importações sempre mostram prévia.
15. Backups usam validação, transação e rollback.
16. A navegação preserva contexto seguro.
17. Acessibilidade faz parte do fluxo.
18. O tablet usa painéis quando adequado.
19. O Pro, se adotado, não bloqueia a função básica.
20. A próxima etapa oficial será a produção das imagens de referência e a definição das Screen Specs.

---

# 87. Próximas etapas recomendadas

Pelo processo do projeto, após Blueprint, Design System e User Flow, a sequência é:

```txt
04 — Imagens das telas principais
05 — Screen Specs
06 — Data Model
07 — Codex Tasks
```

Antes de gerar todas as telas, recomenda-se criar primeiro as imagens de:

1. onboarding — boas-vindas;
2. onboarding — escolha da afinação;
3. Início;
4. lista de cifras;
5. detalhe da cifra;
6. modo palco;
7. lista de acordes;
8. detalhe do acorde;
9. afinador guiado;
10. Estudos;
11. detalhe do ritmo;
12. metrônomo;
13. criar cifra;
14. configurações.
