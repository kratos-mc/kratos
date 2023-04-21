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
  return <div className={`${className}`}>{children}</div>;
}
