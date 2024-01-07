import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({url}) => {  
    return {
        url: url.pathname,
    }
};

export const prerender = true
export const ssr = false