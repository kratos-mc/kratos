import { ensureDirSync } from "fs-extra";
import { kratosRuntime } from "kratos-runtime-resolver";
import { download, version } from "kratos-core";
import { logger } from "./logger/logger";
import { Profile } from "./profile";
import {
  getBrowserWindowManager,
  getDownloadPool,
  getLauncherWorkspace,
  getNativesPath,
  getRuntimeWorkspace,
  getVersionManager,
  isOsx,
  isWindows,
} from "./app";
import * as path from "path";
import { hasAsset } from "./asset";
import { createAttemptDownload } from "kratos-core/out/download";
import { existsSync } from "original-fs";
import { installRuntime, spawnJavaProcess } from "./runtime";
import { app } from "electron";
import {
  getLibraryArtifactsFilePath,
  getLibraryNativesClassifiers,
  getLibraryNativesFilePath,
  hasArtifactsLibrary,
  hasNativesLibrary,
} from "./library";
import { getLoggingConfigPath } from "./loggingConfig";

export async function launchProfile(profile: Profile) {
  // If the profile was not found
  if (profile === undefined) {
    throw new Error(`Profile cannot be undefined`);
  }

  logger.info(`Launching ${profile.versionId}`);

  // Resolve if the current package manager (/assets/indexes/x.json) is
  // available or not.
  const versionPackageManager = await getCachedVersionPackageManager(
    profile.versionId
  );

  // Resolve the runtime before run
  const runtimeMajorVersion =
    versionPackageManager.getVersionPackage().javaVersion.majorVersion;
  const majorEntry: kratosRuntime.RuntimeMapEntry = await resolveRuntime(
    runtimeMajorVersion
  );

  // Resolve the game assets
  await resolveProfileAsset(versionPackageManager, profile);

  // Resolve all libraries and extract all libraries that requires extracting
  const libraries = await resolveLibrary(profile);
  await extractProfileLibraries(libraries.shouldExtractLibraries);

  // Resolve logging configuration
  const loggingConfigFilePath = await resolveLoggingConfiguration(profile);

  // Resolve main client jar file
  const mainClientJar = await resolveMainClass(profile);

  // Construct a jvm arguments
  const jvmArgs = await buildJavaVirtualMachineArguments({
    nativesDirectoryPath: getNativesPath(),
    launcherName: app.getName(),
    launcherVersion: app.getVersion(),
    cp: [...libraries.outputLibraries, mainClientJar].join(path.delimiter),
  });

  // Construct a class name
  const mainClassName = versionPackageManager.getVersionPackage().mainClass;

  const args = [
    ...jvmArgs,
    mainClassName,
    ...(await buildGameArguments(profile, "PlayerNguyen")),
  ];
  // logger.info(args);
  spawnJavaProcess(majorEntry.major, args);
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
  await getDownloadPool().downloadAll(
    getBrowserWindowManager().getBrowserWindow("main")
  );
}

/**
 * Checks if the latest runtime is greater than the current provided `major` version.
 * If not, downloads and resolves the current major runtime version.
 *
 * Returns the `RuntimeMapEntry` from `kratos-runtime-resolver`.
 *
 *
 * @param major the major version of the runtime
 * @returns the runtime map entry get from runtime map file.
 */
export async function resolveRuntime(
  major: number
): Promise<kratosRuntime.RuntimeMapEntry> {
  // If the latest version is larger than
  const latestRuntimeEntry = getRuntimeWorkspace().getLatestRuntimeEntry();
  if (latestRuntimeEntry !== undefined && latestRuntimeEntry.major >= major) {
    logger.info(
      `Using java runtime ${latestRuntimeEntry.major} at ${path.basename(
        latestRuntimeEntry.bin.toString()
      )}`
    );

    return latestRuntimeEntry;
  }

  const didRuntimeInstalled = getRuntimeWorkspace()
    .getRuntimeMap()
    .hasRuntime(major);

  if (!didRuntimeInstalled) {
    await installRuntime(major);
  }
  const majorEntry = getRuntimeWorkspace().getRuntimeMap().getRuntime(major);
  if (majorEntry === undefined) {
    throw new Error(
      `The entry map not found for runtime major version: ${major}`
    );
  }
  return majorEntry;
}

