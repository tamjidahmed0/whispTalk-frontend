import Image from "next/image"
import tamjid from '@/assets/tamjid.jpg'
import { Icon } from '@iconify/react';
import Inbox from "@/components/Inbox";

import DesktopNavigation from "@/components/DesktopNavigation"
import ChatList from "@/components/ChatList"
import BottomNavigation from "@/components/BottomNavigation"

const Page = () => {
  return (

    <div
      className={` `}
    >
      <div className="grid grid-rows-[10%_80%_10%] lg:grid-rows-none lg:grid-cols-[10%_30%_60%] xl:grid-cols-[5%_25%_70%] h-screen">
        <div className=" flex items-center justify-center lg:hidden">Top (25)</div>


        <div className=" hidden lg:flex flex-col justify-evenly border-r border-black">
          <DesktopNavigation />
        </div>


        <div className="bg-gray-100  px-4 overflow-y-auto border-r border-black">
          <div className=" ">
            search box
          </div>
          <ChatList />

        </div>


        <div className=" items-center justify-center hidden lg:flex ">
          desktop inbox
          {/* <Inbox /> */}


        </div>



        <div className=" flex items-center lg:hidden ">
          <BottomNavigation />
        </div>
      </div>
    </div>

  )
}

export default Page