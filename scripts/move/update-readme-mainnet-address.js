/**
 * Update README "Deployed module addresses" table with current VITE_MODULE_ADDRESS for Mainnet.
 * Run after a successful mainnet publish so README stays in sync.
 *
 * Usage: npm run update-readme-mainnet-address
 * Reads only VITE_MODULE_ADDRESS from .env; does not read or display any secrets.
 */
require("dotenv").config();
const fs = require("node:fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const README_PATH = path.join(ROOT, "README.md");

const placeholder = "| Mainnet | _(fill after first mainnet publish)_ |";

function main() {
  const moduleAddress = process.env.VITE_MODULE_ADDRESS;
  if (!moduleAddress || typeof moduleAddress !== "string" || !moduleAddress.startsWith("0x")) {
    console.error("VITE_MODULE_ADDRESS not set or invalid in .env. Run mainnet publish first.");
    process.exit(1);
  }

  let readme = fs.readFileSync(README_PATH, "utf8");
  if (!readme.includes(placeholder)) {
    const existingMainnetRow = readme.match(/\|\s*Mainnet\s*\|\s*`?0x[a-fA-F0-9]+`?\s*\|/);
    if (existingMainnetRow) {
      readme = readme.replace(existingMainnetRow[0], `| Mainnet | \`${moduleAddress.trim()}\` |`);
    } else {
      console.error("README Mainnet row not found or format changed. Update README manually.");
      process.exit(1);
    }
  } else {
    readme = readme.replace(placeholder, `| Mainnet | \`${moduleAddress.trim()}\` |`);
  }

  fs.writeFileSync(README_PATH, readme, "utf8");
  console.log("README updated with Mainnet module address:", moduleAddress.slice(0, 18) + "...");
}

main();
