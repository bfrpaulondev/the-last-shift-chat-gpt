# Backend — Cena 1

O backend do M6 usa Express em JavaScript ESM e Mongoose. O jogo continua totalmente jogável se este servidor ou o MongoDB estiverem indisponíveis.

## MongoDB local

Suba MongoDB 7 com Docker:

```bash
docker run -d --name the-last-shift-mongo -p 27017:27017 mongo:7
```

Por padrão o servidor usa:

```text
mongodb://127.0.0.1:27017/thelastshift
```

Para usar outra instância, defina `MONGO_URI` no ambiente antes de iniciar o servidor.

## Executar

Terminal 1:

```bash
npm install
npm run dev:server
```

Terminal 2:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:3001`

O Vite encaminha `/api/*` para o Express durante o desenvolvimento.

## Rotas

- `GET /api/health` → `{ "ok": true }`
- `POST /api/save` → upsert do progresso por `playerId`
- `GET /api/save/:playerId` → recupera o progresso ou retorna 404
- `POST /api/telemetry` → grava um lote de eventos na collection `telemetry_events`

## Teste rápido

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:

```json
{"ok":true}
```

Se o MongoDB estiver desligado, `/api/health` continua respondendo, enquanto rotas que precisam de persistência retornam 503. O frontend ignora essas falhas silenciosamente e mantém o jogo funcionando.
