# M31 — Parte 3 / O Despertar — Áreas H e I

## Autoridade canônica

Este milestone realinha a implementação ao brief aprovado **THE LAST SHIFT — PARTE 3 — "O DESPERTAR" / THE AWAKENING**.

O endpoint de M28 (`blackout / knocked-out`) é tratado como a fronteira correta: M28 encerra a Parte 2 e o despertar após o ataque inicia a Parte 3. Os fluxos narrativos genéricos criados em M29/M30 (corredor de blackout, elevador morto, telefone de emergência e descida indefinida) ficam superseded como narrativa ativa. Os sistemas técnicos úteis — streaming, True First Person, M17, checkpoints, Web Audio, telemetria e colisão — são preservados e reaproveitados.

## Escopo

M31 implementa:

- fundação persistente de `part-3`
- Área H — O Despertar / 37.º andar noturno
- INT-09 — bilhete do ShadowByte
- INT-10 — porta/leitor principal do 37.º
- fundação do sistema de BPM/pânico
- relógio de pulso congelado em 23:47
- leitura diegética de BPM no pulso
- Área I — escada de emergência 37 → 38 → 39
- evento automático do leitor verde do 38.º por 1,5 s
- porta do 39.º escorada por extintor
- persistência Mongo/API para `part-3` e `emergency-stairwell`

Área J — Central de Segurança começa no milestone seguinte.

## Área H — 37.º andar / 23:47

A cena reaproveita a leitura espacial do 37.º de M28, mas muda o estado:

- noite/blackout externo
- dois PointLights laranja reais pulsando em sequência de três strobes
- alarmes de incêndio visualmente ativos, sem sirene ambiente
- chuva procedural do lado de fora do vidro
- carrinho de limpeza ausente
- balde deslocado
- uma caneca lavada/invertida, sem diálogo explicativo (`cup_missing`)
- monitor/porta do CEO apagado e trancado (`ceo_door_night`)
- celular em 4% e sem sinal
- bilhete sobre o corpo como primeira interação obrigatória
- porta da copa desloca 15° entre pulsos uma única vez (`breakroom_door_shifted`)

### Despertar

`blackout / knocked-out` inicia com câmera baixa e tela preta. O fade de consciência registra `knocked_out`, converte a continuidade do crachá em `badge_stolen`, preserva `cup_missing`, inicia BPM em 128 e libera a visão antes de qualquer caminhada.

Movimento só é liberado após o bilhete obrigatório.

### Bilhete

A interação usa as duas mãos via ação `brace`, inclui síncope visual de 0,5 s durante a subida do corpo e exibe o texto canônico completo. Registra:

- `note_read`
- `badge_stolen`
- `cup_missing`
- checkpoint `awakening-note-read`

A anotação `Quem entrou duas vezes, só saiu uma` permanece fixada na interface até `log_vision` ser conquistada no Terminal.

### Porta 37

O leitor grava `door37_locked` e mantém a fala canônica:

`Trancada. Do lado de fora. Com o MEU crachá.`

Somente depois desta tentativa a porta do corredor de emergência fica disponível, fazendo streaming para `emergency-stairwell / stairwell-floor-37`.

## Sistema BPM / pânico

`Part3AnxietyController` mantém BPM entre 60–160.

- entrada da Parte 3: 128 BPM
- sprint: +8 BPM/s
- parado: −4 BPM/s
- susto global: +25 BPM
- segurar SPACE por 2 s, sem diálogo/modal/cinematic: −12 BPM
- heartbeat procedural: dois pulsos de 55 Hz
- vinheta pulsa na taxa real do BPM
- acima de 110 BPM há respiração procedural adicional na Área H
- controlar respiração produz expiração procedural

A leitura do BPM não é um número permanente no HUD. Ao olhar para baixo e usar E, a ação de pulso mostra temporariamente um pequeno display 3D junto à mão.

O relógio da Parte 3 permanece visualmente congelado em `23:47`.

## Áudio Área H

100% Web Audio, sem asset binário:

- tinnitus binaural 3997/4003 Hz com fade de 6 s
- chuva filtrada
- três cliques graves sincronizados aos strobes
- respiração em BPM alto
- ausência deliberada de sirene ambiente

## Área I — Escada 37 → 39

O fluxo antigo de descida foi removido da narrativa ativa.

1. entrada no 37.º: `stairwell-floor-37`
2. subir primeiro lance: `stairwell_reached_38` / `stairwell-floor-38`
3. após 420 ms no 38.º, o leitor acende verde sozinho
4. o verde dura exatamente 1,5 s e registra `reader38_green`
5. subir segundo lance: `stairwell_reached_39` / `stairwell-floor-39`
6. porta 39 entreaberta/escorada por extintor: `sc39_open`
7. checkpoint final: `stairwell-floor-39-ready`
8. objetivo final: entrar no 39.º, reservado para Área J/M32

A escada mantém True First Person e usa `brace` para os lances e `door / door-handle` na porta do 39.º.

### Acústica

- impulse/convolver procedural de 2,8 s
- evento global de passo emitido pelo `PlayerController`
- eco do passo deliberadamente atrasado +0,5 s somente enquanto a escada está streamed
- hum/ressonância estrutural procedurais

## Ambiguidade preservada do brief: patamar do 34.º

O brief especifica simultaneamente a rota da Área I como `37 → 39` e um flashback de uma lata no patamar do 34.º. A rota implementada neste milestone não atravessa o 34.º. M31 não inventa uma descida ou teleporte para forçar esse evento. O contrato da lata/`can_34_flashback` fica reservado para uma futura rota canônica que realmente alcance o 34.º, caso o brief posterior a defina.

## Persistência

Frontend, API Express e schema Mongoose reconhecem:

- `part-3`
- `blackout`
- `emergency-stairwell`
- todos os checkpoints de H/I

Isto corrige também a incompatibilidade anterior em que `emergency-stairwell` existia no frontend, mas não estava na enum do backend/Mongoose.

## Performance

- nenhum NPC vivo
- Área H: 2 PointLights de strobe + emissivos
- chuva local com 180 segmentos, somente no 37.º
- geometria procedural e materiais existentes
- nenhuma textura/modelo/áudio binário novo
- nenhum pacote npm novo
- áudio e áreas desmontam ao sair do stream correspondente

## Acceptance

`scripts/acceptance-m31.mjs` valida:

- classificação `part-3`
- persistência frontend/API/Mongo
- BPM/pânico/respiração
- relógio 23:47
- leitura diegética do pulso
- bilhete e fala canônicos
- `note_read`, `badge_stolen`, `cup_missing`, `door37_locked`
- layout/props noturnos e tensão da porta da copa
- tinnitus/chuva/strobes procedurais
- rota 37→38→39
- leitor verde automático
- `sc39_open`
- acústica 2,8 s + eco +0,5 s
- True First Person
- serialização de diálogos
- continuidade M1–M28 e contratos corrigidos M29/M30

`npm run check:acceptance` executa M1–M31 em sequência.
