import mongoose from 'mongoose'

const saveSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    flags: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    chapter: {
      type: String,
      required: true,
      default: 'scene-1',
    },
    playtimeSeconds: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'saves',
  },
)

export const Save = mongoose.models.Save || mongoose.model('Save', saveSchema)
