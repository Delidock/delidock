<script lang="ts">
	
	import { AccountIcon,  PlusIcon } from "$lib/assets/icons";
    import { Doggo } from "$lib/assets/images";
    import { BoxWidget } from "$lib/components";

    import { delidock } from "$lib/utils";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { boxes, loading } from "$lib/stores";
	import BoxIcon from "$lib/assets/icons/BoxIcon.svelte";
	import Button from "$lib/components/Button.svelte";
    
    let date = new Date()
    let today : string = `${date.toLocaleDateString('en-US', {weekday: 'long'})} ${date.toLocaleString('en-US',{month: 'long'})} ${date.getDate()}`
    let now : string = `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}:${("0"+date.getSeconds()).slice(-2)}`

    onMount(()=>{
        if (!delidock.checkToken()) {
            goto('/sign/in', {replaceState: true})
        }

        setInterval(()=> {
            date = new Date()
            today = `${date.toLocaleDateString('en-US', {weekday: 'long'})} ${date.toLocaleString('en-US',{month: 'long'})} ${date.getDate()}`
            now = `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}:${("0"+date.getSeconds()).slice(-2)}`
        }, 500)
    })    
    
    console.log($loading);
    
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
                        <button on:click|preventDefault={()=>goto("/home/account")} class="active:scale-90 transition-transform ease-in-out"><AccountIcon/></button>
                    </div>
                    <div class="h-4/5 w-full flex justify-end items-center">
                        <img src={Doggo} class="h-20" alt="">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-between items-center">
                <h4 class="text-text_color text-xs">Availible boxes:</h4>
                <button on:click={()=>goto('/home/add', {replaceState: false})} class="transition-transform ease-in-out active:scale-90"><PlusIcon/></button>
            </div>
        </div>
        {#if !$loading}
            <div class="flex flex-col gap-1">
                <section class="flex flex-col gap-2 items-center justify-center">
                    {#if $boxes.length > 0}
                        {#each $boxes as box}
                            <BoxWidget box={box} on:click={()=>goto(`/home/${box.id}`)}/>
                        {/each}
                        {:else}
                            <div class="mt-20 w-1/2 flex flex-col justify-center items-center gap-1">
                                <p class="text-text_color text-sm">No boxes yet</p>
                                <Button label="Add new" on:click={()=>goto('/home/add', {replaceState: false})}/>
                            </div>
                    {/if}
                </section>
            </div>
            {:else}
            <div class="flex flex-col justify-center items-center w-full h-full mt-20 gap-2">
                <div class="animate-spin">
                    <BoxIcon/>
                </div>
                <p class="text-text_color text-lg">Getting your boxes...</p>
            </div>
        {/if}
</section>