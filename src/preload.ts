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
});

contextBridge.exposeInMainWorld("profiles", {
  getAllProfiles: () => ipcRenderer.invoke("profile:get-all-profiles"),
  createProfile: (name: string, version: string) =>
    ipcRenderer.invoke(`profile:create-profile`, name, version),
  deleteProfile: (profileId: string) =>
    ipcRenderer.send("profile:delete-profile", profileId),
});
