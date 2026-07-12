# 01 — App Blueprint

## 1. Identificação do produto

### Nome provisório

**Cifras de Viola**

### Nome estendido

**Cifras de Viola — Acordes, Afinações e Batidas**

### Categoria

- Música
- Educação musical
- Ferramentas para instrumentistas
- Referência musical offline

### Plataformas planejadas

- Android
- iOS
- Tablets Android
- iPad

### Stack prevista

- Expo
- React Native
- TypeScript
- Expo Router
- SQLite local
- EAS Build

### Modelo de funcionamento

**Offline-first.**

Todas as funções principais devem funcionar sem conexão com a internet após a instalação:

- consulta de afinações;
- consulta de acordes;
- diagramas;
- biblioteca de ritmos;
- metrônomo;
- afinador pelo microfone;
- cifras incluídas no aplicativo;
- cifras criadas pelo usuário;
- favoritos;
- histórico;
- configurações;
- backup manual.

A internet não pode ser requisito para abrir ou utilizar o aplicativo.

---

## 2. Definição resumida do produto

> Cifras de Viola ajuda violeiros iniciantes, estudantes e músicos experientes a afinar, estudar acordes, consultar cifras e praticar ritmos da viola de 10 cordas em diferentes afinações, mesmo sem internet.

---

## 3. Problema principal

O conteúdo de viola de 10 cordas é fragmentado, inconsistente e frequentemente organizado como se todas as violas utilizassem a mesma afinação.

Os principais problemas enfrentados pelo público são:

1. uma mesma posição de acorde muda conforme a afinação;
2. diferentes regiões e professores usam nomes e variantes distintas;
3. muitas cifras disponíveis na internet foram feitas para violão;
4. materiais de batidas e ritmos ficam espalhados entre vídeos, apostilas e anotações;
5. o músico pode precisar consultar uma cifra em local sem internet;
6. é difícil encontrar diagramas claros para as dez cordas;
7. iniciantes não sabem quais cordas apertar, soltar, tocar ou abafar;
8. ferramentas genéricas não relacionam música, afinação, acorde e ritmo;
9. o músico precisa alternar entre vários aplicativos para afinar, consultar acordes e usar metrônomo;
10. cifras comerciais apresentam riscos de direitos autorais quando copiadas sem autorização.

---

## 4. Promessa principal

O aplicativo deve permitir que o usuário escolha sua afinação e tenha acesso a todo o conteúdo compatível com ela.

A promessa prática é:

> Escolha a afinação da sua viola e encontre, em um único app offline, as cordas corretas, os acordes correspondentes, as cifras compatíveis e as batidas necessárias para tocar.

---

## 5. Diferencial competitivo

O principal diferencial não será somente possuir cifras.

O produto será estruturado a partir da relação entre:

```txt
Afinação
   ↓
Notas das cordas
   ↓
Posições de acordes
   ↓
Tonalidade da música
   ↓
Cifra adaptada
   ↓
Ritmo e batida
```

### Diferenciais obrigatórios

- conteúdo específico para viola de 10 cordas;
- suporte a múltiplas afinações;
- representação por cinco ordens e por dez cordas;
- acordes vinculados à afinação ativa;
- cifras transponíveis;
- batidas com representação visual;
- afinador guiado por afinação;
- funcionamento integralmente offline;
- criação de cifras próprias;
- modo palco;
- suporte a destros e canhotos;
- identificação de variantes regionais;
- conteúdo revisado e marcado como validado;
- proteção contra adaptações automáticas incorretas.

---

## 6. Público-alvo

### Público primário

#### Violeiro iniciante

Características:

- está aprendendo os primeiros acordes;
- não domina os nomes das afinações;
- precisa de diagramas simples;
- necessita de áudio e orientação visual;
- procura músicas fáceis;
- tem dificuldade para acompanhar batidas.

Necessidades:

- afinação guiada;
- acordes básicos;
- ritmos em velocidade lenta;
- explicações sem excesso de teoria;
- indicação de dificuldade;
- exercícios curtos.

#### Estudante intermediário

Características:

- já toca algumas músicas;
- utiliza uma ou mais afinações;
- quer ampliar repertório;
- deseja aprender novas posições;
- pratica pestanas, ponteios e ritmos.

Necessidades:

- variações de acordes;
- transposição;
- metrônomo;
- repertório organizado;
- tablaturas;
- anotações;
- modo palco.

#### Violeiro experiente

Características:

- possui repertório próprio;
- utiliza afinações regionais;
- cria arranjos;
- toca em apresentações;
- precisa de consulta rápida.

Necessidades:

- afinações personalizadas;
- editor de cifras;
- acordes alternativos;
- modo palco;
- backup;
- organização por repertórios;
- controle sobre notas, oitavas e pares.

### Público secundário

