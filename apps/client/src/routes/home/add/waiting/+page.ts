import { AddNewStatus, addingStatus } from "$lib/stores";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    addingStatus.set(AddNewStatus.WAITING)
};