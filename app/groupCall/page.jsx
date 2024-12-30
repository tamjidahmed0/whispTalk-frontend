'use client';
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Peer from "peerjs";

const groupCall = () => {
  const [name, setName] = useState('');
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState('');
  const peerRef = useRef(null)
  const query = useSearchParams().get('peerOffer') 
 







useEffect(() => {

  const handleCall = new BroadcastChannel('handleCall');

 
  const callAccepted = new BroadcastChannel("call:accepted");




  const peerInstance = new Peer(); // Initialize PeerJS instance
  setPeer(peerInstance);
  peerRef.current = peerInstance

  peerInstance.on('open', (id) => {
    console.log("Your Peer ID:", id);
    setPeerId(id); // Save your Peer ID






    console.log("New tab ready. Sending 'ready' message...");
    handleCall.postMessage("ready");
    
   
      // Listen for messages
      handleCall.onmessage = (event) => {
       
        console.log("Message received in Tab 2:", event.data);
  
        if(event.data === 'call'){
  
  
          handleCall.postMessage({
            eventName : 'sendPeerId',
            peerId : id
          })
  
          
  
       
        }
     

      };
  
  

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
        call.on('close', () =>{
          console.log( 'call close')
        })
    } else {
        console.error("Unable to access local stream.");
    }
});



  return () => {
    peerInstance.destroy(); // Clean up PeerJS instance on unmount
   
  };
}, []);



const getLocalStream = async () => {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Local stream captured:", stream);
      return stream;
  } catch (error) {
      console.log("Error accessing audio devices:", error);
  }
};




if(query){

  if (peerRef.current ) {
    // 4. Respond to the caller by answering the call
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        console.log("Answering call with stream...");
        const call = peerRef.current.call(query, stream); // Answer the call with your audio stream

        call.on("stream", (remoteStream) => {
            console.log("Connected to caller!");

            // Play the remote audio stream
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play();
        });



    });
}
}








  return (
    <div>
      <h1>PeerJS Test</h1>
      <p>Connected Peer Name: {name}</p>
      <p>Your Peer ID: {peerId}</p>
    </div>
  );
};

export default groupCall;

