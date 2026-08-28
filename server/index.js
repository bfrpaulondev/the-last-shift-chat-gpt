import { app } from './app.js'
import { connectMongo } from './db.js'

const port = Number(process.env.PORT || 3001)

void connectMongo()

app.listen(port, () => undefined)
