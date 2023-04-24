import React, { useRef } from "react";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import classnames from "classnames";

export default function ModalLayout({ visible, setVisible, children }) {
  const ref = useRef();
  // Call hook passing in the ref and a function to call on outside click
  useOnClickOutside(ref, () => setVisible(false));

  return (
    visible && (
      <div
        className={classnames(
          `z-20 bg-black bg-opacity-20 absolute left-0 top-0 w-full h-full rounded-t-xl`,
          `flex flex-col items-center justify-start`
        )}
      >
        <div className="w-2/3 md:w-2/4" ref={ref}>
          {children}
        </div>
      </div>
    )
  );
}
