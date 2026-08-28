import cors from 'cors'
import express from 'express'
import { connectMongo, isMongoConnected } from './db.js'
import { Save } from './models/Save.js'
import { TelemetryEvent } from './models/TelemetryEvent.js'

const LOCAL_ORIGIN = 'http://localhost:5173'
const MAX_TELEMETRY_BATCH = 500

async function requireMongo(_request, response, next) {
  if (!isMongoConnected()) {
    await connectMongo()
  }

  if (!isMongoConnected()) {
    response.status(503).json({ ok: false })
    return
  }

  next()
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTelemetryEvent(value) {
  return (
    isRecord(value) &&
    typeof value.t === 'number' &&
    Number.isFinite(value.t) &&
    value.t >= 0 &&
    value.type === 'interact' &&
    typeof value.objectId === 'string' &&
    value.objectId.length > 0 &&
    typeof value.wasFirstTime === 'boolean'
  )
}

export const app = express()

app.disable('x-powered-by')
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === LOCAL_ORIGIN) {
        callback(null, true)
        return
      }

      callback(null, false)
    },
  }),
)
app.use(express.json({ limit: '256kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.post('/api/save', requireMongo, async (request, response) => {
  const { playerId, flags, chapter, playtimeSeconds } = request.body ?? {}

  if (
    typeof playerId !== 'string' ||
    playerId.length === 0 ||
    !isRecord(flags) ||
    typeof chapter !== 'string' ||
    chapter.length === 0 ||
    typeof playtimeSeconds !== 'number' ||
    !Number.isFinite(playtimeSeconds) ||
    playtimeSeconds < 0
  ) {
    response.status(400).json({ ok: false })
    return
  }

  try {
    const save = await Save.findOneAndUpdate(
      { playerId },
      {
        $set: {
          flags,
          chapter,
          playtimeSeconds,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).lean()

    response.json({ ok: true, save })
  } catch {
    response.status(503).json({ ok: false })
  }
})

app.get('/api/save/:playerId', requireMongo, async (request, response) => {
  try {
    const save = await Save.findOne({ playerId: request.params.playerId }).lean()

    if (!save) {
      response.status(404).json({ ok: false })
      return
    }

    response.json(save)
  } catch {
    response.status(503).json({ ok: false })
  }
})

app.post('/api/telemetry', requireMongo, async (request, response) => {
  const { playerId, events } = request.body ?? {}

  if (
    typeof playerId !== 'string' ||
    playerId.length === 0 ||
    !Array.isArray(events) ||
    events.length === 0 ||
    events.length > MAX_TELEMETRY_BATCH ||
    !events.every(isTelemetryEvent)
  ) {
    response.status(400).json({ ok: false })
    return
  }

  try {
    await TelemetryEvent.insertMany(
      events.map((event) => ({
        playerId,
        t: event.t,
        type: event.type,
        objectId: event.objectId,
        wasFirstTime: event.wasFirstTime,
      })),
      { ordered: false },
    )

    response.status(201).json({ ok: true, inserted: events.length })
  } catch {
    response.status(503).json({ ok: false })
  }
})
