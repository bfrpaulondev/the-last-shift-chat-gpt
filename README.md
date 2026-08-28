# O Último Turno / The Last Shift

Demo técnica 0.1 de um jogo 3D de terror e investigação em primeira pessoa para navegador. A Cena 1 acompanha Bruno Paulon durante os minutos anteriores ao último turno na Meridian Tower.

## Stack

- Node.js 20+
- Vite + React 18 + TypeScript estrito
- Three.js + React Three Fiber + Drei
- Zustand
- Web Audio API
- Express + Mongoose + MongoDB
- Geometria, texturas e áudio gerados em runtime; nenhum asset binário é obrigatório

## Cena 1 completa — M1 a M7

### Renderização e apartamento

- Canvas 3D fullscreen com resolução interna reduzida e upscale pixelado
- apartamento de aproximadamente 7m × 6m com quarto, banheiro, copa/cozinha e corredor
- piso de madeira, reboco, azulejo e teto gerados por `CanvasTexture`
- iluminação fria, banheiro amarelado, fog e cidade noturna
- Torre Meridian procedural visível pela janela
- vinheta radial e grain animado com opacidade aproximada de 0.04

### Player

- WASD relativo à câmera
- caminhada 2.2 m/s e sprint 3.6 m/s
- aceleração e desaceleração suaves
- gravidade sem pulo
- colisão AABB manual separada por eixo
- altura dos olhos 1.65m
- head bob e passos sintetizados
- botão direito do mouse faz inspeção com FOV suavizado de 70° para 35°
- ESC libera o Pointer Lock

### Interação e narrativa

- raycast central com alcance de 2.2m
- prompt contextual `[E]`
- notas fullscreen bloqueiam movimento
- objetivos, legendas e flags em Zustand
- 12 interactables completos: cama, torneira, espelho, chuveiro, papel da geladeira, café, crachá, celular, janela, relógio, quadro e porta de saída
- checklist obrigatório: torneira, café, crachá e celular
- porta só libera depois do checklist
- crachá nº 4471 legível
- relógio de HUD inicia em 05:20 e avança 1 minuto de jogo a cada 10 segundos reais
- tela final com reinício e indicador de save confirmado quando o backend está disponível

### Áudio procedural

- `AudioEngine` singleton com master gain 0.7
- alarme sintetizado na intro
- ambiente urbano em brown noise
- trem distante procedural
- chuva com atenuação pela distância da janela
- ping da torneira a cada 1.6s com sine em torno de 2100Hz, decay, reverb e atenuação espacial
- passos em white noise filtrado
- café procedural com bubbling tonal
- chuveiro em white noise filtrado
- tranca da porta, blip de legenda e som de papel
- `M` alterna mute do master gain

### Intro e final

- tela de título `O ÚLTIMO TURNO / THE LAST SHIFT`
- texto digitado e `[ PRESSIONE ENTER ]`
- alarme de aproximadamente 1.5s e fade para o despertar
- saída da demo corta o áudio
- 3s de silêncio antes da cópia final

### Backend MERN opcional

O jogo funciona integralmente sem backend. Quando Express + MongoDB estão disponíveis:

- `POST /api/save` — upsert por `playerId`
- `GET /api/save/:playerId` — restaura progresso ou retorna 404
- `POST /api/telemetry` — grava eventos em lote em `telemetry_events`
- `GET /api/health` — health check
- UUID do jogador persistido em `localStorage`
- flags restauradas automaticamente
- save automático durante o progresso e no fim da demo
- telemetria enviada a cada 15s e no fim da demo
- eventos permanecem na fila local até um POST bem-sucedido
- falhas de Express/Mongo são silenciosas no frontend

## Executar somente o jogo

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Executar com MongoDB

Suba MongoDB 7:

```bash
docker run -d --name the-last-shift-mongo -p 27017:27017 mongo:7
```

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev
```

Mongo padrão:

```text
mongodb://127.0.0.1:27017/thelastshift
```

Use `MONGO_URI` para apontar para outra instância. O servidor usa a porta `3001` por padrão e o Vite encaminha `/api` para ela.

## Controles

| Controle | Ação |
| --- | --- |
| `Enter` | iniciar a partir da tela de título |
| Mouse | olhar |
| Clique esquerdo | capturar Pointer Lock |
| `WASD` | mover |
| `Shift` | correr |
| `E` | interagir / fechar nota |
| Botão direito | inspeção / zoom 70° → 35° |
| `M` | mutar / desmutar áudio |
| `ESC` | fechar nota / liberar Pointer Lock |

## Build e validação

```bash
npm run check:acceptance
npm run check:server
npm run build
npm run preview
```

O CI executa ainda:

- contrato automatizado da Cena 1
- sintaxe do backend
- health check com Mongo indisponível
- round-trip real de save com MongoDB 7
- inserção real de telemetria
- build TypeScript/Vite
- smoke test do preview de produção

## Estrutura principal

```text
src/
  game/
    api/              persistência e telemetria frontend
    audio/            Web Audio procedural
    data/             contrato dos interactables
    interaction/      raycast e ações
    materials/        CanvasTextures procedurais
    physics/          colisores AABB
    player/           movimento e câmera
    state/            Zustand
    ui/               HUD, título e relógio
server/
  models/             modelos Mongoose
  app.js              API Express
  db.js               MongoDB opcional
  smoke.js            teste de persistência/telemetria
scripts/
  acceptance.mjs      contrato automatizado da Cena 1
```

## Critério de conclusão da demo

O fluxo esperado é: iniciar → levantar → explorar o apartamento → fechar a torneira → tomar café → pegar o crachá → checar o celular → sair pela porta. Espelho, banho, papel da geladeira, janela, relógio e quadro são interações narrativas adicionais. A porta permanece bloqueada até as quatro ações obrigatórias estarem concluídas.

Detalhes específicos do backend: `server/README.md`.
