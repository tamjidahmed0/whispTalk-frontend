'use client'
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DesktopNavigation = () => {
    const pathname = usePathname()


  // Array of menu items
  const menuItems = [
    { label: 'Chat', path: '/direct/inbox?onscreen=false', icon: 'line-md:chat' },
    { label: 'Call', path: '/call', icon: 'line-md:phone-call' },
    { label: 'Request', path: '/request', icon: 'ri:user-shared-line' },
    { label: 'Notification', path: '/notification', icon: 'iconamoon:notification-light' },
    { label: 'Profile', path: '/profile', icon: 'gg:profile' },
  ];

  return (
    <div className="w-full flex flex-col gap-10 justify-evenly">
      {menuItems.map((item, index) => (
        <Link
          key={index}
          href={item.path}
          className={`text-[30px] flex flex-col items-center ${
            pathname === item.path && 'text-blue-500'
          }`}
        >
          <Icon icon={item.icon} />
          <span className="text-[13px]">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default DesktopNavigation;
