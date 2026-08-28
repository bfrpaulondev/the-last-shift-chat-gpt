# M23 — Vestiário B1

## Objetivo

Transformar `locker-b1` de standby de streaming numa área jogável entre a portaria e o elevador de serviço, preservando M1–M22 e o fluxo já definido da Parte 2.

## Fluxo

1. M22 entrega o jogador em `locker-b1 / locker-entry`.
2. O B1 mantém True First Person, PBR, PostEffects e checkpoint persistente.
3. O jogador deve vestir o uniforme no armário de funcionário.
4. O quadro de rota confirma a sequência já definida para o turno: 22.º, 30.º, refeitório e 37.º andar.
5. A confirmação da rota grava `locker_route_confirmed` e checkpoint `locker-ready`.
6. A porta do elevador de serviço só libera depois de `locker_uniform_on` e `locker_route_confirmed`.
7. A saída grava `locker_left_for_elevator` e faz streaming para `service-elevator / elevator-cabin`.

## Cena

- vestiário B1 procedural, sem assets binários
- bancos e fileiras de armários metálicos
- armário funcional do jogador
- quadro físico de rota
- acesso controlado ao elevador de serviço
- iluminação fluorescente fria
- colisores AABB dedicados
- ambiente elétrico/HVAC procedural por Web Audio API

## Interações

### Armário

`[E] Vestir uniforme`

Usa `grab`, marca `locker_uniform_on` e mantém o sistema cinematográfico M17 intacto.

### Quadro de rota

`[E] Confirmar rota`

Abre nota persistente com a sequência 22.º → 30.º → refeitório → 37.º e registra `locker_route_confirmed`.

### Saída

`[E] Ir para o elevador de serviço`

Permanece bloqueada até uniforme e rota estarem concluídos. Depois usa `door / door-handle` e transita para `service-elevator / elevator-cabin`.

## Persistência

- `locker-b1` possui `defaultSpawn` seguro.
- `locker_entry_seen` impede repetição da fala inicial.
- `locker-ready` preserva a conclusão do preparo após reload.
- flags, location e telemetria continuam no pipeline existente de save/Mongo.

## Performance

Nenhuma dependência foi adicionada. A geometria usa primitivas Three.js e o áudio é sintetizado em runtime. A área existe em memória apenas quando `location.area === 'locker-b1'`.

## Acceptance

`scripts/acceptance-m23.mjs` valida:

- continuidade M1–M22
- streaming real do B1
- True First Person, PBR e PostEffects
- armário, quadro e porta do elevador
- requisito conjunto uniforme + rota
- checkpoint `locker-ready`
- telemetria e flags
- transição para `service-elevator`
- áudio procedural
- colisores dedicados

`npm run check:acceptance` executa M1–M23 em sequência.
