import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  getMinecraftVersions: (options?: { snapshot?: boolean }) =>
    ipcRenderer.invoke("version:get-minecraft-versions", options),
});

contextBridge.exposeInMainWorld("utils", {
  openDevTools: (options?) => ipcRenderer.send("util:open-dev-tool", options),
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

function makeCalleeIpcRenderer(
  channel: string,
  listener: (...args: any[]) => void
) {
  const _internalListener = (_event: IpcRendererEvent, ...args) =>
    listener(...args);
  return [
    () => ipcRenderer.on(channel, _internalListener),
    () => ipcRenderer.removeListener(channel, _internalListener),
  ];
}

contextBridge.exposeInMainWorld("download", {
  onCreateDownload: (listener: (...args: [{ size: number }]) => void) =>
    makeCalleeIpcRenderer("download:create-download", listener),
  onProgressDownload: (listener: () => void) =>
    makeCalleeIpcRenderer("download:progress-download", listener),
});

contextBridge.exposeInMainWorld(`indicator`, {
  handleUpdate: (listener: (indicators: []) => void) =>
    makeCalleeIpcRenderer("indicator:update-indicators", listener),

  createText: (text: string, subText: string) =>
    ipcRenderer.invoke("indicator:create-indicator", text, subText),
  createProgress: (text: string, subText?: string, progress?: number) =>
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
