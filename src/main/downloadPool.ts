import { download } from "kratos-core";
import { PromisePool } from "@supercharge/promise-pool";
import { logger } from "./logger/logger";
import { BrowserWindow } from "electron";
import { IpcDictionary } from "./ipc";

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

    if (window !== undefined) {
      const downloadLength = stackProcess.length;

      window.webContents.send(IpcDictionary.CREATE_DOWNLOAD, {
        size: downloadLength,
      });
    }

    // stackProcess[0].startDownload();
    this.processes = [];
    await this.downloadProcessPool
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
        if (window !== undefined) {
          window.webContents.send(
            IpcDictionary.PROGRESS_DOWNLOAD,
            _downloadInfo
          );
        }
        // logger.info(`Successfully downloaded ${_downloadInfo.destination}`);
        return _downloadInfo;
      });
  }

  public getPendingItems() {
    return this.processes;
  }
}
