import classNames from "classnames";
import React from "react";

export interface TextIndicatorProps {
  id: number;
  visible: boolean;

  text: string;
  subText?: string;
}

export default function TextIndicator({ text, subText }: TextIndicatorProps) {
  return (
    <div className={classNames(`flex`, `flex-col`)}>
      <p className={classNames(``)}>{text}</p>
      {subText && (
        <p className={classNames(`text-xs`, `text-neutral-400`)}>{subText}</p>
      )}
    </div>
  );
}
