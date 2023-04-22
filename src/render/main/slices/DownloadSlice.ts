import { createSlice } from "@reduxjs/toolkit";

export interface DownloadSliceInterface {
  isDownloading: boolean;
  remainingItemCount: number;
  downloadedItemCount: number;
  downloadMessage?: string;
}

const initialState: DownloadSliceInterface = {
  isDownloading: false,
  remainingItemCount: 0,
  downloadedItemCount: 0,
  downloadMessage: undefined,
};

const DownloadSlice = createSlice({
  name: "Download",
  initialState,
  reducers: {
    setDownloadingState: (state, action) => {
      state.isDownloading = action.payload;
    },
    setRemainingItemCount: (state, action) => {
      state.downloadedItemCount = action.payload;
    },

    setDownloadedItemCount: (state, action) => {
      state.downloadedItemCount = action.payload;
    },
  },
});

export const {
  setDownloadingState,
  setRemainingItemCount,
  setDownloadedItemCount,
} = DownloadSlice.actions;

export default DownloadSlice.reducer;
