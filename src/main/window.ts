import { BrowserWindow } from "electron";

export class LauncherWindow {
  public browserWindow: BrowserWindow;
  private readonly id: string;

  constructor(
    id: string,
    browserOptions?: Electron.BrowserWindowConstructorOptions
  ) {
    this.id = id;
    this.browserWindow = new BrowserWindow(browserOptions);
  }

  /**
   * The launcher window id
   * @returns the current id of the launcher window
   */
  public getId() {
    return this.id;
  }
}

export class MainLauncherWindow extends LauncherWindow {
  constructor(browserOptions?: Electron.BrowserViewConstructorOptions) {
    super("main", browserOptions);
  }
}
