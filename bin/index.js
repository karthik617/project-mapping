#!/usr/bin/env node
const exec = require("child_process").exec;
const os = require("os");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const aliasFile = path.join(__dirname, ".vs-code-aliases.json");

// Ensure alias file exists
if (!fs.existsSync(aliasFile)) {
  fs.writeFileSync(aliasFile, "{}");
}
let aliases = JSON.parse(fs.readFileSync(aliasFile, "utf-8"));

// Helper to save aliases
function saveAliases() {
  fs.writeFileSync(aliasFile, JSON.stringify(aliases, null, 2));
}

// ---- ALIAS MANAGEMENT ----
if (args[0] === "--add" && args.length >= 3) {
  const [ , name, target ] = args;
  aliases[name] = target;
  saveAliases();
  console.log(`✅ Added alias "${name}" -> ${target}`);
  process.exit(0);
}

if (args[0] === "--remove" && args.length >= 2) {
  const [ , name ] = args;
  if (aliases[name]) {
    delete aliases[name];
    saveAliases();
    console.log(`🗑️ Removed alias "${name}"`);
  } else {
    console.log(`⚠️ Alias "${name}" not found`);
  }
  process.exit(0);
}

if (args[0] === "--list") {
    if (Object.keys(aliases).length === 0) {
        console.log("📂 No aliases found");
        process.exit(0);
    }
    console.log("📂 Your aliases:");
    Object.entries(aliases).forEach(([k, v]) => {
        console.log(`  ${k} -> ${v}`);
    });
    process.exit(0);
}

// ---- OPEN FILES/FOLDERS ----
if (args.length === 0) {
  console.log("Usage: vs <alias|file|folder> [...]");
  console.log("Alias management:\n vs --add <alias> <path>\n vs --remove <alias>\n vs --list");
  process.exit(1);
}

// Replace aliases in args
const resolvedArgs = args.map(arg => aliases[arg] || arg);

let command;
switch (os.platform()) {
  case "win32":
    command = `"C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe" ${resolvedArgs.map(a => `"${a}"`).join(" ")}`;
    break;
  case "darwin":
    command = `open -a "Visual Studio Code" ${resolvedArgs.map(a => `"${a}"`).join(" ")}`;
    break;
  case "linux":
    command = `code ${resolvedArgs.map(a => `"${a}"`).join(" ")}`;
    break;
  default:
    console.error("❌ Unsupported OS");
    process.exit(1);
}

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${stderr || error.message}`);
    process.exit(1);
  }
  if (stdout) console.log(stdout);
});
