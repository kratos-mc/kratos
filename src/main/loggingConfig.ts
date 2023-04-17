import * as path from "path";
import { getLauncherWorkspace } from "./app";

export function getLoggingConfigPath() {
  const assetDirectory = getLauncherWorkspace()
    .getAssetWorkspace()
    .getDirectory()
    .toString();

  return path.join(assetDirectory, "log_configs");
}
