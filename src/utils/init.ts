import * as path from "jsr:@std/path";
import { walk } from "jsr:@std/fs";
import { Sync } from "@engine";

const SYNCS_DIR = Deno.env.get("SYNCS_DIR") ?? "src/syncs/";

/**
 * Dynamically discovers and imports all synchronization functions from a given directory.
 *
 * It recursively walks the `syncsDir` looking for files ending in `.sync.ts`.
 * All named exports from these files are collected. The key for each sync is its
 * fully-qualified name, derived from its file path and export name.
 *
 * @param syncsDir The path to the directory containing sync implementations.
 * @returns A promise that resolves to a record of all sync functions, keyed by their
 *          fully-qualified name (e.g., 'user.login.Signup').
 */
export async function initSynchronizations(
  syncsDir: string = SYNCS_DIR,
): Promise<Record<string, Sync>> {
  const syncs: Record<string, Sync> = {};
  const absoluteSyncsDir = path.resolve(syncsDir);

  console.log(`\nRegistering synchronizations from: ${absoluteSyncsDir}`);

  const syncFiles = walk(absoluteSyncsDir, {
    includeFiles: true,
    includeDirs: false,
    exts: [".sync.ts"],
  });

  for await (const entry of syncFiles) {
    try {
      const moduleUrl = path.toFileUrl(entry.path).href;
      const module = await import(moduleUrl);

      const relativePath = path.relative(absoluteSyncsDir, entry.path);
      // 'user/login.sync.ts' -> 'user/login'
      const baseName = relativePath.slice(0, -".sync.ts".length);
      // 'user/login' -> 'user.login'
      const namePrefix = baseName.replaceAll(path.SEPARATOR, ".");

      for (const exportName in module) {
        if (Object.hasOwn(module, exportName)) {
          const qualifiedName = `${namePrefix}.${exportName}`;
          syncs[qualifiedName] = module[exportName];
          console.log(`  -> ${qualifiedName}`);
        }
      }
    } catch (error) {
      console.error(
        `  -> ERROR: Failed to load syncs from ${entry.path}:`,
        error,
      );
    }
  }

  console.log("Completed registering synchronizations.");
  return syncs;
}
