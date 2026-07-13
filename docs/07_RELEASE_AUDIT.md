# Auditoria de migração, estabilidade e publicação

**Data:** 13 de julho de 2026  
**Base auditada:** branch `agent-audio-engine-core`  
**Resultado:** SDK 54 validado; app executável, mas ainda não publicável.

## 1. Resumo executivo

A migração para Expo SDK 54 foi concluída com React Native 0.81.5 e React 19.1.0. Tipagem, lint, testes e exportação das três plataformas passam. A inspeção do Expo também passa em 18 de 18 verificações.

Não foi encontrado um ponto de crash reproduzível depois das correções desta auditoria. Permanecem bloqueios de publicação e lacunas funcionais/visuais que precisam ser resolvidos antes de enviar o aplicativo às lojas.

## 2. Correções aplicadas

- dependências alinhadas às versões suportadas pelo Expo SDK 54;
- dependências nativas usadas diretamente declaradas no projeto (`expo-asset`, `expo-font`, `expo-system-ui`, `react-native-gesture-handler` e `react-native-screens`);
- API de reset das abas adaptada ao Expo Router 6;
- estilos absolutos compatibilizados com os tipos do React Native 0.81;
- transformação JSX dos testes adaptada ao React 19.1;
- deep links de telas secundárias preservados após o bootstrap;
- título da splash corrigido para manter contraste no tema escuro;
- afinador alterado para bloquear a captura quando não existe resolvedor nativo de permissão;
- tráfego arbitrário do iOS desabilitado, mantendo exceção somente para `localhost` no desenvolvimento;
- backup automático do Android desabilitado para não copiar silenciosamente o banco local;
- permissões Android de armazenamento legado e sobreposição removidas da build;
- tema nativo configurado como automático e suporte a iPad mantido.

## 3. Validações executadas

| Verificação | Resultado |
| --- | --- |
| `expo-doctor` | 18/18 verificações aprovadas |
| `expo install --check` | dependências atualizadas e compatíveis |
| TypeScript estrito | aprovado |
| ESLint sem warnings | aprovado |
| Vitest | 124 testes aprovados após a nova proteção de permissão |
| Export Android | aprovado |
| Export iOS | aprovado |
| Export web | aprovado |
| Rotas em 320 dp | sem overflow horizontal nas rotas verificadas |
| Layout em 390 dp | renderização correta das telas principais |
| Layout em 1024 dp | coluna central limitada e sem overflow horizontal |
| Deep links web | telas secundárias preservadas após correção |

As rotas verificadas incluíram Home, Cifras, Acordes, Afinador, Estudos, Afinações, Ritmos, Metrônomo, Configurações, Backup, Favoritos, Minhas cifras, Criar cifra e Importar cifra.

## 4. Permissões e segurança efetivas

### Android

A configuração nativa inspecionada mantém apenas `INTERNET` e `VIBRATE`. Foram bloqueadas explicitamente:

- `READ_EXTERNAL_STORAGE`;
- `WRITE_EXTERNAL_STORAGE`;
- `SYSTEM_ALERT_WINDOW`.

`RECORD_AUDIO` não está presente porque o app ainda não possui uma implementação nativa real de captura. Não se deve declarar essa permissão antes da integração do microfone existir.

### iOS

- `NSAllowsArbitraryLoads` está desabilitado;
- não existe `NSMicrophoneUsageDescription`, coerente com a ausência atual de captura nativa;
- o app aceita iPhone e iPad e respeita tema automático.

### Dados locais

- os dados principais permanecem em SQLite no sandbox do aplicativo;
- o backup valida formato, tamanho máximo, versão e checksum SHA-256 antes da importação;
- não foi encontrada telemetria, publicidade, autenticação, WebView ou transmissão de dados pessoais;
- o afinador não inicia captura ao abrir uma rota e agora falha de forma segura sem resolvedor de permissão.

## 5. Dependências vulneráveis conhecidas

O `npm audit --omit=dev` ainda informa 13 ocorrências moderadas em `postcss` e `uuid`, todas transitivas das ferramentas do Expo/configuração nativa. O `npm audit fix` compatível foi aplicado. O único reparo adicional oferecido pelo npm usa `--force` e atualiza o projeto para Expo 57, portanto não deve ser aplicado enquanto o requisito for permanecer no SDK 54.

Essas ocorrências estão principalmente no caminho de build/configuração. Devem ser reavaliadas quando uma correção compatível chegar ao SDK 54 ou quando o projeto autorizar uma nova migração de SDK.

## 6. Conformidade visual com as referências

