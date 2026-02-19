require("dotenv").config();
const fs = require("node:fs");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

async function publish() {

  if (!process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS) {
    throw new Error(
      "VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY variable is not set, make sure you have set the publisher account address",
    );
  }

  if (!process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY) {
    throw new Error(
      "VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY variable is not set, make sure you have set the publisher account private key",
    );
  }

  const move = new cli.Move();

  move
    .createObjectAndPublishPackage({
      packageDirectoryPath: "contract",
      addressName: "message_board_addr",
      namedAddresses: {
        message_board_addr: process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
        vibe_social_addr: process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
      },
      extraArguments: [
        `--private-key=${process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY}`,
        `--url=${aptosSDK.NetworkToNodeAPI[process.env.VITE_APP_NETWORK]}`,
        ...(process.env.ASSUME_YES ? ["--assume-yes"] : []),
      ],
    })
    .then((response) => {
      const filePath = ".env";
      let envContent = "";

      // Check .env file exists and read it
      if (fs.existsSync(filePath)) {
        envContent = fs.readFileSync(filePath, "utf8");
      }

      // Regular expression to match the VITE_MODULE_ADDRESS variable
      const regex = /^VITE_MODULE_ADDRESS=.*$/m;
      const newEntry = `VITE_MODULE_ADDRESS=${response.objectAddress}`;

      // Check if VITE_MODULE_ADDRESS is already defined
      if (envContent.match(regex)) {
        // If the variable exists, replace it with the new value
        envContent = envContent.replace(regex, newEntry);
      } else {
        // If the variable does not exist, append it
        envContent += `\n${newEntry}`;
      }

      // Write the updated content back to the .env file
      fs.writeFileSync(filePath, envContent, "utf8");
    })
    .catch((err) => {
      const msg = err?.message || String(err);
      if (msg.includes("MODULE_ADDRESS_DOES_NOT_MATCH_SENDER") && msg.includes("does not match the sender")) {
        const match = msg.match(/the sender (0x[a-fA-F0-9]+)/);
        const senderAddr = match ? match[1] : "(see error below)";
        console.error("\nFix: VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS must be the account that owns the private key.");
        console.error("Set in .env:\n  VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=" + senderAddr);
        console.error("Then run: npm run move:compile && npm run move:publish\n");
      }
      throw err;
    });
}
publish();
