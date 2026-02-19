/**
 * Set VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS to the address that matches
 * VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY in .env. Use when you get
 * MODULE_ADDRESS_DOES_NOT_MATCH_SENDER (address and key were for different accounts).
 *
 * Usage: npm run fix-env-address
 * Reads .env, derives address from private key, overwrites the address in .env.
 * Key is never printed.
 */
require("dotenv").config();
const fs = require("node:fs");
const path = require("path");
const aptosSDK = require("@aptos-labs/ts-sdk");

const ROOT = path.join(__dirname, "../..");
const ENV_PATH = path.join(ROOT, ".env");

function main() {
  const keyHex = process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
  if (!keyHex || typeof keyHex !== "string") {
    console.error("VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY not set in .env");
    process.exit(1);
  }

  const hex = keyHex.replace(/^0x/i, "");
  if (hex.length !== 64) {
    console.error("Private key must be 32 bytes (64 hex chars), got", hex.length / 2, "bytes");
    process.exit(1);
  }

  const seed = Buffer.from(hex, "hex");
  const Ed25519PrivateKey = aptosSDK.Ed25519PrivateKey;
  const Account = aptosSDK.Account;
  const privateKey = new Ed25519PrivateKey(seed);
  const account = Account.fromPrivateKey({ privateKey });
  const address = account.accountAddress.toString();

  let envContent = fs.readFileSync(ENV_PATH, "utf8");
  const regex = /^VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=.*$/m;
  const line = `VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=${address}`;
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, line);
  } else {
    envContent = envContent.trimEnd() + "\n" + line + "\n";
  }
  fs.writeFileSync(ENV_PATH, envContent, "utf8");

  console.log("Updated .env: VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=" + address);
  console.log("Run: npm run move:compile && npm run move:publish");
  console.log("(If publish still fails with MODULE_ADDRESS_DOES_NOT_MATCH_SENDER, set the address to the 'sender' from the error and recompile, or use npm run fresh-deploy.)");
}

main();
