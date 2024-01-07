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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPassportController = void 0;
const client_1 = require("@prisma/client");
const passport_jwt_1 = require("passport-jwt");
const prisma = new client_1.PrismaClient();
const userPassportController = (passport) => {
    let options = {
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: "jP830iVZxa_9OPKOw4EvSsca4r6lpWNnjsRMwvsVAuM",
    };
    passport.use(new passport_jwt_1.Strategy(options, function (jwt_payload, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma.user.findUnique({
                    where: {
                        email: jwt_payload.email
                    }
                });
                if (user) {
                    done(null, user);
                }
                else {
                    done(null, false);
                }
            }
            catch (error) {
                done("Something went wrong", false);
            }
        });
    }));
};
exports.userPassportController = userPassportController;
