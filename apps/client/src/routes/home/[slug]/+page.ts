import { boxes } from '$lib/stores';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
export const prerender = 'auto'
export const load = async ({ params, parent }) => {

    const gotBoxes = get(boxes)
    if (gotBoxes){
        const boxId = gotBoxes.findIndex((b) => b.id === params.slug)
        if (boxId >= 0) {
            return {
                boxId
            }
        }
        throw redirect(301, "/home");
        
    }
    throw redirect(301, "/home");
}