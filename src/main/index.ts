import { app } from "electron";
import { MainLauncherWindow } from "./window";
import * as path from "path";
import { isDevelopment } from "./app";
import { logger } from "./logger/logger";

app.whenReady().then(() => {
  /**
   * Preload the application
   */
  logger.info(`Application directory: ${app.getAppPath()}`);

  /**
   * Render
   */
  const mainLauncherWindow = new MainLauncherWindow({
    webPreferences: {
      preload: path.resolve(app.getAppPath(), "dist", "preload.js"),
    },
  });

  if (isDevelopment()) {
    mainLauncherWindow.browserWindow.loadURL("http://localhost:1234");
  } else {
    mainLauncherWindow.browserWindow.loadFile(
      path.join(app.getAppPath(), "dist", "render", "index.html")
    );
  }
});
