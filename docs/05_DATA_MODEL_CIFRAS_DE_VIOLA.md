# 05 — Data Model

## 1. Identificação

### Produto

**Cifras de Viola — Acordes, Afinações e Batidas**

### Documento

`docs/05_DATA_MODEL.md`

### Versão

`1.0.0`

### Status

Modelo de dados base para implementação com Expo, React Native, TypeScript e SQLite local.

### Documentos de origem

Este modelo foi elaborado com base em:

1. `PROJECT_GUIDE.md`;
2. `docs/01_APP_BLUEPRINT.md`;
3. `docs/02_DESIGN_SYSTEM.md`;
4. `docs/03_USER_FLOW.md`.

As futuras Screen Specs podem complementar o modelo, mas não devem alterar silenciosamente suas regras centrais.

---

# 2. Objetivo do modelo

O modelo deve sustentar, integralmente offline:

- múltiplas afinações de viola de 10 cordas;
- cinco ordens ou dez cordas individuais;
- notas, oitavas e frequências;
- acordes e suas qualidades;
- várias posições de um mesmo acorde;
- conteúdo verificado, calculado e criado pelo usuário;
- cifras oficiais e próprias;
- transposição;
- arranjos por afinação;
- ritmos e sequências de batida;
- metrônomo;
- exercícios;
- favoritos;
- recentes;
- preferências;
- afinador;
- histórico local;
- rascunhos;
- backup;
- migrações;
- compra Pro opcional.

O modelo precisa evitar:

- letras e acordes armazenados como texto impossível de transpor;
- imagens rasterizadas para cada diagrama;
- conteúdo oficial misturado com conteúdo pessoal;
- perda de dados em atualização;
- IDs instáveis;
- notas representadas apenas por nomes localizados;
- lógica musical espalhada nas telas;
- gravação de áudio do microfone;
- tabelas genéricas sem validação;
- dependência de servidor.

---

# 3. Decisões arquiteturais principais

## 3.1 Banco local único com domínios separados

A V1 utilizará um arquivo SQLite principal:

```txt
viola.db
```

A separação entre conteúdo oficial e conteúdo pessoal será feita por prefixos de tabela:

```txt
catalog_*  → conteúdo distribuído com o aplicativo
user_*     → dados criados ou alterados pelo usuário
system_*   → metadados, versões e migrações
```

Essa estratégia oferece:

- consultas locais simples;
- transações entre domínios;
- menor complexidade no Expo;
- backup seletivo;
- atualização controlada do catálogo;
- proteção dos dados pessoais.

## 3.2 Conteúdo oficial não é editado

Regra:

```txt
UPDATE e DELETE não devem ser executados em catalog_* pela interface do usuário.
```

Atualizações do catálogo somente podem ocorrer por:

- instalação de nova versão;
- migração controlada;
- pacote de conteúdo futuro validado.

## 3.3 Conteúdo pessoal não é sobrescrito por atualização

Tabelas `user_*` não podem ser apagadas ou recriadas durante atualização comum.

Toda migração deve:

1. criar backup transacional;
2. alterar somente o necessário;
3. validar integridade;
4. executar rollback em falha.

## 3.4 IDs estáveis

### Conteúdo oficial

Usar IDs textuais estáveis, legíveis e versionáveis.

Exemplos:

```txt
tuning_cebolao_d
quality_major
chord_d_major
shape_cebolao_d_d_major_open_01
rhythm_cururu_basic_01
song_public_domain_example_01
```

### Conteúdo do usuário

Usar UUID v4 ou UUID v7.

Exemplo:

```txt
01JX8M4J7KQG3...
```

Não usar índices incrementais como identificador público.

## 3.5 Datas

Armazenar datas em UTC no formato ISO 8601:

```txt
2026-07-11T22:30:00.000Z
```

Campos somente de calendário podem usar:

```txt
2026-07-11
```

## 3.6 Booleanos

SQLite armazena booleanos como:

```txt
0 = false
1 = true
```

Todo campo booleano deve possuir:

```sql
CHECK (field IN (0, 1))
```

## 3.7 JSON

JSON será permitido apenas quando:

- a estrutura for hierárquica;
- a normalização gerar complexidade excessiva;
- o conteúdo precisar preservar ordem;
- as partes pesquisáveis estiverem em colunas próprias.

Usos autorizados:

- documento interno de uma cifra;
- dados de origem;
- configurações extensíveis;
- manifesto de backup;
- análise musical em cache.

JSON não deve substituir relações principais.

---

# 4. Convenções musicais

## 4.1 Classe de altura

Toda nota será representada internamente por `pitchClass`:

| Valor | Nota canônica |
|---:|---|
| 0 | C |
| 1 | C♯ / D♭ |
| 2 | D |
| 3 | D♯ / E♭ |
| 4 | E |
| 5 | F |
| 6 | F♯ / G♭ |
| 7 | G |
| 8 | G♯ / A♭ |
| 9 | A |
| 10 | A♯ / B♭ |
| 11 | B |

A interface decide a grafia conforme:

- preferência por sustenidos;
- preferência por bemóis;
- contexto tonal;
- grafia original autorizada.

## 4.2 Oitavas

Usar notação científica de altura:

```txt
C4 = dó central
A4 = 440 Hz
```

## 4.3 Número MIDI

Quando necessário:

```txt
midi = 12 × (octave + 1) + pitchClass
```

Exemplo:

```txt
A4 = 69
```

## 4.4 Frequência

Fórmula:

```txt
frequency = A4Calibration × 2 ^ ((midi - 69) / 12)
```

A frequência pode ser:

- calculada em tempo de execução;
- armazenada no catálogo para validação;
- recalculada quando a calibração do usuário não for 440 Hz.

## 4.5 Cents

```txt
cents = 1200 × log2(detectedFrequency / targetFrequency)
```

Não armazenar leituras contínuas.

## 4.6 Ordens e cordas

Convenção oficial:

```txt
1ª ordem = par mais agudo
5ª ordem = par mais grave
```

Cada ordem possui duas cordas físicas.

Campos:

```txt
courseNumber: 1..5
stringInCourse: 1..2
physicalStringNumber: 1..10
```

A numeração física deve ser estável e documentada.

## 4.7 Orientação visual

A ordem dos dados musicais não muda para canhotos.

O espelhamento ocorre apenas na apresentação.

## 4.8 Casas

Convenção:

```txt
-1 = corda abafada
 0 = corda solta
 1..N = casa pressionada
```

A quantidade máxima inicial será validada em:

```txt
0..30
```

## 4.9 Dedos

Valores permitidos:

```txt
1 = indicador
2 = médio
3 = anelar
4 = mínimo
T = polegar
null = sem indicação
```

---

# 5. Domínios do banco

```txt
system
├── versão
├── migrações
├── integridade
└── catálogo instalado

catalog
├── fontes
├── licenças
├── ativos de áudio
├── afinações
├── acordes
├── formas
├── cifras
├── arranjos
├── ritmos
└── exercícios

user
├── onboarding
├── preferências
├── cifras próprias
├── rascunhos
├── afinações próprias
├── formas próprias
├── favoritos
├── recentes
├── sessões
├── estado de tela
├── backup
└── compra opcional
```

---

# 6. Visão relacional resumida

```txt
catalog_tunings
    ├── catalog_tuning_courses
    │       └── catalog_tuning_strings
    ├── catalog_chord_shapes
    │       ├── catalog_chord_shape_positions
    │       └── catalog_chord_shape_barres
    ├── catalog_song_arrangements
    └── catalog_exercises

catalog_chord_qualities
    ├── catalog_chord_quality_intervals
    └── catalog_chords
            └── catalog_chord_shapes

catalog_songs
    ├── catalog_song_arrangements
    │       └── catalog_song_arrangement_chords
    ├── catalog_song_tags
    └── catalog_song_sources

catalog_rhythms
    ├── catalog_rhythm_steps
    ├── catalog_rhythm_audio
    ├── catalog_exercises
    └── catalog_songs

user_songs
    ├── user_song_versions
    ├── user_song_chord_index
    ├── user_song_tags
    └── user_song_preferences

user_preferences
    ├── active tuning reference
    ├── appearance
    ├── music display
    ├── tuner
    ├── audio
    └── stage

user_favorites
user_recent_items
user_practice_sessions
user_tuning_sessions
```

---

# 7. Tabelas de sistema

## 7.1 `system_meta`

Metadados do banco.

```ts
type SystemMeta = {
  key: string;
  value: string;
  updatedAt: string;
};
```

Chaves previstas:

```txt
schema_version
catalog_version
catalog_seed_version
created_at
last_migration_at
last_integrity_check_at
installation_id
```

`installation_id` é local e aleatório.

Não deve ser usado para rastreamento.

## 7.2 `system_migrations`

Registra migrações aplicadas.

```ts
type SystemMigration = {
  id: string;
  version: number;
  name: string;
  checksum: string;
  appliedAt: string;
  executionMs: number | null;
};
```

Regras:

- uma versão só pode ser aplicada uma vez;
- checksum deve corresponder ao script;
- falha não deve ser registrada como concluída;
- migração executa em transação.

## 7.3 `system_catalog_releases`

Registra versões do conteúdo oficial.

```ts
type CatalogRelease = {
  id: string;
  version: number;
  label: string;
  installedAt: string;
  source: 'bundled' | 'migration' | 'future_pack';
  checksum: string;
  itemCount: number;
};
```

## 7.4 `system_integrity_events`

Registra problemas técnicos locais sem conteúdo sensível.

```ts
type IntegrityEvent = {
  id: string;
  severity: 'info' | 'warning' | 'error';
  code: string;
  entityType: string | null;
  entityId: string | null;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
};
```

Não armazenar:

- texto completo de cifras;
- áudio;
- nomes pessoais;
- dados de compra brutos.

---

# 8. Fontes, licenças e revisão

## 8.1 `catalog_sources`

Registra origem técnica ou cultural.

```ts
type CatalogSource = {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  publicationYear: number | null;
  sourceType:
    | 'book'
    | 'article'
    | 'teacher'
    | 'musician'
    | 'field_research'
    | 'public_domain'
    | 'license'
    | 'internal';
  referenceText: string | null;
  externalUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
```

A URL é opcional e nunca é necessária para uso offline.

## 8.2 `catalog_licenses`

```ts
type CatalogLicense = {
  id: string;
  name: string;
  code: string | null;
  licenseType:
    | 'public_domain'
    | 'original'
    | 'authorized'
    | 'commercial'
    | 'educational'
    | 'unknown';
  attributionRequired: boolean;
  commercialUseAllowed: boolean;
  modificationAllowed: boolean | null;
  validFrom: string | null;
  validUntil: string | null;
  rightsHolder: string | null;
  attributionText: string | null;
  internalNotes: string | null;
};
```