- professores de viola;
- escolas de música;
- músicos de sertanejo raiz;
- grupos de folia;
- grupos de catira;
- compositores;
- pesquisadores da cultura da viola;
- músicos vindos do violão.

---

## 7. Personas de referência

### Persona 1 — João, iniciante

- 19 anos;
- ganhou uma viola usada;
- não sabe identificar a afinação atual;
- aprende por vídeos;
- precisa de instruções simples;
- usa Android básico;
- costuma estudar em local com internet instável.

Objetivo:

> Afinar corretamente e tocar as primeiras músicas sem depender de vários vídeos.

### Persona 2 — Carlos, violeiro de igreja e eventos

- 42 anos;
- conhece acordes básicos;
- utiliza Cebolão em Ré;
- precisa mudar o tom das músicas para sua voz;
- toca em locais sem sinal;
- quer letras grandes e rolagem automática.

Objetivo:

> Organizar repertório e tocar com segurança durante apresentações.

### Persona 3 — Helena, professora de viola

- 35 anos;
- ensina alunos iniciantes e intermediários;
- utiliza diferentes afinações;
- deseja demonstrar acordes e ritmos;
- precisa de conteúdo confiável;
- quer cadastrar exercícios próprios.

Objetivo:

> Usar o aplicativo como ferramenta complementar nas aulas.

---

## 8. Trabalhos que o usuário precisa realizar

### Afinar

- escolher uma afinação;
- ouvir a nota correta;
- tocar cada par;
- conferir se a corda está abaixo ou acima;
- concluir a afinação.

### Consultar um acorde

- selecionar a afinação;
- escolher a nota;
- escolher o tipo;
- visualizar a posição;
- ouvir o acorde;
- ver alternativas.

### Tocar uma música

- pesquisar a música;
- abrir a cifra;
- conferir afinação;
- ajustar o tom;
- ver os acordes;
- iniciar rolagem;
- usar metrônomo ou ritmo.

### Aprender uma batida

- escolher o ritmo;
- entender o compasso;
- observar os movimentos;
- ouvir devagar;
- praticar com metrônomo;
- aplicar em uma progressão.

### Criar repertório próprio

- cadastrar ou importar texto;
- inserir acordes;
- definir tom;
- definir afinação;
- adicionar observações;
- favoritar ou incluir em uma lista;
- fazer backup.

---

## 9. Princípios obrigatórios do produto

### 9.1 Offline de verdade

Nenhuma função essencial pode depender de API, servidor, login ou validação online.

### 9.2 Afinação sempre visível

O aplicativo deve indicar claramente qual afinação está ativa nas telas de:

- início;
- acordes;
- cifras;
- afinador;
- estudos relacionados.

### 9.3 Conteúdo confiável

O app deve diferenciar:

- conteúdo revisado;
- conteúdo calculado;
- conteúdo criado pelo usuário;
- conteúdo importado;
- variante regional.

### 9.4 Simplicidade progressiva

A interface inicial deve ser simples, mas permitir aprofundamento.

Exemplo:

- iniciante visualiza cinco ordens;
- usuário avançado pode exibir as dez cordas;
- detalhes teóricos ficam em seção expansível.

### 9.5 Uma ação principal por tela

Cada tela deve possuir um objetivo claro e um CTA dominante.

### 9.6 Sem duplicação

A mesma informação não deve ser exibida em vários cards na mesma tela.

### 9.7 Segurança musical

O app não deve recomendar alteração de tensão sem alerta.

Ao mudar para uma afinação mais alta ou muito diferente, deverá informar:

- risco de excesso de tensão;
- necessidade de encordoamento adequado;
- recomendação de afinar gradualmente;
- possibilidade de consultar um luthier.

### 9.8 Direitos autorais

O app não deve incluir letras completas de músicas comerciais sem licença ou autorização.

O conteúdo inicial deve utilizar:

- domínio público confirmado;
- composições próprias;
- exercícios autorais;
- músicas autorizadas;
- cifras sem letra, quando juridicamente validado;
- conteúdo criado pelo próprio usuário.

---

## 10. Escopo funcional da V1

## 10.1 Módulo de início

Funções:

- mostrar a afinação ativa;
- botão “Afinar agora”;
- continuar a última cifra;
- acesso aos favoritos;
- últimos acordes consultados;
- ritmo em estudo;
- atalho para metrônomo;
- atalho para criar cifra;
- aviso de primeira utilização;
- indicador de conteúdo disponível offline.

### Objetivo da tela

Permitir que o usuário retome rapidamente o último estudo ou acesse a função principal.

---

## 10.2 Módulo de afinações

### Afinações iniciais previstas

- Cebolão em Ré;
- Cebolão em Mi;
- Rio Abaixo;
- Boiadeira.

