# Infinite Odds Game

An illustration of the 
[St. Petersburg Paradox](https://www.economicsdiscussion.net/essays/economics/st-petersburg-paradox-and-bernoulus-hypothesis-with-diagram/1425) built with React, 
Fastify, and Solidity.

## Project Structure

```
infinite-odds/
├── client/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── contracts/        # Contract interactions
│   │   └── utils/            # Utility functions
├── server/               # Fastify backend application
│   ├── src/                # Source code
│   │   ├── config/            # Configuration
│   │   ├── routes/           # API routes
│   │   └── db/               # Database models
│   └── tests/              # Backend tests
└── contracts/            # Solidity smart contracts
    ├── src/                # Contract source code
    └── test/               # Contract tests
```

## Getting Started

1. Clone the repository
2. Install dependencies & copy .env files

  ```bash
  # Frontend
  cd frontend
  npm install
  cp .env.example .env

  # Backend
  cd ../backend
  npm install
  cp .env.example .env

  # Smart Contracts
  cd ../contracts
  forge install
  cp .env.example .env
  ```

3. Start the frontend and backend services

  ```bash
  cd frontend
  npm run start  # this will open a browser window

  cd backend
  npm run start
  ```

> [!NOTE]
> 
> You can use the contract deployed on Tea Assam to test the game, or you can use forge 
> to deploy your own contract.

## Testing

Currently, tests are only defined for the backend and the smart contract. Coverage isn't
great, but always open to more. 

```bash
# Backend tests
cd backend
npm run test

# Smart contract tests
cd contracts
forge test
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Create a new project on Vercel
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard
5. Deploy with the following settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### Backend (Vercel)

1. Create a `vercel.json` in the backend directory:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.js"
       }
     ]
   }
   ```

2. Deploy using Vercel CLI:

   ```bash
   cd backend
   vercel
   ```

3. Configure environment variables in Vercel dashboard

### Smart Contracts

1. Deploy using Foundry:

   ```bash
   cd contracts
   forge create src/InfiniteOdds.sol:InfiniteOdds \
     --rpc-url $L2_RPC_URL \
     --private-key $DEPLOYER_PRIVATE_KEY
   ```

2. Update the contract address in your backend environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
