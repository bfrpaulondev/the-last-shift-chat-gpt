# M28 — 37.º Andar / Última Rotina

## Objetivo

Transformar `floor-37` de standby numa área jogável completa para o fechamento da rota de trabalho, preservando M1–M27, True First Person, interações cinematográficas, persistência, telemetria, streaming por área e serialização de diálogos.

## Fluxo

1. M27 entrega o jogador em `floor-37 / floor-37-arrival` após a viagem persistente do elevador.
2. O 37.º mantém True First Person, PBR, PostEffects e checkpoint persistente.
3. A ordem final Corvus 37-C apresenta a última rotina.
4. O jogador prepara os materiais no carrinho de apoio, gravando `floor37_supplies_ready` e checkpoint `floor-37-routine`.
5. Com os materiais prontos, deve limpar o vidro panorâmico e esvaziar a lixeira executiva.
6. Quando as duas tarefas terminam, `floor37_routine_complete` é gravado junto do checkpoint `floor-37-complete`.
7. O chamado do elevador permanece funcionalmente bloqueado enquanto a rotina não estiver concluída.
8. Depois da conclusão, pressionar o chamado registra `floor37_elevator_called`, dispara a falha elétrica, marca `floor37_blackout_triggered` e grava `floor-37-blackout`.
9. A falha usa o sistema de susto já existente, corta a iluminação/ambiente do 37.º e bloqueia movimento sem criar um novo mecanismo paralelo.
10. O fluxo então faz handoff persistente para `blackout / knocked-out`, área já prevista no contrato da Parte 2.
11. O conteúdo jogável do blackout permanece reservado ao próximo milestone.

## Cena

- 37.º andar procedural, sem assets binários
- setor executivo superior com mobiliário mínimo e vista panorâmica
- ordem final física Corvus Facilities
- carrinho de materiais funcional
- vidro panorâmico com estado visual sujo/limpo
- lixeira executiva com estado visual cheio/vazio
- chamado do elevador físico
- iluminação fria que colapsa quando o blackout é disparado
- colisores dedicados usando o contrato AABB 2D existente
- ambiente elétrico/HVAC procedural por Web Audio API

## Interações

### Ordem final

`[E] Ler ordem final`

Usa `reach`, registra `floor37_final_order_read` e apresenta o Procedimento Corvus 37-C pelo sistema global de notas.

### Carrinho de apoio

`[E] Preparar materiais`

Usa `grab`, registra `floor37_supplies_ready`, grava `floor-37-routine` e libera as duas tarefas finais.

### Vidro panorâmico

`[E] Limpar vidro panorâmico`

Exige materiais preparados, usa `reach` e registra `floor37_window_cleaned`.

### Lixeira executiva

`[E] Esvaziar lixeira`

Exige materiais preparados, usa `grab` e registra `floor37_bin_emptied`.

### Chamado do elevador

`[E] Chamar elevador de serviço`

Antes da conclusão informa apenas as tarefas faltantes. Depois usa `press`, registra o fechamento da rota e dispara o evento de falha elétrica que entrega ao blackout.

## Persistência e telemetria

- `floor-37` mantém o `defaultSpawn` seguro já definido pelo handoff M27.
- `floor37_entry_seen` impede repetição da fala inicial.
- `floor-37-routine` preserva a preparação dos materiais.
- `floor-37-complete` preserva o fechamento da última rotina.
- `floor-37-blackout` preserva o ponto narrativo imediatamente anterior ao handoff.
- `blackout / knocked-out` torna a progressão retomável depois da troca de área.
- eventos `floor37:*` continuam usando o pipeline global de telemetria/Mongo.
- flags e location continuam no save existente.
- interações respeitam `subtitleQueue` e `dismissSubtitle`.

## Performance

A área só existe em memória quando `location.area === 'floor-37'`. Geometria, materiais e áudio usam Three.js e Web Audio já presentes no projeto. Nenhuma dependência, textura, modelo, codec ou asset binário foi adicionado.

## Acceptance

`scripts/acceptance-m28.mjs` valida:

- continuidade M1–M27
- streaming real do 37.º
- True First Person, PBR e PostEffects
- ordem, carrinho, vidro, lixeira e chamado do elevador
- gating materiais → tarefas → conclusão → chamado
- checkpoints `floor-37-routine`, `floor-37-complete` e `floor-37-blackout`
- telemetria e flags
- continuidade elevador → 37.º
- handoff `blackout / knocked-out`
- uso do sistema de susto/blackout existente
- áudio procedural reativo à falha
- colisores dedicados
- serialização de diálogo

`npm run check:acceptance` executa M1–M28 em sequência.
