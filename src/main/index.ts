import { app } from "electron";
import { MainLauncherWindow } from "./window";
import * as path from "path";
import { isDevelopment } from "./app";
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
  logger.info("Initializing the main window");
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
