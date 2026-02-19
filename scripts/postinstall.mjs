#!/usr/bin/env node
// Postinstall: patch GramJS TL schema + install bundled plugins
import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from "fs";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);
const patchScript = join(root, "scripts", "patch-gramjs.sh");

try {
  execSync(`bash "${patchScript}"`, { stdio: "inherit", cwd: root });
} catch {
  // Non-fatal: styled buttons won't work but everything else will
  console.log("⚠️  GramJS patch skipped (styled buttons disabled)");
}

// ── Install bundled plugins to ~/.teleton/plugins/ ──
const teletонRoot = process.env.TELETON_HOME || join(homedir(), ".teleton");
const targetPluginsDir = join(teletонRoot, "plugins");
const bundledPluginsDir = join(root, "plugins");

if (existsSync(bundledPluginsDir)) {
  mkdirSync(targetPluginsDir, { recursive: true });

  function copyDirRecursive(src, dest) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src)) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      if (statSync(srcPath).isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  for (const pluginName of readdirSync(bundledPluginsDir)) {
    const srcDir = join(bundledPluginsDir, pluginName);
    if (!statSync(srcDir).isDirectory()) continue;
    const destDir = join(targetPluginsDir, pluginName);
    try {
      copyDirRecursive(srcDir, destDir);
      console.log(`📦 Installed bundled plugin: ${pluginName}`);
    } catch (err) {
      console.warn(`⚠️  Failed to install plugin ${pluginName}: ${err.message}`);
    }
  }
}
