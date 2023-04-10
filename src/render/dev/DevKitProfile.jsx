import React, { useEffect, useState } from "react";

export default function DevKitProfile() {
  const [versions, setVersions] = useState([]);
  const [didAllowSnapshot, setDidAllowSnapshot] = useState(false);

  // Create profile variable
  const [profileName, setProfileName] = useState("");
  const [profileVersion, setProfileVersion] = useState("");
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    window.versions
      .getMinecraftVersions({ snapshot: didAllowSnapshot })
      .then((_versions) => {
        // console.log(_versions);
        setVersions([..._versions]);
        setProfileVersion(_versions[0]);
      });

    return () => {};
  }, [didAllowSnapshot]);

  useEffect(() => {
    window.profiles.getAllProfiles().then((profiles) => {
      setProfiles(profiles);
    });
  }, []);

  const handleToggleSnapshot = (e) => {
    setDidAllowSnapshot(e.target.checked);
  };

  const handleDeleteProfile = (profileId) => {
    window.profiles.deleteProfile(profileId);
    setProfiles(profiles.filter((profile) => profile.id !== profileId));
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();

    if (profileName.length > 36) {
      alert("The name length must not greater than 36 characters");
      return;
    }

    const callbackProfile = await window.profiles.createProfile(
      profileName,
      profileVersion
    );

    // Reset a form
    setProfileName("");
    setProfileVersion(versions[0]);

    // Insert into profiles
    setProfiles([...profiles, callbackProfile]);
  };

  const handleLaunchProfile = (profileId) => {
    window.profiles.launchProfile(profileId);
  };

  return (
    <div>
      <h1>Profile</h1>

      <div>
        <h2>Add profile</h2>
        <form onSubmit={handleCreateProfile}>
          <div>
            <label htmlFor="profileName">Profile Name</label>
            <input
              type="text"
              name="profileName"
              value={profileName}
              onChange={(e) => {
                setProfileName(e.target.value);
              }}
            />
          </div>

          <div>
            <label>Version</label>
            <select
              value={profileVersion}
              onChange={(e) => {
                setProfileVersion(e.target.value);
              }}
            >
              {/* <option></option> */}
              {versions &&
                versions.length > 0 &&
                versions.map((v, i) => {
                  return <option key={i}>{v}</option>;
                })}
            </select>

            <input type="checkbox" onChange={handleToggleSnapshot} />
          </div>
          <input type="submit" />
        </form>
      </div>

      <div>
        <h2>Profile list</h2>
        <ul>
          {profiles &&
            profiles.length > 0 &&
            profiles.map((profile) => {
              return (
                <li key={profile.id}>
                  <div>
                    <b>{profile.name}</b>
                  </div>
                  <div>
                    <small>id: {profile.id}</small>
                  </div>
                  <div>
                    <small>version: {profile.versionId}</small>
                  </div>
                  {/* Action */}
                  <div>
                    <button
                      onClick={() => {
                        handleDeleteProfile(profile.id);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        handleLaunchProfile(profile.id);
                      }}
                    >
                      Launch
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
