import React, { useEffect } from "react";
import "./../import-tailwind.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import AsideMenu from "./components/AsideMenu/AsideMenu";
import Home from "./routes/Home/Home";

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
    <HashRouter>
      <div className="fixed top-0 left-0 bg-transparent w-full h-full flex flex-row">
        {/* Left aside menu */}
        <AsideMenu />

        {/*   Routes switching*/}
        <div className="w-5/6 bg-neutral-200">
          <Routes>
            <Route path="/" index element={<Home />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
