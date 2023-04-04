import { version } from "kratos-core";
import { getLauncherWorkspace, getVersionManager } from "./app";
import { existsSync, readJsonSync, writeJsonSync } from "fs-extra";
import * as path from "path";
import { logger } from "./logger/logger";
import { randomUUID } from "crypto";

export interface Profile {
  id: string;
  versionId: string;
  name: string;
}

export function getLauncherProfilePath() {
  return path.resolve(
    getLauncherWorkspace().getDirectory().toString(),
    "profiles.json"
  );
}

export class ProfileManager {
  private profileList: Profile[];
  private readonly versionManager: version.VersionManager;

  constructor(versionManager: version.VersionManager) {
    if (versionManager === undefined) {
      throw new Error(`Version Manager is not provided or undefined`);
    }

    this.versionManager = versionManager;

    if (!existsSync(getLauncherProfilePath())) {
      logger.warn("Launcher profile not found");
      this.profileList = [];
    } else {
      this.profileList = readJsonSync(getLauncherProfilePath(), {
        throws: true,
      });
    }
  }

  public createProfile(name: string, versionId: string): Profile {
    // Push a new item into profile
    let uid = randomUUID();
    let profile = {
      id: uid,
      name,
      versionId,
    };
    this.profileList.push(profile);

    // try to store
    this.storeProfile();

    return profile;
  }

  public deleteProfile(id: string) {
    this.profileList = this.profileList.filter((profile) => profile.id !== id);
    this.storeProfile();
  }

  public hasProfile(id: string) {
    return this.profileList.find((p) => p.id === id) !== undefined;
  }

  public storeProfile() {
    logger.info(`Storing profile list into ${getLauncherProfilePath()}`);

    writeJsonSync(getLauncherProfilePath(), this.profileList);
  }

  public getProfile(id: string) {
    const profile = this.profileList.find((profile) => profile.id === id);
    if (profile === undefined) {
      throw new Error("Profile is undefined with id" + id);
    }
    return profile;
  }

  public getAllProfiles() {
    return this.profileList;
  }
}

let globalProfileManager: ProfileManager;

export function getProfileManager() {
  if (
    getLauncherWorkspace() === undefined ||
    getVersionManager() === undefined
  ) {
    throw new Error(
      `Launcher profile cannot be initialized when app is not ready`
    );
  }

  if (globalProfileManager === undefined) {
    globalProfileManager = new ProfileManager(getVersionManager());
  }

  return globalProfileManager;
}

/**
 * Load the start profile for latest version
 */
export function loadLatestProfile(versionManager: version.VersionManager) {
  return getProfileManager().createProfile(
    "Latest",
    versionManager.getLatestReleasePackageInfo().getId()
  );
}
