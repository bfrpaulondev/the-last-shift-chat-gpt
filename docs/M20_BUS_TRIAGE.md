# M20 — Ônibus 214 + TRIAGEM + PIN

## Objetivo

Transformar `bus-214` de área de streaming vazia em uma sequência jogável completa da Parte 2, mantendo o pipeline visual/first-person consolidado nos milestones anteriores e introduzindo a primeira mecânica de análise comportamental do jogo.

## Escopo implementado

### Ônibus 214

- Interior jogável em escala first-person.
- Piso, bancos, barras, teto e carroceria com materiais PBR simples e baratos.
- Janelas físicas molhadas com gotas e streaks.
- Cidade procedural em movimento do lado de fora para vender deslocamento sem carregar uma cidade completa.
- Movimento de carroceria/câmera com oscilação leve de rodagem e bumps periódicos.
- Porta de saída interativa e campainha de parada.
- True First Person, CameraPolish, PlayerController, PbrEnvironment e PostEffects preservados.

### Orçamento de NPCs

O brief descrevia "7 passageiros + motorista", mas uma enumeração intermediária somava 8 passageiros. O M20 fixa o orçamento em **8 humanos totais** para não contradizer o alvo de performance:

1. motorista;
2. passageira com livro;
3. Paulo, nervoso;
4. senhora tricotando;
5. executivo com maleta;
6. colega Corvus A;
7. colega Corvus B;
8. homem do boné, alvo real da TRIAGEM.

O estudante dormindo foi retirado porque não tinha função narrativa persistente e faria o conjunto exceder o orçamento definido.

### Comportamentos visuais

- homem do boné faz varredura lateral com a cabeça;
- Paulo mantém movimento nervoso da perna;
- senhora usa props de tricô;
- executivo usa maleta;
- passageira usa livro;
- colegas Corvus permanecem agrupadas para a interação de escuta;
- motorista recebe animação procedural discreta.

## TRIAGEM

A primeira leitura de padrões usa estado transitório em `busTriageStore.ts`, separado do save narrativo.

### Regras

- ALERT dispara a partir de 06:14.
- Duração do ALERT: 6 segundos reais.
- Movimento do jogador durante ALERT: `0.3x`.
- Mix do ônibus passa por low-pass de 600 Hz durante ALERT.
- Quatro candidatos podem ser marcados:
  - passageira do livro;
  - Paulo;
  - executivo;
  - homem do boné.
- Marcação exige manter `E` por `0.8s` olhando para o mesmo alvo.
- Falsos positivos retornam `PADRÃO COMPATÍVEL.`.
- Homem do boné resolve a anomalia e grava `caught_pickpocket`.
- Se o tempo terminar sem identificação, grava `pickpocket_unmarked`.
- Todas as marcações geram telemetria `bus:triage:<id>`.

### Persistência

O progresso parcial do anel, alvo atual e tempo interno do ALERT não são persistidos. Apenas resultados narrativos são salvos.

Se houver reload depois de `bus_alert_started` e antes de `bus_alert_completed`, o ALERT é reconstruído em estado consistente e ganha uma nova janela completa de 6 segundos.

## QTE do PIN

- Disponível a partir de 06:20 depois da conclusão do ALERT.
- Janela: 2 segundos reais.
- HUD mostra celular/PIN, sombra lateral e aviso amarelo.
- `E` cobre a tela e grava `pin_protected`.
- Timeout grava `pin_exposed`.
- O input vencedor usa `stopImmediatePropagation()` para não disparar simultaneamente outra interação do ônibus.
- Reload durante `pin_qte_started` sem resultado reconstrói o QTE em estado válido.

## Corvus

As duas colegas permitem ouvir uma conversa curta quando o jogador chega perto o suficiente. O resultado narrativo grava `overheard_corvus`.

O ruído de conversa é procedural e muda de ganho com a distância. Não são usados ficheiros de áudio pagos ou externos.

## Áudio

`BusAudio.tsx` cria proceduralmente:

- motor;
- ressonância;
- estrada;
- chuva;
- ar/ventilação;
- murmúrio das colegas;
- bumps.

O sistema respeita o mute global através de `audioEngine.isMuted()`.

## Cronologia

- 06:05 — início mínimo da viagem;
- 06:14 — ALERT/TRIAGEM;
- 06:20 — QTE do PIN;
- 06:28 — anúncio da próxima parada;
- 06:30 — Avenida Meridian disponível;
- 06:34 — parada perdida se o jogador não tiver descido.

A escala global do M19 permanece 10 segundos reais por minuto de jogo.

## Saída

- campainha grava `stop_requested`;
- ao chegar à Meridian, objetivo muda para descer;
- porta faz streaming para `meridian-plaza` / `plaza-arrival`;
- se o jogador perder a janela, grava `missed_stop` e faz streaming para `plaza-missed-stop`.

## Save e continuidade

Flags narrativas importantes:

- `bus_ride_started`
- `bus_alert_started`
- `bus_alert_completed`
- `caught_pickpocket`
- `pickpocket_unmarked`
- `pickpocket_left_bus`
- `triage_checked_*`
- `pin_qte_started`
- `pin_protected`
- `pin_exposed`
- `overheard_corvus`
- `bus_book_seen`
- `paulo_seen`
- `stop_requested`
- `bus_next_stop_announced`
- `meridian_stop_ready`
- `bus_exited`
- `missed_stop`

`worldMinute` continua persistido pelo relógio global introduzido no M19.

## Performance

- máximo de 8 humanos totais nesta área;
- geometria procedural simples, sem assets externos;
- cidade externa é cenário animado barato;
- estado de TRIAGEM é transient Zustand, sem writes de save a cada frame;
- distância do murmúrio só atualiza quando muda o suficiente para evitar writes Zustand desnecessários;
- nenhuma luz dinâmica por NPC.

## Acceptance M20

`scripts/acceptance-m20.mjs` valida:

- streaming de `bus-214`;
- runtime true-first-person;
- NPC budget/personagens narrativos;
- ônibus molhado/móvel;
- TRIAGEM 0.8s e time scale 0.3;
- quatro candidatos;
- resultado correto/falsos positivos;
- telemetria;
- low-pass 600 Hz;
- PIN 2s e proteção de input;
- retomada segura após reload;
- Corvus;
- parada/saída/missed stop;
- HUD específico do M20.

O comando principal de acceptance roda M1–M20 em sequência para impedir regressões de milestones anteriores.
