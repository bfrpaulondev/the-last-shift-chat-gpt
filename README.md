# O Último Turno / The Last Shift

Jogo 3D de terror/investigação em primeira pessoa para navegador, desenvolvido com React, TypeScript, Three.js e React Three Fiber.

## Estado atual

### Cena 1 — M1 Skeleton

- Vite + React 18 + TypeScript estrito
- React Three Fiber + Three.js
- Canvas 3D fullscreen
- Ambiente inicial do apartamento em escala aproximada de 7m × 6m
- Piso e paredes base
- Iluminação inicial
- Pointer Lock: clique para capturar o mouse e `ESC` para soltar

### Cena 1 — M2 Player

- Movimento WASD relativo à câmera
- Velocidade de caminhada: 2.2 m/s
- Sprint com Shift: 3.6 m/s
- Aceleração e desaceleração suaves
- Gravidade simples com chão em y=0 e sem pulo
- Colisão manual AABB resolvida separadamente nos eixos X/Z
- Raio do jogador: 0.3m
- Altura dos olhos: 1.65m
- Head bob com frequência distinta para caminhada e corrida
- Passos sintetizados em runtime com Web Audio API
- Áudio inicializado somente após interação do usuário
- Movimento interrompido ao liberar o Pointer Lock

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

## Controles disponíveis

- Mouse: olhar ao redor
- Clique: capturar o ponteiro
- `W`, `A`, `S`, `D`: mover
- `Shift`: correr
- `ESC`: liberar o ponteiro

Interação, HUD, objetos, zoom, mute, ambiente completo e backend entram nos próximos milestones.
