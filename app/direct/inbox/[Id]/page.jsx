import Inbox from "@/components/Inbox"
import DesktopNavigation from "@/components/DesktopNavigation"
import ChatList from "@/components/ChatList"
import BottomNavigation from "@/components/BottomNavigation"
import { Suspense } from "react"


const page = async ({ params }) => {
  const paramsId = await params

  return (
    <div>


  
        <Inbox params={paramsId}  />
    

    </div>
  )
}

export default page