A lista definitiva de notas, oitavas e tipos de par deve passar por validação especializada antes da publicação.

### Informações de cada afinação

- nome;
- nome curto;
- nomes alternativos;
- descrição;
- região ou tradição;
- acorde formado pelas cordas soltas;
- cinco ordens;
- dez cordas;
- nota de cada corda;
- oitava;
- frequência;
- par em uníssono ou oitavado;
- dificuldade;
- estilos relacionados;
- alerta de tensão;
- áudio de referência;
- data da última revisão;
- fonte ou responsável pela revisão.

### Ações

- ativar afinação;
- ouvir cada corda;
- abrir afinador;
- ver acordes compatíveis;
- favoritar;
- duplicar como afinação personalizada futuramente.

---

## 10.3 Módulo de afinador

### Modos da V1

#### Afinador guiado

- usuário escolhe uma afinação;
- app orienta par por par;
- mostra nota esperada;
- detecta frequência;
- calcula diferença em cents;
- informa “apertar” ou “afrouxar”;
- confirma quando estiver dentro da tolerância;
- avança para o próximo par.

#### Afinador cromático

- detecta qualquer nota;
- mostra frequência;
- mostra oitava;
- mostra diferença em cents.

#### Som de referência

- reproduz nota de cada corda;
- reproduz cada par;
- reproduz as cordas abertas em sequência.

### Regras

- solicitar microfone somente quando necessário;
- explicar o motivo da permissão;
- manter processamento local;
- não gravar ou enviar áudio;
- funcionar sem internet;
- oferecer calibração padrão em A4 = 440 Hz;
- permitir calibração manual;
- filtrar oscilações;
- indicar ruído excessivo;
- não mostrar leitura falsa quando o sinal for insuficiente.

### Fora da primeira entrega do afinador

- reconhecimento automático da afinação desconhecida;
- análise de timbre;
- gravação da performance;
- afinação polifônica de todas as cordas simultaneamente.

---

## 10.4 Módulo de acordes

### Filtros

- afinação;
- nota fundamental;
- qualidade do acorde;
- dificuldade;
- região do braço;
- com ou sem pestana;
- posições verificadas;
- posições favoritas.

### Famílias iniciais

- maior;
- menor;
- sétima dominante;
- sétima maior;
- menor com sétima;
- suspenso 2;
- suspenso 4;
- sexta;
- add9;
- diminuto.

### Conteúdo de cada acorde

- nome em português;
- símbolo internacional;
- afinação;
- diagrama simplificado;
- diagrama completo;
- casas;
- dedos;
- pestana;
- cordas tocadas;
- cordas abafadas;
- notas presentes;
- intervalos;
- dificuldade;
- posição no braço;
- áudio;
- alternativas;
- selo de verificação;
- observação técnica.

### Representações

#### Cinco ordens

Modo padrão, mais simples.

#### Dez cordas

Modo detalhado.

#### Notas

Mostra as notas existentes em cada corda.

#### Intervalos

Mostra tônica, terça, quinta, sétima e extensões.

### Regras de confiança

Cada forma deve possuir um status:

- `verified`: revisada manualmente;
- `calculated`: encontrada pelo motor;
- `user_created`: criada pelo usuário;
- `deprecated`: mantida apenas para compatibilidade.

A V1 deve priorizar formas verificadas.

---

## 10.5 Módulo de cifras

### Busca e filtros

- título;
- artista;
- compositor;
- tom;
- afinação;
- ritmo;
- dificuldade;
- categoria;
- favorito;
- conteúdo próprio;
- conteúdo incluído no app.

### Conteúdo de uma cifra

- título;
- artista;
- compositor;
- fonte ou licença;
- tom original;
- tom atual;
- afinação recomendada;
- ritmo;
- compasso;
- BPM;
- capotraste;
- dificuldade;
- seções;
- acordes;
- letra, quando autorizada;
- introdução;
- observações;
- acordes usados;
- batida sugerida.

### Transposição

O usuário poderá:

- subir um semitom;
- descer um semitom;
- retornar ao tom original;
- selecionar tom diretamente;
- receber sugestão de capotraste;
- ver atualização dos acordes.

### Regras da transposição

- preservar a estrutura da música;
- respeitar sustenidos e bemóis conforme contexto;
- atualizar todos os símbolos;
- não alterar textos;
- sinalizar acordes sem forma revisada;
- oferecer alternativas quando existirem.

### Compatibilidade por afinação

Uma cifra pode ter:

- afinação recomendada;
- afinações compatíveis revisadas;
- adaptação calculada;
- adaptação indisponível.

O app nunca deve apresentar uma adaptação calculada como se fosse revisada.

---

## 10.6 Modo palco

### Funções

