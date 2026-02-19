## Create Aptos Dapp Boilerplate Template

The Boilerplate template provides a starter dapp with all necessary dapp infrastructure and a simple wallet info implementation, transfer APT and a simple message board functionality to send and read a message on chain.

## Read the Boilerplate template docs

To get started with the Boilerplate template and learn more about the template functionality and usage, head over to the [Boilerplate template docs](https://learn.aptoslabs.com/en/dapp-templates/boilerplate-template)

## The Boilerplate template provides:

- **Folder structure** - A pre-made dapp folder structure with a `frontend` and `contract` folders.
- **Dapp infrastructure** - All required dependencies a dapp needs to start building on the Aptos network.
- **Wallet Info implementation** - Pre-made `WalletInfo` components to demonstrate how one can use to read a connected Wallet info.
- **Transfer APT implementation** - Pre-made `transfer` components to send APT to an address.
- **Message board functionality implementation** - Pre-made `message` components to send and read a message on chain
- **Vibe Social** - On-chain comments and voting for any Aptos object: comment object (Move V2), up/down votes (one per wallet per comment), delete by author; React `VibeFeed`, `VibeButton`, and `useVibeActions` hook

## What tools the template uses?

- React framework
- Vite development tool
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands
- [Vite-pwa](https://vite-pwa-org.netlify.app/)

## What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:publish` - a command to publish the Move contract
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:upgrade` - a command to upgrade the Move contract
- `npm run dev` - a command to run the frontend locally
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.

## Run on Devnet

### 1. Create `.env` from example

```bash
cp .env.example .env
```

### 2. Get a devnet account (address + private key)

- **Option A – Aptos CLI:**  
  In a separate folder (or reuse existing): `aptos init --network devnet`.  
  Then open `~/.aptos/config.yaml`, copy the `private_key` and `account_address` of the profile you use (do not share or commit them).
- **Option B – Wallet:** Create an account in a devnet wallet (e.g. Petra), export or copy address and private key (only for devnet testing).

Fund the account with devnet APT: https://aptoslabs.com/testnet-faucet (choose Devnet).

### 3. Fill `.env` (project root: `vibe-social/`)

| Variable | Where it's used | What to set |
|----------|-----------------|-------------|
| `VITE_APP_NETWORK` | Frontend network, publish/compile script URL | `devnet` |
| `VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS` | Compile/publish: named addresses for Move | Your devnet account address (e.g. `0x...`) |
| `VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY` | Publish only (never commit) | Your devnet account private key |
| `VITE_MODULE_ADDRESS` | Frontend: module/contract address | Leave empty before first publish; script will write it after `npm run move:publish` |
| `VITE_APTOS_API_KEY` | Optional; frontend + wallet for API rate limits | From [Aptos Labs](https://aptoslabs.com) if needed |

Example (replace with your values):

```env
VITE_APP_NETWORK=devnet
VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=0xYourDevnetAddress
VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=0xYourDevnetPrivateKey
```

**Important:** `VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS` must be the address of the account that owns `VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY`. If they differ, you will get `MODULE_ADDRESS_DOES_NOT_MATCH_SENDER` on publish. After changing the address, run `npm run move:compile` again, then `npm run move:publish`.

### 4. Compile and publish

```bash
npm run move:compile   # uses VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS
npm run move:publish   # uses address + private key + VITE_APP_NETWORK; writes VITE_MODULE_ADDRESS to .env
```

After publish, `.env` will contain `VITE_MODULE_ADDRESS=<deployed_object_address>`.

### 5. Start the frontend

```bash
npm run dev
```

Connect the same devnet wallet (or the same account you used to publish). The app will use devnet and the published module address from `.env`.
