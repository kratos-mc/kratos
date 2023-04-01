import React, { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log({
      node: window.versions.node(),
      chrome: window.versions.chrome(),
      electron: window.versions.electron(),
    });
    return () => {};
  });
  return (
    <div>
      <div>Hello Kratos, this is a Minecraft Launcher</div>
    </div>
  );
}

export default App;
