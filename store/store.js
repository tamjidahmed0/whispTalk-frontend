import { configureStore } from '@reduxjs/toolkit'
import chatReducer from '@/features/chatSlice'
import receiverReducer from '@/features/receiverIdSlice'


export const store = configureStore({
    reducer: {
   
      chats: chatReducer,
      receiver: receiverReducer,
  
    },
  })