import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import classnames from "classnames";

export default function ProfileSelector({ onClick }) {
  const [profile, setProfile] = useState(undefined);
  const { latestProfileId, profiles } = useSelector((state) => state.app);

  useEffect(() => {
    console.log(latestProfileId);
    if (latestProfileId !== undefined && profiles.length > 0) {
      // if (profiles.length === 0) {
      //   throw new Error(`Not found any profile to update`);
      // }
      setProfile(profiles.find((profile) => profile.id === latestProfileId));
    }
  }, [latestProfileId, profiles]);

  return (
    <div
      tabIndex={0}
      onClick={onClick}
      className={classnames(
        `flex flex-col`,
        `bg-neutral-300`,
        `px-4`,
        `py-1`,
        `rounded-md`,
        `hover:cursor-pointer`,
        `hover:bg-neutral-400`,
        `dark:bg-neutral-600`,
        `dark:hover:bg-neutral-700`
      )}
    >
      <span className="flex-1">
        {latestProfileId !== undefined
          ? profile
            ? profile.name
            : `unknown profile`
          : "unknown profile"}
      </span>
      <span className="text-xs text-neutral-500">
        {profile && profile.versionId}
      </span>
    </div>
  );
}
