import React from "react";

export default function ProfileSelector({ onClick, currentProfile }) {
  return (
    <button
      className="border border-blue-700 px-2 py-1 rounded-md 
    flex flex-row gap-4 items-center shadow-sm hover:shadow-md
    transition-all"
      onClick={onClick}
    >
      <div>Profile name</div>
      <div className="text-xs text-neutral-500">1.19.4</div>
    </button>
  );
}
