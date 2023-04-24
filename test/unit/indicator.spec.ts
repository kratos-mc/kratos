import { expect } from "chai";
import {
  ProgressIndicator,
  TextIndicator,
  indicator,
} from "../../src/main/indicator/indicator";

describe("TextIndicator", () => {
  let textIndicator: TextIndicator;

  beforeEach(() => {
    textIndicator = new TextIndicator(1, "text", "subText", true);
  });

  it("should get text", () => {
    expect(textIndicator.getText()).to.equal("text");
  });

  it("should get subText", () => {
    expect(textIndicator.getSubText()).to.equal("subText");
  });

  it("should set text", () => {
    textIndicator.setText("newText");
    expect(textIndicator.getText()).to.equal("newText");
  });

  it("should set subText", () => {
    textIndicator.setSubText("newSubText");
    expect(textIndicator.getSubText()).to.equal("newSubText");
  });
});

describe("ProgressIndicator", () => {
  let progressIndicator: ProgressIndicator;

  beforeEach(() => {
    progressIndicator = new ProgressIndicator(10, 50, "text", "subText", true);
  });

  it("should get progress", () => {
    expect(progressIndicator.getProgress()).to.equal(50);
  });

  it("should set progress", () => {
    progressIndicator.setProgress(75);
    expect(progressIndicator.getProgress()).to.equal(75);
  });
});
