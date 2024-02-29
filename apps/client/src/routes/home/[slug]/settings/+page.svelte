<script lang="ts">
	import { goto } from '$app/navigation';
	import { boxes, loggedUser } from '$lib/stores';
	import type { BoxClient, UserUsingBox } from '@delidock/types';
    import { BigCrossIcon, BoxUserIcon, CrossIcon, RoundedCheckmarkIcon, AdminIcon } from '$lib/assets/icons'
	import { Button } from '$lib/components';
	import { slide } from 'svelte/transition';
	import InputField from '$lib/components/InputField.svelte';
	import { delidock } from '$lib/utils';

    export let data
    let box : BoxClient = $boxes[data.boxId]

    let poppedUp : boolean = false
    let pickUserPopUp : boolean = false
    let popUpName : string

    let confirmationField : string = ''
    let newOwner : UserUsingBox | null
    let newOwnerError : boolean
    let confirmError : string

    const pickUser = () => {
        pickUserPopUp = true
    }

    const setNewOwner = (pickedOwner: UserUsingBox) => {
        newOwnerError = false
        newOwner = pickedOwner
        pickUserPopUp = false
    }
    const popUp = (name : string) => {
        popUpName = name
        poppedUp = true

    }
    const popOut = () => {
        popUpName = ''
        confirmError = ''
        newOwner = null
        newOwnerError = false
        pickUserPopUp = false
        poppedUp = false
    }

    const confirm = async () => {
        if(confirmationField === box.name) {
            switch (popUpName) {
                case 'ownership':
                    if (!newOwner) {
                        newOwnerError = true
                        return
                    }
                    newOwnerError = false
                    confirmError = ''
                    const res = await delidock.transferOwnership(box.id, newOwner.email)
                    if (res.status === 200) {
                        popOut()
                    }
                    break;
                    
                case 'deactivation':
                    confirmError = ''
                    delidock.deactivateBox(box.id)
                    
                    break;

                case 'leave':
                    confirmError = ''
                    delidock.leaveBox(box.id)
                    
                    break
            }
            
        } else if (!confirmationField) {
            confirmError = "Please fill out the field"
            return
        } else {
            confirmError = "Names doesn't match"
            return
        }
    }

    $: {
        if ($boxes[data.boxId]) {
            box = $boxes[data.boxId]
        }        
    }
