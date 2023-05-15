import { configureStore } from "@reduxjs/toolkit";
import AppSlice from "../slices/AppSlice";
import DownloadSlice from "../slices/DownloadSlice";
import IndicatorSlice from "../slices/IndicatorSlice";
// @ts-ignore
export const store = configureStore({
  reducer: {
    app: AppSlice,
    download: DownloadSlice,
    indicators: IndicatorSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
