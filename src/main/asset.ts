import * as path from "path";
import { version } from "kratos-core";
import { getLauncherWorkspace, isDevelopment } from "./app";
import fse from "fs-extra";

/**
 * Checks if an asset is available on workspace or not.
 *
 * @param assetMetadata an asset metadata to check
 * @returns a promise that resolve true if the asset is exists, false otherwise.
 */
export function hasAsset(assetMetadata: version.AssetMetadata) {
  return new Promise<boolean>((resolve, _reject) => {
    const _assetMetadataManager = new version.AssetMetadataManager(
      assetMetadata
    );
    const absolutePath = path.join(
      getLauncherWorkspace().getAssetWorkspace().getObjectsPath(),
      _assetMetadataManager.buildPathSuffix().toString()
    );

    fse.access(absolutePath, (err) => {
      if (err) {
        return resolve(false);
      }

      resolve(true);
    });
  });
}

export function getNativeDirectoryPath() {
  return path.join(getLauncherWorkspace().getDirectory().toString(), "natives");
}
