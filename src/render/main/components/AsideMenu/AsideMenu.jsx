import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function AsideMenu() {
  const [menuItems] = useState([
    {
      text: "Home",
      url: `/`,
    },
  ]);

  return (
    <div className="aside-menu-wrapper w-1/6 items-center mt-[32px]">
      <div className="flex flex-col ">
        {menuItems.map((item) => {
          return <AsideMenuItemButton text={item.text} url={item.url} />;
        })}
      </div>
    </div>
  );
}

function AsideMenuItemButton({ text, url }) {
  return (
    <Link className="px-4 py-3 " to={url}>
      {text}
    </Link>
  );
}