export async function resolveLibrary(profile: Profile) {
  const outputLibraries: string[] = [];
  const shouldExtractLibraries: string[] = [];

  // Get required libraries
  const selectedPlatform = isWindows() ? "windows" : isOsx() ? "osx" : "linux";
  let libraries = (
    await getCachedVersionPackageManager(profile.versionId)
  ).getLibraries({
    platform: selectedPlatform,
  });
  logger.log(
    `Took ${libraries.length} libraries for ${selectedPlatform} platform.`
  );

  // Download list of libraries if not exists.
  for (const library of libraries) {
    // Resolve natives
    if (
      library.natives &&
      Object.keys(library.natives).includes(selectedPlatform) &&
      !hasNativesLibrary(library, selectedPlatform)
    ) {
      const classifiers = getLibraryNativesClassifiers(
        library,
        selectedPlatform
      );
      getDownloadPool().push(
        createAttemptDownload(
          {
            destination: getLibraryNativesFilePath(library, selectedPlatform),
            url: new URL(classifiers.url),
          },
          classifiers.sha1
        )
      );

      // If the library require extract
      if (library.extract) {
        shouldExtractLibraries.push(
          getLibraryNativesFilePath(library, selectedPlatform)
        );
      }

      // Reveal the natives library
      outputLibraries.push(
        getLibraryNativesFilePath(library, selectedPlatform)
      );
    }

    // Load default library
    if (library.downloads.artifact === undefined) {
      logger.warn(`Ignoring library ${library.name} due to missing artifact.`);
    } else {
      const destination = getLibraryArtifactsFilePath(library);
      if (!hasArtifactsLibrary(library)) {
        getDownloadPool().push(
          createAttemptDownload(
            {
              destination,
              url: new URL(library.downloads.artifact.url),
            },
            library.downloads.artifact.sha1
          )
        );
      }

      outputLibraries.push(destination);
    }
  }

  // Then spawn a download task
  const poolSize = getDownloadPool().getPendingItems().length;
  if (poolSize > 0) {
    logger.info(`Downloading ${poolSize} missing libraries`);
    await getDownloadPool().downloadAll(
      getBrowserWindowManager().getBrowserWindow("main")
    );
    logger.info(`Successfully downloaded libraries`);
  } else {
    logger.info(`Successfully built libraries without any downloading`);
  }

  return { shouldExtractLibraries, outputLibraries };
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
  const gameArguments =
    (await packageManager).getVersionPackage().arguments ??
    (await packageManager).getVersionPackage().minecraftArguments;
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

  let __args: any[];
  if (typeof gameArguments === "object") {
    __args = gameArguments.game;
  } else if (typeof gameArguments === "string") {
    __args = gameArguments.split(" ");
  } else {
    throw new Error(`Unexpected game argument value`);
  }

  for (const gameArgumentIndex of __args) {
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

    await getDownloadPool().downloadAll(
      getBrowserWindowManager().getBrowserWindow("main")
    );
    logger.info(`Successfully downloaded main client jar file.`);
    return destination;
  }
  throw new Error(`Invalid package information (missing client file name)`);
}

export async function extractProfileLibraries(willExtractLibraries: string[]) {
  // Make a native destination before extract
  const nativeDestinationWorkspace = getNativesPath();
  ensureDirSync(nativeDestinationWorkspace);

  for (const sourceFilePath of willExtractLibraries) {
    logger.info(`Extracting ${path.basename(sourceFilePath)}`);
    // Extract a jar as a zip file
    kratosRuntime.RuntimeExtractor.extractZip(
      sourceFilePath,
      nativeDestinationWorkspace
    );
  }
}

export async function resolveLoggingConfiguration(profile: Profile) {
  const packageManager = getCachedVersionPackageManager(profile.versionId);
  const loggingConfig = (await packageManager).getVersionPackage().logging;

  if (loggingConfig === undefined) {
    throw new Error(`Missing logging configuration file`);
  }

  // Make a directory if the directory is unavailable
  if (!existsSync(getLoggingConfigPath())) {
    ensureDirSync(getLoggingConfigPath());
  }

  const willLoggingDownloadFile = loggingConfig.client.file;
  const destination = path.join(
    getLoggingConfigPath(),
    loggingConfig.client.file.id
  );

  if (!existsSync(destination)) {
    getDownloadPool().push(
      createAttemptDownload(
        {
          destination,
          url: new URL(loggingConfig.client.file.url),
        },
        willLoggingDownloadFile?.sha1
      )
    );
  }

  await getDownloadPool().downloadAll(
    getBrowserWindowManager().getBrowserWindow("main")
  );
  return destination;
}

export interface BuildJavaVirtualMachineOptions {
  nativesDirectoryPath: string;
  launcherName: string;
  launcherVersion: string;
  cp: string;
  jvmStackSize?: string;
}

export async function buildJavaVirtualMachineArguments(
  options: BuildJavaVirtualMachineOptions
) {
  let responseArgs = [
    `-Djava.library.path=${options.nativesDirectoryPath}`,
    `-Dminecraft.launcher.brand=${options.launcherName}`,
    `-Dminecraft.launcher.version=${options.launcherVersion}`,
    `-cp`,
    `${options.cp}`,
  ];

  // Check if the windows is windows 10, then add magic jvm args for it.
  if (
    isWindows() &&
    (await import("windows-release").then()).default() === "10"
  ) {
    responseArgs.push(`-Dos.name=Windows 10 -Dos.version=10.0`);
  }

  // If the platform is macos, add magic jvm args for it.
  if (isOsx()) {
    responseArgs.push(`-XstartOnFirstThread`);
    responseArgs.push(`-Xdock:name=Minecraft`);
    responseArgs.push(
      `-Xdock:icon=/Users/nguyen/Desktop/Project/kratos/assets/objects/99/991b421dfd401f115241601b2b373140a8d78572`
    );
  }

  // Set jvm stack size
  // TODO: change on profile
  if (options.jvmStackSize !== undefined) {
    responseArgs.push(`-Xss${options.jvmStackSize}`);
  } else {
    responseArgs.push(`-Xss1G`);
  }

  // Just for testing
  // responseArgs.push(`-XX:+UnlockExperimentalVMOptions`);
  // responseArgs.push(`-XX:+UseG1GC`);
  // responseArgs.push(`-XX:G1NewSizePercent=20`);
  // responseArgs.push(`-XX:G1ReservePercent=20`);
  // responseArgs.push(`-XX:MaxGCPauseMillis=50`);
  // responseArgs.push(`-XX:G1HeapRegionSize=32M`);

  return responseArgs;
}
