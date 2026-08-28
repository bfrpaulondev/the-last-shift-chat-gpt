import mongoose from 'mongoose'

const telemetryEventSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    t: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ['interact'],
    },
    objectId: {
      type: String,
      required: true,
      trim: true,
    },
    wasFirstTime: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: 'telemetry_events',
  },
)

export const TelemetryEvent =
  mongoose.models.TelemetryEvent || mongoose.model('TelemetryEvent', telemetryEventSchema)
