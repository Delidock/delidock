<script lang="ts">
	import { goto } from "$app/navigation";
	import { AccountIcon, Box, BoxWidget, Doggo, PlusIcon } from "$lib";
	import { boxes } from "$lib/stores/store";
	import { onMount } from "svelte";
	import Cookies from "universal-cookie";

    
    let date = new Date()
    let today : string = `${date.toLocaleDateString('en-US', {weekday: 'long'})} ${date.toLocaleString('en-US',{month: 'long'})} ${date.getDate()}`
    let now : string = `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}:${("0"+date.getSeconds()).slice(-2)}`

    onMount(()=>{
        setInterval(()=> {
            date = new Date()
            today = `${date.toLocaleDateString('en-US', {weekday: 'long'})} ${date.toLocaleString('en-US',{month: 'long'})} ${date.getDate()}`
            now = `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}:${("0"+date.getSeconds()).slice(-2)}`
        }, 500)
    })

    $boxes = [
        new Box("Mireček", "qhdKKT15", "789456", "superToken", "ws://my.server.app/", false),
        new Box("Mrdka", "qhdKKT15", "789134", "superToken", "ws://my.server.app/", false),
        new Box("Mirek", "qhdKKT15", "792856", "superToken", "ws://my.server.app/", false)
    ]

    const logout = async () => {
        const cookies = new Cookies()
        cookies.remove("token", {
            secure: true,
            path: "/",
            sameSite: "strict"
        })
        goto("/sign/in", {replaceState: true})
    }
</script>
<section class="min-h-[100svh] w-full bg-background px-4 flex flex-col gap-1 relative pb-8">
    <div class="sticky top-0 bg-background pt-4 pb-1 z-10">
        <div class="flex flex-row w-full mb-6">
            <div class="w-3/5 flex flex-col gap-4">
                <div class="w-full text-text_color text-4xl gap-1 flex flex-col">
                    <h1>Wonderful</h1>
                    <h1>evening</h1>
                </div>
                <div class="flex flex-col">
                    <p class="text-btn_primary text-[0.625rem]">{today}</p>
                    <p class="text-text_color text-2xl">{now}</p>
                </div>
            </div>
            <div class="w-2/5 flex flex-col gap-6">
                <div class="h-1/5 w-full flex justify-end items-start">
                    <button on:click|preventDefault={()=>logout()} class="active:scale-90 transition-transform ease-in-out"><AccountIcon/></button>
                </div>
                <div class="h-4/5 w-full flex justify-end items-center">
                    <img src={Doggo} class="h-20" alt="">
                </div>
            </div>
        </div>
        <div class="flex flex-row justify-between items-center">
            <h4 class="text-text_color text-xs">Availible boxes:</h4>
            <button class="transition-transform ease-in-out active:scale-90"><PlusIcon/></button>
        </div>
    </div>
    <div class="flex flex-col gap-1">
        <section class="flex flex-col gap-2 items-start">
            {#if $boxes}
                {#each $boxes as box}
                    <BoxWidget box={box}/>
                {/each}
            {/if}
        </section>
    </div>
</section>