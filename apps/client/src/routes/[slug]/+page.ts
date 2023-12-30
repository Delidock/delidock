import { redirect } from '@sveltejs/kit';
export const prerender = 'auto'
export const load = async ({ params, parent }) => {

    const { boxes } = await parent();
    if (boxes){
        const box = boxes.find((b) => b.id === params.slug)
        if (box) {
            return {
                box
            }
        }
        throw redirect(301, "/");
        
    }
    throw redirect(301, "/");
}