import { app, BrowserWindow } from "electron";
import { Menu } from "electron/main";
import * as path from "path";
import {
  getAppPreload,
  getLauncherWorkspace,
  getRenderAssetURL,
  initBrowserWindow,
  isDevelopment,
} from "./app";
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
  let mainWindow: BrowserWindow = initBrowserWindow("main", {
    webPreferences: {
      preload: getAppPreload(),
    },
  });
  mainWindow.loadURL(getRenderAssetURL("index.html"));

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
});
