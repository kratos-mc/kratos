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
import { spawnJavaProcess } from "./runtime";
import { app } from "electron";

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
  const libraries = await resolveLibrary(profile);
  const mainClientJar = await resolveMainClass(profile);
  await resolveRuntime(pkgManager.getVersionPackage().javaVersion.majorVersion);

  const classPathString = `${[
    ...libraries.map((l) =>
      path.resolve(
        getLauncherWorkspace().getLibraryWorkspace().getDirectory().toString(),
        path.dirname(l.downloads.artifact?.path as string),
        path.basename(l.downloads.artifact?.path as string)
      )
    ),

    mainClientJar,
  ].join(path.delimiter)}`;

  // console.log(classPathString);

  const args = [
    `-XstartOnFirstThread`,
    // `-Dlog4j.configurationFile=${path.join(
    //   getAssetLogConfigsDirectoryPath(),
    //   path.basename(metadata.logging.client.file.url.toString())
    // )}`,
    "-Dorg.lwjgl.util.Debug=true",
    // `-Djava.library.path="${_natives}"`,
    `-Dminecraft.launcher.brand=${app.getName()}`,
    `-Dminecraft.launcher.version=${app.getVersion()}`,
    "-cp",
    classPathString,
    pkgManager.getVersionPackage().mainClass,
    ...(await buildGameArguments(profile, "PlayerNguyen")),
  ];
  // logger.info(args);
  spawnJavaProcess(
    pkgManager.getVersionPackage().javaVersion.majorVersion,
    args
  );
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
  // Get the asset from local if possible.
  // If the asset index is not exists, fetch it from version package
  const assetIndexesWorkspace = getLauncherWorkspace()
    .getAssetWorkspace()
    .getAssetIndexesWorkspace();
  const assetIndexId = packageManager.getVersionPackage().assetIndex.id;
  const assetFilenameId = assetIndexId + ".json";
  let assetIndexManager: version.AssetIndexManager;

  // Fetch an asset if local assetIndex is not available
  if (!assetIndexesWorkspace.hasIndex(assetFilenameId)) {
    logger.info(
      `Not found asset index: ${assetFilenameId}, downloading and saving`
    );
    const assetIndex = await packageManager.fetchAssetIndex();
    // Save the file
    assetIndexesWorkspace.writeIndex(assetFilenameId, assetIndex);

    // Expose for usage
    assetIndexManager = new version.AssetIndexManager(assetIndex);
  } else {
    // Use local asset index from disk
    assetIndexManager = new version.AssetIndexManager(
      assetIndexesWorkspace.getIndex(assetFilenameId)
    );
  }

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

  return libraries;
}

async function buildArgumentsReplacer(
  profile: Profile,
  username: string,
  uuid: string,
  accessToken: string,
  clientId: string,
  xUid: string,
  userType: string
) {
  const packageManager = getCachedVersionPackageManager(profile.versionId);
  const replacer: Map<string, string> = new Map();
  replacer.set("${auth_player_name}", username);
  replacer.set("${version_name}", profile.versionId);
  replacer.set(
    "${game_directory}",
    getLauncherWorkspace().getDirectory().toString()
  );
  replacer.set(
    "${assets_root}",
    getLauncherWorkspace().getAssetWorkspace().getDirectory().toString()
  );
  replacer.set(
    "${assets_index_name}",
    (await packageManager).getVersionPackage().assetIndex.id
  );

  replacer.set("${auth_uuid}", uuid);
  replacer.set("${auth_access_token}", accessToken);
  replacer.set("${clientid}", clientId);
  replacer.set("${auth_xuid}", xUid);
  replacer.set("${user_type}", userType);
  replacer.set(
    "${version_type}",
    (await packageManager).getVersionPackage().type
  );

  return replacer;
}

export async function buildGameArguments(profile: Profile, username: string) {
  // If the arguments is undefined
  const packageManager = getCachedVersionPackageManager(profile.versionId);
  const gameArguments = (await packageManager).getVersionPackage().arguments;
  if (!gameArguments) {
    throw new Error(`Unsupported game package (missing arguments values)`);
  }

  const _args: string[] = [];
  // jvm configs
  if (isOsx()) {
    _args.push("-XstartOnFirstThread");
  }
  if (isWindows()) {
    _args.push(
      "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump"
    );
  }

  // game config

  const replacer = await buildArgumentsReplacer(
    profile,
    username,
    "null",
    "null",
    "null",
    "null",
    "mojang"
  );

  for (const gameArgumentIndex of gameArguments.game) {
    if (typeof gameArgumentIndex === "string") {
      if (replacer.has(gameArgumentIndex)) {
        _args.push(replacer.get(gameArgumentIndex) as string);
        continue;
      }

      _args.push(gameArgumentIndex);
    }
  }
  return _args;
}

export async function resolveMainClass(profile: Profile) {
  const packageManager = getCachedVersionPackageManager(profile.versionId);
  const versionPackage = (await packageManager).getVersionPackage();
  // Download the main client jar file
  if (versionPackage.downloads && versionPackage.downloads.client) {
    const { sha1, url } = versionPackage.downloads.client;
    const fileName = profile.versionId + ".jar";

    const destination = path.join(
      getLauncherWorkspace().getVersionWorkspace().getDirectory().toString(),
      profile.versionId,
      fileName
    );

    if (!existsSync(destination)) {
      getDownloadPool().push(
        createAttemptDownload(
          {
            destination,
            url: url as URL,
          },
          sha1,
          { algorithm: "sha1" }
        )
      );
    }

    await getDownloadPool().downloadAll();
    logger.info(`Successfully downloaded main client jar file.`);
    return destination;
  }
  throw new Error(`Invalid package information (missing client file name)`);
}
