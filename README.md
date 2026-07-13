# Viola Caipira

Aplicativo offline de apoio ao estudo da viola caipira, construído com Expo, React Native, TypeScript, Expo Router e SQLite.

## Estado atual

- Expo SDK 54, React Native 0.81 e React 19.1;
- navegação principal e telas complementares implementadas como base funcional;
- banco SQLite local, migrações, repositórios, backup validado e serviços musicais;
- temas claro, escuro e alto contraste;
- interface responsiva para celular e tablet;
- nenhuma captura de microfone é iniciada automaticamente;
- quality gates e exportação Android, iOS e web disponíveis.

O app ainda não está pronto para publicação. Identificadores definitivos, assets de loja, integração nativa do microfone, política de privacidade pública e declarações das lojas continuam pendentes. Consulte [docs/07_RELEASE_AUDIT.md](docs/07_RELEASE_AUDIT.md).

## Comandos

- `npm start` — inicia o Expo;
- `npm run quality` — executa tipagem, lint e testes;
- `npm run doctor` — executa o diagnóstico oficial do Expo;
- `npm run expo:check` — verifica o alinhamento das dependências ao SDK;
- `npm run export:check` — gera bundles Android, iOS e web;
- `npm run audit:dependencies` — audita dependências de produção.

## Referências

- `docs/01_APP_BLUEPRINT_CIFRAS_DE_VIOLA.md`
- `docs/02_DESIGN_SYSTEM_CIFRAS_DE_VIOLA.md`
- `docs/03_USER_FLOW_CIFRAS_DE_VIOLA.md`
- `docs/04_SCREEN_SPECS_CIFRAS_DE_VIOLA.md`
- `docs/05_DATA_MODEL_CIFRAS_DE_VIOLA.md`
- `docs/06_CODEX_TASKS_CIFRAS_DE_VIOLA.md`
- `assets/screenshots-reference/`
