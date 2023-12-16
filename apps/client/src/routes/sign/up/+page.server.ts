import { registerUser } from '$lib/stores/store.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
    confirm: async ({ request }) => {
        
        throw redirect(302, '/sign/up/confirm');
    }
}