- letra ampliada;
- acordes destacados;
- rolagem automática;
- velocidade de rolagem;
- pausar e retomar;
- modo paisagem;
- impedir bloqueio de tela durante uso;
- alto contraste;
- ocultar menus;
- navegar por seções;
- retornar rapidamente ao topo;
- mostrar afinação e tom em área compacta.

### Regras

- não exibir anúncios;
- evitar botões pequenos;
- não alterar cifra por gesto acidental;
- exigir ação deliberada para sair;
- funcionar em celular e tablet.

---

## 10.7 Módulo de ritmos e batidas

### Ritmos iniciais

- Cururu;
- Cateretê;
- Toada;
- Moda de viola;
- Recortado;
- Pagode de viola;
- Guarânia;
- Rasqueado.

### Conteúdo de cada ritmo

- nome;
- descrição;
- origem resumida;
- compasso;
- BPM inicial;
- BPM recomendado;
- contagem;
- sequência de movimentos;
- direção da mão;
- ação sobre as cordas;
- intensidade;
- abafamento;
- áudio lento;
- áudio normal;
- versão com metrônomo;
- exercício com um acorde;
- exercício com progressão;
- músicas relacionadas autorizadas.

### Representação visual

- seta para baixo;
- seta para cima;
- toque leve;
- toque forte;
- abafamento;
- percussão;
- pausa;
- contagem rítmica.

### Modos

- destro;
- canhoto;
- simplificado;
- detalhado.

---

## 10.8 Metrônomo

### Funções

- BPM ajustável;
- iniciar;
- pausar;
- parar;
- tap tempo;
- compasso 2/4;
- compasso 3/4;
- compasso 4/4;
- compasso 6/8;
- destaque do primeiro tempo;
- volume;
- vibração opcional;
- presets por ritmo;
- continuar funcionando durante estudo.

### Regras

- manter tempo estável;
- não depender de rede;
- não interromper ao navegar entre telas compatíveis;
- respeitar modo silencioso conforme configuração do sistema;
- permitir uso sem microfone.

---

## 10.9 Editor de cifras próprias

### Campos

- título;
- artista;
- compositor;
- letra ou estrutura;
- tom;
- afinação;
- ritmo;
- compasso;
- BPM;
- capotraste;
- dificuldade;
- acordes;
- introdução;
- observações;
- tags.

### Ações

- criar;
- editar;
- duplicar;
- excluir;
- favoritar;
- transpor;
- abrir no modo palco;
- exportar;
- incluir em repertório.

### Inserção de acordes

- selecionar posição no texto;
- abrir seletor;
- escolher símbolo;
- confirmar;
- visualizar diagrama;
- substituir;
- remover.

### Importação de texto

A V1 poderá reconhecer padrões simples:

```txt
[D] Trecho da letra [A] com acorde
```

ou:

```txt
D
Trecho da letra
```

A importação deve mostrar uma prévia antes de salvar.

---

## 10.10 Favoritos e recentes

### Favoritos

O usuário poderá favoritar:

- afinações;
- acordes;
- cifras;
- ritmos;
- exercícios.

### Recentes

O app poderá registrar localmente:

- últimas cifras abertas;
- últimos acordes;
- última afinação;
- último ritmo;
- última sessão de metrônomo.

### Regras

- limitar histórico para evitar crescimento indefinido;
- permitir limpar;
- não registrar áudio;
- não enviar dados.

---

## 10.11 Configurações

### Opções

- tema claro;
- tema escuro;
- seguir sistema;
- alto contraste;
- tamanho do texto;
- modo destro ou canhoto;
- diagrama por cinco ordens;
- diagrama por dez cordas;
- afinação padrão;
- notação com sustenidos;
- notação com bemóis;
- calibração do afinador;
- tolerância em cents;
- manter tela ativa;
- vibração;
- volume de sons;
- idioma;
- exportar backup;
- importar backup;
- limpar histórico;
- restaurar configurações;
- política de privacidade;
- créditos;
- versão do banco de conteúdo;
- versão do aplicativo.

---

## 10.12 Backup local

### Conteúdo do backup

- configurações;
- favoritos;
- cifras próprias;
- afinações personalizadas futuras;
- repertórios;
- histórico de prática;
- anotações.

### Regras

- exportação manual;
- arquivo versionado;
- validação antes da importação;
- prévia do conteúdo;
- confirmação antes de substituir;
- opção de mesclar quando tecnicamente segura;
- impedir execução de código;
- limitar tamanho;
- tratar versões incompatíveis;
- nunca sobrescrever silenciosamente.

---

## 11. Lista de telas da V1

## 11.1 Primeira abertura

1. Splash nativa
2. Boas-vindas
3. Escolha de experiência
4. Escolha da afinação inicial
5. Preferência de diagrama
6. Permissão de microfone explicada
7. Resumo e entrada no app

## 11.2 Navegação principal

1. Início
2. Cifras
3. Acordes
4. Afinador
5. Estudos

