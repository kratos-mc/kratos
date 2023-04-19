import React, { useEffect, useState } from "react";
import ModalLayout from "../Modal/ModalLayout";
import Button from "../Button/Button";
import { IoIosClose, IoIosArrowDropright } from "react-icons/io";
import Input from "../Input/Input";

function ProfileListItem({ id, name, versionId, onSelect }) {
  const handleOnSelectProfile = (e) => {
    e.preventDefault();

    onSelect({ id, name, versionId });
  };

  return (
    <button
      className="px-4 py-2 text-left flex flex-row items-center hover:bg-neutral-300 dark:hover:bg-neutral-700"
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
    <div className="bg-neutral-200 dark:bg-neutral-600 mt-4 rounded-md flex flex-col gap-1 max-h-[30vh] overflow-y-auto">
      {profile.length === 0 ? (
        <div>No profile</div>
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

function SearchProfileInput() {
  return (
    <Input
      type="text"
      name="search-profile"
      placeholder="Looking for profile"
    />
  );
}

export default function ProfileSelectorModal({ visible, setVisible }) {
  const [profile, setProfile] = useState([]);

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

  return (
    visible && (
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
            <SearchProfileInput />
            {/* List of profile */}
            <ProfileList profile={profile} onSelect={handleChangeProfile} />
          </div>

          {/* Footer */}
          <div>
            <div>
              <h1>New Profile</h1>
              <div>
                <SearchProfileInput />

                <SearchProfileInput />
              </div>
            </div>

            <Button
              level="success"
              size="md"
              className="text-md"
              onClick={() => {}}
            >
              New profile
            </Button>
          </div>
        </div>
      </ModalLayout>
    )
  );
}
