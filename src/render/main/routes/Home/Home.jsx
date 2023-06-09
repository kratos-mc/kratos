import React, { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import ProfileSelector from "../../components/ProfileSelector/ProfileSelector";
import ProfileSelectorModal from "../../components/ProfileSelectorModal/ProfileSelectorModal";
import { useDispatch } from "react-redux";
import { setLastProfile, setProfiles } from "../../slices/AppSlice";
import { useSelector } from "react-redux";
import classNames from "classnames";
import DownloadIndicator from "../../components/DownloadIndicator/DownloadIndicator";
import Indicator from "../../components/Indicator/Indicator";

export default function Home() {
  const [profileSelectorModalVisible, setProfileSelectorModalVisible] =
    useState(false);

  const handleOpenProfileSelectorModal = () => {
    setProfileSelectorModalVisible(true);
  };

  const dispatch = useDispatch();
  const latestProfileId = useSelector((state) => state.app.latestProfileId);
  const [primaryUsername] = useSelector((state) => state.app.accounts);

  // Initial the profile
  useEffect(() => {
    window.profiles.getAllProfiles().then((profiles) => {
      dispatch(setProfiles(profiles));

      if (latestProfileId === undefined) {
        dispatch(setLastProfile(profiles[0].id));
      }
    });
  }, []);

  const handleChangeProfile = ({ id, name, versionId }) => {
    dispatch(setLastProfile(id));
  };

  const handleLaunchProfile = () => {
    window.profiles.launchProfile(latestProfileId);
  };

  return (
    <div className="bg-neutral-100 h-[calc(100vh-32px)] rounded-t-xl relative">
      {/* Header */}
      <div className="home-header text-3xl mx-4 py-4">
        <b>Header title</b>
      </div>
      {/* Body */}
      <div className="min-h-[80vh] overflow-y-scroll"></div>
      {/* Footer */}
      <div className="bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 px-4 py-2 flex flex-col gap-2 sticky bottom-0">
        {/* DownloadIndicator */}
        <DownloadIndicator />
        <Indicator />

        {/*  */}
        <div className="flex flex-row gap-4 items-center">
          <div>
            <Button
              level="primary"
              size="xl"
              className="px-5"
              onClick={handleLaunchProfile}
            >
              Launch
            </Button>
          </div>
          <div className="flex flex-col text-md justify-center">
            <ProfileSelector
              // currentProfile={currentSelectedProfile}
              onClick={handleOpenProfileSelectorModal}
            />
            <p className="text-md font-bold">
              play as{" "}
              <b className={classNames(`text-blue-600`)}>
                {primaryUsername && primaryUsername.name}
              </b>
            </p>
          </div>
        </div>
      </div>

      {/* Handles on select a profile */}
      <ProfileSelectorModal
        visible={profileSelectorModalVisible}
        setVisible={setProfileSelectorModalVisible}
        onSelect={handleChangeProfile}
      />
    </div>
  );
}
