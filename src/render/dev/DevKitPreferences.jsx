import React from "react";

export default function DevKitPreferences() {
  const handleOpenDirLauncher = () => window.utils.openLauncherDir();

  return (
    <div>
      <h1>Preferences</h1>
      <button onClick={handleOpenDirLauncher}>Open launcher dir</button>
    </div>
  );
}
