import { createRoot } from "react-dom/client";
import App from "./App";

import { store } from "./stores/RenderStore";
import { Provider } from "react-redux";

const app = document.getElementById("app");
const root = createRoot(app);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
