import classNames from "classnames";
import React from "react";

export interface ProgressIndicatorProps {
  id: number;
  visible: boolean;

  text: string;
  subText?: string;
  progress?: number;
}

export default function ProgressIndicator({
  text,
  subText,
  progress,
}: ProgressIndicatorProps) {
  return (
    <div className={classNames(`flex`, `flex-col`)}>
      <p className={classNames(``)}>{text}</p>
      {subText && (
        <p className={classNames(`text-xs`, `text-neutral-400`)}>{subText}</p>
      )}
      <div
        className={classNames(`relative`, `bg-neutral-300`, `h-4`, `w-full`)}
      >
        <div
          className={classNames(`h-4`, `absolute`, `bg-blue-500`)}
          style={{
            width: `${progress ? (progress > 1 ? 100 : progress * 100) : 0}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
