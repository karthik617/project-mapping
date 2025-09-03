#!/usr/bin/env node
import { exec } from "child_process";
import os from "os";

// Get file/folder arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: vs <file|folder> [...]");
  process.exit(1);
}

let command;

// Detect OS
switch (os.platform()) {
  case "win32":
    // Windows: full path to VS Code executable
    command = `"C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe" ${args.map(a => `"${a}"`).join(" ")}`;
    break;

  case "darwin":
    // macOS: use `open -a`
    command = `open -a "Visual Studio Code" ${args.map(a => `"${a}"`).join(" ")}`;
    break;

  case "linux":
    // Linux: assume `code` is in PATH
    command = `code ${args.map(a => `"${a}"`).join(" ")}`;
    break;

  default:
    console.error("Unsupported OS");
    process.exit(1);
}

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${stderr || error.message}`);
    process.exit(1);
  }
  if (stdout) console.log(stdout);
});