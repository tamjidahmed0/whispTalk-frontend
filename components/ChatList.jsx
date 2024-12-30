'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import tamjid from '@/assets/tamjid.jpg';
import Link from "next/link";
import { useSocketContext } from "@/context/socket";
import getAllChat from "@/lib/getAllChat";
import { useSearchParams, useRouter } from "next/navigation";
import { addUser, updateUserById, removeUserById } from "@/features/chatSlice";
import { useSelector, useDispatch } from "react-redux";


const ChatList = () => {

  const socket = useSocketContext()
  const conversation = useSelector((state) => state.chats.users);
  const [allChats, setAllChats] = useState([])
  const [noConv, setNoConv] = useState({})
  const [loading, setLoading] = useState(true)

  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('onscreen')

  useEffect(() => {


    const chats = async () => {
      setLoading(true)
      try {
        const result = await getAllChat('')
        if (Array.isArray(result)) {
          setAllChats(result)
        } else {
          setNoConv(result)

        }

        console.log(result, 'resultt')
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    chats()



  }, [])


  useEffect(() => {




    if (query !== 'false') {

      router.push('/direct/inbox?onscreen=false')
    }

  }, [])


  //receive message
  useEffect(() => {
    if (socket) {
      socket.on("receivermessage", (data) => {
        console.log(data, 'chat msg')


        if (query === 'false') {
          socket.emit('seen', {
            senderId: data.iSend,
            seen: false
          })
        }



        // if (params.Id === data.iSend) {
        //     setMessages((msgs) => [...msgs, data]);
        //     const trimText = data.text.substring(0, 23);
        //     //   dispatch(updateUserById({ Id: params.message_id, newText: trimText }))
        //     //   setReceiverText(trimText)


        //     //send seen effect from inbox
        //     if (query === 'true') {
        //         socket.emit('seen', {
        //             senderId: data.iSend,
        //             seen:true
        //         })
        //     }

        // }








      });
    }

    //cleanup function
    return () => {
      if (socket) {
        socket.off("receivermessage");
        // socket.off("seen");
      }
    };
  }, [socket]);





  useEffect(() => {

    if (socket) {
      socket.on('seen', (data) => {
        // setUserSeen(data.seen)
        console.log(data, 'seen data')
      })
    }

    //cleanup function
    return () => {
      if (socket) {
        socket.off("seen");
      }
    };

  }, [socket])






  if (loading) {
    return (
      <div>loading...</div>
    )
  }





  return (
    <div className="">
      {/* Set max height and overflow for scrolling */}

      {allChats.length === 0 ?

        <div className="flex items-center justify-center h-full text-center mt-[10rem]">
          <h1 className="font-bold text-gray-500">Oops! It’s quiet here. Start a new conversation to break the silence!🤩</h1>

        </div>

        :

        <div className="flex flex-col gap-4   ">

          {allChats.map((value, index) => (
            <Link href={`/direct/inbox/${value.Id}?onscreen=true`} key={index} className="flex items-center gap-5 bg-white p-4 rounded-xl">

              <Image src={value.profile === 'public/default.jpg' ? `${process.env.NEXT_PUBLIC_API}/${value.profile}` : value.profile} alt="tamjid" width={500} height={500} className="w-16 h-16 rounded-full " />
              <div>
                <h1 className="font-bold text-[18px]">{value.name}</h1>
                <p className="text-gray-500">{value.text}</p>
              </div>
              <div className="ml-auto">
                <span>{value.date}</span>
              </div>
            </Link>
          ))}
        </div>

      }




    </div>
  );
};

export default ChatList;
