import { boxes } from "$lib/stores"
import type { Box } from "@delidock/types"
import { get } from "svelte/store"

export const Update = <K extends keyof Box, V extends Box[K]>(box : Box, property: K, value: V) => {
    let gotBoxes : Box[] = get(boxes)
    let boxId = gotBoxes.findIndex((e) => e.id === box.id)
    if (boxId >= 0) {
        gotBoxes[boxId][property]= value
        boxes.set(gotBoxes)
    }
}