# M26 — 30.º Andar / Segunda Rotina

## Objetivo

Transformar `work-floor-30` de standby numa área jogável e concluir a segunda rotina de trabalho da Parte 2, preservando M1–M25, True First Person, interações cinematográficas, persistência, telemetria, streaming por área e serialização de diálogos.

## Fluxo

1. M25 entrega o jogador em `work-floor-30 / floor-30-arrival`.
2. O 30.º mantém True First Person, PBR, PostEffects e checkpoint persistente.
3. A folha de serviço define duas tarefas no setor executivo: repor a estação de materiais e limpar a divisória de vidro da sala de reunião.
4. A reposição grava `floor30_station_restocked` e checkpoint `floor-30-routine`.
5. A limpeza do vidro exige a estação reposta.
6. Quando as duas tarefas estão concluídas, grava `floor30_routine_complete`, checkpoint `floor-30-complete` e muda o objetivo para retornar ao elevador.
7. A saída permanece bloqueada até a rotina estar completa.
8. O retorno faz streaming para `service-elevator / elevator-after-floor-30`.
9. O refeitório permanece reservado ao próximo milestone, evitando antecipar conteúdo narrativo ou criar uma transição incompleta.

## Cena

- setor executivo procedural do 30.º andar
- mesas e sala de reunião
- divisória de vidro com estado visual sujo/limpo
- estação de materiais com estado visual vazio/reposta
- folha de serviço física
- porta de retorno ao elevador
- iluminação fluorescente fria
- colisores dedicados no mesmo contrato 2D usado pelo PlayerController existente
- ambiente HVAC/ballast sintetizado por Web Audio API

## Interações

### Folha de serviço

`[E] Ler folha de serviço`

Registra `floor30_service_sheet_read` e apresenta a rotina usando o sistema global de notas, sem criar uma fila paralela de diálogo.

### Estação de materiais

`[E] Repor estação de materiais`

Usa `grab`, registra `floor30_station_restocked` e checkpoint `floor-30-routine`.

### Divisória de vidro

`[E] Limpar divisória de vidro`

Exige a reposição da estação, usa a ação cinematográfica `reach` e registra `floor30_glass_cleaned`.

### Retorno ao elevador

`[E] Voltar ao elevador de serviço`

Permanece bloqueado até `floor30_routine_complete`. Depois usa `door / door-handle`, registra `floor30_left_for_elevator` e retorna à cabine em `elevator-after-floor-30`.

## Persistência e telemetria

- `work-floor-30` possui `defaultSpawn` seguro.
- `floor30_entry_seen` impede repetição da fala inicial.
- `floor-30-routine` preserva a fase intermediária.
- `floor-30-complete` preserva conclusão e objetivo após reload.
- flags, location e eventos `floor30:*` continuam no pipeline existente de save/Mongo.
- o sistema respeita `subtitleQueue` e `dismissSubtitle`, preservando a serialização de diálogo existente.

## Performance

A área só existe em memória quando `location.area === 'work-floor-30'`. Geometria e áudio usam apenas Three.js e Web Audio já presentes no projeto. Nenhuma dependência, modelo, textura, codec ou asset binário foi adicionado.

## Acceptance

`scripts/acceptance-m26.mjs` valida:

- continuidade M1–M25
- streaming real do 30.º
- True First Person, PBR e PostEffects
- folha de serviço, estação, vidro e retorno ao elevador
- gating da rotina
- checkpoints `floor-30-routine` e `floor-30-complete`
- telemetria e flags
- continuidade da chegada pelo elevador já implementada no M25
- retorno seguro a `elevator-after-floor-30`
- áudio procedural
- contrato de colisão existente
- serialização de diálogo

`npm run check:acceptance` executa M1–M26 em sequência.
