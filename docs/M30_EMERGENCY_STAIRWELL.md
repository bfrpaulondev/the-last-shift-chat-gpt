# M30 — Rota de Emergência / Escada de Serviço

## Objetivo

Continuar o blackout além da porta corta-fogo de M29 sem alterar M1–M29, transformando a rota de emergência numa área streamed, jogável e persistente com True First Person, interações M17, telemetria, áudio procedural e retomada segura após reload.

## Fluxo

1. M29 termina com `blackout_recovery_complete` e a porta corta-fogo liberada.
2. Abrir a porta grava `blackout_left_for_stairwell` e faz streaming para `emergency-stairwell / stairwell-entry`.
3. O jogador entra no patamar superior da escada de emergência com iluminação mínima e ambiente metálico residual.
4. O mapa de emergência Corvus E-04 explica que elevadores não devem ser usados e que a saída exige descida por escada.
5. `[E] Descer para o patamar inferior` usa `brace`, grava `stairwell_first_descent` e checkpoint `stairwell-lower-landing`.
6. A descida usa o sistema de transição de área já existente para reposicionar a câmera com segurança no segundo patamar, sem alterar a física horizontal do PlayerController.
7. No patamar inferior, o telefone de emergência pode ser testado; ele está sem linha, gravando `stairwell_phone_checked` e `stairwell-phone-dead`.
8. A porta do próximo lance permanece bloqueada narrativamente até o telefone ser verificado.
9. Depois disso, `[E] Continuar descendo` grava `stairwell_route_complete` e `stairwell-route-ready`.
10. O slice termina com o objetivo `Continue descendo — próximo patamar.`. O destino seguinte permanece reservado ao próximo milestone, evitando inventar narrativa além do contrato aprovado.

## Cena e performance

- geometria procedural simples para dois patamares de escada
- portas corta-fogo, mapa de emergência, telefone e luzes vermelhas de emergência
- colisores AABB 2D compatíveis com o PlayerController existente
- nenhuma alteração global de física
- área carregada somente quando `location.area === 'emergency-stairwell'`
- nenhuma textura, modelo, áudio binário, codec ou dependência nova

## Interações M17

- mapa de emergência: `reach`
- descida para o patamar inferior: `brace`
- telefone de emergência: `grab / phone-lift`
- próximo lance: `door / door-handle`

Todas respeitam `subtitleQueue` e `dismissSubtitle`, preservando a serialização global de diálogos.

## Persistência

- `stairwell-entry`: entrada na nova área
- `stairwell-lower-landing`: primeira descida concluída
- `stairwell-phone-dead`: telefone verificado
- `stairwell-route-ready`: pronto para continuar descendo

`objectiveForProgress` conhece `emergency-stairwell`, portanto reload em qualquer etapa restaura o objetivo correto sem depender de timers locais.

## Telemetria

Interações usam `objectId` no namespace `stairwell:*`, mantendo o pipeline existente de telemetria/Mongo.

## Áudio

`StairwellAudio` usa Web Audio API para:

- hum elétrico residual de baixa frequência
- ressonância metálica contínua
- gemidos estruturais procedurais periódicos
- mute sincronizado com `audioEngine.isMuted()`

## Acceptance

`scripts/acceptance-m30.mjs` valida:

- continuidade M1–M29
- handoff da porta corta-fogo M29 → M30
- nova área `emergency-stairwell`
- streaming real
- safe spawn e checkpoints
- True First Person, PBR e PostEffects
- mapa, primeira descida, telefone e próximo lance
- telemetria `stairwell:*`
- objetivo reload-safe
- áudio procedural
- colisores dedicados
- serialização de diálogo

`npm run check:acceptance` executa M1–M30 em sequência.
