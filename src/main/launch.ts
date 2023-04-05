import { download, version } from "kratos-core";
import { logger } from "./logger/logger";
import { Profile } from "./profile";
import {
  getDownloadPool,
  getLauncherWorkspace,
  getVersionManager,
} from "./app";
import * as path from "path";
import { hasAsset } from "./asset";

export async function launchProfile(profile: Profile) {
  // if the profile was not found
  if (profile === undefined) {
    throw new Error(`Profile cannot be undefined`);
  }

  logger.info(
    `Trying to launch profile ${profile.name} (game version: ${profile.versionId})`
  );

  const pkgManager = await getCachedVersionPackageManager(profile.versionId);
  await resolveProfileAsset(pkgManager, profile);
  // TODO: resolve runtime
}
/**
 * Gets the cached version package from local workspace if available. Otherwise,
 * downloads and stores it into local workspace.
 *
 *
 * @throws if connection was not established by any reason, or
 * cannot correctly have an access into workspace.
 *
 * @param versionId the version id
 * @returns a promise that resolves the package manager of cached version package or
 *  downloaded package version.
 */
export async function getCachedVersionPackageManager(
  versionId: string
): Promise<version.VersionPackageManager> {
  const packageInfo = getVersionManager().getPackageInfo(versionId);
  if (packageInfo === undefined) {
    throw new Error("Invalid profile minecraft version " + versionId);
  }

  // Load version package manager
  let _packageManager: version.VersionPackageManager;
  if (
    await getLauncherWorkspace()
      .getVersionWorkspace()
      .hasPackageVersion(versionId)
  ) {
    const cacheVersionPackage = await getLauncherWorkspace()
      .getVersionWorkspace()
      .readVersionPackage(versionId);
    _packageManager = new version.VersionPackageManager(cacheVersionPackage);
  } else {
    const fetchPkg = await new version.VersionPackageInfoManager(
      packageInfo
    ).fetchPackage();

    // Write out the fetch package
    getLauncherWorkspace()
      .getVersionWorkspace()
      .writeVersionPackage(
        versionId,
        Buffer.from(JSON.stringify(fetchPkg.getVersionPackage()))
      );

    _packageManager = fetchPkg;
  }
  return _packageManager;
}

export async function resolveProfileAsset(
  packageManager: version.VersionPackageManager,
  profile: Profile
) {
  // Resolve asset
  const assetIndexManager = new version.AssetIndexManager(
    await packageManager.fetchAssetIndex()
  );

  // Loops and checks if the asset is existed or not
  // if it is not exists, push it into download pool

  for (const key in assetIndexManager.getObjects()) {
    const curAssetMetadata = assetIndexManager.getObjects()[key];
    if (!(await hasAsset(curAssetMetadata))) {
      const assetMetadataManager = new version.AssetMetadataManager(
        curAssetMetadata
      );
      const assetMetadataDestination = path.join(
        getLauncherWorkspace().getAssetWorkspace().getObjectsPath(),
        assetMetadataManager.buildPathSuffix().toString()
      );
      const assetDownloadProcess = download.createAttemptDownload(
        {
          url: assetMetadataManager.buildAssetDownloadUrl(),
          destination: assetMetadataDestination,
        },
        assetMetadataManager.getHash(),
        { algorithm: "sha1" }
      );
      getDownloadPool().push(assetDownloadProcess);
    }
  }

  logger.info(
    `Currently preparing to download ${
      getDownloadPool().getPendingItems().length
    } items`
  );

  // Start downloading all assets
  await getDownloadPool().downloadAll();
}
