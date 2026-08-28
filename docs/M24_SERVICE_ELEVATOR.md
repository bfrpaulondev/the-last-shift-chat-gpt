# M24 — Elevador de Serviço

## Objetivo

Transformar `service-elevator` de standby de streaming numa área jogável entre o vestiário B1 e o 22.º andar, preservando M1–M23, a serialização de diálogos e a rota já definida da Parte 2.

## Fluxo

1. M23 entrega o jogador em `service-elevator / elevator-cabin`.
2. A cabine mantém True First Person, PBR, PostEffects e checkpoint persistente.
3. O painel expõe o 22.º andar como primeiro destino da rota confirmada no B1.
4. O botão exige `locker_uniform_on` e `locker_route_confirmed` antes de iniciar a viagem.
5. O início marca `elevator_ride_started` e checkpoint `elevator-ascending`.
6. A viagem é concluída por um controlador persistente; reload durante a subida retoma a progressão em vez de saltar ou reiniciar a Parte 2.
7. A chegada marca `elevator_arrived_22`, toca campainha procedural, abre visualmente as portas e grava checkpoint `elevator-floor-22`.
8. A saída só libera após a chegada, marca `elevator_left_for_floor_22` e faz streaming para `work-floor-22 / floor-22-arrival`.

## Cena

- cabine de serviço procedural, sem assets binários
- aço escovado e piso técnico PBR de baixo custo
- painel físico com botão do 22.º andar
- indicador emissivo de viagem/chegada
- aviso operacional Corvus Facilities
- portas com estado visual fechado/aberto
- iluminação fria de cabine
- colisores AABB dedicados

## Interações

### Botão do 22.º andar

`[E] Selecionar 22.º andar`

Usa a ação cinematográfica M17 `press`, valida uniforme + rota, registra telemetria `elevator:floor-22-button` e inicia a viagem somente uma vez.

### Aviso do elevador

`[E] Ler aviso do elevador`

Abre nota persistente com a rota 22.º → 30.º → refeitório → 37.º e instrução de emergência.

### Portas

`[E] Sair no 22.º andar`

Antes da chegada, permanecem bloqueadas. Depois do checkpoint de chegada, usam a interação `door / door-handle` existente e transitam para `work-floor-22 / floor-22-arrival`.

## Persistência

- `service-elevator` possui `defaultSpawn` seguro.
- `elevator_entry_seen` impede repetição da fala inicial.
- `elevator-ascending` representa viagem iniciada.
- `elevator-floor-22` representa chegada confirmada.
- o controlador de viagem conclui corretamente após reload quando `elevator_ride_started` já existe e `elevator_arrived_22` ainda não.
- flags, location e telemetria continuam no pipeline existente de save/Mongo.

## Áudio e performance

O ambiente usa Web Audio API: hum elétrico contínuo, motor sintetizado durante a subida e campainha procedural na chegada. Nenhum asset, codec, pacote ou dependência nova foi adicionado. A cabine só existe em memória quando `location.area === 'service-elevator'`.

## Acceptance

`scripts/acceptance-m24.mjs` valida:

- continuidade M1–M23
- streaming real do elevador
- True First Person, PBR e PostEffects
- painel, aviso e portas
- requisito uniforme + rota
- checkpoint de subida e chegada
- retomada persistente da viagem
- telemetria e flags
- transição exclusivamente para o 22.º andar
- áudio procedural
- colisores dedicados

`npm run check:acceptance` executa M1–M24 em sequência.
