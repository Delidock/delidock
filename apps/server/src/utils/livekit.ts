import { AccessToken } from "livekit-server-sdk";

export const createToken = (room: string, user:string, apiKey: string, secret: string, box: boolean = false) => {

    const roomName = `room:${room}`;

    let participantName = user;
    if (box) {
        participantName = `box:${user}`;
    } else {
        participantName = user
    }
    


    const at = new AccessToken(apiKey, secret, {
        identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });

    return at.toJwt();
}