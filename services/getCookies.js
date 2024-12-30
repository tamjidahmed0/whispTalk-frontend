'use server'
import { cookies } from "next/headers";


const getCookie = async (value) => {
  const cookieStore = await cookies();
  const token = await cookieStore.get(value);
  return token;


};
export default getCookie


