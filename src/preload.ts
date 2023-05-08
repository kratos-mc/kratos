import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";
import { account } from "./main/accounts/account";
import {
  Indicator,
  ProgressIndicator,
  TextIndicator,
} from "./main/indicator/indicator";
import { kratosRuntime } from "kratos-runtime-resolver";

export module PreloadAPI {
  export interface PreloadAccount {
    /**
     * Retrieves a list of accounts from memory.
     *
     * @returns an array list of accounts that can be zero-indexes.
     */
    getAccounts: () => Promise<account.Account[]>;
  }
  export interface PreloadUtils {
    /**
     * Opens developer tool window for Kratos
     *
     * @param options
     * @returns a function
     */
    openDevTools: (options?: any) => void;
    /**
     * Forcibly opens the splash screen.
     *
     * @returns the void function of ipc call
     */
    openLoadingWindow: () => void;
    /**
     * Opens launcher directory on external os file-browser.
     *
     * @returns the void function of ipc call
     */
    openLauncherDir: () => void;
  }
  export interface PreloadIndicator {
    handleUpdate: (listener: (indicators: Indicator[]) => void) => CalleeResult;
    /**
     * Creates a new text indicator.
     *
     * @param text the primary text of the indicator
     * @param subText the secondary text of the indicator
     * @returns the object of the text indicator
     */
    createText: (text: string, subText: string) => Promise<TextIndicator>;

    /**
     * Creates a new progress indicator.
     *
     * @param text the primary text of the indicator
     * @param subText the secondary text of the indicator
     * @param progress the initial progress of the indicator in range [0..1].
     *    The default value is 0.
     *
     * @returns the object of the text indicator
     */
    createProgress: (
      text: string,
      subText?: string,
      progress?: number
    ) => Promise<ProgressIndicator>;

    updateTextIndicator: (id: number, text: string, subText?: string) => any; // todo: fixme

    updateProgressIndicator: (
      id: number,
      progress: number,
      text: string,
      subText?: string
    ) => any; // todo: fix me

    /**
     * Shows the indicator which is invisible.
     *
     * @param id the id of indicator to invisible
     * @returns the event of `ipcRenderer.send("indicator:show")`
     */
    show: (id: number) => any; // todo: fix me
    /**
     * Hides the indicator.
     * NOTE: The hidden indicator is cached in main process until disposed.
     *
     * @param id the id of indicator to invisible
     * @returns the event of `ipcRenderer.send("indicator:hide")`
     */
    hide: (id: number) => any; // todo: fix me

    /**
     * Disposes the indicators. The disposed indicator will be destroyed by runtime GC.
     *
     * @param id the id to dispose the indicator
     * @returns the event of `ipcRenderer.send("indicator:dispose")`
     */
    disposeIndicator: (id: number) => any; // todo: fix me
  }

  export interface PreloadDownload {
    onCreateDownload: (
      listener: (...args: [{ size: number }]) => void
    ) => CalleeResult;

    onProgressDownload: (listener: () => void) => CalleeResult;
  }

  export interface PreloadRuntime {
    hasRuntime: (major: number) => Promise<boolean>;
    downloadRuntime: (major: number) => Electron.IpcRenderer;
    getRuntime: (major: number) => kratosRuntime.RuntimeMapEntry;
  }
}

interface CalleeResult {
  listener: () => Electron.IpcRenderer;
  cleaner: () => Electron.IpcRenderer;
}

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  getMinecraftVersions: (options?: { snapshot?: boolean }) =>
    ipcRenderer.invoke("version:get-minecraft-versions", options),
});

contextBridge.exposeInMainWorld("utils", {
  openDevTools: (options?: any) =>
    ipcRenderer.send("util:open-dev-tool", options),
  openLoadingWindow: () => ipcRenderer.send("util:open-loading-window"),
  openLauncherDir: () => ipcRenderer.send("util:open-launcher-dir"),
});

