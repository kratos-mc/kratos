import { app, BrowserWindow } from "electron";
import { Menu } from "electron/main";
import * as path from "path";
import {
  getAppPreload,
  getBrowserWindowManager,
  getLauncherWorkspace,
  getRenderAssetURL,
  getVersionManager,
  initBrowserWindow,
  isDevelopment,
  loadGameManifest,
} from "./app";
import { loadIpcListener } from "./ipc";
import { logger } from "./logger/logger";
import { getProfileManager, loadLatestProfile } from "./profile";

app.whenReady().then(async () => {
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

  // Show loading splash screen before fetch anything
  const loadingSplashScreenWindow = showLoadingSplashScreen();

  // Load game manifest
  await loadGameManifest();

  logger.info(
    `Latest minecraft version is ${getVersionManager()
      .getLatestReleasePackageInfo()
      .getId()}`
  );

  // Load profile manager if has no profile founded
  if (getProfileManager().getAllProfiles().length === 0) {
    const profile = loadLatestProfile(getVersionManager());
    logger.info(
      `No profile was found, create a initial profile with name 'Latest' (uid: ${profile.id})`
    );
  }

  // Load an IPC main register
  logger.info("Initializing ipc");
  loadIpcListener(getBrowserWindowManager(), getVersionManager());

  initialWindow();

  // After finish all of this, hide loading
  loadingSplashScreenWindow.hide();

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
  mainWindow.loadURL(getRenderAssetURL("index.html").toString());
  // mainWindow.loadFile("file://dist/render/index.html");
  return mainWindow;
}

/**
 * handle before quit
 */
app.on("before-quit", () => {
  // Forcibly destroy all electron app before quit the application
  for (let window of getBrowserWindowManager().getAllWindows()) {
    window.destroy();
  }

  // Store all profile
  getProfileManager().storeProfile();
});

/**
 * Close all if Windows or linux system quit all windows.
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function initialWindow() {
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

  devWindow.loadURL(getRenderAssetURL("dev.html").toString());
  devWindow.setPosition(0, 0);
  process.env.NODE_ENV === "development" ? devWindow.show() : devWindow.hide();
  devWindow.on("close", (e) => {
    e.preventDefault();

    devWindow.hide();
  });
}

function showLoadingSplashScreen() {
  const loadingWindow = initBrowserWindow("loading", {
    title: "Kratos Launcher - Initializing",
    width: 400,
    height: 200,
    frame: false,
    webPreferences: {},
  });
  // Load the loading screen asset
  loadingWindow.loadURL(getRenderAssetURL(`load.html`));
  // Stick it onto the top
  loadingWindow.setAlwaysOnTop(true, "status");

  return loadingWindow;
}
