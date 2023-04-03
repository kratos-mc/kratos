import { BrowserWindowManager, WindowId } from "./window";
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
} from "electron";
import { workspace } from "kratos-core";
import path from "path";

let globalLauncherWorkspace: workspace.LauncherWorkspace;
let globalWindowManager: BrowserWindowManager;

export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export function isProduction() {
  return process.env.NODE_ENV === "production" || app.isPackaged;
}

export function getLauncherWorkspace() {
  // Create a new instance if the launcher workspace is not found
  if (globalLauncherWorkspace === undefined) {
    globalLauncherWorkspace = new workspace.LauncherWorkspace(
      path.resolve(app.getPath("appData"), app.getName())
    );
  }
  return globalLauncherWorkspace;
}

export function getBrowserWindowManager() {
  if (globalWindowManager === undefined) {
    globalWindowManager = new BrowserWindowManager();
  }

  return globalWindowManager;
}

export function getAppPreload() {
  return path.resolve(app.getAppPath(), "dist", "preload.js");
}

export function initBrowserWindow(
  id: WindowId,
  options?: BrowserWindowConstructorOptions
) {
  let w: BrowserWindow;
  const browserWindowManager = getBrowserWindowManager();
  if (!browserWindowManager.hasBrowserWindow(id)) {
    w = browserWindowManager.createBrowserWindow(id, options);
  } else {
    w = browserWindowManager.getBrowserWindow(id);
  }

  return w;
}

export function getRenderAssetURL(assetName: string) {
  let baseUrl;
  if (isDevelopment()) {
    baseUrl = "http://localhost:1234";
  } else {
    baseUrl = "file://dist/render";
  }

  return baseUrl + "/" + assetName;
}
