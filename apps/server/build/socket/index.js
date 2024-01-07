"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = void 0;
const admin_ui_1 = require("@socket.io/admin-ui");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const __1 = require("..");
const client_1 = require("@prisma/client");
class SocketServer {
    constructor() {
        this.io = null;
        this.socket = null;
        this.getSocket = () => {
            return this.socket;
        };
        this.startSocket = (io) => {
            const prisma = new client_1.PrismaClient();
            (0, admin_ui_1.instrument)(io, {
                auth: {
                    type: "basic",
                    username: "admin",
                    password: "$2y$10$.xrNVHREo2Bxm2.xEv97SuTRC/Kx4ebbKZ/rcEHqlRPs/kez1/s4a"
                },
            });
            let messages = [];
            let roomMessages = [];
            function generateRandomNumber() {
                var minm = 100000;
                var maxm = 999999;
                return Math.floor(Math
                    .random() * (maxm - minm + 1)) + minm;
            }
            io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
                this.socket = socket;
                try {
                    if (!jsonwebtoken_1.default.verify(socket.handshake.auth.token, __1.secret)) {
                        socket.disconnect();
                    }
                    const userPayload = jsonwebtoken_1.default.decode(socket.handshake.auth.token, { json: true });
                    if (userPayload) {
                        try {
                            const user = yield prisma.user.findUnique({
                                where: {
                                    id: userPayload._id
                                }
                            });
                            if (user && user.role === '000000000000000000000001') {
                                const allowedBoxesIds = user === null || user === void 0 ? void 0 : user.allowedBoxes;
                                const managedBoxesIds = user === null || user === void 0 ? void 0 : user.managedBoxes;
                                const allowedBoxes = yield prisma.box.findMany({ where: {
                                        id: { in: allowedBoxesIds }
                                    } });
                                const managedBoxes = yield prisma.box.findMany({ where: {
                                        id: { in: managedBoxesIds }
                                    } });
                                for (const allowedBox of allowedBoxes) {
                                    socket.join(`box:allowed:${allowedBox.id}`);
                                    socket.emit('boxAdd', { id: allowedBox.id, name: allowedBox.name, status: allowedBox.lastStatus, pin: allowedBox.lastPIN, managed: false });
                                }
                                for (const managedBox of managedBoxes) {
                                    socket.join(`box:managed:${managedBox.id}`);
                                    socket.emit('boxAdd', { id: managedBox.id, name: managedBox.name, status: managedBox.lastStatus, pin: managedBox.lastPIN, managed: true });
                                }
                            }
                            else {
                                socket.disconnect();
                            }
                        }
                        catch (error) {
                            console.log(error);
                            socket.disconnect();
                        }
                    }
                    else {
                        socket.disconnect();
                    }
                }
                catch (error) {
                    socket.disconnect();
                }
            }));
        };
    }
}
exports.socketServer = new SocketServer();