Conteúdo com `licenseType = 'unknown'` não pode ser publicado.

## 8.3 `catalog_reviewers`

```ts
type CatalogReviewer = {
  id: string;
  displayName: string;
  role: string | null;
  specialty: string | null;
  publicCreditAllowed: boolean;
};
```

## 8.4 Status de revisão

```ts
type VerificationStatus =
  | 'verified'
  | 'calculated'
  | 'user_created'
  | 'imported'
  | 'deprecated'
  | 'draft';
```

---

# 9. Ativos locais

## 9.1 `catalog_assets`

Centraliza referências a arquivos embarcados.

```ts
type CatalogAsset = {
  id: string;
  assetType:
    | 'audio_note'
    | 'audio_chord'
    | 'audio_rhythm'
    | 'audio_count_in'
    | 'illustration'
    | 'icon'
    | 'document';
  localPath: string;
  mimeType: string;
  durationMs: number | null;
  fileSizeBytes: number | null;
  checksum: string;
  locale: string | null;
  isRequired: boolean;
  createdAt: string;
};
```

## 9.2 Regras

- caminhos devem ser relativos ao bundle ou diretório interno;
- arquivos não podem depender de URL;
- checksum deve ser validado no desenvolvimento;
- não carregar todos em memória;
- áudio deve ser interrompido ao mudar de contexto;
- ativos do usuário ficarão em tabela separada se forem adicionados futuramente.

---

# 10. Afinações oficiais

## 10.1 `catalog_tunings`

