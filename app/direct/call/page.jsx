'use client'
import { useState, useEffect } from "react"
import { useSocketContext } from "@/context/socket"


const Call = () => {
  useEffect(() => {
    const channel = new BroadcastChannel("chat-app");

    channel.onmessage = (event) => {
      console.log("Message received in Tab 2:", event.data);
    };

    return () => {
      channel.close(); // Clean up
    };
  }, []);





const socket = useSocketContext()







useEffect(()=>{

    if(socket){
      //  socket.emit('user:incomming', {
      //   id:'iki',
      //   requestForCalling:'uuiu',
      //   callerSocketId:'kuku',
      //   peerOffer: 'h'
      //  }) 





      socket.on("connect", () => {
        console.log("New Socket ID:", socket.id);
        
    });

      console.log(socket.id)
      console.log("Socket connected:", socket.connected);
     
      if(socket.connected){
        socket.connect()
      }


  
    }


},[socket])






  return (
    <div>Call</div>
  )
}

export default Call