import React from "react";
import DevKitProfile from "./DevKitProfile";
import DevKitVersion from "./DevKitVersion";

export default function DevKit() {
  return (
    <div>
      <h1>DevKit</h1>
      {/* Action about versions */}
      <DevKitVersion />
      {/* Action about profiles */}
      <DevKitProfile />
    </div>
  );
}
