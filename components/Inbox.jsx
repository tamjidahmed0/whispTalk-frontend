'use client'
import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image"
import tamjid from '@/assets/tamjid.jpg'
import { Icon } from '@iconify/react';
import getAllMessages from "@/lib/getAllMessages";
import getCookie from "@/services/getCookies";
import getProfileDetails from "@/lib/getProfileDetails";
import { useSocketContext } from "@/context/socket";
import { motion } from "framer-motion";
import InboxSkeleton from "@/skeleton/InboxSkeleton";
import { useSearchParams, useRouter } from "next/navigation";
import mediaSend from "@/lib/mediaSend";
import AudioWaveform from "./AudioWaveform";
import VoiceMessage from "./VoiceMessage";
import Peer from "peerjs";
import { useDispatch } from "react-redux";
import { setReceiverId } from "@/features/receiverIdSlice";


const Inbox = ({ params }) => {
    const dispatch = useDispatch();
    const socket = useSocketContext()


    const router = useRouter();
    const searchParams = useSearchParams();

    const [messages, setMessages] = useState([])
    const [receiverProfile, setReceiverProfile] = useState({})
    const [loading, setLoading] = useState(true)

    const [isPending, startTransition] = useTransition();


    const [inputText, setInputText] = useState('')
    const [profileDetails, setProfileDetails] = useState({})
    const [userTyping, setUserTyping] = useState(false)
    const messagesEndRef = useRef(null);
    const [userSeen, setUserSeen] = useState(false)
    const [lastSeenIndex, setLastSeenIndex] = useState(-1);

    const fileInputRef = useRef(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [replyText, setReplyText] = useState({})


    //audio
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const [timer, setTimer] = useState(0); // Timer in seconds
    const timerInterval = useRef(null);
    // References for managing the media stream
    const streamRef = useRef(null);


    //peer
    const [peer, setPeer] = useState(null);
    const [peerId, setPeerId] = useState(null);
    const [remotePeerId, setRemotePeerId] = useState('')
    const [incomingCall, setIncomingCall] = useState(null);


    const [call, setCall] = useState(false)



    const query = searchParams.get('onscreen')


    useEffect(() => {
        dispatch(setReceiverId(params.Id))
    }, [])







    //Api call    
    useEffect(() => {
        const api = async () => {
            setLoading(true)

            try {
                const userId = await getCookie("c_user");
                const result = await getAllMessages(params.Id, 30, 0)
                const { data, ...reminingData } = result
                const profileData = await getProfileDetails(userId.value)
                setProfileDetails(profileData)
                setReceiverProfile(reminingData)
                console.log(reminingData, 'data')

                // Find the last seen index
                const lastSeenIndex = data.reduce((acc, msg, index) => (msg.seen ? index : acc), -1);

                setLastSeenIndex(lastSeenIndex);
                setMessages(data)
                console.log(data, 'profile')

            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        api()




    }, [])










    const handleMessagesChange = (e) => {
        setInputText(e.target.value);

    };










    // send message
    const handleSend = async () => {
        const userId = (await getCookie("c_user")).value;

        const userTimeZoneOffset = -new Date().getTimezoneOffset();


        const date = new Date().toISOString();

        // const timeString = date.toLocaleTimeString("en-US", {
        //     hour12: true,
        //     hour: "numeric",
        //     minute: "numeric",
        // });

        console.log(date, 'date')


        //send text

        if (inputText.length !== 0 || inputText.trim().length !== 0) {
            if (socket) {
                // Emit the message using the existing socket


                if (Object.keys(replyText).length !== 0) {
                    socket.emit("sendMessage", {
                        name: profileDetails.name,
                        profile: profileDetails.profilePic,
                        senderId: profileDetails.id,
                        receiverId: params.Id,
                        text: inputText,
                        socketId: socket.id,
                        types: "reply",
                        replyMessageId: replyText.messageId,
                        repliedUserId: userId,
                        Dates: date,
                        timeZoneOffset: userTimeZoneOffset
                    });

                    setReplyText({})
                } else {


                    //send socket message to server
                    socket.emit("sendMessage", {
                        name: profileDetails.name,
                        profile: profileDetails.profilePic,
                        senderId: profileDetails.id,
                        receiverId: params.Id,
                        text: inputText,
                        socketId: socket.id,
                        types: "text",
                        Dates: date,
                        timeZoneOffset: userTimeZoneOffset
                    });

                }



            }
        }

        setInputText("");

        //send images
        if (imagePreviews.length !== 0) {

            const result = await mediaSend({
                selectedFiles,
                receiverId: params.Id,
                senderId: userId,
                types: 'image'
            })
            console.log(result, 'image result')

            if (result) {
                if (socket) {
                    socket.emit('mediaUpload', {
                        messageId: result.messageId,
                        name: profileDetails.name,
                        profile: profileDetails.profilePic,
                        senderId: profileDetails.id,
                        receiverId: params.Id,
                        text: result.url,
                        socketId: socket.id,
                        type: "image",
                        Dates: date,
                        timeZoneOffset: userTimeZoneOffset
                    })
                }

                setImagePreviews([])
            }


        }


        //send voice

        if (audioBlob !== null) {
            const result = await mediaSend({
                audioBlob: audioBlob,
                receiverId: params.Id,
                senderId: userId,
                types: 'voice'
            })

            if (result) {

                if (socket) {
                    socket.emit('voiceMessage', {
                        messageId: result.messageId,
                        name: profileDetails.name,
                        profile: profileDetails.profilePic,
                        senderId: profileDetails.id,
                        receiverId: params.Id,
                        text: result.url,
                        socketId: socket.id,
                        type: "voice",
                        Dates: date,
                        timeZoneOffset: userTimeZoneOffset
                    })
                }


                cancel()
            }


            console.log(result, 'voice')


        }


    };


    //Outgoing message
    useEffect(() => {
        if (socket) {
            socket.on("sendermsg", (data) => {
                console.log(data, 'msg that i send')
                setMessages((msg) => [...msg, data]);
                const trimText = data.text.substring(0, 23);
                // dispatch(updateUserById({ Id: params.message_id, newText: `You: ${trimText}` }))
            });
        }

        //cleanup function
        return () => {
            if (socket) {
                socket.off("sendermsg");
            }
        };
    }, [socket]);




    useEffect(() => {

        if (socket) {
            socket.on('mediaUpload', (data) => {
                console.log(data, 'media upload')
                setMessages((msgs) => [...msgs, data]);
                console.log(data, 'mediaupload')

                if (query === 'true') {
                    socket.emit('seen', {
                        messageId: data.messageId,
                        senderId: data.iSend,
                        seen: true
                    })
                }

            })


            socket.on('mediaUpload_sender', (data) => {
                setMessages((msg) => [...msg, data]);
            })



            //receive voice message event

            socket.on('voiceMessage', (data) => {

                setMessages((msgs) => [...msgs, data]);
                console.log(data, 'voice message')

                if (query === 'true') {
                    socket.emit('seen', {
                        messageId: data.messageId,
                        senderId: data.iSend,
                        seen: true
                    })
                }

            })


            socket.on('voiceMessage_sender', (data) => {
                setMessages((msg) => [...msg, data]);
            })



        }



        return () => {
            if (socket) {
                socket.off("mediaUpload");
                socket.off("mediaUpload_sender");
                socket.off("seen");
                socket.off("voiceMessage");
                socket.off("voiceMessage_sender");
            }
        }

    }, [socket])






    //Receive message

    useEffect(() => {
        if (socket) {
            socket.on("receivermessage", (data) => {
                console.log(data, 'receivermsg')
                if (params.Id === data.iSend) {
                    setReceiverProfile((prevProfile) => ({
                        ...prevProfile, // Spread the existing state
                        request: data.isMsgReqAccept,  // Update the `request` property
                    }));
                    setMessages((msgs) => [...msgs, data]);
                    const trimText = data.text.substring(0, 23);
                    //   dispatch(updateUserById({ Id: params.message_id, newText: trimText }))
                    //   setReceiverText(trimText)


                    //send seen effect from inbox
                    if (query === 'true') {
                        socket.emit('seen', {
                            messageId: data.messageId,
                            senderId: data.iSend,
                            seen: true
                        })
                    }

                }

            });
        }

        //cleanup function
        return () => {
            if (socket) {
                socket.off("receivermessage");
                socket.off("seen");
            }
        };
    }, [socket]);




    useEffect(() => {


        if (socket) {
            socket.on('messageAccept', (data) => {
                setReceiverProfile((prevProfile) => ({
                    ...prevProfile, // Spread the existing state
                    request: data.isMsgReqAccept,  // Update the `request` property
                }));
            })
        }



    }, [socket])



    // seen data
    useEffect(() => {

        if (socket) {
            socket.on('seen', (data) => {
                setUserSeen(data.seen)
                console.log(data, 'seen data')

                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.map((msg) =>

                        msg.messageId === data.messageId ? { ...msg, seen: data.seen } : msg

                    );

                    // Recalculate the last seen index
                    const newLastSeenIndex = updatedMessages.reduce((acc, msg, index) => (msg.seen ? index : acc), -1);
                    setLastSeenIndex(newLastSeenIndex);

                    return updatedMessages;
                });


            })
        }

        //cleanup function
        return () => {
            if (socket) {
                socket.off("seen");
            }
        };

    }, [socket])





    //typing data send
    useEffect(() => {

        if (socket) {
            socket.emit('typing', {
                typingValue: inputText,
                senderId: profileDetails.id,
                receiverId: params.Id
            })
        }

        return () => {
            if (socket) {
                socket.off('typing')
            }
        }


    }, [inputText])




    //receive typing event
    useEffect(() => {


        if (socket) {
            socket.on('typing', (data) => {
                // console.log(data, 'typing data...')
                setUserTyping(data.isUserTyping)

            })
        }

        return () => {
            if (socket) {
                socket.off('typing')
            }
        }


    }, [socket, inputText])



    // Scroll to bottom function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    //trigger scroll to bottom function
    useEffect(() => {
        scrollToBottom();
    }, [messages, userSeen]);





    // check query on screen
    useEffect(() => {

        if (query === 'true') {
            //send seen event through socket
            console.log('on screen')
        } else {
            router.push('/direct/inbox?onscreen=false')
        }


    }, [])




    const handleButtonClick = () => {
        fileInputRef.current.click(); // Trigger the file input
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files); // Get the selected files
        setSelectedFiles(files);
        // Generate image previews
        const previews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file), // Generate a preview URL for the image
        }));

        setImagePreviews(previews); // Update state with previews
    };

    const handleRemoveImage = (index) => {
        // Remove selected image from previews
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(updatedPreviews);
    };







    // Start Recording
    const startRecording = () => {
        setTimer(0); // Reset timer when starting recording
        timerInterval.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1); // Increment timer every second
        }, 1000);

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                streamRef.current = stream; // Store the stream reference
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunks.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    clearInterval(timerInterval.current); // Stop the timer when recording stops
                    const blob = new Blob(audioChunks.current, { type: "audio/wav" });
                    setAudioBlob(blob);
                    const url = URL.createObjectURL(blob);
                    setAudioUrl(url);

                    // Turn off microphone after recording stops
                    stream.getTracks().forEach((track) => track.stop());
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
                setIsPaused(false); // Reset paused state
            })
            .catch((err) => console.error("Error accessing media devices.", err));
    }
    // Pause Recording
    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.pause();
            clearInterval(timerInterval.current); // Pause timer
            setIsPaused(true);
        }
    };

    // Resume Recording
    const resumeRecording = () => {
        mediaRecorderRef.current.resume();
        timerInterval.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1); // Resume the timer
        }, 1000);

        setIsPaused(false);
    };

    // Stop Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop()); // Stop microphone
        }
    };

    // Format timer as MM:SS
    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };


    const cancel = async () => {
        // Clear previous audio and reset the states
        setAudioUrl(null);
        setAudioBlob(null);
        setTimer(0);
        clearInterval(timerInterval.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop()); // Stop the media stream
        }
        setIsRecording(false);
        setIsPaused(false);

        setAudioUrl(false)
        audioChunks.current = [];
    }




    //Text reply

    const reply = (messageId) => {

        const replyText = messages.find((msgId) => msgId.messageId === messageId)
        setReplyText(replyText)



    }

    const scrollToReplyText = (messageId) => {
        console.log(messageId, 'scrollToReplyText')


        const element = document.getElementById(messageId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("bg-yellow-100");

            // Remove the highlight class after 2 seconds
            setTimeout(() => {
                element.classList.remove("bg-yellow-100");
            }, 2000);

        }

    }






    useEffect(() => {


        const peerInstance = new Peer();
        setPeer(peerInstance);

        peerInstance.on("open", (id) => {
            console.log("Generated Peer ID:", id);
            setPeerId(id);
        });




        peerInstance.on("call", async (call) => {
            console.log("Receiver: Incoming call...");

            const localStream = await getLocalStream();

            if (localStream) {
                console.log("Answering call with local stream...");

                // Answer the call with the local stream
                call.answer(localStream);

                call.on("stream", (remoteStream) => {
                    console.log("Receiver: Received remote stream");

                    // Play the remote stream
                    const audio = new Audio();
                    audio.srcObject = remoteStream;
                    audio.play();
                });

                call.on("error", (err) => {
                    console.error("Receiver error:", err);
                });
            } else {
                console.error("Unable to access local stream.");
            }
        });




    }, [])




    const handleCall = async () => {

        const userId = (await getCookie('c_user')).value

        // if( socket){
        //     socket.emit('user:incomming' , {
        //       id:userId,
        //       requestForCalling:params.Id,
        //       callerSocketId:socket.id,
        //       peerOffer: peerId
        //     })

        //   }


        const handleCallTab = new BroadcastChannel("handleCall");
        const callUrl = `/groupCall`; // Add query parameters
        const callWindow = window.open(callUrl, "_blank", "width=800,height=600");




        // Listen for "ready" message from the new tab
        handleCallTab.onmessage = (event) => {
            if (event.data === "ready") {
                console.log("New tab is ready. Sending message...");
                handleCallTab.postMessage('call')

                handleCallTab.onmessage = (event) => {

                    if (event.data.eventName === 'sendPeerId') {
                        console.log('here is peerid', event.data.peerId)

                        //peerid and send call to other user with socket

                        if (socket) {
                            socket.emit('user:incomming', {
                                id: userId,
                                requestForCalling: params.Id,
                                callerSocketId: socket.id,
                                peerOffer: event.data.peerId
                            })
                        }

                    }

                }

            }
        };

























        // const localStream = await getLocalStream();

        // if (localStream) {
        //     console.log("Initiating call to:", remotePeerId);

        //     // Initiate the call to the remote peer
        //     const call = peer.call(remotePeerId, localStream);

        //     call.on("stream", (remoteStream) => {
        //         console.log("Caller: Received remote stream");

        //         // Play the remote stream
        //         const audio = new Audio();
        //         audio.srcObject = remoteStream;
        //         audio.play();
        //     });

        //     call.on("error", (err) => {
        //         console.error("Caller error:", err);
        //     });
        // }




    }



    const answerCall = () => {


        const callUrl = `/groupCall`; // Add query parameters
        const callWindow = window.open(callUrl, "_blank", "width=800,height=600");
        const channel = new BroadcastChannel("chat-app");



        // Listen for "ready" message from the new tab
        channel.onmessage = (event) => {
            if (event.data === "ready") {
                console.log("New tab is ready. Sending message...");
                channel.postMessage({
                    //   id:userId,
                    requestForCalling: params.Id,
                    callerSocketId: socket.id,
                    peerOffer: peerId
                });
                console.log("Message sent from Tab 1");
            }
        };




        if (peer && remotePeerId) {
            // 4. Respond to the caller by answering the call
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                console.log("Answering call with stream...");
                const call = peer.call(remotePeerId, stream); // Answer the call with your audio stream

                call.on("stream", (remoteStream) => {
                    console.log("Connected to caller!");

                    // Play the remote audio stream
                    const audio = new Audio();
                    audio.srcObject = remoteStream;
                    audio.play();
                });
            });
        }


    };








    useEffect(() => {

        if (socket) {
            socket.on('incommingoffer', (data) => {
                console.log(data, 'incomming data')
                setRemotePeerId(data.peerOffer)


            })










        }








    }, [socket])



    const getLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Local stream captured:", stream);
            return stream;
        } catch (error) {
            console.error("Error accessing audio devices:", error);
        }
    };











    // const answerCall = async () => {



    // if(peer){
    //     peer.on("call", async (call) => {
    //         console.log("Receiver: Incoming call...");

    //         const localStream = await getLocalStream();

    //         if (localStream) {
    //             console.log("Answering call with local stream...");

    //             // Answer the call with the local stream
    //             call.answer(localStream);

    //             call.on("stream", (remoteStream) => {
    //                 console.log("Receiver: Received remote stream");

    //                 // Play the remote stream
    //                 const audio = new Audio();
    //                 audio.srcObject = remoteStream;
    //                 audio.play();
    //             });

    //             call.on("error", (err) => {
    //                 console.error("Receiver error:", err);
    //             });
    //         } else {
    //             console.error("Unable to access local stream.");
    //         }
    //     });

    // }




    // };




    // loading skeleton.
    if (loading) {
        return (
            <InboxSkeleton />
        )
    }


    // grid-rows-[10%_80%_10%]

    return (
        <div className={`grid ${receiverProfile.request || Object.keys(replyText).length !== 0 || imagePreviews.length !== 0 ? 'grid-rows-[10%_70%_10%_10%]' : `grid-rows-[10%_80%_10%]`}  h-screen`}>

            {/* header */}
            <div className=' flex items-center justify-evenly border-b border-gray-500'>
                <div className="flex items-center gap-5">

                    {/* <Image src={`${process.env.NEXT_PUBLIC_API}/${receiverProfile.receiverPic}`} alt="tamjid" width={500} height={500} className="w-[50px] h-[50px] rounded-full " /> */}

                    <Image src={receiverProfile.receiverPic === 'public/default.jpg' ? `${process.env.NEXT_PUBLIC_API}/${receiverProfile.receiverPic}` : receiverProfile.receiverPic} alt="tamjid" width={500} height={500} className="w-[50px] h-[50px] rounded-full " />

                    <div>
                        <h1 className="font-bold">{receiverProfile.receiverName}</h1>
                        <p>{userTyping ? 'Typing...' : 'Online'}</p>
                    </div>
                </div>

                <div className=" flex gap-6">
                    <div className="text-[25px] cursor-pointer" onClick={handleCall}>
                        <Icon icon="ph:phone-call-bold" />
                    </div>

                    <div className="text-[25px] cursor-pointer" onClick={answerCall} >
                        <Icon icon="pepicons-pop:camera" />
                    </div>

                </div>


            </div>




            {/* body */}

            <div className=' overflow-y-auto'>

                <div className="flex flex-col items-center  mt-10">
                    <Image
                        alt="image"
                        src={receiverProfile.receiverPic === 'public/default.jpg' ? `${process.env.NEXT_PUBLIC_API}/${receiverProfile.receiverPic}` : receiverProfile.receiverPic}
                        width={200}
                        height={200}
                        objectFit="cover"
                        className="rounded-full w-[80px] h-[80px] object-cover"
                    />
                    <div className="flex flex-col items-center mt-3">
                        <h1 className="text-[20px] font-bold">{receiverProfile.receiverName}</h1>

                        <h2 className="font-semibold text-gray-500">{receiverProfile.receiverAbout}</h2>
                        <span className="font-semibold text-gray-500">{receiverProfile.receiverUsername}</span>
                    </div>


                </div>


                {messages.length === 0 ?
                    <div className="flex  justify-center  text-center mt-20 mx-5">
                        <h1 className="font-bold text-gray-500">Your inbox is empty! Start a new conversation and make it memorable!🤗</h1>
                    </div>
                    :

                    <div className="mt-10">
                        {messages.map((value, i) => (

                            <motion.div
                                key={i}
                                className={`flex ${value.whoSend ? "justify-start items-end" : "justify-end"} mx-5 my-4`}
                                initial={{ opacity: 0, y: 20 }} // Start invisible and slightly below
                                animate={{ opacity: 1, y: 0 }} // Fade in and slide up
                                transition={{ duration: 0.3 }} // Animation duration
                            >
                                <div className={`${value.whoSend ? "" : "hidden"}`}>
                                    {value.profile && (
                                        <Image
                                            alt="image"
                                            src={value.profile === 'public/default.jpg' ? `${process.env.NEXT_PUBLIC_API}/${receiverProfile.receiverPic}` : value.profile}
                                            width={200}
                                            height={200}
                                            objectFit="cover"
                                            className="rounded-full w-[40px] h-[40px] object-cover"
                                        />
                                    )}
                                </div>


                                <div className={`  flex items-center gap-2 ${value.whoSend ? 'flex-row' : ' flex-row-reverse'} `}>

                                    <div className="  ">

                                        {value.type === 'reply' && (() => {

                                            const replyTextById = messages.find((msg) => msg.messageId === value.replyMessageId)



                                            // console.log(replyText, 'replytextbyid')

                                            return (
                                                <div >
                                                    {value.whoSend ?
                                                        (
                                                            <div>
                                                                <p><span>{value.name} replied to you</span></p>
                                                                <div className="bg-[#f6f6f6] rounded-xl p-4 text-gray-500 cursor-pointer" onClick={() => scrollToReplyText(replyTextById.messageId)}>
                                                                    <p>{replyTextById?.text.length > 80 ? replyTextById.text.substring(0, 50) + '...' : replyTextById?.text}</p>
                                                                </div>

                                                            </div>

                                                        )

                                                        :
                                                        (
                                                            <div>

                                                                <p>You replied to <span>{replyTextById?.name}</span></p>
                                                                <div className="bg-[#f6f6f6] rounded-xl p-4 text-gray-500 max-w-[15rem] cursor-pointer" onClick={() => scrollToReplyText(replyTextById.messageId)}>
                                                                    <p className=" break-words">{replyTextById?.text.length > 80 ? replyTextById.text.substring(0, 50) + '...' : replyTextById?.text}</p>
                                                                </div>

                                                            </div>

                                                        )

                                                    }



                                                </div>
                                            )

                                        })()}

                                        <div
                                            id={value.messageId}
                                            className={`   ${value.whoSend ? "bg-[#f0f0f0] text-black" : "bg-teal-500 text-white"} max-w-[14rem]  rounded-xl ml-4 ${value.type === 'image' ? 'p-1' : 'p-4'}`}
                                        >
                                            {/* <h1 className="break-words">{value.text}</h1> */}


                                            {value.type === 'text' ? (
                                                <h1 className="break-words">{value.text}</h1>
                                            ) :
                                                (
                                                    <div>
                                                        {value.type === 'reply' && (
                                                            <div className="relative ">

                                                                <h1 className="break-words">{value.text}</h1>

                                                            </div>

                                                        )}
                                                    </div>
                                                )
                                            }

                                            {value.type === 'image' && (
                                                <div className="w-full h-auto">



                                                    <Image
                                                        alt="message image"
                                                        src={value.text} // Assuming imageUrl is available in the message object
                                                        width={500}
                                                        height={500}
                                                        objectFit="cover"
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                            )}



                                            {value.type === 'voice' && (
                                                <div className="w-full h-auto">
                                                    <VoiceMessage audioUrl={value.text} waveColor={value.whoSend ? "#000" : "#fff"} progressColor={value.whoSend ? "#717171" : "#DDDDDD"} />
                                                </div>
                                            )}

                                            <div className=" flex justify-end mt-2 ">
                                                <p className="text-[12px]"> {value.date}</p>

                                            </div>





                                        </div>


                                        {i === lastSeenIndex && (
                                            <div className=" flex justify-end mt-2">
                                                <Image
                                                    alt="image"
                                                    src={receiverProfile.receiverPic === 'public/default.jpg' ? `${process.env.NEXT_PUBLIC_API}/${receiverProfile.receiverPic}` : receiverProfile.receiverPic}
                                                    width={200}
                                                    height={200}
                                                    objectFit="cover"
                                                    className="rounded-full w-[20px] h-[20px] object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div onClick={() => reply(value.messageId)} className=" cursor-pointer" >
                                        <Icon icon="bxs:share" width="24" height="24" />
                                    </div>

                                </div>



                            </motion.div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>





                }







            </div>


            {receiverProfile.request && (
                <div className=" flex items-center justify-center text-center rounded-t-xl border px-2">
                    <h1>This person sent you a message request. If you reply to this message, it will automatically accept the message request.</h1>
                </div>

            )}


            {Object.keys(replyText).length !== 0 && (
                <div className="p-6 border-t flex justify-between">
                    {replyText.whoSend ?

                        <div>
                            <p>Replying to <span className="font-bold">{replyText.name}</span></p>
                            <p>{replyText.text.length > 80 ? `${replyText.text.substring(0, 40)}...` : replyText.text}</p>
                        </div>


                        : <div>
                            <p>Replying to yourself</p>
                            <p>{replyText.text.length > 80 ? `${replyText.text.substring(0, 40)}...` : replyText.text}</p>
                        </div>}

                    <div onClick={() => setReplyText({})} className=" cursor-pointer">  <Icon icon="material-symbols:cancel-outline" width="24" height="24" /> </div>
                </div>
            )}












            {/* Footer */}
            <div className=' border-t border-gray-500 '>

                {isRecording ? (
                    <div className="flex justify-center gap-4  items-center py-4">
                        {/* Timer Display during recording */}
                        <span className="text-xl font-semibold text-gray-800">{formatTimer(timer)}</span>

                        {/* Control Buttons */}
                        <div className="flex gap-4">
                            {isPaused ? (
                                <button
                                    onClick={resumeRecording}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Resume
                                </button>
                            ) : (
                                <button
                                    onClick={pauseRecording}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Pause
                                </button>
                            )}
                            <button
                                onClick={stopRecording}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                            >
                                Stop
                            </button>
                        </div>
                    </div>

                ) : audioUrl ? (
                    <div className=" flex justify-between items-center px-9">
                        {/* Audio Preview */}
                        <div >
                            {/* 'https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3' */}
                            <AudioWaveform audioUrl={audioUrl} />
                        </div>
                        <button className=" bg-red-500 p-2 rounded-xl text-white" onClick={cancel}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            className="p-2 text-gray-400 hover:text-black"
                        >
                            <Icon icon="iconamoon:send" className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Image Previews */}
                        <div className="flex gap-5">
                            {imagePreviews.map((image, index) => (
                                <div key={index} className="relative">
                                    {/* Image Preview */}
                                    <Image
                                        src={image.preview}
                                        width={500}
                                        height={500}
                                        alt={`Preview ${index}`}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    {/* Remove button */}
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Input Section */}
                        <div className="p-4 flex items-center justify-between rounded-t-xl">
                            {/* Left Icon */}
                            <button className="p-2 text-gray-400 hover:text-black">
                                <Icon icon="fluent:emoji-32-light" className="w-6 h-6" />
                            </button>

                            {/* Input Box */}
                            <div className="flex items-center w-full mx-3 !border-black border border-transparent focus-within:border-purple-500 rounded-full px-4 py-2">
                                <input
                                    onChange={handleMessagesChange}
                                    value={inputText}
                                    type="text"
                                    placeholder="Message..."
                                    className="w-full bg-transparent text-black placeholder-gray-500 focus:outline-none"
                                />
                                <button
                                    className="ml-2 text-gray-400 hover:text-black"
                                    onClick={startRecording}
                                >
                                    <Icon icon="material-symbols:mic" className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Right Icons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleButtonClick}
                                    className="p-2 text-gray-400 hover:text-black"
                                >
                                    <Icon icon="solar:gallery-bold" className="w-6 h-6" />
                                </button>

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: "none" }} // Hide the input element
                                />
                                <button
                                    onClick={handleSend}
                                    className="p-2 text-gray-400 hover:text-black"
                                >
                                    <Icon icon="iconamoon:send" className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}









                {/* <div>

<div className="flex gap-5">
    {imagePreviews.map((image, index) => (
        <div key={index} className="relative">
         
            <Image
                src={image.preview}
                width={500}
                height={500}
                alt={`Preview ${index}`}
                className="w-16 h-16 object-cover rounded-md"
            />
         
            <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0  bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
                ×
            </button>
        </div>
    ))}
</div>



<div className=" p-4 flex items-center justify-between  rounded-t-xl">
    
    <button className="p-2 text-gray-400 hover:text-black">
        <Icon icon='fluent:emoji-32-light' className="w-6 h-6" />
    </button>

 
    <div className="flex items-center w-full mx-3 !border-black border border-transparent focus-within:border-purple-500 rounded-full px-4 py-2">
        <input
            onChange={handleMessagesChange}
            value={inputText}
            type="text"
            placeholder="Message..."
            className="w-full bg-transparent text-black placeholder-gray-500 focus:outline-none"
        />
        <button className="ml-2 text-gray-400 hover:text-black"
            onClick={startRecording}

        >
            <Icon icon='material-symbols:mic' className="w-5 h-5" />
        </button>
    </div>

   
    <div className="flex items-center space-x-2">
        <button
            onClick={handleButtonClick}
            className="p-2 text-gray-400 hover:text-black"
        >
            <Icon icon="solar:gallery-bold" className="w-6 h-6" />
        </button>

   
        <input
            type="file"
            accept="image/*" // Only accept image files
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide the input element
        />
        <button onClick={handleSend} className="p-2 text-gray-400 hover:text-black">
            <Icon icon='iconamoon:send' className="w-6 h-6" />
        </button>
    </div>
</div>

</div> */}


            </div>

        </div>
    )
}

export default Inbox