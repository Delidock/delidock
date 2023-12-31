import { redirect } from '@sveltejs/kit';
let api : string = "http://localhost:3000"
export const prerender = 'auto'
export const load = async ({ params, parent, fetch }) => {

    const { boxes } = await parent();
    if (boxes){
        const box = boxes.find((b) => b.id === params.slug)
        if (box) {

            const livekitToken = await fetch(`${api}/api/getLivekitToken`, {
                method: "POST",
                body: JSON.stringify({id: box.id}),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            
            let tokenString = await livekitToken.text()
            return {
                livekitToken: tokenString,
                box
            }
        }
        throw redirect(301, "/");
        
    }
    throw redirect(301, "/");
}