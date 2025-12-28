#!/usr/bin/env node
import { exec } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// ---- CONFIG ----
// Store aliases in user's home directory so they persist across updates
const configDir = path.join(os.homedir(), ".vs-quick-open");
const aliasFile = path.join(configDir, "aliases.json");

// Create config directory if it doesn't exist
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

function expandHome(p) {
  return p.replace(/^~($|\/|\\)/, `${os.homedir()}$1`);
}

if (!fs.existsSync(aliasFile)) {
  fs.writeFileSync(aliasFile, "{}");
}
let aliases = JSON.parse(fs.readFileSync(aliasFile, "utf-8"));

function saveAliases() {
  fs.writeFileSync(aliasFile, JSON.stringify(aliases, null, 2));
}

// ---- COMMANDS ----
program
  .name("vs")
  .description("Open VS Code with aliases")
  .version("1.0.0");

program
  .command("add <alias> <path>")
  .description("Add an alias for a file/folder")
  .action((alias, target = ".") => {
    const resolved = expandHome(path.resolve(process.cwd(), target));
    aliases[alias] = resolved;
    saveAliases();
    console.log(`✅ Added alias "${alias}" -> ${resolved}`);
  });

program
  .command("remove <alias>")
  .description("Remove an alias")
  .action((alias) => {
    if (aliases[alias]) {
      delete aliases[alias];
      saveAliases();
      console.log(`🗑️ Removed alias "${alias}"`);
    } else {
      console.log(`⚠️ Alias "${alias}" not found`);
    }
  });

program
  .command("list")
  .description("List all aliases")
  .action(() => {
    if (Object.keys(aliases).length === 0) {
      console.log("📂 No aliases found");
      return;
    }
    console.log("📂 Your aliases:");
    Object.entries(aliases).forEach(([k, v]) => {
      console.log(`  ${k} -> ${v}`);
    });
  });

// ---- DEFAULT BEHAVIOR: open alias/file/folder ----
program
  .argument("[targets...]", "alias, file, or folder to open")
  .action((targets) => {
    if (!targets || targets.length === 0) {
      program.help();
      return;
    }

    const resolvedArgs = targets.map((arg) => {
      const target = aliases[arg] || arg;
      const expanded = expandHome(target);
      if (!fs.existsSync(expanded)) {
        console.warn(`⚠️ Warning: Path "${expanded}" does not exist`);
      }
      return expanded;
    });

    // Base command by OS
    let baseCommand;
    switch (os.platform()) {
      case "win32":
        baseCommand = `"C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"`;
        break;
      case "darwin":
        baseCommand = `open -a "Visual Studio Code"`;
        break;
      case "linux":
        baseCommand = `code`;
        break;
      default:
        console.error("❌ Unsupported OS");
        process.exit(1);
    }

    const command = `${baseCommand} ${resolvedArgs.map((f) => `"${f}"`).join(" ")}`;
    
    console.log(`🚀 Opening in VS Code: ${resolvedArgs.join(", ")}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${stderr || error.message}`);
        process.exit(1);
      }
      if (stdout) {
        console.log(stdout);
      }
      console.log("✅ VS Code opened successfully!");
    });
  });

program.parse(process.argv);