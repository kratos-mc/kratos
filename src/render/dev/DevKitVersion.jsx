import React from "react";

export default function DevKitVersion() {
  const handleOnClick = () => {
    console.log("node: " + window.versions.node());
    console.log("electron: " + window.versions.electron());
    console.log("chrome: " + window.versions.chrome());
  };

  return (
    <div>
      <h1>Version</h1>
      <button onClick={handleOnClick}>Show versions</button>
    </div>
  );
}
