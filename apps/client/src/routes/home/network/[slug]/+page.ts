import type { PageLoad } from "./$types";
export const prerender = 'auto';
export const load: PageLoad = async ({params}) => {
    return {
        slug: params.slug
    }
};