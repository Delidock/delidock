import express from 'express'
import http from 'http'
import{ Server } from 'socket.io'
import cors from 'cors'
import bodyParser from 'body-parser'
import { startSocket } from './socket'

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, { cors: { origin: '*', credentials: true }})

export let secret = "jP830iVZxa_9OPKOw4EvSsca4r6lpWNnjsRMwvsVAuM"

app.set('port', 3000)

app.use(bodyParser.json())
app.use(cors())

import {signRouter} from "./routes/sign";
app.use('/sign', signRouter)

import {userRouter} from './routes/user'
app.use('/user', userRouter)

import { boxRouter } from './routes/box'
app.use('/box', boxRouter)

import { statusRouter } from "./routes/status";
app.use('/status', statusRouter)

httpServer.listen(app.get('port'), () => {
    startSocket(io)
    console.log("Starting the API on 3000");
})