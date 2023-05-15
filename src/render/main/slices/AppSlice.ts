import { createSlice } from "@reduxjs/toolkit";
import { LATEST_PROFILE_ID_KEY } from "../hooks/useLatestProfile";

interface Profile {
  id: string;
  name: string;
  versionId: string;
}

interface Account {
  getId(): string;
  getName: string;
}

interface AppState {
  latestProfileId?: string;
  profiles: Profile[];
  accounts: Account[];
}

// console.log(localStorage.getItem(LATEST_PROFILE_ID_KEY) || undefined);
const initialState: AppState = {
  latestProfileId: localStorage.getItem(LATEST_PROFILE_ID_KEY) || undefined,
  profiles: [],
  accounts: [],
};

const App = createSlice({
  name: "App",
  initialState,
  reducers: {
    /**
     * Reloads the list of profiles
     *
     * @param state a current state of the app
     * @param payload the payload to load into
     */
    setProfiles: (state, payload) => {
      state.profiles = payload.payload;
    },

    setLastProfile: (state, payload) => {
      state.latestProfileId = payload.payload;
      // Set this into local storage
      localStorage.setItem(LATEST_PROFILE_ID_KEY, payload.payload);
    },

    setAccounts: (state, action) => {
      state.accounts = action.payload;
    },
  },
});

export const { setProfiles, setLastProfile, setAccounts } = App.actions;

export default App.reducer;
