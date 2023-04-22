import { expect } from "chai";
import {
  ProgressIndicator,
  TextIndicator,
  indicator,
} from "../../src/main/indicator/indicator";

describe("TextIndicator", () => {
  let textIndicator: TextIndicator;

  beforeEach(() => {
    textIndicator = new TextIndicator("text", "subText", true);
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
    progressIndicator = new ProgressIndicator(50, "text", "subText", true);
  });

  it("should get progress", () => {
    expect(progressIndicator.getProgress()).to.equal(50);
  });

  it("should set progress", () => {
    progressIndicator.setProgress(75);
    expect(progressIndicator.getProgress()).to.equal(75);
  });
});

describe("indicator module", () => {
  afterEach(() => {
    const indicators = indicator.getIndicators();
    indicators.forEach((ind) => indicator.disposeIndicator(ind));
  });

  it("should create a TextIndicator", () => {
    const textIndicator = indicator.createTextIndicator("text", "subText");
    expect(textIndicator).to.be.instanceOf(TextIndicator);
    expect(textIndicator.getText()).to.equal("text");
    expect(textIndicator.getSubText()).to.equal("subText");
  });

  it("should get indicators", () => {
    const textIndicator = indicator.createTextIndicator("text", "subText");
    const indicators = indicator.getIndicators();
    expect(indicators.size).to.equal(1);
    expect(indicators.has(textIndicator)).to.be.true;
  });

  it("should dispose an indicator", () => {
    const textIndicator = indicator.createTextIndicator("text", "subText");
    let indicators = indicator.getIndicators();
    expect(indicators.size).to.equal(1);
    expect(indicators.has(textIndicator)).to.be.true;

    indicator.disposeIndicator(textIndicator);
    indicators = indicator.getIndicators();
    expect(indicators.size).to.equal(0);
  });

  it("should throw an error when disposing a non-existent indicator", () => {
    const textIndicator = new TextIndicator();
    expect(() => indicator.disposeIndicator(textIndicator)).to.throw(
      `Indicator not found`
    );
  });
});
