# M25 — 22.º Andar / Primeira Rotina

## Objetivo

Transformar `work-floor-22` de standby numa área jogável e concluir a primeira rotina real de trabalho da Parte 2, preservando M1–M24, True First Person, interações cinematográficas, persistência, telemetria e serialização de diálogos.

## Fluxo

1. M24 entrega o jogador em `work-floor-22 / floor-22-arrival`.
2. O 22.º mantém True First Person, PBR, PostEffects e checkpoint persistente.
3. A ordem de serviço define uma rotina curta: preparar carrinho, limpar o derramamento e esvaziar a lixeira do posto oeste.
4. Preparar o carrinho grava `floor22_cart_ready` e checkpoint `floor-22-routine`.
5. O derramamento e a lixeira só podem ser concluídos com o carrinho preparado.
6. Quando as duas tarefas estão concluídas, grava `floor22_routine_complete`, checkpoint `floor-22-complete` e muda o objetivo para retornar ao elevador.
7. A saída permanece bloqueada até a rotina estar completa.
8. O retorno faz streaming para `service-elevator / elevator-after-floor-22`.
9. O elevador preserva a viagem M24 para o 22.º e, após a conclusão da rotina, libera o 30.º como próximo destino.
10. A viagem para o 30.º usa checkpoints `elevator-ascending-30` e `elevator-floor-30`, terminando em `work-floor-30 / floor-30-arrival`, que continua reservado ao próximo milestone.

## Cena

- escritório/corredor procedural do 22.º andar
- bancos de cubículos e divisórias
- carrinho de limpeza funcional
- ordem de serviço física
- derramamento removível
- lixeira de posto de trabalho
- porta do elevador de serviço
- iluminação fluorescente fria
- colisores AABB dedicados
- ambiente HVAC/ballast sintetizado por Web Audio API

## Interações

### Ordem de serviço

`[E] Ler ordem de serviço`

Registra `floor22_work_order_read` e apresenta a rotina sem alterar o sistema global de notas/diálogo.

### Carrinho

`[E] Preparar carrinho`

Usa `grab`, registra `floor22_cart_ready` e checkpoint `floor-22-routine`.

### Derramamento

`[E] Limpar derramamento`

Exige o carrinho preparado e registra `floor22_spill_cleaned`.

### Lixeira

`[E] Esvaziar lixeira`

Exige o carrinho preparado e registra `floor22_waste_emptied`.

### Retorno ao elevador

`[E] Voltar ao elevador de serviço`

Permanece bloqueado até `floor22_routine_complete`. Depois usa `door / door-handle`, registra `floor22_left_for_elevator` e retorna à cabine.

## Continuidade do elevador

O M24 não é substituído. O botão do 22.º, sua primeira viagem, chegada e saída continuam funcionando. O M25 adiciona um segundo estado apenas depois de `floor22_routine_complete`:

- botão físico do 30.º
- `elevator_ride_to_30_started`
- `elevator-ascending-30`
- `elevator_arrived_30`
- `elevator-floor-30`
- `elevator_left_for_floor_30`

As portas fecham durante a segunda viagem e reabrem na chegada. O áudio mecânico foi generalizado para suportar ambas as viagens sem nova dependência ou asset binário.

## Persistência e telemetria

Todos os flags/checkpoints seguem o pipeline existente de save/Mongo. Reload no 22.º preserva a fase da rotina; reload durante a segunda viagem usa os flags persistentes e o controlador do elevador para completar a chegada. Todas as interações usam os eventos `interact` existentes com prefixos `floor22:` ou `elevator:`.

## Performance

A área só existe em memória quando `location.area === 'work-floor-22'`. Geometria e áudio são gerados em runtime com Three.js/Web Audio já presentes no projeto. Nenhuma dependência, textura, modelo ou áudio externo foi adicionado.

## Acceptance

`scripts/acceptance-m25.mjs` valida:

- continuidade M1–M24
- streaming real do 22.º
- True First Person, PBR e PostEffects
- ordem, carrinho, derramamento, lixeira e elevador
- gating da rotina
- checkpoints `floor-22-routine` e `floor-22-complete`
- telemetria e flags
- retorno ao elevador
- preservação da viagem M24
- liberação e persistência da viagem ao 30.º
- áudio procedural e colisores
- contrato de serialização de diálogo

`npm run check:acceptance` executa M1–M25 em sequência.
