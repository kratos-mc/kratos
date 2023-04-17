import { version } from "kratos-core";
import { getLauncherWorkspace } from "./app";
import * as path from "path";
import { existsSync } from "original-fs";

/**
 * Retrieves the library workspace from launcher workspace.
 *
 * @returns an available library workspace based on launcher workspace
 */
export function getLibraryWorkspace() {
  return getLauncherWorkspace().getLibraryWorkspace();
}

/**
 * Retrieves the absolute file path from library artifacts.
 * The absolute file is formatted as a form of `<WORKSPACE_DIR>/libraries/<LIBRARY_PATH>`.
 *
 * @param library a source library to get a destination
 * @returns the file path destination represents the library location
 */
export function getLibraryArtifactsFilePath(
  library: version.VersionPackageLibrary
) {
  if (library.downloads.artifact === undefined) {
    throw new Error(`Missing downloads.artifact for library ${library.name}`);
  }
  const segment = library.downloads.artifact.path.split("/");
  return path.join(getLibraryWorkspace().getDirectory().toString(), ...segment);
}

/**
 * Checks if the library artifacts is existed on disk or not.
 *
 * @param library a source library to supply the file path
 * @returns true if the library file is available, false otherwise
 */
export function hasArtifactsLibrary(library: version.VersionPackageLibrary) {
  return existsSync(getLibraryArtifactsFilePath(library));
}

export function getLibraryNativesFilePath(
  library: version.VersionPackageLibrary,
  platform: "osx" | "windows" | "linux"
) {
  // Find the classifier corresponding natives platform
  if (library.natives === undefined) {
    throw new Error(`Missing library.natives for library name ${library.name}`);
  }

  const requireClassifiers = library.natives[platform];
  const classifiers = (library.downloads as any).classifiers as any;

  if (classifiers[requireClassifiers] === undefined) {
    throw new Error(
      `Missing classifiers ${requireClassifiers} for library name ${library.name}`
    );
  }
  const segment = classifiers[requireClassifiers].path.split("/");
  return path.join(getLibraryWorkspace().getDirectory().toString(), ...segment);
}

export function getLibraryNativesClassifiers(
  library: version.VersionPackageLibrary,
  platform: "osx" | "windows" | "linux"
): {
  path: string;
  sha1: string;
  size: number;
  url: string;
} {
  // Find the classifier corresponding natives platform
  if (library.natives === undefined) {
    throw new Error(`Missing library.natives for library name ${library.name}`);
  }

  const requireClassifiers = library.natives[platform];
  const classifiers = (library.downloads as any).classifiers as any;

  if (classifiers[requireClassifiers] === undefined) {
    throw new Error(
      `Missing classifiers ${requireClassifiers} for library name ${library.name}`
    );
  }
  return classifiers[requireClassifiers];
}

export function hasNativesLibrary(
  library: version.VersionPackageLibrary,
  platform: "osx" | "linux" | "windows"
) {
  return existsSync(getLibraryNativesFilePath(library, platform));
}
