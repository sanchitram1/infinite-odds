# Infinite Odds Game

A decentralized coin flip game built with React, Fastify, and Solidity.

## Project Structure

```
infinite-odds/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── contracts/      # Contract interactions
│   │   └── utils/          # Utility functions
├── backend/                 # Fastify backend application
│   ├── src/                # Source code
│   │   ├── config/        # Configuration
│   │   ├── routes/        # API routes
│   │   └── db/           # Database models
│   └── tests/             # Backend tests
└── contracts/              # Solidity smart contracts
    ├── src/               # Contract source code
    └── test/             # Contract tests
```

## Development Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install

   # Smart Contracts
   cd ../contracts
   forge install
   ```

3. Set up environment variables:

   ```bash
   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_INITIAL_STAKE=1
   REACT_APP_MAX_STAKE=10
   REACT_APP_MAX_FLIPS=10
   REACT_APP_MIN_STAKE=0.1
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # Backend (.env)
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   L2_RPC_URL=your_l2_rpc_url
   CONTRACT_ADDRESS=your_contract_address
   SIGNER_PRIVATE_KEY=your_signer_private_key

   # Smart Contracts
   RPC_URL=rpc_url
   CHAIN_ID=chain_id
   CONDUIT_API_KEY=conduit_api_key
   FEE_COLLECTOR_ADDRESS=fee_collector_address
   PRIVATE_KEY=deployment_private_key
   SIGNER_PRIVATE_KEY=signer_private_key
   ```

## Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

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
