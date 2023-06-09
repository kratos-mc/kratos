import { kratosRuntime } from "kratos-runtime-resolver";
import { version } from "kratos-core";
import { ipcMain } from "electron/main";
import { BrowserWindowManager } from "./window";
import { getProfileManager } from "./profile";
import {
  getLauncherWorkspace,
  getRuntimeWorkspace,
  getVersionManager,
} from "./app";
import { logger } from "./logger/logger";
import { launchProfile } from "./launch";
import { IpcMainEvent, shell } from "electron";
import { indicator } from "./indicator/indicator";
import { account } from "./accounts/account";

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
  ipcMain.on("util:open-launcher-dir", (_event: IpcMainEvent) => {
    shell.openPath(getLauncherWorkspace().getDirectory().toString());
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

function handleProfileListener(browserManager: BrowserWindowManager) {
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

  handleProfileListener(browserManager);

  handleRuntimeListener();
  handleIndicatorListener();

  handleAccountsListener();
}

function handleIndicatorListener() {
  ipcMain.handle("indicator:create-indicator", (_e, text, subText) => {
    return indicator.createTextIndicator(text, subText);
  });

  ipcMain.handle(
    "indicator:create-progress-indicator",
    (_e, text, subText, progress) => {
      return indicator.createProgressIndicator(text, subText, progress);
    }
  );

  ipcMain.on(
    "indicator:update-text-indicator",
    (_e, id: number, text: string, subText: string) => {
      if (id === undefined) {
        throw new Error(`Indicator id cannot be undefined`);
      }

      if (text === undefined) {
        throw new Error(`Indicator text cannot be undefined`);
      }

      indicator.setTextIndicator(id, text, subText);
    }
  );

  ipcMain.on(
    "indicator:update-progress-indicator",
    (_e, id: number, progress: number, text: string, subText: string) => {
      if (id === undefined) {
        throw new Error(`Indicator id cannot be undefined`);
      }

      if (progress === undefined) {
        throw new Error(`Indicator progress cannot be undefined`);
      }

      if (text === undefined) {
        throw new Error(`Indicator text cannot be undefined`);
      }

      indicator.setProgressIndicator(id, progress, text, subText);
    }
  );

  ipcMain.on(`indicator:show`, (_event, id: number) => {
    indicator.showIndicator(id);
  });

  ipcMain.on(`indicator:hide`, (_event, id: number) => {
    indicator.hideIndicator(id);
  });

  ipcMain.on(`indicator:dispose`, (_event, id: number) => {
    indicator.disposeIndicator(id);
  });
}

function handleAccountsListener() {
  ipcMain.handle("account:get-accounts", () => {
    // Return a list of accounts from memory
    return account.getAccounts();
  });
  ipcMain.handle("account:create-account", (_event, username: string) => {
    if (username === undefined) {
      throw new Error(`Username cannot be undefined`);
    }
    if (
      account
        .getAccounts()
        .findIndex((account) => account.getName() === username) !== -1
    ) {
      throw new Error(`Username ${username} is having an account`);
    }

    return account.createAccount(new account.Account(username));
  });
  ipcMain.on("account:delete-account", (_e, id: string) => {
    if (id === undefined) {
      throw new Error(`Parameter id cannot be undefined`);
    }

    if (account.getAccounts().findIndex((e) => e.getId() === id) === -1) {
      throw new Error(`Deleting undefined account with id ${id}`);
    }
    account.deleteAccount(id);
  });
}

export const IpcDictionary = {
  CREATE_DOWNLOAD: "download:create-download",
  PROGRESS_DOWNLOAD: "download:progress-download",
};
