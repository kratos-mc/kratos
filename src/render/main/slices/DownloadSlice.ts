import { createSlice } from "@reduxjs/toolkit";

export interface DownloadSliceInterface {
  isDownloading: boolean;
  downloadSize: number;
  remainingItemCount: number;
  downloadedItemCount: number;
  downloadMessage?: string;
}

const initialState: DownloadSliceInterface = {
  isDownloading: false,
  downloadSize: 0,
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
    setDownloadSize: (state, action) => {
      state.downloadSize = action.payload;
    },
    setRemainingItemCount: (state, action) => {
      state.remainingItemCount = action.payload;
    },

    setDownloadedItemCount: (state, action) => {
      state.downloadedItemCount = action.payload;
    },

    progressDownload: (state) => {
      state.downloadedItemCount += 1;
      state.remainingItemCount -= 1;
    },
  },
});

export const {
  setDownloadingState,
  setDownloadSize,
  setRemainingItemCount,
  setDownloadedItemCount,
  progressDownload,
} = DownloadSlice.actions;

export default DownloadSlice.reducer;