## 11.3 Telas complementares

1. Lista de afinações
2. Detalhe da afinação
3. Lista de cifras
4. Detalhe da cifra
5. Modo palco
6. Filtros de cifras
7. Lista de acordes
8. Detalhe do acorde
9. Seletor de afinação
10. Afinador guiado
11. Afinador cromático
12. Sons de referência
13. Lista de ritmos
14. Detalhe do ritmo
15. Treino de batida
16. Metrônomo
17. Criar cifra
18. Editar cifra
19. Importar cifra
20. Favoritos
21. Recentes
22. Configurações
23. Backup
24. Sobre
25. Política de privacidade
26. Créditos e fontes

---

## 12. Arquitetura de navegação conceitual

```txt
App
├── Onboarding
│   ├── Boas-vindas
│   ├── Experiência
│   ├── Afinação inicial
│   ├── Diagrama
│   └── Conclusão
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
│   └── Detalhe
│
├── Cifras
│   ├── Lista
│   ├── Detalhe
│   ├── Modo palco
│   ├── Criar
│   ├── Editar
│   └── Importar
│
├── Acordes
│   ├── Lista
│   └── Detalhe
│
├── Afinador
│   ├── Guiado
│   ├── Cromático
│   └── Referência
│
├── Estudos
│   ├── Ritmos
│   ├── Detalhe do ritmo
│   ├── Treino
│   └── Metrônomo
│
└── Sistema
    ├── Favoritos
    ├── Recentes
    ├── Configurações
    ├── Backup
    ├── Privacidade
    └── Sobre
```

---

## 13. Jornada principal

### Jornada de primeira utilização

1. usuário abre o app;
2. conhece a proposta;
3. informa seu nível;
4. escolhe uma afinação inicial;
5. escolhe visualização por cinco ordens ou dez cordas;
6. recebe explicação sobre o microfone;
7. entra na tela inicial;
8. toca em “Afinar agora”;
9. conclui a afinação;
10. abre um acorde ou cifra sugerida.

### Jornada diária

1. usuário abre o app;
2. visualiza afinação ativa;
3. retoma cifra, acorde ou ritmo recente;
4. pratica;
5. favorita ou registra observação;
6. fecha o app;
7. dados permanecem locais.

### Jornada para tocar uma música

1. abrir Cifras;
2. pesquisar;
3. aplicar filtros;
4. abrir música;
5. conferir afinação;
6. ajustar tom;
7. visualizar acordes;
8. iniciar modo palco;
9. ajustar rolagem;
10. tocar.

### Jornada para aprender acorde

1. abrir Acordes;
2. escolher nota;
3. escolher qualidade;
4. conferir afinação;
5. selecionar posição;
6. ouvir;
7. visualizar dedos;
8. favoritar;
9. abrir cifra relacionada.

### Jornada para aprender ritmo

1. abrir Estudos;
2. selecionar Ritmos;
3. escolher batida;
4. ler explicação;
5. ouvir lento;
6. acompanhar animação;
7. iniciar metrônomo;
8. praticar progressão.

---

## 14. Estados obrigatórios

Todas as telas relevantes devem considerar:

- carregando banco local;
- sem conteúdo;
- conteúdo encontrado;
- erro de banco;
- erro de áudio;
- microfone negado;
- microfone indisponível;
- sinal de áudio insuficiente;
- busca sem resultado;
- filtro sem resultado;
- item favorito;
- item não favorito;
- conteúdo verificado;
- conteúdo calculado;
- conteúdo próprio;
- arquivo de backup inválido;
- banco em migração;
- primeiro acesso;
- usuário recorrente;
- tema claro;
- tema escuro;
- celular pequeno;
- tablet;
- orientação retrato;
- orientação paisagem no modo palco.

---

## 15. Funções gratuitas

Modelo comercial recomendado para a V1:

### Gratuito

- onboarding;
- afinador cromático;
- afinador guiado para uma afinação inicial;
- sons de referência;
- acordes maiores, menores e sétimos;
- parte dos ritmos;
- metrônomo;
- cifras de demonstração;
- criação limitada de cifras próprias;
- favoritos limitados;
- tema claro e escuro;
- modo offline.

---

## 16. Funções Pro

### Compra única recomendada

Não usar assinatura na primeira versão.

O desbloqueio Pro poderá incluir:

- todas as afinações;
- todos os acordes;
- todas as posições verificadas;
- ritmos completos;
- cifras autorizadas adicionais;
- criação ilimitada;
- favoritos ilimitados;
- repertórios;
- backup completo;
- afinações personalizadas;
- modo palco completo;
- anotações;
- exportação;
- recursos futuros incluídos conforme política comercial.

### Regras comerciais

