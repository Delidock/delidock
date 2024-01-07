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
exports.boxRouter = void 0;
const express_1 = __importDefault(require("express"));
const livekit_server_sdk_1 = require("livekit-server-sdk");
const auth_1 = require("../auth");
const passport_1 = __importDefault(require("passport"));
const __1 = require("..");
exports.boxRouter = express_1.default.Router();
(0, auth_1.userPassportController)(passport_1.default);
const createToken = (room, user) => {
    const roomName = `room:${room}`;
    const participantName = user;
    const at = new livekit_server_sdk_1.AccessToken('devkey', 'secret', {
        identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });
    return at.toJwt();
};
exports.boxRouter.get('/:box/unlock', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user) {
        const user = req.user;
        const boxes = user.allowedBoxes.concat(user.managedBoxes);
        if (boxes.includes(req.params.box)) {
            __1.io.to(`box:allowed:${req.params.box}`).to(`box:managed:${req.params.box}`).emit("boxUnlocked", req.params.box);
            res.send().status(200);
        }
        else {
            res.status(401).send();
        }
    }
    else {
        res.status(401).send();
    }
});
exports.boxRouter.get('/:box/change', (req, res) => {
});
exports.boxRouter.put('/:box/name', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const user = req.user;
        if (user.managedBoxes.includes(req.params.box) && req.body.name) {
            try {
                const box = yield __1.prisma.box.update({
                    where: { id: req.params.box },
                    data: {
                        name: req.body.name
                    }
                });
                if (box) {
                    __1.io.to(`box:allowed:${req.params.box}`).to(`box:managed:${req.params.box}`).emit("boxNameChanged", req.params.box, req.body.name);
                    res.send().status(200);
                }
                else {
                    res.send().status(404);
                }
            }
            catch (error) {
                res.status(404).send();
            }
        }
        else {
            res.status(401).send();
        }
    }
    else {
        res.status(401).send();
    }
}));
exports.boxRouter.get('/:box/livekit', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user) {
        const user = req.user;
        res.send(createToken(req.params.box, user.id));
    }
    else {
        res.status(401).send();
    }
});
