# Cena 1 — Acceptance Matrix

## Caminho principal

1. A tela inicial mostra `O ÚLTIMO TURNO / THE LAST SHIFT` e aguarda Enter.
2. Enter dispara o alarme e o fade para o apartamento.
3. O jogador começa na cama e só pode andar depois de `[E] Levantar`.
4. A interação com a torneira define `faucet_fixed`.
5. Fazer café define `coffee_made`.
6. Pegar o crachá mostra `CRACHÁ Nº 4471`, define `badge_taken` e remove o objeto físico.
7. Checar o celular define `phone_checked`.
8. Antes das quatro flags, a porta responde `Primeiro: torneira, café, crachá, celular.`.
9. Com as quatro flags, o objetivo muda para `Sair de casa — pegar o ônibus das 06:05.` e a tranca toca.
10. `[E] Sair` encerra a demo e exibe a tela final após o período de silêncio.

## Interações narrativas adicionais

- espelho abre a nota `VOCÊ`
- banho executa blackout e áudio de chuveiro
- papel da geladeira abre `ESCOLA TÉCNICA — NOTIFICAÇÃO`
- janela direciona a câmera para a Meridian Tower
- relógio reproduz a fala de 05:31
- quadro abre a nota `QUADRO`

## Controles e polish

- WASD move relativo à câmera
- Shift altera caminhada 2.2 m/s para sprint 3.6 m/s
- colisão usa AABB manual por eixo
- RMB interpola FOV 70° → 35° e retorna a 70° ao soltar
- M alterna mute e HUD indica `SOM`/`MUDO`
- ESC libera Pointer Lock e fecha notas quando aplicável
- relógio HUD inicia em 05:20 e avança um minuto a cada 10 segundos reais
- vinheta e grain ficam abaixo das notas e da tela final

## Áudio

- passos variam pitch/volume
- torneira pinga em ciclo e reduz com distância
- chuva reduz com distância da janela
- café, chuveiro, tranca, alarme, papel e blip são sintetizados
- ambiente urbano e trem distante são procedurais

## Persistência

- sem Express/Mongo, o jogo continua jogável
- `/api/health` continua respondendo com Mongo indisponível
- com Mongo, save faz round-trip por `playerId`
- telemetria é inserida em lote
- UUID persiste em localStorage
- frontend só limpa eventos após POST bem-sucedido
- tela final mostra `Progresso salvo ✓` apenas após confirmação

## Gate automatizado

O workflow de CI bloqueia merge se falhar qualquer um destes gates:

- `npm run check:acceptance`
- `npm run check:server`
- backend offline health smoke
- MongoDB 7 save/telemetry smoke
- `npm run build`
- production preview smoke
