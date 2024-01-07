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
exports.signRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const __1 = require("..");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.signRouter = express_1.default.Router();
exports.signRouter.post("/up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield __1.prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        if (user) {
            res.status(409).send();
        }
        res.status(200).send();
    }
    catch (error) {
        res.status(404).send();
    }
    res.status(404).send();
}));
exports.signRouter.post("/up/confirm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foundUser = yield __1.prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        if (!foundUser && req.body.password === req.body.confirmedPass) {
            try {
                const newUser = yield __1.prisma.user.create({
                    data: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        passwordHash: bcrypt_1.default.hashSync(req.body.password, 10),
                        managedBoxes: [],
                        allowedBoxes: []
                    }
                });
                if (newUser) {
                    res.status(200).send();
                }
                res.status(409).send();
            }
            catch (error) {
                console.log(error);
                res.status(404).send();
            }
        }
    }
    catch (error) {
        res.status(404).send();
    }
    res.status(401).send();
}));
exports.signRouter.post("/in", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield __1.prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        if (user && (bcrypt_1.default.compareSync(req.body.password, user.passwordHash)))
            res.status(200).send(jsonwebtoken_1.default.sign({ _id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, __1.secret));
        res.status(401).send();
    }
    catch (error) {
        console.log(error);
        res.status(404).send();
    }
    res.status(401).send();
}));
