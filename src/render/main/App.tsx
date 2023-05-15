import React, { useEffect } from "react";
import "./../import-tailwind.css";
import { HashRouter, Routes, Route } from "react-router-dom";
// @ts-ignore
import AsideMenu from "./components/AsideMenu/AsideMenu";
// @ts-ignore
import Home from "./routes/Home/Home";
// @ts-ignore
import AppLayout from "./AppLayout";
import "./index.css";
import useLoadAccounts from "./hooks/useLoadAccounts";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useSelector } from "react-redux";
import { RootState } from "./stores/RenderStore";
import RequestAccount from "./components/RequestAccount/RequestAccount";
const contextClass = {
  success: "bg-blue-600",
  error: "bg-red-600",
  info: "bg-neutral-400",
  warning: "bg-orange-400",
  default: "bg-indigo-600",
  dark: "bg-white-600 font-gray-300",
};
function App() {
  const accounts = useSelector((state: RootState) => state.app.accounts);
  // useEffect(() => {
  //   console.log({
  //     node: window.versions.node(),
  //     chrome: window.versions.chrome(),
  //     electron: window.versions.electron(),
  //   });
  //   return () => {};
  // });

  useLoadAccounts();

  return (
    <HashRouter>
      <div className="draggable-area h-[36px] pl-[20vw]">
        <span className="block pt-2 text-sm font-bold dark:text-neutral-100">
          Kratos Launcher
        </span>
      </div>
      <div className="fixed top-[36px] left-0 bg-transparent w-full h-full flex flex-row">
        {/* Routes switching */}
        {accounts === undefined ||
        accounts === null ||
        accounts.length === 0 ? (
          <RequestAccount />
        ) : (
          <>
            {/* Left aside menu */}
            <AsideMenu />

            <AppLayout className="w-5/6">
              <Routes>
                <Route path="/" index element={<Home />} />
              </Routes>
            </AppLayout>
          </>
        )}
      </div>

      <ToastContainer
        toastClassName={({ type }) =>
          contextClass[type || "default"] +
          " relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
        }
        bodyClassName={() => "text-sm font-white font-med block p-3"}
        // @ts-ignore
        transition={`slide`}
        position="bottom-left"
        autoClose={3000}
      />
    </HashRouter>
  );
}

export default App;
