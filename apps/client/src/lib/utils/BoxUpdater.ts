import { boxes } from "$lib/stores"
import type { BoxClient } from "@delidock/types"
import { get } from "svelte/store"

export const Update = <K extends keyof BoxClient, V extends BoxClient[K]>(id: string, property: K, value: V) => {
    let gotBoxes : BoxClient[] = get(boxes)
    let boxId = gotBoxes.findIndex((e) => e.id === id)
    if (boxId >= 0) {
        gotBoxes[boxId][property]= value
        boxes.set(gotBoxes)
    }
}