import React, { useEffect } from "react";
import "./../import-tailwind.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import AsideMenu from "./components/AsideMenu/AsideMenu";
import Home from "./routes/Home/Home";
import AppLayout from "./AppLayout";
import "./index.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const contextClass = {
  success: "bg-blue-600",
  error: "bg-red-600",
  info: "bg-neutral-400",
  warning: "bg-orange-400",
  default: "bg-indigo-600",
  dark: "bg-white-600 font-gray-300",
};
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

        {/* Routes switching */}
        <AppLayout className="w-5/6">
          <Routes>
            <Route path="/" index element={<Home />} />
          </Routes>
        </AppLayout>
      </div>

      <ToastContainer
        toastClassName={({ type }) =>
          contextClass[type || "default"] +
          " relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
        }
        bodyClassName={() => "text-sm font-white font-med block p-3"}
        transition={`slide`}
        position="bottom-left"
        autoClose={3000}
      />
    </HashRouter>
  );
}

export default App;
