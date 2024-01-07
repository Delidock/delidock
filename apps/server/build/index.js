"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.secret = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const socket_1 = require("./socket");
const status_1 = require("./routes/status");
const box_1 = require("./routes/box");
const user_1 = require("./routes/user");
const sign_1 = require("./routes/sign");
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        credentials: true
    }
});
exports.secret = "jP830iVZxa_9OPKOw4EvSsca4r6lpWNnjsRMwvsVAuM";
exports.prisma = new client_1.PrismaClient();
app.set('port', 3000);
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/sign', sign_1.signRouter);
app.use('/user', user_1.userRouter);
app.use('/box', box_1.boxRouter);
app.use('/status', status_1.statusRouter);
httpServer.listen(app.get('port'), () => {
    socket_1.socketServer.startSocket(exports.io);
    console.log("Starting the API on 3000");
});
