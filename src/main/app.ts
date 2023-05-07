import { BrowserWindowManager, WindowId } from "./window";
import { app, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { workspace, version } from "kratos-core";
import path from "path";
import { logger } from "./logger/logger";
import { existsSync, readJson } from "fs-extra";
import { kratosRuntime } from "kratos-runtime-resolver";
import { DownloadPool } from "./downloadPool";
import { pathToFileURL, format } from "url";
import { Indicator, indicator } from "./indicator/indicator";
import { account } from "./accounts/account";

let globalLauncherWorkspace: workspace.LauncherWorkspace;
let globalWindowManager: BrowserWindowManager;
let globalVersionManager: version.VersionManager;
let globalDownloadPool: DownloadPool;
let globalRuntimeWorkspace: kratosRuntime.RuntimeWorkspace;
let globalDownloadIndicator: Indicator;

export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export function isProduction() {
  return process.env.NODE_ENV === "production" || app.isPackaged;
}

export function getLauncherWorkspace() {
  if (
    process !== undefined &&
    process.env !== undefined &&
    process.env.NODE_ENV === "testing"
  ) {
    app.setName("Kratos");
  }

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
  let url = format(
    isDevelopment()
      ? {
          protocol: "http",
          hostname: "localhost",
          port: "1234",
          pathname: assetName,
        }
      : {
          protocol: "file",
          slashes: true,
          pathname: path.join(app.getAppPath(), "dist", "render", assetName),
        }
  );

  return url.toString();
}

export async function loadGameManifest() {
  const versionWorkspace = getLauncherWorkspace().getVersionWorkspace();
  try {
    logger.info("Fetching manifest...");
    globalVersionManager = await version.fetchVersionManifest();
    // assign to global

    logger.info(
      `Successfully fetch the manifest file, writing into "${versionWorkspace.getManifestPath()}"`
    );
    // Write a manifest into a workspace
    versionWorkspace.writeManifest(
      Buffer.from(JSON.stringify(globalVersionManager.getRawManifest()))
    );
  } catch (error) {
    logger.error(
      `Unable to create a connection to manifest server. Trying to use local cache...`
    );

    if (error && error.message && error.message.includes("request to")) {
      // failed to fetch
      if (!existsSync(versionWorkspace.getManifestPath())) {
        throw new Error(
          "Unable to update the manifest file. Please check your connection"
        );
      }

      // read from workspace
      globalVersionManager = new version.VersionManager(
        await readJson(versionWorkspace.getManifestPath())
      );
    }
    // throw error;
  }
}

export function getVersionManager() {
  if (!globalVersionManager) {
    throw new Error("Version manager is undefined");
  }

  return globalVersionManager;
}

export function getDownloadPool() {
  if (globalDownloadPool === undefined) {
    globalDownloadPool = new DownloadPool();
  }

  return globalDownloadPool;
}

export function getRuntimeWorkspace() {
  if (!globalRuntimeWorkspace) {
    globalRuntimeWorkspace = new kratosRuntime.RuntimeWorkspace(
      getLauncherWorkspace().getDirectory().toString()
    );
  }

  return globalRuntimeWorkspace;
}

/**
 * Represents an abbreviation function for check whether or not the system platform is windows.
 *
 * @returns true if the current running platform is windows, false otherwise
 */
export function isWindows() {
  return process.platform === "win32";
}
/**
 * Represents an abbreviation function for check whether or not the system platform is macos.
 *
 * @returns true if the current running platform is macos, false otherwise
 */
export function isOsx() {
  return process.platform === "darwin";
}

/**
 * Represents an abbreviation function for check whether or not the system platform is linux.
 *
 * @returns true if the current running platform is linux, false otherwise
 */
export function isLinux() {
  return process.platform === "linux";
}

export function getNativesPath() {
  return path.join(getLauncherWorkspace().getDirectory().toString(), "natives");
}

export function getDownloadIndicator() {
  if (globalDownloadIndicator === undefined) {
    globalDownloadIndicator = indicator.createProgressIndicator(
      "Downloading",
      "<item here>",
      0
    );
    indicator.hideIndicator(globalDownloadIndicator.getId());
  }
  return globalDownloadIndicator;
}

export function loadAccounts() {
  // Load the file if the file is not available
  account.initAccountFile();
}
