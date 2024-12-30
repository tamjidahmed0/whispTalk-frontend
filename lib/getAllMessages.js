'use server'
import { cookies } from 'next/headers'


export default async function getAllMessages (receiverId, limit, offset) {
    const userTimeZoneOffset = -new Date().getTimezoneOffset();

    const cookieStore = await cookies()
    const hasToken = await cookieStore.has('token')
    const hasUser = await cookieStore.has('c_user')
    const token = await cookieStore.get('token')
    const user = await cookieStore.get('c_user')?.value



    if(hasUser && hasToken){


            const result = await fetch(`${process.env.NEXT_PUBLIC_API}/api/message/${user}/${receiverId}?limit=${limit}&offset=${offset}`,
            {
                method:'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`,
                    "userid": user,
                    'userTimeZoneOffset': userTimeZoneOffset
                }
            }
            
            )



            // if(result.status === 401){

            //     cookieStore.delete('c_user')
            //     cookieStore.delete('token')
               
            // }

            if(result.status === 401){

            }else{
                return result.json()
            }

         
    




    }
   

  


    
}