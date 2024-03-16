<script lang="ts">
	import { goto } from "$app/navigation";
	import { BigCrossIcon, CrossIcon } from "$lib/assets/icons";
	import CheckmarkIcon from "$lib/assets/icons/CheckmarkIcon.svelte";
	import { Button } from "$lib/components";
	import InputField from "$lib/components/InputField.svelte";
	import { CapacitorWifi, type ScanResult } from "capacitorjs-plugin-wifi";
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
    export let data

    let networkSelector : boolean = false
    let boxNetworkError : boolean = false
    const selectNetworkMenu = async ()=>{
        boxNetworkError = false
        if ((await CapacitorWifi.getCurrentNetworkConfiguration()).ssid != `\"${data.slug}\"`) {
            boxNetworkError = true
            return
        }
        networkSelector = true
    }

    onMount(async ()=>{
        await scanWifiNow()
    })

    let foundNetworks : ScanResult[] = []
    const scanWifiNow = async () => {
        let networkScan = await CapacitorWifi.wifiScan();
        foundNetworks = []
        if (!networkScan.error) {
            for(const network of networkScan.networks) {
                foundNetworks = [...foundNetworks, network]
            }
        }
    }

    let passwordPrompt = false
    let selectedNetwork : ScanResult
    let selectedNetworkPassword : string
    const selectNetwork = (network : ScanResult) => {
        passwordPrompt = true
        selectedNetwork = network
    }

    enum ConnectionResult {
        WAITING,
        CONNECTING,
        SUCCESS,
        FAILED
    }
    let connectionResult : ConnectionResult = ConnectionResult.WAITING
    const connectBox = async (ssid: string, password: string)=>{
        connectionResult = ConnectionResult.CONNECTING
        const res = await fetch(`http://1.0.0.1:3031/network/setup/connect`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ssid,
                password
            })
        })

        if (res.status === 200) {
            connectionResult = ConnectionResult.SUCCESS
        } else {
            connectionResult = ConnectionResult.FAILED
        }
    }
</script>
<section class="w-full h-screen bg-background absolute transition-colors ease-in-out">
    {#if passwordPrompt}
        <div transition:slide={{axis:"y"}} class="w-full h-[calc(100%-4rem)] absolute bottom-0 z-20 flex flex-col px-2">
            <div class=" bg-secondary rounded-t-[1rem] pt-4 px-4 h-full w-full flex flex-col gap-2">
                <div class="flex flex-row items-center">
                    <div class="w-4/6 flex justify-start text-start text-text_color text-2xl">
                        <p>{selectedNetwork.SSID}</p>
                    </div>
                    <div class="w-2/6 flex justify-end">
                        <button on:click|preventDefault={()=>{passwordPrompt = false; connectionResult = ConnectionResult.WAITING}} class="active:scale-90 transition-transform ease-in-out"><CrossIcon/></button>
                    </div>
                </div>
                <div class="flex flex-col gap-4 h-full">
                    <div class="flex flex-col gap-2 h-full">
                        <p class="text-text_color text-sm mb-2">Enter password for <span class="font-bold">{selectedNetwork.SSID}</span></p>
                        {#if connectionResult === ConnectionResult.WAITING}
                            <InputField bind:value={selectedNetworkPassword} type="password" error={null} label="Password"/>
                            <Button label="Connect" on:click={()=>connectBox(selectedNetwork.SSID, selectedNetworkPassword)}/>
                            {:else}
                                <div class="w-full h-full flex justify-center items-center flex-col gap-2" >
                                    {#if (connectionResult === ConnectionResult.CONNECTING)}
                                        <p class="flex flex-row text-text_color text-sm mb-2">Connecting...</p>
                                    {:else if (connectionResult === ConnectionResult.SUCCESS)}
                                        <p class="flex flex-row text-text_color text-sm mb-2"><CheckmarkIcon/> Connection successful</p>
                                        <Button label="Continue" on:click={()=>goto("/home")}/>
                                    {:else if (connectionResult === ConnectionResult.FAILED)}
                                        <p class="flex flex-row text-text_color text-sm mb-2"><CrossIcon/> Connection failed</p>
                                        <Button label="Try again" on:click={()=>connectionResult = ConnectionResult.WAITING}/>
                                    {/if} 
                                </div>  
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
    <div class="w-full px-4 h-16 flex justify-center items-center">
        <div class="flex flex-row items-center justify-center relative w-full">
            <button on:click|preventDefault={()=>goto("/home/network")} class="absolute left-0 active:scale-90 transition-transform ease-in-out"><BigCrossIcon/></button>
            <p class="flex text-text_color">Connect to box</p>
        </div>
    </div>
    <div class="flex flex-col gap-4 h-[calc(100vh-4rem)] w-full bg-secondary rounded-t-[2rem] p-4 relative">
        <p class="text-text_color text-sm">Connect your device to <span class="font-bold">{data.slug}</span> network and click continue.</p>
        {#if boxNetworkError}
            <p class="text-red">Please connect to <span class="font-bold">{data.slug}</span> network</p>
        {/if}
        {#if !networkSelector}
            <Button on:click={()=>selectNetworkMenu()} label="Continue" />
            {:else}
            <div class="w-full h-full overflow-scroll flex flex-col gap-2">
                {#each foundNetworks as network}
                    <button on:click={()=>selectNetwork(network)} class="w-full h-18 bg-btn_secondary flex flex-row gap-2 solid-shadow rounded-lg p-3 transition-transform active:bg-btn_pressed active:scale-95">
                        <div class="w-full flex flex-col items-start justify-center">
                            <div class="flex flex-row gap-2">
                                <p class="text-xs text-text_color flex flex-row gap-2 justify-center items-center">{network.SSID}</p>
                            </div>
                            <p class="text-[10px] text-btn_primary">{network.BSSID}</p>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</section>