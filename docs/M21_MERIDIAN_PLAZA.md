# M21 — Praça Meridian

## Objetivo

Transformar `meridian-plaza` de standby de streaming numa área jogável completa entre o ônibus 214 e a portaria da Meridian Tower, preservando o fluxo narrativo e técnico de M18–M20.

## Fluxo

1. O ônibus entrega o jogador em `plaza-arrival` às 06:30.
2. Se o jogador perder a parada, M20 entrega em `plaza-missed-stop` e M21 apresenta diálogo específico sem quebrar o progresso.
3. A praça mantém chuva, ambiente urbano procedural e continuidade True First Person.
4. O jogador pode observar a fachada, ler o aviso de acesso da Corvus Facilities e entrar na torre.
5. A porta principal grava `plaza_entered_tower` e faz streaming para `lobby / lobby-entry`.

## Cena

- fachada procedural da Meridian Tower com janelas emissivas
- praça molhada com reflexos simples e baixo custo
- postes/bollards e aviso físico de acesso
- chuva e áudio urbano reutilizados do sistema da rua para evitar duplicação de runtime
- iluminação PBR e fog coerentes com o exterior já existente
- colisores AABB dedicados

## Interações

### Fachada

`[E] Observar a fachada`

Registra telemetria `plaza:tower-sign` e a flag `plaza_seen_tower-sign`.

### Aviso de segurança

`[E] Ler aviso`

Abre uma nota persistente no mesmo sistema de M1–M17 com referência ao procedimento Corvus 06-B e ao uso obrigatório do elevador de serviço.

### Entrada

`[E] Entrar na Meridian Tower`

Executa animação de mão `door / door-handle`, grava telemetria e `plaza_entered_tower`, e solicita transição para `lobby-entry`.

## Persistência

- `meridian-plaza` agora possui `defaultSpawn` seguro.
- O checkpoint recebido do ônibus é preservado.
- O primeiro carregamento da praça marca `plaza_arrival_seen` e deixa o save elegível para o pipeline já existente.
- Reload em `plaza-arrival` ou `plaza-missed-stop` continua na área correta sem reexecutar progressão anterior.

## Performance

O milestone não adiciona assets binários nem dependências. A geometria usa primitivas Three.js e reaproveita os sistemas de chuva e áudio procedural já carregados para exteriores.

## Acceptance

`scripts/acceptance-m21.mjs` valida:

- continuidade M1–M20
- streaming real da Praça Meridian
- True First Person, PBR e PostEffects
- chuva/áudio exterior
- interactables principais
- telemetria
- narrativa Corvus
- normal arrival e missed-stop
- checkpoint/default spawn
- transição para o lobby
- colisores dedicados

`npm run check:acceptance` executa M1–M21 em sequência.
