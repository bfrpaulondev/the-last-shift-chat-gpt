# M22 — Portaria / Lobby Meridian

## Objetivo

Transformar `lobby` de standby de streaming numa área jogável completa entre a Praça Meridian e o vestiário B1, preservando a continuidade técnica e narrativa de M18–M21.

## Fluxo

1. A entrada da praça entrega o jogador em `lobby / lobby-entry`.
2. O lobby mantém True First Person, PBR, PostEffects e checkpoint persistente.
3. A portaria exige o crachá nº 4471, já obtido na Parte 1.
4. O leitor valida `badge_taken`, grava `lobby_badge_verified` e cria o checkpoint `lobby-badge-verified`.
5. O diretório reforça o Procedimento Corvus 06-B e indica o vestiário B1 antes do elevador de serviço.
6. A porta para B1 permanece bloqueada até a validação do crachá.
7. Com acesso liberado, a porta grava `lobby_left_for_b1` e faz streaming para `locker-b1 / locker-entry`.

## Cena

- lobby procedural sem assets binários
- piso polido, paredes e teto PBR de baixo custo
- balcão de portaria com leitor de crachá
- diretório de serviço físico
- bancos de espera e corredor controlado para B1
- iluminação fria de edifício corporativo
- colisores AABB dedicados
- ambiente HVAC procedural por Web Audio API

## Interações

### Portaria

`[E] Falar na portaria`

Orienta o jogador a usar o leitor. Depois da validação, reforça o destino B1 e o elevador de serviço.

### Leitor de crachá

`[E] Apresentar crachá`

Usa a animação cinematográfica de cartão, exige `badge_taken`, registra telemetria `lobby:badge-reader`, marca `lobby_badge_verified` e grava checkpoint persistente.

### Diretório

`[E] Consultar diretório`

Abre nota persistente com B1, portaria, andares técnicos e referência ao Procedimento Corvus 06-B.

### Porta B1

`[E] Ir para o vestiário B1`

Sem validação, permanece trancada. Após o crachá, usa `door / door-handle` e solicita transição para `locker-b1 / locker-entry`.

## Persistência

- `lobby` passa a possuir `defaultSpawn` seguro.
- `lobby_entry_seen` evita repetir a fala de chegada após reload.
- `lobby-badge-verified` preserva o progresso após a validação do crachá.
- O pipeline de save/telemetria existente continua responsável por MongoDB e fila local.

## Performance

Nenhuma dependência ou asset binário foi adicionado. Toda a geometria usa primitivas Three.js e o ambiente sonoro é sintetizado em runtime. A área é carregada somente quando `location.area === 'lobby'`.

## Acceptance

`scripts/acceptance-m22.mjs` valida:

- continuidade M1–M21
- streaming real do lobby
- True First Person, PBR e PostEffects
- áudio procedural
- portaria, leitor, diretório e porta B1
- requisito do crachá nº 4471
- telemetria e flags
- checkpoint de chegada e pós-validação
- transição para `locker-b1`
- colisores dedicados

`npm run check:acceptance` executa M1–M22 em sequência.
