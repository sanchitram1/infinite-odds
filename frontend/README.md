# frontend

A React-based frontend for the St. Petersburg Paradox.

## Stack

- React
- Supabase
- Vercel (TBD, for deployment)

## Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js
│   ├── components/
│   │   ├── Game.jsx          # Main game component
│   │   ├── GameHistory.jsx   # Game history component
│   │   ├── LoadingScreen.jsx # Loading screen component
│   ├── utils/
│   │   ├── gameLogic.js
│   ├── supabaseClient.js   # Supabase configuration
│   └── App.js              # Main application routes
│   ├── index.css           # Global styles
│   └── index.js            # Entry point
└── .env                    # Environment variables
└── public/                 # Static assets
```

## Game Mechanics

This is contained with [gameLogic.js](./src/utils/gameLogic.js)

- Players start with a stake of 1
- Each flip has two possible outcomes:
  - Heads (2x): Doubles the current stake
  - Tails (Bust): Player loses everything
- Players can cash out at any time to secure their winnings
- Maximum of 10 successful flips allowed per game
- All game results are stored in Supabase

## Environment Variables

The following environment variables are required in `.env`, and are contained in
[.env.example](./.env.example)

```sh
REACT_APP_API_URL=http://localhost:3001 # Backend
REACT_APP_INITIAL_STAKE=1 # Default initial stake for a player
REACT_APP_MAX_STAKE=10 # Maximum stake for a player
REACT_APP_MAX_FLIPS=10 # Maximum number of flips for a player
REACT_APP_MIN_STAKE=0.1 # Minimum stake for a player
REACT_APP_SUPABASE_URL=your_supabase_url # Supabase URL
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key # Supabase anonymous key
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Setup environment variables
   ```sh
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm start
   ```
