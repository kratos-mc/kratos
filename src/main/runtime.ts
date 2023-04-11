import * as path from "path";
import { kratosRuntime } from "kratos-runtime-resolver";
import { getRuntimeWorkspace } from "./app";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { logger } from "./logger/logger";

/**
 * Finds a runtime and returns RuntimeMapEntry from runtime map.
 *
 *
 * @param majorVersion the major runtime version to look up
 * @returns the runtime that exists in built map. Otherwise, return undefinded
 */
export function getRuntime(
  majorVersion: number
): kratosRuntime.RuntimeMapEntry | undefined {
  return getRuntimeWorkspace().getRuntimeMap().getRuntime(majorVersion);
}

/**
 * Finds and returns if the runtime that contains inside runtime map.
 *
 * @param majorVersion a major version of runtime to search for
 * @returns true if the runtime is exists, false otherwise.
 */
export function hasRuntime(majorVersion: number) {
  return getRuntimeWorkspace().getRuntimeMap().hasRuntime(majorVersion);
}

/**
 * Spawns and retrieves a Java process with specific Java version.
 *
 *
 * @param major the java version to spawn a process
 * @param parameter the parameter to pass into sub-process
 * @param options the options for spawning
 * @returns the spawned process
 */
export function spawnJavaProcess(
  major: number,
  parameter: string[],
  options?: SpawnOptionsWithoutStdio
) {
  const currentRuntimeFromMap = getRuntime(major);
  if (currentRuntimeFromMap === undefined) {
    throw new Error(`Runtime was not installed`);
  }

  const sourceBinaryJavaPath = path.join(
    currentRuntimeFromMap.bin.toString(),
    "java"
  );

  const process = spawn(sourceBinaryJavaPath, parameter, options);
  logger.info(`Spawning java process (major: ${major}, pid: ${process.pid})`);

  process.stdout.on("data", (chunk: Buffer) => {
    logger.info(chunk.toString());
  });

  process.stderr.on("data", (chunk: Buffer) => {
    logger.error(chunk.toString());
  });

  process.on("exit", (code) => {
    logger.info(`Process exit with code ${code}`);
  });

  return process;
}
