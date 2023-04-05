import { download } from "kratos-core";
import { PromisePool } from "@supercharge/promise-pool";
import { logger } from "./logger/logger";

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

  public async downloadAll() {
    const stackProcess = [...this.processes];
    // stackProcess[0].startDownload();
    this.processes = [];
    this.downloadProcessPool
      .for(stackProcess)
      .withConcurrency(4)
      .process(async (downloadProcess, _index, _pool) => {
        const info = downloadProcess.getDownloadInfo();
        logger.info(`Downloading ${info.destination}`);
        const _downloadInfo = await downloadProcess.startDownload();
        // logger.info(`Successfully downloaded ${_downloadInfo.destination}`);
        return _downloadInfo;
      });
  }

  public getPendingItems() {
    return this.processes;
  }
}
