import { ipcMain } from "electron/main";
import { BrowserWindowManager } from "./window";

export function loadIpcListener(browserManager: BrowserWindowManager) {
  /**
   *
   */
  ipcMain.on("util:open-dev-tool", (e, options) => {
    const devWindow = browserManager.getBrowserWindow("dev");
    if (devWindow === undefined) {
    }

    devWindow.show();
    // Neither width nor height is an integer
    if (options) {
      options.width !== undefined ||
        (options.height !== undefined &&
          devWindow.setSize(
            options.width ?? 300,
            options.height ?? 400,
            false
          ));
    }
  });
}
