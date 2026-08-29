import mongoose from 'mongoose'

const spawnSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
    yaw: { type: Number, required: true },
  },
  { _id: false },
)

const locationSchema = new mongoose.Schema(
  {
    part: { type: String, required: true, enum: ['part-1', 'part-2', 'part-3', 'part-4'] },
    area: {
      type: String,
      required: true,
      enum: [
        'apartment',
        'street',
        'bus-214',
        'meridian-plaza',
        'lobby',
        'locker-b1',
        'service-elevator',
        'work-floor-22',
        'work-floor-30',
        'cafeteria',
        'floor-37',
        'blackout',
        'emergency-stairwell',
        'security-center',
        'descent-lobby',
        'basement',
        'part4-terminal',
      ],
    },
    checkpoint: { type: String, required: true, trim: true },
    spawn: { type: spawnSchema, required: false },
  },
  { _id: false },
)

const shiftTimeSchema = new mongoose.Schema(
  {
    worldMinute: { type: Number, required: true, min: 0 },
    lastRoutineMinute: { type: Number, required: false, min: 0, default: null },
  },
  { _id: false },
)

const saveSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true, index: true, trim: true },
    flags: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
    chapter: { type: String, required: true, default: 'part-1-apartment' },
    location: { type: locationSchema, required: false },
    shiftTime: { type: shiftTimeSchema, required: false },
    phoneBattery: { type: Number, required: false, min: 0, max: 100, default: 3 },
    schemaVersion: { type: Number, required: true, min: 1, default: 1 },
    playtimeSeconds: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'saves',
  },
)

export const Save = mongoose.models.Save || mongoose.model('Save', saveSchema)
