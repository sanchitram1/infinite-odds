# Infinite Odds

A double-or-nothing coin flip game built on TEA's L2, where players can stake native TEA
tokens and potentially double their stake with each successful flip.

## Tech Stack

- **Frontend**: React, ethers.js
- **Database**: Supabase
- **Smart Contracts**: Solidity, Foundry
- **Chain**: TEA L2 (Assam)
- **Authentication**: MetaMask for wallet connection
- **Signatures**: EIP-712 for secure cashouts
- **Deployments**: Foundry for smart contract, vercel for frontend (TODO)

## Project Structure

```
infinite-odds/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contracts/     # Contract interfaces and ABIs
│   │   └── utils/         # Game logic and utilities
│   └── .env.example       # Environment variables template
└── contracts/             # Solidity smart contracts
    ├── src/               # Contract source code
    ├── test/              # Contract test files
    └── script/            # Deployment scripts
```

## Getting Started

### Prerequisites

- Node.js >= 16
- Foundry (for smart contracts)
- MetaMask wallet
- TEA tokens on Assam L2

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Start development server:

```bash
npm start
```

### Contract Development

1. Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Or, if you have `pkgx` installed, just prefix all the steps below with `pkgx`.

2. Install dependencies:

```bash
cd contracts
forge install
```

3. Run tests:

```bash
forge test -vv
```

4. Deploy contract:

```bash
# Configure .env with your values
cp .env.example .env
# Deploy to Assam L2
forge script script/Deploy.s.sol:DeployInfiniteOdds --rpc-url $RPC_URL --broadcast --legacy -vvvv
```

## Game Flow

1. Connect wallet using MetaMask
2. Stake TEA (0-10 tokens)
3. Flip coin:
   - Heads (2x): Continue playing or cash out
   - Tails: Game over, stake is lost
4. Cash out: Get winnings transferred to wallet

## Improvements Checklist

### Security

- [ ] Move signature generation to a secure backend service

### Architecture

- [ ] Rate limiting for cashouts, scaling in general
- [x] Reorganize frontend code structure
- [ ] Error handling and recovery
- [ ] Store txn hash in db for debugging
- [x] Better db schema
- [ ] RLS

### Frontend

- [x] Add loading states and better error messages
- [x] Improve UI/UX design

### Business Logic

- [ ] Define fee structure and recipients
- [ ] Implement treasury management
- [ ] Add variable stake limits based on contract balance
- [ ] Add progressive jackpot system

### Testing

- [ ] Add frontend unit tests
- [ ] Add frontend integration tests
- [ ] Add contract fuzzing tests
- [ ] Add load testing

### Documentation

- [ ] Add API documentation
- [ ] Add contract documentation
- [ ] Add deployment guides for different environments
- [ ] Add contribution guidelines
