# M29 — Blackout / Recuperação

## Objetivo

Transformar `blackout / knocked-out` de standby num slice jogável e persistente imediatamente após M28, preservando M1–M28, True First Person, interações cinematográficas, telemetria, streaming por área e serialização de diálogos.

## Fluxo

1. M28 entrega o jogador em `blackout / knocked-out` após a falha elétrica do 37.º.
2. A entrada mantém a tela totalmente preta e posiciona a câmera próxima ao chão em `blackout-unconscious`.
3. Após a recuperação inicial, `blackout_vision_returned` é persistido em `blackout-waking` e o preto total é removido.
4. O jogador volta a poder capturar Pointer Lock, mas ainda não pode caminhar até se levantar.
5. `[E] Apoiar-se e levantar` usa `brace`, grava `blackout_stood_up` e checkpoint `blackout-standing` com altura normal de primeira pessoa.
6. O próximo passo é ativar a luz de emergência, gravando `blackout_emergency_light_on` e `blackout-emergency-light`.
7. Com luz mínima, o jogador testa o painel do elevador; o elevador permanece sem resposta e grava `blackout_elevator_checked` / `blackout-elevator-dead`.
8. A porta corta-fogo só conclui o slice após a verificação do elevador, gravando `blackout_fire_door_reached`, `blackout_recovery_complete` e `blackout-recovered`.
9. O objetivo final fica em `Continue pela rota de emergência.`; a continuação além da porta fica reservada ao próximo milestone.

## Persistência e reload

`BlackoutRecoveryController` restaura o estado visual e o objetivo correto quando a sessão é recarregada em qualquer checkpoint de M29. O estado global `blackout` volta para `false` quando `blackout_vision_returned` já estiver persistido, evitando tela preta permanente após reload.

O `defaultSpawn` de `blackout` passa a ser um spawn seguro próximo ao chão. Depois de levantar, o checkpoint persiste a altura normal de 1,65 m.

## Cena

- corredor de serviço procedural em blackout
- portas do elevador sem energia
- carrinho tombado como consequência visual da queda
- módulo físico de luz de emergência
- painel do elevador interativo
- porta corta-fogo como handoff do próximo slice
- iluminação de emergência vermelha ativada pelo jogador
- neblina e leitura visual limitadas para manter o terror sem assets pesados

## Áudio

`BlackoutAudio` usa somente Web Audio API já existente no projeto:

- subgrave elétrico residual
- ressonância metálica baixa
- gemido estrutural procedural periódico
- mudança do ambiente quando a luz de emergência é ativada

Nenhum arquivo de áudio, codec ou dependência foi adicionado.

## Interações cinematográficas

- levantar: `brace`
- luz de emergência: `press`
- painel do elevador: `press`
- porta corta-fogo: `door / door-handle`

Todas usam o sistema M17 existente.

## Telemetria

Cada interação grava `objectId` no namespace `blackout:*`, mantendo o pipeline existente de telemetria e persistência Mongo. Flags, checkpoint e spawn continuam no mesmo save global.

## Performance

`BlackoutArea` só existe em memória quando `location.area === 'blackout'`. A cena usa geometria simples, materiais padrão, Web Audio e os sistemas de render já carregados. Não há nova dependência nem asset binário.

## Acceptance

`scripts/acceptance-m29.mjs` valida:

- continuidade M1–M28
- handoff M28 `blackout / knocked-out`
- streaming real do blackout
- safe spawn
- True First Person, PlayerController e PostEffects
- recuperação `unconscious → waking`
- reload seguro após retorno da visão
- pointer lock reabilitado depois do preto total
- sequência levantar → luz → elevador → porta corta-fogo
- checkpoints de todas as etapas
- telemetria `blackout:*`
- áudio procedural
- colisores dedicados
- serialização de diálogo

`npm run check:acceptance` executa M1–M29 em sequência.
