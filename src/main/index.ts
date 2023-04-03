import { app, BrowserWindow } from "electron";
import { Menu } from "electron/main";
import * as path from "path";
import {
  getAppPreload,
  getBrowserWindowManager,
  getLauncherWorkspace,
  getRenderAssetURL,
  initBrowserWindow,
  isDevelopment,
} from "./app";
import { loadIpcListener } from "./ipc";
import { logger } from "./logger/logger";

app.whenReady().then(() => {
  /**
   * Preload the application
   */

  const userData = path.resolve(app.getPath("appData"), app.name, "web-cache");
  app.setPath("userData", userData);
  logger.info(`UserData path: ${userData}`);
  logger.info(`Application directory: ${app.getAppPath()}`);
  logger.info(
    `Launcher data directory: ${getLauncherWorkspace().getDirectory()}`
  );

  /**
   * Render a main launcher window
   */
  logger.info("Initializing windows");

  /**
   * Load the main window
   * and resolve url (or file)
   */
  let mainBrowser = loadMainBrowser();

  /**
   * Load development toolkit
   */

  let devWindow: BrowserWindow = initBrowserWindow("dev", {
    title: "Kratos Dev",
    webPreferences: {
      preload: getAppPreload(),
    },
  });
  devWindow.webContents.openDevTools({
    mode: "right",
  });
  devWindow.loadURL(getRenderAssetURL("dev.html"));
  devWindow.hide();
  devWindow.on("close", (e) => {
    e.preventDefault();

    devWindow.hide();
  });

  // Load an IPC main register
  logger.info("Initializing ipc");
  loadIpcListener(getBrowserWindowManager());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      loadMainBrowser();
    }
  });
});

function loadMainBrowser() {
  let mainWindow: BrowserWindow = initBrowserWindow("main", {
    webPreferences: {
      preload: getAppPreload(),
    },
  });
  mainWindow.loadURL(getRenderAssetURL("index.html"));
  return mainWindow;
}

/**
 * Forcibly destroy all electron app before quit the application
 */
app.on("before-quit", () => {
  for (let window of getBrowserWindowManager().getAllWindows()) {
    window.destroy();
  }
});

/**
 * Close all if Windows or linux system quit all windows.
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
