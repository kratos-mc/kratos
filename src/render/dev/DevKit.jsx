import React from "react";
import DevKitProfile from "./DevKitProfile";
import DevKitVersion from "./DevKitVersion";
import DevKitPreferences from "./DevKitPreferences";

export default function DevKit() {
  return (
    <div>
      <h1>DevKit</h1>
      <DevKitPreferences />
      {/* Action about versions */}
      <DevKitVersion />
      {/* Action about profiles */}
      <DevKitProfile />
    </div>
  );
}
