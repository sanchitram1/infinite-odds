# frontend

A React-based coin flip game where players can double their stake or lose everything.

## Stack

- React
- Supabase
- Vercel (TBD, for deployment)

## Game Mechanics

- Players start with a stake of 1
- Each flip has two possible outcomes:
  - Heads (2x): Doubles the current stake
  - Tails (Bust): Player loses everything
- Players can cash out at any time to secure their winnings
- Maximum of 10 successful flips allowed per game
- All game results are stored in Supabase

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Game.jsx        # Main game component
│   │   ├── Game.css        # Game styling
│   │   └── SupabaseTest.jsx # Test component for Supabase
│   ├── utils/
│   │   └── gameLogic.js    # Core game mechanics
│   │   └── signature.js    # Signing service
│   ├── supabaseClient.js   # Supabase configuration
│   └── App.js              # Main application routes
├── tests/
│   ├── supabaseTest.js     # Supabase connection tests
│   └── gameIntegration.test.js # Integration tests
└── .env.local             # Environment variables
```

## Environment Variables

The following environment variables are required in `.env.local`:

```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key for public access
- `REACT_APP_SIGNER_PRIVATE_KEY`: Your signer private key with 0x prefix

## Supabase Schema

The game uses a `flips` table with the following structure:

```sql
Table: flips
- id (uuid, auto-generated)
- created_at (timestamptz, default: now())
- player_address (text, nullable)
- result (text) - 'win' or 'bust'
- initial_stake (numeric, default: 1)
- stake (numeric) - final amount
- num_flips (integer) - number of flips in the game
- flip_history (text) - sequence of flips (H for heads, T for tails)
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Create `.env.local` with your Supabase credentials
4. Start the development server:
   ```bash
   npm start
   ```

## Running Tests

```bash
cd frontend/tests
npm install
node gameIntegration.test.js
```

## Development Notes

- The game uses React's `useCallback` for performance optimization
- Game state is managed locally using React hooks
- Results are saved to Supabase on game over or cash out
- The UI updates in real-time as players flip or cash out
- Error handling is implemented for both game logic and database operations
