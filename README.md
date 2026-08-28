# O Último Turno / The Last Shift

Jogo 3D de terror/investigação em primeira pessoa para navegador, desenvolvido com React, TypeScript, Three.js e React Three Fiber.

## Estado atual

### Cena 1 — M1 Skeleton

- Vite + React 18 + TypeScript estrito
- React Three Fiber + Three.js
- Canvas 3D fullscreen
- Ambiente inicial do apartamento em escala aproximada de 7m × 6m
- Pointer Lock

### Cena 1 — M2 Player

- Movimento WASD relativo à câmera
- Caminhada 2.2 m/s e sprint 3.6 m/s
- Aceleração/desaceleração suaves
- Gravidade simples sem pulo
- Colisão AABB manual por eixo
- Head bob
- Passos sintetizados via Web Audio API

### Cena 1 — M3 Interação

- Zustand para flags, objetivo, legendas, notas, prompt e telemetria
- Raycast central com alcance de 2.2m
- Prompt contextual `[E]`
- Interações acionadas pela tecla E
- Legendas temporizadas
- Notas fullscreen que bloqueiam movimento
- Objetivo no HUD
- Telemetria local de interações com `wasFirstTime`
- Objetos de prova do sistema: cama, relógio e quadro

A geometria final e os 12 interactables completos entram no M4.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Controles

- Mouse: olhar
- Clique: capturar ponteiro
- `WASD`: mover
- `Shift`: correr
- `E`: interagir / fechar nota
- `ESC`: soltar ponteiro / fechar nota
