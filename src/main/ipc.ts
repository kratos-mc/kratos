import { kratosRuntime } from "kratos-runtime-resolver";
import { version } from "kratos-core";
import { ipcMain } from "electron/main";
import { BrowserWindowManager } from "./window";
import { Profile, getProfileManager } from "./profile";
import { getRuntimeWorkspace, getVersionManager } from "./app";
import { logger } from "./logger/logger";
import { launchProfile } from "./launch";

function handleWindowListener(browserManager: BrowserWindowManager) {
  /**
   *
   */
  ipcMain.on("util:open-dev-tool", (e, options) => {
    const devWindow = browserManager.getBrowserWindow("dev");
    if (devWindow === undefined) {
    }

    devWindow.show();
    // Neither width nor height is an integer
    if (options) {
      options.width !== undefined ||
        (options.height !== undefined &&
          devWindow.setSize(
            options.width ?? 300,
            options.height ?? 400,
            false
          ));
    }
  });
  ipcMain.on("util:open-loading-window", (e) => {
    const loadingWindow = browserManager.getBrowserWindow("loading");
    if (loadingWindow === undefined) {
      throw new Error(
        `Unable to find a current loading window. It could be closed or destroyed`
      );
    }

    loadingWindow.show();
  });
}

function handleVersionListener(versionManager: version.VersionManager) {
  ipcMain.handle(
    "version:get-minecraft-versions",
    (_e, options?: { snapshot?: boolean }) => {
      // If the user want to get both snapshot version and release
      if (
        options !== undefined &&
        options?.snapshot !== undefined &&
        options.snapshot
      ) {
        return versionManager.getVersions();
      }

      // Expose release version only
      return versionManager
        .getVersions()
        .filter((v) => versionManager.getPackageInfo(v)?.type === "release");
    }
  );
}

function handleProfileListener() {
  ipcMain.handle("profile:get-all-profiles", (_e) => {
    return getProfileManager().getAllProfiles();
  });

  ipcMain.handle(
    "profile:create-profile",
    (_event, name: string, version: string) => {
      // Check parameters
      if (name === undefined || version === undefined) {
        throw new Error("Cannot create profile without name or version");
      }

      // Check the exists of the version
      if (
        getVersionManager()
          .getVersions()
          .find((e) => e === version) === undefined
      ) {
        throw new Error(`Invalid version id ${version}`);
      }

      // Validate the name
      if (name.length === 0 || name.length > 36) {
        throw new Error(
          `Invalid name format, it must lower than 36 characters`
        );
      }

      logger.info(`Creating a version name: ${name}, version: ${version}`);
      return getProfileManager().createProfile(name, version);
    }
  );

  ipcMain.on("profile:delete-profile", (_event, profileId) => {
    // Cannot found profile id parameter
    if (profileId === undefined) {
      throw new Error("Invalid profileId " + profileId);
    }

    // Warn when removing non exists profile
    if (!getProfileManager().hasProfile(profileId)) {
      logger.warn(`Remove non-exists profile (id: ${profileId})`);
      return;
    }

    logger.info(`Deleting a profile (id: ${profileId})`);
    getProfileManager().deleteProfile(profileId);
  });

  ipcMain.on("profile:launch-profile", async (_event, profileId: string) => {
    if (profileId === undefined) {
      throw new Error(`profileId cannot be undefined`);
    }

    // Check if the profile is exists or not
    if (!getProfileManager().hasProfile(profileId)) {
      throw new Error(`Profile not found (id: ${profileId})`);
    }

    // Trying to launch profile
    await launchProfile(getProfileManager().getProfile(profileId));
  });

  ipcMain.handle(
    "profile:search-profile",
    async (_event, profileId: string) => {
      if (profileId === undefined) {
        throw new Error(`profileId cannot be undefined`);
      }

      // Check if the profile is exists or not, if not exist, return undefined
      if (!getProfileManager().hasProfile(profileId)) {
        return undefined;
      }

      // Otherwise return profile
      return getProfileManager().getProfile(profileId);
    }
  );
}

function handleRuntimeListener() {
  ipcMain.handle("runtime:has-runtime", (_event, runtimeMajor) => {
    if (runtimeMajor === undefined) {
      throw new Error(`Undefined parameter`);
    }

    return getRuntimeWorkspace().getRuntimeMap().hasRuntime(runtimeMajor);
  });

  ipcMain.on("runtime:download", async (_event, major) => {
    if (major === undefined) {
      throw new Error(`Undefined parameter`);
    }

    // Check if the major is not a number
    if (!Number.isInteger(major)) {
      throw new Error(`Major must be a number`);
    }

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
  });

  ipcMain.handle("runtime:get-runtime", (_event, major: number) => {
    if (major === undefined) {
      throw new Error(`Unable to get a major (undefined major parameter)`);
    }

    return getRuntimeWorkspace().getRuntimeMap().getRuntime(major);
  });
}

export function loadIpcListener(
  browserManager: BrowserWindowManager,
  versionManager: version.VersionManager
) {
  handleWindowListener(browserManager);

  handleVersionListener(versionManager);

  handleProfileListener();

  handleRuntimeListener();
}