contextBridge.exposeInMainWorld("profiles", {
  getAllProfiles: () => ipcRenderer.invoke("profile:get-all-profiles"),
  createProfile: (name: string, version: string) =>
    ipcRenderer.invoke(`profile:create-profile`, name, version),
  deleteProfile: (profileId: string) =>
    ipcRenderer.send("profile:delete-profile", profileId),
  launchProfile: (profileId: string) =>
    ipcRenderer.send("profile:launch-profile", profileId),
  searchProfile: (profileId: string) =>
    ipcRenderer.invoke("profile:search-profile", profileId),
});

contextBridge.exposeInMainWorld("runtime", {
  hasRuntime: (major: number): Promise<boolean> =>
    ipcRenderer.invoke("runtime:has-runtime", major),
  downloadRuntime: (major: number) =>
    ipcRenderer.send("runtime:download", major),
  getRuntime: (major: number) =>
    ipcRenderer.invoke("runtime:get-runtime", major),
});

/**
 * Converts a listener into a ipcRenderer listener function
 * which can both invoke and remove as the return.
 *
 * This method is useful to make the listener that need to clean up afterwards.
 *
 * @param channel the name of ipc channel to call
 * @param listener the listener when the ipc call was invoked
 * @returns the array which contains 2 function, the first is the listener and the second is
 *  remover listener.
 */
function makeCalleeIpcRenderer(
  channel: string,
  listener: (...args: any[]) => void
): CalleeResult {
  const _internalListener = (_event: IpcRendererEvent, ...args: any) =>
    listener(...args);

  return {
    listener: () => ipcRenderer.on(channel, _internalListener),
    cleaner: () => ipcRenderer.removeListener(channel, _internalListener),
  };
}

contextBridge.exposeInMainWorld("download", {
  onCreateDownload: (listener: (...args: [{ size: number }]) => void) =>
    makeCalleeIpcRenderer("download:create-download", listener),
  onProgressDownload: (listener: () => void) =>
    makeCalleeIpcRenderer("download:progress-download", listener),
});

contextBridge.exposeInMainWorld(`indicator`, {
  handleUpdate: (listener: (indicators: Indicator[]) => void) =>
    makeCalleeIpcRenderer("indicator:update-indicators", listener),

  createText: (text: string, subText: string): Promise<TextIndicator> =>
    ipcRenderer.invoke("indicator:create-indicator", text, subText),

  createProgress: (
    text: string,
    subText?: string,
    progress?: number
  ): Promise<ProgressIndicator> =>
    ipcRenderer.invoke(
      "indicator:create-progress-indicator",
      text,
      subText,
      progress
    ),

  updateTextIndicator: (id: number, text: string, subText?: string) =>
    ipcRenderer.send("indicator:update-text-indicator", id, text, subText),

  updateProgressIndicator: (
    id: number,
    progress: number,
    text: string,
    subText?: string
  ) =>
    ipcRenderer.send(
      "indicator:update-progress-indicator",
      id,
      progress,
      text,
      subText
    ),
  /**
   * Shows the indicator which is invisible.
   *
   * @param id the id of indicator to invisible
   * @returns the event of `ipcRenderer.send("indicator:show")`
   */
  show: (id: number) => ipcRenderer.send("indicator:show", id),
  /**
   * Hides the indicator.
   * NOTE: The hidden indicator is cached in main process until disposed.
   *
   * @param id the id of indicator to invisible
   * @returns the event of `ipcRenderer.send("indicator:hide")`
   */
  hide: (id: number) => ipcRenderer.send("indicator:hide", id),

  /**
   * Disposes the indicators.The disposed indicator will be destroyed by runtime GC.
   *
   * @param id the id to dispose the indicator
   * @returns the event of `ipcRenderer.send("indicator:dispose")`
   */
  disposeIndicator: (id: number) => ipcRenderer.send("indicator:dispose", id),
});

contextBridge.exposeInMainWorld("account", {
  getAccounts: () => {
    return ipcRenderer.invoke("account:get-accounts");
  },
});
