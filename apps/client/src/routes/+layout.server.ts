import type { LayoutServerLoad } from "./$types";
export const load: LayoutServerLoad = async ({url}) => {
    
    return {
        url: url.pathname,
        boxes: [
            { name: "Mireček", id: "qhdKKT1", pin: "789456", livekitToken: "superToken", livekitServer: "ws://my.server.app/", opened: false },
            { name: "Janek", id: "xdLmao2", pin: "989456", livekitToken: "superToken", livekitServer: "ws://my.server.app/", opened: false },
            { name: "Mánička", id: "kmotr15", pin: "419456", livekitToken: "superToken", livekitServer: "ws://my.server.app/", opened: false },
        ]
    }
};