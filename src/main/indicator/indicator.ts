import { getBrowserWindowManager } from "../app";
import { logger } from "../logger/logger";

export interface Indicator {
  getId(): number;
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  show(): void;
  hide(): void;
}

export abstract class AbstractIndicator implements Indicator {
  private id: number;
  private isVisible: boolean;

  constructor(id: number, visible?: boolean) {
    this.id = id;
    this.isVisible = visible || false;
  }

  getVisible(): boolean {
    return this.isVisible;
  }

  setVisible(visible: boolean): void {
    this.isVisible = visible;
  }

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }
  getId(): number {
    return this.id;
  }
}

export class TextIndicator extends AbstractIndicator {
  private text: string;
  private subText: string;

  constructor(id: number, text?: string, subText?: string, visible?: boolean) {
    super(id, visible);
    this.text = text || "";
    this.subText = subText || "";
  }

  public getText(): string {
    return this.text;
  }

  public getSubText(): string {
    return this.subText;
  }

  public setText(text: string) {
    this.text = text;
  }

  public setSubText(subText: string) {
    this.subText = subText;
  }
}

export class ProgressIndicator extends TextIndicator {
  private progress: number;

  constructor(
    id: number,
    progress?: number,
    text?: string,
    subText?: string,
    visible?: boolean
  ) {
    super(id, text, subText, visible);
    this.progress = progress || 0;
  }

  public getProgress(): number {
    return this.progress;
  }

  public setProgress(progress: number) {
    this.progress = progress;
  }
}

export module indicator {
  let prevId = 0;
  let indicators: Map<number, Indicator> = new Map();
  /**
   * Creates a new instance of the TextIndicator class with the specified text and subText.
   * @param {string} text - The text to display in the TextIndicator.
   * @param {string} [subText] - The subText to display in the TextIndicator.
   * @returns {TextIndicator} A new instance of the TextIndicator class.
   */
  export function createTextIndicator(
    text: string,
    subText?: string
  ): TextIndicator {
    const indicator = new TextIndicator(prevId, text, subText, true);
    indicators.set(prevId, indicator);
    prevId++;
    updateIndicators();
    return indicator;
  }

  export function getIndicators(): Map<number, Indicator> {
    return indicators;
  }

  export function disposeIndicator(id: number) {
    if (indicators.has(id)) {
      indicators.delete(id);

      updateIndicators();
    }
  }

  export function updateIndicators() {
    const mainBrowserWindow =
      getBrowserWindowManager().getBrowserWindow("main");

    mainBrowserWindow.webContents.send("indicator:update-indicators", [
      ...indicators.values(),
    ]);
  }

  export function createProgressIndicator(
    text: string,
    subText: string,
    progress: number,
    visible?: boolean
  ) {
    const indicator = new ProgressIndicator(
      prevId,
      progress,
      text,
      subText,
      visible || true
    );
    indicators.set(prevId, indicator);

    prevId++;
    updateIndicators();

    return indicator;
  }

  export function setTextIndicator(id: number, text: string, subText?: string) {
    const getterIndicator = indicators.get(id);
    if (getterIndicator === undefined) {
      throw new Error(`Indicator not found. (id: ${id}`);
    }

    if (!(getterIndicator instanceof ProgressIndicator)) {
      throw new Error(`Indicator with id ${id} is not a ProgressIndicator`);
    }

    getterIndicator.setText(text);
    if (subText !== undefined) {
      getterIndicator.setSubText(subText);
    }
    updateIndicators();
  }

  export function setProgressIndicator(
    id: number,
    progress: number,
    text?: string,
    subText?: string
  ) {
    const getterIndicator = indicators.get(id);
    if (getterIndicator === undefined) {
      throw new Error(`Indicator not found. (id: ${id}`);
    }

    if (!(getterIndicator instanceof ProgressIndicator)) {
      throw new Error(`Indicator with id ${id} is not a ProgressIndicator`);
    }

    logger.info(
      `Updating indicator ${id}; text: ${text}; subText: ${subText}; progress: ${progress};`
    );

    getterIndicator.setProgress(progress);
    setTextIndicator(id, text || "", subText);
    updateIndicators();
  }
}
