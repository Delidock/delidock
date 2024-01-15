import { AccessToken } from "livekit-server-sdk";

export const createToken = (room: string, user:string, apiKey: string, secret: string) => {

    const roomName = `room:${room}`;

    const participantName = user;

    const at = new AccessToken(apiKey, secret, {
        identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });

    return at.toJwt();
}