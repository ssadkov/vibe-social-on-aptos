/**
 * One-time script to initialize CommentEvents on an already-deployed module.
 * Run after first publish (or after upgrading) if the module was deployed without
 * CommentEvents (e.g. before init_module created it).
 *
 * Usage: npm run init-comment-events
 * Requires .env: VITE_MODULE_ADDRESS, VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY, VITE_APP_NETWORK
 */
require("dotenv").config();
const { spawn } = require("child_process");
const path = require("path");
const aptosSDK = require("@aptos-labs/ts-sdk");

const moduleAddress = process.env.VITE_MODULE_ADDRESS;
const privateKey = process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
const network = process.env.VITE_APP_NETWORK || "devnet";

if (!moduleAddress || !privateKey) {
  console.error("Missing .env: set VITE_MODULE_ADDRESS and VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY");
  process.exit(1);
}

const nodeUrl = aptosSDK.NetworkToNodeAPI[network] || aptosSDK.NetworkToNodeAPI.devnet;
const functionId = `${moduleAddress}::vibe_social::init_comment_events`;

const args = [
  "aptos",
  "move",
  "run",
  "--function-id",
  functionId,
  `--private-key=${privateKey}`,
  `--url=${nodeUrl}`,
];

console.log("Calling init_comment_events for", moduleAddress);
const child = spawn("npx", args, {
  cwd: path.join(__dirname, "../.."),
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
