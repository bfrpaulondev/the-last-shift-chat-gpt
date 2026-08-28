# M27 — Refeitório / Pausa do Turno

## Objetivo

Transformar `cafeteria` de standby numa área jogável entre o 30.º e o 37.º andar, preservando M1–M26, True First Person, interações cinematográficas, persistência, telemetria, streaming por área e serialização de diálogos.

## Fluxo

1. M26 devolve o jogador ao `service-elevator / elevator-after-floor-30`.
2. O elevador libera o refeitório somente após `floor30_routine_complete`.
3. A viagem ao refeitório grava `elevator_ride_to_cafeteria_started`, checkpoint `elevator-ascending-cafeteria` e depois `elevator_arrived_cafeteria` / `elevator-cafeteria`.
4. A saída faz streaming para `cafeteria / cafeteria-arrival`.
5. No refeitório, o jogador pode ler o aviso de pausa, preparar café e fazer a pausa.
6. O café grava `cafeteria_coffee_taken` e checkpoint `cafeteria-break`.
7. A pausa exige o café, grava `cafeteria_break_taken` e, com ambas as etapas concluídas, `cafeteria_break_complete` e checkpoint `cafeteria-complete`.
8. A porta do elevador permanece bloqueada até a pausa estar completa.
9. O retorno entrega o jogador em `service-elevator / elevator-after-cafeteria`.
10. O painel então libera o 37.º andar, com viagem persistente até `elevator-floor-37` e handoff para `floor-37 / floor-37-arrival`.
11. O conteúdo jogável do 37.º permanece reservado ao próximo milestone.

## Cena

- refeitório procedural sem assets binários
- mesas e mobiliário de pausa
- estação de café funcional
- mesa/assento de pausa
- aviso operacional Corvus Facilities
- acesso de retorno ao elevador
- iluminação fria com leve contraste quente na estação de café
- colisores dedicados no contrato 2D do `PlayerController`
- ambiente procedural sintetizado por Web Audio API

## Interações

### Aviso de pausa

`[E] Ler aviso de pausa`

Usa `reach`, registra `cafeteria_notice_read` e apresenta a sequência restante usando o sistema global de notas.

### Máquina de café

`[E] Preparar café`

Usa `press`, registra `cafeteria_coffee_taken` e checkpoint `cafeteria-break`.

### Pausa

`[E] Fazer a pausa`

Exige café, usa `brace`, registra `cafeteria_break_taken` e conclui a pausa quando as duas etapas estão prontas.

### Retorno ao elevador

`[E] Voltar ao elevador de serviço`

Permanece bloqueado até `cafeteria_break_complete`. Depois usa `door / door-handle`, registra `cafeteria_left_for_elevator` e retorna à cabine.

## Continuidade do elevador

- novo botão físico do refeitório, liberado após o 30.º
- novo botão físico do 37.º, liberado após a pausa
- viagens com checkpoints persistentes e retomada após reload
- portas derivadas da etapa atual da rota, sem reabrir durante viagens posteriores por flags antigas
- áudio do motor/campainha cobre as quatro etapas da rota
- `elevator-after-floor-30` e `elevator-after-cafeteria` atualizam objetivo e fala sem criar fila paralela

## Persistência e telemetria

- `cafeteria` possui `defaultSpawn` seguro.
- `cafeteria_entry_seen` impede repetição da fala inicial.
- `cafeteria-break` preserva café obtido.
- `cafeteria-complete` preserva a pausa concluída.
- eventos `cafeteria:*` usam o pipeline global existente de telemetria/Mongo.
- flags e location continuam no mesmo save existente.
- interações respeitam `subtitleQueue` e `dismissSubtitle`.

## Performance

A área só existe em memória quando `location.area === 'cafeteria'`. Geometria e áudio usam Three.js e Web Audio já presentes no projeto. Nenhuma dependência, textura, modelo, codec ou asset binário foi adicionado.

## Acceptance

`scripts/acceptance-m27.mjs` valida:

- continuidade M1–M26
- streaming real do refeitório
- True First Person, PBR e PostEffects
- aviso, máquina de café, pausa e retorno ao elevador
- gating café → pausa → saída
- checkpoints `cafeteria-break` e `cafeteria-complete`
- telemetria e flags
- viagem 30.º → refeitório
- retorno refeitório → elevador
- habilitação e viagem para o 37.º
- handoff para `floor-37 / floor-37-arrival`
- áudio procedural
- colisores dedicados
- serialização de diálogo

`npm run check:acceptance` executa M1–M27 em sequência.
