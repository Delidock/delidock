import { redirect } from '@sveltejs/kit'

export const load = ({locals}) => {
    if (!locals.user.token) {
        throw redirect(302, "/sign/in")
    } 
}