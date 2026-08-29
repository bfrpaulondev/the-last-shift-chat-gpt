# M33 — Parte 3 / Área K — A Descida e o Lobby

## Escopo

Continua M32 após o `FIREMAN'S OVERRIDE` e implementa a Área K do brief canônico: descida física do 39.º ao térreo, lobby noturno, última conversa com Nascimento, transferência da caderneta, primeiro contato funcional do ShadowByte e retorno sozinho ao 39.º pelo elevador de serviço.

O slice termina em `security-center / security-center-return`, com a caderneta em posse de Bruno e o terminal principal reservado para M34 / Área L.

## Descida 39 → térreo

- o jogador sai da Central de Segurança pelo corredor já existente depois de `all_doors_released`;
- a descida é feita a pé, sem cronômetro que salte ou acelere andares;
- um único módulo de escada é reciclado por streaming para preservar performance;
- lances consecutivos alternam 180°, de modo que o fim físico de um lance coincide com o início do seguinte, sem salto de câmera;
- a altura do jogador acompanha a inclinação real via `PlayerController.groundHeight`, opcional e neutro para M1–M32;
- colisores espelham a barreira traseira conforme a direção do lance;
- checkpoints persistentes são gravados periodicamente ao longo dos 39 pisos;
- sprint continua usando o BPM da Parte 3 e adiciona respiração procedural cuja intensidade cresce com o BPM.

## Lobby noturno

O lobby é uma cena própria da Parte 3, sem alterar a portaria diurna de M22:

- mármore molhado/polido refletindo strobes laranja;
- chuva procedural pesada do lado de fora das portas de vidro;
- televisor mudo mantendo a notícia da manhã sobre a reunião anual da Corvus no dia seguinte;
- Nascimento sentado atrás do balcão, com rádio à direita e caderneta aberta no colo;
- câmera do lobby visível com LED vermelho capaz de piscar uma única vez durante a cena.

## Nascimento

A interação inicial aplica BPM +15 e inicia diálogo serializado por SPACE, preservando o pipeline de legendas existente.

1. `Ele... já tava dentro, Bruno... desde antes... ninguém viu porque ninguém... anota...`
   - Nascimento empurra a caderneta para a frente.
2. `Eu anotei... trinta anos... eu anotei TUDO... computador é bom... mas só se alguém... escrever a verdade nele...`
   - a mão alcança/prende o pulso de Bruno e o True First Person reage.
3. `Você não fez nada de errado, menino. Os registros vão provar... se você souber... ler.`
   - Nascimento olha para a câmera atrás de Bruno;
   - o LED vermelho pisca uma vez;
   - Nascimento morre olhando para a câmera.

Após a última fala, `nascimento_dead` é persistido e todos os buses sonoros desta área, incluindo heartbeat da Parte 3, entram em silêncio por 4 segundos. A chuva regressa gradualmente durante os 2 segundos seguintes.

## INT-12 — Caderneta

Depois do silêncio:

- objetivo passa a pedir a caderneta;
- mão direita de Bruno alcança o objeto;
- a mão de Nascimento ainda está sobre a capa;
- cinco dedos cedem sequencialmente durante a transferência;
- `notebook_taken` e checkpoint `night-lobby-notebook-taken` são persistidos;
- `closed_eyes` permanece opcional: nova interação em Nascimento fecha os olhos com gesto de mão, sem diálogo adicional.

## ShadowByte

A transferência da caderneta ativa o único rádio funcional do lobby e registra `shadowbyte_contact_1`.

Mensagem:

`Sinto muito pelo seu amigo. Ele era de um tempo melhor. Faz o favor de devolver minha caderneta depois. Preciso dela. — ShadowByte`

Fecho de Bruno:

`Tudo aqui dentro pode ser reescrito. Menos isso.`

A textura sonora do ShadowByte é gerada por Web Audio API com band-pass e WaveShaper/distortion, mantendo o tratamento comprimido/distorcido sem asset de áudio novo.

## Saída opcional

As portas de vidro podem ser testadas:

`MODO RESTRITO — ACESSO EXTERNO BLOQUEADO — CENTRAL DE MONITORAMENTO NOTIFICADA`

Bruno:

`Trancados juntos, então. Ele e eu.`

Flag: `exit_locked`.

## Elevador de retorno

Depois de concluir o contato pelo rádio:

- o cabo do elevador é ouvido por 2 s antes da abertura;
- elevador chega iluminado, vazio e sozinho: `elevator_alone`;
- Bruno entra e sobe ao 39.º;
- indicador passa por T, 7, 13, pausa 0,5 s no 13.º, depois 21, 30 e 39;
- não há comentário de Bruno sobre a pausa;
- `elevator_pause_13` e `elevator_returned_39` são persistidos;
- após o ding do 39.º ocorre streaming para `security-center / security-center-return`.

O terminal principal não é implementado neste slice; ao retorno ele deixa de mostrar o bloqueio pré-caderneta e fica reservado para a Área L.

## Tecnologia e performance

- nenhuma dependência npm nova;
- nenhuma textura/áudio binário novo;
- chuva, rádio, respiração, elevador e ambience via Three.js/Web Audio API;
- geometria de 39 pisos não existe simultaneamente: apenas um lance streamed é mantido em memória;
- lobby noturno é carregado apenas quando a descida termina;
- M22 permanece intacto;
- True First Person, CameraPolish e PostEffects são reutilizados;
- `PlayerController.groundHeight` é opt-in, portanto áreas anteriores mantêm piso zero e comportamento anterior.

## Persistência

Frontend, API e Mongoose reconhecem `descent-lobby` como `part-3`.

Checkpoints relevantes:

- `descent-floor-39`
- checkpoints periódicos `descent-floor-*`
- `night-lobby-entry`
- `night-lobby-nascimento`
- `night-lobby-loss`
- `night-lobby-notebook-taken`
- `night-lobby-elevator-ready`
- `elevator-return`
- `security-center-return`

## Acceptance

`scripts/acceptance-m33.mjs` valida M32→M33, streaming, escada física 39→térreo sem salto de câmera ou progressão temporizada, checkpoints, respiração/sprint/BPM, composição do lobby, diálogo canônico, performance física de Nascimento, silêncio de 4 s, INT-12, ShadowByte, saída restrita, elevador, pausa do 13.º, retorno ao 39.º, persistência e serialização de diálogo.

`npm run check:acceptance` executa M1–M33 em sequência.
