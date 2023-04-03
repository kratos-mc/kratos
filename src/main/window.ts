import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export type WindowId = "main" | "dev";

export class BrowserWindowManager {
  private windowMap: Map<WindowId, BrowserWindow> = new Map();

  public hasBrowserWindow(id: WindowId) {
    return this.windowMap.has(id);
  }

  public createBrowserWindow(
    id: WindowId,
    options?: BrowserWindowConstructorOptions
  ) {
    let b = new BrowserWindow(options);
    if (this.hasBrowserWindow(id)) {
      throw new Error(`The window with id ${id} already exists.`);
    }
    this.windowMap.set(id, b);
    return b;
  }

  public getBrowserWindow(id: WindowId) {
    const w = this.windowMap.get(id);
    if (w === undefined) {
      throw new Error(`Cannot found window with id: ${id}`);
    }

    return w;
  }

  public getAllWindows() {
    return this.windowMap.values();
  }
}
