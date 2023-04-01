import { app } from "electron";
import { workspace } from "kratos-core";
import path from "path";
let globalLauncherWorkspace: workspace.LauncherWorkspace;

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
