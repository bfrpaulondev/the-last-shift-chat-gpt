# M32 — Parte 3 / Área J — Central de Segurança

## Escopo

Continua M31 a partir da porta escorada do 39.º e implementa a Área J do brief canônico. O slice termina após o `FIREMAN'S OVERRIDE`, antes da descida e do lobby da Área K.

## Fluxo canônico

1. A porta do 39.º faz streaming para `security-center / security-center-entry`.
2. A sala está abandonada no meio da vida: duas cadeiras, uma ainda girando devagar; café quente/fumegando; headset arrancado; cabos de migração no chão; ar-condicionado morto.
3. Nove monitores ocupam a parede. Oito começam mortos; apenas CAM 02 está viva.
4. CAM 02 é um RenderTarget real e mostra o lobby com Nascimento imóvel atrás do balcão, o rádio ao lado da mão e a caderneta aberta. O feed marca `23:52:07`, contra `23:47` do pulso. Flags: `operator_gone`, `clock_mismatch`, `cam02_checked`.
5. Segurar E no feed ativa zoom digital e registra `cam02_zoomed_nascimento`, confirmando movimento respiratório zero. Toque curto em E ou ESC fecha a consulta.
6. Ao fechar o feed, Observação #1 é obrigatória: o monitor 7 acende com CAM 09 e mostra o vulto por exatamente 1 s, corta para estático e apaga. Sting procedural, BPM +25, `observed_first`.
7. O override permanece bloqueado até CAM 02 e Observação #1 terem sido concluídas.
8. `FIREMAN'S OVERRIDE` exige E mantido por 2 s reais. Soltar cedo cancela o giro e corta a sirene imediatamente. Ao completar, o alarme do prédio grita durante os 2 s e morre seco no fim; o painel revela `AUDIO AMP: DISCONNECTED — MANUAL CUT`. Flags: `alarm_amp_cut`, `all_doors_released`.
9. Objetivo final: descer ao lobby e encontrar Nascimento. Área K permanece para M33.

## Evidência opcional

- rádio base: apenas chiado procedural, `security_radio_checked`;
- agenda de plantão rasurada, `schedule_scratched`;
- checklist TI com migração incompleta, `migration_incomplete`;
- terminal principal presente mas bloqueado até a futura volta com a caderneta;
- corredor externo pode ser verificado depois da Observação e permanece vazio.

## Tecnologia e performance

- área streamed somente quando `location.area === 'security-center'`;
- geometria procedural Three.js/R3F;
- CAM 02 usa FBO de 512×288, atualizando a 30 fps somente durante consulta e 12 fps em repouso;
- PBR, True First Person, PostEffects e colisores existentes;
- áudio apenas via Web Audio API: CRT, servidor, rangido de cadeira, rádio, sting e alarme;
- nenhum asset binário, codec ou dependência nova;
- oito monitores mortos não possuem RenderTargets próprios; apenas CAM 02 renderiza mundo secundário.

## Persistência

Backend, Mongoose e frontend reconhecem `security-center` como `part-3`. Checkpoints usados pelo slice:

- `security-center-entry`
- `security-camera-seen`
- `security-cam02-reviewed`
- `security-observation-seen`
- `security-override-released`

Todos os interactables geram telemetria `security:*` pelo pipeline existente.

## Acceptance

`scripts/acceptance-m32.mjs` valida continuidade M1–M31, handoff 39→J, streaming, True FP, cena física, RenderTarget CAM 02, clock mismatch, zoom, Observação #1 com duração de 1 s, BPM, hold/cancel do override, sirene de 2 s, flags, persistência, opcionais, colisores, áudio procedural e serialização de diálogo.

`npm run check:acceptance` executa M1–M32 em sequência.
