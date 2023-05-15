import classNames from "classnames";
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../stores/RenderStore";
import {
  progressDownload,
  setDownloadSize,
  setDownloadedItemCount,
  setDownloadingState,
  setRemainingItemCount,
} from "../../slices/DownloadSlice";

export default function DownloadIndicator() {
  const {
    isDownloading,
    downloadedItemCount,
    remainingItemCount,
    downloadSize,
  } = useSelector((state: RootState) => state.download);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setDownloadingState(false));
    // Handle when create a new download event
    const {
      listener: onCreateDownloadHandler,
      cleaner: cleanupCreateDownloadHandler,
    } = window.download.onCreateDownload(({ size }) => {
      // Visible the download progress
      dispatch(setDownloadingState(true));
      // Set the downloading target size
      dispatch(setRemainingItemCount(size));
      dispatch(setDownloadSize(size));
      dispatch(setDownloadedItemCount(0));
    });
    onCreateDownloadHandler();
    // Handle when progress download
    const {
      listener: onProgressDownloadHandler,
      cleaner: cleanupProgressDownloadHandler,
    } = window.download.onProgressDownload(() => {
      // Call the progress on download
      dispatch(progressDownload());
    });

    onProgressDownloadHandler();

    return () => {
      cleanupCreateDownloadHandler();
      cleanupProgressDownloadHandler();
    };
  }, []);

  return (
    isDownloading && (
      <div className={classNames(`flex flex-col`)}>
        <span>Downloads: download-something</span>
        <span>
          {downloadedItemCount} / {downloadSize} (
          {((downloadedItemCount / downloadSize) * 100).toFixed(2)}) remain:{" "}
          {remainingItemCount}
        </span>
        <span className="w-full bg-neutral-400 h-1 relative">
          <span
            className={classNames(`absolute bg-blue-900 h-1`)}
            style={{ width: `${(downloadedItemCount / downloadSize) * 100}%` }}
          ></span>
        </span>
      </div>
    )
  );
}
