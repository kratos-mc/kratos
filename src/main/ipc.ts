import { version } from "kratos-core";
import { ipcMain } from "electron/main";
import { BrowserWindowManager } from "./window";
import { getProfileManager } from "./profile";
import { getVersionManager } from "./app";
import { logger } from "./logger/logger";

function handleWindowListener(browserManager) {
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
}

export function loadIpcListener(
  browserManager: BrowserWindowManager,
  versionManager: version.VersionManager
) {
  handleWindowListener(browserManager);

  handleVersionListener(versionManager);

  handleProfileListener();
}
