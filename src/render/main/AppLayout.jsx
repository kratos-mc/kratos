import React from "react";
import { Outlet } from "react-router-dom";
/**
 * Creates a div with safe-area for rendering the react application freely.
 *
 * @param {*} param0
 * @returns the application layout which create a safe area
 *
 */
export default function AppLayout({ className, children }) {
  return (
    <div className={`${className}`}>
      <div className="draggable-area h-[32px] px-4">
        <span className="block pt-2 text-sm font-bold">Kratos Launcher</span>
      </div>

      {children}
    </div>
  );
}
