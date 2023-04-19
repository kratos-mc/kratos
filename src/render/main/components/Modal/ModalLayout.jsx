import React, { useRef } from "react";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

export default function ModalLayout({ visible, setVisible, children }) {
  const ref = useRef();
  // Call hook passing in the ref and a function to call on outside click
  useOnClickOutside(ref, () => setVisible(false));

  return (
    <div className="z-20 bg-black bg-opacity-20 absolute left-0 top-0 w-full h-full">
      <div ref={ref}>{children}</div>
    </div>
  );
}
