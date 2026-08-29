# M32 — Parte 3 / Área J — Central de Segurança

## Escopo

Continua M31 a partir da porta escorada do 39.º e implementa a Área J do brief canônico. O slice termina após o `FIREMAN'S OVERRIDE`, antes da descida e do lobby da Área K.

## Fluxo canônico

1. A porta do 39.º faz streaming para `security-center / security-center-entry`.
2. A sala está abandonada no meio da vida: duas cadeiras, uma ainda fora de posição; café quente/fumegando; headset arrancado; cabos de migração no chão; ar-condicionado morto.
3. Nove monitores ocupam a parede. Oito estão mortos; apenas CAM 02 está viva.
4. CAM 02 mostra o lobby e Nascimento imóvel atrás do balcão. O feed marca `23:52:07`, contra `23:47` do pulso. Flags: `operator_gone`, `clock_mismatch`, `cam02_checked`.
5. Segurar E por 700 ms durante o feed registra `cam02_zoomed` e confirma ausência de respiração.
6. Ao fechar o feed, Observação #1 é obrigatória: monitor 7 acende por exatamente 1 s, mostra o vulto da CAM 09 e apaga. Sting procedural, BPM +25, `observed_first`.
7. O override permanece bloqueado até a Observação.
8. `FIREMAN'S OVERRIDE` exige giro de 2 s. O alarme do prédio grita durante os 2 s e morre seco no fim. Flags: `alarm_amp_cut`, `all_doors_released`.
9. Objetivo final: descer ao lobby e encontrar Nascimento. Área K permanece para M33.

## Evidência opcional

- rádio base: apenas chiado, `security_radio_checked`;
- agenda de plantão rasurada, `schedule_scratched`;
- checklist TI com migração incompleta, `migration_incomplete`;
- terminal principal presente mas bloqueado até a futura volta com a caderneta.

## Tecnologia e performance

- área streamed somente quando `location.area === 'security-center'`;
- geometria procedural Three.js/R3F;
- PBR, True First Person, PostEffects e colisores existentes;
- áudio apenas via Web Audio API: CRT, servidor, rangido de cadeira, sting e alarme;
- nenhum asset binário, codec ou dependência nova;
- uma única fonte de luz relevante dos monitores e luzes locais de baixo custo.

## Persistência

Backend, Mongoose e frontend reconhecem `security-center` como `part-3`. Checkpoints:

- `security-center-entry`
- `security-camera-seen`
- `security-observed-first`
- `security-override-released`

Todos os interactables geram telemetria `security:*` pelo pipeline existente.

## Acceptance

`scripts/acceptance-m32.mjs` valida continuidade M1–M31, handoff 39→J, streaming, True FP, cena física, CAM 02, clock mismatch, Observação #1, BPM, override 2 s, alarme global, flags, persistência, opcionais, colisores, áudio procedural e serialização de diálogo.

`npm run check:acceptance` executa M1–M32 em sequência.
