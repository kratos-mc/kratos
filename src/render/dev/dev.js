import React from "react";
import { createRoot } from "react-dom/client";
import DevKit from "./DevKit";

const app = document.getElementById("app");
createRoot(app).render(<DevKit />);
