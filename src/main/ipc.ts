import { ipcMain } from "electron/main";
import { BrowserWindowManager } from "./window";

export function loadIpcListener(browserManager: BrowserWindowManager) {
  ipcMain.on("util:open-dev-tool", () => {
    browserManager.getBrowserWindow("dev").show();
  });
}
