import classNames from "classnames";
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../stores/RenderStore";
import { setDownloadingState } from "../../slices/DownloadSlice";

export default function DownloadIndicator() {
  const { isDownloading } = useSelector((state: RootState) => state.download);
  const dispatch = useDispatch();

  useEffect(() => {
    // console.log(`Successfully loading this`);

    dispatch(setDownloadingState(false));

    const [onCreateDownloadHandler, cleanupCreateDownloadHandler] = (
      window as any
    ).download.onCreateDownload((params) => {
      console.log(params.size);
      // Visible the download progress
      dispatch(setDownloadingState(true));
    });
    onCreateDownloadHandler();
    return () => {
      cleanupCreateDownloadHandler();
    };
  }, []);

  return (
    isDownloading && (
      <div className={classNames(`flex flex-col`)}>
        <span>Downloads: download-something</span>
        <span className="w-full px-2 bg-neutral-400 h-1"></span>
      </div>
    )
  );
}
