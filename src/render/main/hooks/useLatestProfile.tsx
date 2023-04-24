import { validate } from "uuid";

export const LATEST_PROFILE_ID_KEY = `latestProfileId`;
export function useLatestProfile() {
  /**
   * Set the profile id
   * @param profileId the profile id to set
   */
  const setLatestProfileId = (profileId: string) => {
    if (!validate(profileId)) {
      throw new Error(`The profileId is not an unique id (uuid)`);
    }

    localStorage.setItem(LATEST_PROFILE_ID_KEY, profileId);
  };

  const latestProfileId: string | null = localStorage.getItem(
    LATEST_PROFILE_ID_KEY
  );

  return [latestProfileId, setLatestProfileId];
}
