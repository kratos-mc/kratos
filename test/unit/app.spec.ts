import { app } from "electron";
import { expect } from "chai";
import { getLauncherWorkspace } from "../../src/main/app";
// import "" from 'electron-mocha'

describe("[smoke] unit test", () => {
  it(`should true is equal true`, () => {
    expect(true).to.be.true;
  });
});

describe("[unit] app#getLauncherWorkspace", () => {
  it(`should return a valid path`, () => {
    expect(getLauncherWorkspace().getDirectory()).to.includes(app.getName());
  });
});
