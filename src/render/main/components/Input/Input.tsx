import React, { ReactElement } from "react";
import classnames from "classnames";

export interface InputProps {
  props: ReactElement;
}

export default function Input(props: InputProps) {
  return (
    <input
      className={classnames(
        `w-full px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-md`
      )}
      {...props}
    />
  );
}
