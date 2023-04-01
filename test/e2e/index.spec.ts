import { _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";

test("should not throw any exception when launching", async () => {
  // Launch Electron app.
  const electronApp = await electron.launch({ args: ["."] });

  // Evaluation expression in the Electron context.
  const appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.getAppPath();
  });
  console.log(`appPath: ` + appPath);

  // Get the first window that the app opens, wait if necessary.
  const window = await electronApp.firstWindow();

  // Print the title.
  console.log(await window.title());

  // Direct Electron console to Node terminal.
  window.on("console", console.log);

  // Successfully render index.html
  expect(await window.$("div#app")).not.toBeUndefined();

  // Exit app.
  await electronApp.close();
});