```ts
type CatalogTuning = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  originRegion: string | null;
  openChordId: string | null;
  difficulty: DifficultyLevel;
  verificationStatus: 'verified' | 'deprecated';
  reviewerId: string | null;
  sourceId: string | null;
  reviewedAt: string | null;
  tensionWarning: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

## 10.2 `catalog_tuning_aliases`

Permite nomes regionais e alternativos.

```ts
type CatalogTuningAlias = {
  id: string;
  tuningId: string;
  alias: string;
  region: string | null;
  notes: string | null;
  normalizedAlias: string;
};
```

Índice único:

```txt
(tuning_id, normalized_alias)
```

## 10.3 `catalog_tuning_courses`

Representa as cinco ordens.

```ts
type CatalogTuningCourse = {
  id: string;
  tuningId: string;
  courseNumber: 1 | 2 | 3 | 4 | 5;
  pairType: 'unison' | 'octave' | 'custom';
  label: string | null;
  sortOrder: number;
};
```

Restrição:

```txt
UNIQUE(tuning_id, course_number)
```

## 10.4 `catalog_tuning_strings`

Representa cada uma das dez cordas.

```ts
type CatalogTuningString = {
  id: string;
  courseId: string;
  tuningId: string;
  courseNumber: number;
  stringInCourse: 1 | 2;
  physicalStringNumber: number;
  pitchClass: PitchClass;
  octave: number;
  midiNote: number;
  referenceFrequency440: number;
  gaugeHint: string | null;
  materialHint: string | null;
  displayOrder: number;
};
```

Restrições:

```txt
course_number BETWEEN 1 AND 5
string_in_course BETWEEN 1 AND 2
physical_string_number BETWEEN 1 AND 10
pitch_class BETWEEN 0 AND 11
octave BETWEEN 0 AND 8
reference_frequency_440 > 0
UNIQUE(tuning_id, physical_string_number)
UNIQUE(course_id, string_in_course)
```

## 10.5 `catalog_tuning_audio`

Relaciona sons de referência.

```ts
type CatalogTuningAudio = {
  id: string;
  tuningId: string;
  courseId: string | null;
  stringId: string | null;
  assetId: string;
  audioRole: 'single_string' | 'course_pair' | 'all_open' | 'sequence';
  sortOrder: number;
};
```

## 10.6 `catalog_tuning_style_links`

Relaciona afinações a estilos ou ritmos.

```ts
type CatalogTuningStyleLink = {
  tuningId: string;
  rhythmId: string;
  relevance: 'primary' | 'common' | 'possible';
  notes: string | null;
};
```

---

# 11. Afinações criadas pelo usuário

Embora possam entrar após a V1, o banco já deve ser preparado.

## 11.1 `user_tunings`

```ts
type UserTuning = {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  originLabel: string | null;
  openChordText: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
```

## 11.2 `user_tuning_courses`

Mesma estrutura lógica de `catalog_tuning_courses`.

## 11.3 `user_tuning_strings`

Mesma estrutura lógica de `catalog_tuning_strings`.

## 11.4 Referência unificada

Como uma preferência pode apontar para afinação oficial ou pessoal:

```ts
type EntityReference = {
  origin: 'catalog' | 'user';
  id: string;
};
```

No SQLite, usar dois campos:

```txt
active_tuning_origin
active_tuning_id
```

Não usar FK polimórfica.

A validação deve ocorrer no repositório.

---

# 12. Qualidades de acordes

## 12.1 `catalog_chord_qualities`

```ts
type ChordQuality = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  symbolSuffix: string;
  family:
    | 'major'
    | 'minor'
    | 'dominant'
    | 'diminished'
    | 'augmented'
    | 'suspended'
    | 'extended'
    | 'other';
  description: string | null;
  sortOrder: number;
  isCoreV1: boolean;
};
```

Exemplos:

```txt
quality_major
quality_minor
quality_dominant_7
quality_major_7
quality_minor_7
quality_sus2
quality_sus4
quality_6
quality_add9
quality_diminished
```

## 12.2 `catalog_chord_quality_intervals`

```ts
type ChordQualityInterval = {
  id: string;
  qualityId: string;
  semitones: number;
  degreeLabel: string;
  role:
    | 'root'
    | 'third'
    | 'fifth'
    | 'seventh'
    | 'extension'
    | 'alteration';
  sortOrder: number;
  isRequired: boolean;
};
```

Restrições:

```txt
semitones BETWEEN 0 AND 23
UNIQUE(quality_id, semitones, degree_label)
```

---

# 13. Acordes lógicos

## 13.1 `catalog_chords`

Um acorde lógico é independente da afinação.

```ts
type CatalogChord = {
  id: string;
  rootPitchClass: PitchClass;
  qualityId: string;
  bassPitchClass: PitchClass | null;
  canonicalSymbol: string;
  normalizedSearchText: string;
  createdAt: string;
};
```

Exemplos:

```txt
D
Dm
D7
Dmaj7
Dm7
Dsus2
Dsus4
D6
Dadd9
Ddim
D/F#
```

Restrição única:

```txt
(root_pitch_class, quality_id, bass_pitch_class)
```

## 13.2 Símbolo exibido

O símbolo não deve depender unicamente de `canonicalSymbol`.

A apresentação deve ser gerada por:

- classe de altura;
- preferência de acidente;
- qualidade;
- baixo;
- idioma.

---

# 14. Formas oficiais de acordes

## 14.1 `catalog_chord_shapes`

```ts
type CatalogChordShape = {
  id: string;
  chordId: string;
  tuningId: string;
  name: string | null;
  variationNumber: number;
  startingFret: number;
  endingFret: number;
  fretSpan: number;
  difficulty: DifficultyLevel;
  hasBarre: boolean;
  positionRegion: 'open' | 'low' | 'middle' | 'high';
  verificationStatus: 'verified' | 'calculated' | 'deprecated';
  reviewerId: string | null;
  sourceId: string | null;
  reviewedAt: string | null;
  calculationVersion: string | null;
  ergonomicScore: number | null;
  soundCompletenessScore: number | null;
  isRecommended: boolean;
  sortOrder: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Restrições:

```txt
starting_fret BETWEEN 0 AND 30
ending_fret BETWEEN 0 AND 30
ending_fret >= starting_fret
fret_span BETWEEN 0 AND 12
variation_number >= 1
ergonomic_score BETWEEN 0 AND 100
sound_completeness_score BETWEEN 0 AND 100
```

## 14.2 `catalog_chord_shape_positions`

Uma linha por corda física.

```ts
type ChordShapePosition = {
  id: string;
  shapeId: string;
  tuningStringId: string;
  physicalStringNumber: number;
  courseNumber: number;
  stringInCourse: 1 | 2;
  fret: number;
  finger: '1' | '2' | '3' | '4' | 'T' | null;
  isRoot: boolean;
  resultingPitchClass: PitchClass | null;
  resultingOctave: number | null;
  intervalSemitones: number | null;
  intervalLabel: string | null;
};
```

Regras:

- corda abafada possui `fret = -1`;
- corda abafada não possui nota resultante;
- corda solta possui `fret = 0`;
- posição pressionada possui `fret > 0`;
- deve haver exatamente dez linhas para cada forma oficial;
- `finger` deve ser nulo em corda solta ou abafada;
- a nota resultante pode ser precomputada e validada.

Restrição:

```txt
UNIQUE(shape_id, physical_string_number)
```

## 14.3 `catalog_chord_shape_barres`

```ts
type ChordShapeBarre = {
  id: string;
  shapeId: string;
  fret: number;
  fromPhysicalString: number;
  toPhysicalString: number;
  finger: '1' | '2' | '3' | '4' | 'T';
  sortOrder: number;
};
```

Restrições:

```txt
fret BETWEEN 1 AND 30
from_physical_string BETWEEN 1 AND 10
to_physical_string BETWEEN 1 AND 10
from_physical_string <= to_physical_string
```

## 14.4 `catalog_chord_shape_audio`

```ts
type CatalogChordShapeAudio = {
  shapeId: string;
  assetId: string;
  role: 'strum_down' | 'strum_up' | 'arpeggio';
  isPrimary: boolean;
};
```

## 14.5 `catalog_chord_shape_sources`

Permite mais de uma fonte.

```ts
type CatalogChordShapeSource = {
  shapeId: string;
  sourceId: string;
  reviewerId: string | null;
  note: string | null;
};
```

---

# 15. Formas criadas pelo usuário

## 15.1 `user_chord_shapes`

Preparada para versões posteriores.

```ts
type UserChordShape = {
  id: string;
  chordRootPitchClass: PitchClass;
  chordQualityId: string;
  bassPitchClass: PitchClass | null;
  tuningOrigin: 'catalog' | 'user';
  tuningId: string;
  name: string | null;
  difficulty: DifficultyLevel | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
```

## 15.2 `user_chord_shape_positions`

Mesma convenção de posições oficiais.

## 15.3 `user_chord_shape_barres`

Mesma convenção de pestanas oficiais.

## 15.4 Validação

Formas próprias sempre usam status visual:

```txt
user_created
```

Nunca recebem selo de verificadas automaticamente.

---

# 16. Ritmos

## 16.1 `catalog_rhythms`

```ts
type CatalogRhythm = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string | null;
  originRegion: string | null;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  defaultBpm: number;
  minPracticeBpm: number;
  maxRecommendedBpm: number;
  pulsesPerQuarter: number;
  difficulty: DifficultyLevel;
  verificationStatus: 'verified' | 'deprecated';
  reviewerId: string | null;
  sourceId: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

Restrições:

```txt
time_signature_numerator BETWEEN 1 AND 32
time_signature_denominator IN (2, 4, 8, 16)
default_bpm BETWEEN 20 AND 300
min_practice_bpm BETWEEN 20 AND 300
max_recommended_bpm BETWEEN 20 AND 400
pulses_per_quarter IN (96, 120, 240, 480, 960)
```

## 16.2 `catalog_rhythm_patterns`

Um ritmo pode ter mais de um padrão.

```ts
type CatalogRhythmPattern = {
  id: string;
  rhythmId: string;
  name: string;
  level: DifficultyLevel;
  handMode: 'neutral' | 'right_hand_reference';
  totalTicks: number;
  bars: number;
  isPrimary: boolean;
  sortOrder: number;
  notes: string | null;
};
```

## 16.3 `catalog_rhythm_steps`

```ts
type RhythmStep = {
  id: string;
  patternId: string;
  stepOrder: number;
  positionTicks: number;
  durationTicks: number;
  beatLabel: string | null;
  direction: 'down' | 'up' | 'none';
  action:
    | 'strike'
    | 'mute'
    | 'percussion'
    | 'rest'
    | 'brush'
    | 'pluck';
  handPart:
    | 'thumb'
    | 'index'
    | 'middle'
    | 'ring'
    | 'multiple'
    | 'unspecified';
  stringRangeFrom: number | null;
  stringRangeTo: number | null;
  intensity: number;
  isAccent: boolean;
  label: string | null;
};
```

Restrições:

```txt
position_ticks >= 0
duration_ticks > 0
intensity BETWEEN 0 AND 100
string_range_from BETWEEN 1 AND 10
string_range_to BETWEEN 1 AND 10
UNIQUE(pattern_id, step_order)
```

## 16.4 `catalog_rhythm_audio`

```ts
type CatalogRhythmAudio = {
  id: string;
  rhythmId: string;
  patternId: string | null;
  assetId: string;
  role: 'slow' | 'normal' | 'metronome' | 'count_in' | 'demonstration';
  bpm: number | null;
  sortOrder: number;
};
```

## 16.5 Espelhamento para canhoto

Não duplicar dados.

A interface transforma:

```txt
down/up permanecem movimentos musicais
visual da mão é espelhado
ordem visual de cordas pode ser espelhada
```

---

# 17. Exercícios

## 17.1 `catalog_exercises`

```ts
type CatalogExercise = {
  id: string;
  title: string;
  description: string;
  exerciseType:
    | 'single_chord'
    | 'chord_change'
    | 'progression'
    | 'rhythm'
    | 'scale'
    | 'coordination'
    | 'barre';
  tuningId: string | null;
  rhythmId: string | null;
  patternId: string | null;
  difficulty: DifficultyLevel;
  defaultBpm: number | null;
  minBpm: number | null;
  maxBpm: number | null;
  durationSeconds: number | null;
  verificationStatus: 'verified' | 'deprecated';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

## 17.2 `catalog_exercise_events`

Representa progressão ou sequência.

```ts
type CatalogExerciseEvent = {
  id: string;
  exerciseId: string;
  eventOrder: number;
  eventType: 'chord' | 'rest' | 'instruction';
  chordId: string | null;
  shapeId: string | null;
  bars: number | null;
  beats: number | null;
  instructionText: string | null;
};
```

## 17.3 `catalog_exercise_assets`

Relaciona áudio ou ilustração.

---

# 18. Tags e categorias

## 18.1 `catalog_tags`

```ts
type CatalogTag = {
  id: string;
  slug: string;
  label: string;
  category:
    | 'song_style'
    | 'difficulty'
    | 'region'
    | 'occasion'
    | 'technique'
    | 'custom';
};
```

## 18.2 Relações

```txt
catalog_song_tags
catalog_rhythm_tags
catalog_exercise_tags
```

Cada tabela possui:

```txt
entity_id
tag_id
```

---

# 19. Cifras oficiais

## 19.1 `catalog_songs`

```ts
type CatalogSong = {
  id: string;
  slug: string;
  title: string;
  normalizedTitle: string;
  artist: string | null;
  normalizedArtist: string | null;
  composer: string | null;
  rightsHolder: string | null;
  licenseId: string;
  sourceId: string | null;
  copyrightStatus:
    | 'public_domain'
    | 'original'
    | 'authorized'
    | 'licensed';
  originalKeyPitchClass: PitchClass | null;
  originalKeyMode: 'major' | 'minor' | 'modal' | 'unknown';
  defaultRhythmId: string | null;
  defaultBpm: number | null;
  timeSignatureNumerator: number | null;
  timeSignatureDenominator: number | null;
  difficulty: DifficultyLevel;
  documentFormatVersion: number;
  documentJson: string;
  searchText: string;
  isFeatured: boolean;
  sortOrder: number;
  verificationStatus: 'verified' | 'deprecated';
  reviewerId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## 19.2 Por que usar `documentJson`

Uma cifra possui estrutura ordenada:

- seções;
- linhas;
- fragmentos de texto;
- acordes;
- notas;
- tablatura futura.

Armazenar tudo em tabelas muito fragmentadas aumentaria:

- número de joins;
- risco de ordem incorreta;
- complexidade do editor;
- custo de migração.

Metadados pesquisáveis continuam normalizados.

## 19.3 Estrutura `SongDocument`

```ts
type SongDocument = {
  version: 1;
  sections: SongSectionDocument[];
};

type SongSectionDocument = {
  id: string;
  type:
    | 'intro'
    | 'verse'
    | 'pre_chorus'
    | 'chorus'
    | 'bridge'
    | 'solo'
    | 'outro'
    | 'note'
    | 'custom';
  label?: string;
  repeatCount?: number;
  lines: SongLineDocument[];
};

type SongLineDocument = {
  id: string;
  type: 'lyrics' | 'chords' | 'tablature' | 'instruction' | 'blank';
  segments: SongSegmentDocument[];
};

type SongSegmentDocument =
  | {
      id: string;
      type: 'text';
      text: string;
    }
  | {
      id: string;
      type: 'chord';
      chord: ChordToken;
      anchorOffset?: number;
    }
  | {
      id: string;
      type: 'tab';
      value: string;
    }
  | {
      id: string;
      type: 'break';
    };

type ChordToken = {
  rootPitchClass: PitchClass;
  qualityId: string;
  bassPitchClass?: PitchClass | null;
  originalSpelling?: string;
  harmonicDegree?: string | null;
};
```

## 19.4 Regras do documento

- todos os IDs internos devem ser únicos na cifra;
- texto é preservado;
- acordes são dados estruturados;
- transposição altera tokens, não texto;
- `originalSpelling` preserva a grafia autorizada;
- o documento deve passar por validação antes de salvar;
- tamanho deve ser limitado;
- HTML não é permitido;
- scripts não são permitidos.

## 19.5 Índice de acordes da cifra

## `catalog_song_chord_index`

Evita varrer JSON para filtros.

```ts
type CatalogSongChordIndex = {
  songId: string;
  chordId: string;
  firstOccurrenceOrder: number;
  occurrenceCount: number;
};
```

Restrição:

```txt
UNIQUE(song_id, chord_id)
```

---

# 20. Arranjos por afinação

## 20.1 `catalog_song_arrangements`

Uma música pode ter mais de um arranjo.

```ts
type CatalogSongArrangement = {
  id: string;
  songId: string;
  tuningId: string;
  name: string;
  arrangementStatus:
    | 'verified'
    | 'calculated'
    | 'symbols_only'
    | 'unavailable';
  keyPitchClass: PitchClass;
  keyMode: 'major' | 'minor' | 'modal' | 'unknown';
  capoFret: number;
  recommendedBpm: number | null;
  notes: string | null;
  reviewerId: string | null;
  sourceId: string | null;
  calculationVersion: string | null;
  isRecommended: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

Restrições:

```txt
capo_fret BETWEEN 0 AND 15
UNIQUE(song_id, tuning_id, key_pitch_class, key_mode, capo_fret, name)
```

## 20.2 `catalog_song_arrangement_chords`

Mapeia acordes lógicos para formas.

```ts
type SongArrangementChord = {
  id: string;
  arrangementId: string;
  chordId: string;
  preferredShapeId: string | null;
  fallbackShapeId: string | null;
  status: 'verified' | 'calculated' | 'symbol_only' | 'missing';
  notes: string | null;
};
```

## 20.3 Transposição

Um arranjo verificado não precisa existir para cada tom.

Fluxo:

1. transpor os acordes lógicos;
2. procurar formas verificadas na afinação;
3. aplicar forma recomendada;
4. usar calculada apenas com aviso;
5. manter símbolo quando não houver forma.

## 20.4 Preferência de capotraste

Sugestões calculadas não alteram o arranjo oficial.

---

# 21. Relações entre músicas e ritmos

## 21.1 `catalog_song_rhythms`

```ts
type CatalogSongRhythm = {
  songId: string;
  rhythmId: string;
  patternId: string | null;
  relevance: 'primary' | 'alternative' | 'practice';
  recommendedBpm: number | null;
  notes: string | null;
};
```

## 21.2 `catalog_song_sources`

Permite múltiplas fontes e créditos.

```ts
type CatalogSongSource = {
  songId: string;
  sourceId: string;
  licenseId: string;
  attributionText: string | null;
};
```

---

# 22. Cifras próprias

## 22.1 `user_songs`

```ts
type UserSong = {
  id: string;
  title: string;
  normalizedTitle: string;
  artist: string | null;
  normalizedArtist: string | null;
  composer: string | null;
  copyrightConfirmation:
    | 'own_work'
    | 'authorized'
    | 'personal_use_confirmed'
    | 'unknown';
  originalKeyPitchClass: PitchClass | null;
  originalKeyMode: 'major' | 'minor' | 'modal' | 'unknown';
  tuningOrigin: 'catalog' | 'user';
  tuningId: string;
  rhythmId: string | null;
  customRhythmName: string | null;
  bpm: number | null;
  timeSignatureNumerator: number | null;
  timeSignatureDenominator: number | null;
  capoFret: number;
  difficulty: DifficultyLevel | null;
  documentFormatVersion: number;
  documentJson: string;
  searchText: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
```

## 22.2 Exclusão lógica

Cifras próprias devem usar:

```txt
deleted_at
```

Isso permite:

- desfazer;
- recuperação;
- backup consistente;
- limpeza posterior.

## 22.3 `user_song_versions`

Histórico limitado.

```ts
type UserSongVersion = {
  id: string;
  songId: string;
  versionNumber: number;
  snapshotJson: string;
  changeReason:
    | 'manual_save'
    | 'autosave_recovery'
    | 'import'
    | 'restore'
    | 'before_delete';
  createdAt: string;
};
```

Limite sugerido:

```txt
10 versões por cifra
```

Versões antigas podem ser limpas, preservando:

- primeira;
- última;
- antes de restauração;
- antes de exclusão.

## 22.4 `user_song_chord_index`

Mesma finalidade do índice oficial.

```ts
type UserSongChordIndex = {
  songId: string;
  rootPitchClass: PitchClass;
  qualityId: string;
  bassPitchClass: PitchClass | null;
  firstOccurrenceOrder: number;
  occurrenceCount: number;
};
```

## 22.5 `user_song_tags`

Relaciona tags pessoais.

## 22.6 `user_song_notes`

Anotações separadas do documento.

```ts
type UserSongNote = {
  id: string;
  songOrigin: 'catalog' | 'user';
  songId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};
```

---

# 23. Rascunhos

## 23.1 `user_song_drafts`

```ts
type UserSongDraft = {
  id: string;
  songId: string | null;
  draftType: 'new' | 'edit' | 'import';
  title: string | null;
  formStateJson: string;
  documentFormatVersion: number;
  documentJson: string;
  lastSavedAt: string;
  createdAt: string;
  recoveryStatus: 'active' | 'recovered' | 'discarded';
};
```

## 23.2 Regras

- apenas um rascunho ativo por `songId`;
- um novo documento pode ter rascunho sem `songId`;
- autosave usa debounce;
- rascunho não entra em busca normal;
- ao salvar definitivamente, marcar como recuperado ou apagar;
- ao fechar sem salvar, preservar conforme escolha.

---

# 24. Importação de cifras

## 24.1 `user_import_jobs`

Registra importações locais.

```ts
type UserImportJob = {
  id: string;
  importType: 'pasted_text' | 'text_file' | 'backup';
  sourceFileName: string | null;
  sourceSizeBytes: number | null;
  detectedFormat: string | null;
  parserVersion: string;
  status:
    | 'created'
    | 'parsed'
    | 'needs_review'
    | 'completed'
    | 'cancelled'
    | 'failed';
  warningsJson: string | null;
  createdSongId: string | null;
  createdAt: string;
  completedAt: string | null;
};
```

Não armazenar o texto original indefinidamente.

Após conclusão:

- apagar conteúdo temporário;
- manter somente metadados técnicos;
- nunca registrar letra em log.

---

# 25. Preferências gerais

A preferência será dividida por domínio para facilitar migração.

## 25.1 `user_profile`

Registro único.

```ts
type UserProfile = {
  id: 'local_user';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  onboardingStatus: 'not_started' | 'in_progress' | 'completed';
  onboardingStep: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Não armazena nome ou e-mail.

## 25.2 `user_app_preferences`

```ts
type UserAppPreferences = {
  id: 'app_preferences';
  activeTuningOrigin: 'catalog' | 'user';
  activeTuningId: string;
  accidentalPreference: 'contextual' | 'sharps' | 'flats';
  handedness: 'right' | 'left';
  diagramOrientation: 'standard' | 'mirrored';
  diagramMode: 'five_courses' | 'ten_strings';
  showCalculatedShapes: boolean;
  expandTheoryDetails: boolean;
  locale: string;
  updatedAt: string;
};
```

## 25.3 `user_appearance_preferences`

```ts
type UserAppearancePreferences = {
  id: 'appearance_preferences';
  themeMode: 'system' | 'light' | 'dark';
  highContrast: boolean;
  internalTextScale: 'system' | 'large' | 'extra_large';
  reduceDecorativeTextures: boolean;
  updatedAt: string;
};
```

## 25.4 `user_tuner_preferences`

```ts
type UserTunerPreferences = {
  id: 'tuner_preferences';
  calibrationA4: number;
  toleranceCents: number;
  autoAdvance: boolean;
  vibrateWhenInTune: boolean;
  keepScreenAwake: boolean;
  showFrequency: boolean;
  noiseFilterLevel: 'low' | 'medium' | 'high';
  lastMode: 'guided' | 'chromatic' | 'reference';
  updatedAt: string;
};
```

Restrições recomendadas:

```txt
calibration_a4 BETWEEN 415 AND 466
tolerance_cents BETWEEN 1 AND 20
```

## 25.5 `user_audio_preferences`

```ts
type UserAudioPreferences = {
  id: 'audio_preferences';
  referenceVolume: number;
  metronomeVolume: number;
  firstBeatAccent: boolean;
  spokenCountIn: boolean;
  hapticsEnabled: boolean;
  confirmationSoundsEnabled: boolean;
  updatedAt: string;
};
```

Volumes:

```txt
0.0..1.0
```

## 25.6 `user_stage_preferences`

```ts
type UserStagePreferences = {
  id: 'stage_preferences';
  keepScreenAwake: boolean;
  autoHideControls: boolean;
  tapToPause: boolean;
  defaultScrollSpeed: number;
  defaultFontScale: number;
  preferredOrientation: 'system' | 'portrait' | 'landscape';
  forceHighContrast: boolean;
  lockControlsOnStart: boolean;
  updatedAt: string;
};
```

---

# 26. Preferências por cifra

## 26.1 `user_song_preferences`

Serve para cifras oficiais e próprias.

```ts
type UserSongPreference = {
  id: string;
  songOrigin: 'catalog' | 'user';
  songId: string;
  rememberedKeyPitchClass: PitchClass | null;
  rememberedKeyMode: 'major' | 'minor' | 'modal' | 'unknown' | null;
  rememberKey: boolean;
  lastScrollPosition: number;
  stageFontScale: number | null;
  stageScrollSpeed: number | null;
  preferredArrangementId: string | null;
  preferredShapeOverridesJson: string | null;
  lastOpenedAt: string;
  updatedAt: string;
};
```

Restrição lógica:

```txt
UNIQUE(song_origin, song_id)
```

## 26.2 Overrides de formas

JSON permitido:

```ts
type ShapeOverrideMap = Record<
  string,
  {
    origin: 'catalog' | 'user';
    shapeId: string;
  }
>;
```

A chave deve representar o acorde lógico normalizado.

---

# 27. Favoritos

## 27.1 `user_favorites`

Tabela polimórfica controlada.

```ts
type UserFavorite = {
  id: string;
  entityType:
    | 'tuning'
    | 'chord_shape'
    | 'song'
    | 'rhythm'
    | 'exercise';
  entityOrigin: 'catalog' | 'user';
  entityId: string;
  createdAt: string;
};
```

Restrição:

```txt
UNIQUE(entity_type, entity_origin, entity_id)
```

## 27.2 Integridade

Como SQLite não possui FK polimórfica:

- repositório valida a existência antes de inserir;
- limpeza remove referências quebradas;
- itens excluídos logicamente permanecem recuperáveis;
- conteúdo inexistente não aparece na interface.

---

# 28. Recentes

## 28.1 `user_recent_items`

```ts
type UserRecentItem = {
  id: string;
  entityType:
    | 'tuning'
    | 'chord_shape'
    | 'song'
    | 'rhythm'
    | 'exercise';
  entityOrigin: 'catalog' | 'user';
  entityId: string;
  openedAt: string;
  openCount: number;
  contextJson: string | null;
};
```

Restrição lógica:

```txt
UNIQUE(entity_type, entity_origin, entity_id)
```

Ao reabrir:

- atualizar `openedAt`;
- incrementar `openCount`;
- não criar duplicata.

## 28.2 Limites

Sugestão:

```txt
50 cifras
50 acordes
20 ritmos
20 afinações
20 exercícios
```

Limpeza por item mais antigo.

---

# 29. Estado de continuação

## 29.1 `user_resume_states`

```ts
type UserResumeState = {
  id: string;
  resumeType:
    | 'song'
    | 'rhythm'
    | 'exercise'
    | 'draft'
    | 'tuner_session';
  entityOrigin: 'catalog' | 'user' | null;
  entityId: string | null;
  stateJson: string;
  isSafeToResume: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
};
```

## 29.2 Regras

Não armazenar como retomável:

- microfone ativo;
- áudio em reprodução;
- metrônomo tocando;
- compra pendente;
- importação parcialmente aplicada.

O estado contém apenas:

- posição;
- filtros;
- tamanho;
- etapa;
- parâmetros seguros.

---

# 30. Sessões de afinação

## 30.1 `user_tuning_sessions`

```ts
type UserTuningSession = {
  id: string;
  tuningOrigin: 'catalog' | 'user';
  tuningId: string;
  mode: 'guided' | 'chromatic';
  calibrationA4: number;
  toleranceCents: number;
  startedAt: string;
  completedAt: string | null;
  status: 'started' | 'completed' | 'cancelled' | 'interrupted';
  completedCourseCount: number;
  totalCourseCount: number;
};
```

## 30.2 `user_tuning_session_courses`

```ts
type UserTuningSessionCourse = {
  id: string;
  sessionId: string;
  courseNumber: number;
  targetMidiNotePrimary: number;
  targetMidiNoteSecondary: number | null;
  finalCentsPrimary: number | null;
  finalCentsSecondary: number | null;
  result: 'in_tune' | 'skipped' | 'not_completed';
  confirmedAt: string | null;
};
```

## 30.3 Privacidade

Não armazenar:

- buffer de áudio;
- gravação;
- frequência a cada frame;
- ruído ambiente.

---

# 31. Sessões de prática

## 31.1 `user_practice_sessions`

```ts
type UserPracticeSession = {
  id: string;
  practiceType:
    | 'rhythm'
    | 'exercise'
    | 'song'
    | 'metronome'
    | 'chord';
  entityOrigin: 'catalog' | 'user' | null;
  entityId: string | null;
  tuningOrigin: 'catalog' | 'user' | null;
  tuningId: string | null;
  rhythmId: string | null;
  bpmStart: number | null;
  bpmEnd: number | null;
  durationSeconds: number;
  startedAt: string;
  completedAt: string | null;
  status: 'completed' | 'cancelled' | 'interrupted';
};
```

## 31.2 Regras

- registro é opcional;
- não criar sessão para cada toque;
- duração mínima para persistir pode ser 15 segundos;
- não usar pontuação artificial;
- permitir limpar histórico.

---

# 32. Estado do metrônomo

## 32.1 Persistência de preferência

O metrônomo não precisa salvar uma sessão ativa.

Salvar apenas:

```ts
type MetronomeLastState = {
  bpm: number;
  numerator: number;
  denominator: number;
  accentFirstBeat: boolean;
  countInEnabled: boolean;
  updatedAt: string;
};
```

Pode ficar em:

```txt
user_audio_preferences
```

ou tabela própria:

```txt
user_metronome_preferences
```

Recomendação: tabela própria.

## 32.2 `user_metronome_preferences`

```ts
type UserMetronomePreferences = {
  id: 'metronome_preferences';
  lastBpm: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  accentFirstBeat: boolean;
  countInBars: number;
  visualPulseEnabled: boolean;
  updatedAt: string;
};
```

---

# 33. Tags pessoais

## 33.1 `user_tags`

```ts
type UserTag = {
  id: string;
  label: string;
  normalizedLabel: string;
  createdAt: string;
};
```

## 33.2 `user_song_tag_links`

```txt
song_id
tag_id
```

Restrição:

```txt
UNIQUE(song_id, tag_id)
```

---

# 34. Repertórios futuros

Preparar sem implementar na primeira tela.

## 34.1 `user_setlists`

```ts
type UserSetlist = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
```

## 34.2 `user_setlist_items`

```ts
type UserSetlistItem = {
  id: string;
  setlistId: string;
  songOrigin: 'catalog' | 'user';
  songId: string;
  itemOrder: number;
  customKeyPitchClass: PitchClass | null;
  customCapoFret: number | null;
  notes: string | null;
};
```

---

# 35. Estado Pro opcional

## 35.1 `user_entitlements`

```ts
type UserEntitlement = {
  id: string;
  entitlementCode: string;
  status: 'active' | 'inactive' | 'pending' | 'unknown';
  source: 'store' | 'local_mock';
  productId: string | null;
  purchasedAt: string | null;
  lastValidatedAt: string | null;
  cachedUntil: string | null;
  transactionReferenceHash: string | null;
  updatedAt: string;
};
```

## 35.2 Segurança

Não armazenar:

- recibos brutos em texto aberto;
- dados de cartão;
- senha;
- credenciais de loja.

## 35.3 Funcionamento offline

Entitlement previamente validado pode usar cache.

A ausência momentânea de rede não deve bloquear Pro já adquirido.

---

# 36. Backup

## 36.1 Tabelas incluídas

Incluir:

```txt
user_profile
user_app_preferences
user_appearance_preferences
user_tuner_preferences
user_audio_preferences
user_stage_preferences
user_metronome_preferences
user_songs
user_song_versions, opcional
user_song_chord_index
user_song_notes
user_song_drafts, opcional
user_tunings
user_tuning_courses
user_tuning_strings
user_chord_shapes
user_chord_shape_positions
user_chord_shape_barres
user_favorites
user_recent_items, opcional
user_practice_sessions, opcional
user_tuning_sessions, opcional
user_tags
user_song_tag_links
user_setlists
user_setlist_items
user_song_preferences
```

Não incluir:

```txt
catalog_*
system_migrations
buffers de áudio
arquivos temporários
logs técnicos completos
```

## 36.2 Manifesto

```ts
type BackupManifest = {
  format: 'cifras-de-viola-backup';
  formatVersion: 1;
  appVersion: string;
  schemaVersion: number;
  catalogVersion: number;
  createdAt: string;
  devicePlatform: 'android' | 'ios' | 'unknown';
  sections: BackupSectionManifest[];
  checksumAlgorithm: 'sha256';
  payloadChecksum: string;
};

type BackupSectionManifest = {
  name: string;
  itemCount: number;
  included: boolean;
};
```

## 36.3 Payload

```ts
type BackupPayloadV1 = {
  profile?: UserProfile;
  preferences?: {
    app: UserAppPreferences;
    appearance: UserAppearancePreferences;
    tuner: UserTunerPreferences;
    audio: UserAudioPreferences;
    stage: UserStagePreferences;
    metronome: UserMetronomePreferences;
  };
  songs?: UserSong[];
  songVersions?: UserSongVersion[];
  songNotes?: UserSongNote[];
  tunings?: UserTuning[];
  tuningCourses?: UserTuningCourse[];
  tuningStrings?: UserTuningString[];
  chordShapes?: UserChordShape[];
  favorites?: UserFavorite[];
  recentItems?: UserRecentItem[];
  practiceSessions?: UserPracticeSession[];
  tuningSessions?: UserTuningSession[];
  tags?: UserTag[];
  setlists?: UserSetlist[];
  songPreferences?: UserSongPreference[];
};
```

## 36.4 Importação

Ordem:

1. validar arquivo;
2. validar tamanho;
3. validar manifesto;
4. validar checksum;
5. migrar payload em memória para versão atual;
6. mostrar prévia;
7. criar snapshot do banco atual;
8. iniciar transação;
9. mesclar ou substituir;
10. validar relações;
11. commit;
12. limpar snapshot temporário.

---

# 37. Referências polimórficas

Entidades podem referenciar catálogo ou usuário.

Padrão:

```ts
type Origin = 'catalog' | 'user';

type EntityRef<TType extends string = string> = {
  type: TType;
  origin: Origin;
  id: string;
};
```

No banco:

```txt
entity_type
entity_origin
entity_id
```

## 37.1 Regras

- apenas enums permitidos;
- validar existência em repositório;
- não aceitar tipo arbitrário vindo de importação;
- limpar referências órfãs;
- não confiar em arquivo de backup.

---

# 38. Tipos fundamentais TypeScript

```ts
export type PitchClass =
  | 0 | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10 | 11;

export type DifficultyLevel =
  | 'beginner'
  | 'easy'
  | 'intermediate'
  | 'advanced';

export type ContentOrigin = 'catalog' | 'user';

export type VerificationStatus =
  | 'verified'
  | 'calculated'
  | 'user_created'
  | 'imported'
  | 'deprecated'
  | 'draft';

export type AccidentalPreference =
  | 'contextual'
  | 'sharps'
  | 'flats';

export type DiagramMode =
  | 'five_courses'
  | 'ten_strings';

export type Handedness =
  | 'right'
  | 'left';

export type ThemeMode =
  | 'system'
  | 'light'
  | 'dark';
```

---

# 39. Tipos de domínio

## 39.1 Afinação completa

```ts
export type TuningDetails = {
  id: string;
  origin: ContentOrigin;
  name: string;
  shortName: string;
  aliases: string[];
  description?: string | null;
  courses: TuningCourseDetails[];
  verificationStatus: VerificationStatus;
  tensionWarning?: string | null;
};

export type TuningCourseDetails = {
  id: string;
  courseNumber: number;
  pairType: 'unison' | 'octave' | 'custom';
  strings: TuningStringDetails[];
};

export type TuningStringDetails = {
  id: string;
  physicalStringNumber: number;
  stringInCourse: 1 | 2;
  pitchClass: PitchClass;
  octave: number;
  midiNote: number;
  referenceFrequency440: number;
};
```

## 39.2 Acorde completo

```ts
export type ChordDefinition = {
  id?: string;
  rootPitchClass: PitchClass;
  qualityId: string;
  bassPitchClass?: PitchClass | null;
};

export type ChordShapeDetails = {
  id: string;
  origin: ContentOrigin;
  chord: ChordDefinition;
  tuning: EntityRef<'tuning'>;
  positions: ChordStringPosition[];
  barres: ChordBarre[];
  difficulty: DifficultyLevel;
  verificationStatus: VerificationStatus;
  isRecommended: boolean;
};

export type ChordStringPosition = {
  physicalStringNumber: number;
  courseNumber: number;
  stringInCourse: 1 | 2;
  fret: number;
  finger: '1' | '2' | '3' | '4' | 'T' | null;
  pitchClass: PitchClass | null;
  octave: number | null;
  intervalLabel: string | null;
};

export type ChordBarre = {
  fret: number;
  fromPhysicalString: number;
  toPhysicalString: number;
  finger: '1' | '2' | '3' | '4' | 'T';
};
```

## 39.3 Cifra renderizável

```ts
export type SongViewModel = {
  ref: EntityRef<'song'>;
  title: string;
  artist?: string | null;
  composer?: string | null;
  currentKeyPitchClass: PitchClass | null;
  originalKeyPitchClass: PitchClass | null;
  mode: 'major' | 'minor' | 'modal' | 'unknown';
  tuning: EntityRef<'tuning'>;
  arrangementStatus:
    | 'verified'
    | 'calculated'
    | 'symbols_only'
    | 'unavailable';
  rhythm?: {
    id: string;
    name: string;
    bpm?: number | null;
  } | null;
  document: SongDocument;
  chordUsages: SongChordUsage[];
};

export type SongChordUsage = {
  chord: ChordDefinition;
  occurrenceCount: number;
  preferredShape?: EntityRef<'chord_shape'> | null;
  status: 'verified' | 'calculated' | 'symbol_only' | 'missing';
};
```

---

# 40. Validação com schemas

Recomendação:

- Zod ou biblioteca equivalente;
- validação nas fronteiras;
- não validar repetidamente dados já tipados dentro do domínio.

Schemas obrigatórios:

```txt
SongDocumentSchema
BackupManifestSchema
BackupPayloadSchema
ImportedSongSchema
TuningSchema
ChordShapeSchema
UserPreferencesSchema
```

Exemplo conceitual:

```ts
const PitchClassSchema = z.number().int().min(0).max(11);

const ChordTokenSchema = z.object({
  rootPitchClass: PitchClassSchema,
  qualityId: z.string().min(1),
  bassPitchClass: PitchClassSchema.nullish(),
  originalSpelling: z.string().max(32).optional(),
  harmonicDegree: z.string().max(16).nullish(),
});
```

---

# 41. Estrutura SQL base

## 41.1 Configuração

Ao abrir conexão:

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA busy_timeout = 5000;
```

A disponibilidade deve ser testada no Expo.

## 41.2 `system_meta`

```sql
CREATE TABLE IF NOT EXISTS system_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 41.3 `system_migrations`

```sql
CREATE TABLE IF NOT EXISTS system_migrations (
  id TEXT PRIMARY KEY NOT NULL,
  version INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  execution_ms INTEGER
);
```

## 41.4 Afinações

```sql
CREATE TABLE IF NOT EXISTS catalog_tunings (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT NOT NULL,
  origin_region TEXT,
  open_chord_id TEXT,
  difficulty TEXT NOT NULL
    CHECK (difficulty IN ('beginner', 'easy', 'intermediate', 'advanced')),
  verification_status TEXT NOT NULL
    CHECK (verification_status IN ('verified', 'deprecated')),
  reviewer_id TEXT,
  source_id TEXT,
  reviewed_at TEXT,
  tension_warning TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0
    CHECK (is_featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (open_chord_id) REFERENCES catalog_chords(id),
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id),
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id)
);
```

A tabela pode ser criada após `catalog_chords` ou a FK ser adicionada conforme ordem de migração.

## 41.5 Ordens

```sql
CREATE TABLE IF NOT EXISTS catalog_tuning_courses (
  id TEXT PRIMARY KEY NOT NULL,
  tuning_id TEXT NOT NULL,
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  pair_type TEXT NOT NULL
    CHECK (pair_type IN ('unison', 'octave', 'custom')),
  label TEXT,
  sort_order INTEGER NOT NULL,
  UNIQUE (tuning_id, course_number),
  FOREIGN KEY (tuning_id)
    REFERENCES catalog_tunings(id)
    ON DELETE CASCADE
);
```

## 41.6 Cordas

```sql
CREATE TABLE IF NOT EXISTS catalog_tuning_strings (
  id TEXT PRIMARY KEY NOT NULL,
  course_id TEXT NOT NULL,
  tuning_id TEXT NOT NULL,
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  string_in_course INTEGER NOT NULL
    CHECK (string_in_course BETWEEN 1 AND 2),
  physical_string_number INTEGER NOT NULL
    CHECK (physical_string_number BETWEEN 1 AND 10),
  pitch_class INTEGER NOT NULL
    CHECK (pitch_class BETWEEN 0 AND 11),
  octave INTEGER NOT NULL
    CHECK (octave BETWEEN 0 AND 8),
  midi_note INTEGER NOT NULL
    CHECK (midi_note BETWEEN 0 AND 127),
  reference_frequency_440 REAL NOT NULL
    CHECK (reference_frequency_440 > 0),
  gauge_hint TEXT,
  material_hint TEXT,
  display_order INTEGER NOT NULL,
  UNIQUE (tuning_id, physical_string_number),
  UNIQUE (course_id, string_in_course),
  FOREIGN KEY (course_id)
    REFERENCES catalog_tuning_courses(id)
    ON DELETE CASCADE,
  FOREIGN KEY (tuning_id)
    REFERENCES catalog_tunings(id)
    ON DELETE CASCADE
);
```

## 41.7 Qualidades

```sql
CREATE TABLE IF NOT EXISTS catalog_chord_qualities (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  symbol_suffix TEXT NOT NULL,
  family TEXT NOT NULL
    CHECK (
      family IN (
        'major',
        'minor',
        'dominant',
        'diminished',
        'augmented',
        'suspended',
        'extended',
        'other'
      )
    ),
  description TEXT,
  sort_order INTEGER NOT NULL,
  is_core_v1 INTEGER NOT NULL DEFAULT 0
    CHECK (is_core_v1 IN (0, 1))
);
```

## 41.8 Acordes

```sql
CREATE TABLE IF NOT EXISTS catalog_chords (
  id TEXT PRIMARY KEY NOT NULL,
  root_pitch_class INTEGER NOT NULL
    CHECK (root_pitch_class BETWEEN 0 AND 11),
  quality_id TEXT NOT NULL,
  bass_pitch_class INTEGER
    CHECK (bass_pitch_class IS NULL OR bass_pitch_class BETWEEN 0 AND 11),
  canonical_symbol TEXT NOT NULL,
  normalized_search_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (root_pitch_class, quality_id, bass_pitch_class),
  FOREIGN KEY (quality_id)
    REFERENCES catalog_chord_qualities(id)
);
```

## 41.9 Formas

```sql
CREATE TABLE IF NOT EXISTS catalog_chord_shapes (
  id TEXT PRIMARY KEY NOT NULL,
  chord_id TEXT NOT NULL,
  tuning_id TEXT NOT NULL,
  name TEXT,
  variation_number INTEGER NOT NULL
    CHECK (variation_number >= 1),
  starting_fret INTEGER NOT NULL
    CHECK (starting_fret BETWEEN 0 AND 30),
  ending_fret INTEGER NOT NULL
    CHECK (ending_fret BETWEEN 0 AND 30),
  fret_span INTEGER NOT NULL
    CHECK (fret_span BETWEEN 0 AND 12),
  difficulty TEXT NOT NULL
    CHECK (difficulty IN ('beginner', 'easy', 'intermediate', 'advanced')),
  has_barre INTEGER NOT NULL DEFAULT 0
    CHECK (has_barre IN (0, 1)),
  position_region TEXT NOT NULL
    CHECK (position_region IN ('open', 'low', 'middle', 'high')),
  verification_status TEXT NOT NULL
    CHECK (verification_status IN ('verified', 'calculated', 'deprecated')),
  reviewer_id TEXT,
  source_id TEXT,
  reviewed_at TEXT,
  calculation_version TEXT,
  ergonomic_score INTEGER
    CHECK (ergonomic_score IS NULL OR ergonomic_score BETWEEN 0 AND 100),
  sound_completeness_score INTEGER
    CHECK (
      sound_completeness_score IS NULL
      OR sound_completeness_score BETWEEN 0 AND 100
    ),
  is_recommended INTEGER NOT NULL DEFAULT 0
    CHECK (is_recommended IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (ending_fret >= starting_fret),
  UNIQUE (chord_id, tuning_id, variation_number),
  FOREIGN KEY (chord_id) REFERENCES catalog_chords(id),
  FOREIGN KEY (tuning_id) REFERENCES catalog_tunings(id),
  FOREIGN KEY (reviewer_id) REFERENCES catalog_reviewers(id),
  FOREIGN KEY (source_id) REFERENCES catalog_sources(id)
);
```

## 41.10 Posições

```sql
CREATE TABLE IF NOT EXISTS catalog_chord_shape_positions (
  id TEXT PRIMARY KEY NOT NULL,
  shape_id TEXT NOT NULL,
  tuning_string_id TEXT NOT NULL,
  physical_string_number INTEGER NOT NULL
    CHECK (physical_string_number BETWEEN 1 AND 10),
  course_number INTEGER NOT NULL
    CHECK (course_number BETWEEN 1 AND 5),
  string_in_course INTEGER NOT NULL
    CHECK (string_in_course BETWEEN 1 AND 2),
  fret INTEGER NOT NULL
    CHECK (fret BETWEEN -1 AND 30),
  finger TEXT
    CHECK (finger IS NULL OR finger IN ('1', '2', '3', '4', 'T')),
  is_root INTEGER NOT NULL DEFAULT 0
    CHECK (is_root IN (0, 1)),
  resulting_pitch_class INTEGER
    CHECK (
      resulting_pitch_class IS NULL
      OR resulting_pitch_class BETWEEN 0 AND 11
    ),
  resulting_octave INTEGER,
  interval_semitones INTEGER,
  interval_label TEXT,
  UNIQUE (shape_id, physical_string_number),
  FOREIGN KEY (shape_id)
    REFERENCES catalog_chord_shapes(id)
    ON DELETE CASCADE,
  FOREIGN KEY (tuning_string_id)
    REFERENCES catalog_tuning_strings(id)
);
```

## 41.11 Ritmos

```sql
CREATE TABLE IF NOT EXISTS catalog_rhythms (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  origin_region TEXT,
  time_signature_numerator INTEGER NOT NULL
    CHECK (time_signature_numerator BETWEEN 1 AND 32),
  time_signature_denominator INTEGER NOT NULL
    CHECK (time_signature_denominator IN (2, 4, 8, 16)),
  default_bpm INTEGER NOT NULL
    CHECK (default_bpm BETWEEN 20 AND 300),
  min_practice_bpm INTEGER NOT NULL
    CHECK (min_practice_bpm BETWEEN 20 AND 300),
  max_recommended_bpm INTEGER NOT NULL
    CHECK (max_recommended_bpm BETWEEN 20 AND 400),
  pulses_per_quarter INTEGER NOT NULL
    CHECK (pulses_per_quarter IN (96, 120, 240, 480, 960)),
  difficulty TEXT NOT NULL
    CHECK (difficulty IN ('beginner', 'easy', 'intermediate', 'advanced')),
  verification_status TEXT NOT NULL
    CHECK (verification_status IN ('verified', 'deprecated')),
  reviewer_id TEXT,
  source_id TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0
    CHECK (is_featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 41.12 Cifras próprias

```sql
CREATE TABLE IF NOT EXISTS user_songs (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  artist TEXT,
  normalized_artist TEXT,
  composer TEXT,
  copyright_confirmation TEXT NOT NULL
    CHECK (
      copyright_confirmation IN (
        'own_work',
        'authorized',
        'personal_use_confirmed',
        'unknown'
      )
    ),
  original_key_pitch_class INTEGER
    CHECK (
      original_key_pitch_class IS NULL
      OR original_key_pitch_class BETWEEN 0 AND 11
    ),
  original_key_mode TEXT NOT NULL
    CHECK (original_key_mode IN ('major', 'minor', 'modal', 'unknown')),
  tuning_origin TEXT NOT NULL
    CHECK (tuning_origin IN ('catalog', 'user')),
  tuning_id TEXT NOT NULL,
  rhythm_id TEXT,
  custom_rhythm_name TEXT,
  bpm INTEGER
    CHECK (bpm IS NULL OR bpm BETWEEN 20 AND 400),
  time_signature_numerator INTEGER,
  time_signature_denominator INTEGER,
  capo_fret INTEGER NOT NULL DEFAULT 0
    CHECK (capo_fret BETWEEN 0 AND 15),
  difficulty TEXT
    CHECK (
      difficulty IS NULL
      OR difficulty IN ('beginner', 'easy', 'intermediate', 'advanced')
    ),
  document_format_version INTEGER NOT NULL,
  document_json TEXT NOT NULL,
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
```

## 41.13 Favoritos

```sql
CREATE TABLE IF NOT EXISTS user_favorites (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL
    CHECK (
      entity_type IN (
        'tuning',
        'chord_shape',
        'song',
        'rhythm',
        'exercise'
      )
    ),
  entity_origin TEXT NOT NULL
    CHECK (entity_origin IN ('catalog', 'user')),
  entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (entity_type, entity_origin, entity_id)
);
```

---

# 42. Índices

## 42.1 Afinações

```sql
CREATE INDEX IF NOT EXISTS idx_tuning_alias_normalized
ON catalog_tuning_aliases(normalized_alias);

CREATE INDEX IF NOT EXISTS idx_tuning_strings_tuning
ON catalog_tuning_strings(tuning_id, physical_string_number);
```

## 42.2 Acordes

```sql
CREATE INDEX IF NOT EXISTS idx_chords_root_quality
ON catalog_chords(root_pitch_class, quality_id);

CREATE INDEX IF NOT EXISTS idx_shapes_tuning_chord
ON catalog_chord_shapes(tuning_id, chord_id);

CREATE INDEX IF NOT EXISTS idx_shapes_verified
ON catalog_chord_shapes(
  tuning_id,
  verification_status,
  is_recommended,
  difficulty
);
```

## 42.3 Cifras

```sql
CREATE INDEX IF NOT EXISTS idx_catalog_songs_title
ON catalog_songs(normalized_title);

CREATE INDEX IF NOT EXISTS idx_catalog_songs_artist
ON catalog_songs(normalized_artist);

CREATE INDEX IF NOT EXISTS idx_user_songs_title
ON user_songs(normalized_title)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_songs_updated
ON user_songs(updated_at DESC)
WHERE deleted_at IS NULL;
```

## 42.4 Recentes

```sql
CREATE INDEX IF NOT EXISTS idx_recent_type_opened
ON user_recent_items(entity_type, opened_at DESC);
```

## 42.5 Sessões

```sql
CREATE INDEX IF NOT EXISTS idx_practice_started
ON user_practice_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_tuning_sessions_started
ON user_tuning_sessions(started_at DESC);
```

---

# 43. Busca local

## 43.1 Normalização

Criar função utilitária:

```ts
normalizeSearchText(value)
```

Deve:

- converter para minúsculas;
- remover acentos para busca;
- normalizar espaços;
- preservar símbolos musicais úteis;
- criar equivalentes de notas;
- não alterar texto exibido.

Exemplo:

```txt
“Ré com Sétima” → “re com setima d7”
```

## 43.2 FTS5

Usar FTS5 se disponível e testado no ambiente Expo.

Tabelas virtuais possíveis:

```txt
catalog_songs_fts
user_songs_fts
catalog_tunings_fts
```

## 43.3 Fallback

Se FTS5 não estiver disponível:

- usar colunas normalizadas;
- índices;
- `LIKE` com prefixos;
- limitar resultados;
- debounce.

## 43.4 Busca de acordes

Não usar FTS como mecanismo principal.

Interpretar:

```txt
D
Ré
Dm
Ré menor
D7
Ré com sétima
```

com parser musical.

---

# 44. Repositórios

Telas não acessam SQL diretamente.

Estrutura:

```txt
src/
  database/
    client.ts
    migrations/
    seed/
    queries/
    transaction.ts

  repositories/
    tuningRepository.ts
    chordRepository.ts
    songRepository.ts
    rhythmRepository.ts
    exerciseRepository.ts
    favoritesRepository.ts
    recentRepository.ts
    preferencesRepository.ts
    tunerSessionRepository.ts
    practiceRepository.ts
    backupRepository.ts
```

## 44.1 Contratos

```ts
interface TuningRepository {
  getActive(): Promise<TuningDetails>;
  getByRef(ref: EntityRef<'tuning'>): Promise<TuningDetails | null>;
  list(options?: TuningListOptions): Promise<TuningSummary[]>;
  search(query: string): Promise<TuningSummary[]>;
}

interface ChordRepository {
  findChord(definition: ChordDefinition): Promise<CatalogChord | null>;
  listShapes(
    tuning: EntityRef<'tuning'>,
    chord: ChordDefinition,
    filters?: ChordShapeFilters
  ): Promise<ChordShapeDetails[]>;
  getShape(ref: EntityRef<'chord_shape'>): Promise<ChordShapeDetails | null>;
}

interface SongRepository {
  list(filters?: SongFilters): Promise<SongSummary[]>;
  search(query: string, filters?: SongFilters): Promise<SongSummary[]>;
  getByRef(ref: EntityRef<'song'>): Promise<SongViewModel | null>;
  saveUserSong(input: SaveUserSongInput): Promise<UserSong>;
  softDeleteUserSong(id: string): Promise<void>;
}
```

---

# 45. Serviços de domínio

```txt
src/
  domain/
    music/
      pitch.ts
      noteNames.ts
      frequency.ts
      cents.ts
      chordSymbols.ts
      chordIntervals.ts
      chordValidation.ts
      transposition.ts
      capo.ts
      tuning.ts

    songs/
      songDocument.ts
      songParser.ts
      songIndexer.ts
      arrangementResolver.ts

    rhythms/
      rhythmTiming.ts
      rhythmMirror.ts

    backup/
      backupValidation.ts
      backupMigration.ts
```

## 45.1 Regras

- UI recebe ViewModels;
- repositório retorna entidades;
- serviços calculam música;
- storage não conhece componentes;
- lógica de transposição não fica na tela.

---

# 46. Transações obrigatórias

Usar transação para:

- criar cifra e índice de acordes;
- editar cifra e criar versão;
- excluir cifra e atualizar favoritos/recentes;
- importar backup;
- atualizar catálogo;
- migrar banco;
- alterar afinação personalizada e suas cordas;
- salvar forma e posições;
- concluir importação.

Exemplo:

```txt
BEGIN
  salvar user_song
  apagar índice antigo
  gerar índice novo
  salvar versão
  atualizar recente
COMMIT
```

Em erro:

```txt
ROLLBACK
```

---

# 47. Integridade musical

## 47.1 Afinação

Validar:

- exatamente cinco ordens;
- exatamente duas cordas por ordem;
- exatamente dez cordas;
- números únicos;
- MIDI coerente com pitchClass e octave;
- frequência coerente com MIDI;
- `pairType` coerente com intervalo das cordas.

## 47.2 Forma de acorde

Validar:

- dez posições;
- posição pertence à afinação;
- casa válida;
- dedos válidos;
- pestana compatível;
- notas resultantes calculadas;
- conjunto contém notas essenciais;
- baixo corresponde quando informado;
- `fretSpan` coerente;
- `hasBarre` coerente.

## 47.3 Cifra

Validar:

- JSON na versão suportada;
- IDs internos únicos;
- qualidade de acorde existente;
- classe de altura válida;
- nenhum HTML;
- tamanho máximo;
- índice de acordes consistente.

## 47.4 Ritmo

Validar:

- passos dentro do total;
- ordem única;
- ticks não negativos;
- duração válida;
- compasso coerente;
- faixa de cordas coerente.

---

# 48. Atualização do catálogo

## 48.1 Estratégia

O catálogo é versionado.

Exemplo:

```txt
catalog_version = 3
```

## 48.2 Processo

```txt
App inicia
    ↓
Compara versão instalada com versão do bundle
    ↓
Nova versão?
    ├── Não → continuar
    └── Sim → iniciar transação
              ↓
              aplicar upserts em catalog_*
              ↓
              marcar itens removidos como deprecated
              ↓
              validar relações
              ↓
              atualizar catalog_version
              ↓
              commit
```

## 48.3 Não apagar imediatamente

Conteúdo oficial removido deve, inicialmente:

```txt
verification_status = deprecated
```

Motivos:

- favoritos antigos;
- cifras próprias;
- históricos;
- referências salvas.

## 48.4 IDs não podem ser reciclados

Um ID removido nunca deve representar outro conteúdo.

---

# 49. Migrações

## 49.1 Nomenclatura

```txt
001_initial_schema.ts
002_add_song_drafts.ts
003_add_arrangements.ts
```

## 49.2 Estrutura

```ts
type Migration = {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
  validate?: (db: SQLiteDatabase) => Promise<void>;
};
```

## 49.3 Regras

- sem migração destrutiva sem cópia;
- criar nova coluna antes de remover antiga;
- preencher dados;
- validar;
- remover em versão futura;
- não depender de internet;
- testar upgrade de todas as versões suportadas.

---

# 50. Exclusão e retenção

## 50.1 Soft delete

Usar em:

- cifras;
- afinações próprias;
- formas próprias;
- repertórios.

## 50.2 Hard delete

Permitido após:

- período de desfazer;
- limpeza manual;
- backup opcional;
- remoção de dependências.

## 50.3 Cascata

Usar `ON DELETE CASCADE` apenas quando o filho não faz sentido sem o pai.

Exemplos:

- corda sem ordem;
- posição sem forma;
- versão sem cifra após hard delete.

Não usar cascata em favoritos polimórficos.

---

# 51. Segurança

## 51.1 Consultas parametrizadas

Obrigatório.

Errado:

```ts
`SELECT * FROM user_songs WHERE title = '${title}'`
```

Correto:

```ts
db.getAllAsync(
  'SELECT * FROM user_songs WHERE title = ?',
  [title]
);
```

## 51.2 Limites

Definir:

- tamanho máximo de cifra;
- tamanho máximo de backup;
- quantidade máxima de itens importados;
- profundidade máxima de JSON;
- comprimento de títulos;
- comprimento de notas.

Sugestão inicial:

```txt
título: 160 caracteres
artista: 160
compositor: 240
anotação: 10.000
documentJson: 2 MB
backup: 50 MB
```

## 51.3 Arquivos

- validar MIME;
- validar extensão;
- validar assinatura interna;
- não executar;
- não abrir links automaticamente;
- apagar temporários.

## 51.4 Logs

Não registrar conteúdo musical completo em produção.

---

# 52. Desempenho

## 52.1 Regras

- paginação em listas;
- selecionar apenas colunas necessárias;
- carregar detalhes sob demanda;
- não carregar áudios na consulta;
- usar índices;
- usar transações em lote;
- preparar statements;
- evitar JSON parse repetido;
- cachear ViewModels frequentes;
- invalidar cache por versão.

## 52.2 Paginação

Padrão:

```txt
20 a 50 itens
```

Preferir paginação por cursor:

```txt
updated_at + id
sort_order + id
```

Evitar `OFFSET` alto em grandes catálogos.

## 52.3 Diagramas

Gerados por dados.

Não armazenar imagem por acorde.

## 52.4 Afinador

O loop de áudio não grava no banco.

Apenas conclusão da sessão é persistida.

---

# 53. Cache

## 53.1 Em memória

Pode armazenar:

- afinação ativa;
- qualidades de acorde;
- tema;
- preferências;
- última cifra aberta;
- formas recentes.

## 53.2 Persistente

SQLite é a fonte de verdade.

Não duplicar o banco inteiro em AsyncStorage.

## 53.3 AsyncStorage

Pode ser usado apenas para:

- flags ultrarrápidas antes do banco;
- preferência de tema na splash;
- último schema conhecido;
- nunca para cifras completas.

---

# 54. Seeds oficiais

## 54.1 Ordem de importação

1. fontes;
2. licenças;
3. revisores;
4. qualidades;
5. intervalos;
6. acordes;
7. afinações;
8. ordens;
9. cordas;
10. ritmos;
11. padrões;
12. passos;
13. formas;
14. posições;
15. cifras;
16. arranjos;
17. índices;
18. ativos.

## 54.2 Arquivos de seed

```txt
src/database/seed/
  sources.json
  licenses.json
  reviewers.json
  chordQualities.json
  chords.json
  tunings.json
  chordShapes.json
  rhythms.json
  songs.json
  arrangements.json
  assets.json
```

## 54.3 Validação de seed

Antes da build:

- IDs únicos;
- FKs existentes;
- dez posições por forma;
- cinco ordens por afinação;
- duas cordas por ordem;
- documentos válidos;
- licenças válidas;
- checksums de ativos;
- nenhum conteúdo desconhecido publicado.

---

# 55. Dados mínimos da V1

## 55.1 Afinações

```txt
4 afinações
5 ordens por afinação
10 cordas por afinação
```

Total:

```txt
4 catalog_tunings
20 catalog_tuning_courses
40 catalog_tuning_strings
```

## 55.2 Acordes

```txt
12 classes de altura
10 qualidades
```

Até:

```txt
120 acordes lógicos
```

## 55.3 Formas

Meta mínima:

```txt
1 forma revisada por combinação essencial
```

Estimativa máxima inicial:

```txt
4 afinações × 120 acordes = 480 formas
```

Cada forma:

```txt
10 posições
```

Estimativa:

```txt
4.800 linhas de posição
```

## 55.4 Ritmos

```txt
8 ritmos
1 padrão principal por ritmo
8 a 32 passos por padrão
```

## 55.5 Cifras

Somente:

- autorais;
- autorizadas;
- domínio público confirmado.

---

# 56. Consultas essenciais

## 56.1 Afinação completa

```sql
SELECT
  t.*,
  c.id AS course_id,
  c.course_number,
  c.pair_type,
  s.id AS string_id,
  s.string_in_course,
  s.physical_string_number,
  s.pitch_class,
  s.octave,
  s.midi_note,
  s.reference_frequency_440
FROM catalog_tunings t
JOIN catalog_tuning_courses c
  ON c.tuning_id = t.id
JOIN catalog_tuning_strings s
  ON s.course_id = c.id
WHERE t.id = ?
ORDER BY c.course_number, s.string_in_course;
```

## 56.2 Formas verificadas

```sql
SELECT *
FROM catalog_chord_shapes
WHERE tuning_id = ?
  AND chord_id = ?
  AND verification_status = 'verified'
ORDER BY
  is_recommended DESC,
  difficulty ASC,
  sort_order ASC;
```

## 56.3 Cifras favoritas

A consulta precisa unir catálogo e usuário em nível de repositório.

Não criar uma `UNION` gigantesca em todas as telas.

Fluxo:

1. buscar referências favoritas;
2. agrupar por origem;
3. buscar resumos;
4. ordenar por favorito.

## 56.4 Recentes

Mesmo padrão por referências polimórficas.

---

# 57. ViewModels

O banco não deve entregar linhas SQL diretamente à UI.

Exemplos:

```ts
type TuningSummary = {
  ref: EntityRef<'tuning'>;
  name: string;
  shortName: string;
  openChordLabel?: string | null;
  courseLabels: string[];
  isActive: boolean;
  isFavorite: boolean;
  verificationStatus: VerificationStatus;
};

type ChordShapeSummary = {
  ref: EntityRef<'chord_shape'>;
  symbol: string;
  name: string;
  difficulty: DifficultyLevel;
  verificationStatus: VerificationStatus;
  miniDiagram: ChordStringPosition[];
  isFavorite: boolean;
};

type SongSummary = {
  ref: EntityRef<'song'>;
  title: string;
  artist?: string | null;
  keyLabel?: string | null;
  tuningLabel: string;
  rhythmLabel?: string | null;
  difficulty?: DifficultyLevel | null;
  origin: ContentOrigin;
  isFavorite: boolean;
};
```

---

# 58. Tratamento de erros

## 58.1 Erros de domínio

```ts
type DomainErrorCode =
  | 'TUNING_NOT_FOUND'
  | 'CHORD_NOT_FOUND'
  | 'SHAPE_NOT_FOUND'
  | 'SONG_NOT_FOUND'
  | 'INVALID_SONG_DOCUMENT'
  | 'INCOMPATIBLE_TUNING'
  | 'MISSING_VERIFIED_SHAPE'
  | 'INVALID_BACKUP'
  | 'UNSUPPORTED_BACKUP_VERSION'
  | 'DATABASE_READ_ONLY'
  | 'INSUFFICIENT_STORAGE';
```

## 58.2 Repositório

Repositório deve:

- lançar erro tipado;
- preservar causa técnica;
- não expor SQL na UI;
- permitir recuperação.

---

# 59. Testes

## 59.1 Testes unitários

- pitch class;
- MIDI;
- frequência;
- cents;
- transposição;
- símbolos;
- notação sustenido/bemol;
- parser de cifra;
- validação de documento;
- cálculo de notas de forma;
- espelhamento de ritmo;
- migração de backup.

## 59.2 Testes de banco

- schema vazio;
- seed;
- FKs;
- índices;
- criação de cifra;
- edição e versão;
- soft delete;
- favoritos;
- recentes;
- migração;
- rollback;
- importação.

## 59.3 Testes de conteúdo

Para cada afinação:

```txt
[ ] 5 ordens
[ ] 10 cordas
[ ] MIDI coerente
[ ] frequência coerente
[ ] aliases únicos
```

Para cada forma:

```txt
[ ] 10 posições
[ ] acorde correto
[ ] notas essenciais
[ ] pestana válida
[ ] status definido
```

## 59.4 Testes de upgrade

Matriz:

```txt
schema 1 → atual
schema 2 → atual
schema 3 → atual
instalação limpa → atual
backup v1 → atual
```

---

# 60. Auditoria de conteúdo

## 60.1 Checklist de publicação

```txt
[ ] toda afinação possui revisor
[ ] toda forma verificada possui fonte ou revisor
[ ] toda cifra possui licença
[ ] nenhuma licença está unknown
[ ] nenhum ativo está ausente
[ ] nenhum ID duplicado
[ ] nenhuma FK quebrada
[ ] nenhum documento inválido
[ ] nenhuma forma possui menos de 10 posições
[ ] conteúdo calculado está marcado
[ ] conteúdo descontinuado não aparece por padrão
```

---

# 61. Estrutura de pastas recomendada

```txt
src/
  database/
    client.ts
    pragmas.ts
    transaction.ts
    schema/
      tables.ts
      indexes.ts
      triggers.ts
    migrations/
      001_initial_schema.ts
    seed/
      index.ts
      validators.ts
      data/
    mappers/
    queries/

  domain/
    music/
    songs/
    rhythms/
    tuner/
    backup/

  repositories/
    tuningRepository.ts
    chordRepository.ts
    songRepository.ts
    rhythmRepository.ts
    preferencesRepository.ts
    favoritesRepository.ts
    backupRepository.ts

  services/
    audioService.ts
    tunerService.ts
    metronomeService.ts
    backupService.ts

  types/
    database.ts
    music.ts
    tuning.ts
    chord.ts
    song.ts
    rhythm.ts
    settings.ts
    backup.ts
```

---

# 62. Triggers opcionais

Usar apenas quando simplificarem integridade.

## 62.1 Atualização de data

Triggers podem atualizar `updated_at`, mas a recomendação inicial é controlar no repositório para facilitar testes.

## 62.2 Limpeza de recentes

Pode ser realizada por serviço, não trigger.

## 62.3 FTS

Triggers podem sincronizar tabelas FTS.

Testar compatibilidade antes.

---

# 63. Decisões que não devem ser alteradas silenciosamente

1. Nota interna usa `pitchClass`.
2. Oitava usa notação científica.
3. Acorde lógico é separado da forma.
4. Forma pertence a uma afinação.
5. Cada forma oficial possui dez posições.
6. Cifra armazena acordes como tokens estruturados.
7. Texto da cifra não é modificado pela transposição.
8. Conteúdo oficial e pessoal ficam em tabelas distintas.
9. IDs oficiais são estáveis.
10. Dados pessoais não são apagados em atualização.
11. Conteúdo calculado permanece identificado.
12. Áudio do afinador não é persistido.
13. Backup não inclui catálogo.
14. Telas não acessam SQL.
15. Migrações são transacionais.
16. Busca aceita notação brasileira e internacional.
17. Preferências são divididas por domínio.
18. Favoritos polimórficos são validados no repositório.
19. Exclusão de cifra é lógica antes da limpeza.
20. Direitos autorais fazem parte do dado.

---

# 64. Definition of Ready para implementação

```txt
[ ] schema revisado
[ ] convenção das cordas aprovada
[ ] pitchClass aprovado
[ ] afinações iniciais validadas
[ ] qualidades da V1 definidas
[ ] formato SongDocument aprovado
[ ] estratégia de catálogo aprovada
[ ] estratégia de backup aprovada
[ ] regras de licença aprovadas
[ ] IDs oficiais definidos
[ ] limites de conteúdo definidos
```

---

# 65. Definition of Done do Data Model

```txt
[ ] domínios definidos
[ ] sistema definido
[ ] catálogo definido
[ ] dados pessoais definidos
[ ] afinações definidas
[ ] cordas definidas
[ ] acordes definidos
[ ] formas definidas
[ ] cifras definidas
[ ] documento de cifra definido
[ ] arranjos definidos
[ ] ritmos definidos
[ ] exercícios definidos
[ ] preferências definidas
[ ] favoritos definidos
[ ] recentes definidos
[ ] sessões definidas
[ ] backup definido
[ ] premium opcional definido
[ ] tipos TypeScript definidos
[ ] exemplos SQL definidos
[ ] índices definidos
[ ] busca definida
[ ] repositórios definidos
[ ] migrações definidas
[ ] integridade definida
[ ] segurança definida
[ ] testes definidos
[ ] conteúdo mínimo definido
```

---

# 66. Ordem recomendada de implementação

```txt
1. Tipos musicais fundamentais
2. Cliente SQLite e pragmas
3. Sistema de migrações
4. Tabelas system_*
5. Tabelas catalog_*
6. Validador de seeds
7. Seed mínimo de afinações
8. Tabelas user_*
9. PreferencesRepository
10. TuningRepository
11. ChordRepository
12. SongDocument e parser
13. SongRepository
14. RhythmRepository
15. FavoritesRepository
16. RecentRepository
17. Sessões
18. Backup
19. Testes de migração
20. Auditoria de integridade
```

---

# 67. Próxima etapa

Como o projeto optou por produzir o documento 05 antes das imagens e Screen Specs, a sequência recomendada passa a ser:

```txt
04 — Imagens das telas
05 — Data Model — concluído
06 — Screen Specs
07 — Codex Tasks
08 — Release Checklist
```

Antes de enviar o banco ao Codex, ainda será necessário:

- validar tecnicamente as quatro afinações;
- definir as notas e oitavas de cada corda;
- revisar a convenção de numeração;
- definir as dez qualidades iniciais;
- preparar uma pequena seed de teste;
- transformar as telas aprovadas em Screen Specs.