</script>
<section class="w-full h-screen bg-background absolute transition-colors ease-in-out" class:blur-sm={poppedUp} class:grayscale-[100%]={poppedUp}>
    <div class="w-full px-4 h-16 flex justify-center items-center">
        <div class="flex flex-row items-center justify-center relative w-full">
            <button on:click|preventDefault={()=>goto(`/home/${box.id}`)} class="absolute left-0 active:scale-90 transition-transform ease-in-out"><BigCrossIcon/></button>
            <p class="flex text-text_color">{box.name}</p>
        </div>
    </div>
    <div class="w-full min-h-[calc(100svh-4rem)] bg-secondary rounded-t-[2rem] flex flex-col gap-2 pb-4 px-4 pt-4">
        {#if box.owner.email === $loggedUser?.email}
            <div class="flex flex-col gap-2">
                <Button on:click={()=>popUp("ownership")} forceRed={true} label="Transfer ownership" />
                <Button on:click={()=>popUp("deactivation")} forceRed={true} label="Deactivate" />
            </div>
            {:else}
            <Button on:click={()=>popUp("leave")} label="Leave" forceRed={true} />
        {/if}
    </div>
</section>
{#if poppedUp}
    <div transition:slide={{axis:"y"}} class="w-full h-[calc(100vh-4rem)] absolute bottom-0 px-2">
        <div class=" bg-secondary rounded-t-[1rem] pt-4 px-4 h-full w-full flex flex-col gap-2">
            <div class="flex flex-row items-center">
                <div class="w-4/6 flex justify-start text-start text-text_color text-2xl">
                    {#if popUpName === "ownership"}
                            <p>Ownership</p>
                        {:else if popUpName === "deactivation"}
                            <p>Deactivation</p>
                        {:else if popUpName === "leave"}
                            <p>Leaving</p>
                    {/if}
                </div>
                <div class="w-2/6 flex justify-end">
                    <button on:click|preventDefault={()=>popOut()} class="active:scale-90 transition-transform ease-in-out"><CrossIcon/></button>
                </div>
            </div>
            {#if popUpName === "ownership"}
                <p class="text-text_color text-sm mb-2">Are you sure you want to transfer ownership of <span class="font-bold italic">{box.name}</span> to someone else? Please select new owner and type <span class="font-bold italic">{box.name}</span> to confirm this operation.</p>
                {#if !newOwner}
                    <button on:click={()=>pickUser()} class="active:text-btn_primary transition-colors ease-in-out w-full h-16 border-dashed bg-secondary border-2 border-btn_secondary rounded-lg text-text_color text-base flex-row flex px-3 items-center justify-center gap-3" class:!border-red={newOwnerError}>
                        <p>Select new owner</p>
                    </button>
                    {:else}
                    <div class="w-full h-18 bg-btn_secondary flex flex-row gap-2 solid-shadow rounded-lg p-3">
                        <div class="w-10 justify-center items-center">
                            <BoxUserIcon/>
                        </div>
                        <div class="w-full flex flex-col items-start justify-center">
                            <div class="flex flex-row gap-2">
                                <p class="text-xs text-text_color flex flex-row gap-2 justify-center items-center">{newOwner.name}</p>
                                {#if newOwner.managing}
                                    <div class="h-4 bg-secondary px-1 py-[1px] rounded-[4px] text-[0.5rem] text-center flex items-center gap-1">
                                        <AdminIcon/>
                                        <p class="text-text_color">ADMIN</p>
                                    </div>
                                {/if}
                            </div>
                            <p class="text-[10px] text-btn_primary">{newOwner.email}</p>
                        </div>
                        <button class="transition-transform ease-in-out active:scale-90" on:click={()=> newOwner = null}><CrossIcon/></button>
                    </div>
                {/if}
                {:else if popUpName === "leave"}
                <p class="text-text_color text-sm mb-2">Are you sure you want to leave <span class="font-bold italic">{box.name}</span>? To confirm this operation, type <span class="font-bold italic">{box.name}</span> in the field below.</p>
                {:else if popUpName === "deactivation"}
                <p class="text-text_color text-sm mb-2">Are you sure you want to deactivate <span class="font-bold italic">{box.name}</span>? This will remove all users from the box and sets the box to activation state. To confirm this operation, type <span class="font-bold italic">{box.name}</span> in the field below.</p>
            {/if}
            <InputField on:input={()=>confirmError = ''} label="Confirmation" type="text" bind:value={confirmationField} error={confirmError} icon={RoundedCheckmarkIcon}/>
            <Button label="Confirm" on:click={()=>confirm()}/>
        </div>
    </div>
{/if}
{#if pickUserPopUp}
    <section class="min-h-screen w-full absolute bg-background flex flex-col">
        <div class="w-full h-16 flex flex-row px-4">
            <div class="flex items-center justify-start w-1/6">
                <button on:click={()=>pickUserPopUp = false} ><BigCrossIcon/></button>
            </div>
            <div class="flex items-center justify-center w-full">
                <p class="text-text_color">Select new owner</p>
            </div>
            <span class="w-1/6"></span>
        </div>
        <div class="flex flex-col gap-2 px-4">
            {#each box.users as boxUser}
                <button on:click={()=>setNewOwner(boxUser)} class="items-center transition-all ease-in-out w-full h-18 bg-btn_secondary flex flex-row gap-2 solid-shadow rounded-lg p-3 active:bg-btn_pressed active:scale-95">
                    <div class="w-10 justify-center items-center">
                        <BoxUserIcon/>
                    </div>
                    <div class="w-full h-full flex flex-col items-start justify-center">
                        <div class="flex flex-row gap-2">
                            <p class="text-xs text-text_color flex flex-row gap-2 justify-center items-center">{boxUser.name}</p>
                            {#if boxUser.managing}
                                <div class="h-4 bg-secondary px-1 py-[1px] rounded-[4px] text-[0.5rem] text-center flex items-center gap-1">
                                    <AdminIcon/>
                                    <p class="text-text_color">ADMIN</p>
                                </div>
                            {/if}
                        </div>
                        <p class="text-[10px] text-btn_primary">{boxUser.email}</p>
                    </div>
                </button>
                {/each}
        </div>
    </section>
{/if}