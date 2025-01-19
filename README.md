# Infinite Odds Game

An illustration of the 
[St. Petersburg Paradox](https://www.economicsdiscussion.net/essays/economics/st-petersburg-paradox-and-bernoulus-hypothesis-with-diagram/1425) built with React, 
Fastify, and Solidity.

## Project Structure

```
infinite-odds/
├── client/               # React client application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── contracts/        # Contract interactions
│   │   └── utils/            # Utility functions
├── server/               # Fastify server application
│   ├── api/                # Serverless function
│   │   └── serverless.js     # Serverless function that Vercel uses
│   ├── src/                # Source code
│   │   ├── config/            # Configuration
│   │   ├── routes/           # API routes
│   │   └── server.js         # Server entry point
│   │   └── local.js          # Server entry point for local development
│   └── tests/              # server tests
└── contracts/            # Solidity smart contracts
    ├── src/                # Contract source code
    └── test/               # Contract tests
```

## Getting Started

1. Clone the repository
2. Install dependencies & copy .env files

  ```bash
  # client
  cd client
  npm install
  cp .env.example .env

  # server
  cd ../server
  npm install
  cp .env.example .env

  # Smart Contracts
  cd ../contracts
  forge install
  cp .env.example .env
  ```

3. Start the client and server services

  ```bash
  cd client
  npm run start  # this will open a browser window

  cd server
  npm run start
  ```

> [!NOTE] 
> 
> Optionally, you can run the server in dev mode using `vercel dev`, which simulates 
> the serverless function.

> [!NOTE]
> 
> You can use the contract deployed on Tea Assam to test the game, or you can use forge 
> to deploy your own contract.

## Testing

Currently, tests are only defined for the server and the smart contract. Coverage isn't
great, but always open to more. 

```bash
# server tests
cd server
npm run test

# Smart contract tests
cd contracts
forge test
```

## Deployment

### client (Vercel)

1. Push your code to GitHub
2. Create a new project on Vercel
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard
5. Deploy with the following settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### server (Vercel)

1. Create a `vercel.json` in the server directory:

  ```json
  {
    "version": 2,
    "builds": [
      {
        "src": "api/serverless.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "api/serverless.js"
      }
    ]
  }
  ```

2. Deploy using Vercel CLI:

   ```bash
   cd server
   vercel
   ```

> [!IMPORTANT]
> 
> I used different projects for the client and server, so had to select `server` as the 
> root directory.

3. Configure environment variables in Vercel dashboard or using `vercel env add ENV_VAR`

### Smart Contracts

1. Deploy using Foundry:

   ```bash
   cd contracts
   forge create src/InfiniteOdds.sol:InfiniteOdds \
     --rpc-url $L2_RPC_URL \
     --private-key $DEPLOYER_PRIVATE_KEY
   ```

2. Update the contract address in your server environment variables

# Contributing

Any PRs are welcome, but here's my personal list of stuff I'd like to see:

## General

- testing
- non-crypto explanation of the paradox / SBF reference would be fun

## UI

- re-render game history on end
- better game history
- better focus on the current game elsewhere (use v0 for ideas)
- new game should reset all error messages
- green font for successful cashOut

## Backend

- store txn hashes?
- securely trigger `cashOut`

## Contract

- cashOut transactions result in token transfers, but not in the tea explorer...why?
