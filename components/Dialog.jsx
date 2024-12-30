'use client'
import { useEffect, useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    
} from "@/components/ui/dialog"
import { useSocketContext } from "@/context/socket"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import Image from "next/image"
import tamjid from '@/assets/tamjid.jpg'
import getCookie from "@/services/getCookies"
import { useSelector } from "react-redux"


const Dialogs = () => {
    const receiverId = useSelector((state) => state.receiver.receiverId); // Access receiverId

    const socket = useSocketContext()

    const [isCalling, setCalling] = useState(false)
    const [incommingData, setIncommingData] = useState({})






   

//incomming
    useEffect(() => {

        if (socket) {
            socket.on('incommingoffer', (data) => {
                console.log(data, 'incomming data')
                setCalling(true)
                setIncommingData(data)


            })



        }


    }, [socket])




    const handleAnswer = async() =>{
        const userId = (await getCookie('c_user')).value
      
        const handleAnswer = new BroadcastChannel("handleAnswer");
    
    
    
            // Listen for "ready" message from the new tab
            handleAnswer.onmessage = (event) => {
                if (event.data === "ready") {
                  console.log("handle answer tab is ready. Sending message...");
                  handleAnswer.postMessage(incommingData);
                  console.log("Message sent from dialog.jsx");
                }
              };


            if(socket){
                socket.emit('call:accepted',{
                    userId:userId,
                    socket:socket.id,
                    receiverId : receiverId,
                    peerId:incommingData.peerOffer
                })
              }
              const callUrl = `/groupCall?peerOffer=${incommingData.peerOffer}`; // Add query parameters
              const callWindow = window.open(callUrl, "_blank", "width=800,height=600");


              setCalling(false)


    }



    useEffect(()=>{


        if(socket){
            socket.on('call:accepted', (data)=>{
                console.log(data, 'dialog socket')
                const callUrl = `/test`; // Add query parameters
                // const callWindow = window.open(callUrl, "_blank", "width=800,height=600");
                const callAccepted = new BroadcastChannel("call:accepted");
                


        // Listen for "ready" message from the new tab
        callAccepted.onmessage = (event) => {
            if (event.data === "ready") {
              console.log("New tab is ready. Sending message...");
              callAccepted.postMessage(data);
              console.log("Message sent from Tab 1");
            }
          };







            })
        }


    },[socket])




    return (
        <div>
            <Dialog open ={isCalling}>
                {/* <DialogTrigger>Open</DialogTrigger> */}
                {/* <IncommingCallDialog DialogTrigger={DialogTrigger}>open</IncommingCallDialog> */}

                <DialogContent>
                    <DialogTitle></DialogTitle>
                  
                        {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
                        <div className=" flex flex-col items-center justify-center gap-4">
                            <Image src={incommingData.profile === 'public/default.jpg' ? `${process.env.NEXT_PUBLIC_API}/${incommingData.profile}` : incommingData.profile} alt="tamjid" width={500} height={500} className="w-[80px] h-[80px] rounded-full " />
                            <p className=" text-2xl">{incommingData.name}</p>
                            <span>Incomming  call</span>

                            <div className="flex space-x-4">
                                <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full shadow-md transition duration-300">
                                    Reject
                                </button>
                                <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-full shadow-md transition duration-300" onClick={handleAnswer}>
                                    Answer
                                </button>
                            </div>


                        </div>
                        <DialogDescription>


                        </DialogDescription>
                 
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default Dialogs