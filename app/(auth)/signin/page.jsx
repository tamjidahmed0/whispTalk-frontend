'use client'
import React, {useState} from 'react'
import Link from 'next/link'
import getLoginDetails from '@/lib/getLoginDetails'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import toastService from '@/services/toastService'

const signIn = () => {
    

const handleSubmit = async (formData) =>{

    const identifier = formData.get('identifier')
    const password = formData.get('password')
    const userAgent = navigator.userAgent
    try {

        const result = await toastService.promise(
            getLoginDetails(identifier, password, userAgent)
        )

        // const result = await getLoginDetails(identifier, password, userAgent)


        if(result.status === 401){
            toastService.error(result.msg)
        }


        console.log(result, 'result')
    
    } catch (error) {
      toastService.error('Something went wrong!')
    
        console.log('server error')
    }



}



  return (
    <section className="bg-gray-50  h-[100vh]">


    <ToastContainer position='top-center'/>
    {/* {disabled && <DisableModal title={disabledData.title} description={disabledData.text} />} */}
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      {/* <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo">
      </a> */}
      <div className="w-full bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0 ">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                  Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" action={handleSubmit}>
                  <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">Your username or email</label>
                      <input  type="text" name="identifier" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  " placeholder="Enter Email" required=""/>
                  </div>
                  <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 ">Password</label>
                      <input type="password" name="password" id="password" placeholder="Type password" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required=""/>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300   " required=""/>
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="remember" className="text-gray-500 ">Remember me</label>
                          </div>
                      </div>
                      <a href="#" className="text-sm font-medium text-primary-600 hover:underline ">Forgot password?</a>
                  </div>
                  <button type="submit" className="w-full bg-blue-500 text-white hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">Sign in</button>
                  <p className="text-sm font-light text-gray-500 ">
                      Don’t have an account yet? <Link href="/signup" className="font-medium text-primary-600 hover:underline ">Sign up</Link>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
  )
}

export default signIn