export interface Indicator {
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  show(): void;
  hide(): void;
}

export abstract class AbstractIndicator implements Indicator {
  private isVisible: boolean;

  constructor(visible?: boolean) {
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
}

export class TextIndicator extends AbstractIndicator {
  private text: string;
  private subText: string;

  constructor(text?: string, subText?: string, visible?: boolean) {
    super(visible);
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
    progress?: number,
    text?: string,
    subText?: string,
    visible?: boolean
  ) {
    super(text, subText, visible);
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
  const indicators: Set<Indicator> = new Set();
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
    const indicator = new TextIndicator(text, subText, true);
    indicators.add(indicator);
    
    return indicator;
  }

  export function getIndicators(): Set<Indicator> {
    return indicators;
  }

  export function disposeIndicator<T extends Indicator>(indicator: T) {
    if (!indicators.has(indicator)) {
      throw new Error(`Indicator not found`);
    }
    indicators.delete(indicator);
  }

  
}
