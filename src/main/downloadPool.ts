import { download } from "kratos-core";
import { PromisePool } from "@supercharge/promise-pool";
import { logger } from "./logger/logger";
import { BrowserWindow } from "electron";
import { IpcDictionary } from "./ipc";
import { getDownloadIndicator } from "./app";
import { indicator } from "./indicator/indicator";

export class DownloadPool {
  private downloadProcessPool: PromisePool<
    download.DownloadMatchingProcess,
    false
  >;
  private processes: download.DownloadMatchingProcess[] = [];

  constructor(options?: { size?: number }) {
    this.downloadProcessPool = PromisePool.withConcurrency(
      (options && options.size) || 4
    ) as PromisePool<download.DownloadMatchingProcess, false>;
  }

  public push(process: download.DownloadMatchingProcess) {
    this.processes.push(process);
  }

  public async downloadAll(window?: BrowserWindow) {
    const stackProcess = [...this.processes];
    const downloadLength = stackProcess.length;
    let currentProcessedItem: number = 0;
    if (window !== undefined) {
      // window.webContents.send(IpcDictionary.CREATE_DOWNLOAD, {
      //   size: downloadLength,
      // });
      indicator.setProgressIndicator(
        getDownloadIndicator().getId(),
        0,
        `Downloading ${downloadLength} items`,
        ""
      );
      indicator.showIndicator(getDownloadIndicator().getId());
    }

    // stackProcess[0].startDownload();
    this.processes = [];
    return this.downloadProcessPool
      .for(stackProcess)
      .withConcurrency(4)
      .process(async (downloadProcess, _index, _pool) => {
        const info = downloadProcess.getDownloadInfo();

        const destinationPath = info.destination;
        const destinationPathSegment = destinationPath.split("/");
        logger.info(
          `Downloading ${
            destinationPathSegment[destinationPathSegment.length - 1]
          }`
        );

        const _downloadInfo = await downloadProcess.startDownload();
        // console.log(`Downloaded [${_index}/${downloadLength}]`);
        currentProcessedItem++;
        indicator.setProgressIndicator(
          getDownloadIndicator().getId(),
          currentProcessedItem / downloadLength,
          `Downloading ${downloadLength} items`,
          `${downloadProcess.getDownloadInfo().destination}`
        );
        // logger.info(`Successfully downloaded ${_downloadInfo.destination}`);
        return _downloadInfo;
      })
      .catch((err) => logger.error(err))
      .finally(() => {
        indicator.hideIndicator(getDownloadIndicator().getId());
      });
  }

  public getPendingItems() {
    return this.processes;
  }
}