### Correspondência alta

- paleta verde, palha e cobre;
- tipografia serifada nos títulos e sem serifa no corpo;
- cartões arredondados, chips, hierarquia de conteúdo e navegação inferior;
- estrutura central de Home, listas e telas musicais;
- adaptação sem corte horizontal em 320, 390 e 1024 dp;
- suporte consistente a tema escuro, embora as referências estejam majoritariamente em tema claro.

### Correspondência parcial

- a Home mantém afinação ativa, chamada para afinar, continuação e atalhos, mas possui conteúdo e espaçamentos adicionais;
- o Afinador mantém os três modos e a mensagem de processamento local, porém não reproduz o grande CTA visual “Iniciar afinação” da referência;
- Configurações mantém os mesmos grupos, mas as opções ainda são chips informativos, não linhas/toggles funcionais como no mockup;
- várias telas complementares são shells visuais e ainda não estão ligadas integralmente aos repositórios e serviços.

### Ausências relevantes

- fluxo de onboarding das referências 02 a 08;
- telas públicas de Política de privacidade, Sobre e Créditos/fontes;
- assets finais de ícone, ícone adaptativo e splash nativa;
- paridade fina de espaçamento, ícones e densidade em todas as 32 referências;
- execução real do microfone, sons de referência e metrônomo nativo.

Conclusão visual: o design system e a identidade estão próximos das referências, mas a paridade estrutural por tela ainda é média. Afinador, Configurações, onboarding e fluxos nativos são os maiores desvios.

## 7. Bloqueios para Google Play e App Store

### P0 — impede submissão

1. **Identificadores definitivos ausentes.** A introspecção ainda resolve `com.placeholder.appid`. Os docs proíbem inventar bundle/package; o responsável pelo app deve fornecer os valores definitivos.
2. **Assets de publicação ausentes.** Não existem ícone final, adaptive icon, splash nativa final nem conjuntos de screenshots de loja.
3. **Configuração EAS ausente.** Não há `eas.json`, vínculo de projeto EAS, credenciais ou builds assinadas.
4. **Política de privacidade pública ausente.** É necessário URL HTTPS estável, link dentro do app e informações verdadeiras sobre retenção/exclusão de dados.
5. **Declarações das lojas pendentes.** Preencher Data Safety do Google Play e App Privacy da Apple com base na build final e em todos os SDKs incluídos.
6. **Recursos anunciados ainda incompletos.** Microfone, áudio, metrônomo, backup por arquivo e preferências não podem ser descritos como prontos na ficha da loja até a implementação e validação em dispositivo real.

### P1 — obrigatório antes da produção

- integrar o microfone com solicitação em contexto e somente após ação explícita;
- adicionar textos claros de permissão em português e testar negado/bloqueado/interrompido;
- conectar o ciclo de vida nativo ao coordenador de áudio para pausar em background, ligação e alarme;
- persistir preferências de tema/alto contraste e tornar Configurações funcional;
- validar restauração de backup em arquivo real sem sobrescrita silenciosa;
- testar AAB e IPA assinados em Android e iPhone/iPad reais;
- validar acessibilidade com TalkBack e VoiceOver;
- executar testes de rotação e split view no iPad;
- revisar conteúdo musical, créditos, fontes e licenças antes da publicação.

## 8. Requisitos atuais das lojas

- Expo SDK 54 usa Android target API 36, acima do mínimo atual do Google Play para novos apps e atualizações.
- Desde 28 de abril de 2026, submissões à App Store precisam ser construídas com Xcode 26 ou posterior e SDK do iOS 26; a imagem de build EAS escolhida deve atender esse requisito.
- Google Play exige Data Safety e política de privacidade coerentes com o comportamento real do app.
- App Store Connect exige URL de política de privacidade e respostas precisas em App Privacy.

Fontes oficiais:

- [Expo SDK 54](https://expo.dev/changelog/sdk-54)
- [Requisitos de target API do Google Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
- [Próximos requisitos da App Store](https://developer.apple.com/news/upcoming-requirements/)
- [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Google Play User Data](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
- [Apple App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/)

## 9. Próxima sequência recomendada

1. receber bundle ID e package name definitivos;
2. finalizar ícone, splash e assets das lojas;
3. implementar onboarding e preferências persistidas;
4. implementar microfone/áudio com permissões e lifecycle;
5. criar Política de privacidade, Sobre e Créditos dentro do app e publicar a política em HTTPS;
6. configurar EAS e gerar AAB/IPA internos;
7. executar a auditoria final em dispositivos reais e preencher as declarações das lojas.
