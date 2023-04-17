import React from "react";
import "./../import-tailwind.css";
import "./loading.css"
export default function LoadingApp() {
  return (
    <div className="loading-wrapper dark:bg-neutral-700 bg-neutral-100 w-full h-full top-0 left-0 fixed flex flex-col items-center justify-center gap-2">
      <div className="loading-text">
        <b>Initializing </b>
      </div>
      <div className="loading-progress-bar h-2 w-2/3 rounded bg-neutral-900 px-1 py-1 animate-pulse"></div>
    </div>
  );
}
