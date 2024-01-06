import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({url}) => {
    console.log("Loading layout");
    
    return {
        url: url.pathname,
    }
};

export const prerender = true
export const ssr = false