import { Icon } from '@iconify/react';
import Link from 'next/link';


const BottomNavigation = () => {
  return (
    <div className=' w-full flex justify-evenly'>
        <Link href={'/direct/inbox'} className='text-[30px] flex flex-col items-center'>
        <Icon icon="line-md:chat" />
        <span className='text-[13px]'>Chat</span>
        </Link>
       
        <Link href={''} className='text-[30px] flex flex-col items-center'>
        <Icon icon="line-md:phone-call" />
        <span className='text-[13px]'>Call</span>
        </Link>

        <Link href={''} className='text-[30px] flex flex-col items-center'>
        <Icon icon="ri:user-shared-line" />
        <span className='text-[13px]'>Request</span>
        </Link>

        <Link href={''} className='text-[30px] flex flex-col items-center '>
        <Icon icon="iconamoon:notification-light" />
        <span className='text-[13px]'>Notification</span>
        </Link>

        <Link href={''} className='text-[30px] flex flex-col items-center'>
        <Icon icon="gg:profile" />
        <span className='text-[13px]'>Profile</span>
        </Link>

    </div>
  )
}

export default BottomNavigation