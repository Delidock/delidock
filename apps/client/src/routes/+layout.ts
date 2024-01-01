import type { LayoutLoad } from "./$types";
export const load: LayoutLoad = async ({url}) => {
    
    return {
        url: url.pathname,
        boxes: [
            { name: "Mireček", id: "qhdKKT1", pin: "789456", livekitToken: "superToken", livekitServer: "wss://26ac-86-49-9-122.ngrok-free.app", opened: false },
            { name: "Janek", id: "xdLmao2", pin: "989456", livekitToken: "superToken", livekitServer: "ws://my.server.app/", opened: false },
            { name: "Mánička", id: "kmotr15", pin: "419456", livekitToken: "superToken", livekitServer: "ws://my.server.app/", opened: false },
        ]
    }
};

export const prerender = true
export const ssr = false