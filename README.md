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

### Cena 1 — M4 Apartamento completo

- Planta completa: quarto, banheiro, copa/cozinha e corredor de entrada
- Colisores AABB para paredes internas e móveis principais
- Piso de madeira, reboco, azulejo e teto gerados proceduralmente em Canvas 2D
- Renderização interna reduzida com upscale pixelado
- Iluminação fria da janela, luz amarelada no banheiro e névoa
- Cidade procedural visível da janela
- Torre Meridian no horizonte com janelas emissivas
- 12 interactables completos com textos em PT-BR conforme o briefing
- Fluxo obrigatório de levantar da cama antes de caminhar
- Banho com blackout de 2 segundos
- Janela com movimento de câmera para a Torre Meridian
- Crachá físico nº 4471 e remoção após ser coletado
- Checklist: torneira, café, crachá e celular
- Porta bloqueada enquanto o checklist estiver incompleto
- Objetivo muda automaticamente para sair de casa quando o checklist termina
- Tela final da demo com reinício

### Cena 1 — M5 Áudio + intro

- `AudioEngine` singleton com master gain 0.7
- Tela de título com texto digitado e `[ PRESSIONE ENTER ]`
- Alarme sintetizado de 1.5s ao iniciar
- Fade da tela de título para o gameplay
- Ambiente urbano contínuo em brown noise
- Trem distante procedural em intervalos aleatórios de 25–40s
- Chuva em white noise com highpass e atenuação pela distância da janela
- Ping da torneira a cada 1.6s com sine 2100Hz, decay, reverb procedural e atenuação pela distância
- Passos sintetizados com variação aleatória
- Café de 3s em brown noise + bubbling tonal
- Chuveiro de 4s com white noise e lowpass dinâmico
- Tranca da porta com dois cliques metálicos
- Blip de legenda e som de papel ao abrir notas
- `M` muta/desmuta o master e mostra o estado no HUD
- Saída da demo corta o áudio e mantém 3s de silêncio antes do texto final

Backend de save/telemetria persistente entra no M6.

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

- `Enter`: iniciar na tela de título
- Mouse: olhar
- Clique: capturar ponteiro
- `WASD`: mover
- `Shift`: correr
- `E`: interagir / fechar nota
- `M`: mutar/desmutar áudio
- `ESC`: soltar ponteiro / fechar nota
