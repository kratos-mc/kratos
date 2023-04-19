import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosHome, IoIosSettings } from "react-icons/io";

export default function AsideMenu() {
  const [menuItems] = useState([
    {
      text: "Home",
      url: `/`,
      icon: <IoIosHome />,
    },
    {
      text: "Setting",
      url: `/settings`,
      icon: <IoIosSettings />,
    },
  ]);

  return (
    <div className="aside-menu-wrapper min-w-1/6 w-1/6 items-center mt-[32px]">
      <div className="flex flex-col ">
        {menuItems.map((item) => {
          return (
            <AsideMenuItemButton
              text={item.text}
              url={item.url}
              icon={item.icon}
            />
          );
        })}
      </div>
    </div>
  );
}

function AsideMenuItemButton({ text, icon, url }) {
  return (
    <Link
      className="px-6 py-3 dark:text-neutral-300 
        hover:bg-opacity-60 dark:hover:bg-neutral-900
        hover:text-blue-700
        transition-colors ease-in-out flex flex-row items-center"
      to={url}
    >
      <span className="mr-4">{icon}</span>
      <span>{text}</span>
    </Link>
  );
}
