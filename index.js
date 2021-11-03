import express from 'express'
import {statsRouter} from './routers/statsRouter.js'
const app = express()

app.use(express.json())
app.use('/stats', statsRouter)

async function start() {
    app.listen(3000,()=> console.log('Server is running...'))
}

start()