import { existsSync, readJSONSync, remove } from "fs-extra";
import { app } from "electron";
import { expect } from "chai";
import {
  getLauncherProfilePath,
  getProfileManager,
  Profile,
  ProfileManager,
} from "../../src/main/profile";
import { getVersionManager, loadGameManifest } from "../../src/main/app";

describe("[unit] profile#getLauncherProfilePath", () => {
  it(`should return an absolute path`, () => {
    expect(getLauncherProfilePath()).to.includes(app.getPath("appData"));
    expect(getLauncherProfilePath()).to.includes("profiles.json");
  });
});

describe("[unit] profile#getProfileManager", () => {
  describe("without version manager", () => {
    it(`should throw an error`, () => {
      expect(() => {
        getProfileManager();
      }).to.throws();
    });
  });

  describe("with version manager", () => {
    before(async () => {
      await loadGameManifest();
    });
    it(`should not be undefined`, () => {
      expect(getProfileManager()).to.not.be.undefined;
    });
  });
});

describe("[unit] profile#getLauncherProfilePath", () => {
  it(`should resolve correspond path`, () => {
    expect(getLauncherProfilePath()).to.not.be.undefined;
  });
});

describe("[unit] profile#ProfileManager", () => {
  // describe("Version Manager is undefined", () => {
  //   it(`should throw an error`, () => {
  //     expect(() => {
  //       new ProfileManager();
  //     }).to.throws(/Version Manager is not provided or undefined/);
  //   });
  // });

  describe("with version manager", () => {
    let pm: ProfileManager;
    before(async () => {
      await loadGameManifest();
      pm = new ProfileManager();
    });

    afterEach(async () => {
      await remove(getLauncherProfilePath());
    });

    it(`should do any operation on the function`, () => {
      const { id } = pm.createProfile("Latest", "1.9.2");

      expect(() => {
        pm.getProfile(id);
      }).not.throw;

      expect(pm.getProfile(id)).to.have.keys(["id", "versionId", "name"]);
      expect(pm.hasProfile(id)).to.be.true;

      expect(() => pm.deleteProfile(id)).not.to.throws;
      pm.deleteProfile(id);
      expect(pm.hasProfile(id)).to.be.false;
    });

    it(`should store the profile as a JSON`, () => {
      const profile = pm.createProfile(
        "Latest",
        getVersionManager().getLatestReleasePackageInfo().getId()
      );

      pm.storeProfile();
      expect(existsSync(getLauncherProfilePath())).to.be.true;
      const arr = readJSONSync(getLauncherProfilePath());

      expect(arr).to.be.an("array");
      expect(arr).to.lengthOf.greaterThan(0);

      const firstProfile: Profile = arr[0] as Profile;
      expect(firstProfile).to.have.keys(["id", "name", "versionId"]);
      expect(firstProfile.id).to.eq(profile.id);
    });
  });
});
