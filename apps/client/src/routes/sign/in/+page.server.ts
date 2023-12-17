import { fail, redirect } from '@sveltejs/kit'

// export const actions = {
//     login: async ({request, cookies}) => {
//         const data = await request.formData()
//         const email = data.get('Email')
//         const password = data.get('Password')
//         const remember = data.get("Remember")
        
//         if (password == "KOKOT") {
//             if (remember) {
//                 console.log("I will");
//             }
//             cookies.set("token", "MIREK", {path: "/", sameSite: "strict", httpOnly: true, secure: false} )
//             throw redirect(302, '/')
//         }
        
        
//         return fail(400, {email, incorrect: true})
//     }
// }