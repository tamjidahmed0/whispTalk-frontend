'use client'
import { SocketInit } from "@/context/socket"
import { store } from "@/store/store"
import { Provider } from "react-redux"

export const SocketProvider = ({children}) =>{

    return (
      <Provider store={store}>
      <SocketInit>
        {children}
      </SocketInit>
      </Provider>

    )


}