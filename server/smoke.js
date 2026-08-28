const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001'
const playerId = `ci-${Date.now()}`

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options)
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }
  return response
}

await request('/api/health')

await request('/api/save', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    playerId,
    flags: { awake: true, coffee_made: true, left_home: true },
    chapter: 'part-2-road-to-meridian',
    location: {
      part: 'part-2',
      area: 'street',
      checkpoint: 'street-arrival',
      spawn: { x: 0, y: 1.65, z: 2.4, yaw: Math.PI },
    },
    schemaVersion: 2,
    playtimeSeconds: 42,
  }),
})

const saveResponse = await request(`/api/save/${playerId}`)
const save = await saveResponse.json()

if (
  save.playerId !== playerId ||
  save.flags?.coffee_made !== true ||
  save.location?.area !== 'street' ||
  save.location?.checkpoint !== 'street-arrival' ||
  save.schemaVersion !== 2
) {
  throw new Error('Save/location round-trip validation failed')
}

const telemetryResponse = await request('/api/telemetry', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    playerId,
    events: [
      {
        t: 1.25,
        type: 'interact',
        objectId: 'coffee',
        wasFirstTime: true,
      },
    ],
  }),
})
const telemetry = await telemetryResponse.json()

if (telemetry.inserted !== 1) {
  throw new Error('Telemetry insert validation failed')
}
