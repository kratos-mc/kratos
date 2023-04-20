import React, { useEffect, useState } from "react";
import ModalLayout from "../Modal/ModalLayout";
import Button from "../Button/Button";
import { IoIosClose, IoIosArrowDropright } from "react-icons/io";
import Input from "../Input/Input";
import Selector from "../Selector/Selector";
import { useMinecraftVersions } from "../../hooks/useMinecraftVersions";
import { useCreateProfile } from "../../hooks/useCreateProfile";
import classnames from "classnames";

function ProfileListItem({ id, name, versionId, onSelect }) {
  const handleOnSelectProfile = (e) => {
    e.preventDefault();

    onSelect({ id, name, versionId });
  };

  return (
    <button
      className="px-4 py-1 text-left flex flex-row items-center hover:bg-neutral-300 dark:hover:bg-neutral-700"
      title={id}
      onClick={handleOnSelectProfile}
    >
      <div className="flex-1 flex flex-col">
        <span>{name}</span>
        <span className="text-xs text-neutral-400">{versionId}</span>
      </div>
      <div>
        <IoIosArrowDropright className="text-xl text-neutral-400" />
      </div>
    </button>
  );
}

function ProfileList({ profile, onSelect }) {
  return (
    <div className="bg-neutral-200 dark:bg-neutral-600 mt-4 rounded-md flex flex-col gap-1 max-h-[20vh] overflow-y-auto">
      {profile.length === 0 ? (
        <div className={classnames("px-2 py-3")}>No profile</div>
      ) : (
        profile.map(({ id, name, versionId }, _b) => {
          return (
            <ProfileListItem
              key={id}
              id={id}
              name={name}
              versionId={versionId}
              onSelect={onSelect}
            />
          );
        })
      )}
    </div>
  );
}

function SearchProfileInput({ onSearch, value }) {
  return (
    <Input
      type="text"
      name="search-profile"
      placeholder="Looking for profile"
      onChange={onSearch}
      value={value}
    />
  );
}

function GameVersionSelector({ selectedItem, setSelectedItem }) {
  const { versions } = useMinecraftVersions();

  // useEffect(() => {
  //   if (versions !== undefined) {
  //     console.log(versions[0]);
  //     setSelectedItem(versions[0]);
  //   }
  // }, [versions]);

  return (
    <Selector
      placeholder="Select Minecraft version"
      onSelectItem={(selectedItem) => {
        setSelectedItem(selectedItem);
      }}
      currentItem={selectedItem}
      items={versions}
    />
  );
}

export default function ProfileSelectorModal({ visible, setVisible }) {
  const [profile, setProfile] = useState([]);
  const [selectedProfileItem, setSelectedProfileItem] = useState(undefined);
  const [didVisibleNewProfile, setDidVisibleNewProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [searchProfile, setSearchProfile] = useState("");

  const createProfile = useCreateProfile();

  useEffect(() => {
    profiles.getAllProfiles().then((profile) => {
      setProfile(profile);
    });
  }, []);

  const handleCloseDialog = () => setVisible(false);

  const handleChangeProfile = ({ id, versionId, name }) => {
    alert(`Change profile into ${id} - ${versionId}`);
    // TODO: handle change the current profile

    handleCloseDialog();
  };

  const handleChangeProfileName = (e) => {
    return setProfileName(e.target.value);
  };

  const handleSearchProfile = (e) => {
    setSearchProfile(e.target.value);
  };

  return (
    <ModalLayout setVisible={setVisible} visible={visible}>
      <div className="w-2/4 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 px-6 py-4 mx-auto mt-6 rounded-md shadow-lg flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-row items-center">
          <div className="text-2xl flex-1">Select a profile</div>
          <Button
            className={`text-xl p-0 m-0 bg-transparent hover:bg-transparent`}
            onClick={handleCloseDialog}
          >
            <IoIosClose />
          </Button>
        </div>

        {/* Body */}
        <div>
          <SearchProfileInput
            onSearch={handleSearchProfile}
            value={searchProfile}
          />
          {/* List of profile */}
          <ProfileList
            profile={
              searchProfile !== ""
                ? profile.filter(
                    (_p) =>
                      _p.name
                        .toLowerCase()
                        .includes(searchProfile.toLowerCase()) ||
                      _p.name.toLowerCase() === searchProfile.toLowerCase()
                  )
                : profile
            }
            onSelect={handleChangeProfile}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3">
          {/* Create a new profile form */}
          {didVisibleNewProfile && (
            <div className="flex flex-col gap-2">
              {/* NewProfile: header */}
              <div className="flex flex-row">
                <h1 className="flex-1">New Profile</h1>
                <Button onClick={() => setDidVisibleNewProfile(false)}>
                  <IoIosClose />
                </Button>
              </div>

              {/* NewProfile: body */}
              <div className="flex flex-col gap-3">
                {/* Name of the profile */}
                <Input
                  placeholder="Red Stone Torch..."
                  value={profileName}
                  onChange={handleChangeProfileName}
                />

                <GameVersionSelector
                  selectedItem={selectedProfileItem}
                  setSelectedItem={setSelectedProfileItem}
                />
              </div>
            </div>
          )}

          <Button
            level="success"
            size="md"
            className="text-md"
            disabled={didVisibleNewProfile && !selectedProfileItem}
            onClick={() => {
              if (!didVisibleNewProfile) {
                setDidVisibleNewProfile(true);
              } else {
                // handleCreateProfile
                if (selectedProfileItem === undefined) {
                  throw new Error(
                    `Invalid profile item (profile item is undefined)`
                  );
                } else {
                  // Check the profile name
                  if (
                    profileName === undefined ||
                    selectedProfileItem === undefined
                  ) {
                    throw new Error(
                      `The profile name or game version is not set`
                    );
                  }

                  // Create a new profile and then set the value for that profile
                  createProfile(profileName, selectedProfileItem.id).then(
                    (response) => {
                      // console.log(response);
                      setProfile([...profile, response]);
                    }
                  );
                }
              }
            }}
          >
            {!didVisibleNewProfile ? `New profile` : `Add profile`}
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