- o app deve continuar útil gratuitamente;
- não bloquear o afinador básico após instalação;
- não usar anúncios durante afinação, estudo ou modo palco;
- não depender de internet para validar o Pro após ativação inicial;
- manter restauração de compra;
- prever fallback local seguro;
- não armazenar chaves sensíveis no código.

### Alternativa simplificada

Caso o aplicativo seja lançado diretamente como pago:

- remover tela de compra;
- entregar todos os recursos;
- manter arquitetura preparada para edição gratuita futura;
- não incluir anúncios.

---

## 17. Política de anúncios

### Decisão recomendada para a V1

**Não utilizar anúncios.**

Justificativas:

- interferem no funcionamento offline;
- prejudicam a experiência durante estudo;
- podem interromper áudio e metrônomo;
- podem causar toque acidental em apresentações;
- aumentam a complexidade de privacidade;
- reduzem a percepção de qualidade do produto.

Caso sejam adicionados posteriormente:

- nunca mostrar no afinador;
- nunca mostrar no modo palco;
- nunca mostrar durante metrônomo;
- nunca mostrar no editor;
- nunca mostrar ao mudar de acorde;
- nunca interromper áudio;
- limitar a telas de navegação.

---

## 18. Conteúdo fora da V1

Os itens abaixo não devem atrasar a primeira publicação:

- conta de usuário;
- login social;
- sincronização em nuvem;
- comunidade;
- comentários;
- chat;
- publicação pública de cifras;
- ranking;
- seguidores;
- feed social;
- streaming musical;
- reconhecimento automático de músicas;
- separação de instrumentos;
- geração de acompanhamento por IA;
- reconhecimento polifônico completo;
- afinador de todas as cordas ao mesmo tempo;
- aulas em vídeo;
- marketplace de professores;
- loja de cursos;
- pedal Bluetooth;
- Apple Watch;
- Wear OS;
- versão web;
- versão desktop;
- colaboração em tempo real;
- tablaturas avançadas com reprodução;
- editor de partitura;
- importação de PDF por OCR;
- gravação de áudio;
- compartilhamento público;
- pacotes regionais online;
- atualização remota de banco sem nova versão.

---

## 19. Conteúdo previsto para versões posteriores

### V1.1

- repertórios personalizados;
- anotações;
- histórico de prática;
- backup aprimorado;
- mais posições verificadas;
- mais ritmos;
- melhorias de acessibilidade.

### V1.2

- afinações personalizadas;
- calculador de acordes;
- escalas;
- progressões;
- ponteios básicos;
- tablaturas simples.

### V1.3

- exercícios progressivos;
- metas de estudo;
- cronômetro;
- estatísticas locais;
- impressão ou PDF;
- importação ampliada.

### V2.0

- pedal Bluetooth;
- pacotes licenciados;
- conteúdo de professores;
- biblioteca regional;
- reconhecimento de acordes;
- acompanhamento rítmico;
- sincronização opcional.

---

## 20. Modelo de conteúdo inicial

### Afinações

Meta mínima:

- 4 afinações revisadas;
- notas das 10 cordas;
- frequências;
- áudios;
- descrições;
- alertas.

### Acordes

Meta mínima:

- 12 notas fundamentais;
- 10 qualidades;
- 4 afinações;
- pelo menos uma posição principal revisada;
- posições alternativas para os acordes mais usados.

Estimativa inicial:

```txt
4 afinações × 12 notas × 10 qualidades = 480 combinações
```

Nem todas precisam de várias formas no primeiro lançamento.

### Ritmos

Meta mínima:

- 8 ritmos;
- descrição;
- contagem;
- padrão visual;
- áudio lento;
- áudio normal;
- exercício.

### Cifras

Meta mínima segura:

- exercícios autorais;
- progressões;
- composições próprias;
- obras em domínio público confirmadas;
- conteúdo autorizado.

Não definir quantidade comercial antes da validação jurídica.

---

## 21. Regras de dados

### Fonte única de verdade

O banco local deve ser a fonte principal para:

- afinações;
- cordas;
- acordes;
- formas;
- músicas;
- ritmos;
- favoritos;
- preferências.

### Conteúdo embarcado

O conteúdo base deve ser instalado junto com o aplicativo.

### Conteúdo do usuário

Deve ser armazenado separadamente do conteúdo oficial para:

- impedir sobrescrita em atualização;
- facilitar backup;
- permitir restauração;
- distinguir autoria.

### Versionamento

O banco deve possuir:

- versão de esquema;
- versão de conteúdo;
- migrações;
- registros de data;
- identificadores estáveis.

### Integridade

- chaves estrangeiras;
- índices;
- validação de enumerações;
- normalização de notas;
- validação de intervalos;
- validação de casas;
- validação de frequências;
- remoção segura;
- transações.

---

## 22. Regras do motor musical

### Notas

