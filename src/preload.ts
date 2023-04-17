import { contextBridge, ipcRenderer } from "electron";

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
});

contextBridge.exposeInMainWorld("profiles", {
  getAllProfiles: () => ipcRenderer.invoke("profile:get-all-profiles"),
  createProfile: (name: string, version: string) =>
    ipcRenderer.invoke(`profile:create-profile`, name, version),
  deleteProfile: (profileId: string) =>
    ipcRenderer.send("profile:delete-profile", profileId),
  launchProfile: (profileId: string) =>
    ipcRenderer.send("profile:launch-profile", profileId),
});

contextBridge.exposeInMainWorld("runtime", {
  hasRuntime: (major: number): Promise<boolean> =>
    ipcRenderer.invoke("runtime:has-runtime", major),
  downloadRuntime: (major: number) =>
    ipcRenderer.send("runtime:download", major),
  getRuntime: (major: number) =>
    ipcRenderer.invoke("runtime:get-runtime", major),
});
