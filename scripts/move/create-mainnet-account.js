/**
 * Create a new mainnet publisher account and write it to .env.
 * Does NOT run faucet (no mainnet faucet). Key is never printed.
 *
 * Usage: npm run create-mainnet-account
 * Then: fund the printed address with real APT, run npm run move:compile && npm run move:publish
 */
require("dotenv").config();
const fs = require("node:fs");
const path = require("path");
const crypto = require("crypto");
const aptosSDK = require("@aptos-labs/ts-sdk");

const ROOT = path.join(__dirname, "../..");
const ENV_PATH = path.join(ROOT, ".env");
const ENV_EXAMPLE_PATH = path.join(ROOT, ".env.example");

function setEnvInContent(envContent, name, value) {
  const regex = new RegExp(`^${name}=.*$`, "m");
  const line = `${name}=${value}`;
  if (envContent.match(regex)) {
    return envContent.replace(regex, line);
  }
  return envContent.trimEnd() + "\n" + line + "\n";
}

function main() {
  const seed = crypto.randomBytes(32);
  const privateKeyHex = "0x" + seed.toString("hex");

  const Ed25519PrivateKey = aptosSDK.Ed25519PrivateKey;
  const Account = aptosSDK.Account;
  const privateKey = new Ed25519PrivateKey(seed);
  const account = Account.fromPrivateKey({ privateKey });
  const address = account.accountAddress.toString();

  let envContent = "";
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, "utf8");
  } else if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    envContent = fs.readFileSync(ENV_EXAMPLE_PATH, "utf8");
  } else {
    envContent =
      "VITE_APP_NETWORK=mainnet\nVITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=\nVITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=\nVITE_MODULE_ADDRESS=\n";
  }

  envContent = setEnvInContent(envContent, "VITE_APP_NETWORK", "mainnet");
  envContent = setEnvInContent(envContent, "VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS", address);
  envContent = setEnvInContent(envContent, "VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY", privateKeyHex);

  fs.writeFileSync(ENV_PATH, envContent, "utf8");

  console.log("Mainnet publisher account created. Address (fund with real APT):");
  console.log(address);
  console.log("");
  console.log(".env updated (key not printed). Next steps:");
  console.log("1. Fund the address with real APT (no mainnet faucet).");
  console.log("2. Run: npm run move:compile && npm run move:publish");
  console.log("3. If publish fails with MODULE_ADDRESS_DOES_NOT_MATCH_SENDER, set in .env:");
  console.log("   VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=<sender from error message>");
  console.log("   Then run: npm run move:compile && npm run move:publish again");
  console.log("4. After publish, run: npm run update-readme-mainnet-address");
}

main();