O sistema deve usar representação interna consistente.

Exemplo conceitual:

```txt
C, C#, D, D#, E, F, F#, G, G#, A, A#, B
```

A interface poderá mostrar equivalentes com bemóis:

```txt
C# = Db
D# = Eb
F# = Gb
G# = Ab
A# = Bb
```

### Acordes

A estrutura deve separar:

- nota fundamental;
- qualidade;
- extensões;
- baixo;
- símbolo exibido;
- intervalos.

### Transposição

Deve operar por semitons, sem alterar o conteúdo textual.

### Formas

Cada posição deve estar associada a:

- afinação;
- acorde;
- casas;
- dedos;
- estado de revisão;
- dificuldade.

### Adaptação automática

O sistema pode sugerir formas, mas precisa indicar claramente quando não houve revisão humana.

---

## 23. Requisitos de acessibilidade

- suporte a fontes maiores;
- contraste adequado;
- não depender apenas de cor;
- botões com área de toque suficiente;
- rótulos para leitores de tela;
- vibração opcional;
- alto contraste;
- modo canhoto;
- diagramas legíveis;
- áudio com controle de volume;
- mensagens objetivas;
- navegação consistente;
- suporte a tablet;
- respeito à área segura;
- não impedir zoom onde aplicável.

---

## 24. Requisitos de desempenho

- abrir rapidamente;
- iniciar sem rede;
- pesquisar localmente;
- evitar carregar todos os áudios na memória;
- usar paginação ou carregamento progressivo;
- indexar buscas;
- cachear consultas frequentes;
- não bloquear a interface durante migrações;
- manter afinador responsivo;
- manter metrônomo estável;
- reduzir tamanho dos áudios;
- não armazenar imagens desnecessariamente grandes;
- funcionar em aparelhos intermediários.

---

## 25. Privacidade

### Dados coletados

A V1 não deve coletar dados pessoais.

### Microfone

- usado somente pelo afinador;
- processamento local;
- sem gravação permanente;
- sem transmissão;
- permissão solicitada com contexto.

### Armazenamento

Os dados ficam no dispositivo:

- preferências;
- favoritos;
- cifras próprias;
- histórico;
- backup.

### Sem necessidade de

- nome;
- e-mail;
- telefone;
- localização;
- contatos;
- fotos;
- publicidade personalizada;
- rastreamento;
- identificadores de anúncios;
- analytics de terceiros na V1.

---

## 26. Riscos do projeto

### Risco 1 — Conteúdo musical incorreto

Impacto: alto.

Mitigação:

- revisão por violeiro;
- status de verificação;
- fontes registradas;
- testes por afinação.

### Risco 2 — Variações regionais

Impacto: alto.

Mitigação:

- cadastrar variantes;
- evitar afirmar universalidade;
- exibir notas explicitamente;
- permitir nomes alternativos.

### Risco 3 — Direitos autorais

Impacto: crítico.

Mitigação:

- não copiar letras comerciais;
- usar licenças;
- registrar fonte;
- revisão jurídica;
- priorizar conteúdo próprio e autorizado.

### Risco 4 — Afinador impreciso

Impacto: alto.

Mitigação:

- algoritmo estável;
- filtro de ruído;
- testes com diferentes aparelhos;
- tolerância configurável;
- modo de referência.

### Risco 5 — Volume excessivo de acordes

Impacto: alto.

Mitigação:

- começar pelas famílias essenciais;
- uma forma verificada por combinação;
- expandir gradualmente;
- não gerar milhares de formas sem curadoria.

### Risco 6 — Tamanho do aplicativo

Impacto: médio.

Mitigação:

- comprimir áudios;
- reutilizar recursos;
- gerar diagramas por código;
- evitar imagens para cada acorde.

### Risco 7 — Complexidade do editor

Impacto: médio.

Mitigação:

- editor simples na V1;
- formato de importação limitado;
- prévia antes de salvar;
- recursos avançados posteriores.

### Risco 8 — Instabilidade do metrônomo

Impacto: médio.

Mitigação:

- arquitetura de áudio apropriada;
- testes com tela bloqueada e navegação;
- não depender de timers visuais comuns para precisão sonora.

### Risco 9 — Escopo excessivo

Impacto: crítico.

Mitigação:

- respeitar o MVP;
- uma etapa por vez;
- não implementar V2 antes da base;
- usar protocolo anti-escopo.

---

## 27. Dependências externas previstas

### Permitidas

- Expo Router;
- SQLite;
- biblioteca de áudio compatível com Expo;
- acesso ao microfone;
- sistema de arquivos;
- compartilhamento de arquivo;
- compra interna, caso adotada;
- biblioteca de detecção de frequência validada ou módulo próprio.

### Evitar na V1

