import { kratosRuntime } from "kratos-runtime-resolver";
import { download, version } from "kratos-core";
import { logger } from "./logger/logger";
import { Profile } from "./profile";
import {
  getDownloadPool,
  getLauncherWorkspace,
  getRuntimeWorkspace,
  getVersionManager,
  isOsx,
  isWindows,
} from "./app";
import * as path from "path";
import { hasAsset } from "./asset";
import { createAttemptDownload } from "kratos-core/out/download";
import { existsSync } from "original-fs";

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
  await resolveLibrary(profile);
  await resolveRuntime(pkgManager.getVersionPackage().javaVersion.majorVersion);
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

export async function resolveRuntime(major: number) {
  const didRuntimeInstalled = getRuntimeWorkspace()
    .getRuntimeMap()
    .hasRuntime(major);
  logger.info(`Check for the exists of runtime major version ${major}`);

  if (!didRuntimeInstalled) {
    logger.log(`Resolving the major runtime ${major}`);

    const platform: kratosRuntime.RuntimeBuildOs =
      process.platform === "linux"
        ? "linux"
        : process.platform === "darwin"
        ? "mac"
        : "windows";
    // TODO: show unsupported with x86
    logger.info(
      `Resolving and downloading the runtime for JDK (major version: ${major})`
    );

    let path = await getRuntimeWorkspace().downloadRuntime(
      major,
      platform,
      "x64"
    );
    logger.info(`Successfully resolved a JDK major at ${path}`);
  }
  // Spawn a process to test jdk with -version parameter (java -version)
  // spawnJavaProcess(major, ["-version"]);
}

export async function resolveLibrary(profile: Profile) {
  // Get the library workspace to handle library files
  let libraryWorkspace = getLauncherWorkspace().getLibraryWorkspace();
  // Get required libraries
  let libraries = (
    await getCachedVersionPackageManager(profile.versionId)
  ).getLibraries({
    platform: isWindows() ? "windows" : isOsx() ? "osx" : "linux",
  });
  logger.log(`Found ${libraries.length} libraries`);

  // Download list of libraries if not exists.
  for (const library of libraries) {
    const nullableArtifact = library.downloads.artifact;
    if (nullableArtifact === undefined) {
      logger.warn(
        `Invalid library (missing artifacts: ${library.name}, minecraft version id: ${profile.versionId})`
      );
      continue;
    }

    const { path: pathname, sha1, size, url } = nullableArtifact;
    const absolutePathname = path.join(
      libraryWorkspace.getDirectory().toString(),
      pathname
    );

    if (!existsSync(absolutePathname)) {
      // Make a directory before download
      libraryWorkspace.ensureDirname(absolutePathname);

      const matchingProcess = createAttemptDownload(
        {
          destination: absolutePathname,
          url,
        },
        sha1,
        { algorithm: "sha1" }
      );

      // Add matchingProcess into download pool
      getDownloadPool().push(matchingProcess);
    }
  }

  // Then spawn a download task
  const poolSize = getDownloadPool().getPendingItems().length;
  if (poolSize > 0) {
    logger.info(`Downloading ${poolSize} missing libraries`);
    await getDownloadPool().downloadAll();
    logger.info(`Successfully downloaded libraries`);
  } else {
    logger.info(`Successfully built libraries without any downloading`);
  }
}
