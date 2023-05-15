import { PreloadAPI } from "../preload";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    /**
     * Handle account functions such as create, get, delete, and update.
     */
    account: PreloadAPI.PreloadAccount;
    /**
     * Handle utility functions.
     */
    utils: PreloadAPI.PreloadUtils;
    /**
     * Handle all indicators
     */
    indicator: PreloadAPI.PreloadIndicator;
    /**
     * Handle download information
     */
    download: PreloadAPI.PreloadDownload;
    /**
     * Handle runtime
     */
    runtime: PreloadAPI.PreloadRuntime;
  }
}

export {};