- backend;
- Firebase;
- autenticação;
- CMS remoto;
- anúncios;
- analytics invasivo;
- dependências sem manutenção;
- bibliotecas que exijam rede;
- pacotes incompatíveis com EAS.

---

## 28. Métricas de sucesso

Como a V1 será offline e sem analytics invasivo, as métricas iniciais podem ser obtidas por:

- avaliações das lojas;
- relatos de usuários;
- testes controlados;
- taxa de falhas;
- quantidade de bugs;
- qualidade do banco;
- estabilidade do afinador;
- retenção observada em testes;
- conversão para Pro, caso adotado.

### Indicadores de produto

- usuário consegue afinar sem ajuda externa;
- usuário encontra acorde em até três interações;
- usuário abre uma cifra e entra no modo palco rapidamente;
- transposição não gera símbolos inválidos;
- banco abre sem rede;
- conteúdo próprio persiste após atualização;
- backup restaura corretamente.

---

## 29. Critérios de conclusão do Blueprint

O Blueprint estará aprovado quando houver decisão clara sobre:

- nome provisório;
- público;
- promessa;
- módulos;
- V1;
- recursos futuros;
- monetização;
- política de anúncios;
- direitos autorais;
- modelo offline;
- lista de telas;
- regras centrais;
- riscos;
- critérios de lançamento.

---

## 30. Definition of Ready da próxima fase

A próxima fase é o Design System.

Ela pode começar quando:

```txt
[ ] nome provisório aprovado
[ ] estrutura de navegação aprovada
[ ] escopo da V1 aprovado
[ ] modelo comercial aceito
[ ] afinações iniciais aceitas
[ ] ritmos iniciais aceitos
[ ] decisão sobre cifras comerciais registrada
[ ] diretrizes visuais iniciais definidas
```

---

## 31. Critérios de conclusão da V1

### Produto

```txt
[ ] onboarding concluído
[ ] navegação funcional
[ ] quatro afinações revisadas
[ ] afinador guiado funcional
[ ] afinador cromático funcional
[ ] sons de referência funcionais
[ ] acordes essenciais revisados
[ ] diagramas em cinco ordens
[ ] diagramas em dez cordas
[ ] cifras autorizadas incluídas
[ ] transposição funcional
[ ] modo palco funcional
[ ] oito ritmos completos
[ ] metrônomo estável
[ ] editor de cifra funcional
[ ] favoritos persistentes
[ ] configurações persistentes
[ ] backup validado
```

### Qualidade

```txt
[ ] app abre sem internet
[ ] app não exige login
[ ] banco migra sem perda
[ ] dados do usuário não são sobrescritos
[ ] microfone possui explicação
[ ] áudio não é enviado
[ ] tema claro funciona
[ ] tema escuro funciona
[ ] celular pequeno funciona
[ ] tablet funciona
[ ] modo paisagem funciona no palco
[ ] acessibilidade básica concluída
[ ] typecheck passa
[ ] lint passa
[ ] build Android passa
[ ] build iOS passa
[ ] política de privacidade pronta
[ ] direitos autorais revisados
```

---

## 32. Classificação anti-escopo

### A — Essencial para V1

- afinações;
- afinador;
- acordes;
- cifras autorizadas;
- transposição;
- ritmos;
- metrônomo;
- modo palco;
- editor simples;
- favoritos;
- configurações;
- backup;
- funcionamento offline.

### B — Bom para V1, mas removível se atrasar

- histórico de prática;
- repertórios;
- anotações avançadas;
- vários áudios por acorde;
- sugestão de capotraste avançada;
- importação flexível.

### C — Pro futuro

- afinações personalizadas;
- gerador de formas;
- tablaturas;
- escalas;
- progressões avançadas;
- exportação PDF;
- pacotes regionais;
- cursos.

### D — Pós-lançamento

- sincronização;
- comunidade;
- professores;
- pedal Bluetooth;
- reconhecimento musical;
- acompanhamento automático.

### E — Descartar na V1

- feed social;
- chat;
- ranking global;
- publicidade invasiva;
- IA generativa sem função central;
- transmissão de áudio;
- cadastro obrigatório.

---

## 33. Decisões provisórias registradas

1. O app será offline-first.
2. A afinação será a entidade central.
3. O app será específico para viola de 10 cordas.
4. A visualização padrão usará cinco ordens.
5. A visualização avançada mostrará dez cordas.
6. A V1 começará com quatro afinações.
7. A V1 começará com oito ritmos.
8. O app não usará anúncios na primeira versão.
9. O modelo preferencial será compra única Pro ou app pago.
10. Letras comerciais não serão incluídas sem licença.
11. O conteúdo oficial será separado do conteúdo do usuário.
12. O conteúdo calculado será identificado.
13. O afinador processará áudio localmente.
14. O app não exigirá conta.
15. A próxima etapa será o Design System.
