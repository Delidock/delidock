<script lang="ts">
    import "../app.css";

    import { goto } from "$app/navigation";
	import { delidock } from "$lib/utils";
	import { onMount } from "svelte";
	import { boxes, socketStore } from "$lib/stores";
    
    import { App } from '@capacitor/app';
	import { browser } from '$app/environment';
	import { page } from "$app/stores";
	import type { BoxClient } from "@delidock/types";
    if (browser) {
        App.removeAllListeners
        App.addListener('backButton', async () => {
            if ($page.url.pathname === "/sign/in") {
                App.minimizeApp()
            } else if ($page.url.pathname === "/sign/up") {
                goto('/sign/in', {replaceState: true})
            } else if ($page.url.pathname === "/sign/up/confirm") {
                goto('/sign/up', {replaceState: true})
            } else if ($page.url.pathname === "/home") {
                App.minimizeApp()
            } else {
                window.history.back()
            }
        });
        App.addListener('resume', async () => {
            const res = await delidock.resumeState()
            if (res.status === 200) {
                const data : BoxClient[] = await res.json()
                boxes.set(data)
            }
        })
    }
    onMount(async ()=> {        
        if (await delidock.checkToken()) {
            if (!$socketStore) {
                delidock.socketConnect()
            }
            goto('/home', {replaceState: true})
        } else {
            goto('/sign/in', {replaceState: true})
        }
    })
</script>
<main class="bg-secondary w-full min-h-[100svh]">
    <slot/>
</main>