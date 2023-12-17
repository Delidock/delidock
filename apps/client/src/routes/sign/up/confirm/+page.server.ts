import { redirect, type Actions, fail } from "@sveltejs/kit";

// export const actions : Actions = {
//     register: async ({request}) => {
//         const data = await request.formData()
//         const confirmedPassword = data.get("Confirm password")
//         const password = data.get("Password")
//         if (password === confirmedPassword) {
//             throw redirect(304, '/')
//         }
//         return fail(400, {incorrect: true})
        
//     },
// }